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
-- ==============================================================================
-- 50 DAY SPRINT - Row Level Security (RLS) and Access Policies
-- Migration: 20260917000002_enable_rls_and_policies.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- HELPER FUNCTIONS FOR CLEAN, NON-RECURSIVE RLS EVALUATION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_team_member(check_team_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = check_team_id AND user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_team_owner(check_team_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = check_team_id AND user_id = check_user_id AND role = 'owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- ENABLE RLS ON ALL 16 APPLICATION TABLES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dsa_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dsa_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_dsa_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leetcode_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_leetcode_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fullstack_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_fullstack_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 1. PROFILES POLICIES
-- Users can view their own profile and teammates' profiles for the Friends panel.
-- Users can update only their own profile.
-- ------------------------------------------------------------------------------
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM public.team_members tm1
      JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = auth.uid() AND tm2.user_id = profiles.id
    )
  );

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 2. TEAMS POLICIES
-- Authenticated members can read their own teams.
-- Authenticated users can create teams.
-- Owners can update team details.
-- ------------------------------------------------------------------------------
CREATE POLICY "teams_select_member" ON public.teams
  FOR SELECT
  TO authenticated
  USING (public.is_team_member(id, auth.uid()));

CREATE POLICY "teams_insert_authenticated" ON public.teams
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "teams_update_owner" ON public.teams
  FOR UPDATE
  TO authenticated
  USING (public.is_team_owner(id, auth.uid()) OR auth.uid() = created_by)
  WITH CHECK (public.is_team_owner(id, auth.uid()) OR auth.uid() = created_by);

-- ------------------------------------------------------------------------------
-- 3. TEAM MEMBERS POLICIES
-- Users can view members of teams they belong to.
-- Users can join teams or be added by owner.
-- ------------------------------------------------------------------------------
CREATE POLICY "team_members_select" ON public.team_members
  FOR SELECT
  TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));

CREATE POLICY "team_members_insert" ON public.team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    public.is_team_owner(team_id, auth.uid())
  );

CREATE POLICY "team_members_delete" ON public.team_members
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    public.is_team_owner(team_id, auth.uid())
  );

-- ------------------------------------------------------------------------------
-- 4. SPRINTS POLICIES
-- Team members can read and participate in their team's sprints.
-- ------------------------------------------------------------------------------
CREATE POLICY "sprints_select_team" ON public.sprints
  FOR SELECT
  TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));

CREATE POLICY "sprints_insert_team" ON public.sprints
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_team_member(team_id, auth.uid()));

CREATE POLICY "sprints_update_team" ON public.sprints
  FOR UPDATE
  TO authenticated
  USING (public.is_team_member(team_id, auth.uid()))
  WITH CHECK (public.is_team_member(team_id, auth.uid()));

-- ------------------------------------------------------------------------------
-- 5. DAILY CHECKINS POLICIES
-- Users create and edit their own checkins.
-- Teammates can view each other's checkins for daily progress monitoring.
-- ------------------------------------------------------------------------------
CREATE POLICY "daily_checkins_select" ON public.daily_checkins
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.sprints s
      WHERE s.id = daily_checkins.sprint_id AND public.is_team_member(s.team_id, auth.uid())
    )
  );

CREATE POLICY "daily_checkins_insert_own" ON public.daily_checkins
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "daily_checkins_update_own" ON public.daily_checkins
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "daily_checkins_delete_own" ON public.daily_checkins
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 6. DSA TOPICS POLICIES
-- Master syllabus readable by all authenticated users.
-- ------------------------------------------------------------------------------
CREATE POLICY "dsa_topics_select_auth" ON public.dsa_topics
  FOR SELECT
  TO authenticated
  USING (true);

-- ------------------------------------------------------------------------------
-- 7. DSA PROBLEMS POLICIES
-- Master problems library readable by all authenticated users.
-- ------------------------------------------------------------------------------
CREATE POLICY "dsa_problems_select_auth" ON public.dsa_problems
  FOR SELECT
  TO authenticated
  USING (true);

-- ------------------------------------------------------------------------------
-- 8. USER DSA PROGRESS POLICIES
-- Owned by user. Teammates can view progress stats.
-- ------------------------------------------------------------------------------
CREATE POLICY "user_dsa_progress_select" ON public.user_dsa_progress
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.team_members tm1
      JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = auth.uid() AND tm2.user_id = user_dsa_progress.user_id
    )
  );

