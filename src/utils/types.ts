export interface Database {
  public: {
    Tables: {
      raffles: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          image_url: string | null;
          video_url: string | null;
          images: string[] | null;
          video_urls: string[] | null;
          prize_items: string[] | null;
          price: number;
          draw_date: string;
          drawn_at: string | null;
          winner_id: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
          slug: string | null;
          total_tickets: number | null;
          status: string;
        };
        Insert: Omit<Database['public']['Tables']['raffles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['raffles']['Row'], 'id' | 'created_at'>>;
      };
      tickets: {
        Row: {
          id: number;
          number: number;
          status: 'available' | 'reserved' | 'purchased';
          user_id: string | null;
          raffle_id: number;
          reserved_at: string | null;
          purchased_at: string | null;
          created_at: string;
          promoter_code: string | null;
        };
        Insert: Omit<Database['public']['Tables']['tickets']['Row'], 'id' | 'created_at'>;
        Update: Partial<Omit<Database['public']['Tables']['tickets']['Row'], 'id' | 'created_at'>>;
      };
      users: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          phone: string;
          state: string;
          email: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>>;
      };
      promoters: {
        Row: {
          id: string;
          name: string;
          code: string;
          total_sales: number;
          accumulated_bonus: number;
          extra_prize: boolean;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['promoters']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['promoters']['Row'], 'id' | 'created_at'>>;
      };
      payment_logs: {
        Row: {
          id: number;
          preference_id: string | null;
          payment_id: string | null;
          external_reference: string | null;
          status: string | null;
          status_detail: string | null;
          amount: number | null;
          ticket_ids: number[] | null;
          metadata: any | null;
          webhook_data: any | null;
          created_at: string;
          updated_at: string;
          notification_sent: boolean;
        };
        Insert: Omit<Database['public']['Tables']['payment_logs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['payment_logs']['Row'], 'id' | 'created_at'>>;
      };
    };
    Views: {
      public_raffles: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          image_url: string | null;
          images: string[] | null;
          video_url: string | null;
          video_urls: string[] | null;
          prize_items: string[] | null;
          draw_date: string;
          slug: string | null;
          drawn_at: string | null;
          status: string;
          winner_id: string | null;
          price: number;
          max_tickets: number | null;
          winner_first_name: string | null;
          winner_last_name: string | null;
          participant_count: number | null;
          tickets_sold: number | null;
        };
      };
      promoter_stats: {
        Row: {
          id: string;
          name: string;
          code: string;
          total_sales: number;
          accumulated_bonus: number;
          extra_prize: boolean;
          active: boolean;
          tickets_sold: number | null;
          confirmed_sales: number | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
    Functions: {
      auto_cleanup_tickets: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      admin_cleanup_expired_tickets: {
        Args: Record<PropertyKey, never>;
        Returns: { released_count: number };
      };
      register_ticket_sale: {
        Args: {
          p_ticket_id: number;
          p_promoter_code: string;
        };
        Returns: { success: boolean; error?: string };
      };
      check_raffle_permissions: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      admin_update_raffle: {
        Args: {
          raffle_id: number;
          update_data: any;
        };
        Returns: { success: boolean; error?: string };
      };
    };
  };
}