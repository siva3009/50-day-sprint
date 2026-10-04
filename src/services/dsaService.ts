import {
  dsaDifficultyData,
  dsaRevisionQueue,
  dsaTopics,
  dsaWeakAreas,
  recentProblems,
  roadmapSections,
} from "../data/dsaData"
import type {
  DifficultyDistributionItem,
  DSAProblem,
  DSATopic,
  RevisionItem,
  RoadmapSection,
  WeakAreaItem,
} from "../types"

export interface DSAData {
  topics: DSATopic[]
  recentProblems: DSAProblem[]
  revisionQueue: RevisionItem[]
  roadmapSections: RoadmapSection[]
  weakAreas: WeakAreaItem[]
  difficultyDistribution: DifficultyDistributionItem[]
  progressPercent: number
  totalSolved: number
  totalProblems: number
  streakDays: number
}

export function getDSAData(): DSAData {
  return {
    topics: dsaTopics,
    recentProblems,
    revisionQueue: dsaRevisionQueue,
    roadmapSections,
    weakAreas: dsaWeakAreas,
    difficultyDistribution: dsaDifficultyData,
    progressPercent: 72,
    totalSolved: 43,
    totalProblems: 70,
    streakDays: 14,
  }
}
