import type { DifficultyLevel, ProgressStatus } from "./common"

export interface DSATopic {
  id: string
  name: string
  percent: number
  solved: number
  total: number
  easy: number
  medium: number
  hard: number
  status: ProgressStatus
}

export interface DSAProblem {
  name: string
  difficulty: DifficultyLevel
  topic: string
  date: string
  color: string
  bg: string
  timeTaken?: string
  attempts?: number
}

export interface RoadmapSection {
  title: string
  ids: string[]
}

export interface RevisionItem {
  topic: string
  due: string
  color: string
  highlight?: boolean
}

export interface WeakAreaItem {
  name: string
  score: number
}

export interface DifficultyDistributionItem {
  name: DifficultyLevel | string
  value: number
  color: string
}
