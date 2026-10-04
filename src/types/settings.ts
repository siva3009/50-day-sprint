export type SettingsTabName =
  | "Profile"
  | "Sprint"
  | "Team"
  | "Notifications"
  | "Appearance"
  | "Security"

export interface UserProfile {
  name: string
  email: string
  college: string
  role: string
  github: string
  linkedin: string
  avatar: string
}

export interface SprintSettings {
  name: string
  startDate: string
  endDate: string
  currentDay: number
  totalDays: number
  dailyTargetHours: string
  weeklyTargetHours: string
  primaryGoal: string
  targetCompanies: string
}

export interface NotificationOption {
  title: string
  desc: string
  on: boolean
}
