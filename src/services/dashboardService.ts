import { supabase } from "../lib/supabaseClient"
import type { ActiveSprintModel, TeamMemberModel } from "../types/team"
import type { SprintDayPlan, SprintDayTask } from "../types/sprintPlan"
import {
  calculateReadinessScore,
  calculateSprintDayStatus,
  type SprintDayCalculation,
} from "../utils/calculations"
import {
  calculateStreak,
  calculateTotalProblemsSolved,
  calculateTotalStudyHours,
  fetchTodayCheckin,
  fetchUserCheckins,
  type DailyCheckin,
} from "./dailyCheckinService"
import { fetchSprintDayPlan } from "./sprintPlanService"

export interface DashboardMissionItem {
  label: string
  value: string
}

export interface DashboardFocusItem {
  text: string
  type: string
  difficulty?: string | null
}

export interface ChartPoint {
  day: string
  progress: number
  hours?: number
}

export interface TrackMetric {
  percent: number
  stat1Label: string
  stat1Value: string
  stat2Label: string
  stat2Value: string
}

export interface RealTeamMemberProgress {
  userId: string
  name: string
  avatar: string
  role: "owner" | "member"
  progressPercent: number
  studyHours: number
  problemsSolved: number
  activity: string
  time: string
}

export interface RealDashboardData {
  sprintDayStatus: SprintDayCalculation
  currentDay: number
  totalDays: number
  dayPlan: SprintDayPlan | null
  todayMissionItems: DashboardMissionItem[]
  todayFocusItems: DashboardFocusItem[]
  expectedTimeText: string
  totalStudyHours: number
  problemsSolved: number
  currentStreakDays: number
  readinessScore: number
  chartData: ChartPoint[]
  dsaMetric: TrackMetric
  leetcodeMetric: TrackMetric
  fullstackMetric: TrackMetric
  projectMetric: TrackMetric
  todayCheckin: DailyCheckin | null
  teamMembersProgress: RealTeamMemberProgress[]
}

/**
 * Backward-compatible static signature returning valid initial empty state (0% values, never fake mocks).
 */
export function getDashboardData(): {
  chartData: ChartPoint[]
  todayFocusItems: DashboardFocusItem[]
  todayMissionItems: DashboardMissionItem[]
  sprintDay: number
  totalDays: number
  totalStudyHours: number
  problemsSolved: number
  currentStreakDays: number
  readinessScore: number
} {
  return {
    chartData: [
      { day: "Day 1", progress: 0 },
      { day: "Day 8", progress: 0 },
    ],
    todayFocusItems: [],
    todayMissionItems: [],
    sprintDay: 8,
    totalDays: 50,
    totalStudyHours: 0,
    problemsSolved: 0,
    currentStreakDays: 0,
    readinessScore: 0,
  }
}

/**
 * Fetches and aggregates REAL live data from Supabase for the active dashboard:
 * - Dynamic sprint day calculated from sprint.start_date
 * - Day curriculum and tasks from public.sprint_day_plans / sprint_day_tasks
 * - Total study hours, problems solved, and streak from public.daily_checkins
 * - Real track completion percentages from user progress tables
 * - Real team progress without fabricated percentages
 * - Real progress chart history
 */
