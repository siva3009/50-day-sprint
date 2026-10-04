import { supabase } from "../lib/supabaseClient"
import type {
  ActiveSprintModel,
  FriendActivity,
  TeamMemberModel,
  TeamModel,
} from "../types/team"
import { friendsActivities } from "../data/teamData"

export interface TeamServiceData {
  friendsActivities: FriendActivity[]
}

/**
 * Backward-compatible mock data accessor
 */
export function getTeamData(): TeamServiceData {
  return {
    friendsActivities,
  }
}

/**
 * Generates a random 6-character alphanumeric uppercase invite code.
 */
function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Fetches the team that the given user currently belongs to.
 */
export async function fetchUserTeam(userId: string): Promise<{
  team: TeamModel | null
  role: "owner" | "member" | null
  error: Error | null
}> {
  try {
    // 1. Get user's membership
    const { data: memberData, error: memberError } = await supabase
      .from("team_members")
      .select("team_id, role")
      .eq("user_id", userId)
      .maybeSingle()

    if (memberError) {
      return { team: null, role: null, error: new Error(memberError.message) }
    }

    if (!memberData) {
      return { team: null, role: null, error: null }
    }

    // 2. Get the team record
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .select("*")
      .eq("id", memberData.team_id)
      .single()

    if (teamError) {
      return { team: null, role: null, error: new Error(teamError.message) }
    }

    const team: TeamModel = {
      id: teamData.id,
      name: teamData.name,
      inviteCode: teamData.invite_code,
      maxMembers: teamData.max_members,
      createdBy: teamData.created_by,
      createdAt: teamData.created_at,
    }

    return {
      team,
      role: memberData.role as "owner" | "member",
      error: null,
    }
  } catch (err) {
    return {
      team: null,
      role: null,
      error: err instanceof Error ? err : new Error(String(err)),
    }
  }
}

/**
 * Fetches all members of a given team along with their profile details.
 */
