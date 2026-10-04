export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          avatar_url: string | null
          college: string | null
          target_role: string | null
          github_url: string | null
          linkedin_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          college?: string | null
          target_role?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          college?: string | null
          target_role?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          id: string
          name: string
          invite_code: string
          max_members: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          invite_code: string
          max_members?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          invite_code?: string
          max_members?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: "owner" | "member"
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role?: "owner" | "member"
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: "owner" | "member"
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sprints: {
        Row: {
          id: string
          team_id: string
          name: string
          start_date: string
          end_date: string
          target_hours_daily: number
          target_hours_weekly: number
          status: "active" | "completed"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          name: string
          start_date: string
          end_date: string
          target_hours_daily?: number
          target_hours_weekly?: number
          status?: "active" | "completed"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          name?: string
          start_date?: string
          end_date?: string
          target_hours_daily?: number
          target_hours_weekly?: number
          status?: "active" | "completed"
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprints_team_id_fkey"
            columns: ["team_id"]
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_checkins: {
        Row: {
          id: string
          user_id: string
          sprint_id: string
          checkin_date: string
          study_hours: number
          problems_solved_count: number
          dsa_completed: boolean
          leetcode_completed: boolean
          fullstack_completed: boolean
          project_completed: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          sprint_id: string
          checkin_date?: string
          study_hours?: number
          problems_solved_count?: number
          dsa_completed?: boolean
          leetcode_completed?: boolean
          fullstack_completed?: boolean
          project_completed?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          sprint_id?: string
          checkin_date?: string
          study_hours?: number
          problems_solved_count?: number
          dsa_completed?: boolean
          leetcode_completed?: boolean
          fullstack_completed?: boolean
          project_completed?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_checkins_sprint_id_fkey"
            columns: ["sprint_id"]
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_checkins_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dsa_topics: {
        Row: {
          id: string
          name: string
          category: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          order_index?: number
          created_at?: string
        }
        Relationships: []
      }
      dsa_problems: {
        Row: {
          id: string
          topic_id: string
          title: string
          difficulty: "Easy" | "Medium" | "Hard"
          url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          topic_id: string
          title: string
          difficulty: "Easy" | "Medium" | "Hard"
          url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          topic_id?: string
          title?: string
          difficulty?: "Easy" | "Medium" | "Hard"
          url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dsa_problems_topic_id_fkey"
            columns: ["topic_id"]
            referencedRelation: "dsa_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_dsa_progress: {
        Row: {
          id: string
          user_id: string
          problem_id: string
          status: "Unsolved" | "Solved" | "Needs Revision"
          time_taken_minutes: number | null
          solved_at: string | null
          next_revision_due: string | null
          notes: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          problem_id: string
          status?: "Unsolved" | "Solved" | "Needs Revision"
          time_taken_minutes?: number | null
          solved_at?: string | null
          next_revision_due?: string | null
          notes?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          problem_id?: string
          status?: "Unsolved" | "Solved" | "Needs Revision"
          time_taken_minutes?: number | null
          solved_at?: string | null
          next_revision_due?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_dsa_progress_problem_id_fkey"
            columns: ["problem_id"]
            referencedRelation: "dsa_problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_dsa_progress_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leetcode_problems: {
        Row: {
          id: string
          title: string
          difficulty: "Easy" | "Medium" | "Hard"
          topic: string
          leetcode_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          difficulty: "Easy" | "Medium" | "Hard"
          topic: string
          leetcode_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          difficulty?: "Easy" | "Medium" | "Hard"
          topic?: string
          leetcode_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      user_leetcode_progress: {
        Row: {
          id: string
          user_id: string
          problem_id: string
          status: "Unsolved" | "Solved" | "Needs Revision"
          solved_at: string | null
          time_taken_minutes: number | null
          attempts: number
          notes: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          problem_id: string
          status?: "Unsolved" | "Solved" | "Needs Revision"
          solved_at?: string | null
          time_taken_minutes?: number | null
          attempts?: number
          notes?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          problem_id?: string
          status?: "Unsolved" | "Solved" | "Needs Revision"
          solved_at?: string | null
          time_taken_minutes?: number | null
          attempts?: number
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_leetcode_progress_problem_id_fkey"
            columns: ["problem_id"]
            referencedRelation: "leetcode_problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_leetcode_progress_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fullstack_modules: {
        Row: {
          id: string
          stage_name: string
          stage_order: number
          module_name: string
          module_order: number
          total_topics: number
          total_practice_tasks: number
          created_at: string
        }
        Insert: {
          id?: string
          stage_name: string
          stage_order: number
          module_name: string
          module_order: number
          total_topics?: number
          total_practice_tasks?: number
          created_at?: string
        }
        Update: {
          id?: string
          stage_name?: string
          stage_order?: number
          module_name?: string
          module_order?: number
          total_topics?: number
          total_practice_tasks?: number
          created_at?: string
        }
        Relationships: []
      }
      user_fullstack_progress: {
        Row: {
          id: string
          user_id: string
          module_id: string
          completed_topics: number
          completed_tasks: number
          status: "COMPLETED" | "IN PROGRESS" | "UP NEXT"
          learning_hours: number
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          module_id: string
          completed_topics?: number
          completed_tasks?: number
          status?: "COMPLETED" | "IN PROGRESS" | "UP NEXT"
          learning_hours?: number
          completed_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          module_id?: string
          completed_topics?: number
          completed_tasks?: number
          status?: "COMPLETED" | "IN PROGRESS" | "UP NEXT"
          learning_hours?: number
          completed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_fullstack_progress_module_id_fkey"
            columns: ["module_id"]
            referencedRelation: "fullstack_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_fullstack_progress_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          id: string
          team_id: string
          name: string
          description: string | null
          github_url: string | null
          live_url: string | null
          status: "PLANNING" | "IN_DEVELOPMENT" | "IN_REVIEW" | "COMPLETED" | "DEPLOYED"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          name: string
          description?: string | null
          github_url?: string | null
          live_url?: string | null
          status?: "PLANNING" | "IN_DEVELOPMENT" | "IN_REVIEW" | "COMPLETED" | "DEPLOYED"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          name?: string
          description?: string | null
          github_url?: string | null
          live_url?: string | null
          status?: "PLANNING" | "IN_DEVELOPMENT" | "IN_REVIEW" | "COMPLETED" | "DEPLOYED"
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_team_id_fkey"
            columns: ["team_id"]
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          id: string
          project_id: string
          category: string
          title: string
          description: string | null
          assigned_to: string | null
          status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED"
          priority: "LOW" | "MEDIUM" | "HIGH"
          due_date: string | null
          is_completed: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          category: string
          title: string
          description?: string | null
          assigned_to?: string | null
          status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED"
          priority?: "LOW" | "MEDIUM" | "HIGH"
          due_date?: string | null
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          category?: string
          title?: string
          description?: string | null
          assigned_to?: string | null
          status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED"
          priority?: "LOW" | "MEDIUM" | "HIGH"
          due_date?: string | null
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      team_activities: {
        Row: {
          id: string
          team_id: string
          user_id: string
          action_type: string
          target_name: string
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          action_type: string
          target_name: string
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          action_type?: string
          target_name?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_activities_team_id_fkey"
            columns: ["team_id"]
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_activities_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          user_id: string
          notify_daily_reminder: boolean
          notify_missed_checkin: boolean
          notify_team_activity: boolean
          notify_weekly_summary: boolean
          notify_readiness_alerts: boolean
          theme: "Light" | "Dark" | "System"
          compact_mode: boolean
          animations: boolean
          updated_at: string
        }
        Insert: {
          user_id: string
          notify_daily_reminder?: boolean
          notify_missed_checkin?: boolean
          notify_team_activity?: boolean
          notify_weekly_summary?: boolean
          notify_readiness_alerts?: boolean
          theme?: "Light" | "Dark" | "System"
          compact_mode?: boolean
          animations?: boolean
          updated_at?: string
        }
        Update: {
          user_id?: string
          notify_daily_reminder?: boolean
          notify_missed_checkin?: boolean
          notify_team_activity?: boolean
          notify_weekly_summary?: boolean
          notify_readiness_alerts?: boolean
          theme?: "Light" | "Dark" | "System"
          compact_mode?: boolean
          animations?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
