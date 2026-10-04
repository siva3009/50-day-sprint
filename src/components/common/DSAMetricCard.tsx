import React from "react"
import type { MetricCardProps } from "../../types"

export const DSAMetricCard: React.FC<MetricCardProps> = ({
  title,
  mainStat,
  subStats,
  isHighlight = false,
}) => {
  return (
    <div
      className={`bg-surface-white rounded-[24px] p-5 shadow-sm border flex flex-col h-full min-h-[160px] ${
        isHighlight ? "border-primary-purple/30" : "border-border-light"
      }`}
    >
      <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2 shrink-0">
        {title}
      </h4>
      <p className="text-2xl font-extrabold text-text-primary mb-4 shrink-0">
        {mainStat}
      </p>

      <div className="mt-auto flex flex-col gap-2 shrink-0">
        {subStats.map((stat, i) => (
          <div
            key={i}
            className="flex justify-between items-center bg-app-bg py-1.5 px-3 rounded-lg"
          >
            <span className="text-xs font-bold text-text-secondary">
              {stat.label}
            </span>
            <span
              className={`text-xs font-bold ${
                stat.color ? stat.color : "text-text-primary"
              }`}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
export default DSAMetricCard
