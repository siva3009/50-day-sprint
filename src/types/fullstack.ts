import type { ProgressStatus } from "./common"

export interface FullStackModule {
  id: string
  name: string
  percent: number
  topics: string
  practice: string
  status: ProgressStatus
}

export interface FullStackStage {
  stage: string
  modules: FullStackModule[]
}

export interface FullStackSkill {
  name: string
  score: number
}

export interface RecentCompletedItem {
  name: string
  date: string
}
