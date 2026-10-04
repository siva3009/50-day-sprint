import {
  initialUserProfile,
  initialSprintSettings,
  notificationOptionsList,
  teamMembersList,
} from "../data/settingsData"
import type {
  NotificationOption,
  SprintSettings,
  TeamMemberSetting,
  UserProfile,
} from "../types"

export interface SettingsData {
  profile: UserProfile
  sprintSettings: SprintSettings
  teamMembers: TeamMemberSetting[]
  notifications: NotificationOption[]
  teamName: string
  teamCode: string
  teamSize: string
}

export function getSettingsData(): SettingsData {
  return {
    profile: initialUserProfile,
    sprintSettings: initialSprintSettings,
    teamMembers: teamMembersList,
    notifications: notificationOptionsList,
    teamName: "Code Warriors",
    teamCode: "VX7K92",
    teamSize: "4 / 5 Members",
  }
}
