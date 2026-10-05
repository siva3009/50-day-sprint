import React from "react"
import { MoreHorizontal } from "lucide-react"
import type { DashboardFocusItem } from "../../services/dashboardService"

export interface DashboardFocusCardProps {
  focusItems?: DashboardFocusItem[]
  loading?: boolean
}

export const DashboardFocusCard: React.FC<DashboardFocusCardProps> = ({
  focusItems = [],
  loading = false,
}) => {
  return (
    <div className="bg-surface-white rounded-[24px] p-4 xl:p-5 shadow-sm border border-border-light h-full flex flex-col">
      <div className="flex justify-between items-center mb-3 xl:mb-4">
        <h3 className="font-bold text-text-primary text-sm xl:text-base tracking-tight">
          Today's Focus
        </h3>
        <span className="text-primary-purple text-xs font-bold">
          {focusItems.length} Tasks
        </span>
      </div>

      <div className="flex flex-col gap-2 flex-1 justify-center">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="w-5 h-5 border-2 border-primary-purple/20 border-t-primary-purple rounded-full animate-spin" />
          </div>
        ) : focusItems.length === 0 ? (
          <div className="text-center py-4 text-xs font-medium text-text-secondary">
            No focus tasks scheduled for today.
          </div>
        ) : (
          focusItems.slice(0, 3).map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 p-2 rounded-xl border border-border-light/60 hover:bg-app-bg transition-colors cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-md bg-app-bg flex items-center justify-center text-text-secondary font-bold text-xs border border-border-light group-hover:bg-primary-purple group-hover:text-white group-hover:border-primary-purple transition-all shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-text-primary text-xs xl:text-sm leading-tight truncate">
                  {item.text}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                    {item.type}
                  </span>
                  {item.difficulty && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary-purple/10 text-primary-purple">
                      {item.difficulty}
                    </span>
                  )}
                </div>
              </div>
              <MoreHorizontal
                size={14}
                className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
export default DashboardFocusCard
