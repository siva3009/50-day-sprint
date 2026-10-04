import type { DifficultyLevel } from "./common"

export type LeetCodeProblemStatus = "Solved" | "Needs Revision" | "Unsolved"

export interface LeetCodeProblem {
  name: string
  difficulty: DifficultyLevel
  topic: string
  status: LeetCodeProblemStatus
  date: string
  color: string
  bg: string
}

export interface WeeklyChartPoint {
  day: string
  count: number
}

export interface TopicPerformanceItem {
  name: string
  score: number
}
