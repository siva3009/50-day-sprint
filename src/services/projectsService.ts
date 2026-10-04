import {
  prjFeatures,
  prjRecent,
  prjTeam,
  projectMilestones,
} from "../data/projectsData"
import type {
  ProjectActivity,
  ProjectCategory,
  ProjectContributor,
  ProjectMilestone,
} from "../types"

export interface ProjectsData {
  features: ProjectCategory[]
  team: ProjectContributor[]
  recentActivity: ProjectActivity[]
  milestones: (ProjectMilestone & { done: boolean })[]
  projectProgressPercent: number
  featuresCompleted: number
  totalFeatures: number
  activeProjectsCount: number
}

export function getProjectsData(): ProjectsData {
  return {
    features: prjFeatures,
    team: prjTeam,
    recentActivity: prjRecent,
    milestones: projectMilestones,
    projectProgressPercent: 65,
    featuresCompleted: 13,
    totalFeatures: 20,
    activeProjectsCount: 2,
  }
}