CREATE POLICY "user_dsa_progress_insert_own" ON public.user_dsa_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_dsa_progress_update_own" ON public.user_dsa_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_dsa_progress_delete_own" ON public.user_dsa_progress
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 9. LEETCODE PROBLEMS POLICIES
-- Master problem library readable by all authenticated users.
-- ------------------------------------------------------------------------------
CREATE POLICY "leetcode_problems_select_auth" ON public.leetcode_problems
  FOR SELECT
  TO authenticated
  USING (true);

-- ------------------------------------------------------------------------------
-- 10. USER LEETCODE PROGRESS POLICIES
-- Owned by user. Teammates can view progress stats.
-- ------------------------------------------------------------------------------
CREATE POLICY "user_leetcode_progress_select" ON public.user_leetcode_progress
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.team_members tm1
      JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = auth.uid() AND tm2.user_id = user_leetcode_progress.user_id
    )
  );

CREATE POLICY "user_leetcode_progress_insert_own" ON public.user_leetcode_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_leetcode_progress_update_own" ON public.user_leetcode_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_leetcode_progress_delete_own" ON public.user_leetcode_progress
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 11. FULLSTACK MODULES POLICIES
-- Master roadmap curriculum readable by all authenticated users.
-- ------------------------------------------------------------------------------
CREATE POLICY "fullstack_modules_select_auth" ON public.fullstack_modules
  FOR SELECT
  TO authenticated
  USING (true);

-- ------------------------------------------------------------------------------
-- 12. USER FULLSTACK PROGRESS POLICIES
-- Owned by user. Teammates can view module stats.
-- ------------------------------------------------------------------------------
CREATE POLICY "user_fullstack_progress_select" ON public.user_fullstack_progress
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.team_members tm1
      JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = auth.uid() AND tm2.user_id = user_fullstack_progress.user_id
    )
  );

CREATE POLICY "user_fullstack_progress_insert_own" ON public.user_fullstack_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_fullstack_progress_update_own" ON public.user_fullstack_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_fullstack_progress_delete_own" ON public.user_fullstack_progress
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 13. PROJECTS POLICIES
-- Team members can read and manage their team projects.
-- ------------------------------------------------------------------------------
CREATE POLICY "projects_select_team" ON public.projects
  FOR SELECT
  TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));

CREATE POLICY "projects_insert_team" ON public.projects
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_team_member(team_id, auth.uid()));

CREATE POLICY "projects_update_team" ON public.projects
  FOR UPDATE
  TO authenticated
  USING (public.is_team_member(team_id, auth.uid()))
  WITH CHECK (public.is_team_member(team_id, auth.uid()));

CREATE POLICY "projects_delete_owner" ON public.projects
  FOR DELETE
  TO authenticated
  USING (public.is_team_owner(team_id, auth.uid()));

-- ------------------------------------------------------------------------------
-- 14. PROJECT TASKS POLICIES
-- Team members can read and manage tasks for their team projects.
-- ------------------------------------------------------------------------------
CREATE POLICY "project_tasks_select_team" ON public.project_tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_tasks.project_id AND public.is_team_member(p.team_id, auth.uid())
    )
  );

CREATE POLICY "project_tasks_insert_team" ON public.project_tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_tasks.project_id AND public.is_team_member(p.team_id, auth.uid())
    )
  );

CREATE POLICY "project_tasks_update_team" ON public.project_tasks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_tasks.project_id AND public.is_team_member(p.team_id, auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_tasks.project_id AND public.is_team_member(p.team_id, auth.uid())
    )
  );

CREATE POLICY "project_tasks_delete_team" ON public.project_tasks
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_tasks.project_id AND public.is_team_member(p.team_id, auth.uid())
    )
  );

-- ------------------------------------------------------------------------------
-- 15. TEAM ACTIVITIES POLICIES
-- Team members can view activity feed. Users insert their own actions.
-- ------------------------------------------------------------------------------
CREATE POLICY "team_activities_select" ON public.team_activities
  FOR SELECT
  TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));

CREATE POLICY "team_activities_insert_own" ON public.team_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    public.is_team_member(team_id, auth.uid())
  );

