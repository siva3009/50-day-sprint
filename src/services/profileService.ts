import { supabase } from "../lib/supabaseClient"
import type { Database } from "../types/database"
import type { UserProfile } from "../types/settings"

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"]
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&auto=format"

/**
 * Maps a Supabase profiles database record into the application's UserProfile domain model.
 */
export function mapProfileRowToUserProfile(
  row: ProfileRow,
  fallbackEmail?: string,
): UserProfile {
  return {
    name: row.full_name || "New Member",
    email: row.email || fallbackEmail || "",
    college: row.college || "",
    role: row.target_role || "Engineering Student",
    github: row.github_url || "",
    linkedin: row.linkedin_url || "",
    avatar: row.avatar_url || DEFAULT_AVATAR,
  }
}

/**
 * Maps partial UserProfile changes into the Supabase profiles update payload.
 */
export function mapUserProfileToRowUpdate(
  profile: Partial<UserProfile>,
): ProfileUpdate {
  const update: ProfileUpdate = {}
  if (profile.name !== undefined) update.full_name = profile.name
  if (profile.college !== undefined) update.college = profile.college
  if (profile.role !== undefined) update.target_role = profile.role
  if (profile.github !== undefined) update.github_url = profile.github
  if (profile.linkedin !== undefined) update.linkedin_url = profile.linkedin
  if (profile.avatar !== undefined) update.avatar_url = profile.avatar
  return update
}

/**
 * Fetches the user profile from Supabase.
 */
export async function getProfileByUserId(
  userId: string,
  userEmail?: string,
): Promise<{ profile: UserProfile | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    if (error) {
      return { profile: null, error: new Error(error.message) }
    }

    if (!data) {
      // Trigger may not have created it yet or was created before trigger existed
      return { profile: null, error: null }
    }

    return { profile: mapProfileRowToUserProfile(data, userEmail), error: null }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    return { profile: null, error }
  }
}

/**
 * Ensures a profile row exists for the user (safety fallback if database trigger was not applied).
 */
export async function upsertUserProfile(
  userId: string,
  email: string,
  fullName: string,
): Promise<{ profile: UserProfile | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          email,
          full_name: fullName,
          avatar_url: DEFAULT_AVATAR,
        },
        { onConflict: "id" },
      )
      .select("*")
      .single()

    if (error) {
      return { profile: null, error: new Error(error.message) }
    }

    return { profile: mapProfileRowToUserProfile(data, email), error: null }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    return { profile: null, error }
  }
}

/**
 * Updates the user's profile in the Supabase `profiles` table.
 */
export async function updateProfileByUserId(
  userId: string,
  updates: Partial<UserProfile>,
): Promise<{ profile: UserProfile | null; error: Error | null }> {
  try {
    const payload = mapUserProfileToRowUpdate(updates)
    const { data, error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", userId)
      .select("*")
      .single()

    if (error) {
      return { profile: null, error: new Error(error.message) }
    }

    return { profile: mapProfileRowToUserProfile(data), error: null }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    return { profile: null, error }
  }
}
