import type {
  ProjectActivity,
  ProjectCategory,
  ProjectContributor,
  ProjectMilestone,
} from "../types"

export const prjFeatures: ProjectCategory[] = [
  {
    category: "FOUNDATION",
    tasks: [
      {
        id: 1,
        name: "Project Setup",
        assignee: "Vasi",
        status: "Done",
        checked: true,
      },
      {
        id: 2,
        name: "Git Repository",
        assignee: "All",
        status: "Done",
        checked: true,
      },
      {
        id: 3,
        name: "Database Setup",
        assignee: "Shameem",
        status: "Done",
        checked: true,
      },
    ],
  },
  {
    category: "AUTHENTICATION",
    tasks: [
      {
        id: 4,
        name: "Registration",
        assignee: "Siva",
        status: "Done",
        checked: true,
      },
      { id: 5, name: "Login", assignee: "Siva", status: "Done", checked: true },
      {
        id: 6,
        name: "Password Validation",
        assignee: "Siva",
        status: "Done",
        checked: true,
      },
      {
        id: 7,
        name: "Forgot Password",
        assignee: "Siva",
        status: "Todo",
        checked: false,
      },
      {
        id: 8,
        name: "Role Management",
        assignee: "Shameem",
        status: "Todo",
        checked: false,
      },
    ],
  },
  {
    category: "JOB MANAGEMENT",
    tasks: [
      {
        id: 9,
        name: "Job Listing",
        assignee: "Vasi",
        status: "Done",
        checked: true,
      },
      {
        id: 10,
        name: "Job Details",
        assignee: "Vasi",
        status: "Done",
        checked: true,
      },
      {
        id: 11,
        name: "Search",
        assignee: "Vasi",
        status: "Todo",
        checked: false,
      },
      {
        id: 12,
        name: "Filters",
        assignee: "Vasi",
        status: "Todo",
        checked: false,
      },
      {
        id: 13,
        name: "Apply Flow",
        assignee: "Arun",
        status: "Todo",
        checked: false,
      },
    ],
  },
  {
    category: "USER",
    tasks: [
      {
        id: 14,
        name: "Profile",
        assignee: "Arun",
        status: "Done",
        checked: true,
      },
      {
        id: 15,
        name: "Resume Upload",
        assignee: "Arun",
        status: "Todo",
        checked: false,
      },
      {
        id: 16,
        name: "Application History",
        assignee: "Arun",
        status: "Todo",
        checked: false,
      },
    ],
  },
  {
    category: "ADMIN",
    tasks: [
      {
        id: 17,
        name: "Admin Dashboard",
        assignee: "Shameem",
        status: "Todo",
        checked: false,
      },
      {
        id: 18,
        name: "Manage Jobs",
        assignee: "Shameem",
        status: "Todo",
        checked: false,
      },
      {
        id: 19,
        name: "Manage Users",
        assignee: "Shameem",
        status: "Todo",
        checked: false,
      },
    ],
  },
  {
    category: "DEPLOYMENT",
    tasks: [
      {
        id: 20,
        name: "Production Build",
        assignee: "Vasi",
        status: "Todo",
        checked: false,
      },
      {
        id: 21,
        name: "Environment Variables",
        assignee: "All",
        status: "Todo",
        checked: false,
      },
      {
        id: 22,
        name: "Deployment",
        assignee: "Vasi",
        status: "Todo",
        checked: false,
      },
      {
        id: 23,
        name: "Domain / URL",
        assignee: "Vasi",
        status: "Todo",
        checked: false,
      },
    ],
  },
]

export const prjTeam: ProjectContributor[] = [
  {
    name: "Siva",
    role: "Frontend + Authentication",
    tasks: "8 / 10",
    percent: 80,
    avatar:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop&auto=format",
  },
  {
    name: "Vasi",
    role: "Backend + APIs",
    tasks: "6 / 9",
    percent: 67,
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&auto=format",
  },
  {
    name: "Shameem",
    role: "Database + Admin",
    tasks: "7 / 8",
    percent: 88,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&auto=format",
  },
  {
    name: "Arun",
    role: "UI / Testing",
    tasks: "4 / 7",
    percent: 57,
    avatar:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&auto=format",
  },
]

export const prjRecent: ProjectActivity[] = [
  {
    name: "Siva",
    action: "completed",
    target: "Login UI",
    avatar:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop&auto=format",
    time: "2 hrs ago",
  },
  {
    name: "Vasi",
    action: "completed",
    target: "User API",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&auto=format",
    time: "4 hrs ago",
  },
  {
    name: "Shameem",
    action: "updated",
    target: "Database schema",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&auto=format",
    time: "Yesterday",
  },
  {
    name: "Arun",
    action: "created",
    target: "Admin dashboard task",
    avatar:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&auto=format",
    time: "Yesterday",
  },
]

export const projectMilestones: (ProjectMilestone & { done: boolean })[] = [
  {
    title: "Foundation",
    status: "Completed",
    day: 11,
    active: false,
    done: true,
  },
  {
    title: "Database Complete",
    status: "Completed",
    day: 14,
    active: false,
    done: true,
  },
  {
    title: "Authentication",
    status: "Completed",
    day: 17,
    active: true,
    done: true,
  },
  {
    title: "Core Features",
    status: "In Progress",
    day: 23,
    active: false,
    done: false,
  },
  {
    title: "Testing",
    status: "Upcoming",
    day: 29,
    active: false,
    done: false,
  },
  {
    title: "Deployment",
    status: "Upcoming",
    day: 33,
    active: false,
    done: false,
  },
  {
    title: "Project Complete",
    status: "Target",
    day: 35,
    active: false,
    done: false,
  },
]
