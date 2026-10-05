import type { DSATopic, FullStackStage, ProjectCategory } from "../types"

/**
 * Safely parses a date string ('YYYY-MM-DD' or ISO) as a local calendar date
 * with midnight time (00:00:00.000) to prevent timezone shifts across UTC boundaries.
 */
export function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split("T")[0].split("-")
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const day = parseInt(parts[2], 10)
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day, 0, 0, 0, 0)
    }
  }
  const d = new Date(dateStr)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Calculates current sprint day given start date and optional total days.
 * Dynamically derives day offset for any date.
 */
export function calculateCurrentDay(
  startDateStr: string,
  totalDays: number = 50,
): number {
  if (!startDateStr) return 1
  const start = parseLocalDate(startDateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const diffTime = now.getTime() - start.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 0
  const dayNumber = diffDays + 1
  return Math.min(dayNumber, totalDays)
}

export interface SprintDayCalculation {
  currentDay: number
  totalDays: number
  daysRemaining: number
  status: "not_started" | "active" | "completed"
  label: string
}

/**
 * Calculates dynamic sprint day and status from start date according to 50-day rules:
 * - Before start date: Day 0 / Not Started
 * - During sprint: Day 1 / 50 through Day 50 / 50 (e.g. start 2026-09-28 on 2026-10-05 = Day 8 / 50)
 * - After end date: Day 50 / 50, Status = completed
 */
export function calculateSprintDayStatus(
  startDateStr?: string,
  totalDays: number = 50,
): SprintDayCalculation {
  if (!startDateStr) {
    return {
      currentDay: 1,
      totalDays,
      daysRemaining: totalDays - 1,
      status: "active",
      label: `Day 1 / ${totalDays}`,
    }
  }

  const start = parseLocalDate(startDateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const diffTime = now.getTime() - start.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return {
      currentDay: 0,
      totalDays,
      daysRemaining: totalDays,
      status: "not_started",
      label: "Day 0 / Not Started",
    }
  }

  const dayNumber = diffDays + 1

  if (dayNumber > totalDays) {
    return {
      currentDay: totalDays,
      totalDays,
      daysRemaining: 0,
      status: "completed",
      label: `Day ${totalDays} / ${totalDays}`,
    }
  }

  return {
    currentDay: dayNumber,
    totalDays,
    daysRemaining: totalDays - dayNumber,
    status: "active",
    label: `Day ${dayNumber} / ${totalDays}`,
  }
}

/**
 * Calculates total and solved DSA problems and percentage across topics
 */
export function calculateDSAProgress(topics: DSATopic[]): {
  solved: number
  total: number
  percent: number
  completedTopics: number
  totalTopics: number
} {
  const total = topics.reduce((acc, t) => acc + t.total, 0)
  const solved = topics.reduce((acc, t) => acc + t.solved, 0)
  const completedTopics = topics.filter((t) => t.status === "COMPLETED").length
  const percent = total > 0 ? Math.round((solved / total) * 100) : 0
  return {
    solved,
    total,
    percent,
    completedTopics,
    totalTopics: topics.length,
  }
}

/**
 * Calculates LeetCode goal progress (target: 150 problems)
 */
export function calculateLeetCodeProgress(
  solvedCount: number,
  targetGoal: number = 150,
): {
  solved: number
  target: number
  percent: number
  remaining: number
} {
  const percent = Math.round((solvedCount / targetGoal) * 100)
  const remaining = Math.max(0, targetGoal - solvedCount)
  return {
    solved: solvedCount,
    target: targetGoal,
    percent,
    remaining,
  }
}

/**
 * Calculates Full Stack roadmap progress across stages and modules
 */
export function calculateFullStackProgress(stages: FullStackStage[]): {
  completedModules: number
  totalModules: number
  percent: number
} {
  const allModules = stages.flatMap((s) => s.modules)
  const totalModules = allModules.length
  const completedModules = allModules.filter(
    (m) => m.status === "COMPLETED",
  ).length
  const percent =
    totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0
  return {
    completedModules,
    totalModules,
    percent,
  }
}

/**
 * Calculates Project task completion progress
 */
export function calculateProjectProgress(categories: ProjectCategory[]): {
  completedTasks: number
  totalTasks: number
  percent: number
} {
  const allTasks = categories.flatMap((c) => c.tasks)
  const totalTasks = allTasks.length
  const completedTasks = allTasks.filter((t) => t.checked).length
  const percent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  return {
    completedTasks,
    totalTasks,
    percent,
  }
}

/**
 * Calculates composite placement readiness score
 */
export function calculateReadinessScore(
  dsaPercent: number,
  leetcodePercent: number,
  fullstackPercent: number,
  projectPercent: number,
): number {
  return Math.round(
    dsaPercent * 0.35 +
      leetcodePercent * 0.25 +
      fullstackPercent * 0.2 +
      projectPercent * 0.2,
  )
}
