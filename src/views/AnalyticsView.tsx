import React, { useState, useEffect } from "react"
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Search,
  Target,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { DSAMetricCard } from "../components"
import { getAnalyticsData } from "../services"

import { useAuth, useTeam } from "../context"
import { supabase } from "../lib/supabaseClient"
import { calculateReadinessScore } from "../utils/calculations"
import { fetchUserCheckins, calculateStreak, calculateTotalStudyHours, type DailyCheckin } from "../services/dailyCheckinService"

export const AnalyticsView: React.FC = () => {
  const { user } = useAuth()
  const { currentTeam, currentSprint, members, sprintDayStatus } = useTeam()
  const {
    progress50Day,
    weeklyActivity,
    learningBreakdown,
    performanceTrends,
    teamAnalytics,
  } = getAnalyticsData()

  const [dsaCount, setDsaCount] = useState<number>(0)
  const [leetcodeCount, setLeetcodeCount] = useState<number>(0)
  const [fsCount, setFsCount] = useState<number>(0)
  const [projectCount, setProjectCount] = useState<number>(0)
  const [userCheckins, setUserCheckins] = useState<DailyCheckin[]>([])

  useEffect(() => {
    let isMounted = true
    if (user) {
      // Parallel fetch counts & check-ins
      Promise.all([
        supabase.from("user_dsa_progress").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "Solved"),
        supabase.from("user_leetcode_progress").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "Solved"),
        supabase.from("user_fullstack_progress").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "COMPLETED"),
        currentTeam?.id
          ? supabase.from("projects").select("id, tasks:project_tasks(id, is_completed)").eq("team_id", currentTeam.id)
          : Promise.resolve({ data: null }),
        currentSprint?.id
          ? fetchUserCheckins(user.id, currentSprint.id)
          : Promise.resolve({ checkins: [] as DailyCheckin[] }),
      ]).then(([dsaRes, lcRes, fsRes, prjRes, checkinRes]) => {
        if (!isMounted) return
        if (dsaRes.count !== null) setDsaCount(dsaRes.count)
        if (lcRes.count !== null) setLeetcodeCount(lcRes.count)
        if (fsRes.count !== null) setFsCount(fsRes.count)
        if (prjRes.data) {
          let prjCompleted = 0
          for (const p of prjRes.data as any[]) {
            if (Array.isArray(p.tasks)) {
              prjCompleted += p.tasks.filter((t: any) => t.is_completed).length
            }
          }
          setProjectCount(prjCompleted)
        }
        if (checkinRes && checkinRes.checkins) {
          setUserCheckins(checkinRes.checkins)
        }
      }).catch(console.warn)
    }
    return () => {
      isMounted = false
    }
  }, [user, currentTeam?.id, currentSprint?.id])

  const dsaPercent = Math.min(100, Math.round((dsaCount / 70) * 100))
  const leetcodePercent = Math.min(100, Math.round((leetcodeCount / 150) * 100))
  const fullstackPercent = Math.min(100, Math.round((fsCount / 23) * 100))
  const projectPercent = Math.min(100, Math.round((projectCount / 20) * 100))

  const readinessScore = calculateReadinessScore(
    dsaPercent,
    leetcodePercent,
    fullstackPercent,
    projectPercent,
  )

  const currentDay = sprintDayStatus?.currentDay || 8
  const displayedMembers = members.length > 0 ? members : []

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      <header className="flex justify-between items-center mb-5 shrink-0">
        <div>
          <p className="text-text-secondary text-xs font-bold tracking-wider uppercase mb-0.5">
            Analytics
          </p>
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
              Analytics
            </h1>
            <span className="text-text-secondary text-sm font-medium">
              Understand your progress. Improve your performance. Become
              interview-ready.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="hidden lg:flex bg-surface-white border border-border-light rounded-xl p-1 shadow-sm shrink-0">
            <button className="px-3 py-1.5 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors">
              This Week
            </button>
            <button className="px-3 py-1.5 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors">
              This Month
            </button>
            <button className="bg-primary-purple/10 text-primary-purple px-3 py-1.5 rounded-lg text-xs font-bold">
              50 Days
            </button>
          </div>

          <div className="relative flex items-center group hidden sm:flex">
            <Search
              size={16}
              className="absolute left-3 text-text-secondary group-focus-within:text-primary-purple transition-colors"
            />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-2 rounded-xl bg-surface-white border border-border-light focus:outline-none focus:ring-2 focus:ring-primary-purple/20 focus:border-primary-purple transition-all w-48 text-sm font-medium text-text-primary placeholder:font-normal shadow-sm"
            />
          </div>

          <button className="relative w-10 h-10 rounded-xl bg-surface-white border border-border-light flex items-center justify-center text-text-secondary hover:text-primary-purple hover:border-primary-purple/30 transition-all shadow-sm shrink-0">
            <Bell size={18} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent-pink rounded-full ring-2 ring-surface-white"></span>
          </button>

          <div className="hidden sm:flex -space-x-3 hover:-space-x-2 transition-all duration-300">
            {displayedMembers.slice(0, 3).map((m, idx) => (
              <img
                key={m.userId || idx}
                src={m.avatar}
                alt={m.name}
                title={m.name}
                className="w-10 h-10 rounded-full border-2 border-app-bg object-cover shadow-sm"
              />
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6 space-y-6">
        {/* Top Summary Section */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
          <div className="xl:col-span-4 flex">
            <div className="bg-gradient-to-br from-accent-pink to-primary-purple rounded-[24px] p-6 shadow-md text-white flex flex-col justify-between relative overflow-hidden h-full group min-h-[160px] w-full">
              <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-xl"></div>

              <div className="z-10 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white/90 tracking-wider text-xs uppercase mb-1">
                    PLACEMENT READINESS
                  </h3>
                  <p className="text-5xl font-extrabold tracking-tight mt-1">
                    {readinessScore}
                    <span className="text-3xl opacity-80">%</span>
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-2.5 px-4 text-center border border-white/20">
                  <p className="text-[10px] uppercase font-bold text-white/90 tracking-wider mb-0.5">
                    Status
                  </p>
                  <p className="text-xs font-extrabold text-white">
                    {readinessScore > 0 ? "IN PROGRESS" : "BASELINE"}
                  </p>
                </div>
              </div>

              <div className="z-10 mt-5 space-y-3">
                <p className="text-sm font-bold text-white mb-2">
                  Sprint Day {currentDay} of 50
                </p>
                <div className="grid grid-cols-2 gap-4 bg-black/10 rounded-xl p-3 border border-white/10">
                  <div>
                    <p className="text-white/80 text-[10px] uppercase font-bold tracking-wider mb-0.5">
                      Your Progress
                    </p>
                    <p className="text-sm font-bold text-white">{readinessScore}%</p>
                  </div>
                  <div>
                    <p className="text-white/80 text-[10px] uppercase font-bold tracking-wider mb-0.5">
                      Sprint Day
                    </p>
                    <p className="text-sm font-bold text-white">Day {currentDay}</p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-white/10 flex justify-between items-center">
                    <span className="text-white/80 text-[10px] uppercase font-bold tracking-wider">
                      Target: 100% by Day 50
                    </span>
                    <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-md">
                      Day {currentDay} / 50
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <DSAMetricCard
              title="DSA"
              mainStat={`${dsaPercent}%`}
              subStats={[
                { label: "Problems", value: `${dsaCount} / 70` },
                { label: "Target", value: "70 Total" },
              ]}
            />
            <DSAMetricCard
              title="LeetCode"
              mainStat={`${leetcodePercent}%`}
              subStats={[
                { label: "Solved", value: `${leetcodeCount} / 150` },
                { label: "Target", value: "150 Total" },
              ]}
            />
            <DSAMetricCard
              title="Full Stack"
              mainStat={`${fullstackPercent}%`}
              subStats={[
                { label: "Modules", value: `${fsCount} / 23` },
                { label: "Target", value: "23 Total" },
              ]}
            />
            <DSAMetricCard
              title="Projects"
              mainStat={`${projectPercent}%`}
              subStats={[
                { label: "Tasks", value: `${projectCount} / 20` },
                { label: "Phase", value: "Milestone 1" },
              ]}
            />
          </div>
        </div>

        {/* 50 Day Progress Chart */}
        <div className="bg-surface-white rounded-[32px] p-6 shadow-sm border border-border-light min-h-[300px] flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
                50-Day Progress
              </h2>
              <p className="text-sm font-medium text-text-secondary mt-1">
                Comparing overall progress against the expected 50-day
                trajectory.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-purple"></div>
                <span className="text-xs font-bold text-text-secondary">
                  Overall Progress
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-border-light border border-text-secondary border-dashed"></div>
                <span className="text-xs font-bold text-text-secondary">
                  Expected Progress
                </span>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={progress50Day}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-primary-purple)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-primary-purple)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "var(--color-text-secondary)",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "var(--color-text-secondary)",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                  dx={-10}
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  cursor={{
                    stroke: "var(--color-primary-purple)",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-surface-white border border-border-light text-text-primary text-xs py-2 px-3 rounded-xl shadow-lg font-medium">
                          <p className="font-bold text-text-secondary mb-1">
                            {label}
                          </p>
                          <p className="font-extrabold text-primary-purple mb-0.5">
                            Actual: {payload[0]?.value}%
                          </p>
                          <p className="font-bold text-text-secondary">
                            Expected: {payload[1]?.value}%
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="expected"
                  stroke="var(--color-text-secondary)"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  fillOpacity={0}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="var(--color-primary-purple)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorActual)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity & Learning */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface-white rounded-[32px] p-6 shadow-sm border border-border-light min-h-[300px] flex flex-col">
            <h3 className="font-bold text-text-primary text-base tracking-tight mb-6">
              Weekly Activity
            </h3>
            <div className="flex-1 w-full mt-2 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyActivity}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "var(--color-text-secondary)",
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "var(--color-text-secondary)",
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                    dx={-10}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--color-app-bg)" }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-surface-white border border-border-light p-3 rounded-xl shadow-lg">
                            <p className="text-[10px] font-bold text-text-secondary uppercase mb-2">
                              {label}
                            </p>
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-text-primary">
                                <span className="inline-block w-3 h-3 rounded bg-primary-purple mr-1"></span>{" "}
                                Study: {payload[0].value}h
                              </p>
                              <p className="text-xs font-bold text-text-primary">
                                <span className="inline-block w-3 h-3 rounded bg-soft-purple mr-1"></span>{" "}
                                Problems: {payload[1].value}
                              </p>
                              <p className="text-xs font-bold text-text-primary">
                                <span className="inline-block w-3 h-3 rounded bg-accent-pink mr-1"></span>{" "}
                                Tasks: {payload[2].value}
                              </p>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar
                    dataKey="study"
                    stackId="a"
                    fill="var(--color-primary-purple)"
                    radius={[0, 0, 4, 4]}
                    barSize={32}
                  />
                  <Bar
                    dataKey="problems"
                    stackId="a"
                    fill="var(--color-soft-purple)"
                    barSize={32}
                  />
                  <Bar
                    dataKey="tasks"
                    stackId="a"
                    fill="var(--color-accent-pink)"
                    radius={[4, 4, 0, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary-purple"></div>
                <span className="text-[10px] font-bold text-text-secondary uppercase">
                  Study Hours
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-soft-purple"></div>
                <span className="text-[10px] font-bold text-text-secondary uppercase">
                  Problems
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-accent-pink"></div>
                <span className="text-[10px] font-bold text-text-secondary uppercase">
                  Tasks
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 bg-surface-white rounded-[32px] p-6 shadow-sm border border-border-light flex flex-col justify-between">
            <h3 className="font-bold text-text-primary text-base tracking-tight mb-2">
              Learning Breakdown
            </h3>
            <div className="w-full flex-1 min-h-[160px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={learningBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {learningBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-surface-white border border-border-light text-xs font-bold text-text-primary px-3 py-1.5 rounded-lg shadow-sm">
                            {payload[0].name}: {payload[0].value} hrs
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col mt-1">
                <span className="text-2xl font-extrabold text-text-primary">
                  88
                </span>
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  Hrs Total
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 mt-4">
              {learningBreakdown.map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-xs font-bold text-text-primary">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-text-secondary">
                    {item.value} hrs
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trends & Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-white rounded-[32px] p-6 shadow-sm border border-border-light flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-text-primary text-base tracking-tight">
                  Performance Trend
                </h3>
                <p className="text-[10px] text-primary-purple font-bold mt-1 uppercase tracking-wider">
                  +32% improvement since Week 1
                </p>
              </div>
            </div>
            <div className="flex-1 w-full min-h-[180px] -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={performanceTrends}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-primary-purple)"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-primary-purple)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="week"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "var(--color-text-secondary)",
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "var(--color-text-secondary)",
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                    dx={-10}
                  />
                  <Tooltip
                    cursor={{
                      stroke: "var(--color-primary-purple)",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                    }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-surface-white border border-border-light px-3 py-1.5 rounded-lg shadow-sm">
                            <p className="text-[10px] font-bold text-text-secondary mb-0.5 uppercase">
                              {label}
                            </p>
                            <p className="text-xs font-extrabold text-primary-purple">
                              {payload[0].value}% Readiness
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="progress"
                    stroke="var(--color-primary-purple)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTrend)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface-white rounded-[32px] p-6 shadow-sm border border-border-light flex flex-col">
            <h3 className="font-bold text-text-primary text-base tracking-tight mb-6">
              Goal vs Actual
            </h3>

            <div className="flex flex-col gap-6 flex-1 justify-center">
              {[
                { name: "LeetCode", target: "150", current: "87", percent: 58 },
                { name: "DSA", target: "70", current: "43", percent: 61 },
                {
                  name: "Full Stack",
                  target: "20 mods",
                  current: "12",
                  percent: 60,
                },
                {
                  name: "Projects",
                  target: "2 complete",
                  current: "1",
                  percent: 50,
                },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-text-primary">
                      {item.name}
                    </span>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-primary-purple">
                        {item.current}
                      </span>
                      <span className="text-[10px] font-bold text-text-secondary ml-1">
                        / {item.target}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-app-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-purple rounded-full"
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-white rounded-[32px] p-6 shadow-sm border border-border-light">
            <h3 className="font-bold text-text-primary text-base tracking-tight mb-1">
              Your Strengths
            </h3>
            <p className="text-[10px] text-text-secondary font-bold mb-5">
              These areas are currently your strongest.
            </p>

            <div className="space-y-4">
              {[
                { name: "Problem Solving", score: 86 },
                { name: "Frontend Development", score: 82 },
                { name: "Consistency", score: 80 },
                { name: "Project Execution", score: 78 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-text-primary">{item.name}</span>
                    <span className="text-green-500">{item.score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-app-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-white rounded-[32px] p-6 shadow-sm border border-border-light">
            <h3 className="font-bold text-text-primary text-base tracking-tight mb-1">
              Needs Attention
            </h3>
            <p className="text-[10px] text-text-secondary font-bold mb-5">
              Areas that require improvement.
            </p>

            <div className="space-y-4">
              {[
                { name: "Dynamic Programming", score: 32 },
                { name: "Backend Development", score: 44 },
                { name: "System Design", score: 38 },
                { name: "Mock Interviews", score: 41 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-text-primary">{item.name}</span>
                    <span className="text-accent-pink">{item.score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-app-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-pink rounded-full"
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-5 w-full py-2 bg-app-bg hover:bg-border-light text-text-primary font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors">
              VIEW FOCUS AREAS
            </button>
          </div>
        </div>

        {/* 50-Day Milestones */}
        <div className="bg-surface-white rounded-[32px] p-6 shadow-sm border border-border-light">
          <h3 className="font-bold text-text-primary text-base tracking-tight mb-6">
            50-Day Milestones
          </h3>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative gap-6 md:gap-2">
            <div className="hidden md:block absolute top-1/2 left-4 right-4 h-1 bg-app-bg -z-10 -translate-y-1/2 rounded-full"></div>
            <div
              className="hidden md:block absolute top-1/2 left-4 h-1 bg-primary-purple -z-10 -translate-y-1/2 rounded-full"
              style={{ width: `${Math.min(100, Math.round((currentDay / 50) * 100))}%` }}
            ></div>

            {[
              {
                day: 10,
                title: "Foundation",
                status: currentDay > 10 ? "Complete" : currentDay === 10 ? "In Progress" : "Upcoming",
                done: currentDay > 10,
                current: currentDay <= 10,
              },
              {
                day: 20,
                title: "Core DSA",
                status: currentDay > 20 ? "Complete" : currentDay > 10 && currentDay <= 20 ? "In Progress" : "Upcoming",
                done: currentDay > 20,
                current: currentDay > 10 && currentDay <= 20,
              },
              {
                day: 30,
                title: "Adv. DSA + Dev",
                status: currentDay > 30 ? "Complete" : currentDay > 20 && currentDay <= 30 ? "In Progress" : "Upcoming",
                done: currentDay > 30,
                current: currentDay > 20 && currentDay <= 30,
              },
              {
                day: 40,
                title: "Projects + Prep",
                status: currentDay > 40 ? "Complete" : currentDay > 30 && currentDay <= 40 ? "In Progress" : "Upcoming",
                done: currentDay > 40,
                current: currentDay > 30 && currentDay <= 40,
              },
              {
                day: 50,
                title: "Placement Ready",
                status: currentDay >= 50 ? "Complete" : "Target",
                done: currentDay >= 50,
                current: currentDay > 40 && currentDay <= 50,
              },
            ].map((milestone, i) => (
              <div
                key={i}
                className="flex md:flex-col items-center gap-4 md:gap-3 z-10 w-full md:w-auto relative"
              >
                <div className="hidden md:block absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  {milestone.current && (
                    <span className="bg-primary-purple text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">
                      CURRENT: DAY {currentDay}
                    </span>
                  )}
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border-2 ${
                    milestone.done
                      ? "bg-primary-purple border-primary-purple text-white"
                      : milestone.current
                        ? "bg-surface-white border-primary-purple text-primary-purple"
                        : "bg-surface-white border-border-light text-text-secondary"
                  }`}
                >
                  {milestone.done ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <span className="text-xs font-bold">{i + 1}</span>
                  )}
                </div>
                <div className="md:text-center flex-1 md:flex-none">
                  <p
                    className={`text-xs font-bold ${
                      milestone.current
                        ? "text-primary-purple"
                        : "text-text-primary"
                    }`}
                  >
                    {milestone.title}
                  </p>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mt-0.5">
                    Day {milestone.day} • {milestone.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Analytics & Consistency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-white rounded-[32px] p-6 shadow-sm border border-border-light flex flex-col h-full">
            <h3 className="font-bold text-text-primary text-base tracking-tight mb-4">
              Team Performance
            </h3>

            <div className="flex flex-col gap-4 overflow-x-auto custom-scrollbar flex-1">
              {displayedMembers.length > 0 ? (
                displayedMembers.map((member, i) => (
                  <div
                    key={member.userId || i}
                    className="bg-app-bg/50 border border-border-light/50 p-4 rounded-2xl min-w-[300px]"
                  >
                    <div className="flex justify-between items-center mb-3 border-b border-border-light/50 pb-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="font-extrabold text-text-primary text-sm">
                          {member.name}
                        </span>
                      </div>
                      <span className="font-extrabold text-primary-purple text-sm">
                        {member.progress || 0}%
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-0.5">
                          DSA
                        </p>
                        <p className="text-xs font-bold text-text-primary">
                          {member.progress || 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-0.5">
                          LeetCode
                        </p>
                        <p className="text-xs font-bold text-text-primary">
                          {member.progress || 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-0.5">
                          Full Stack
                        </p>
                        <p className="text-xs font-bold text-text-primary">
                          {member.progress || 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-0.5">
                          Projects
                        </p>
                        <p className="text-xs font-bold text-text-primary">
                          {member.progress || 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-text-secondary text-xs font-medium">
                  No teammates registered yet
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface-white rounded-[32px] p-6 shadow-sm border border-border-light flex flex-col h-full">
            <h3 className="font-bold text-text-primary text-base tracking-tight mb-4">
              Consistency
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-app-bg p-3 rounded-xl border border-border-light/50">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Current Streak
                </p>
                <p className="text-lg font-extrabold text-primary-purple flex items-center gap-1.5">
                  <span className="text-sm">🔥</span> {calculateStreak(userCheckins)} Days
                </p>
              </div>
              <div className="bg-app-bg p-3 rounded-xl border border-border-light/50">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Best Streak
                </p>
                <p className="text-lg font-extrabold text-text-primary">
                  {calculateStreak(userCheckins)} Days
                </p>
              </div>
              <div className="bg-app-bg p-3 rounded-xl border border-border-light/50">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Days Completed
                </p>
                <p className="text-lg font-extrabold text-text-primary">
                  {userCheckins.length} / {currentDay}
                </p>
              </div>
              <div className="bg-app-bg p-3 rounded-xl border border-border-light/50">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Avg. Daily Study
                </p>
                <p className="text-lg font-extrabold text-text-primary">
                  {userCheckins.length > 0 ? (
                    (() => {
                      const totalHrs = calculateTotalStudyHours(userCheckins)
                      const avg = totalHrs / userCheckins.length
                      const h = Math.floor(avg)
                      const m = Math.round((avg - h) * 60)
                      return `${h}h ${m}m`
                    })()
                  ) : (
                    "0h 0m"
                  )}
                </p>
              </div>
            </div>

            <div className="mt-auto">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                Last 3 Weeks Activity
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {Array.from({ length: 21 }).map((_, i) => {
                  const isActive = i < userCheckins.length
                  return (
                    <div
                      key={i}
                      className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-md ${
                        isActive
                          ? "bg-primary-purple"
                          : "bg-app-bg border border-border-light"
                      }`}
                    ></div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Readiness Breakdown & Next Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 bg-surface-white rounded-[32px] p-6 shadow-sm border border-border-light">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-text-primary text-base tracking-tight">
                Interview Readiness
              </h3>
              <span className="text-2xl font-extrabold text-primary-purple">
                {readinessScore}%
              </span>
            </div>

            <div className="space-y-4">
              {[
                { name: "DSA", score: dsaPercent, color: "bg-primary-purple" },
                {
                  name: "Problem Solving",
                  score: leetcodePercent,
                  color: "bg-primary-purple",
                },
                { name: "Full Stack", score: fullstackPercent, color: "bg-primary-purple" },
                { name: "Projects", score: projectPercent, color: "bg-primary-purple" },
                {
                  name: "CS Fundamentals",
                  score: 0,
                  color: "bg-primary-purple",
                },
                {
                  name: "Communication",
                  score: 0,
                  color: "bg-primary-purple",
                },
                {
                  name: "Mock Interviews",
                  score: 0,
                  color: "bg-accent-pink",
                  highlight: true,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={
                    item.highlight
                      ? "bg-accent-pink/5 p-3 rounded-xl border border-accent-pink/20 -mx-3"
                      : "px-0"
                  }
                >
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-text-primary">{item.name}</span>
                    <span
                      className={
                        item.highlight
                          ? "text-accent-pink"
                          : "text-text-primary"
                      }
                    >
                      {item.score}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-app-bg rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                  {item.highlight && (
                    <p className="text-[10px] font-bold text-accent-pink mt-2">
                      Action: Schedule 1 mock interview this week.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col gap-6 w-full">
            <div className="bg-gradient-to-b from-primary-purple/5 to-surface-white rounded-[24px] p-5 shadow-sm border border-primary-purple/20 flex flex-col h-full">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-primary-purple text-white flex items-center justify-center shadow-md">
                  <Target size={16} strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-text-primary text-sm tracking-tight leading-tight">
                  Your Next Focus
                </h3>
              </div>

              <div className="flex-1 flex flex-col gap-3 mb-6">
                {[
                  "Practice Dynamic Programming",
                  "Complete Backend Authentication",
                  "Solve 5 Medium LeetCode Problems",
                  "Complete 1 Mock Interview",
                ].map((task, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 bg-surface-white p-2.5 rounded-xl border border-border-light shadow-sm"
                  >
                    <div className="w-5 h-5 rounded-md bg-app-bg flex items-center justify-center text-text-secondary font-bold text-[10px] shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-xs font-bold text-text-primary pt-0.5 leading-tight">
                      {task}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-auto">
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-4 text-center">
                  <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-0.5">
                    Expected Impact
                  </p>
                  <p className="text-xs font-extrabold text-green-600">
                    +7–10% readiness
                  </p>
                </div>
                <button className="w-full py-2.5 bg-primary-purple hover:bg-deep-purple text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                  VIEW ACTION PLAN <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="bg-surface-white rounded-[24px] p-5 shadow-sm border border-border-light flex flex-col">
              <h3 className="font-bold text-text-primary text-sm tracking-tight mb-4">
                Smart Insights
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2
                    size={14}
                    className="text-green-500 mt-0.5 shrink-0"
                  />
                  <p className="text-xs font-medium text-text-secondary leading-tight">
                    <span className="font-bold text-text-primary">
                      {readinessScore > 0 ? `${readinessScore}% Readiness` : "Sprint in progress"}
                    </span>{" "}
                    tracking toward Day {currentDay} targets.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2
                    size={14}
                    className="text-green-500 mt-0.5 shrink-0"
                  />
                  <p className="text-xs font-medium text-text-secondary leading-tight">
                    <span className="font-bold text-text-primary">
                      LeetCode consistency
                    </span>{" "}
                    is improving this week.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent-pink text-xs shrink-0 mt-0.5">
                    ⚠
                  </span>
                  <p className="text-xs font-medium text-text-secondary leading-tight">
                    <span className="font-bold text-text-primary">
                      Dynamic Programming
                    </span>{" "}
                    is currently your weakest DSA area.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent-pink text-xs shrink-0 mt-0.5">
                    ⚠
                  </span>
                  <p className="text-xs font-medium text-text-secondary leading-tight">
                    <span className="font-bold text-text-primary">
                      Mock interview practice
                    </span>{" "}
                    is behind schedule.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2
                    size={14}
                    className="text-green-500 mt-0.5 shrink-0"
                  />
                  <p className="text-xs font-medium text-text-secondary leading-tight">
                    <span className="font-bold text-text-primary">
                      Project progress
                    </span>{" "}
                    is ahead of the sprint target.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default AnalyticsView