-- ------------------------------------------------------------------------------
-- 16. USER SETTINGS POLICIES
-- Strictly private to the individual user.
-- ------------------------------------------------------------------------------
CREATE POLICY "user_settings_select_own" ON public.user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_settings_insert_own" ON public.user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_settings_update_own" ON public.user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- AUTH HOOK TRIGGER: AUTOMATIC PROFILE & SETTINGS CREATION ON USER REGISTRATION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'New Member'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- ==============================================================================
-- 50 DAY SPRINT - Master & Reference Seed Data Migration
-- Migration: 20260917000003_seed_reference_data.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SEED DSA TOPICS (17 Roadmap Topics)
-- ------------------------------------------------------------------------------
INSERT INTO public.dsa_topics (name, category, order_index)
VALUES
  ('Arrays', 'FOUNDATION', 1),
  ('Strings', 'FOUNDATION', 2),
  ('Hashing', 'FOUNDATION', 3),
  ('Two Pointers', 'PATTERNS', 4),
  ('Sliding Window', 'PATTERNS', 5),
  ('Linked List', 'LINEAR DATA STRUCTURES', 6),
  ('Stack', 'LINEAR DATA STRUCTURES', 7),
  ('Queue', 'LINEAR DATA STRUCTURES', 8),
  ('Binary Search', 'SEARCH & RECURSION', 9),
  ('Recursion', 'SEARCH & RECURSION', 10),
  ('Trees', 'NON-LINEAR DATA STRUCTURES', 11),
  ('Binary Search Tree', 'NON-LINEAR DATA STRUCTURES', 12),
  ('Heap / Priority Queue', 'NON-LINEAR DATA STRUCTURES', 13),
  ('Graphs', 'NON-LINEAR DATA STRUCTURES', 14),
  ('Greedy', 'ADVANCED ALGORITHMS', 15),
  ('Backtracking', 'ADVANCED ALGORITHMS', 16),
  ('Dynamic Programming', 'ADVANCED ALGORITHMS', 17)
ON CONFLICT (order_index) DO UPDATE
SET name = EXCLUDED.name, category = EXCLUDED.category;

