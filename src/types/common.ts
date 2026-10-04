import type { LucideIcon } from "lucide-react"

export type ActiveView =
  | "Dashboard"
  | "DSA"
  | "LeetCode"
  | "Full Stack"
  | "Projects"
  | "Analytics"
  | "Settings"

export type ProgressStatus = "COMPLETED" | "IN PROGRESS" | "UP NEXT"

export type DifficultyLevel = "Easy" | "Medium" | "Hard"

export interface SubStat {
  label: string
  value: string
  color?: string
}

export interface MetricCardProps {
  title: string
  mainStat: string
  subStats: SubStat[]
  isHighlight?: boolean
}

export interface ProgressCardProps {
  title: string
  percent: number
  stat1Label: string
  stat1Value: string
  stat2Label: string
  stat2Value: string
  icon: LucideIcon
  colorClass: string
}

export interface MissionTask {
  text: string
  done: boolean
}

export interface MissionHighlight {
  label: string
  value: string
  icon?: LucideIcon
}

export interface MissionCardProps {
  title: string
  day: number
  icon: LucideIcon
  highlight?: MissionHighlight
  tasks: MissionTask[]
  expectedTime: string
  buttonText: string
}
