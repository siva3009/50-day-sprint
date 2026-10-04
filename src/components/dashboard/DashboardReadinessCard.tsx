import React from "react"
import { Trophy } from "lucide-react"

export const DashboardReadinessCard: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-accent-pink to-primary-purple rounded-[24px] p-5 xl:p-6 shadow-md text-white flex-1 flex flex-col justify-between relative overflow-hidden group min-h-[140px]">
      <div className="absolute top-[-10px] right-[-10px] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>

      <div className="z-10">
        <h3 className="font-bold text-white/90 tracking-wider text-[10px] xl:text-xs uppercase mb-1">
          50 Day Readiness
        </h3>
        <p className="text-4xl xl:text-5xl font-extrabold tracking-tight mt-1 mb-1">
          68<span className="text-2xl xl:text-3xl opacity-80">%</span>
        </p>
        <p className="font-semibold text-white/90 text-xs xl:text-sm">
          Placement Readiness
        </p>
      </div>

      <div className="z-10 bg-white/20 backdrop-blur-md rounded-lg p-2.5 flex items-center gap-2 border border-white/20 mt-2">
        <div className="bg-white text-primary-purple rounded-full p-1">
          <Trophy size={12} strokeWidth={3} />
        </div>
        <p className="text-xs font-bold text-white">+6% ahead of target</p>
      </div>
    </div>
  )
}
export default DashboardReadinessCard
