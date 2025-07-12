import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Log environment variables availability (not values)
console.log('Supabase URL available:', !!import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Anon Key available:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is not defined in environment variables');
  throw new Error('VITE_SUPABASE_URL is not defined in .env');
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not defined in environment variables');
  throw new Error('VITE_SUPABASE_ANON_KEY is not defined in .env');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true, 
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: false
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
      'X-Client-Version': '2.39.7'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Check authentication status on initialization
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Error checking auth session:', error);
  } else {
    console.log('✅ Auth session initialized, user logged in:', !!data.session);
    if (data.session) {
      console.log('👤 User ID:', data.session.user.id);
      console.log('📧 User email:', data.session.user.email);
    }
  }
});

// Test database connection
supabase.from('raffles').select('count', { count: 'exact', head: true }).then(({ error, count }) => {
  if (error) {
    console.error('❌ Database connection test failed:', error);
  } else {
    console.log('✅ Database connection successful, raffles count:', count);
  }
}).catch(err => {
  console.error('❌ Database connection error:', err);
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
  number: string; // Changed to string to support 4-digit format with leading zeros
  status: 'available' | 'reserved' | 'purchased';
  user_id?: string;
  raffle_id: number;
  reserved_at?: string;
  purchased_at?: string;
  created_at?: string;
  promoter_code?: string;
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