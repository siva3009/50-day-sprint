import {
  chartData,
  todayFocusItems,
  todayMissionItems,
} from "../data/dashboardData"

export interface DashboardData {
  chartData: typeof chartData
  todayFocusItems: typeof todayFocusItems
  todayMissionItems: typeof todayMissionItems
  sprintDay: number
  totalDays: number
  totalStudyHours: number
  problemsSolved: number
  currentStreakDays: number
  readinessScore: number
}

export function getDashboardData(): DashboardData {
  return {
    chartData,
    todayFocusItems,
    todayMissionItems,
    sprintDay: 17,
    totalDays: 50,
    totalStudyHours: 74,
    problemsSolved: 87,
    currentStreakDays: 14,
    readinessScore: 68,
  }
}