export async function fetchTeamMembers(
  teamId: string,
): Promise<{ members: TeamMemberModel[]; error: Error | null }> {
  try {
    const { data: memberRows, error: memberError } = await supabase
      .from("team_members")
      .select("id, user_id, team_id, role, joined_at")
      .eq("team_id", teamId)

    if (memberError) {
      return { members: [], error: new Error(memberError.message) }
    }

    if (!memberRows || memberRows.length === 0) {
      return { members: [], error: null }
    }

    // Fetch corresponding profiles
    const userIds = memberRows.map((m) => m.user_id)
    const { data: profileRows, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, email")
      .in("id", userIds)

    if (profileError) {
      console.warn("[TeamService] Could not fetch profiles for team members:", profileError)
    }

    const profileMap = new Map<string, { full_name: string | null; avatar_url: string | null; email: string | null }>()
    if (profileRows) {
      for (const p of profileRows) {
        profileMap.set(p.id, p)
      }
    }

    const members: TeamMemberModel[] = memberRows.map((m) => {
      const p = profileMap.get(m.user_id)
      return {
        id: m.id,
        userId: m.user_id,
        teamId: m.team_id,
        role: m.role as "owner" | "member",
        name: p?.full_name || "Team Member",
        avatar:
          p?.avatar_url ||
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&auto=format",
        email: p?.email || undefined,
        joinedAt: m.joined_at,
      }
    })

    return { members, error: null }
  } catch (err) {
    return {
      members: [],
      error: err instanceof Error ? err : new Error(String(err)),
    }
  }
}

/**
 * Creates a new team, assigns the creator as owner, initializes a 50-day sprint,
 * and logs team activities.
 */
export async function createTeamWithSprint(
  userId: string,
  teamName: string,
  sprintName: string = "50 Day Sprint",
  startDate: string = new Date().toISOString().split("T")[0],
  dailyHours: number = 4.0,
  weeklyHours: number = 25.0,
): Promise<{
  team: TeamModel | null
  sprint: ActiveSprintModel | null
  error: Error | null
}> {
  try {
    // 1. Attempt atomic RPC function first
    // Note: RPC call may fail if migration 4 has not been applied to the remote DB yet
    const rpcRes = await (supabase.rpc as unknown as (name: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>)(
      "create_team_with_sprint",
      {
        p_team_name: teamName.trim(),
        p_sprint_name: sprintName.trim(),
        p_start_date: startDate,
        p_daily_hours: dailyHours,
        p_weekly_hours: weeklyHours,
      },
    )

    if (!rpcRes.error && rpcRes.data) {
      const parsed = rpcRes.data as {
        team_id: string
        team_name: string
        invite_code: string
        sprint_id: string
        start_date: string
        end_date: string
      }

      const team: TeamModel = {
        id: parsed.team_id,
        name: parsed.team_name,
        inviteCode: parsed.invite_code,
        maxMembers: 5,
        createdBy: userId,
        createdAt: new Date().toISOString(),
      }

      const sprint: ActiveSprintModel = {
        id: parsed.sprint_id,
        teamId: parsed.team_id,
        name: sprintName,
        startDate: parsed.start_date,
        endDate: parsed.end_date,
        targetHoursDaily: dailyHours,
        targetHoursWeekly: weeklyHours,
        status: "active",
      }

      return { team, sprint, error: null }
    }

    // 2. Direct table fallback if RPC is not available in remote schema
    const inviteCode = generateInviteCode()

    // Calculate end date = startDate + 49 days
    const startObj = new Date(startDate)
    startObj.setDate(startObj.getDate() + 49)
    const endDate = startObj.toISOString().split("T")[0]

    // Insert Team
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .insert({
        name: teamName.trim(),
        invite_code: inviteCode,
        max_members: 5,
        created_by: userId,
      })
      .select("*")
      .single()

    if (teamError) {
      return { team: null, sprint: null, error: new Error(teamError.message) }
    }

    // Insert Creator into team_members as Owner
    const { error: memberError } = await supabase.from("team_members").insert({
      team_id: teamData.id,
      user_id: userId,
      role: "owner",
    })

    if (memberError) {
      return { team: null, sprint: null, error: new Error(memberError.message) }
    }

    // Insert 50-Day Sprint
    const { data: sprintData, error: sprintError } = await supabase
      .from("sprints")
      .insert({
        team_id: teamData.id,
        name: sprintName.trim(),
        start_date: startDate,
        end_date: endDate,
        target_hours_daily: dailyHours,
        target_hours_weekly: weeklyHours,
        status: "active",
      })
      .select("*")
      .single()

    if (sprintError) {
      return { team: null, sprint: null, error: new Error(sprintError.message) }
    }

    // Log Activity
    await supabase.from("team_activities").insert({
      team_id: teamData.id,
      user_id: userId,
      action_type: "TEAM_CREATED",
      target_name: `${teamName.trim()} created`,
    })

    const team: TeamModel = {
      id: teamData.id,
      name: teamData.name,
      inviteCode: teamData.invite_code,
      maxMembers: teamData.max_members,
      createdBy: teamData.created_by,
      createdAt: teamData.created_at,
    }

    const sprint: ActiveSprintModel = {
      id: sprintData.id,
      teamId: sprintData.team_id,
      name: sprintData.name,
      startDate: sprintData.start_date,
      endDate: sprintData.end_date,
      targetHoursDaily: Number(sprintData.target_hours_daily),
      targetHoursWeekly: Number(sprintData.target_hours_weekly),
      status: sprintData.status,
    }

    return { team, sprint, error: null }
  } catch (err) {
    return {
      team: null,
      sprint: null,
      error: err instanceof Error ? err : new Error(String(err)),
    }
  }
}

/**
 * Joins an existing team via its unique invite code.
 * Validates that code exists, team has capacity (< 5 members), and user is not already a member.
 */
export async function joinTeamByCode(
  userId: string,
  inviteCode: string,
): Promise<{
  team: TeamModel | null
  error: Error | null
}> {
  const cleanCode = inviteCode.trim().toUpperCase()

  if (!cleanCode) {
    return { team: null, error: new Error("Please enter an invite code.") }
  }

  try {
    // 1. Try atomic RPC first
    const rpcRes = await (supabase.rpc as unknown as (name: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>)(
      "join_team_by_code",
      {
        p_invite_code: cleanCode,
      },
    )

    if (!rpcRes.error && rpcRes.data) {
      const parsed = rpcRes.data as { team_id: string; team_name: string; role: string }
      return {
        team: {
          id: parsed.team_id,
          name: parsed.team_name,
          inviteCode: cleanCode,
          maxMembers: 5,
          createdBy: null,
          createdAt: new Date().toISOString(),
        },
        error: null,
      }
    }

    // 2. Direct fallback logic if RPC function is not installed
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .select("*")
      .eq("invite_code", cleanCode)
      .maybeSingle()

    if (teamError || !teamData) {
      return { team: null, error: new Error("Invalid team code.") }
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", teamData.id)
      .eq("user_id", userId)
      .maybeSingle()

    if (existingMember) {
      return {
        team: null,
        error: new Error("You are already a member of this team."),
      }
    }

    // Check capacity
    const { count, error: countError } = await supabase
      .from("team_members")
      .select("*", { count: "exact", head: true })
      .eq("team_id", teamData.id)

    if (countError) {
      return { team: null, error: new Error(countError.message) }
    }

    if ((count ?? 0) >= teamData.max_members) {
      return { team: null, error: new Error("Team is full.") }
    }

    // Add membership
    const { error: joinError } = await supabase.from("team_members").insert({
      team_id: teamData.id,
      user_id: userId,
      role: "member",
    })

    if (joinError) {
      if (joinError.message.includes("full") || joinError.message.includes("capacity")) {
        return { team: null, error: new Error("Team is full.") }
      }
      return { team: null, error: new Error(joinError.message) }
    }

    // Log Activity
    await supabase.from("team_activities").insert({
      team_id: teamData.id,
      user_id: userId,
      action_type: "MEMBER_JOINED",
      target_name: "New member joined the team",
    })

    const team: TeamModel = {
      id: teamData.id,
      name: teamData.name,
      inviteCode: teamData.invite_code,
      maxMembers: teamData.max_members,
      createdBy: teamData.created_by,
      createdAt: teamData.created_at,
    }

    return { team, error: null }
  } catch (err) {
    return {
      team: null,
      error: err instanceof Error ? err : new Error(String(err)),
    }
  }
}

/**
 * Removes user membership from a team.
 */
export async function leaveTeam(
  userId: string,
  teamId: string,
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", teamId)
      .eq("user_id", userId)

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

/**
 * Fetches active sprint for the given team.
 */
export async function fetchActiveSprintForTeam(
  teamId: string,
): Promise<{ sprint: ActiveSprintModel | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("sprints")
      .select("*")
      .eq("team_id", teamId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .maybeSingle()

    if (error) {
      return { sprint: null, error: new Error(error.message) }
    }

    if (!data) {
      return { sprint: null, error: null }
    }

    const sprint: ActiveSprintModel = {
      id: data.id,
      teamId: data.team_id,
      name: data.name,
      startDate: data.start_date,
      endDate: data.end_date,
      targetHoursDaily: Number(data.target_hours_daily),
      targetHoursWeekly: Number(data.target_hours_weekly),
      status: data.status,
    }

    return { sprint, error: null }
  } catch (err) {
    return {
      sprint: null,
      error: err instanceof Error ? err : new Error(String(err)),
    }
  }
}
