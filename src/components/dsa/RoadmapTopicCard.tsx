import React from "react"
import { CheckCircle2, Clock, Lock } from "lucide-react"
import type { DSATopic } from "../../types"

interface RoadmapTopicCardProps {
  topic: DSATopic
}

export const RoadmapTopicCard: React.FC<RoadmapTopicCardProps> = ({ topic }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-primary-purple/10 text-primary-purple border-primary-purple/20"
      case "IN PROGRESS":
        return "bg-accent-pink/10 text-accent-pink border-accent-pink/20"
      default:
        return "bg-app-bg text-text-secondary border-border-light/50"
    }
  }

  const getIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 size={14} />
      case "IN PROGRESS":
        return <Clock size={14} />
      default:
        return <Lock size={14} />
    }
  }

  return (
    <div
      className={`rounded-2xl p-4 border transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col ${
        topic.status === "UP NEXT"
          ? "bg-surface-white/50 border-border-light/50 opacity-70"
          : "bg-surface-white border-border-light shadow-sm"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-text-secondary/70">
            {topic.id}
          </span>
          <h4
            className={`text-sm font-bold truncate max-w-[120px] ${
              topic.status === "UP NEXT"
                ? "text-text-secondary"
                : "text-text-primary"
            }`}
            title={topic.name}
          >
            {topic.name}
          </h4>
        </div>
        <div
          className={`px-2 py-1 rounded-md border flex items-center gap-1 text-[10px] font-bold ${getStatusStyle(topic.status)}`}
        >
          {getIcon(topic.status)}
          <span className="hidden sm:inline-block">{topic.status}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-1.5 mt-auto">
        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
          Progress
        </span>
        <span className="text-[10px] font-bold text-text-primary">
          {topic.percent}% Complete
        </span>
      </div>

      <div className="h-1.5 w-full bg-app-bg rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full ${
            topic.status === "IN PROGRESS"
              ? "bg-accent-pink"
              : "bg-primary-purple"
          }`}
          style={{ width: `${topic.percent}%` }}
        ></div>
      </div>

      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-text-secondary">
          {topic.solved} / {topic.total} Probs
        </span>

        {(topic.status === "COMPLETED" || topic.status === "IN PROGRESS") && (
          <div className="flex gap-1.5 flex-wrap">
            {topic.easy > 0 && (
              <span className="text-green-500 font-bold bg-green-500/10 px-1 py-0.5 rounded text-[10px]">
                {topic.easy} E
              </span>
            )}
            {topic.medium > 0 && (
              <span className="text-yellow-500 font-bold bg-yellow-500/10 px-1 py-0.5 rounded text-[10px]">
                {topic.medium} M
              </span>
            )}
            {topic.hard > 0 && (
              <span className="text-red-500 font-bold bg-red-500/10 px-1 py-0.5 rounded text-[10px]">
                {topic.hard} H
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
export default RoadmapTopicCard
