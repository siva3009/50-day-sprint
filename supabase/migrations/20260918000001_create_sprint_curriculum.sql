-- ==============================================================================
-- 50 DAY SPRINT - Official 50-Day Curriculum Migration
-- Migration: 20260918000001_create_sprint_curriculum.sql
-- Start Date: September 28, 2026 (Day 1) -> End Date: November 16, 2026 (Day 50)
-- Schema: sprint_day_plans + sprint_day_tasks with complete source attribution,
--         difficulty levels, target values, and authenticated-only RLS.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SPRINT DAY PLANS TABLE
-- Defines the primary milestone, phase, calendar date, source attribution, and week for all 50 days
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sprint_day_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number INT NOT NULL UNIQUE CHECK (day_number >= 1 AND day_number <= 50),
  date_offset INT NOT NULL CHECK (date_offset >= 0 AND date_offset <= 49),
  calendar_date DATE NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('CORE_LEARNING', 'FINAL_SPRINT')),
  week_number INT NOT NULL CHECK (week_number >= 1 AND week_number <= 8),
  title TEXT NOT NULL,
  description TEXT,
  source_type TEXT NOT NULL DEFAULT 'AUTHORITATIVE_DSA_PLAN' CHECK (source_type IN ('AUTHORITATIVE_DSA_PLAN', 'FINAL_SPRINT_PLAN')),
  source_reference TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. SPRINT DAY TASKS TABLE
-- Granular multi-track tasks for each day plan across DSA, LeetCode, Full Stack, Project, CS
-- Supporting explicit source attribution, difficulty, target values, and deterministic ordering
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sprint_day_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_plan_id UUID NOT NULL REFERENCES public.sprint_day_plans(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('DSA', 'LEETCODE', 'FULLSTACK', 'PROJECT', 'CS', 'INTERVIEW', 'REVIEW')),
  task_order INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  estimated_minutes INT NOT NULL DEFAULT 30,
  required BOOLEAN NOT NULL DEFAULT true,
  source_type TEXT NOT NULL CHECK (source_type IN ('AUTHORITATIVE_DSA_PLAN', 'FULLSTACK_ROADMAP', 'PROJECT_MILESTONES', 'CS_CORE', 'INTERVIEW_SPRINT', 'SPRINT_REVIEW')),
  source_reference TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IS NULL OR difficulty IN ('Easy', 'Medium', 'Hard', 'Mixed')),
  target_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_sprint_day_task_order UNIQUE (day_plan_id, category, task_order)
);

-- ------------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS)
-- Read-only reference data accessible only by authenticated users.
-- Direct mutation (INSERT, UPDATE, DELETE) is prevented for normal users.
-- ------------------------------------------------------------------------------
ALTER TABLE public.sprint_day_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprint_day_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sprint_day_plans_select_authenticated" ON public.sprint_day_plans;
CREATE POLICY "sprint_day_plans_select_authenticated" ON public.sprint_day_plans
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "sprint_day_tasks_select_authenticated" ON public.sprint_day_tasks;
CREATE POLICY "sprint_day_tasks_select_authenticated" ON public.sprint_day_tasks
  FOR SELECT
  TO authenticated
  USING (true);

-- ------------------------------------------------------------------------------
-- 4. SEED 50-DAY OFFICIAL CURRICULUM
-- ------------------------------------------------------------------------------

