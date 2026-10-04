-- ==============================================================================
-- 50 DAY SPRINT - Core PostgreSQL Schema Migration
-- Migration: 20260917000001_create_core_schema.sql
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper function for updated_at timestamps
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 1. PROFILES
-- References auth.users(id)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  college TEXT,
  target_role TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------------------------
-- 2. TEAMS
-- Groups of 2–5 members collaborating during the sprint
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  max_members INT NOT NULL DEFAULT 5 CHECK (max_members >= 1 AND max_members <= 10),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------------------------
-- 3. TEAM MEMBERS
-- Membership join table linking users to teams
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_team_member UNIQUE (team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);

-- ------------------------------------------------------------------------------
-- 4. SPRINTS
-- 50-day sprint cycle configuration
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target_hours_daily NUMERIC(4, 1) DEFAULT 4.0 CHECK (target_hours_daily > 0),
  target_hours_weekly NUMERIC(4, 1) DEFAULT 25.0 CHECK (target_hours_weekly > 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sprints_team_id ON public.sprints(team_id);

CREATE TRIGGER update_sprints_updated_at
  BEFORE UPDATE ON public.sprints
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------------------------
-- 5. DAILY CHECKINS
-- Daily study logging per sprint day
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sprint_id UUID NOT NULL REFERENCES public.sprints(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  study_hours NUMERIC(4, 2) NOT NULL DEFAULT 0 CHECK (study_hours >= 0),
  problems_solved_count INT NOT NULL DEFAULT 0 CHECK (problems_solved_count >= 0),
  dsa_completed BOOLEAN NOT NULL DEFAULT FALSE,
  leetcode_completed BOOLEAN NOT NULL DEFAULT FALSE,
  fullstack_completed BOOLEAN NOT NULL DEFAULT FALSE,
  project_completed BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_sprint_date UNIQUE (user_id, sprint_id, checkin_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON public.daily_checkins(user_id, checkin_date);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_sprint_date ON public.daily_checkins(sprint_id, checkin_date);

CREATE TRIGGER update_daily_checkins_updated_at
  BEFORE UPDATE ON public.daily_checkins
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------------------------
-- 6. DSA TOPICS
-- Master topics reference table (17 roadmap topics)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dsa_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  order_index INT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dsa_topics_order ON public.dsa_topics(order_index);

-- ------------------------------------------------------------------------------
-- 7. DSA PROBLEMS
-- Curated practice problems mapped to DSA topics
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dsa_problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.dsa_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_dsa_topic_problem UNIQUE (topic_id, title)
);

CREATE INDEX IF NOT EXISTS idx_dsa_problems_topic_id ON public.dsa_problems(topic_id);

-- ------------------------------------------------------------------------------
-- 8. USER DSA PROGRESS
-- Individual user progress per DSA problem
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_dsa_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.dsa_problems(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Unsolved' CHECK (status IN ('Unsolved', 'Solved', 'Needs Revision')),
  time_taken_minutes INT CHECK (time_taken_minutes IS NULL OR time_taken_minutes >= 0),
  solved_at TIMESTAMPTZ,
  next_revision_due DATE,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_dsa_problem UNIQUE (user_id, problem_id)
);

CREATE INDEX IF NOT EXISTS idx_user_dsa_user_status ON public.user_dsa_progress(user_id, status);

CREATE TRIGGER update_user_dsa_progress_updated_at
  BEFORE UPDATE ON public.user_dsa_progress
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------------------------
-- 9. LEETCODE PROBLEMS
-- Master LeetCode problem library
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leetcode_problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL UNIQUE,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  topic TEXT NOT NULL,
  leetcode_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leetcode_problems_difficulty ON public.leetcode_problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_leetcode_problems_topic ON public.leetcode_problems(topic);

-- ------------------------------------------------------------------------------
-- 10. USER LEETCODE PROGRESS
-- Individual user progress per LeetCode problem
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_leetcode_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.leetcode_problems(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Unsolved' CHECK (status IN ('Unsolved', 'Solved', 'Needs Revision')),
  solved_at TIMESTAMPTZ,
  time_taken_minutes INT CHECK (time_taken_minutes IS NULL OR time_taken_minutes >= 0),
  attempts INT NOT NULL DEFAULT 1 CHECK (attempts >= 1),
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_leetcode_problem UNIQUE (user_id, problem_id)
);

CREATE INDEX IF NOT EXISTS idx_user_leetcode_user_status ON public.user_leetcode_progress(user_id, status);

CREATE TRIGGER update_user_leetcode_progress_updated_at
  BEFORE UPDATE ON public.user_leetcode_progress
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------------------------
-- 11. FULLSTACK MODULES
-- Master reference table for the 5 stages and 23 learning modules
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fullstack_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_name TEXT NOT NULL,
  stage_order INT NOT NULL,
  module_name TEXT NOT NULL,
  module_order INT NOT NULL,
  total_topics INT NOT NULL DEFAULT 1 CHECK (total_topics > 0),
  total_practice_tasks INT NOT NULL DEFAULT 1 CHECK (total_practice_tasks >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_fullstack_stage_module UNIQUE (stage_order, module_order)
);

CREATE INDEX IF NOT EXISTS idx_fullstack_modules_stage ON public.fullstack_modules(stage_order, module_order);

-- ------------------------------------------------------------------------------
-- 12. USER FULLSTACK PROGRESS
-- Individual user progress on each full stack module
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_fullstack_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.fullstack_modules(id) ON DELETE CASCADE,
  completed_topics INT NOT NULL DEFAULT 0 CHECK (completed_topics >= 0),
  completed_tasks INT NOT NULL DEFAULT 0 CHECK (completed_tasks >= 0),
  status TEXT NOT NULL DEFAULT 'IN PROGRESS' CHECK (status IN ('COMPLETED', 'IN PROGRESS', 'UP NEXT')),
  learning_hours NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (learning_hours >= 0),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_fullstack_module UNIQUE (user_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_user_fullstack_user_status ON public.user_fullstack_progress(user_id, status);

CREATE TRIGGER update_user_fullstack_progress_updated_at
  BEFORE UPDATE ON public.user_fullstack_progress
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------------------------
-- 13. PROJECTS
-- Team project milestones and deliverables
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  github_url TEXT,
  live_url TEXT,
  status TEXT NOT NULL DEFAULT 'IN_DEVELOPMENT' CHECK (status IN ('PLANNING', 'IN_DEVELOPMENT', 'IN_REVIEW', 'COMPLETED', 'DEPLOYED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_team_id ON public.projects(team_id);

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------------------------
-- 14. PROJECT TASKS
-- Feature deliverables, backlog items, and assignments
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED')),
  priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  due_date DATE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_tasks_project_status ON public.project_tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned_to ON public.project_tasks(assigned_to);

CREATE TRIGGER update_project_tasks_updated_at
  BEFORE UPDATE ON public.project_tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------------------------
-- 15. TEAM ACTIVITIES
-- Activity stream for team feed (Friends Panel)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_activities_feed ON public.team_activities(team_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- 16. USER SETTINGS
-- User preference toggles, notifications, and theme settings
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  notify_daily_reminder BOOLEAN NOT NULL DEFAULT TRUE,
  notify_missed_checkin BOOLEAN NOT NULL DEFAULT TRUE,
  notify_team_activity BOOLEAN NOT NULL DEFAULT TRUE,
  notify_weekly_summary BOOLEAN NOT NULL DEFAULT TRUE,
  notify_readiness_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  theme TEXT NOT NULL DEFAULT 'Light' CHECK (theme IN ('Light', 'Dark', 'System')),
  compact_mode BOOLEAN NOT NULL DEFAULT FALSE,
  animations BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
