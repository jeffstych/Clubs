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

