import type { DSATopic, FullStackStage, ProjectCategory } from "../types"

/**
 * Calculates current sprint day given start date and optional total days
 */
export function calculateCurrentDay(
  startDateStr: string,
  totalDays: number = 50,
): number {
  const start = new Date(startDateStr)
  const now = new Date()
  const diffTime = now.getTime() - start.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
  return Math.max(1, Math.min(diffDays, totalDays))
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
 * - During sprint: Day 1 / 50 through Day 50 / 50
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

  const start = new Date(startDateStr)
  start.setHours(0, 0, 0, 0)

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const diffTime = now.getTime() - start.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

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
