import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface ChatSession {
  id?: string
  session_id: string
  user1_id: string
  user2_id: string
  user1_country: string | null
  user2_country: string | null
  started_at: string
  ended_at?: string | null
  duration_seconds?: number | null
}

export interface ChatMessage {
  id?: string
  session_id: string
  sender_id: string
  message_text: string
  sent_at: string
  has_image: boolean
  image_url?: string | null
}

export interface UserConnection {
  id?: string
  socket_id: string
  country: string | null
  ip_address: string
  connected_at: string
  disconnected_at?: string | null
}
