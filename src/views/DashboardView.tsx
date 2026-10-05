import React, { useCallback, useEffect, useState } from "react"
import { BrainCircuit, Globe, Terminal } from "lucide-react"
import {
  DailyCheckinModal,
  DashboardFocusCard,
  DashboardMissionCard,
  DashboardOverviewCard,
  DashboardProgressCard,
  DashboardReadinessCard,
  Header,
} from "../components"
import { useAuth, useTeam } from "../context"
import {
  fetchLiveDashboardData,
  type RealDashboardData,
} from "../services/dashboardService"

export const DashboardView: React.FC = () => {
  const { user } = useAuth()
  const { currentTeam, currentSprint, members, sprintDayStatus } = useTeam()
  const [data, setData] = useState<RealDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false)

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const result = await fetchLiveDashboardData(
        user.id,
        currentSprint,
        currentTeam?.id,
        members,
      )
      setData(result)
    } catch (err) {
      console.error("[DashboardView] Failed to load live dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }, [user, currentSprint, currentTeam?.id, members])

  useEffect(() => {
    loadData()
  }, [loadData])

  const sprintDayLabel = sprintDayStatus?.label || "Day 8 / 50"

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      <Header breadcrumb="Primary" title="Dashboard" />
      <div className="flex-1 flex flex-col gap-5 min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-2">
        {/* Top Row */}
        <div className="grid grid-cols-12 gap-5 items-stretch">
          <div className="col-span-12 lg:col-span-8 flex flex-col">
            <DashboardOverviewCard
              totalStudyHours={data?.totalStudyHours ?? 0}
              problemsSolved={data?.problemsSolved ?? 0}
              currentStreakDays={data?.currentStreakDays ?? 0}
              chartData={data?.chartData}
              onOpenCheckin={() => setIsCheckinModalOpen(true)}
              hasCheckedInToday={Boolean(data?.todayCheckin)}
            />
          </div>
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
            <DashboardMissionCard
              missionItems={data?.todayMissionItems}
              expectedTimeText={data?.expectedTimeText}
              loading={loading}
            />
            <DashboardReadinessCard
              readinessScore={data?.readinessScore ?? 0}
            />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="h-full">
            <DashboardProgressCard
              title="DSA"
              percent={data?.dsaMetric.percent ?? 0}
              stat1Label={data?.dsaMetric.stat1Label ?? "Topics"}
              stat1Value={data?.dsaMetric.stat1Value ?? "0 / 17"}
              stat2Label={data?.dsaMetric.stat2Label ?? "Problems"}
              stat2Value={data?.dsaMetric.stat2Value ?? "0 / 70"}
              icon={BrainCircuit}
              colorClass="bg-[#6750C7]"
            />
          </div>
          <div className="h-full">
            <DashboardProgressCard
              title="LeetCode"
              percent={data?.leetcodeMetric.percent ?? 0}
              stat1Label={data?.leetcodeMetric.stat1Label ?? "Solved"}
              stat1Value={data?.leetcodeMetric.stat1Value ?? "0 / 150"}
              stat2Label={data?.leetcodeMetric.stat2Label ?? "This Week"}
              stat2Value={data?.leetcodeMetric.stat2Value ?? "0 problems"}
              icon={Terminal}
              colorClass="bg-[#8D7BE8]"
            />
          </div>
          <div className="h-full">
            <DashboardProgressCard
              title="Full Stack"
              percent={data?.fullstackMetric.percent ?? 0}
              stat1Label={data?.fullstackMetric.stat1Label ?? "Modules"}
              stat1Value={data?.fullstackMetric.stat1Value ?? "0 / 23"}
              stat2Label={data?.fullstackMetric.stat2Label ?? "Project"}
              stat2Value={data?.fullstackMetric.stat2Value ?? "0%"}
              icon={Globe}
              colorClass="bg-[#4C3A9E]"
            />
          </div>
          <div className="h-full">
            <DashboardFocusCard
              focusItems={data?.todayFocusItems}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Daily Check-in Modal */}
      {user && currentSprint && (
        <DailyCheckinModal
          isOpen={isCheckinModalOpen}
          onClose={() => setIsCheckinModalOpen(false)}
          userId={user.id}
          sprintId={currentSprint.id}
          teamId={currentTeam?.id}
          sprintDayLabel={sprintDayLabel}
          existingCheckin={data?.todayCheckin}
          onSuccess={loadData}
        />
      )}
    </div>
  )
}
export default DashboardView
