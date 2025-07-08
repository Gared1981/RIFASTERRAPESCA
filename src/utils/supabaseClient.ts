import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Log environment variables availability (not values)
console.log('Supabase URL available:', !!import.meta.env.VITE_SUPABASE_URL);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is not defined in .env');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is not defined in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true, 
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  }
});

// Check authentication status on initialization
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Error checking auth session:', error);
  } else {
    console.log('Auth session initialized, user logged in:', !!data.session);
  }
});

// Log authentication status on initialization
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Error checking initial session:', error);
  } else {
    console.log('Initial session check:', !!data.session);
  }
});

export type User = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  state: string;
  created_at?: string;
};

export type Ticket = {
  id: number;
  number: number;
  status: 'available' | 'reserved' | 'purchased';
  user_id?: string;
  raffle_id: number;
  reserved_at?: string;
  purchased_at?: string;
  created_at?: string;
};

export type Raffle = {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  price: number;
  draw_date: string;
  active: boolean;
  created_at?: string;
};

// Type for Supabase database schema
export type Database = {
  public: {
    Tables: {
      raffles: {
        Row: Raffle;
        Insert: Omit<Raffle, 'id' | 'created_at'>;
        Update: Partial<Omit<Raffle, 'id' | 'created_at'>>;
      };
      tickets: {
        Row: Ticket;
        Insert: Omit<Ticket, 'id' | 'created_at'>;
        Update: Partial<Omit<Ticket, 'id' | 'created_at'>>;
      };
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
    };
  };
};