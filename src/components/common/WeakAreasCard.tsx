import React from "react"
import type { WeakAreaItem } from "../../types"

interface WeakAreasCardProps {
  title?: string
  subtitle?: string
  areas?: WeakAreaItem[]
}

const defaultWeakAreas: WeakAreaItem[] = [
  { name: "Graphs", score: 38 },
  { name: "Dynamic Programming", score: 24 },
  { name: "Trees", score: 46 },
]

export const WeakAreasCard: React.FC<WeakAreasCardProps> = ({
  title = "Weak Areas",
  subtitle = "Topics needing additional practice",
  areas = defaultWeakAreas,
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
        {areas.map((area, i) => (
          <div key={i}>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-text-primary">{area.name}</span>
              <span className="text-accent-pink">{area.score}%</span>
            </div>
            <div className="h-1.5 w-full bg-app-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-pink rounded-full"
                style={{ width: `${area.score}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-4 w-full py-2 bg-app-bg hover:bg-border-light text-text-primary font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors">
        View Detailed Analysis
      </button>
    </div>
  )
}
export default WeakAreasCard
