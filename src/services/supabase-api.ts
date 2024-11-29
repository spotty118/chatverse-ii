import { createClient } from '@supabase/supabase-js'
import { API_CONFIG } from '../config/api'

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
)

// Authentication
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// AI Model Endpoints
export async function chatWithGPT(messages: any[]) {
  const { data: session } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const response = await fetch(`${API_CONFIG.baseUrl}/proxy/chatgpt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.session?.access_token}`,
    },
    body: JSON.stringify({ messages }),
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export async function chatWithAnthropic(messages: any[]) {
  const { data: session } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const response = await fetch(`${API_CONFIG.baseUrl}/proxy/anthropic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.session?.access_token}`,
    },
    body: JSON.stringify({ messages }),
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export async function chatWithGemini(messages: any[]) {
  const { data: session } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const response = await fetch(`${API_CONFIG.baseUrl}/proxy/google/gemini`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.session?.access_token}`,
    },
    body: JSON.stringify({ messages }),
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

// License Management
export async function activateLicense(key: string, instanceName: string) {
  const { data: session } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const response = await fetch(`${API_CONFIG.baseUrl}/license/activate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.session?.access_token}`,
    },
    body: JSON.stringify({ key, instanceName }),
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export async function getLicenseStatus() {
  const { data: session } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const response = await fetch(`${API_CONFIG.baseUrl}/license/status`, {
    headers: {
      'Authorization': `Bearer ${session.session?.access_token}`,
    },
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export async function getPremiumStatus() {
  const { data: session } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const response = await fetch(`${API_CONFIG.baseUrl}/license/premium/status`, {
    headers: {
      'Authorization': `Bearer ${session.session?.access_token}`,
    },
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}
