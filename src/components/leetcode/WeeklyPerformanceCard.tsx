import React from "react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { weeklyChartData } from "../../data"

export const WeeklyPerformanceCard: React.FC = () => {
  return (
    <div className="bg-surface-white rounded-[24px] p-5 shadow-sm border border-border-light flex flex-col min-h-[200px]">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-text-primary text-sm tracking-tight">
            Weekly Performance
          </h3>
          <p className="text-[10px] text-text-secondary font-bold">
            18 problems this week
          </p>
        </div>
        <span className="text-xs font-bold text-primary-purple bg-primary-purple/10 px-2 py-1 rounded-md">
          +18%
        </span>
      </div>

      <div className="flex-1 w-full mt-2 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weeklyChartData}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--color-text-secondary)",
                fontSize: 10,
                fontWeight: 600,
              }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--color-text-secondary)",
                fontSize: 10,
                fontWeight: 600,
              }}
              dx={-10}
            />
            <Tooltip
              cursor={{ fill: "var(--color-app-bg)" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-text-primary text-white text-[10px] py-1.5 px-2.5 rounded-lg shadow-xl font-medium">
                      <p className="font-bold">{payload[0].value} problems</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar
              dataKey="count"
              fill="var(--color-primary-purple)"
              radius={[4, 4, 4, 4]}
              barSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
export default WeeklyPerformanceCard
