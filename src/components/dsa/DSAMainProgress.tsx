import React from "react"
import { ChevronRight } from "lucide-react"

export interface DSAMainProgressProps {
  percent?: number
  solved?: number
  total?: number
  completedTopics?: number
  totalTopics?: number
  streakDays?: number
}

export const DSAMainProgress: React.FC<DSAMainProgressProps> = ({
  percent = 0,
  solved = 0,
  total = 70,
  completedTopics = 0,
  totalTopics = 17,
  streakDays = 0,
}) => {
  const status = percent > 0 ? "IN PROGRESS" : "NOT STARTED"
  const level = percent > 60 ? "Intermediate" : "Beginner"

  return (
    <div className="bg-gradient-to-br from-primary-purple to-deep-purple rounded-[24px] p-6 shadow-md text-white flex flex-col justify-between relative overflow-hidden h-full group min-h-[160px]">
      <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent-pink/20 rounded-full blur-xl"></div>

      <div className="z-10 flex justify-between items-start">
        <div>
          <h3 className="font-bold text-white/90 tracking-wider text-xs uppercase mb-1">
            DSA PROGRESS
          </h3>
          <p className="text-5xl font-extrabold tracking-tight mt-1">
            {percent}
            <span className="text-3xl opacity-80">%</span>
          </p>
        </div>
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-2.5 px-4 text-center border border-white/10">
          <p className="text-[10px] uppercase font-bold text-white/80 tracking-wider mb-0.5">
            Status
          </p>
          <p className="text-xs font-extrabold text-white">{status}</p>
        </div>
      </div>

      <div className="z-10 mt-6 space-y-4">
        <div className="flex gap-6 flex-wrap">
          <div>
            <p className="text-white/80 text-[10px] uppercase font-bold tracking-wider mb-0.5">
              Problems
            </p>
            <p className="text-sm font-bold">
              {solved} / {total}
            </p>
          </div>
          <div>
            <p className="text-white/80 text-[10px] uppercase font-bold tracking-wider mb-0.5">
              Topics
            </p>
            <p className="text-sm font-bold">
              {completedTopics} / {totalTopics}
            </p>
          </div>
          <div>
            <p className="text-white/80 text-[10px] uppercase font-bold tracking-wider mb-0.5">
              Streak
            </p>
            <p className="text-sm font-bold flex items-center gap-1">
              <span className="text-base">🔥</span> {streakDays} Days
            </p>
          </div>
        </div>

        <div className="bg-black/20 rounded-xl p-3 flex justify-between items-center border border-white/10">
          <div>
            <p className="text-white/70 text-[10px] uppercase font-bold tracking-wider">
              Current Level
            </p>
            <p className="text-xs font-bold mt-0.5">{level}</p>
          </div>
          <ChevronRight size={14} className="text-white/50" />
          <div className="text-right">
            <p className="text-white/70 text-[10px] uppercase font-bold tracking-wider">
              Target
            </p>
            <p className="text-xs font-bold mt-0.5">Interview Ready</p>
          </div>
        </div>
      </div>
    </div>
  )
}
export default DSAMainProgress
