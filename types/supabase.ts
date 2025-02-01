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
      checklist_items: {
        Row: {
          id: string
          user_id: string
          content: string
          is_completed: boolean
          due_type: 'two_weeks' | 'day_before' | 'custom'
          visibility: 'public' | 'family' | 'private'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          is_completed?: boolean
          due_type: 'two_weeks' | 'day_before' | 'custom'
          visibility?: 'public' | 'family' | 'private'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          is_completed?: boolean
          due_type?: 'two_weeks' | 'day_before' | 'custom'
          visibility?: 'public' | 'family' | 'private'
          created_at?: string
        }
      }
    }
  }
}