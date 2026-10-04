import {
  fsProjectSkills,
  fsRecentCompleted,
  fsRoadmap,
  fsWeakAreas,
} from "../data/fullstackData"
import type {
  FullStackSkill,
  FullStackStage,
  RecentCompletedItem,
  WeakAreaItem,
} from "../types"

export interface FullStackData {
  roadmap: FullStackStage[]
  skills: FullStackSkill[]
  weakAreas: WeakAreaItem[]
  recentCompleted: RecentCompletedItem[]
  progressPercent: number
  completedModules: number
  totalModules: number
  learningHours: number
  projectPercent: number
}

export function getFullStackData(): FullStackData {
  return {
    roadmap: fsRoadmap,
    skills: fsProjectSkills,
    weakAreas: fsWeakAreas,
    recentCompleted: fsRecentCompleted,
    progressPercent: 58,
    completedModules: 12,
    totalModules: 20,
    learningHours: 46,
    projectPercent: 65,
  }
}
