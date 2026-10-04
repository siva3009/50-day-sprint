import {
  lcRevisionQueue,
  leetcodeProblems,
  topicPerformanceData,
  weeklyChartData,
} from "../data/leetcodeData"
import type {
  LeetCodeProblem,
  RevisionItem,
  TopicPerformanceItem,
  WeeklyChartPoint,
} from "../types"

export interface LeetCodeData {
  problems: LeetCodeProblem[]
  weeklyChart: WeeklyChartPoint[]
  topicPerformance: TopicPerformanceItem[]
  revisionQueue: RevisionItem[]
  totalSolved: number
  targetGoal: number
  progressPercent: number
  streakDays: number
  weeklySolved: number
  weeklyTarget: number
}

export function getLeetCodeData(): LeetCodeData {
  return {
    problems: leetcodeProblems,
    weeklyChart: weeklyChartData,
    topicPerformance: topicPerformanceData,
    revisionQueue: lcRevisionQueue,
    totalSolved: 87,
    targetGoal: 150,
    progressPercent: 64,
    streakDays: 14,
    weeklySolved: 18,
    weeklyTarget: 20,
  }
}
