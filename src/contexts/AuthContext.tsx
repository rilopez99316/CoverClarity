import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOutLoading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [signOutLoading, setSignOutLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Get initial session and user
    const initializeAuth = async () => {
      try {
        setLoading(true)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          console.error('Session error:', sessionError)
          setSession(null)
          setUser(null)
          setLoading(false)
          return
        }
        
        if (session) {
          // Verify user with JWT token
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          if (userError) {
            console.error('User verification error:', userError)
            await supabase.auth.signOut()
            setSession(null)
            setUser(null)
          } else {
            setSession(session)
            setUser(user)
          }
        } else {
          setSession(null)
          setUser(null)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setSession(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email)
      
      setLoading(true)
      try {
        if (session?.user) {
          // Verify user with current JWT token
          const { data: { user }, error } = await supabase.auth.getUser()
          if (error) {
            console.error('User verification failed:', error)
            await supabase.auth.signOut()
            setSession(null)
            setUser(null)
          } else {
            setSession(session)
            setUser(user)
          }
        } else {
          setSession(null)
          setUser(null)
        }
      } catch (error) {
        console.error('Auth state change error:', error)
        setSession(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const refreshUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('Failed to refresh user:', error)
        await supabase.auth.signOut()
        setUser(null)
        setSession(null)
      } else {
        setUser(user)
      }
    } catch (error) {
      console.error('Refresh user error:', error)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (!error && data.user) {
        // Use the create_user_profile function to handle profile creation and settings
        const { error: profileError } = await supabase.rpc('create_user_profile', {
          p_user_id: data.user.id,
          user_email: data.user.email!,
          user_full_name: fullName
        })
        
        if (profileError) {
          console.error('Profile creation error:', profileError)
        }
      }

      return { error }
    } catch (error) {
      console.error('Sign up error:', error)
      return { error: error as AuthError }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (!error && data.user) {
        // Verify the user exists in profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
          
        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          await supabase.from('profiles').insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || '',
          })
        }
      }
      
      return { error }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: error as AuthError }
    }
  }

  const signOut = async () => {
    try {
      setSignOutLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear local state
      setUser(null)
      setSession(null)
      
      // Smoothly navigate to home
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Sign out error:', error)
      // Even if there's an error, still try to clear local state
      setUser(null)
      setSession(null)
      navigate('/', { replace: true })
    } finally {
      setSignOutLoading(false)
    }
  }

  const value = {
    user,
    session,
    loading,
    signOutLoading,
    signUp,
    signIn,
    signOut,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}