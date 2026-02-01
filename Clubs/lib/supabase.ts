// Supabase Configuration
// Add your Supabase credentials to .env file:
// EXPO_PUBLIC_SUPABASE_URL=your-project-url
// EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Example: Fetch clubs
export async function getClubs() {
    const { data, error } = await supabase.from('clubs').select('club_id, club_name, club_description, club_tags, club_category, club_image');
    if (error) console.error('Error:', error);
    return data;
}

// Example: Fetch events
export async function getEvents() {
    const { data, error } = await supabase.from('events').select('*');
    if (error) console.error('Error:', error);
    return data;
}

// Add more functions as needed
// Connecting clubs to fyp
// User's page showcase current user tags
// User club following
// 1. API for Explore Tab - Get clubs with matching user preference tags
export async function getRecommendedClubs(userId: string) {
  try {
    // First get user's preference tags
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('preference_tags')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return { data: null, error: profileError };
    }

    if (!profile?.preference_tags || profile.preference_tags.length === 0) {
      // Return all clubs if user has no preferences
      const { data: allClubs, error: clubsError } = await supabase
        .from('clubs')
        .select('club_id, club_name, club_description, club_tags, club_category, club_image');
      return { data: allClubs, error: clubsError };
    }

    // Get clubs whose tags overlap with user preference tags
    const { data: clubs, error: clubsError } = await supabase
      .from('clubs')
      .select('club_id, club_name, club_description, club_tags, club_category, club_image')
      .overlaps('club_tags', profile.preference_tags);

    return { data: clubs, error: clubsError };
  } catch (error) {
    console.error('Error getting recommended clubs:', error);
    return { data: null, error };
  }
}

// 2. API for User Profile Page - Get user's preference tags
export async function getUserPreferenceTags(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('preference_tags, took_quiz')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user preference tags:', error);
      return { data: null, error };
    }

    return { 
      data: {
        preferenceTags: data?.preference_tags || [],
        tookQuiz: data?.took_quiz || false
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error getting user preference tags:', error);
    return { data: null, error };
  }
}

