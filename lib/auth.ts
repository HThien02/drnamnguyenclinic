import { supabase } from './supabase'

export interface AdminUser {
  id: string
  email: string
  role: string
}

/**
 * Admin authentication using Supabase Auth
 * For production, this uses proper JWT tokens from Supabase
 * For development without Supabase, falls back to code-based auth
 */

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) {
    // Fallback for development without Supabase
    if (email === 'admin@drnamnguyenclinic.com' && password === 'DRNAM2026') {
      return {
        success: true,
        user: { id: 'admin-fallback', email, role: 'admin' },
        session: { access_token: 'fallback-token' },
      }
    }
    return { success: false, error: 'Invalid credentials' }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Check if user is admin
    const { data: profile } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (!profile) {
      await supabase.auth.signOut()
      return { success: false, error: 'Not authorized as admin' }
    }

    return {
      success: true,
      user: { id: data.user.id, email: data.user.email!, role: profile.role },
      session: data.session,
    }
  } catch (error: any) {
    console.error('Auth error:', error)
    return { success: false, error: error.message || 'Authentication failed' }
  }
}

export async function signOut() {
  if (!supabase) {
    return { success: true }
  }

  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error('Sign out error:', error)
    return { success: false, error: error.message }
  }
}

export async function getSession() {
  if (!supabase) {
    // Check for fallback session in localStorage
    if (typeof window !== 'undefined') {
      const fallbackSession = localStorage.getItem('admin-fallback-session')
      if (fallbackSession) {
        return {
          user: { id: 'admin-fallback', email: 'admin@drnamnguyenclinic.com', role: 'admin' },
        }
      }
    }
    return null
  }

  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error

    if (!session) return null

    // Verify user is admin
    const { data: profile } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('email', session.user.email!)
      .single()

    if (!profile) return null

    return {
      user: { id: session.user.id, email: session.user.email!, role: profile.role },
      session,
    }
  } catch (error) {
    console.error('Get session error:', error)
    return null
  }
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  if (!supabase) {
    // Fallback: accept the hardcoded demo token
    return token === 'DRNAM2026' || token === 'fallback-token'
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error) throw error

    if (!user) return false

    // Check if user is admin
    const { data: profile } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('email', user.email!)
      .single()

    return !!profile
  } catch (error) {
    console.error('Verify token error:', error)
    return false
  }
}