-- Day 1 Plan (2026-09-28)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (1, 0, '2026-09-28', 'CORE_LEARNING', 1, 'Python for DSA: Basics, Operators & Big O Analysis', 'Master Python syntax essentials for problem solving and foundational Time & Space complexity analysis.', 'AUTHORITATIVE_DSA_PLAN', 'Week 1: Python + Arrays + Hashing')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 1 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 1);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Python Basics & Big O', 'Variables, operators, conditionals, loops, functions. Understand Time & Space Complexity (Big O notation).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 1: Python + Arrays + Hashing (DSA Core)', 'Easy', '1 Concept'),
  ('LEETCODE', 2, 'Array Iteration Practice', 'Solve 2 Easy array warmup problems: Two Sum (LeetCode 1), Running Sum of 1d Array (LeetCode 1480).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 1, LeetCode 1480', 'Easy', '2 problems'),
  ('FULLSTACK', 3, 'HTML5 Semantic Structure', 'Semantic tags, forms, input validations, accessibility foundations.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 1: Frontend Foundations', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Project Ideation & Architecture', 'Define sprint project scope, create repository, and establish branch conventions.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 1', 'Medium', '1 Milestone'),
  ('CS', 5, 'Computer Architecture & Memory Basics', 'CPU registers, RAM allocation, stack vs heap memory in program execution.', 30, false, 'CS_CORE', 'Computer Science Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 1;

-- Day 2 Plan (2026-09-29)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (2, 1, '2026-09-29', 'CORE_LEARNING', 1, 'Python Data Structures & Array Prefix Sum', 'Deep dive into Python native collections and array prefix sum pattern.', 'AUTHORITATIVE_DSA_PLAN', 'Week 1: Python + Arrays + Hashing')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 2 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 2);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Python Strings, Lists & Prefix Sum', 'Lists, Tuples, Sets, Dictionaries. Array traversal and Prefix Sum technique.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 1: Python + Arrays + Hashing (DSA Core)', 'Easy', '1 Concept'),
  ('LEETCODE', 2, 'Prefix Sum & Array Math', 'Solve: Range Sum Query (LeetCode 303), Find Pivot Index (LeetCode 724).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 303, LeetCode 724', 'Easy', '2 problems'),
  ('FULLSTACK', 3, 'CSS Modern Layouts: Flexbox & Grid', 'Container properties, alignment, responsive layout modeling, CSS custom properties.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 1: Frontend Foundations', 'Medium', '1 Module'),
  ('PROJECT', 4, 'UI Design Tokens & Tailwind Setup', 'Establish design token system, configure Tailwind colors, fonts, and base styles.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 1', 'Medium', '1 Milestone'),
  ('CS', 5, 'OS: Processes vs Threads', 'Process lifecycle, PCB, context switching, multithreading fundamentals.', 30, false, 'CS_CORE', 'Operating Systems Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 2;

-- Day 3 Plan (2026-09-30)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (3, 2, '2026-09-30', 'CORE_LEARNING', 1, 'Two Pointers Pattern & Python Comprehensions', 'Learn list comprehension, lambda functions, and the Two Pointers algorithmic pattern.', 'AUTHORITATIVE_DSA_PLAN', 'Week 1: Python + Arrays + Hashing')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 3 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 3);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'List Comprehensions & Two Pointers', 'List comprehension, lambda, built-in functions (zip, enumerate, map). Two Pointers technique on sorted arrays.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 1: Python + Arrays + Hashing (DSA Core)', 'Easy', '1 Concept'),
  ('LEETCODE', 2, 'Two Pointers Problems', 'Solve: Valid Palindrome (LeetCode 125 - Easy), Two Sum II - Input Array Is Sorted (LeetCode 167 - Medium).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 125, LeetCode 167', 'Mixed', '2 problems'),
  ('FULLSTACK', 3, 'Responsive Design & Media Queries', 'Mobile-first design principles, fluid typography, viewport breakpoints.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 1: Frontend Foundations', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Navigation Shell & Layout Component', 'Build responsive sidebar, top navigation bar, and main container grid.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 1', 'Medium', '1 Milestone'),
  ('CS', 5, 'OS: Process Scheduling Algorithms', 'FCFS, SJF, Round Robin, Priority scheduling tradeoffs.', 30, false, 'CS_CORE', 'Operating Systems Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 3;

-- Day 4 Plan (2026-10-01)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (4, 3, '2026-10-01', 'CORE_LEARNING', 1, 'Sliding Window Pattern & Python Collections', 'Master fixed and dynamic sliding window patterns using collections.deque and Counter.', 'AUTHORITATIVE_DSA_PLAN', 'Week 1: Python + Arrays + Hashing')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 4 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 4);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Python Collections & Sliding Window', 'collections module: defaultdict, Counter, deque. Fixed and dynamic sliding window patterns.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 1: Python + Arrays + Hashing (DSA Core)', 'Easy', '1 Concept'),
  ('LEETCODE', 2, 'Sliding Window Problems', 'Solve: Maximum Average Subarray I (LeetCode 643 - Easy), Maximum Number of Vowels in Substring (LeetCode 1456 - Medium).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 643, LeetCode 1456', 'Mixed', '2 problems'),
  ('FULLSTACK', 3, 'Modern JavaScript: ES6+ Essentials', 'Destructuring, spread/rest, arrow functions, template literals, optional chaining.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 1: Frontend Foundations', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Shared UI Card & Button Components', 'Create reusable button variants, status tags, and metric card templates.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 1', 'Medium', '1 Milestone'),
  ('CS', 5, 'OS: Inter-Process Communication (IPC)', 'Pipes, shared memory, message queues, sockets, race conditions.', 30, false, 'CS_CORE', 'Operating Systems Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 4;

-- Day 5 Plan (2026-10-02)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (5, 4, '2026-10-02', 'CORE_LEARNING', 1, 'Kadane''s Algorithm & Python Custom Sorting', 'Learn Kadane''s algorithm for maximum subarray and custom sorting techniques.', 'AUTHORITATIVE_DSA_PLAN', 'Week 1: Python + Arrays + Hashing')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 5 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 5);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Kadane''s Algorithm & Python Sort', 'Python sort() vs sorted(), key functions, itertools. Kadane''s algorithm for maximum subarray sum.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 1: Python + Arrays + Hashing (DSA Core)', 'Easy', '1 Concept'),
  ('LEETCODE', 2, 'Subarray Optimization Problems', 'Solve: Maximum Subarray (LeetCode 53 - Medium), Best Time to Buy and Sell Stock (LeetCode 121 - Easy).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 53, LeetCode 121', 'Mixed', '2 problems'),
  ('FULLSTACK', 3, 'Async JavaScript: Promises & Async/Await', 'Event loop, callback queue, microtasks, Promise chaining, async/await error handling.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 1: Frontend Foundations', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Mock Service Layer Setup', 'Establish modular service interface and mock data fixtures for feature views.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 1', 'Medium', '1 Milestone'),
  ('CS', 5, 'OS: Synchronization & Deadlocks', 'Mutex, semaphores, critical section, 4 conditions for deadlock, avoidance.', 30, false, 'CS_CORE', 'Operating Systems Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 5;

-- Day 6 Plan (2026-10-03)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (6, 5, '2026-10-03', 'CORE_LEARNING', 1, 'Hashing Patterns & Interval Merging', 'Master HashMap/HashSet frequency counting and interval merging patterns.', 'AUTHORITATIVE_DSA_PLAN', 'Week 1: Python + Arrays + Hashing')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 6 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 6);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Hashing Patterns & Intervals', 'HashMap/Dictionary, HashSet, frequency counting, prefix hashing. Interval sorting and merging logic.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 1: Python + Arrays + Hashing (DSA Core)', 'Easy', '1 Concept'),
  ('LEETCODE', 2, 'Hashing & Interval Problems', 'Solve: Contains Duplicate (LeetCode 217 - Easy), Merge Intervals (LeetCode 56 - Medium).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 217, LeetCode 56', 'Mixed', '2 problems'),
  ('FULLSTACK', 3, 'DOM Manipulation & Event Architecture', 'Event bubbling, capturing, delegation, custom events, passive listeners.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 1: Frontend Foundations', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Dashboard View Implementation', 'Assemble overview statistics card, readiness gauge, and recent activity list.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 1', 'Medium', '1 Milestone'),
  ('CS', 5, 'OS: Virtual Memory & Paging', 'Page table, TLB, page faults, FIFO vs LRU page replacement policies.', 30, false, 'CS_CORE', 'Operating Systems Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 6;

-- Day 7 Plan (2026-10-04)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (7, 6, '2026-10-04', 'CORE_LEARNING', 1, 'Week 1 Review & Mixed Problem Solving', 'Consolidate Week 1: Arrays, Hashing, Two Pointers, and Python DSA foundations. Verify target (15+ problems).', 'AUTHORITATIVE_DSA_PLAN', 'Week 1: Python + Arrays + Hashing')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 7 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 7);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Week 1 Patterns Review & Revision', 'Revise Big O analysis, Prefix Sum, Two Pointers, Sliding Window, and Hashing templates.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 1: Python + Arrays + Hashing (DSA Core)', 'Easy', '1 Concept'),
  ('LEETCODE', 2, 'Timed Problem Set (2 Mediums)', 'Solve: 3Sum (LeetCode 15 - Medium), Group Anagrams (LeetCode 49 - Medium). Verify 15+ target.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 15, LeetCode 49', 'Medium', '2 problems'),
  ('FULLSTACK', 3, 'Web Storage & Fetch API', 'localStorage, sessionStorage, cookie security (HttpOnly, SameSite), Fetch API wrapper.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 1: Frontend Foundations', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Week 1 Milestone Review', 'Review frontend scaffolding, commit progress, verify clean build with zero errors.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 1', 'Medium', '1 Milestone'),
  ('REVIEW', 5, 'Weekly Progress & Mistake Notebook', 'Document non-optimal approaches, time complexity traps, and solution notes.', 30, true, 'SPRINT_REVIEW', 'Week 1: Python + Arrays + Hashing Review', NULL, 'Sprint Assessment')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 7;

-- Day 8 Plan (2026-10-05)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (8, 7, '2026-10-05', 'CORE_LEARNING', 2, 'Strings: Frequency, Palindromes & Anagrams', 'String manipulation patterns, character counts, and anagram verification.', 'AUTHORITATIVE_DSA_PLAN', 'Week 2: Strings + Linked List + Stack + Queue')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 8 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 8);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'String Manipulation & Frequency Count', 'String immutability in Python, ASCII/Unicode, join vs concatenation, anagram detection.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 2: Strings + Linked List + Stack + Queue (DSA Core)', 'Easy', '1 Concept'),
  ('LEETCODE', 2, 'String Fundamentals Problems', 'Solve: Valid Anagram (LeetCode 242 - Easy), Longest Common Prefix (LeetCode 14 - Easy).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 242, LeetCode 14', 'Easy', '2 problems'),
  ('FULLSTACK', 3, 'React Foundations & JSX Compilation', 'Virtual DOM, JSX transformation, component lifecycle, unidirectional data flow.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 1: Frontend Foundations', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Auth Screen UI & Form Binding', 'Implement Sign In / Sign Up tabbed view, client-side email/password validations.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 1', 'Medium', '1 Milestone'),
  ('CS', 5, 'DBMS: Relational Model & Keys', 'Primary keys, foreign keys, candidate keys, super keys, composite keys.', 30, false, 'CS_CORE', 'Operating Systems Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 8;

-- Day 9 Plan (2026-10-06)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (9, 8, '2026-10-06', 'CORE_LEARNING', 2, 'Strings: Pattern Matching & Substrings', 'Sliding window on strings and longest substring without repeating characters.', 'AUTHORITATIVE_DSA_PLAN', 'Week 2: Strings + Linked List + Stack + Queue')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 9 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 9);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Substrings & String Window Patterns', 'Substrings vs subsequences, sliding window on strings with set/map tracking.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 2: Strings + Linked List + Stack + Queue (DSA Core)', 'Easy', '1 Concept'),
  ('LEETCODE', 2, 'Substring Medium Problems', 'Solve: Longest Substring Without Repeating Characters (LeetCode 3 - Medium), Longest Repeating Character Replacement (LeetCode 424 - Medium).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 3, LeetCode 424', 'Medium', '2 problems'),
  ('FULLSTACK', 3, 'React Props, State & Component Purity', 'Props drilling, pure components, lifting state up, immutable state updates.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 1: Frontend Foundations', 'Medium', '1 Module'),
  ('PROJECT', 4, 'DSA Topic Roadmap View', 'Build DSA topic progress cards, topic status chips (In Progress / Completed).', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 1', 'Medium', '1 Milestone'),
  ('CS', 5, 'DBMS: Entity-Relationship (ER) Modeling', 'Cardinality (1:1, 1:N, M:N), ER diagram symbols, conversion to relational schema.', 30, false, 'CS_CORE', 'DBMS & SQL Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 9;

-- Day 10 Plan (2026-10-07)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (10, 9, '2026-10-07', 'CORE_LEARNING', 2, 'Singly Linked List: Traversal, Insertion & Deletion', 'Foundations of pointer-based data structures, node definitions, and operations.', 'AUTHORITATIVE_DSA_PLAN', 'Week 2: Strings + Linked List + Stack + Queue')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 10 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 10);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Linked List Node Operations', 'Singly Linked List implementation in Python, pointer manipulation, sentinel / dummy nodes.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 2: Strings + Linked List + Stack + Queue (DSA Core)', 'Easy', '1 Concept'),
  ('LEETCODE', 2, 'Linked List Basics', 'Solve: Delete Node in a Linked List (LeetCode 237 - Medium), Remove Linked List Elements (LeetCode 203 - Easy).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 237, LeetCode 203', 'Mixed', '2 problems'),
  ('FULLSTACK', 3, 'React Hooks: useState & useEffect Deep Dive', 'Render cycles, dependency arrays, stale closures, cleanup functions.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 1: Frontend Foundations', 'Medium', '1 Module'),
  ('PROJECT', 4, 'LeetCode Problem Tracker View', 'Implement problem table with difficulty filters (Easy/Medium/Hard) and search.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 1', 'Mixed', '1 Milestone'),
  ('CS', 5, 'DBMS: SQL DDL & DML Fundamentals', 'CREATE, ALTER, DROP, TRUNCATE, INSERT, UPDATE, DELETE, constraints.', 30, false, 'CS_CORE', 'DBMS & SQL Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 10;

-- Day 11 Plan (2026-10-08)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (11, 10, '2026-10-08', 'CORE_LEARNING', 2, 'Linked List Patterns: Reversal & Fast/Slow Pointers', 'In-place linked list reversal, finding midpoints, and cycle detection.', 'AUTHORITATIVE_DSA_PLAN', 'Week 2: Strings + Linked List + Stack + Queue')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 11 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 11);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Reverse & Two Pointer Linked List', 'In-place list reversal algorithm. Fast & slow pointers (Floyd''s Cycle Detection algorithm).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 2: Strings + Linked List + Stack + Queue (DSA Core)', 'Easy', '1 Concept'),
  ('LEETCODE', 2, 'Classic Linked List Problems', 'Solve: Reverse Linked List (LeetCode 206 - Easy), Linked List Cycle (LeetCode 141 - Easy), Middle of the Linked List (LeetCode 876 - Easy).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 206, LeetCode 141, LeetCode 876', 'Easy', '3 problems'),
  ('FULLSTACK', 3, 'React Advanced Hooks: useMemo & useCallback', 'Memoization in React, referential equality, avoiding unnecessary re-renders.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 1: Frontend Foundations', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Full Stack Roadmap Accordion', 'Build 5-stage accordion containing modules, task counts, and completion bars.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 2', 'Medium', '1 Milestone'),
  ('CS', 5, 'DBMS: SQL Joins & Subqueries', 'INNER, LEFT, RIGHT, FULL OUTER, CROSS JOIN, correlated subqueries.', 30, false, 'CS_CORE', 'Operating Systems Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 11;

-- Day 12 Plan (2026-10-09)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (12, 11, '2026-10-09', 'CORE_LEARNING', 2, 'Stack: LIFO Principles & Parentheses Matching', 'Stack implementation, balanced brackets, and auxiliary MinStack design.', 'AUTHORITATIVE_DSA_PLAN', 'Week 2: Strings + Linked List + Stack + Queue')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 12 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 12);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Stack Fundamentals & Min Stack', 'Stack implementation via lists and collections.deque. Min Stack design (constant time min retrieval).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 2: Strings + Linked List + Stack + Queue (DSA Core)', 'Easy', '1 Concept'),
  ('LEETCODE', 2, 'Stack Classic Problems', 'Solve: Valid Parentheses (LeetCode 20 - Easy), Min Stack (LeetCode 155 - Medium).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 20, LeetCode 155', 'Mixed', '2 problems'),
  ('FULLSTACK', 3, 'React useRef & DOM Imperative Controls', 'Uncontrolled inputs, persisting values across renders without re-rendering, forwardRef.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 1: Frontend Foundations', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Projects Kanban / Milestone Cards', 'Build project category list with task checkboxes and progress percentages.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 2', 'Medium', '1 Milestone'),
  ('CS', 5, 'DBMS: Aggregations & Window Functions', 'GROUP BY, HAVING, COUNT, SUM, AVG, ROW_NUMBER(), RANK(), DENSE_RANK().', 30, false, 'CS_CORE', 'DBMS & SQL Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 12;

-- Day 13 Plan (2026-10-10)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (13, 12, '2026-10-10', 'CORE_LEARNING', 2, 'Monotonic Stack & Queue FIFO Fundamentals', 'Next Greater Element pattern and Queue implementations.', 'AUTHORITATIVE_DSA_PLAN', 'Week 2: Strings + Linked List + Stack + Queue')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 13 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 13);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Monotonic Stack & Queue Types', 'Next Greater Element concept, monotonic increasing/decreasing stacks. Queue basics, Circular Queue, Deque.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 2: Strings + Linked List + Stack + Queue (DSA Core)', 'Easy', '1 Concept'),
  ('LEETCODE', 2, 'Monotonic Stack Problems', 'Solve: Next Greater Element I (LeetCode 496 - Easy), Daily Temperatures (LeetCode 739 - Medium).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 496, LeetCode 739', 'Mixed', '2 problems'),
  ('FULLSTACK', 3, 'React Context API for Global State', 'Creating context, provider pattern, consuming context with useContext, custom hooks.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 1: Frontend Foundations', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Analytics Trajectory Charts', 'Integrate Recharts area and bar charts for 50-day trajectory visual analytics.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 2', 'Medium', '1 Milestone'),
  ('CS', 5, 'DBMS: ACID Properties & Transactions', 'Atomicity, Consistency, Isolation, Durability. Transaction states and commit/rollback.', 30, false, 'CS_CORE', 'DBMS & SQL Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 13;

-- Day 14 Plan (2026-10-11)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (14, 13, '2026-10-11', 'CORE_LEARNING', 2, 'Queue Patterns & Week 2 Consolidation', 'Queue using stacks, BFS introduction, and Week 2 review. Verify 15-18 problems total.', 'AUTHORITATIVE_DSA_PLAN', 'Week 2: Strings + Linked List + Stack + Queue')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 14 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 14);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Queue using Stack & BFS Warmup', 'Implementing queue using two stacks. Introduction to Level-order / Breadth-First traversal logic.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 2: Strings + Linked List + Stack + Queue (DSA Core)', 'Easy', '1 Concept'),
  ('LEETCODE', 2, 'Queue & List Review Set', 'Solve: Implement Queue using Stacks (LeetCode 232 - Easy), Merge Two Sorted Lists (LeetCode 21 - Easy). Verify Week 2 target (15-18).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 232, LeetCode 21', 'Easy', '2 problems'),
  ('FULLSTACK', 3, 'Custom React Hooks Architecture', 'Extracting reusable business logic: useAuth, useTeam, useLocalStorage.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 1: Frontend Foundations', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Settings View Implementation', 'Build Profile, Sprint preferences, Team code, and Notification preference tabs.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 2', 'Medium', '1 Milestone'),
  ('REVIEW', 5, 'Week 2 Assessment & Notebook', 'Record edge cases: single-node lists, empty stacks, off-by-one pointer errors.', 30, true, 'SPRINT_REVIEW', 'Week 2: Strings + Linked List + Stack + Queue Review', NULL, 'Sprint Assessment')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 14;

-- Day 15 Plan (2026-10-12)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (15, 14, '2026-10-12', 'CORE_LEARNING', 3, 'Binary Search: Iterative, Recursive & Rotated Arrays', 'Master logarithmic search principles and boundary calculation.', 'AUTHORITATIVE_DSA_PLAN', 'Week 3: Binary Search + Trees + BST')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 15 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 15);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Binary Search Foundations', 'Search space invariants, mid calculation (preventing overflow), search in rotated sorted array.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 3: Binary Search + Trees + BST (DSA Core)', 'Medium', '1 Concept'),
  ('LEETCODE', 2, 'Binary Search Problems', 'Solve: Binary Search (LeetCode 704 - Easy), Search in Rotated Sorted Array (LeetCode 33 - Medium).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 704, LeetCode 33', 'Mixed', '2 problems'),
  ('FULLSTACK', 3, 'Node.js Architecture & V8 Engine', 'Event-driven non-blocking I/O, event loop phases, process object, buffers.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 2: Modern Frontend & State', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Node & Express Server Scaffolding', 'Initialize Express server, TypeScript setup, CORS, JSON body parser.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 2', 'Medium', '1 Milestone'),
  ('CS', 5, 'DBMS: Database Normalization (1NF, 2NF, 3NF, BCNF)', 'Functional dependencies, anomalies (insertion, deletion, update), decomposition.', 30, false, 'CS_CORE', 'Operating Systems Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 15;

-- Day 16 Plan (2026-10-13)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (16, 15, '2026-10-13', 'CORE_LEARNING', 3, 'Binary Search on Answer & Boundaries', 'Lower/Upper bound, finding minimum in rotated array, binary search on monotone predicates.', 'AUTHORITATIVE_DSA_PLAN', 'Week 3: Binary Search + Trees + BST')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 16 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 16);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Lower/Upper Bounds & Monotone Search', 'bisect_left vs bisect_right in Python. Binary search on answer space (optimization to decision problem).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 3: Binary Search + Trees + BST (DSA Core)', 'Medium', '1 Concept'),
  ('LEETCODE', 2, 'Rotated & Answer Search Problems', 'Solve: Find Minimum in Rotated Sorted Array (LeetCode 153 - Medium), Koko Eating Bananas (LeetCode 875 - Medium).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 153, LeetCode 875', 'Medium', '2 problems'),
  ('FULLSTACK', 3, 'Node.js Modules & File System (fs/path)', 'CommonJS vs ES Modules, path manipulation, reading/writing files asynchronously with streams.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 2: Modern Frontend & State', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Modular API Route Architecture', 'Implement modular router structure for auth, sprints, teams, and tracks.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 2', 'Medium', '1 Milestone'),
  ('CS', 5, 'DBMS: Indexing & B-Trees', 'Clustered vs non-clustered index, B-Tree and B+ Tree structures, index scan vs seq scan.', 30, false, 'CS_CORE', 'DBMS & SQL Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 16;

-- Day 17 Plan (2026-10-14)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (17, 16, '2026-10-14', 'CORE_LEARNING', 3, 'Binary Trees: Terminology & Depth-First Traversals', 'Binary Tree representations, Preorder, Inorder, and Postorder recursion.', 'AUTHORITATIVE_DSA_PLAN', 'Week 3: Binary Search + Trees + BST')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 17 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 17);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Tree Node & DFS Traversals', 'TreeNode class, recursive and iterative preorder, inorder, and postorder traversals.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 3: Binary Search + Trees + BST (DSA Core)', 'Medium', '1 Concept'),
  ('LEETCODE', 2, 'Tree Traversal Problems', 'Solve: Binary Tree Inorder Traversal (LeetCode 94 - Easy), Binary Tree Preorder Traversal (LeetCode 144 - Easy).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 94, LeetCode 144', 'Easy', '2 problems'),
  ('FULLSTACK', 3, 'Express Middleware Architecture', 'Application-level vs router-level middleware, error-handling middleware, request logging.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 2: Modern Frontend & State', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Request Validation Middleware', 'Implement schema validation for incoming request payloads with descriptive error responses.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 2', 'Medium', '1 Milestone'),
  ('CS', 5, 'CN: OSI Model & TCP/IP Stack Layers', 'Functions of 7 layers vs 4 layers, encapsulation, decapsulation, packet headers.', 30, false, 'CS_CORE', 'Computer Networks Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 17;

-- Day 18 Plan (2026-10-15)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (18, 17, '2026-10-15', 'CORE_LEARNING', 3, 'Binary Trees: Level Order (BFS), Height & Diameter', 'Breadth-First traversal using queues and recursive tree properties.', 'AUTHORITATIVE_DSA_PLAN', 'Week 3: Binary Search + Trees + BST')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 18 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 18);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Tree BFS & Height Calculation', 'Level order traversal using collections.deque. Recursive tree height, diameter, and balance calculations.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 3: Binary Search + Trees + BST (DSA Core)', 'Medium', '1 Concept'),
  ('LEETCODE', 2, 'Tree Depth & Diameter Problems', 'Solve: Maximum Depth of Binary Tree (LeetCode 104 - Easy), Diameter of Binary Tree (LeetCode 543 - Easy), Binary Tree Level Order Traversal (LeetCode 102 - Medium).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 104, LeetCode 543, LeetCode 102', 'Mixed', '3 problems'),
  ('FULLSTACK', 3, 'RESTful API Standards & HTTP Status Codes', 'Idempotency, resource naming, HTTP methods (GET, POST, PUT, PATCH, DELETE), status codes (2xx, 3xx, 4xx, 5xx).', 40, true, 'FULLSTACK_ROADMAP', 'Stage 2: Modern Frontend & State', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Controller Layer Implementation', 'Separate route definitions from business logic controllers with async error wrappers.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 2', 'Medium', '1 Milestone'),
  ('CS', 5, 'CN: TCP vs UDP & Three-Way Handshake', 'Connection-oriented vs connectionless, SYN/SYN-ACK/ACK, reliability, flow control, windowing.', 30, false, 'CS_CORE', 'Computer Networks Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 18;

-- Day 19 Plan (2026-10-16)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (19, 18, '2026-10-16', 'CORE_LEARNING', 3, 'Binary Trees: Inversion, Symmetry & Subtrees', 'Structural comparisons, tree mirrors, and subtree matching.', 'AUTHORITATIVE_DSA_PLAN', 'Week 3: Binary Search + Trees + BST')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 19 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 19);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Tree Equality & Mirror Symmetry', 'Balanced Binary Tree verification, Inverting trees, Same Tree and Subtree checks.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 3: Binary Search + Trees + BST (DSA Core)', 'Medium', '1 Concept'),
  ('LEETCODE', 2, 'Tree Symmetry Problems', 'Solve: Invert Binary Tree (LeetCode 226 - Easy), Same Tree (LeetCode 100 - Easy), Subtree of Another Tree (LeetCode 572 - Easy).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 226, LeetCode 100, LeetCode 572', 'Easy', '3 problems'),
  ('FULLSTACK', 3, 'Environment Configurations & Dotenv', 'Process env management, secret validation, development vs production configuration splitting.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 2: Modern Frontend & State', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Centralized Error Handling System', 'Create AppError class, centralized error handling middleware, user-safe error responses.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 2', 'Medium', '1 Milestone'),
  ('CS', 5, 'CN: IP Addressing & Subnetting Basics', 'IPv4 vs IPv6, CIDR notation, subnet masks, public vs private IP ranges, NAT.', 30, false, 'CS_CORE', 'Computer Networks Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 19;

-- Day 20 Plan (2026-10-17)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (20, 19, '2026-10-17', 'CORE_LEARNING', 3, 'Binary Search Trees (BST): Properties & Validation', 'BST invariants, insertion, search, deletion, and validation.', 'AUTHORITATIVE_DSA_PLAN', 'Week 3: Binary Search + Trees + BST')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 20 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 20);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'BST Invariant & Operations', 'BST property (left < root < right), in-order traversal property (sorted). Insertion, search, deletion.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 3: Binary Search + Trees + BST (DSA Core)', 'Medium', '1 Concept'),
  ('LEETCODE', 2, 'BST Validation Problems', 'Solve: Search in a Binary Search Tree (LeetCode 700 - Easy), Validate Binary Search Tree (LeetCode 98 - Medium).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 700, LeetCode 98', 'Mixed', '2 problems'),
  ('FULLSTACK', 3, 'Database Connection Pools', 'Connection pool concepts, idle timeouts, max connections, connection leak prevention.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 2: Modern Frontend & State', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Database Access Service Layer', 'Integrate Supabase client singleton with retry handlers and typed queries.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 2', 'Medium', '1 Milestone'),
  ('CS', 5, 'CN: DNS Resolution & HTTP Protocol', 'DNS lookup flow (Root -> TLD -> Authoritative), HTTP 1.1 keep-alive vs HTTP/2 multiplexing vs HTTP/3.', 30, false, 'CS_CORE', 'Computer Networks Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 20;

-- Day 21 Plan (2026-10-18)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (21, 20, '2026-10-18', 'CORE_LEARNING', 3, 'BST: Lowest Common Ancestor & Kth Element', 'LCA in BST and Binary Trees, Kth smallest element, and Week 3 consolidation (18+ problems).', 'AUTHORITATIVE_DSA_PLAN', 'Week 3: Binary Search + Trees + BST')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 21 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 21);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'LCA & Order Statistics in BST', 'Lowest Common Ancestor in BST vs general Binary Tree. Finding Kth smallest element via in-order traversal.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 3: Binary Search + Trees + BST (DSA Core)', 'Medium', '1 Concept'),
  ('LEETCODE', 2, 'BST Advanced Problems', 'Solve: Lowest Common Ancestor of a BST (LeetCode 235 - Medium), Kth Smallest Element in a BST (LeetCode 230 - Medium). Verify Week 3 target (18+).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 235, LeetCode 230', 'Medium', '2 problems'),
  ('FULLSTACK', 3, 'API Security: CORS, Helmet & Rate Limiting', 'Cross-Origin Resource Sharing headers, HTTP security headers, in-memory rate limiting.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 2: Modern Frontend & State', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Week 3 Sprint Review & Build Check', 'Verify API integration with mock fallbacks, run automated TypeScript check.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 3', 'Medium', '1 Milestone'),
  ('REVIEW', 5, 'Trees & BST Patterns Notebook', 'Document recursion returns (bool vs node), boundary conditions for null pointers.', 30, true, 'SPRINT_REVIEW', 'Week 3: Binary Search + Trees + BST Review', NULL, 'Sprint Assessment')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 21;

-- Day 22 Plan (2026-10-19)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (22, 21, '2026-10-19', 'CORE_LEARNING', 4, 'Heaps: Min-Heap, Max-Heap & Python heapq', 'Binary Heap properties, array representation, heapify, and Top K elements.', 'AUTHORITATIVE_DSA_PLAN', 'Week 4: Heaps + Recursion + Backtracking')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 22 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 22);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Heap Fundamentals & heapq Module', 'Min-Heap vs Max-Heap, heapify (O(N)), heappush/heappop (O(log N)). Top K elements pattern.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 4: Heaps + Recursion + Backtracking (DSA Core)', 'Medium', '1 Concept'),
  ('LEETCODE', 2, 'Top K Elements Problems', 'Solve: Kth Largest Element in a Stream (LeetCode 703 - Easy), Kth Largest Element in an Array (LeetCode 215 - Medium).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 703, LeetCode 215', 'Mixed', '2 problems'),
  ('FULLSTACK', 3, 'PostgreSQL Relational Schema Design', 'DDL script structuring, foreign key cascade options, enum types, composite keys.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 2: Modern Frontend & State', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Database Migration Strategy', 'Establish idempotent SQL migration scripts with rollback safeguards.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 3', 'Medium', '1 Milestone'),
  ('CS', 5, 'CN: HTTPS, SSL/TLS Handshake & Certificates', 'Symmetric vs asymmetric encryption, CA trust chain, TLS 1.3 handshake sequence.', 30, false, 'CS_CORE', 'Computer Networks Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 22;

-- Day 23 Plan (2026-10-20)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (23, 22, '2026-10-20', 'CORE_LEARNING', 4, 'Heaps: K-Way Merge & Proximity Problems', 'Advanced heap applications: merging K sorted lists and finding closest points.', 'AUTHORITATIVE_DSA_PLAN', 'Week 4: Heaps + Recursion + Backtracking')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 23 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 23);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'K-Way Merge & Spatial Heaps', 'Using heaps for K-Way merges and proximity rankings. Time complexity O(N log K).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 4: Heaps + Recursion + Backtracking (DSA Core)', 'Medium', '1 Concept'),
  ('LEETCODE', 2, 'Heap Medium Problems', 'Solve: Top K Frequent Elements (LeetCode 347 - Medium), K Closest Points to Origin (LeetCode 973 - Medium).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 347, LeetCode 973', 'Medium', '2 problems'),
  ('FULLSTACK', 3, 'PostgreSQL Index Optimization & EXPLAIN', 'EXPLAIN ANALYZE, query planning, index scans, bitmap heap scans, avoiding sequential scans.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 2: Modern Frontend & State', 'Medium', '1 Module'),
  ('PROJECT', 4, 'User Profile & Settings Schema', 'Design user profile schema with social links, college metadata, and user settings.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 3', 'Medium', '1 Milestone'),
  ('CS', 5, 'OOP: 4 Pillars (Encapsulation, Abstraction, Inheritance, Polymorphism)', 'Real-world examples, method overloading vs overriding, dynamic dispatch.', 30, false, 'CS_CORE', 'Computer Science Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 23;

-- Day 24 Plan (2026-10-21)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (24, 23, '2026-10-21', 'CORE_LEARNING', 4, 'Dual Heaps & Recursion Foundations', 'Two-heap pattern for running medians and recursive call stack mental model.', 'AUTHORITATIVE_DSA_PLAN', 'Week 4: Heaps + Recursion + Backtracking')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 24 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 24);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Two-Heap Pattern & Recursion Trees', 'Balancing two heaps (Max-Heap + Min-Heap). Recursion tree, base cases, and stack frames.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 4: Heaps + Recursion + Backtracking (DSA Core)', 'Medium', '1 Concept'),
  ('LEETCODE', 2, 'Median Stream & Recursion Problems', 'Solve: Find Median from Data Stream (LeetCode 295 - Hard), Fibonacci Number (LeetCode 509 - Easy).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 295, LeetCode 509', 'Mixed', '2 problems'),
  ('FULLSTACK', 3, 'User Authentication: Password Hashing', 'Salt generation, bcrypt / Argon2 hashing algorithms, rainbow table protection.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 2: Modern Frontend & State', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Auth Service & Supabase Auth Bridge', 'Integrate session management, auth state change listener, and signup profile creation.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 3', 'Medium', '1 Milestone'),
  ('CS', 5, 'OOP: Interfaces, Abstract Classes & SOLID - S & O', 'Single Responsibility Principle, Open-Closed Principle with practical code examples.', 30, false, 'CS_CORE', 'Operating Systems Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 24;

-- Day 25 Plan (2026-10-22)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (25, 24, '2026-10-22', 'CORE_LEARNING', 4, 'Recursion Patterns: Divide & Conquer', 'Recursive array reversals, power function, and divide-and-conquer strategy.', 'AUTHORITATIVE_DSA_PLAN', 'Week 4: Heaps + Recursion + Backtracking')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 25 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 25);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Divide & Conquer Recursion', 'Binary exponentiation, divide-and-conquer principles, recursive string manipulation.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 4: Heaps + Recursion + Backtracking (DSA Core)', 'Medium', '1 Concept'),
  ('LEETCODE', 2, 'Recursive Math & Array Problems', 'Solve: Pow(x, n) (LeetCode 50 - Medium), Reverse String (LeetCode 344 - Easy).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 50, LeetCode 344', 'Mixed', '2 problems'),
  ('FULLSTACK', 3, 'Token-Based Auth: JWT Architecture', 'Header, payload, signature, token expiration, refresh token rotation strategy.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 2: Modern Frontend & State', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Protected Route Guards & Session Restorer', 'Implement frontend route protection ensuring unauthenticated users see auth views.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 3', 'Medium', '1 Milestone'),
  ('CS', 5, 'OOP: SOLID Principles - L, I, D', 'Liskov Substitution, Interface Segregation, Dependency Inversion principles.', 30, false, 'CS_CORE', 'Computer Science Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 25;

-- Day 26 Plan (2026-10-23)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (26, 25, '2026-10-23', 'CORE_LEARNING', 4, 'Backtracking: Subsets & Combinations', 'State space tree, choose-explore-unchoose paradigm, generating subsets.', 'AUTHORITATIVE_DSA_PLAN', 'Week 4: Heaps + Recursion + Backtracking')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 26 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 26);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Backtracking Paradigm & Subsets', 'State-space exploration, pruning branches, backtrack step (choose, recurse, undo). Subsets & combinations.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 4: Heaps + Recursion + Backtracking (DSA Core)', 'Medium', '1 Concept'),
  ('LEETCODE', 2, 'Subset & Combination Problems', 'Solve: Subsets (LeetCode 78 - Medium), Combinations (LeetCode 77 - Medium).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 78, LeetCode 77', 'Medium', '2 problems'),
  ('FULLSTACK', 3, 'Row Level Security (RLS) in PostgreSQL', 'Defining table policies, USING vs WITH CHECK expressions, auth.uid() scoping.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 2: Modern Frontend & State', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Team System Schema & Capacity Limits', 'Implement teams, team_members tables with database-level capacity triggers.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 3', 'Medium', '1 Milestone'),
  ('CS', 5, 'OOP: Design Patterns - Creational (Singleton, Factory)', 'Thread-safe Singleton implementation, Factory Method pattern with practical use-cases.', 30, false, 'CS_CORE', 'Computer Science Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 26;

-- Day 27 Plan (2026-10-24)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (27, 26, '2026-10-24', 'CORE_LEARNING', 4, 'Backtracking: Permutations & Target Sums', 'Permutations with/without duplicates, combination sum variations.', 'AUTHORITATIVE_DSA_PLAN', 'Week 4: Heaps + Recursion + Backtracking')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 27 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 27);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Permutations & Pruning Techniques', 'Frequency tracking / visited sets in backtracking. Combination Sum with candidate reuse.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 4: Heaps + Recursion + Backtracking (DSA Core)', 'Medium', '1 Concept'),
  ('LEETCODE', 2, 'Permutations & Target Sum Problems', 'Solve: Permutations (LeetCode 46 - Medium), Combination Sum (LeetCode 39 - Medium).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 46, LeetCode 39', 'Medium', '2 problems'),
  ('FULLSTACK', 3, 'Atomic Stored Procedures & Database RPCs', 'Writing PL/pgSQL functions, transactions, exception handling, and Supabase RPC calls.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 2: Modern Frontend & State', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Atomic Team Creation & Join RPCs', 'Implement create_team_with_sprint and join_team_by_code atomic database functions.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 3', 'Medium', '1 Milestone'),
  ('CS', 5, 'OOP: Design Patterns - Structural (Adapter, Decorator)', 'Adapter pattern for third-party libraries, Decorator pattern for middleware/wrappers.', 30, false, 'CS_CORE', 'Computer Science Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 27;

-- Day 28 Plan (2026-10-25)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (28, 27, '2026-10-25', 'CORE_LEARNING', 4, 'Backtracking: Grid Search & N-Queens', 'Word Search in 2D grids, N-Queens placement, and Week 4 consolidation (15+ problems).', 'AUTHORITATIVE_DSA_PLAN', 'Week 4: Heaps + Recursion + Backtracking')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 28 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 28);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Grid Backtracking & Constraint Satisfaction', '2D matrix traversal with backtracking (marking visited cells), N-Queens diagonal tracking.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 4: Heaps + Recursion + Backtracking (DSA Core)', 'Medium', '1 Concept'),
  ('LEETCODE', 2, 'Classic Backtracking Problems', 'Solve: Word Search (LeetCode 79 - Medium), N-Queens (LeetCode 51 - Hard). Verify Week 4 target (15+).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 79, LeetCode 51', 'Mixed', '2 problems'),
  ('FULLSTACK', 3, 'Client-Side State Synchronization', 'Coordinating React Context with database updates, loading spinners, optimistic updates.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 2: Modern Frontend & State', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Week 4 Team Onboarding Verification', 'Verify team creation, invite code generation, join validation, and leave team flows.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 3', 'Medium', '1 Milestone'),
  ('REVIEW', 5, 'Week 4 Assessment & Notebook', 'Review Heap time complexities and Backtracking branch pruning efficiency.', 30, true, 'SPRINT_REVIEW', 'Week 4: Heaps + Recursion + Backtracking Review', NULL, 'Sprint Assessment')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 28;

-- Day 29 Plan (2026-10-26)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (29, 28, '2026-10-26', 'CORE_LEARNING', 5, 'Graph Fundamentals: Representations & Terminology', 'Directed/Undirected graphs, Adjacency Matrix vs Adjacency List representations.', 'AUTHORITATIVE_DSA_PLAN', 'Week 5: Graphs')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 29 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 29);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Graph Data Structures in Python', 'Graph terminology: vertices, edges, weights, degrees. Building Adjacency List using defaultdict(list).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 5: Graphs (DSA Core)', 'Medium', '1 Concept'),
  ('LEETCODE', 2, 'Graph Representation Problems', 'Solve: Find the Town Judge (LeetCode 997 - Easy), Find Center of Star Graph (LeetCode 1791 - Easy).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 997, LeetCode 1791', 'Easy', '2 problems'),
  ('FULLSTACK', 3, 'Full Stack API Architecture', 'Layered architecture: Routes -> Controllers -> Services -> Repositories/Database.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 3: Backend & Database Architecture', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Daily Check-in Data Model', 'Design daily_checkins table schema: study hours, track booleans, notes, streak counting.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 3', 'Medium', '1 Milestone'),
  ('CS', 5, 'OOP: Behavioral Patterns (Observer, Strategy)', 'Event listeners as Observer pattern, algorithmic swapping with Strategy pattern.', 30, false, 'CS_CORE', 'Computer Science Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 29;

-- Day 30 Plan (2026-10-27)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (30, 29, '2026-10-27', 'CORE_LEARNING', 5, 'Graph Traversal: Breadth-First Search (BFS)', 'Queue-based BFS, connected components, shortest path in unweighted graphs.', 'AUTHORITATIVE_DSA_PLAN', 'Week 5: Graphs')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 30 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 30);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Graph BFS & Connected Components', 'BFS traversal algorithm with visited set. Finding connected components and shortest unweighted paths.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 5: Graphs (DSA Core)', 'Medium', '1 Concept'),
  ('LEETCODE', 2, 'BFS Graph Problems', 'Solve: Flood Fill (LeetCode 733 - Easy), Number of Islands (LeetCode 200 - Medium).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 733, LeetCode 200', 'Mixed', '2 problems'),
  ('FULLSTACK', 3, 'File Storage & Asset Management', 'Supabase Storage buckets, secure presigned URLs, MIME-type validation, avatar uploads.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 3: Backend & Database Architecture', 'Medium', '1 Module'),
  ('PROJECT', 4, 'User Avatar & Image Upload Flow', 'Implement profile image upload component with preview and cloud storage sync.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 3', 'Medium', '1 Milestone'),
  ('CS', 5, 'System Design: Client-Server Architecture & CDN', 'Static asset distribution, edge caching, latency reduction, cache invalidation.', 30, false, 'CS_CORE', 'Computer Science Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 30;

-- Day 31 Plan (2026-10-28)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (31, 30, '2026-10-28', 'CORE_LEARNING', 5, 'Graph Traversal: Depth-First Search (DFS)', 'Recursive DFS on graphs and matrix grids, path existence.', 'AUTHORITATIVE_DSA_PLAN', 'Week 5: Graphs')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 31 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 31);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Graph DFS & Matrix Traversal', 'Recursive DFS implementation, handling 4-directional matrix exploration, visited tracking.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 5: Graphs (DSA Core)', 'Medium', '1 Concept'),
  ('LEETCODE', 2, 'DFS Matrix Problems', 'Solve: Max Area of Island (LeetCode 695 - Medium), Clone Graph (LeetCode 133 - Medium).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 695, LeetCode 133', 'Medium', '2 problems'),
  ('FULLSTACK', 3, 'Background Jobs & Cron Schedulers', 'Node cron jobs, scheduled database cleanup, daily streak calculation triggers.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 3: Backend & Database Architecture', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Streak Calculation Engine', 'Implement dynamic streak computation based on consecutive daily check-ins.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 4', 'Medium', '1 Milestone'),
  ('CS', 5, 'System Design: Load Balancers (L4 vs L7)', 'Round robin, least connections, IP hash algorithms, health checking, SSL termination.', 30, false, 'CS_CORE', 'Computer Science Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 31;

-- Day 32 Plan (2026-10-29)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (32, 31, '2026-10-29', 'CORE_LEARNING', 5, 'Cycle Detection in Graphs', 'Detecting cycles in Directed (3-color DFS) and Undirected (parent pointer) graphs.', 'AUTHORITATIVE_DSA_PLAN', 'Week 5: Graphs')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 32 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 32);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Cycle Detection Algorithms', 'Cycle detection in undirected graphs (DFS with parent). Cycle detection in directed graphs (recursion stack / 3-color).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 5: Graphs (DSA Core)', 'Medium', '1 Concept'),
  ('LEETCODE', 2, 'Cycle Detection Problems', 'Solve: Course Schedule (LeetCode 207 - Medium), Pacific Atlantic Water Flow (LeetCode 417 - Medium).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 207, LeetCode 417', 'Medium', '2 problems'),
  ('FULLSTACK', 3, 'Realtime Subscriptions: WebSockets & Supabase', 'WebSocket handshakes, Supabase Realtime channel subscription for team changes.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 3: Backend & Database Architecture', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Realtime Team Activity Feed', 'Connect team_activities table to live activity feed in Friends sidebar panel.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 4', 'Medium', '1 Milestone'),
  ('CS', 5, 'System Design: Database Caching Strategies', 'Cache-Aside, Write-Through, Write-Back, Write-Around caching patterns with Redis.', 30, false, 'CS_CORE', 'Computer Science Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 32;

-- Day 33 Plan (2026-10-30)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (33, 32, '2026-10-30', 'CORE_LEARNING', 5, 'Topological Sort: Kahn''s Algorithm & DFS', 'Topological ordering for DAGs, in-degree calculation, and dependency resolution.', 'AUTHORITATIVE_DSA_PLAN', 'Week 5: Graphs')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 33 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 33);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Topological Sort Algorithms', 'DAG properties. Kahn''s algorithm (in-degree array + queue). DFS topological sort with stack.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 5: Graphs (DSA Core)', 'Medium', '1 Concept'),
  ('LEETCODE', 2, 'Topological Sort Problems', 'Solve: Course Schedule II (LeetCode 210 - Medium), Alien Dictionary (LeetCode 269 - Hard).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 210, LeetCode 269', 'Mixed', '2 problems'),
  ('FULLSTACK', 3, 'API Documentation: OpenAPI & Postman', 'Documenting endpoints, parameter schemas, response codes, and curl examples.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 3: Backend & Database Architecture', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Sprint Leaderboard Logic', 'Aggregate total study hours and solved counts across team members.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 4', 'Medium', '1 Milestone'),
  ('CS', 5, 'System Design: Horizontal vs Vertical Scaling', 'Stateless services, shared-nothing architecture, database read replicas.', 30, false, 'CS_CORE', 'Computer Science Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 33;

-- Day 34 Plan (2026-10-31)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (34, 33, '2026-10-31', 'CORE_LEARNING', 5, 'Disjoint Set / Union-Find & Bipartite Graphs', 'Union by rank, path compression, and 2-coloring for bipartite verification.', 'AUTHORITATIVE_DSA_PLAN', 'Week 5: Graphs')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 34 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 34);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Disjoint Set Union (DSU) & Bipartite Check', 'DSU class with find (path compression) and union (by rank) - O(alpha(N)). Bipartite graph coloring via BFS/DFS.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 5: Graphs (DSA Core)', 'Medium', '1 Concept'),
  ('LEETCODE', 2, 'DSU & Bipartite Problems', 'Solve: Is Graph Bipartite? (LeetCode 785 - Medium), Redundant Connection (LeetCode 684 - Medium).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 785, LeetCode 684', 'Medium', '2 problems'),
  ('FULLSTACK', 3, 'Data Pagination: Offset vs Cursor', 'LIMIT/OFFSET pitfalls at scale, keyset/cursor pagination implementation for feeds.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 3: Backend & Database Architecture', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Paginated LeetCode Problems Table', 'Implement paginated problem browser with real progress checkboxes.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 4', 'Medium', '1 Milestone'),
  ('CS', 5, 'System Design: CAP Theorem & PACELC', 'Consistency, Availability, Partition tolerance tradeoffs in distributed data stores.', 30, false, 'CS_CORE', 'Computer Science Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 34;

-- Day 35 Plan (2026-11-01)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (35, 34, '2026-11-01', 'CORE_LEARNING', 5, 'Shortest Path: Dijkstra''s & Bellman-Ford Algorithms', 'Weighted graphs, Dijkstra priority queue implementation, and Week 5 consolidation (18+ problems).', 'AUTHORITATIVE_DSA_PLAN', 'Week 5: Graphs')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 35 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 35);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Dijkstra''s Algorithm & Negative Weights', 'Dijkstra using Python heapq - O((V+E) log V). Bellman-Ford concept for negative weight cycles.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 5: Graphs (DSA Core)', 'Medium', '1 Concept'),
  ('LEETCODE', 2, 'Shortest Path Problems', 'Solve: Network Delay Time (LeetCode 743 - Medium), Cheapest Flights Within K Stops (LeetCode 787 - Medium). Verify Week 5 target (18+).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 743, LeetCode 787', 'Medium', '2 problems'),
  ('FULLSTACK', 3, 'Error Boundary & Fallback UI in React', 'React Error Boundary components, fallback placeholders, graceful failure handling.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 3: Backend & Database Architecture', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Week 5 Review & Code Quality Audit', 'Run ESLint/TypeScript checks, verify zero uncaught promises or broken imports.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 4', 'Medium', '1 Milestone'),
  ('REVIEW', 5, 'Week 5 Graph Patterns Notebook', 'Create summary cheat-sheet: when to use BFS vs DFS vs DSU vs Dijkstra.', 30, true, 'SPRINT_REVIEW', 'Week 5: Graphs Review', NULL, 'Sprint Assessment')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 35;

-- Day 36 Plan (2026-11-02)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (36, 35, '2026-11-02', 'CORE_LEARNING', 6, 'DP Foundations & 1D Fibonacci Patterns', 'Overlapping subproblems, optimal substructure, memoization (top-down) vs tabulation (bottom-up).', 'AUTHORITATIVE_DSA_PLAN', 'Week 6: Dynamic Programming')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 36 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 36);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'DP Core Concepts & 1D Transitions', 'Recursion -> Memoization -> Tabulation -> Space Optimization mental model. Climbing stairs transitions.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 6: Dynamic Programming (DSA Core)', 'Hard', '1 Concept'),
  ('LEETCODE', 2, '1D DP Starter Problems', 'Solve: Climbing Stairs (LeetCode 70 - Easy), Min Cost Climbing Stairs (LeetCode 746 - Easy).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 70, LeetCode 746', 'Easy', '2 problems'),
  ('FULLSTACK', 3, 'Frontend Performance: Code Splitting', 'React.lazy, Suspense, dynamic imports, bundle size analysis with Vite.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 3: Backend & Database Architecture', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Track Progress Calculators', 'Implement pure calculation utilities for DSA, LeetCode, Full Stack, and Project readiness score.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 4', 'Medium', '1 Milestone'),
  ('CS', 5, 'System Design: Database Sharding & Partitioning', 'Horizontal partitioning, range-based vs hash-based sharding, cross-shard query problems.', 30, false, 'CS_CORE', 'Operating Systems Core', 'Hard', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 36;

-- Day 37 Plan (2026-11-03)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (37, 36, '2026-11-03', 'CORE_LEARNING', 6, '1D DP: House Robber & Coin Change', 'Non-consecutive selection patterns and unbounded coin combination counting.', 'AUTHORITATIVE_DSA_PLAN', 'Week 6: Dynamic Programming')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 37 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 37);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Decision DP & Coin Change Transitions', 'Take / Don''t Take recursion pattern. Unbounded knapsack transition for coin change.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 6: Dynamic Programming (DSA Core)', 'Hard', '1 Concept'),
  ('LEETCODE', 2, '1D DP Classic Problems', 'Solve: House Robber (LeetCode 198 - Medium), Coin Change (LeetCode 322 - Medium).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 198, LeetCode 322', 'Medium', '2 problems'),
  ('FULLSTACK', 3, 'State Normalization & Memoized Selectors', 'Normalizing entity state in client memory, efficient lookups by ID.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 3: Backend & Database Architecture', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Daily Check-in Modal Component', 'Build daily check-in dialog with study hour inputs and task checkboxes.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 4', 'Medium', '1 Milestone'),
  ('CS', 5, 'System Design: Message Queues (Kafka / RabbitMQ)', 'Pub/Sub model, decoupling producers and consumers, message persistence, at-least-once delivery.', 30, false, 'CS_CORE', 'Computer Science Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 37;

-- Day 38 Plan (2026-11-04)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (38, 37, '2026-11-04', 'CORE_LEARNING', 6, '2D DP: Grid Navigation & Minimum Path Sum', '2D grid states, boundary conditions, and path accumulation.', 'AUTHORITATIVE_DSA_PLAN', 'Week 6: Dynamic Programming')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 38 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 38);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, '2D Grid DP Transitions', 'Grid path counting dp[i][j] = dp[i-1][j] + dp[i][j-1]. Space optimization to 1D row array.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 6: Dynamic Programming (DSA Core)', 'Hard', '1 Concept'),
  ('LEETCODE', 2, 'Grid DP Problems', 'Solve: Unique Paths (LeetCode 62 - Medium), Minimum Path Sum (LeetCode 64 - Medium).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 62, LeetCode 64', 'Medium', '2 problems'),
  ('FULLSTACK', 3, 'Automated Testing: Vitest Unit Tests', 'Setting up Vitest, writing unit tests for utility calculation functions and formatters.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 3: Backend & Database Architecture', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Unit Tests for Calculations Module', 'Write comprehensive test suite for calculateSprintDayStatus and calculateReadinessScore.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 4', 'Medium', '1 Milestone'),
  ('CS', 5, 'System Design: Rate Limiting Algorithms', 'Token Bucket, Leaky Bucket, Fixed Window Counter, Sliding Window Log.', 30, false, 'CS_CORE', 'Computer Science Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 38;

-- Day 39 Plan (2026-11-05)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (39, 38, '2026-11-05', 'CORE_LEARNING', 6, 'Knapsack DP: 0/1 Knapsack & Subset Sum', 'Classic 0/1 knapsack pattern, subset partition, and target sum.', 'AUTHORITATIVE_DSA_PLAN', 'Week 6: Dynamic Programming')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 39 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 39);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, '0/1 Knapsack Framework', 'Weight and value state representation, reverse traversal in 1D array space optimization.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 6: Dynamic Programming (DSA Core)', 'Hard', '1 Concept'),
  ('LEETCODE', 2, 'Knapsack Variant Problems', 'Solve: Partition Equal Subset Sum (LeetCode 416 - Medium), Target Sum (LeetCode 494 - Medium).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 416, LeetCode 494', 'Medium', '2 problems'),
  ('FULLSTACK', 3, 'React Component Testing with Testing Library', 'Testing user interactions, mocking API calls, verifying accessible role queries.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 3: Backend & Database Architecture', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Component Integration Tests', 'Write tests for Header, FriendsPanel, and Dashboard overview cards.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 4', 'Medium', '1 Milestone'),
  ('CS', 5, 'System Design: Microservices vs Monoliths', 'Service boundaries, API gateways, inter-service communication, distributed tracing.', 30, false, 'CS_CORE', 'Computer Science Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 39;

-- Day 40 Plan (2026-11-06)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (40, 39, '2026-11-06', 'CORE_LEARNING', 6, 'String DP: Longest Common Subsequence (LCS) & Edit Distance', 'Two-string alignment matrix, match vs mismatch transitions.', 'AUTHORITATIVE_DSA_PLAN', 'Week 6: Dynamic Programming')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 40 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 40);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'LCS & String Transformation DP', 'LCS state recurrence: if s1[i]==s2[j] then 1+dp[i-1][j-1], else max(dp[i-1][j], dp[i][j-1]). Edit Distance insertion/deletion/replacement.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 6: Dynamic Programming (DSA Core)', 'Hard', '1 Concept'),
  ('LEETCODE', 2, 'String DP Problems', 'Solve: Longest Common Subsequence (LeetCode 1143 - Medium), Edit Distance (LeetCode 72 - Medium).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 1143, LeetCode 72', 'Medium', '2 problems'),
  ('FULLSTACK', 3, 'CI/CD Pipeline with GitHub Actions', 'Configuring automated linting, type-checking, and build validation on pull requests.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 3: Backend & Database Architecture', 'Medium', '1 Module'),
  ('PROJECT', 4, 'GitHub Actions Workflow Setup', 'Create .github/workflows/ci.yml running tsc and build on every push.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 4', 'Medium', '1 Milestone'),
  ('CS', 5, 'System Design: SQL vs NoSQL Selection Matrix', 'Relational vs Document vs Key-Value vs Graph databases, schema flexibility vs integrity.', 30, false, 'CS_CORE', 'DBMS & SQL Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 40;

-- Day 41 Plan (2026-11-07)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (41, 40, '2026-11-07', 'CORE_LEARNING', 6, 'DP on Sequences: Longest Increasing Subsequence (LIS)', 'LIS O(N^2) dynamic programming and O(N log N) patience sorting with binary search.', 'AUTHORITATIVE_DSA_PLAN', 'Week 6: Dynamic Programming')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 41 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 41);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'LIS & Binary Search Patience Sorting', 'LIS recurrence relation. Optimizing LIS from O(N^2) to O(N log N) using bisect_left tails array.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 6: Dynamic Programming (DSA Core)', 'Hard', '1 Concept'),
  ('LEETCODE', 2, 'LIS & Hard DP Problems', 'Solve: Longest Increasing Subsequence (LeetCode 300 - Medium), Russian Doll Envelopes (LeetCode 354 - Hard).', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 300, LeetCode 354', 'Mixed', '2 problems'),
  ('FULLSTACK', 3, 'Production Security Hardening', 'Content Security Policy (CSP), sanitized user inputs, preventing XSS and CSRF attacks.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 3: Backend & Database Architecture', 'Hard', '1 Module'),
  ('PROJECT', 4, 'Security Audit & Environment Guarding', 'Ensure zero secret leaks in client bundles, verify RLS policy enforcement on all tables.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 5', 'Medium', '1 Milestone'),
  ('CS', 5, 'System Design: Consistent Hashing', 'Hash ring, virtual nodes, minimizing key redistributions when nodes join or leave.', 30, false, 'CS_CORE', 'Computer Science Core', 'Easy', '1 Topic')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 41;

-- Day 42 Plan (2026-11-08)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (42, 41, '2026-11-08', 'CORE_LEARNING', 6, 'DP Patterns Mastery & Core Learning Milestone', 'Consolidate Weeks 1-6 (Core Learning Phase Days 1-42). Verify 100+ LeetCode problems milestone.', 'AUTHORITATIVE_DSA_PLAN', 'Week 6: Dynamic Programming')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 42 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 42);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'DP Patterns Synthesis & Cheat-Sheet', 'Synthesize 1D, 2D, Knapsack, and String DP templates. Review common state transition mistakes.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 6: Dynamic Programming (DSA Core)', 'Hard', '1 Concept'),
  ('LEETCODE', 2, 'Timed DP Challenge (1 Medium + 1 Hard)', 'Solve: Word Break (LeetCode 139 - Medium), Trapping Rain Water (LeetCode 42 - Hard). Verify 100+ total sprint problems solved.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'LeetCode 139, LeetCode 42', 'Mixed', '2 problems'),
  ('FULLSTACK', 3, 'Production Build & Performance Audit', 'Run lighthouse audit, check bundle analyzer, ensure sub-2 second load times.', 40, true, 'FULLSTACK_ROADMAP', 'Stage 3: Backend & Database Architecture', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Core Feature Freeze & Quality Gate', 'Finalize all core application views, verify responsive rendering across desktop & mobile.', 40, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 5', 'Medium', '1 Milestone'),
  ('REVIEW', 5, 'Milestone Assessment: Days 1-42 Review', 'Audit cumulative problem count (Target: 100+ solved). Prepare for Final 8-Day Interview Sprint.', 30, true, 'SPRINT_REVIEW', 'Week 6: Dynamic Programming Review', NULL, 'Sprint Assessment')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 42;

-- Day 43 Plan (2026-11-09)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (43, 42, '2026-11-09', 'FINAL_SPRINT', 7, 'Mixed DSA: Linear Structures & Pattern Recognition', 'Speed-run pattern recognition: Arrays, Hashing, Strings, and Linked Lists under timed conditions.', 'FINAL_SPRINT_PLAN', 'Week 7: Mixed Problem Solving')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 43 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 43);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Rapid Pattern Recognition Drill', 'Review 10 problem statements: identify optimal pattern in < 60 seconds each (Two Pointers vs Hash vs Sliding Window).', 45, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 7: Mixed Problem Solving (DSA Core)', 'Hard', '1 Concept'),
  ('LEETCODE', 2, 'Timed Mixed Problem Solving', 'Solve 2 Medium problems under 45-minute timer from Arrays/Strings/Lists.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 7: Mixed Problem Solving (Timed Set)', 'Medium', '2 problems'),
  ('FULLSTACK', 3, 'Frontend Interview Concepts', 'Review Virtual DOM, fiber architecture, hooks rules, SSR vs CSR vs SSG.', 30, true, 'FULLSTACK_ROADMAP', 'Stage 4: Full Stack Integration', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Project Architecture Defense Prep', 'Prepare clear 2-minute elevator pitch and architecture walkthrough of the sprint project.', 30, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 5', 'Medium', '1 Milestone'),
  ('INTERVIEW', 5, 'Verbal Explanation Practice', 'Explain your approach out loud before writing code; practice time & space complexity justification.', 30, true, 'INTERVIEW_SPRINT', 'Final Sprint: Week 8 Interview Prep', 'Hard', '1 Simulation')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 43;

-- Day 44 Plan (2026-11-10)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (44, 43, '2026-11-10', 'FINAL_SPRINT', 7, 'Mixed DSA: Non-Linear Structures & Search', 'Timed problem sets on Stacks, Queues, Binary Search, and Trees.', 'FINAL_SPRINT_PLAN', 'Week 7: Mixed Problem Solving')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 44 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 44);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Search & Tree Traversal Synthesis', 'Review monotone predicate search and recursive tree depth/diameter templates.', 45, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 7: Mixed Problem Solving (DSA Core)', 'Hard', '1 Concept'),
  ('LEETCODE', 2, 'Timed Search & Tree Problems', 'Solve 2 Medium problems: 1 Binary Search variation, 1 Binary Tree DFS/BFS problem.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 7: Mixed Problem Solving (Timed Set)', 'Medium', '2 problems'),
  ('FULLSTACK', 3, 'Backend Interview Concepts', 'Review Node.js Event Loop phases, cluster module, streaming large payloads, connection pooling.', 30, true, 'FULLSTACK_ROADMAP', 'Stage 4: Full Stack Integration', 'Medium', '1 Module'),
  ('PROJECT', 4, 'Project Deep Dive: Challenging Bugs', 'Document the 3 most challenging technical bugs encountered and how you debugged them.', 30, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 5', 'Medium', '1 Milestone'),
  ('INTERVIEW', 5, 'Complexity Analysis Speed Drill', 'Calculate tight time and space complexities for 5 sample recursive/iterative code snippets.', 30, true, 'INTERVIEW_SPRINT', 'Final Sprint: Week 8 Interview Prep', 'Hard', '1 Simulation')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 44;

-- Day 45 Plan (2026-11-11)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (45, 44, '2026-11-11', 'FINAL_SPRINT', 7, 'Mixed DSA: Heaps, Recursion & Backtracking', 'Backtracking tree exploration and priority queue problem solving with verbal explanations.', 'FINAL_SPRINT_PLAN', 'Week 7: Mixed Problem Solving')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 45 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 45);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Backtracking & Heap Templates', 'Review permutations/subsets templates and Top K heap selection patterns.', 45, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 7: Mixed Problem Solving (DSA Core)', 'Hard', '1 Concept'),
  ('LEETCODE', 2, 'Timed Heap & Backtracking Set', 'Solve 2 Medium problems: 1 Backtracking search, 1 Priority Queue optimization.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 7: Mixed Problem Solving (Timed Set)', 'Medium', '2 problems'),
  ('CS', 3, 'OS & Concurrency Interview Prep', 'Rapid-fire review: Deadlocks, Semaphores vs Mutex, Memory Paging, Context Switch overhead.', 30, true, 'CS_CORE', 'Computer Science Core', 'Easy', '1 Topic'),
  ('PROJECT', 4, 'Code Refactoring & Clean Code Polish', 'Ensure consistent naming, remove dead code, verify docstrings and TypeScript types.', 30, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 5', 'Medium', '1 Milestone'),
  ('INTERVIEW', 5, 'Behavioral Prep: STAR Method', 'Draft 3 STAR stories: Situation, Task, Action, Result for teamwork, conflict, and delivery.', 30, true, 'INTERVIEW_SPRINT', 'Final Sprint: Week 8 Interview Prep', 'Hard', '1 Simulation')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 45;

-- Day 46 Plan (2026-11-12)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (46, 45, '2026-11-12', 'FINAL_SPRINT', 7, 'Mixed DSA: Graphs, Connectivity & Shortest Path', 'Graph connectivity, cycle detection, topological ordering, and Dijkstra problem solving.', 'FINAL_SPRINT_PLAN', 'Week 7: Mixed Problem Solving')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 46 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 46);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'Graph Traversal & DSU Synthesis', 'Review BFS, DFS, DSU, Topological Sort, and Dijkstra templates.', 45, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 7: Mixed Problem Solving (DSA Core)', 'Hard', '1 Concept'),
  ('LEETCODE', 2, 'Timed Graph Problem Solving', 'Solve 2 Medium problems: 1 Connected Components / BFS, 1 Shortest Path or DSU.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 7: Mixed Problem Solving (Timed Set)', 'Medium', '2 problems'),
  ('CS', 3, 'Computer Networks Interview Prep', 'Rapid-fire review: TCP handshake, DNS resolution, HTTP vs HTTPS, WebSockets vs Polling.', 30, true, 'CS_CORE', 'Computer Science Core', 'Easy', '1 Topic'),
  ('PROJECT', 4, 'Deployment Health & Metrics Audit', 'Verify staging deployment, monitor response times, test error handling in production mode.', 30, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 5', 'Medium', '1 Milestone'),
  ('INTERVIEW', 5, 'System Design Concept Check', 'Review caching strategies, load balancer choices, database indexing tradeoffs.', 30, true, 'INTERVIEW_SPRINT', 'Final Sprint: Week 8 Interview Prep', 'Hard', '1 Simulation')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 46;

-- Day 47 Plan (2026-11-13)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (47, 46, '2026-11-13', 'FINAL_SPRINT', 7, 'Mixed DSA: Dynamic Programming & Greedy', 'DP pattern recognition, identifying optimal substructure vs greedy choice property.', 'FINAL_SPRINT_PLAN', 'Week 7: Mixed Problem Solving')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 47 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 47);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'DP vs Greedy Decision Framework', 'How to prove greedy choice property vs when overlapping subproblems necessitate DP.', 45, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 7: Mixed Problem Solving (DSA Core)', 'Hard', '1 Concept'),
  ('LEETCODE', 2, 'Timed DP & Greedy Set (2 Easy, 2 Medium)', 'Solve: 2 Easy warmup problems + 2 Medium DP/Greedy problems under 90 minutes.', 75, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 7: Mixed Problem Solving (Timed Set)', 'Mixed', '2 problems'),
  ('CS', 3, 'DBMS & SQL Query Writing Drill', 'Write 5 complex SQL queries: Window functions (ROW_NUMBER/RANK), nested joins, self-joins.', 30, true, 'CS_CORE', 'DBMS & SQL Core', 'Easy', '1 Topic'),
  ('PROJECT', 4, 'Project Demo Script Preparation', 'Prepare 5-minute crisp live demo showing key features, responsive UI, and error handling.', 30, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 5', 'Medium', '1 Milestone'),
  ('REVIEW', 5, 'Weak-Area Inventory', 'Identify remaining 3 weakest algorithmic topics to prioritize during final revision.', 30, true, 'SPRINT_REVIEW', 'Week 7: Mixed Problem Solving Review', NULL, 'Sprint Assessment')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 47;

-- Day 48 Plan (2026-11-14)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (48, 47, '2026-11-14', 'FINAL_SPRINT', 8, 'Full Mock Interview Simulation (4 Rounds)', 'Comprehensive 4-round technical mock interview simulation covering DSA, SQL, Project, and Full Stack.', 'FINAL_SPRINT_PLAN', 'Week 8: Mock Interview Week')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 48 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 48);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('INTERVIEW', 1, 'Round 1: DSA Coding Interview (45 mins)', 'Timed coding interview: 1 Medium + 1 Follow-up problem. Explain intuition, write clean code, analyze complexity.', 45, true, 'INTERVIEW_SPRINT', 'Final Sprint: Week 8 Interview Prep', 'Medium', '15 MCQs + 2 SQL'),
  ('INTERVIEW', 2, 'Round 2: Database & SQL Round (30 mins)', 'Schema design problem + 2 live SQL query challenges including aggregations and window functions.', 30, true, 'INTERVIEW_SPRINT', 'Final Sprint: Week 8 Interview Prep', 'Hard', '1 Simulation'),
  ('INTERVIEW', 3, 'Round 3: Project Architecture Defense (30 mins)', 'Explain system architecture, technical decisions, trade-offs, scaling limits, and security controls.', 30, true, 'INTERVIEW_SPRINT', 'Final Sprint: Week 8 Interview Prep', 'Hard', '1 Simulation'),
  ('INTERVIEW', 4, 'Round 4: Full Stack Technical Q&A (30 mins)', 'Deep dive into React lifecycle, state management, RESTful APIs, and asynchronous programming.', 30, true, 'INTERVIEW_SPRINT', 'Final Sprint: Week 8 Interview Prep', 'Hard', '1 Simulation'),
  ('REVIEW', 5, 'Mock Interview Evaluation & Scorecard', 'Score performance across problem-solving, code quality, communication, and technical depth.', 30, true, 'SPRINT_REVIEW', 'Week 8: Mock Interview Week Review', NULL, 'Sprint Assessment')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 48;

-- Day 49 Plan (2026-11-15)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (49, 48, '2026-11-15', 'FINAL_SPRINT', 8, 'Final Revision: Weak Topics, LeetCode & CS Core', 'Targeted revision focusing exclusively on personal weak spots and core computer science essentials.', 'FINAL_SPRINT_PLAN', 'Week 8: Mock Interview Week')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 49 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 49);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('DSA', 1, 'DSA Weak-Area Revisit', 'Re-solve 3 problems from your weakest topics without looking at hints or solutions.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 8: Mock Interview Week (DSA Core)', 'Hard', '1 Concept'),
  ('LEETCODE', 2, 'Selected Revision Problems (5 Classics)', 'Re-solve 5 essential interview benchmark problems across Arrays, Trees, Graphs, and DP.', 60, true, 'AUTHORITATIVE_DSA_PLAN', 'Week 8: Mock Interview Week (Practice)', 'Medium', '2 problems'),
  ('CS', 3, 'Core CS Flashcards Review', 'Comprehensive review: OOP principles, OS process/memory management, DBMS ACID/Indexes, CN protocols.', 45, true, 'CS_CORE', 'Operating Systems Core', 'Easy', '1 Topic'),
  ('PROJECT', 4, 'Resume & Project Bullet Points Polish', 'Refine resume project description using action verbs, technical keywords, and quantified impact.', 30, true, 'PROJECT_MILESTONES', 'Sprint Project Phase 5', 'Medium', '1 Milestone'),
  ('REVIEW', 5, 'Pre-Simulation Mental Preparation', 'Review optimal interview mindset: active listening, asking clarifying questions, graceful recovery from mistakes.', 20, true, 'SPRINT_REVIEW', 'Week 8: Mock Interview Week Review', NULL, 'Sprint Assessment')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 49;

-- Day 50 Plan (2026-11-16)
INSERT INTO public.sprint_day_plans (day_number, date_offset, calendar_date, phase, week_number, title, description, source_type, source_reference)
VALUES (50, 49, '2026-11-16', 'FINAL_SPRINT', 8, 'Final Placement Simulation & 50-Day Report', 'Culmination of the 50-day preparation sprint: Full placement simulation and final readiness report generation.', 'FINAL_SPRINT_PLAN', 'Week 8: Mock Interview Week')
ON CONFLICT (day_number) DO UPDATE
SET
  date_offset = EXCLUDED.date_offset,
  calendar_date = EXCLUDED.calendar_date,
  phase = EXCLUDED.phase,
  week_number = EXCLUDED.week_number,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  source_reference = EXCLUDED.source_reference,
  updated_at = NOW();

-- Day 50 Tasks
DELETE FROM public.sprint_day_tasks WHERE day_plan_id = (SELECT id FROM public.sprint_day_plans WHERE day_number = 50);
INSERT INTO public.sprint_day_tasks (day_plan_id, category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
SELECT id, t.category, t.task_order, t.title, t.description, t.estimated_minutes, t.required, t.source_type, t.source_reference, t.difficulty, t.target_value
FROM public.sprint_day_plans,
(VALUES
  ('INTERVIEW', 1, 'Part 1: Timed Placement DSA Assessment (90 mins)', '3-problem timed online assessment simulation (1 Easy, 1 Medium, 1 Hard). Strict time constraint.', 90, true, 'INTERVIEW_SPRINT', 'Final Sprint: Week 8 Interview Prep', 'Mixed', '3 problems (90m)'),
  ('INTERVIEW', 2, 'Part 2: SQL & CS Fundamentals Test (45 mins)', '15 multiple-choice CS questions + 2 hands-on SQL query problems.', 45, true, 'INTERVIEW_SPRINT', 'Final Sprint: Week 8 Interview Prep', 'Hard', '15 MCQs + 2 SQL'),
  ('INTERVIEW', 3, 'Part 3: Project Presentation & Technical Q&A (30 mins)', 'Present sprint project walkthrough, demo key flows, defend architecture and design choices.', 30, true, 'INTERVIEW_SPRINT', 'Final Sprint: Week 8 Interview Prep', 'Hard', '1 Simulation'),
  ('INTERVIEW', 4, 'Part 4: HR & Behavioral Communication (30 mins)', 'Deliver answers to classic behavioral prompts: "Tell me about yourself", "Why our company", "Handling failure".', 30, true, 'INTERVIEW_SPRINT', 'Final Sprint: Week 8 Interview Prep', 'Hard', '1 Simulation'),
  ('REVIEW', 5, 'Generate 50-Day Sprint Completion Report', 'Compile final sprint analytics: Total study hours, problems solved, readiness score, and placement certification.', 30, true, 'SPRINT_REVIEW', 'Week 8: Mock Interview Week Review', NULL, 'Sprint Assessment')
) AS t(category, task_order, title, description, estimated_minutes, required, source_type, source_reference, difficulty, target_value)
WHERE day_number = 50;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