// 3a. API for My Clubs Tab - Get clubs that user follows
export async function getFollowedClubs(userId: string) {
  try {
    const { data, error } = await supabase
      .from('club_followings')
      .select(`
        created_at,
        clubs (
          club_id,
          club_name,
          club_description,
          club_tags,
          club_category,
          club_image
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching followed clubs:', error);
      return { data: null, error };
    }

    // Transform the data to return just the clubs with follow date
    const followedClubs = data?.map((item: any) => ({
      ...item.clubs,
      followedAt: item.created_at
    })) || [];

    return { data: followedClubs, error: null };
  } catch (error) {
    console.error('Error getting followed clubs:', error);
    return { data: null, error };
  }
}

// 3b. API for Following Logic - Follow a club
export async function followClub(userId: string, clubId: string) {
  try {
    const { data, error } = await supabase
      .from('club_followings')
      .insert({
        user_id: userId,
        club_id: clubId
      })
      .select();

    if (error) {
      console.error('Error following club:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error following club:', error);
    return { data: null, error };
  }
}

// 3c. API for Following Logic - Unfollow a club
export async function unfollowClub(userId: string, clubId: string) {
  try {
    const { data, error } = await supabase
      .from('club_followings')
      .delete()
      .eq('user_id', userId)
      .eq('club_id', clubId);

    if (error) {
      console.error('Error unfollowing club:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error unfollowing club:', error);
    return { data: null, error };
  }
}

// 3d. API for Following Logic - Check if user follows a club
export async function isFollowingClub(userId: string, clubId: string) {
  try {
    const { data, error } = await supabase
      .from('club_followings')
      .select('user_id')
      .eq('user_id', userId)
      .eq('club_id', clubId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected when not following
      console.error('Error checking follow status:', error);
      return { data: false, error };
    }

    return { data: !!data, error: null };
  } catch (error) {
    console.error('Error checking follow status:', error);
    return { data: false, error };
  }
}

// ===================
// AUTH APIs
// ===================

// Get current user
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error);
      return { user: null, error };
    }
    return { user, error: null };
  } catch (error) {
    console.error('Error getting current user:', error);
    return { user: null, error };
  }
}

// Sign up
export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (error) {
    console.error('Error signing up:', error);
    return { data: null, error };
  }
}

// Sign in
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (error) {
    console.error('Error signing in:', error);
    return { data: null, error };
  }
}

// Sign out
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      return { error };
    }
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
}

// ===================
// CLUB MANAGEMENT APIs
// ===================

// Get club by ID
export async function getClubById(clubId: string) {
  try {
    const { data, error } = await supabase
      .from('clubs')
      .select('club_id, club_name, club_description, club_tags, club_category, club_image')
      .eq('club_id', clubId)
      .single();
    
    if (error) {
      console.error('Error fetching club:', error);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (error) {
    console.error('Error getting club:', error);
    return { data: null, error };
  }
}

// Get club by name
export async function getClubByName(clubName: string) {
  try {
    const { data, error } = await supabase
      .from('clubs')
      .select('club_id, club_name, club_description, club_tags, club_category, club_image')
      .eq('club_name', clubName)
      .single();
    
    if (error) {
      console.error('Error fetching club by name:', error);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (error) {
    console.error('Error getting club by name:', error);
    return { data: null, error };
  }
}

// Search clubs by name or description
export async function searchClubs(searchTerm: string) {
  try {
    const { data, error } = await supabase
      .from('clubs')
      .select('club_id, club_name, club_description, club_tags, club_category, club_image')
      .or(`club_name.ilike.%${searchTerm}%,club_description.ilike.%${searchTerm}%`);
    
    if (error) {
      console.error('Error searching clubs:', error);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (error) {
    console.error('Error searching clubs:', error);
    return { data: null, error };
  }
}

// Get clubs by category
export async function getClubsByCategory(category: string) {
  try {
    const { data, error } = await supabase
      .from('clubs')
      .select('club_id, club_name, club_description, club_tags, club_category, club_image')
      .eq('club_category', category);
    
    if (error) {
      console.error('Error fetching clubs by category:', error);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (error) {
    console.error('Error getting clubs by category:', error);
    return { data: null, error };
  }
}

// Create a new club
export async function createClub(clubData: {
  club_name: string;
  club_description: string;
  club_tags: string[];
  club_category: string;
  club_image?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('clubs')
      .insert([clubData])
      .select('club_id, club_name, club_description, club_tags, club_category, club_image')
      .single();
    
    if (error) {
      console.error('Error creating club:', error);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (error) {
    console.error('Error creating club:', error);
    return { data: null, error };
  }
}

// ===================
// EVENTS APIs
// ===================

// Get events by club ID
export async function getEventsByClub(clubId: string) {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('event_id, event_title, event_description, event_date, event_time, location, club_id')
      .eq('club_id', clubId)
      .order('event_date', { ascending: true });
    
    if (error) {
      console.error('Error fetching events for club:', error);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (error) {
    console.error('Error getting events by club:', error);
    return { data: null, error };
  }
}

// Get upcoming events
export async function getUpcomingEvents() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('events')
      .select(`
        event_id,
        event_title,
        event_description,
        event_date,
        event_time,
        location,
        clubs (
          club_name,
          club_image
        )
      `)
      .gte('event_date', today)
      .order('event_date', { ascending: true });
    
    if (error) {
      console.error('Error fetching upcoming events:', error);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (error) {
    console.error('Error getting upcoming events:', error);
    return { data: null, error };
  }
}

// Get events for followed clubs
export async function getFollowedClubEvents(userId: string) {
  try {
    const { data, error } = await supabase
      .from('club_followings')
      .select(`
        clubs!inner (
          club_name,
          club_image,
          events (
            event_id,
            event_title,
            event_description,
            event_date,
            event_time,
            location
          )
        )
      `)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching followed club events:', error);
      return { data: null, error };
    }
    
    // Flatten the events array and add club info
    const events = data?.flatMap((item: any) => {
      const club = item.clubs;
      return club.events?.map((event: any) => ({
        ...event,
        club_name: club.club_name,
        club_image: club.club_image
      })) || [];
    }) || [];
    
    return { data: events, error: null };
  } catch (error) {
    console.error('Error getting followed club events:', error);
    return { data: null, error };
  }
}

// Create a new event
export async function createEvent(eventData: {
  event_title: string;
  event_description: string;
  event_date: string;
  event_time: string;
  location: string;
  club_id: string;
}) {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select('event_id, event_title, event_description, event_date, event_time, location, club_id')
      .single();
    
    if (error) {
      console.error('Error creating event:', error);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (error) {
    console.error('Error creating event:', error);
    return { data: null, error };
  }
}

// ===================
// QUIZ APIs
// ===================

// Get all quiz questions with options
export async function getQuizQuestions() {
  try {
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('question_id, question_text')
      .order('created_at', { ascending: true });

    if (questionsError) {
      console.error('Error fetching quiz questions:', questionsError);
      return { data: null, error: questionsError };
    }

    const { data: options, error: optionsError } = await supabase
      .from('quiz_question_options')
      .select('option_id, question_id, option_text, tags');

    if (optionsError) {
      console.error('Error fetching quiz options:', optionsError);
      return { data: null, error: optionsError };
    }

    // Group options by question
    const questionsWithOptions = questions?.map((q) => ({
      ...q,
      options: options?.filter((o) => o.question_id === q.question_id) || [],
    })) || [];

    return { data: questionsWithOptions, error: null };
  } catch (error) {
    console.error('Error getting quiz questions:', error);
    return { data: null, error };
  }
}

// Submit quiz responses
export async function submitQuizResponses(userId: string, responses: { questionId: string; optionId: string }[]) {
  try {
    const quizResponses = responses.map(response => ({
      user_id: userId,
      question_id: response.questionId,
      option_id: response.optionId
    }));
    
    const { data, error } = await supabase
      .from('quiz_responses')
      .insert(quizResponses)
      .select();
    
    if (error) {
      console.error('Error submitting quiz responses:', error);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (error) {
    console.error('Error submitting quiz responses:', error);
    return { data: null, error };
  }
}

// ===================
// PROFILE APIs
// ===================

// Create user profile
export async function createUserProfile(userId: string, preferenceTags: string[] = []) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        user_id: userId,
        preference_tags: preferenceTags,
        took_quiz: false
      }])
      .select('user_id, preference_tags, took_quiz')
      .single();
    
    if (error) {
      console.error('Error creating user profile:', error);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { data: null, error };
  }
}

// Update user profile preferences
export async function updateUserPreferences(userId: string, preferenceTags: string[]) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ preference_tags: preferenceTags })
      .eq('user_id', userId)
      .select('user_id, preference_tags, took_quiz')
      .single();
    
    if (error) {
      console.error('Error updating user preferences:', error);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return { data: null, error };
  }
}

// Mark quiz as completed and update preference tags
export async function completeQuiz(userId: string, preferenceTags: string[]) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        took_quiz: true, 
        preference_tags: preferenceTags 
      })
      .eq('user_id', userId)
      .select('user_id, preference_tags, took_quiz')
      .single();
    
    if (error) {
      console.error('Error completing quiz:', error);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (error) {
    console.error('Error completing quiz:', error);
    return { data: null, error };
  }
}

// ===================
// USER EVENTS APIs
// ===================

// Get soonest event for a club
export async function getSoonestEventForClub(clubId: string) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('events')
      .select('event_id, event_title, event_description, event_date, event_time, location')
      .eq('club_id', clubId)
      .gte('event_date', today)
      .order('event_date', { ascending: true })
      .order('event_time', { ascending: true })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which means no upcoming events
      console.error('Error fetching soonest event:', error);
      return { data: null, error };
    }
    
    return { data: error?.code === 'PGRST116' ? null : data, error: null };
  } catch (error) {
    console.error('Error getting soonest event:', error);
    return { data: null, error };
  }
}

// Sign up user for an event
export async function signUpForEvent(userId: string, eventId: string) {
  try {
    const { data, error } = await supabase
      .from('user_events')
      .insert({
        user_id: userId,
        event_id: eventId
      })
      .select();
    
    if (error) {
      console.error('Error signing up for event:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error signing up for event:', error);
    return { data: null, error };
  }
}

// Remove user from an event
export async function removeFromEvent(userId: string, eventId: string) {
  try {
    const { data, error } = await supabase
      .from('user_events')
      .delete()
      .eq('user_id', userId)
      .eq('event_id', eventId);
    
    if (error) {
      console.error('Error removing from event:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error removing from event:', error);
    return { data: null, error };
  }
}

// Check if user is signed up for an event
export async function isSignedUpForEvent(userId: string, eventId: string) {
  try {
    const { data, error } = await supabase
      .from('user_events')
      .select('user_id')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking event signup status:', error);
      return { data: false, error };
    }
    
    return { data: !!data, error: null };
  } catch (error) {
    console.error('Error checking event signup status:', error);
    return { data: false, error };
  }
}

// Get all events user is signed up for
export async function getUserSignedUpEvents(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_events')
      .select(`
        created_at,
        events (
          event_id,
          event_title,
          event_description,
          event_date,
          event_time,
          location,
          clubs (
            club_name,
            club_image
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user events:', error);
      return { data: null, error };
    }
    
    // Transform the data
    const userEvents = data?.map((item: any) => ({
      ...item.events,
      signedUpAt: item.created_at,
      club_name: item.events.clubs.club_name,
      club_image: item.events.clubs.club_image
    })) || [];
    
    return { data: userEvents, error: null };
  } catch (error) {
    console.error('Error getting user signed up events:', error);
    return { data: null, error };
  }
}

// ===================
// TAGS APIs
// ===================

// Get all available tags from the tags table
export async function getAllTags() {
  try {
    // Get tags from the dedicated tags table using correct column name
    const { data: tagsData, error: tagsError } = await supabase
      .from('tags')
      .select('tag')
      .order('tag', { ascending: true });
    
    if (tagsError) {
      console.error('Error fetching tags:', tagsError);
    }
    
    if (tagsData && tagsData.length > 0) {
      // Convert to array of strings
      const tags = tagsData
        .map(item => item.tag)
        .filter(tag => tag && typeof tag === 'string' && tag.trim().length > 0) // Filter out null/empty
        .map(tag => tag.trim()) // Trim whitespace
        .filter((tag, index, array) => array.indexOf(tag) === index); // Remove duplicates
      
      console.log('Found tags from tags table:', tags.length, 'tags');
      return { data: tags, error: null };
    }

    // Fallback: Extract unique tags from club_tags if tags table is empty or doesn't exist
    console.log('Tags table not found or empty, extracting from clubs...');
    const { data: clubsData, error: clubsError } = await supabase
      .from('clubs')
      .select('club_tags');
    
    if (clubsError) {
      console.error('Error fetching clubs for tags:', clubsError);
      // Return common tags as final fallback
      return { 
        data: ['Academic', 'Sports', 'Technology', 'Arts', 'Music', 'Gaming', 'Volunteering', 'Social', 'Engineering', 'Creative', 'Leadership', 'Fitness', 'Outdoor', 'Business', 'Science'], 
        error: null 
      };
    }

    // Extract and flatten all unique tags from clubs
    const allTags = new Set<string>();
    clubsData?.forEach(club => {
      if (club.club_tags && Array.isArray(club.club_tags)) {
        club.club_tags.forEach(tag => {
          if (typeof tag === 'string' && tag.trim()) {
            allTags.add(tag.trim());
          }
        });
      }
    });

    let uniqueTags = Array.from(allTags).sort();
    
    // If still no tags found, add some common ones
    if (uniqueTags.length === 0) {
      uniqueTags = ['Academic', 'Sports', 'Technology', 'Arts', 'Music', 'Gaming', 'Volunteering', 'Social', 'Engineering', 'Creative', 'Leadership', 'Fitness', 'Outdoor', 'Business', 'Science'];
    }
    
    console.log('Extracted tags from clubs:', uniqueTags.length, 'tags');
    return { data: uniqueTags, error: null };
    
  } catch (error) {
    console.error('Error getting all tags:', error);
    // Return fallback tags even on error
    return { 
      data: ['Academic', 'Sports', 'Technology', 'Arts', 'Music', 'Gaming', 'Volunteering', 'Social', 'Engineering', 'Creative', 'Leadership', 'Fitness', 'Outdoor', 'Business', 'Science'], 
      error: null 
    };
  }
}

