import React from "react"
import { BrainCircuit, Globe, Terminal } from "lucide-react"
import {
  DashboardFocusCard,
  DashboardMissionCard,
  DashboardOverviewCard,
  DashboardProgressCard,
  DashboardReadinessCard,
  Header,
} from "../components"

export const DashboardView: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      <Header breadcrumb="Primary" title="Dashboard" />
      <div className="flex-1 flex flex-col gap-5 min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-2">
        {/* Top Row */}
        <div className="grid grid-cols-12 gap-5 items-stretch">
          <div className="col-span-12 lg:col-span-8 flex flex-col">
            <DashboardOverviewCard />
          </div>
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
            <DashboardMissionCard />
            <DashboardReadinessCard />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="h-full">
            <DashboardProgressCard
              title="DSA"
              percent={72}
              stat1Label="Topics"
              stat1Value="9 / 14"
              stat2Label="Problems"
              stat2Value="43 / 70"
              icon={BrainCircuit}
              colorClass="bg-[#6750C7]"
            />
          </div>
          <div className="h-full">
            <DashboardProgressCard
              title="LeetCode"
              percent={64}
              stat1Label="Solved"
              stat1Value="87 / 150"
              stat2Label="This Week"
              stat2Value="18 problems"
              icon={Terminal}
              colorClass="bg-[#8D7BE8]"
            />
          </div>
          <div className="h-full">
            <DashboardProgressCard
              title="Full Stack"
              percent={58}
              stat1Label="Modules"
              stat1Value="12 / 20"
              stat2Label="Project"
              stat2Value="65%"
              icon={Globe}
              colorClass="bg-[#4C3A9E]"
            />
          </div>
          <div className="h-full">
            <DashboardFocusCard />
          </div>
        </div>
      </div>
    </div>
  )
}
export default DashboardView
