import { supabase } from './supabase'

export interface AdminUser {
  id: string
  email: string
  role: string
}

/** Admin authentication using Supabase Auth and the admin_profiles allow-list. */
export async function signInWithEmail(email: string, password: string) {
  if (!supabase) return { success: false, error: 'Authentication is not configured.' }

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
  if (!supabase) return null

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
  if (!supabase || !token) return false

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
