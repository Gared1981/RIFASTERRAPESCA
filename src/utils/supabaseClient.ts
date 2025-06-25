import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

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
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
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