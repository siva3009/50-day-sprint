import React from "react"
import { topicPerformanceData } from "../../data"
import type { TopicPerformanceItem } from "../../types"

interface TopicPerformanceCardProps {
  title?: string
  subtitle?: string
  data?: TopicPerformanceItem[]
}

export const TopicPerformanceCard: React.FC<TopicPerformanceCardProps> = ({
  title = "Topic Performance",
  subtitle = "Strengths & Weaknesses",
  data = topicPerformanceData,
}) => {
  return (
    <div className="bg-surface-white rounded-[24px] p-5 shadow-sm border border-border-light flex flex-col">
      <h3 className="font-bold text-text-primary text-sm tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-[10px] text-text-secondary font-bold mb-4">
        {subtitle}
      </p>

      <div className="flex flex-col gap-3 flex-1">
        {data.map((area, i) => (
          <div key={i}>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-text-primary">{area.name}</span>
              <span className="text-primary-purple">{area.score}%</span>
            </div>
            <div className="h-1.5 w-full bg-app-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-purple rounded-full"
                style={{ width: `${area.score}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
export default TopicPerformanceCard
