import type {
  LearningCategory,
  MemberAnalytics,
  PerformanceTrendPoint,
  SprintProgressPoint,
  WeeklyActivityDay,
} from "../types"

export const analytics50DayData: SprintProgressPoint[] = [
  { day: "Day 1", actual: 10, expected: 10 },
  { day: "Day 5", actual: 25, expected: 20 },
  { day: "Day 10", actual: 35, expected: 30 },
  { day: "Day 15", actual: 55, expected: 45 },
  { day: "Day 17", actual: 74, expected: 68 },
  { day: "Day 25", actual: null, expected: 75 },
  { day: "Day 35", actual: null, expected: 85 },
  { day: "Day 50", actual: null, expected: 100 },
]

export const weeklyActivityData: WeeklyActivityDay[] = [
  { day: "MON", study: 3, problems: 3, tasks: 4 },
  { day: "TUE", study: 2, problems: 2, tasks: 3 },
  { day: "WED", study: 4, problems: 5, tasks: 5 },
  { day: "THU", study: 3, problems: 3, tasks: 4 },
  { day: "FRI", study: 5, problems: 4, tasks: 6 },
  { day: "SAT", study: 4, problems: 5, tasks: 5 },
  { day: "SUN", study: 2, problems: 1, tasks: 2 },
]

export const learningBreakdownData: LearningCategory[] = [
  { name: "DSA", value: 28, color: "#6750C7" },
  { name: "LeetCode", value: 18, color: "#8D7BE8" },
  { name: "Full Stack", value: 20, color: "#4C3A9E" },
  { name: "Projects", value: 14, color: "#F45B8B" },
  { name: "CS Fundamentals", value: 8, color: "#FFB3C8" },
]

export const performanceTrendData: PerformanceTrendPoint[] = [
  { week: "W1", progress: 42 },
  { week: "W2", progress: 51 },
  { week: "W3", progress: 63 },
  { week: "W4", progress: 74 },
]

export const teamAnalyticsData: MemberAnalytics[] = [
  {
    name: "Siva",
    percent: 78,
    dsa: 82,
    leetcode: 91,
    fullstack: 71,
    projects: 68,
  },
  {
    name: "Vasi",
    percent: 71,
    dsa: 76,
    leetcode: 72,
    fullstack: 78,
    projects: 67,
  },
  {
    name: "Shameem",
    percent: 66,
    dsa: 70,
    leetcode: 65,
    fullstack: 74,
    projects: 67,
  },
]