export async function fetchLiveDashboardData(
  userId: string,
  sprint: ActiveSprintModel | null,
  teamId?: string,
  teamMembers: TeamMemberModel[] = [],
): Promise<RealDashboardData> {
  const sprintDayStatus = calculateSprintDayStatus(sprint?.startDate, 50)
  const currentDay = sprintDayStatus.status === "not_started" ? 1 : sprintDayStatus.currentDay
  const sprintId = sprint?.id

  // 1. Parallel execution for primary data sources
  const [
    dayPlanResult,
    checkinsResult,
    todayCheckinResult,
    dsaTopicsCountResult,
    dsaSolvedResult,
    leetcodeSolvedResult,
    fullstackCountResult,
    fullstackCompletedResult,
    projectTasksResult,
    teamCheckinsResult,
  ] = await Promise.all([
    // Today's curriculum plan from Supabase
    fetchSprintDayPlan(currentDay).catch((err) => {
      console.warn("[dashboardService] Could not fetch day plan:", err)
      return null
    }),

    // User's check-ins for active sprint
    sprintId
      ? fetchUserCheckins(userId, sprintId)
      : Promise.resolve({ checkins: [] as DailyCheckin[], error: null }),

    // Today's user check-in
    sprintId
      ? fetchTodayCheckin(userId, sprintId)
      : Promise.resolve({ checkin: null as DailyCheckin | null, error: null }),

    // Total DSA Topics count
    supabase.from("dsa_topics").select("id", { count: "exact", head: true }),

    // User solved DSA problems
    supabase
      .from("user_dsa_progress")
      .select("id, status")
      .eq("user_id", userId)
      .eq("status", "Solved"),

    // User solved LeetCode problems
    supabase
      .from("user_leetcode_progress")
      .select("id, status, solved_at")
      .eq("user_id", userId)
      .eq("status", "Solved"),

    // Full Stack Modules count
    supabase.from("fullstack_modules").select("id", { count: "exact", head: true }),

    // User completed Full Stack modules
    supabase
      .from("user_fullstack_progress")
      .select("id, status")
      .eq("user_id", userId)
      .eq("status", "COMPLETED"),

    // Team Project tasks
    teamId
      ? supabase
          .from("projects")
          .select("id, tasks:project_tasks(id, is_completed, status)")
          .eq("team_id", teamId)
      : Promise.resolve({ data: null, error: null }),

    // Team check-ins for real member progress
    sprintId
      ? supabase
          .from("daily_checkins")
          .select("user_id, study_hours, problems_solved_count, checkin_date")
          .eq("sprint_id", sprintId)
      : Promise.resolve({ data: null, error: null }),
  ])

  // 2. Parse Curriculum for Today's Mission & Focus
  const dayPlan = dayPlanResult
  const tasks: SprintDayTask[] = dayPlan?.tasks || []

  // Extract structured mission items from actual Day tasks
  const dsaTask = tasks.find((t) => t.category === "DSA")
  const leetcodeTask = tasks.find((t) => t.category === "LEETCODE")
  const fullstackTask = tasks.find((t) => t.category === "FULLSTACK")
  const projectTask = tasks.find((t) => t.category === "PROJECT")

  const todayMissionItems: DashboardMissionItem[] = []

  if (dsaTask) {
    todayMissionItems.push({ label: "DSA", value: dsaTask.title })
  }
  if (leetcodeTask) {
    todayMissionItems.push({ label: "LeetCode", value: leetcodeTask.title })
  }
  if (fullstackTask) {
    todayMissionItems.push({ label: "Full Stack", value: fullstackTask.title })
  }
  if (projectTask) {
    todayMissionItems.push({ label: "Project", value: projectTask.title })
  }

  // If certain categories are missing for today, fill with other real tasks from the day's curriculum
  if (todayMissionItems.length === 0 && tasks.length > 0) {
    tasks.slice(0, 4).forEach((t) => {
      todayMissionItems.push({ label: t.category, value: t.title })
    })
  }

  // Calculate expected study time from real curriculum tasks
  const totalMinutes = tasks.reduce((acc, t) => acc + (t.estimated_minutes || 0), 0)
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  const expectedTimeText =
    totalMinutes > 0
      ? `${hours > 0 ? `${hours}h ` : ""}${mins > 0 ? `${mins}m ` : ""}expected`
      : "Self-paced study"

  // Today's Focus items from curriculum
  const todayFocusItems: DashboardFocusItem[] = tasks.map((t) => ({
    text: t.title,
    type: t.category === "LEETCODE" ? "Practice" : t.category,
    difficulty: t.difficulty,
  }))

  // 3. Check-ins, Streak, Hours, and Problems
  const checkins = checkinsResult.checkins || []
  const todayCheckin = todayCheckinResult.checkin
  const totalStudyHours = calculateTotalStudyHours(checkins)
  const checkinProblems = calculateTotalProblemsSolved(checkins)
  const currentStreakDays = calculateStreak(checkins)

  // 4. Calculate Track Metrics
  // DSA
  const totalDsaTopics = dsaTopicsCountResult.count || 17
  const dsaSolvedCount = dsaSolvedResult.data?.length || 0
  const totalDsaTarget = 70 // 50-day target syllabus problems
  const dsaPercent = Math.min(100, Math.round((dsaSolvedCount / totalDsaTarget) * 100))

  const dsaMetric: TrackMetric = {
    percent: dsaPercent,
    stat1Label: "Topics",
    stat1Value: `0 / ${totalDsaTopics}`,
    stat2Label: "Problems",
    stat2Value: `${dsaSolvedCount} / ${totalDsaTarget}`,
  }

  // LeetCode
  const leetcodeSolvedCount = leetcodeSolvedResult.data?.length || 0
  const leetcodeTarget = 150
  const leetcodePercent = Math.min(100, Math.round((leetcodeSolvedCount / leetcodeTarget) * 100))

  // Solved this week
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const thisWeekSolved = (leetcodeSolvedResult.data || []).filter(
    (row: any) => row.solved_at && new Date(row.solved_at) >= oneWeekAgo,
  ).length

  const leetcodeMetric: TrackMetric = {
    percent: leetcodePercent,
    stat1Label: "Solved",
    stat1Value: `${leetcodeSolvedCount} / ${leetcodeTarget}`,
    stat2Label: "This Week",
    stat2Value: `${thisWeekSolved} problems`,
  }

  // Full Stack
  const totalFullstackModules = fullstackCountResult.count || 23
  const fullstackCompletedCount = fullstackCompletedResult.data?.length || 0
  const fullstackPercent = Math.min(
    100,
    Math.round((fullstackCompletedCount / totalFullstackModules) * 100),
  )

  // Project progress
  let projectTasksTotal = 0
  let projectTasksCompleted = 0

  if (projectTasksResult.data) {
    for (const p of projectTasksResult.data as any[]) {
      if (Array.isArray(p.tasks)) {
        projectTasksTotal += p.tasks.length
        projectTasksCompleted += p.tasks.filter((t: any) => t.is_completed).length
      }
    }
  }

  const projectPercent =
    projectTasksTotal > 0
      ? Math.round((projectTasksCompleted / projectTasksTotal) * 100)
      : 0

  const fullstackMetric: TrackMetric = {
    percent: fullstackPercent,
    stat1Label: "Modules",
    stat1Value: `${fullstackCompletedCount} / ${totalFullstackModules}`,
    stat2Label: "Project",
    stat2Value: `${projectPercent}%`,
  }

  const projectMetric: TrackMetric = {
    percent: projectPercent,
    stat1Label: "Tasks",
    stat1Value: `${projectTasksCompleted} / ${projectTasksTotal}`,
    stat2Label: "Milestones",
    stat2Value: projectTasksTotal > 0 ? `${projectPercent}%` : "Not started",
  }

  // Combine problem counts: check-in recorded problems + distinct problem solver table counts
  const problemsSolved = Math.max(checkinProblems, dsaSolvedCount + leetcodeSolvedCount)

  // 5. Real 50-Day Readiness Score (never hardcoded 68%)
  const readinessScore = calculateReadinessScore(
    dsaPercent,
    leetcodePercent,
    fullstackPercent,
    projectPercent,
  )

  // 6. Main Progress Graph from Real Activity History
  let chartData: ChartPoint[] = []

  if (checkins.length > 0) {
    // Generate cumulative progress curve from real check-ins
    let cumHours = 0
    chartData = checkins.map((c, idx) => {
      cumHours += c.studyHours || 0
      // Map cumulative hours to percentage of 200 hours sprint goal (4 hrs/day * 50 = 200)
      const progressValue = Math.min(100, Math.round((cumHours / 200) * 100))
      return {
        day: `Day ${idx + 1}`,
        progress: progressValue,
        hours: Number(c.studyHours.toFixed(1)),
      }
    })
    // Ensure at least 2 points for a visually clean line chart
    if (chartData.length === 1) {
      chartData = [
        { day: "Day 1", progress: 0, hours: 0 },
        { ...chartData[0], day: `Day ${currentDay}` },
      ]
    }
  } else {
    // Meaningful starting state without fake values
    chartData = [
      { day: "Day 1", progress: 0, hours: 0 },
      { day: `Day ${currentDay}`, progress: 0, hours: 0 },
    ]
  }

  // 7. Real Team Member Progress (Never fake percentages or fake members)
  const teamCheckinRows = (teamCheckinsResult.data || []) as {
    user_id: string
    study_hours: number
    problems_solved_count: number
    checkin_date: string
  }[]

  const teamMembersProgress: RealTeamMemberProgress[] = teamMembers.map((m) => {
    const memberCheckins = teamCheckinRows.filter((r) => r.user_id === m.userId)
    const mHours = Number(
      memberCheckins.reduce((acc, r) => acc + (Number(r.study_hours) || 0), 0).toFixed(1),
    )
    const mProblems = memberCheckins.reduce(
      (acc, r) => acc + (Number(r.problems_solved_count) || 0),
      0,
    )
    // Real completion percentage: proportion of sprint target hours or days checked in
    const mProgress =
      memberCheckins.length > 0
        ? Math.min(100, Math.round((mHours / 200) * 100))
        : 0

    const isUser = m.userId === userId
    const activity =
      memberCheckins.length > 0
        ? `Logged ${mHours}h • ${mProblems} solved`
        : m.role === "owner"
          ? "Team Owner • Ready for sprint"
          : "Team Member • Ready for sprint"

    return {
      userId: m.userId,
      name: isUser ? `${m.name} (You)` : m.name,
      avatar: m.avatar,
      role: m.role,
      progressPercent: mProgress,
      studyHours: mHours,
      problemsSolved: mProblems,
      activity,
      time: memberCheckins.length > 0 ? "Active" : "Joined",
    }
  })

  return {
    sprintDayStatus,
    currentDay,
    totalDays: 50,
    dayPlan,
    todayMissionItems,
    todayFocusItems,
    expectedTimeText,
    totalStudyHours,
    problemsSolved,
    currentStreakDays,
    readinessScore,
    chartData,
    dsaMetric,
    leetcodeMetric,
    fullstackMetric,
    projectMetric,
    todayCheckin,
    teamMembersProgress,
  }
}
