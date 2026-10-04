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
