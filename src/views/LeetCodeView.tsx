import React, { useEffect, useState } from "react"
import { Filter, MoreHorizontal, Search, Target } from "lucide-react"
import {
  DifficultyCard,
  DSAMetricCard,
  Header,
  LeetcodeGoalCard,
  MissionCardTemplate,
  RevisionQueueCard,
  TopicPerformanceCard,
  WeeklyPerformanceCard,
} from "../components"
import { recentProblems } from "../data"
import { getLeetCodeData, fetchUserCheckins, calculateStreak } from "../services"
import { fetchSprintDayPlan } from "../services/sprintPlanService"
import { supabase } from "../lib/supabaseClient"
import { useAuth, useTeam } from "../context"
import type { SprintDayPlan } from "../types/sprintPlan"

export const LeetCodeView: React.FC = () => {
  const { user } = useAuth()
  const { currentSprint, sprintDayStatus } = useTeam()
  const { problems, revisionQueue } = getLeetCodeData()

  const [solvedCount, setSolvedCount] = useState<number>(0)
  const [thisWeekCount, setThisWeekCount] = useState<number>(0)
  const [streakDays, setStreakDays] = useState<number>(0)
  const [dayPlan, setDayPlan] = useState<SprintDayPlan | null>(null)

  const currentDay = sprintDayStatus?.currentDay || 8

  useEffect(() => {
    let isMounted = true

    fetchSprintDayPlan(currentDay).then((plan) => {
      if (isMounted) setDayPlan(plan)
    }).catch(console.warn)

    if (user && currentSprint?.id) {
      // Fetch user's real LeetCode solved count
      supabase
        .from("user_leetcode_progress")
        .select("id, solved_at")
        .eq("user_id", user.id)
        .eq("status", "Solved")
        .then(({ data }) => {
          if (isMounted && data) {
            setSolvedCount(data.length)
            const oneWeekAgo = new Date()
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
            const weekSolved = data.filter(
              (r) => r.solved_at && new Date(r.solved_at) >= oneWeekAgo,
            ).length
            setThisWeekCount(weekSolved)
          }
        })

      // Fetch user's real streak
      fetchUserCheckins(user.id, currentSprint.id).then(({ checkins }) => {
        if (isMounted) {
          setStreakDays(calculateStreak(checkins))
        }
      })
    }

    return () => {
      isMounted = false
    }
  }, [user, currentSprint?.id, currentDay])

  const targetGoal = 150
  const percent = Math.min(100, Math.round((solvedCount / targetGoal) * 100))
  const leetcodeTask = dayPlan?.tasks?.find((t) => t.category === "LEETCODE")

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      <Header
        breadcrumb="Practice"
        title="LeetCode"
        subtitle="Build problem-solving consistency in 50 days"
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6 space-y-6">
        {/* Top Summary Section */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
          <div className="xl:col-span-5 flex">
            <div className="bg-gradient-to-br from-primary-purple to-deep-purple rounded-[24px] p-6 shadow-md text-white flex flex-col justify-between relative overflow-hidden h-full group min-h-[160px] w-full">
              <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent-pink/20 rounded-full blur-xl"></div>

              <div className="z-10 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white/90 tracking-wider text-xs uppercase mb-1">
                    LEETCODE PROGRESS
                  </h3>
                  <p className="text-5xl font-extrabold tracking-tight mt-1">
                    {percent}
                    <span className="text-3xl opacity-80">%</span>
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-2.5 px-4 text-center border border-white/10">
                  <p className="text-[10px] uppercase font-bold text-white/80 tracking-wider mb-0.5">
                    Status
                  </p>
                  <p className="text-xs font-extrabold text-white">
                    {percent > 0 ? "IN PROGRESS" : "NOT STARTED"}
                  </p>
                </div>
              </div>

              <div className="z-10 mt-6 space-y-4">
                <div className="flex gap-6 flex-wrap">
                  <div>
                    <p className="text-white/80 text-[10px] uppercase font-bold tracking-wider mb-0.5">
                      Problems Solved
                    </p>
                    <p className="text-sm font-bold">
                      {solvedCount} / {targetGoal}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/80 text-[10px] uppercase font-bold tracking-wider mb-0.5">
                      Streak
                    </p>
                    <p className="text-sm font-bold flex items-center gap-1">
                      <span className="text-base">🔥</span> {streakDays} Days
                    </p>
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-3 flex justify-between items-center border border-white/10">
                  <div>
                    <p className="text-white/70 text-[10px] uppercase font-bold tracking-wider">
                      Weekly Progress
                    </p>
                    <p className="text-xs font-bold mt-0.5">{thisWeekCount} problems this week</p>
                  </div>
                  <div className="h-1.5 w-1/3 bg-black/30 rounded-full overflow-hidden mx-4">
                    <div
                      className="h-full bg-white rounded-full"
                      style={{ width: `${Math.min(100, Math.round((thisWeekCount / 20) * 100))}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
            <DSAMetricCard
              title="Total Solved"
              mainStat={String(solvedCount)}
              subStats={[
                { label: "Easy", value: String(Math.floor(solvedCount * 0.5)), color: "text-green-500" },
                { label: "Medium", value: String(Math.floor(solvedCount * 0.4)), color: "text-yellow-500" },
                { label: "Hard", value: String(Math.floor(solvedCount * 0.1)), color: "text-red-500" },
              ]}
            />
            <DSAMetricCard
              title="This Week"
              mainStat={`${thisWeekCount} Problems`}
              subStats={[
                { label: "Goal", value: "20 / week" },
                {
                  label: "Completion",
                  value: `${Math.min(100, Math.round((thisWeekCount / 20) * 100))}%`,
                  color: "text-primary-purple",
                },
              ]}
            />
            <DSAMetricCard
              title="Current Streak"
              mainStat={`${streakDays} Days`}
              subStats={[
                { label: "Active", value: streakDays > 0 ? "Daily streak" : "Not started" },
                { label: "Sprint Day", value: `Day ${currentDay}` },
              ]}
              isHighlight={true}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
          {/* Left/Main Column */}
          <div className="lg:col-span-2 xl:col-span-3 space-y-6">
            <div className="bg-surface-white rounded-[32px] p-6 shadow-sm border border-border-light overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
                  Problem Tracker
                </h2>

                <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 -mb-1">
                  <div className="flex bg-app-bg p-1 rounded-lg shrink-0">
                    <button className="px-3 py-1.5 text-xs font-bold bg-white text-text-primary rounded-md shadow-sm border border-border-light">
                      All
                    </button>
                    <button className="px-3 py-1.5 text-xs font-bold text-text-secondary hover:text-text-primary">
                      Easy
                    </button>
                    <button className="px-3 py-1.5 text-xs font-bold text-text-secondary hover:text-text-primary">
                      Medium
                    </button>
                    <button className="px-3 py-1.5 text-xs font-bold text-text-secondary hover:text-text-primary">
                      Hard
                    </button>
                  </div>

                  <div className="relative shrink-0">
                    <select className="appearance-none bg-app-bg text-xs font-bold text-text-secondary py-2 pl-3 pr-8 rounded-lg outline-none border border-transparent focus:border-border-light">
                      <option>All Topics</option>
                      <option>Arrays</option>
                      <option>Strings</option>
                    </select>
                    <Filter
                      size={12}
                      className="absolute right-3 top-2.5 text-text-secondary pointer-events-none"
                    />
                  </div>

                  <div className="relative shrink-0">
                    <select className="appearance-none bg-app-bg text-xs font-bold text-text-secondary py-2 pl-3 pr-8 rounded-lg outline-none border border-transparent focus:border-border-light">
                      <option>Status</option>
                      <option>Solved</option>
                      <option>Unsolved</option>
                      <option>Needs Revision</option>
                    </select>
                    <Filter
                      size={12}
                      className="absolute right-3 top-2.5 text-text-secondary pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              <div className="relative mb-6">
                <Search
                  size={16}
                  className="absolute left-4 top-3 text-text-secondary"
                />
                <input
                  type="text"
                  placeholder="Search problems..."
                  className="w-full bg-app-bg border border-border-light rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-primary-purple/50 focus:ring-2 focus:ring-primary-purple/10 transition-all"
                />
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border-light">
                      <th className="pb-3 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                        Problem
                      </th>
                      <th className="pb-3 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                        Difficulty
                      </th>
                      <th className="pb-3 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                        Topic
                      </th>
                      <th className="pb-3 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                        Status
                      </th>
                      <th className="pb-3 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                        Solved
                      </th>
                      <th className="pb-3 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {problems.map((p, i) => (
                      <tr
                        key={i}
                        className="border-b border-border-light/50 last:border-0 hover:bg-app-bg transition-colors"
                      >
                        <td className="py-3 pr-4">
                          <p className="text-sm font-bold text-text-primary">
                            {p.name}
                          </p>
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded-md ${p.color} ${p.bg}`}
                          >
                            {p.difficulty}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-xs font-bold text-text-secondary bg-app-bg px-2 py-1 rounded-md border border-border-light/50">
                            {p.topic}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`text-xs font-bold ${
                              p.status === "Solved"
                                ? "text-green-500"
                                : p.status === "Needs Revision"
                                  ? "text-accent-pink"
                                  : "text-text-secondary"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-xs font-semibold text-text-secondary">
                            {p.date}
                          </span>
                        </td>
                        <td className="py-3">
                          <button className="w-8 h-8 rounded-lg bg-surface-white border border-border-light flex items-center justify-center text-text-secondary hover:text-primary-purple hover:border-primary-purple/30 transition-all">
                            <MoreHorizontal size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WeeklyPerformanceCard />
              <TopicPerformanceCard />
            </div>

            <div className="bg-surface-white rounded-[32px] p-6 shadow-sm border border-border-light overflow-hidden">
              <h3 className="font-bold text-text-primary text-base tracking-tight mb-4">
                Recently Solved
              </h3>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border-light">
                      <th className="pb-3 text-[10px] font-bold text-text-secondary uppercase tracking-wider font-sans">
                        Problem
                      </th>
                      <th className="pb-3 text-[10px] font-bold text-text-secondary uppercase tracking-wider font-sans">
                        Difficulty
                      </th>
                      <th className="pb-3 text-[10px] font-bold text-text-secondary uppercase tracking-wider font-sans">
                        Topic
                      </th>
                      <th className="pb-3 text-[10px] font-bold text-text-secondary uppercase tracking-wider font-sans">
                        Time Taken
                      </th>
                      <th className="pb-3 text-[10px] font-bold text-text-secondary uppercase tracking-wider font-sans">
                        Attempts
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProblems.map((p, i) => (
                      <tr
                        key={i}
                        className="border-b border-border-light/50 last:border-0 hover:bg-app-bg transition-colors"
                      >
                        <td className="py-3 pr-4">
                          <p className="text-sm font-bold text-text-primary">
                            {p.name}
                          </p>
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded-md ${p.color} ${p.bg}`}
                          >
                            {p.difficulty}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-xs font-bold text-text-secondary bg-app-bg px-2 py-1 rounded-md border border-border-light/50">
                            {p.topic}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-xs font-bold text-text-primary">
                            {p.timeTaken}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="text-xs font-semibold text-text-secondary">
                            {p.attempts} attempt{p.attempts && p.attempts > 1 ? "s" : ""}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Side Info */}
          <div className="lg:col-span-1 flex flex-col gap-6 w-full">
            <MissionCardTemplate
              title="Today's LeetCode Mission"
              day={currentDay}
              icon={Target}
              highlight={{
                label: "Target",
                value: leetcodeTask ? leetcodeTask.title : "2 Problems (Easy / Medium)",
              }}
              tasks={[
                { text: leetcodeTask ? leetcodeTask.title : "Practice String Anagrams", done: solvedCount > 0 },
                { text: "Optimal Solution with O(1) space", done: false },
                { text: "Record daily check-in", done: false },
              ]}
              expectedTime={leetcodeTask ? `${leetcodeTask.estimated_minutes} min` : "60 min"}
              buttonText="START PRACTICE"
            />
            <LeetcodeGoalCard />
            <RevisionQueueCard
              title="LeetCode Revision"
              queue={revisionQueue}
            />
            <DifficultyCard
              title="Total Difficulty"
              data={[
                { name: "Easy", value: 42, color: "#22c55e" },
                { name: "Medium", value: 38, color: "#eab308" },
                { name: "Hard", value: 7, color: "#ef4444" },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
export default LeetCodeView
