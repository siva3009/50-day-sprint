import React from "react"
import type { ProgressCardProps } from "../../types"

export const DashboardProgressCard: React.FC<ProgressCardProps> = ({
  title,
  percent,
  stat1Label,
  stat1Value,
  stat2Label,
  stat2Value,
  icon: Icon,
  colorClass,
}) => {
  return (
    <div className="bg-surface-white rounded-[24px] p-4 xl:p-5 shadow-sm border border-border-light flex flex-col h-full justify-between hover:border-primary-purple/30 transition-colors group">
      <div className="flex justify-between items-start mb-2">
        <div
          className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform`}
        >
          <Icon size={18} strokeWidth={2} />
        </div>
        <div className="text-right">
          <h4 className="font-bold text-text-primary text-sm xl:text-base leading-tight">
            {title}
          </h4>
          <p className="text-xl xl:text-2xl font-extrabold text-primary-purple leading-tight">
            {percent}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 my-2">
        <div>
          <p className="text-text-secondary text-[10px] font-bold uppercase tracking-wider mb-0.5">
            {stat1Label}
          </p>
          <p className="font-bold text-text-primary text-xs xl:text-sm">
            {stat1Value}
          </p>
        </div>
        <div>
          <p className="text-text-secondary text-[10px] font-bold uppercase tracking-wider mb-0.5">
            {stat2Label}
          </p>
          <p className="font-bold text-text-primary text-xs xl:text-sm">
            {stat2Value}
          </p>
        </div>
      </div>

      <div className="mt-auto">
        <div className="h-1.5 w-full bg-app-bg rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-purple rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}
export default DashboardProgressCard
