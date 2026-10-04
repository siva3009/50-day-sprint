export interface ProjectTask {
  id: number
  name: string
  assignee: string
  status: string
  checked: boolean
}

export interface ProjectCategory {
  category: string
  tasks: ProjectTask[]
}

export interface ProjectContributor {
  name: string
  role: string
  tasks: string
  percent: number
  avatar: string
}

export interface ProjectActivity {
  name: string
  action: string
  target: string
  avatar: string
  time: string
}

export interface ProjectMilestone {
  title: string
  day: number
  status: string
  active?: boolean
}
