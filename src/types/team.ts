export interface FriendActivity {
  name: string
  avatar: string
  activity: string
  time: string
  progress: number
}

export interface TeamMemberSetting {
  name: string
  avatar: string
  owner: boolean
}

export interface TeamInfo {
  name: string
  code: string
  memberCount: number
  maxMembers: number
}

export interface TeamModel {
  id: string
  name: string
  inviteCode: string
  maxMembers: number
  createdBy: string | null
  createdAt: string
}

export interface TeamMemberModel {
  id: string
  userId: string
  teamId: string
  role: "owner" | "member"
  name: string
  avatar: string
  email?: string
  joinedAt: string
}

export interface ActiveSprintModel {
  id: string
  teamId: string
  name: string
  startDate: string
  endDate: string
  targetHoursDaily: number
  targetHoursWeekly: number
  status: "active" | "completed"
}
