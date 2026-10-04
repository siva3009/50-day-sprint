import type {
  LeetCodeProblem,
  RevisionItem,
  TopicPerformanceItem,
  WeeklyChartPoint,
} from "../types"

export const leetcodeProblems: LeetCodeProblem[] = [
  {
    name: "Two Sum",
    difficulty: "Easy",
    topic: "Arrays",
    status: "Solved",
    date: "Today",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    name: "Valid Parentheses",
    difficulty: "Easy",
    topic: "Stack",
    status: "Solved",
    date: "Yesterday",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    name: "Binary Search",
    difficulty: "Easy",
    topic: "Binary Search",
    status: "Needs Revision",
    date: "2 days ago",
    color: "text-accent-pink",
    bg: "bg-accent-pink/10",
  },
  {
    name: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    topic: "Sliding Window",
    status: "Solved",
    date: "2 days ago",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    name: "3Sum",
    difficulty: "Medium",
    topic: "Two Pointers",
    status: "Unsolved",
    date: "—",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
]

export const weeklyChartData: WeeklyChartPoint[] = [
  { day: "Mon", count: 2 },
  { day: "Tue", count: 3 },
  { day: "Wed", count: 1 },
  { day: "Thu", count: 4 },
  { day: "Fri", count: 3 },
  { day: "Sat", count: 5 },
  { day: "Sun", count: 0 },
]

export const topicPerformanceData: TopicPerformanceItem[] = [
  { name: "Arrays", score: 82 },
  { name: "Hashing", score: 76 },
  { name: "Binary Search", score: 64 },
  { name: "Sliding Window", score: 71 },
  { name: "Trees", score: 42 },
  { name: "Graphs", score: 30 },
]

export const lcRevisionQueue: RevisionItem[] = [
  {
    topic: "Binary Search",
    due: "Due today",
    color: "text-accent-pink",
    highlight: true,
  },
  {
    topic: "Valid Parentheses",
    due: "Due tomorrow",
    color: "text-primary-purple",
  },
  {
    topic: "Sliding Window",
    due: "Due in 2 days",
    color: "text-text-secondary",
  },
]
