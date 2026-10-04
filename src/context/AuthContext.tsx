import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import type { Session, User } from "@supabase/supabase-js"
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient"
import {
  getProfileByUserId,
  updateProfileByUserId,
  upsertUserProfile,
} from "../services/profileService"
import type { UserProfile } from "../types/settings"

export interface SignUpResult {
  user: User | null
  session: Session | null
  needsEmailConfirmation: boolean
  error: Error | null
}

export interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  isConfigured: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<SignUpResult>
  signOut: () => Promise<{ error: Error | null }>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updateProfile: (
    updates: Partial<UserProfile>,
  ) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const isConfigured = isSupabaseConfigured()

  const loadUserProfile = useCallback(async (activeUser: User) => {
    const { profile: existingProfile, error } = await getProfileByUserId(
      activeUser.id,
      activeUser.email,
    )

    if (error) {
      console.error("[Auth] Error fetching user profile:", error)
    }

    if (existingProfile) {
      setProfile(existingProfile)
    } else {
      // If the trigger hasn't populated yet, create a base profile
      const fullName =
        activeUser.user_metadata?.full_name ||
        activeUser.user_metadata?.name ||
        "New Member"
      const { profile: createdProfile } = await upsertUserProfile(
        activeUser.id,
        activeUser.email || "",
        fullName,
      )
      if (createdProfile) {
        setProfile(createdProfile)
      }
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadUserProfile(user)
    }
  }, [user, loadUserProfile])

  // Initialize session and attach onAuthStateChange listener
  useEffect(() => {
    if (!isConfigured) {
      setLoading(false)
      return
    }

    let isMounted = true

    async function initializeAuth() {
      try {
        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.warn("[Auth] Failed to restore session:", error.message)
        }

        if (isMounted) {
          setSession(initialSession)
          setUser(initialSession?.user ?? null)
          if (initialSession?.user) {
            await loadUserProfile(initialSession.user)
          }
        }
      } catch (err) {
        console.error("[Auth] Unexpected error checking session:", err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return

      setSession(newSession)
      setUser(newSession?.user ?? null)

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        if (newSession?.user) {
          await loadUserProfile(newSession.user)
        }
      } else if (event === "SIGNED_OUT") {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [isConfigured, loadUserProfile])

  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ error: Error | null }> => {
    if (!isConfigured) {
      return {
        error: new Error(
          "Supabase is not configured. Please add your credentials to .env.local",
        ),
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: new Error(error.message) }
      }

      if (data.user) {
        setUser(data.user)
        setSession(data.session)
        await loadUserProfile(data.user)
      }

      return { error: null }
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error(String(err)),
      }
    }
  }

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
  ): Promise<SignUpResult> => {
    if (!isConfigured) {
      return {
        user: null,
        session: null,
        needsEmailConfirmation: false,
        error: new Error(
          "Supabase is not configured. Please add your credentials to .env.local",
        ),
      }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        return {
          user: null,
          session: null,
          needsEmailConfirmation: false,
          error: new Error(error.message),
        }
      }

      // Case A: session is returned immediately (email confirmation disabled)
      if (data.session && data.user) {
        setUser(data.user)
        setSession(data.session)
        await loadUserProfile(data.user)
        return {
          user: data.user,
          session: data.session,
          needsEmailConfirmation: false,
          error: null,
        }
      }

      // Case B: email confirmation is enabled (user created, but no active session yet)
      return {
        user: data.user,
        session: null,
        needsEmailConfirmation: true,
        error: null,
      }
    } catch (err) {
      return {
        user: null,
        session: null,
        needsEmailConfirmation: false,
        error: err instanceof Error ? err : new Error(String(err)),
      }
    }
  }

  const signOut = async (): Promise<{ error: Error | null }> => {
    if (!isConfigured) {
      setUser(null)
      setSession(null)
      setProfile(null)
      return { error: null }
    }

    try {
      const { error } = await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setProfile(null)
      if (error) {
        return { error: new Error(error.message) }
      }
      return { error: null }
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error(String(err)),
      }
    }
  }

  const resetPassword = async (
    email: string,
  ): Promise<{ error: Error | null }> => {
    if (!isConfigured) {
      return {
        error: new Error(
          "Supabase is not configured. Please add your credentials to .env.local",
        ),
      }
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      })
      if (error) {
        return { error: new Error(error.message) }
      }
      return { error: null }
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error(String(err)),
      }
    }
  }

  const updateProfile = async (
    updates: Partial<UserProfile>,
  ): Promise<{ error: Error | null }> => {
    if (!user) {
      return { error: new Error("No authenticated user found") }
    }

    try {
      const { profile: updatedProfile, error } = await updateProfileByUserId(
        user.id,
        updates,
      )
      if (error) {
        return { error }
      }
      if (updatedProfile) {
        setProfile(updatedProfile)
      }
      return { error: null }
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error(String(err)),
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
