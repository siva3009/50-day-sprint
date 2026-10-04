export type SprintTaskCategory = 'DSA' | 'LEETCODE' | 'FULLSTACK' | 'PROJECT' | 'CS' | 'INTERVIEW' | 'REVIEW';

export type SprintPhase = 'CORE_LEARNING' | 'FINAL_SPRINT';

export type SprintSourceType =
  | 'AUTHORITATIVE_DSA_PLAN'
  | 'FULLSTACK_ROADMAP'
  | 'PROJECT_MILESTONES'
  | 'CS_CORE'
  | 'INTERVIEW_SPRINT'
  | 'SPRINT_REVIEW';

export type TaskDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Mixed';

export interface SprintDayTask {
  id: string;
  day_plan_id: string;
  category: SprintTaskCategory;
  task_order: number;
  title: string;
  description: string | null;
  estimated_minutes: number;
  required: boolean;
  source_type: SprintSourceType;
  source_reference: string;
  difficulty?: TaskDifficulty | null;
  target_value?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SprintDayPlan {
  id: string;
  day_number: number;
  date_offset: number;
  calendar_date: string;
  phase: SprintPhase;
  week_number: number;
  title: string;
  description: string | null;
  source_type: 'AUTHORITATIVE_DSA_PLAN' | 'FINAL_SPRINT_PLAN';
  source_reference: string;
  created_at?: string;
  updated_at?: string;
  tasks?: SprintDayTask[];
}
