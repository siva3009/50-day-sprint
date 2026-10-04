import React from "react"
import { ArrowRight, Target } from "lucide-react"

export const DashboardMissionCard: React.FC = () => {
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
        <div className="flex justify-between items-center bg-app-bg py-1.5 px-3 rounded-lg border border-border-light/50">
          <span className="text-xs font-bold text-text-primary">DSA</span>
          <span className="text-xs text-text-secondary font-semibold">
            Binary Search
          </span>
        </div>
        <div className="flex justify-between items-center bg-app-bg py-1.5 px-3 rounded-lg border border-border-light/50">
          <span className="text-xs font-bold text-text-primary">LeetCode</span>
          <span className="text-xs text-text-secondary font-semibold">
            3 Problems
          </span>
        </div>
        <div className="flex justify-between items-center bg-app-bg py-1.5 px-3 rounded-lg border border-border-light/50">
          <span className="text-xs font-bold text-text-primary">
            Full Stack
          </span>
          <span className="text-xs text-text-secondary font-semibold">
            React Hooks
          </span>
        </div>
        <div className="flex justify-between items-center bg-app-bg py-1.5 px-3 rounded-lg border border-border-light/50">
          <span className="text-xs font-bold text-text-primary">Project</span>
          <span className="text-xs text-text-secondary font-semibold">
            Auth
          </span>
        </div>
      </div>

      <div className="mt-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-pink animate-pulse"></div>
          <span className="text-xs font-bold text-text-secondary">
            3h 30m expected
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
