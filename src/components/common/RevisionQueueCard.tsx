import React from "react"
import type { RevisionItem } from "../../types"

interface RevisionQueueCardProps {
  title?: string
  queue: RevisionItem[]
}

export const RevisionQueueCard: React.FC<RevisionQueueCardProps> = ({
  title = "Revision Queue",
  queue,
}) => {
  return (
    <div className="bg-surface-white rounded-[24px] p-5 shadow-sm border border-border-light flex flex-col">
      <h3 className="font-bold text-text-primary text-sm tracking-tight mb-4">
        {title}
      </h3>

      <div className="flex flex-col gap-2.5">
        {queue.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-2.5 rounded-xl border border-border-light/50 group hover:border-primary-purple/30 transition-colors"
          >
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-xs font-bold text-text-primary leading-tight truncate">
                {item.topic}
              </p>
              <p
                className={`text-[10px] font-bold ${item.color} mt-0.5 truncate`}
              >
                {item.due}
              </p>
            </div>
            <button
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 ${
                item.highlight
                  ? "bg-primary-purple text-white shadow-sm"
                  : "bg-app-bg text-text-secondary hover:bg-border-light"
              }`}
            >
              Review
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
export default RevisionQueueCard
