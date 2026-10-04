import {
  analytics50DayData,
  learningBreakdownData,
  performanceTrendData,
  teamAnalyticsData,
  weeklyActivityData,
} from "../data/analyticsData"
import type {
  LearningCategory,
  MemberAnalytics,
  PerformanceTrendPoint,
  SprintProgressPoint,
  WeeklyActivityDay,
} from "../types"

export interface AnalyticsData {
  progress50Day: SprintProgressPoint[]
  weeklyActivity: WeeklyActivityDay[]
  learningBreakdown: LearningCategory[]
  performanceTrends: PerformanceTrendPoint[]
  teamAnalytics: MemberAnalytics[]
  readinessScore: number
  expectedScore: number
  currentSprintDay: number
}

export function getAnalyticsData(): AnalyticsData {
  return {
    progress50Day: analytics50DayData,
    weeklyActivity: weeklyActivityData,
    learningBreakdown: learningBreakdownData,
    performanceTrends: performanceTrendData,
    teamAnalytics: teamAnalyticsData,
    readinessScore: 74,
    expectedScore: 68,
    currentSprintDay: 17,
  }
}