-- ------------------------------------------------------------------------------
-- 2. SEED MASTER DSA PROBLEMS (From frontend mock curriculum)
-- ------------------------------------------------------------------------------
INSERT INTO public.dsa_problems (topic_id, title, difficulty, url)
SELECT t.id, p.title, p.difficulty, p.url
FROM (VALUES
  ('Arrays', 'Two Sum', 'Easy', 'https://leetcode.com/problems/two-sum/'),
  ('Arrays', 'Maximum Subarray', 'Medium', 'https://leetcode.com/problems/maximum-subarray/'),
  ('Stack', 'Valid Parentheses', 'Easy', 'https://leetcode.com/problems/valid-parentheses/'),
  ('Binary Search', 'Binary Search', 'Easy', 'https://leetcode.com/problems/binary-search/'),
  ('Sliding Window', 'Longest Substring Without Repeating Characters', 'Medium', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/'),
  ('Two Pointers', '3Sum', 'Medium', 'https://leetcode.com/problems/3sum/'),
  ('Linked List', 'Reverse Linked List', 'Easy', 'https://leetcode.com/problems/reverse-linked-list/'),
  ('Trees', 'Invert Binary Tree', 'Easy', 'https://leetcode.com/problems/invert-binary-tree/'),
  ('Graphs', 'Number of Islands', 'Medium', 'https://leetcode.com/problems/number-of-islands/'),
  ('Dynamic Programming', 'Climbing Stairs', 'Easy', 'https://leetcode.com/problems/climbing-stairs/')
) AS p(topic_name, title, difficulty, url)
JOIN public.dsa_topics t ON t.name = p.topic_name
ON CONFLICT (topic_id, title) DO UPDATE
SET difficulty = EXCLUDED.difficulty, url = EXCLUDED.url;

-- ------------------------------------------------------------------------------
-- 3. SEED MASTER LEETCODE PROBLEMS (From frontend mock problems directory)
-- ------------------------------------------------------------------------------
INSERT INTO public.leetcode_problems (title, difficulty, topic, leetcode_url)
VALUES
  ('Two Sum', 'Easy', 'Arrays', 'https://leetcode.com/problems/two-sum/'),
  ('Valid Parentheses', 'Easy', 'Stack', 'https://leetcode.com/problems/valid-parentheses/'),
  ('Binary Search', 'Easy', 'Binary Search', 'https://leetcode.com/problems/binary-search/'),
  ('Longest Substring Without Repeating Characters', 'Medium', 'Sliding Window', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/'),
  ('3Sum', 'Medium', 'Two Pointers', 'https://leetcode.com/problems/3sum/'),
  ('Merge Two Sorted Lists', 'Easy', 'Linked List', 'https://leetcode.com/problems/merge-two-sorted-lists/'),
  ('Best Time to Buy and Sell Stock', 'Easy', 'Arrays', 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/'),
  ('Valid Anagram', 'Easy', 'Hashing', 'https://leetcode.com/problems/valid-anagram/'),
  ('Invert Binary Tree', 'Easy', 'Trees', 'https://leetcode.com/problems/invert-binary-tree/'),
  ('Maximum Depth of Binary Tree', 'Easy', 'Trees', 'https://leetcode.com/problems/maximum-depth-of-binary-tree/')
ON CONFLICT (title) DO UPDATE
SET difficulty = EXCLUDED.difficulty, topic = EXCLUDED.topic, leetcode_url = EXCLUDED.leetcode_url;

-- ------------------------------------------------------------------------------
-- 4. SEED FULLSTACK MODULES (5 Stages, 23 Modules)
-- ------------------------------------------------------------------------------
INSERT INTO public.fullstack_modules (stage_name, stage_order, module_name, module_order, total_topics, total_practice_tasks)
VALUES
  -- Stage 01 — FRONTEND FUNDAMENTALS
  ('STAGE 01 — FRONTEND FUNDAMENTALS', 1, 'HTML', 1, 12, 8),
  ('STAGE 01 — FRONTEND FUNDAMENTALS', 1, 'CSS', 2, 15, 10),
  ('STAGE 01 — FRONTEND FUNDAMENTALS', 1, 'Responsive Design', 3, 8, 5),
  ('STAGE 01 — FRONTEND FUNDAMENTALS', 1, 'JavaScript', 4, 24, 15),

  -- Stage 02 — MODERN FRONTEND
  ('STAGE 02 — MODERN FRONTEND', 2, 'React', 1, 23, 10),
  ('STAGE 02 — MODERN FRONTEND', 2, 'Components', 2, 10, 5),
  ('STAGE 02 — MODERN FRONTEND', 2, 'State Management', 3, 14, 8),
  ('STAGE 02 — MODERN FRONTEND', 2, 'Hooks', 4, 12, 6),
  ('STAGE 02 — MODERN FRONTEND', 2, 'Routing', 5, 8, 4),

  -- Stage 03 — BACKEND
  ('STAGE 03 — BACKEND', 3, 'Node.js', 1, 16, 10),
  ('STAGE 03 — BACKEND', 3, 'Express', 2, 12, 8),
  ('STAGE 03 — BACKEND', 3, 'REST APIs', 3, 10, 6),
  ('STAGE 03 — BACKEND', 3, 'Authentication', 4, 14, 8),
  ('STAGE 03 — BACKEND', 3, 'Validation', 5, 8, 4),

  -- Stage 04 — DATABASE
  ('STAGE 04 — DATABASE', 4, 'SQL', 1, 14, 8),
  ('STAGE 04 — DATABASE', 4, 'PostgreSQL', 2, 10, 6),
  ('STAGE 04 — DATABASE', 4, 'Database Design', 3, 12, 6),
  ('STAGE 04 — DATABASE', 4, 'ORM', 4, 10, 5),

  -- Stage 05 — PRODUCTION
  ('STAGE 05 — PRODUCTION', 5, 'Git / GitHub', 1, 8, 4),
  ('STAGE 05 — PRODUCTION', 5, 'Testing', 2, 12, 6),
  ('STAGE 05 — PRODUCTION', 5, 'Deployment', 3, 10, 5),
  ('STAGE 05 — PRODUCTION', 5, 'Environment Variables', 4, 6, 3),
  ('STAGE 05 — PRODUCTION', 5, 'CI/CD Basics', 5, 8, 4)
ON CONFLICT (stage_order, module_order) DO UPDATE
SET
  stage_name = EXCLUDED.stage_name,
  module_name = EXCLUDED.module_name,
  total_topics = EXCLUDED.total_topics,
  total_practice_tasks = EXCLUDED.total_practice_tasks;
-- ==============================================================================
-- 50 DAY SPRINT - Team Capacity Enforcement & Atomic Team Workflows
-- Migration: 20260917000004_enforce_team_capacity_and_join_rpc.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. DATABASE-LEVEL TEAM CAPACITY ENFORCEMENT
-- Trigger prevents inserting more members than team's max_members (default 5)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_team_capacity()
RETURNS TRIGGER AS $$
DECLARE
  v_current_count INT;
  v_max_members INT;
BEGIN
  SELECT COUNT(*) INTO v_current_count
  FROM public.team_members
  WHERE team_id = NEW.team_id;

  SELECT COALESCE(max_members, 5) INTO v_max_members
  FROM public.teams
  WHERE id = NEW.team_id;

  IF v_current_count >= v_max_members THEN
    RAISE EXCEPTION 'Team is full. Maximum allowed members reached.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_team_capacity ON public.team_members;
CREATE TRIGGER trigger_check_team_capacity
  BEFORE INSERT ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.check_team_capacity();

-- ------------------------------------------------------------------------------
-- 2. ATOMIC JOIN TEAM RPC FUNCTION
-- Safely validates code, capacity, and duplicate membership in one transaction
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.join_team_by_code(p_invite_code TEXT)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_team RECORD;
  v_member_count INT;
  v_user_name TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  -- 1. Look up team by invite code (case-insensitive)
  SELECT * INTO v_team
  FROM public.teams
  WHERE UPPER(invite_code) = UPPER(TRIM(p_invite_code));

  IF v_team IS NULL THEN
    RAISE EXCEPTION 'Invalid team code.';
  END IF;

  -- 2. Check if already a member
  IF EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = v_team.id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'You are already a member of this team.';
  END IF;

  -- 3. Check capacity
  SELECT COUNT(*) INTO v_member_count
  FROM public.team_members
  WHERE team_id = v_team.id;

  IF v_member_count >= v_team.max_members THEN
    RAISE EXCEPTION 'Team is full.';
  END IF;

  -- 4. Add member
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (v_team.id, v_user_id, 'member');

  -- 5. Record activity
  SELECT COALESCE(full_name, 'A new member') INTO v_user_name
  FROM public.profiles
  WHERE id = v_user_id;

  INSERT INTO public.team_activities (team_id, user_id, action_type, target_name)
  VALUES (v_team.id, v_user_id, 'MEMBER_JOINED', COALESCE(v_user_name, 'Member') || ' joined the team');

  RETURN jsonb_build_object(
    'team_id', v_team.id,
    'team_name', v_team.name,
    'role', 'member'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 3. ATOMIC CREATE TEAM WITH SPRINT RPC FUNCTION
-- Creates team, sets owner, initializes 50-day sprint, and logs activity
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_team_with_sprint(
  p_team_name TEXT,
  p_sprint_name TEXT DEFAULT '50 Day Sprint',
  p_start_date DATE DEFAULT CURRENT_DATE,
  p_daily_hours NUMERIC DEFAULT 4.0,
  p_weekly_hours NUMERIC DEFAULT 25.0
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_team_id UUID;
  v_sprint_id UUID;
  v_invite_code TEXT;
  v_end_date DATE;
  v_user_name TEXT;
  v_attempts INT := 0;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  IF TRIM(p_team_name) = '' THEN
    RAISE EXCEPTION 'Team name cannot be empty.';
  END IF;

  -- Calculate end date as exactly 50 calendar days inclusive (start_date + 49 days)
  v_end_date := p_start_date + 49;

  -- Generate unique 6-character uppercase invite code
  LOOP
    v_invite_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.teams WHERE invite_code = v_invite_code);
    v_attempts := v_attempts + 1;
    IF v_attempts > 100 THEN
      RAISE EXCEPTION 'Could not generate unique invite code. Please try again.';
    END IF;
  END LOOP;

  -- 1. Create team
  INSERT INTO public.teams (name, invite_code, max_members, created_by)
  VALUES (TRIM(p_team_name), v_invite_code, 5, v_user_id)
  RETURNING id INTO v_team_id;

  -- 2. Add creator as owner
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (v_team_id, v_user_id, 'owner');

  -- 3. Create 50-day sprint
  INSERT INTO public.sprints (
    team_id,
    name,
    start_date,
    end_date,
    target_hours_daily,
    target_hours_weekly,
    status
  )
  VALUES (
    v_team_id,
    COALESCE(NULLIF(TRIM(p_sprint_name), ''), '50 Day Sprint'),
    p_start_date,
    v_end_date,
    COALESCE(p_daily_hours, 4.0),
    COALESCE(p_weekly_hours, 25.0),
    'active'
  )
  RETURNING id INTO v_sprint_id;

  -- 4. Record team creation activity
  SELECT COALESCE(full_name, 'Owner') INTO v_user_name
  FROM public.profiles
  WHERE id = v_user_id;

  INSERT INTO public.team_activities (team_id, user_id, action_type, target_name)
  VALUES (v_team_id, v_user_id, 'TEAM_CREATED', COALESCE(v_user_name, 'Owner') || ' created ' || TRIM(p_team_name));

  INSERT INTO public.team_activities (team_id, user_id, action_type, target_name)
  VALUES (v_team_id, v_user_id, 'SPRINT_INITIALIZED', '50 Day Sprint initialized');

  RETURN jsonb_build_object(
    'team_id', v_team_id,
    'team_name', TRIM(p_team_name),
    'invite_code', v_invite_code,
    'sprint_id', v_sprint_id,
    'start_date', p_start_date,
    'end_date', v_end_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

