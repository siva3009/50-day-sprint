import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { useAuth } from "./AuthContext"
import {
  createTeamWithSprint,
  fetchActiveSprintForTeam,
  fetchTeamMembers,
  fetchUserTeam,
  joinTeamByCode,
  leaveTeam as apiLeaveTeam,
} from "../services/teamService"
import {
  calculateSprintDayStatus,
  type SprintDayCalculation,
} from "../utils/calculations"
import type {
  ActiveSprintModel,
  TeamMemberModel,
  TeamModel,
} from "../types/team"

export interface TeamContextType {
  currentTeam: TeamModel | null
  members: TeamMemberModel[]
  teamRole: "owner" | "member" | null
  currentSprint: ActiveSprintModel | null
  sprintDayStatus: SprintDayCalculation
  loading: boolean
  createTeam: (
    teamName: string,
    sprintName?: string,
    startDate?: string,
    dailyHours?: number,
    weeklyHours?: number,
  ) => Promise<{ error: Error | null }>
  joinTeam: (inviteCode: string) => Promise<{ error: Error | null }>
  leaveTeam: () => Promise<{ error: Error | null }>
  refreshTeam: () => Promise<void>
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth()
  const [currentTeam, setCurrentTeam] = useState<TeamModel | null>(null)
  const [members, setMembers] = useState<TeamMemberModel[]>([])
  const [teamRole, setTeamRole] = useState<"owner" | "member" | null>(null)
  const [currentSprint, setCurrentSprint] = useState<ActiveSprintModel | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const loadTeamData = useCallback(async (userId: string) => {
    setLoading(true)
    try {
      const { team, role, error: teamErr } = await fetchUserTeam(userId)

      if (teamErr) {
        console.error("[TeamContext] Error loading user team:", teamErr)
      }

      if (team) {
        setCurrentTeam(team)
        setTeamRole(role)

        // Fetch team members & active sprint in parallel
        const [membersRes, sprintRes] = await Promise.all([
          fetchTeamMembers(team.id),
          fetchActiveSprintForTeam(team.id),
        ])

        if (membersRes.error) {
          console.error("[TeamContext] Error loading members:", membersRes.error)
        } else {
          setMembers(membersRes.members)
        }

        if (sprintRes.error) {
          console.error("[TeamContext] Error loading sprint:", sprintRes.error)
        } else {
          setCurrentSprint(sprintRes.sprint)
        }
      } else {
        setCurrentTeam(null)
        setMembers([])
        setTeamRole(null)
        setCurrentSprint(null)
      }
    } catch (err) {
      console.error("[TeamContext] Unexpected error loading team:", err)
      setCurrentTeam(null)
      setMembers([])
      setTeamRole(null)
      setCurrentSprint(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      loadTeamData(user.id)
    } else {
      setCurrentTeam(null)
      setMembers([])
      setTeamRole(null)
      setCurrentSprint(null)
      setLoading(false)
    }
  }, [user, loadTeamData])

  const refreshTeam = useCallback(async () => {
    if (user) {
      await loadTeamData(user.id)
    }
  }, [user, loadTeamData])

  const createTeam = async (
    teamName: string,
    sprintName: string = "50 Day Sprint",
    startDate: string = new Date().toISOString().split("T")[0],
    dailyHours: number = 4.0,
    weeklyHours: number = 25.0,
  ): Promise<{ error: Error | null }> => {
    if (!user) {
      return { error: new Error("Authentication required.") }
    }

    const { team, sprint, error } = await createTeamWithSprint(
      user.id,
      teamName,
      sprintName,
      startDate,
      dailyHours,
      weeklyHours,
    )

    if (error) {
      return { error }
    }

    if (team) {
      setCurrentTeam(team)
      setTeamRole("owner")
      setCurrentSprint(sprint)
      await loadTeamData(user.id)
    }

    return { error: null }
  }

  const joinTeam = async (
    inviteCode: string,
  ): Promise<{ error: Error | null }> => {
    if (!user) {
      return { error: new Error("Authentication required.") }
    }

    const { team, error } = await joinTeamByCode(user.id, inviteCode)

    if (error) {
      return { error }
    }

    if (team) {
      setCurrentTeam(team)
      setTeamRole("member")
      await loadTeamData(user.id)
    }

    return { error: null }
  }

  const leaveTeam = async (): Promise<{ error: Error | null }> => {
    if (!user || !currentTeam) {
      return { error: new Error("No active team to leave.") }
    }

    const { error } = await apiLeaveTeam(user.id, currentTeam.id)
    if (error) {
      return { error }
    }

    setCurrentTeam(null)
    setMembers([])
    setTeamRole(null)
    setCurrentSprint(null)

    return { error: null }
  }

  // Calculate dynamic 50-day sprint progress
  const sprintDayStatus = calculateSprintDayStatus(
    currentSprint?.startDate ?? "",
    50,
  )

  return (
    <TeamContext.Provider
      value={{
        currentTeam,
        members,
        teamRole,
        currentSprint,
        sprintDayStatus,
        loading,
        createTeam,
        joinTeam,
        leaveTeam,
        refreshTeam,
      }}
    >
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam(): TeamContextType {
  const context = useContext(TeamContext)
  if (!context) {
    throw new Error("useTeam must be used within a TeamProvider")
  }
  return context
}
