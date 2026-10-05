import React from "react"
import { ArrowRight, Target } from "lucide-react"
import type { DashboardMissionItem } from "../../services/dashboardService"

export interface DashboardMissionCardProps {
  missionItems?: DashboardMissionItem[]
  expectedTimeText?: string
  loading?: boolean
}

export const DashboardMissionCard: React.FC<DashboardMissionCardProps> = ({
  missionItems = [],
  expectedTimeText = "Self-paced study",
  loading = false,
}) => {
  const displayItems =
    missionItems.length > 0
      ? missionItems
      : [
          { label: "DSA", value: "Curriculum loading..." },
          { label: "LeetCode", value: "Curriculum loading..." },
          { label: "Full Stack", value: "Curriculum loading..." },
          { label: "Project", value: "Curriculum loading..." },
        ]

  return (
    <div className="bg-surface-white rounded-[24px] p-4 xl:p-5 shadow-sm border border-border-light flex-1 flex flex-col justify-between relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary-purple/5 rounded-bl-full -z-0 transition-transform group-hover:scale-110 duration-500"></div>

      <div className="flex items-center gap-2.5 mb-3 z-10">
        <div className="w-8 h-8 rounded-lg bg-primary-purple/10 flex items-center justify-center text-primary-purple">
          <Target size={16} strokeWidth={2.5} />
        </div>
        <h3 className="font-bold text-text-primary text-sm xl:text-base tracking-tight">
          Today's Mission
        </h3>
      </div>

      <div className="flex-1 flex flex-col gap-1.5 z-10 justify-center">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="w-6 h-6 border-2 border-primary-purple/20 border-t-primary-purple rounded-full animate-spin" />
          </div>
        ) : (
          displayItems.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center bg-app-bg py-1.5 px-3 rounded-lg border border-border-light/50"
            >
              <span className="text-xs font-bold text-text-primary shrink-0">
                {item.label}
              </span>
              <span className="text-xs text-text-secondary font-semibold truncate text-right ml-2 max-w-[170px]">
                {item.value}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-pink animate-pulse"></div>
          <span className="text-xs font-bold text-text-secondary">
            {expectedTimeText}
          </span>
        </div>
        <button className="w-8 h-8 rounded-full bg-primary-purple text-white flex items-center justify-center hover:bg-deep-purple transition-colors shadow-sm">
          <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
export default DashboardMissionCard
