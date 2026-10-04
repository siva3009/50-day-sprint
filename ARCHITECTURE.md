# Architecture Documentation: 50 DAY SPRINT

## 1. Overview
The **50 DAY SPRINT** application is a focused placement readiness tracker engineered for a small team of 2–5 college peers preparing together across Data Structures & Algorithms, LeetCode, Full Stack Development, Projects, and Analytics.

This document outlines the modular frontend architecture established following the extraction of the monolithic `App.tsx` (5,751 lines) into a maintainable, type-safe, and service-oriented structure designed for seamless transition from mock data to Supabase.

---

## 2. Directory Structure

```
src/
├── types/                     # Strong TypeScript domain interfaces & types
│   ├── common.ts              # ActiveView, metric card props, common enums
│   ├── dsa.ts                 # DSA topics, problems, revision queue, roadmaps
│   ├── leetcode.ts            # LeetCode problems, weekly stats, performance
│   ├── fullstack.ts           # FS modules, stages, skills, completed topics
│   ├── projects.ts            # Project features, milestones, activities
│   ├── analytics.ts           # 50-day trajectory, member analytics, trends
│   ├── team.ts                # Peer activity items, team member info
│   ├── settings.ts            # User profile, sprint configuration, tabs
│   └── index.ts               # Barrel export for all types
│
├── data/                      # Preserved mock data fixtures
│   ├── dashboardData.ts       # 50-day chart, today focus, today mission
│   ├── dsaData.ts             # DSA topics, problems, revision queue
│   ├── leetcodeData.ts        # Problem list, difficulty breakdown, weekly chart
│   ├── fullstackData.ts       # Full stack roadmap modules, skills, weak areas
│   ├── projectsData.ts        # Active project tasks, milestones, team roles
│   ├── analyticsData.ts       # Trajectory comparison, breakdowns, velocity
│   ├── teamData.ts            # Real-time peer activity stream
│   ├── settingsData.ts        # Initial profile, sprint goals, notifications
│   └── index.ts               # Barrel export for mock data fixtures
│
├── utils/                     # Pure calculation logic and helpers
│   ├── calculations.ts        # Streak, readiness, track progress calculators
│   └── index.ts               # Barrel export for utilities
│
├── services/                  # Data access abstraction boundary
│   ├── dashboardService.ts    # getDashboardData()
│   ├── dsaService.ts          # getDSAData()
│   ├── leetcodeService.ts     # getLeetCodeData()
│   ├── fullstackService.ts    # getFullStackData()
│   ├── projectsService.ts     # getProjectsData()
│   ├── analyticsService.ts    # getAnalyticsData()
│   ├── settingsService.ts     # getSettingsData()
│   ├── teamService.ts         # getTeamData()
│   └── index.ts               # Barrel export for service endpoints
│
├── components/                # Reusable presentation & feature cards
│   ├── common/                # Shared layout & reusable cards
│   │   ├── Header.tsx         # Page breadcrumb, title, date display
│   │   ├── Sidebar.tsx        # Vertical navigation with route triggers
│   │   ├── FriendsPanel.tsx   # Peer activity and team progress sidebar
│   │   ├── DSAMetricCard.tsx
│   │   ├── MissionCardTemplate.tsx
│   │   ├── DifficultyCard.tsx
│   │   ├── RevisionQueueCard.tsx
│   │   ├── WeakAreasCard.tsx
│   │   └── TopicPerformanceCard.tsx
│   ├── dashboard/             # Specialized dashboard cards
│   │   ├── DashboardOverviewCard.tsx
│   │   ├── DashboardMissionCard.tsx
│   │   ├── DashboardReadinessCard.tsx
│   │   ├── DashboardProgressCard.tsx
│   │   └── DashboardFocusCard.tsx
│   ├── dsa/                   # DSA specific components
│   │   ├── DSAMainProgress.tsx
│   │   └── RoadmapTopicCard.tsx
│   ├── leetcode/              # LeetCode specific components
│   │   ├── LeetcodeGoalCard.tsx
│   │   └── WeeklyPerformanceCard.tsx
│   └── index.ts               # Barrel export for components
│
├── layouts/                   # Application shell layouts
│   ├── AppLayout.tsx          # Shell layout (Sidebar + Main + FriendsPanel)
│   └── index.ts               # Barrel export for layouts
│
├── views/                     # Top-level screen views
│   ├── DashboardView.tsx      # Main dashboard with readiness & missions
│   ├── DSAView.tsx            # DSA syllabus, problems, and revision queue
│   ├── LeetCodeView.tsx       # Solved problems, difficulty breakdown, weekly chart
│   ├── FullStackView.tsx      # Modules, stages, skills progress, weak areas
│   ├── ProjectsView.tsx       # Active project roadmap, backlog, milestones
│   ├── AnalyticsView.tsx      # 50-day trajectory, breakdowns, member analytics
│   ├── SettingsView.tsx       # Profile, sprint, team, notifications, appearance
│   └── index.ts               # Barrel export for views
│
├── App.tsx                    # Root orchestrator (~38 lines)
├── main.tsx                   # React entry point
└── index.css                  # Tailwind CSS v4 design tokens and theme
```

---

## 3. Architecture Layers & Responsibilities

