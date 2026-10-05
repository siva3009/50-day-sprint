import { supabase } from "../lib/supabaseClient"
import { parseLocalDate } from "../utils/calculations"

export interface DailyCheckin {
  id: string
  userId: string
  sprintId: string
  checkinDate: string // YYYY-MM-DD
  studyHours: number
  problemsSolvedCount: number
  dsaCompleted: boolean
  leetcodeCompleted: boolean
  fullstackCompleted: boolean
  projectCompleted: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface CheckinInput {
  userId: string
  sprintId: string
  teamId?: string
  checkinDate?: string // defaults to local YYYY-MM-DD
  studyMinutes: number // converted to study_hours
  problemsSolved: number
  dsaCompleted?: boolean
  leetcodeCompleted?: boolean
  fullstackCompleted?: boolean
  projectCompleted?: boolean
  notes?: string
}

/**
 * Returns today's calendar date in local YYYY-MM-DD format (avoids UTC timezone shift).
 */
export function getLocalTodayDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Maps raw database row from public.daily_checkins to DailyCheckin model.
 */
function mapCheckinRow(row: any): DailyCheckin {
  return {
    id: row.id,
    userId: row.user_id,
    sprintId: row.sprint_id,
    checkinDate: row.checkin_date,
    studyHours: Number(row.study_hours) || 0,
    problemsSolvedCount: Number(row.problems_solved_count) || 0,
    dsaCompleted: Boolean(row.dsa_completed),
    leetcodeCompleted: Boolean(row.leetcode_completed),
    fullstackCompleted: Boolean(row.fullstack_completed),
    projectCompleted: Boolean(row.project_completed),
    notes: row.notes || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * Fetches all daily check-ins recorded by a specific user for an active sprint.
 * Respects RLS (auth.uid() = user_id).
 */
export async function fetchUserCheckins(
  userId: string,
  sprintId: string,
): Promise<{ checkins: DailyCheckin[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", userId)
      .eq("sprint_id", sprintId)
      .order("checkin_date", { ascending: true })

    if (error) {
      console.error("[dailyCheckinService] Error fetching user check-ins:", error)
      return { checkins: [], error: new Error(error.message) }
    }

    return { checkins: (data || []).map(mapCheckinRow), error: null }
  } catch (err) {
    return {
      checkins: [],
      error: err instanceof Error ? err : new Error(String(err)),
    }
  }
}

/**
 * Fetches the check-in record for a specific user, sprint, and date (defaults to today).
 */
export async function fetchTodayCheckin(
  userId: string,
  sprintId: string,
  dateStr?: string,
): Promise<{ checkin: DailyCheckin | null; error: Error | null }> {
  const targetDate = dateStr || getLocalTodayDateString()
  try {
    const { data, error } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", userId)
      .eq("sprint_id", sprintId)
      .eq("checkin_date", targetDate)
      .maybeSingle()

    if (error) {
      console.error("[dailyCheckinService] Error fetching today check-in:", error)
      return { checkin: null, error: new Error(error.message) }
    }

    return { checkin: data ? mapCheckinRow(data) : null, error: null }
  } catch (err) {
    return {
      checkin: null,
      error: err instanceof Error ? err : new Error(String(err)),
    }
  }
}

/**
 * Records or updates a daily check-in for the authenticated user.
 * Enforces one check-in per user per sprint day via database unique constraint (user_id, sprint_id, checkin_date).
 * If a record already exists for the day, upsert updates the metrics rather than duplicating.
 */
export async function submitDailyCheckin(
  input: CheckinInput,
): Promise<{ checkin: DailyCheckin | null; error: Error | null }> {
  const checkinDate = input.checkinDate || getLocalTodayDateString()
  const studyHours = Number((Math.max(0, input.studyMinutes) / 60).toFixed(2))
  const problemsSolved = Math.max(0, Math.round(input.problemsSolved))

  try {
    const payload = {
      user_id: input.userId,
      sprint_id: input.sprintId,
      checkin_date: checkinDate,
      study_hours: studyHours,
      problems_solved_count: problemsSolved,
      dsa_completed: Boolean(input.dsaCompleted),
      leetcode_completed: Boolean(input.leetcodeCompleted),
      fullstack_completed: Boolean(input.fullstackCompleted),
      project_completed: Boolean(input.projectCompleted),
      notes: input.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from("daily_checkins")
      .upsert(payload, { onConflict: "user_id,sprint_id,checkin_date" })
      .select()
      .single()

    if (error) {
      console.error("[dailyCheckinService] Error saving check-in:", error)
      return { checkin: null, error: new Error(error.message) }
    }

    // Optionally broadcast activity to team feed if teamId is available
    if (input.teamId) {
      try {
        await supabase.from("team_activities").insert({
          team_id: input.teamId,
          user_id: input.userId,
          action_type: "DAILY_CHECKIN",
          target_name: `Checked in: ${studyHours}h study, ${problemsSolved} problems`,
        })
      } catch (actErr) {
        console.warn("[dailyCheckinService] Could not log team activity:", actErr)
      }
    }

    return { checkin: mapCheckinRow(data), error: null }
  } catch (err) {
    return {
      checkin: null,
      error: err instanceof Error ? err : new Error(String(err)),
    }
  }
}

/**
 * Calculates current streak (in consecutive calendar days) from real user check-ins.
 * Returns 0 if no check-ins exist. Never fabricates a streak.
 */
export function calculateStreak(checkins: DailyCheckin[]): number {
  if (!checkins || checkins.length === 0) return 0

  // Filter out entries with 0 study time and 0 problems if considered inactive,
  // or count any recorded checkin
  const activeDates = Array.from(
    new Set(
      checkins
        .filter((c) => c.studyHours > 0 || c.problemsSolvedCount > 0)
        .map((c) => c.checkinDate),
    ),
  ).sort()

  if (activeDates.length === 0) return 0

  const todayStr = getLocalTodayDateString()
  const today = parseLocalDate(todayStr)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`

  const latestDateStr = activeDates[activeDates.length - 1]

  // If latest checkin is older than yesterday, streak is broken
  if (latestDateStr !== todayStr && latestDateStr !== yesterdayStr) {
    return 0
  }

  // Count backwards day by day
  let streak = 0
  let expectedDate = parseLocalDate(latestDateStr)

  for (let i = activeDates.length - 1; i >= 0; i--) {
    const checkDate = parseLocalDate(activeDates[i])
    const diff = Math.round(
      (expectedDate.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24),
    )

    if (diff === 0) {
      streak++
      expectedDate.setDate(expectedDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

/**
 * Sums total study hours from real check-ins. Returns 0 if none exist.
 */
export function calculateTotalStudyHours(checkins: DailyCheckin[]): number {
  if (!checkins || checkins.length === 0) return 0
  const sum = checkins.reduce((acc, c) => acc + (c.studyHours || 0), 0)
  return Number(sum.toFixed(1))
}

/**
 * Sums total problems solved from real check-ins. Returns 0 if none exist.
 */
export function calculateTotalProblemsSolved(checkins: DailyCheckin[]): number {
  if (!checkins || checkins.length === 0) return 0
  return checkins.reduce((acc, c) => acc + (c.problemsSolvedCount || 0), 0)
}

/**
 * Fetches check-ins for all teammates in an active sprint (authorized by RLS team member policy).
 */
export async function fetchTeamCheckins(
  sprintId: string,
): Promise<{ checkins: DailyCheckin[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("sprint_id", sprintId)
      .order("checkin_date", { ascending: true })

    if (error) {
      console.error("[dailyCheckinService] Error fetching team check-ins:", error)
      return { checkins: [], error: new Error(error.message) }
    }

    return { checkins: (data || []).map(mapCheckinRow), error: null }
  } catch (err) {
    return {
      checkins: [],
      error: err instanceof Error ? err : new Error(String(err)),
    }
  }
}
