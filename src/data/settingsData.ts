import type {
  NotificationOption,
  SprintSettings,
  TeamMemberSetting,
  UserProfile,
} from "../types"

export const initialUserProfile: UserProfile = {
  name: "Siva",
  email: "siva@example.com",
  college: "PRINCE SHRI VENKATESWARA PADMAVATHY ENGINEERING COLLEGE",
  role: "Engineering Student",
  github: "github.com/username",
  linkedin: "linkedin.com/in/username",
  avatar:
    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop&auto=format",
}

export const initialSprintSettings: SprintSettings = {
  name: "50 Day Sprint",
  startDate: "2026-09-15",
  endDate: "2026-11-03",
  currentDay: 17,
  totalDays: 50,
  dailyTargetHours: "4 Hours",
  weeklyTargetHours: "25 Hours",
  primaryGoal: "Placement Ready",
  targetCompanies: "Product + Service",
}

export const teamMembersList: TeamMemberSetting[] = [
  {
    name: "Siva",
    avatar:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop&auto=format",
    owner: true,
  },
  {
    name: "Vasi",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&auto=format",
    owner: false,
  },
  {
    name: "Shameem",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&auto=format",
    owner: false,
  },
  {
    name: "Arun",
    avatar:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&auto=format",
    owner: false,
  },
]

export const notificationOptionsList: NotificationOption[] = [
  {
    title: "Daily Reminder",
    desc: "Remind me to complete today's mission.",
    on: true,
  },
  {
    title: "Missed Day Reminder",
    desc: "Notify me when I miss a daily check-in.",
    on: true,
  },
  {
    title: "Friend Activity",
    desc: "Show activity updates from my team.",
    on: true,
  },
  {
    title: "Weekly Summary",
    desc: "Send my weekly progress summary.",
    on: true,
  },
  {
    title: "Placement Readiness Alerts",
    desc: "Alert me when my readiness falls behind target.",
    on: true,
  },
]
