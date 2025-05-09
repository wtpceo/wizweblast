export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          contract_start: string
          contract_end: string
          status_tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contract_start: string
          contract_end: string
          status_tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contract_start?: string
          contract_end?: string
          status_tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      client_todos: {
        Row: {
          id: string
          client_id: string
          content: string
          assigned_to: string | null
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          content: string
          assigned_to?: string | null
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          content?: string
          assigned_to?: string | null
          completed?: boolean
          created_at?: string
        }
      }
      client_notes: {
        Row: {
          id: string
          client_id: string
          note: string
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          note: string
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          note?: string
          created_at?: string
        }
      }
      notices: {
        Row: {
          id: string
          title: string
          content: string
          is_fixed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          is_fixed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          is_fixed?: boolean
          created_at?: string
        }
      }
      client_activities: {
        Row: {
          id: string
          client_id: string
          user_id: string
          activity_type: string
          department: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          user_id: string
          activity_type: string
          department?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          user_id?: string
          activity_type?: string
          department?: string | null
          created_at?: string
        }
      }
      client_external_data: {
        Row: {
          id: string
          client_id: string
          platform: string
          source_url: string
          scraped_data: Json
          scraped_at: string
        }
        Insert: {
          id?: string
          client_id: string
          platform: string
          source_url: string
          scraped_data: Json
          scraped_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          platform?: string
          source_url?: string
          scraped_data?: Json
          scraped_at?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: string
          department: string | null
          is_approved: boolean
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role?: string
          department?: string | null
          is_approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: string
          department?: string | null
          is_approved?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 