import React from "react"
import { MoreHorizontal } from "lucide-react"
import { todayFocusItems } from "../../data"

export const DashboardFocusCard: React.FC = () => {
  return (
    <div className="bg-surface-white rounded-[24px] p-4 xl:p-5 shadow-sm border border-border-light h-full flex flex-col">
      <div className="flex justify-between items-center mb-3 xl:mb-4">
        <h3 className="font-bold text-text-primary text-sm xl:text-base tracking-tight">
          Today's Focus
        </h3>
        <button className="text-primary-purple text-xs font-bold hover:text-deep-purple transition-colors">
          View All
        </button>
      </div>

      <div className="flex flex-col gap-2 flex-1 justify-center">
        {todayFocusItems.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 p-2 rounded-xl border border-border-light/60 hover:bg-app-bg transition-colors cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-md bg-app-bg flex items-center justify-center text-text-secondary font-bold text-xs border border-border-light group-hover:bg-primary-purple group-hover:text-white group-hover:border-primary-purple transition-all">
              {i + 1}
            </div>
            <div className="flex-1">
              <p className="font-bold text-text-primary text-xs xl:text-sm leading-tight">
                {item.text}
              </p>
              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                {item.type}
              </p>
            </div>
            <MoreHorizontal
              size={14}
              className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
export default DashboardFocusCard
