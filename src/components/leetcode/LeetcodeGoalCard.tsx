import React from "react"

export const LeetcodeGoalCard: React.FC = () => {
  return (
    <div className="bg-surface-white rounded-[24px] p-5 shadow-sm border border-border-light flex flex-col justify-between">
      <h3 className="font-bold text-text-primary text-sm tracking-tight mb-2">
        50 Day LeetCode Goal
      </h3>

      <div className="flex justify-between items-end mb-2">
        <span className="text-2xl font-extrabold text-primary-purple">
          87{" "}
          <span className="text-sm text-text-secondary font-bold">/ 150</span>
        </span>
        <span className="text-[10px] text-text-secondary font-bold uppercase">
          63 remaining
        </span>
      </div>

      <div className="h-1.5 w-full bg-app-bg rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-primary-purple rounded-full"
          style={{ width: `58%` }}
        ></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-app-bg p-2 rounded-lg">
          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-0.5">
            By Day 50
          </p>
          <p className="text-xs font-bold text-text-primary">150 problems</p>
        </div>
        <div className="bg-app-bg p-2 rounded-lg">
          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-0.5">
            Current Pace
          </p>
          <p className="text-xs font-bold text-primary-purple">On Track</p>
        </div>
      </div>
    </div>
  )
}
export default LeetcodeGoalCard
