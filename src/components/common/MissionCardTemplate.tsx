import React from "react"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import type { MissionCardProps } from "../../types"

export const MissionCardTemplate: React.FC<MissionCardProps> = ({
  title,
  day,
  icon: Icon,
  highlight,
  tasks,
  expectedTime,
  buttonText,
}) => {
  return (
    <div className="bg-gradient-to-b from-primary-purple/5 to-surface-white rounded-[24px] p-5 shadow-sm border border-primary-purple/20 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-purple text-white flex items-center justify-center shadow-md">
            <Icon size={16} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-bold text-text-primary text-sm tracking-tight leading-tight">
              {title}
            </h3>
            <p className="text-[10px] text-primary-purple font-bold tracking-wider uppercase">
              Day {day} / 50
            </p>
          </div>
        </div>
      </div>

      {highlight && (
        <div className="bg-surface-white rounded-xl p-3 border border-border-light mb-4 shadow-sm">
          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-1">
            {highlight.label}
          </p>
          <div className="text-sm font-bold text-text-primary flex items-center gap-1.5 flex-wrap">
            {highlight.icon && (
              <highlight.icon size={14} className="text-accent-pink" />
            )}
            {highlight.value}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-2 mb-5">
        {tasks.map((task, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div
              className={`mt-0.5 w-4 h-4 rounded-[4px] flex items-center justify-center flex-shrink-0 border ${
                task.done
                  ? "bg-primary-purple border-primary-purple text-white"
                  : "bg-surface-white border-border-light"
              }`}
            >
              {task.done && <CheckCircle2 size={12} strokeWidth={3} />}
            </div>
            <p
              className={`text-xs font-bold leading-tight pt-0.5 ${
                task.done
                  ? "text-text-secondary line-through opacity-70"
                  : "text-text-primary"
              }`}
            >
              {task.text}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-2">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
            Expected Time
          </span>
          <span className="text-xs font-extrabold text-text-primary">
            {expectedTime}
          </span>
        </div>
        <button className="w-full py-2.5 bg-primary-purple hover:bg-deep-purple text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
          {buttonText} <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}
export default MissionCardTemplate
