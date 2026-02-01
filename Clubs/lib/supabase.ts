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
    const { data, error } = await supabase.from('clubs').select('*');
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
