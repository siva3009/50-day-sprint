import React from "react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Sparkles } from "lucide-react"
import { useTeam } from "../../context"
import type { ChartPoint } from "../../services/dashboardService"

interface CustomTooltipProps {
  active?: boolean
  payload?: { value: number; payload?: { hours?: number } }[]
  label?: string
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const hours = payload[0].payload?.hours
    return (
      <div className="bg-text-primary text-white text-[10px] py-1.5 px-2.5 rounded-lg shadow-xl font-medium">
        <p className="opacity-80">{label}</p>
        <p className="font-bold">Progress: {payload[0].value}%</p>
        {hours !== undefined && hours > 0 && (
          <p className="text-primary-purple font-semibold">{hours} hrs logged</p>
        )}
      </div>
    )
  }
  return null
}

export interface DashboardOverviewCardProps {
  totalStudyHours?: number
  problemsSolved?: number
  currentStreakDays?: number
  chartData?: ChartPoint[]
  onOpenCheckin?: () => void
  hasCheckedInToday?: boolean
}

export const DashboardOverviewCard: React.FC<DashboardOverviewCardProps> = ({
  totalStudyHours = 0,
  problemsSolved = 0,
  currentStreakDays = 0,
  chartData = [
    { day: "Day 1", progress: 0 },
    { day: "Day 8", progress: 0 },
  ],
  onOpenCheckin,
  hasCheckedInToday = false,
}) => {
  const { currentSprint, sprintDayStatus } = useTeam()

  const sprintTitle = currentSprint?.name || "50 Day Sprint"
  const sprintDayLabel = sprintDayStatus?.label || "Day 8 / 50"

  return (
    <div className="bg-surface-white rounded-[24px] p-5 shadow-sm border border-border-light flex flex-col h-full relative overflow-hidden">
      <div className="flex justify-between items-start z-10 flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-text-primary mb-0.5">
            {sprintTitle}
          </h2>
          <p className="text-primary-purple font-bold text-xs tracking-wide uppercase">
            {sprintDayLabel}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenCheckin && (
            <button
              onClick={onOpenCheckin}
              className={`text-xs font-bold py-1.5 px-3 rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                hasCheckedInToday
                  ? "bg-primary-purple/10 text-primary-purple border border-primary-purple/30 hover:bg-primary-purple/20"
                  : "bg-primary-purple hover:bg-deep-purple text-white hover:shadow-md"
              }`}
            >
              <Sparkles size={13} />
              <span>{hasCheckedInToday ? "Update Check-in" : "Daily Check-in"}</span>
            </button>
          )}

          <div className="relative">
            <select className="bg-app-bg border border-border-light text-text-secondary text-xs font-bold py-1.5 pl-3 pr-7 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple/20 cursor-pointer appearance-none">
              <option>Sprint Timeline</option>
              <option>Weekly</option>
            </select>
            <div className="absolute right-2.5 top-2.5 pointer-events-none">
              <svg width="8" height="5" viewBox="0 0 10 6" fill="none">
                <path
                  d="M1 1L5 5L9 1"
                  stroke="#7C7A8C"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[180px] -mx-3 mt-1 z-10 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-primary-purple)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-primary-purple)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--color-text-secondary)",
                fontSize: 10,
                fontWeight: 600,
              }}
              dy={5}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--color-text-secondary)",
                fontSize: 10,
                fontWeight: 600,
              }}
              dx={-5}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "var(--color-primary-purple)",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              dataKey="progress"
              stroke="var(--color-primary-purple)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorProgress)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-end mt-2 pt-3 border-t border-border-light z-10 relative w-full">
        <div className="flex-1">
          <p className="text-text-secondary text-[10px] font-bold uppercase tracking-wider mb-0.5">
            Total Study
          </p>
          <p className="text-xl font-extrabold text-text-primary">
            {totalStudyHours} hrs
          </p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-text-secondary text-[10px] font-bold uppercase tracking-wider mb-0.5">
            Problems Solved
          </p>
          <p className="text-xl font-extrabold text-text-primary">
            {problemsSolved}
          </p>
        </div>
        <div className="flex-1 text-right">
          <p className="text-text-secondary text-[10px] font-bold uppercase tracking-wider mb-0.5">
            Current Streak
          </p>
          <p className="text-xl font-extrabold text-primary-purple flex items-center justify-end gap-1">
            <span className="text-sm">🔥</span>{" "}
            {currentStreakDays > 0 ? `${currentStreakDays} days` : "0 days"}
          </p>
        </div>
      </div>
    </div>
  )
}
export default DashboardOverviewCard
