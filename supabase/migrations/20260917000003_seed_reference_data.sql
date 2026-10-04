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
