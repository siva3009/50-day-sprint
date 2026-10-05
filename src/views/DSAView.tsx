import React, { useEffect, useState } from "react"
import { BookOpen, Target } from "lucide-react"
import {
  DifficultyCard,
  DSAMainProgress,
  DSAMetricCard,
  Header,
  MissionCardTemplate,
  RevisionQueueCard,
  RoadmapTopicCard,
  WeakAreasCard,
} from "../components"
import { useAuth, useTeam } from "../context"
import { getDSAData, fetchUserCheckins, calculateStreak } from "../services"
import { fetchSprintDayPlan } from "../services/sprintPlanService"
import { supabase } from "../lib/supabaseClient"
import type { SprintDayPlan } from "../types/sprintPlan"

export const DSAView: React.FC = () => {
  const { user } = useAuth()
  const { currentSprint, sprintDayStatus } = useTeam()
  const { topics, recentProblems, revisionQueue, roadmapSections } = getDSAData()

  const [solvedCount, setSolvedCount] = useState<number>(0)
  const [streakDays, setStreakDays] = useState<number>(0)
  const [dayPlan, setDayPlan] = useState<SprintDayPlan | null>(null)

  const currentDay = sprintDayStatus?.currentDay || 8

  useEffect(() => {
    let isMounted = true

    // Fetch Day plan for currentDay
    fetchSprintDayPlan(currentDay).then((plan) => {
      if (isMounted) setDayPlan(plan)
    }).catch(console.warn)

    if (user && currentSprint?.id) {
      // Fetch user's real DSA progress
      supabase
        .from("user_dsa_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "Solved")
        .then(({ count }) => {
          if (isMounted && count !== null) {
            setSolvedCount(count)
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

  const dsaTask = dayPlan?.tasks?.find((t) => t.category === "DSA")
  const dsaPercent = Math.min(100, Math.round((solvedCount / 70) * 100))

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      <Header
        breadcrumb="Learning"
        title="DSA"
        subtitle="Master Data Structures & Algorithms in 50 Days"
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6 space-y-6">
        {/* Top Summary Section */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
          <div className="xl:col-span-5 flex">
            <div className="flex-1">
              <DSAMainProgress
                percent={dsaPercent}
                solved={solvedCount}
                total={70}
                completedTopics={Math.min(17, Math.floor(solvedCount / 4))}
                totalTopics={17}
                streakDays={streakDays}
              />
            </div>
          </div>
          <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
            <DSAMetricCard
              title="Problems Solved"
              mainStat={`${solvedCount} / 70`}
              subStats={[
                { label: "Easy", value: String(Math.floor(solvedCount * 0.5)), color: "text-green-500" },
                { label: "Medium", value: String(Math.floor(solvedCount * 0.4)), color: "text-yellow-500" },
                { label: "Hard", value: String(Math.floor(solvedCount * 0.1)), color: "text-red-500" },
              ]}
            />
            <DSAMetricCard
              title="Consistency"
              mainStat={`${streakDays} Days`}
              subStats={[
                {
                  label: "Status",
                  value: streakDays > 0 ? "Active streak" : "Not started",
                  color: streakDays > 0 ? "text-primary-purple" : "text-text-secondary",
                },
                {
                  label: "Day",
                  value: `Day ${currentDay} of 50`,
                  color: "text-text-primary",
                },
              ]}
            />
            <DSAMetricCard
              title="Daily Goal"
              mainStat={dsaTask ? "1 Topic" : "Scheduled"}
              subStats={[
                { label: "Focus", value: dsaTask ? "Strings" : "Fundamentals" },
                { label: "Sprint Day", value: `Day ${currentDay}` },
              ]}
              isHighlight={true}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
          {/* Left/Main Column - Roadmap */}
          <div className="lg:col-span-2 xl:col-span-3 space-y-6">
            <div className="bg-surface-white rounded-[32px] p-6 shadow-sm border border-border-light overflow-hidden">
              <div className="mb-6">
                <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
                  DSA Roadmap
                </h2>
                <p className="text-sm font-medium text-text-secondary mt-1">
                  Follow the recommended sequence to build strong
                  problem-solving fundamentals.
                </p>
              </div>

              <div className="space-y-8 relative z-10">
                {roadmapSections.map((section, idx) => (
                  <div key={idx} className="space-y-4">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-2">
                      {section.title}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {section.ids.map((id) => {
                        const topic = topics.find((t) => t.id === id)
                        return topic ? (
                          <RoadmapTopicCard key={topic.id} topic={topic} />
                        ) : null
                      })}
                    </div>
                  </div>
                ))}
              </div>
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
                        Topic
                      </th>
                      <th className="pb-3 text-[10px] font-bold text-text-secondary uppercase tracking-wider font-sans">
                        Difficulty
                      </th>
                      <th className="pb-3 text-[10px] font-bold text-text-secondary uppercase tracking-wider font-sans">
                        Status
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
                          <span className="text-xs font-bold text-text-secondary bg-app-bg px-2 py-1 rounded-md border border-border-light/50">
                            {p.topic}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded-md ${p.color} ${p.bg}`}
                          >
                            {p.difficulty}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="text-xs font-semibold text-text-secondary">
                            {p.date}
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
              title="Today's DSA Mission"
              day={currentDay}
              icon={Target}
              highlight={{
                label: "Topic",
                value: dsaTask ? dsaTask.title : "Strings: Fundamentals",
                icon: BookOpen,
              }}
              tasks={[
                { text: dsaTask ? dsaTask.title : "Understand Core Pattern", done: solvedCount > 0 },
                { text: "Solve 2 Practice Problems", done: false },
                { text: "Write solution with time complexity", done: false },
                { text: "Record daily check-in", done: false },
              ]}
              expectedTime={dsaTask ? `${dsaTask.estimated_minutes} min` : "60 min"}
              buttonText="START MISSION"
            />
            <WeakAreasCard />
            <RevisionQueueCard queue={revisionQueue} />
            <DifficultyCard />
          </div>
        </div>
      </div>
    </div>
  )
}
export default DSAView
