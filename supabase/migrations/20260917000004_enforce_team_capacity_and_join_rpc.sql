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