### A. Root Orchestration (`src/App.tsx`)
- Maintains top-level route state (`activeView: ActiveView`).
- Composes `AppLayout` with view components.
- Completely decoupled from concrete data arrays or heavy business logic.
- Total size reduced from **5,751 lines** to **38 lines**.

### B. Layout Layer (`src/layouts/`)
- `AppLayout`: Encapsulates the outer application grid, rendering the sticky `Sidebar` on the left, primary view container in the center, and conditional `FriendsPanel` on the right (visible on wide screens during Dashboard view).

### C. Views Layer (`src/views/`)
- Seven independent views (`DashboardView`, `DSAView`, `LeetCodeView`, `FullStackView`, `ProjectsView`, `AnalyticsView`, `SettingsView`).
- Each view is responsible only for orchestrating its section's layout and delegating data fetching to the corresponding service.
- Views do not import raw mock data files directly; they communicate via typed service contracts.

### D. Component Layer (`src/components/`)
- Presentation components partitioned into `common/`, `dashboard/`, `dsa/`, and `leetcode/`.
- Reusable cards (`DSAMetricCard`, `MissionCardTemplate`, `DifficultyCard`, `RevisionQueueCard`, `WeakAreasCard`) encapsulate repeated UI patterns across DSA and LeetCode views.

### E. Service Layer (`src/services/`)
- Serves as the strict **Data Access Boundary**.
- Current implementation returns synchronous mock data.
- When migrating to Supabase, UI components require **zero code changes**—only the internal implementation of these service functions will swap from static objects to Supabase client queries (`supabase.from(...).select(...)`).

### F. Data Layer (`src/data/`)
- Contains untouched, authentic Figma mock fixtures.
- Retained to guarantee 100% visual fidelity and regression-free development.

### G. Calculation Utilities (`src/utils/calculations.ts`)
- Pure functions for metric computations:
  - `calculateCurrentDay(startDate)`
  - `calculateDSAProgress(topics)`
  - `calculateLeetCodeProgress(solved, total)`
  - `calculateFullStackProgress(modules)`
  - `calculateProjectProgress(features)`
  - `calculateReadinessScore(dsa, lc, fs, prj)`

---

## 4. Backend Foundation & Supabase Integration

The backend foundation has been initialized with the following structure:

```
supabase/
└── migrations/
    ├── 20260917000001_create_core_schema.sql       # 16 tables, constraints, foreign keys, triggers
    ├── 20260917000002_enable_rls_and_policies.sql   # RLS on all 16 tables with auth.uid() & team security
    └── 20260917000003_seed_reference_data.sql       # Master DSA topics, problems, and fullstack modules

src/
├── lib/
│   ├── supabaseClient.ts                            # Validated client singleton & safe fallback
│   └── index.ts                                     # Barrel export
└── types/
    └── database.ts                                  # Complete typed PostgreSQL Database schema
```

### Core Schema (16 Tables)
1. `profiles`: Extends `auth.users`, user metadata (college, role, social links).
2. `teams`: Collaborative groups (max 5 members) with unique `invite_code`.
3. `team_members`: Membership table with roles (`owner`, `member`).
4. `sprints`: Sprint parameters (50 days, daily/weekly target study hours).
5. `daily_checkins`: Daily log with study hours, tasks completed, unique per `(user_id, sprint_id, checkin_date)`.
6. `dsa_topics`: Master syllabus of 17 topics across 6 categories.
7. `dsa_problems`: Curated practice problems mapped to topics.
8. `user_dsa_progress`: Individual solve tracking with revision scheduling.
9. `leetcode_problems`: Master LeetCode problem library.
10. `user_leetcode_progress`: Individual LeetCode attempts and revision status.
11. `fullstack_modules`: Master curriculum of 5 stages and 23 modules.
12. `user_fullstack_progress`: Individual progress on each module.
13. `projects`: Team project milestones and deliverables.
14. `project_tasks`: Project backlog items and member assignments.
15. `team_activities`: Realtime activity stream for the Friends panel.
16. `user_settings`: User preference toggles (theme, notifications).

### Client Boundary
- Client singleton resides strictly in `src/lib/supabaseClient.ts`.
- Validates `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Components and views do not call Supabase directly; they will consume `src/services/` and `src/context/`.

### Authentication & Profile Architecture
- `src/context/AuthContext.tsx`: Manages active user session, session persistence via Supabase Auth, and real-time auth state subscription (`supabase.auth.onAuthStateChange`).
- `src/services/profileService.ts`: Data boundary querying and updating the `profiles` table in Supabase.
- `src/views/AuthView.tsx`: Unauthenticated screen for Sign In, Sign Up, and Password Reset.
- `src/App.tsx`: Application-level authentication guard that prevents unauthenticated access to the private dashboard and curriculum.
- `src/views/SettingsView.tsx`: Bound directly to the authenticated user's profile with real read/write capabilities.
- `src/components/common/Sidebar.tsx`: Connected Logout action that calls `supabase.auth.signOut()` and returns the user to `AuthView`.

---

## 5. Quality & Verification Metrics
- **Strict TypeScript Compliance**: `npx tsc --noEmit` passes with 0 errors.
- **Production Bundle**: `npm run build` succeeds cleanly.
- **Environment Safety**: `.env.example` contains only placeholders; secrets are protected in `.env.local`.
- **Database Safety**: All migrations are additive, reproducible, versioned, and protected by RLS.
- **Auth Security**: Zero mock session fallback; unauthenticated users cannot access private application views.


