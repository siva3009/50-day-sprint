import React from "react"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import type { DifficultyDistributionItem } from "../../types"

interface DifficultyCardProps {
  title?: string
  data?: DifficultyDistributionItem[]
}

const defaultDifficultyData: DifficultyDistributionItem[] = [
  { name: "Easy", value: 20, color: "#22c55e" },
  { name: "Medium", value: 18, color: "#eab308" },
  { name: "Hard", value: 5, color: "#ef4444" },
]

export const DifficultyCard: React.FC<DifficultyCardProps> = ({
  title = "Problem Difficulty",
  data = defaultDifficultyData,
}) => {
  return (
    <div className="bg-surface-white rounded-[24px] p-5 shadow-sm border border-border-light flex flex-col">
      <h3 className="font-bold text-text-primary text-sm tracking-tight mb-4">
        {title}
      </h3>

      <div className="flex items-center justify-between flex-1 gap-4">
        <div className="w-20 h-20 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={35}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs font-bold text-text-secondary">
                  {item.name}
                </span>
              </div>
              <span className="text-xs font-extrabold text-text-primary">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
export default DifficultyCard
