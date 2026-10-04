export interface SprintProgressPoint {
  day: string
  actual: number | null
  expected: number
}

export interface WeeklyActivityDay {
  day: string
  study: number
  problems: number
  tasks: number
}

export interface LearningCategory {
  name: string
  value: number
  color: string
}

export interface PerformanceTrendPoint {
  week: string
  progress: number
}

export interface MemberAnalytics {
  name: string
  percent: number
  dsa: number
  leetcode: number
  fullstack: number
  projects: number
}
