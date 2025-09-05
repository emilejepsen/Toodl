import { createBrowserClient, createServerClient } from '@supabase/ssr'

// Database Types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      children: {
        Row: {
          id: string
          parent_id: string
          name: string
          age: number
          interests: string[]
          avatar_url: string | null
          voice_settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          name: string
          age: number
          interests?: string[]
          avatar_url?: string | null
          voice_settings?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          name?: string
          age?: number
          interests?: string[]
          avatar_url?: string | null
          voice_settings?: any
          created_at?: string
          updated_at?: string
        }
      }
      stories: {
        Row: {
          id: string
          child_id: string
          title: string
          content: string | null
          audio_url: string | null
          image_urls: string[]
          status: 'draft' | 'completed' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          child_id: string
          title: string
          content?: string | null
          audio_url?: string | null
          image_urls?: string[]
          status?: 'draft' | 'completed' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          title?: string
          content?: string | null
          audio_url?: string | null
          image_urls?: string[]
          status?: 'draft' | 'completed' | 'archived'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Client-side Supabase client
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !anonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
  }

  return createBrowserClient<Database>(url, anonKey);
}

// Server-side Supabase client
export async function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !anonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
  }

  const { cookies } = await import('next/headers')
  const cookieStore = cookies()

  return createServerClient<Database>(
    url,
    anonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}