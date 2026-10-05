import React, { useEffect, useState } from "react"
import { useTeam } from "../../context"
import { fetchTeamCheckins, type DailyCheckin } from "../../services/dailyCheckinService"

export const FriendsPanel: React.FC = () => {
  const { currentTeam, members, currentSprint } = useTeam()
  const [teamCheckins, setTeamCheckins] = useState<DailyCheckin[]>([])

  useEffect(() => {
    let isMounted = true
    if (currentSprint?.id) {
      fetchTeamCheckins(currentSprint.id).then((res) => {
        if (isMounted && res.checkins) {
          setTeamCheckins(res.checkins)
        }
      })
    } else {
      setTeamCheckins([])
    }
    return () => {
      isMounted = false
    }
  }, [currentSprint?.id])

  // Derive real display data for team members
  const displayMembers = members.map((m) => {
    const memberCheckins = teamCheckins.filter((c) => c.userId === m.userId)
    const hours = Number(
      memberCheckins.reduce((acc, c) => acc + (c.studyHours || 0), 0).toFixed(1),
    )
    const problems = memberCheckins.reduce(
      (acc, c) => acc + (c.problemsSolvedCount || 0),
      0,
    )
    const progress =
      memberCheckins.length > 0 ? Math.min(100, Math.round((hours / 200) * 100)) : 0

    const activity =
      memberCheckins.length > 0
        ? `Logged ${hours}h • ${problems} solved`
        : m.role === "owner"
          ? "Team Owner • Ready for sprint"
          : "Team Member • Ready for sprint"

    const time = memberCheckins.length > 0 ? "Active" : "Joined"

    return {
      name: m.name,
      avatar: m.avatar,
      role: m.role,
      activity,
      time,
      progress,
    }
  })

  return (
    <div className="w-64 xl:w-72 min-w-[256px] xl:min-w-[288px] bg-surface-white rounded-[28px] p-5 shadow-sm border border-border-light flex flex-col h-full ml-5">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-text-primary text-base">Friends</h3>
          {currentTeam && (
            <p className="text-[10px] font-bold text-primary-purple truncate max-w-[140px]">
              {currentTeam.name}
            </p>
          )}
        </div>
        <span className="text-primary-purple text-xs font-bold">
          {members.length}/{currentTeam?.maxMembers || 5}
        </span>
      </div>

      <div className="flex gap-1.5 mb-4 bg-app-bg p-1 rounded-xl">
        <button className="flex-1 bg-white text-text-primary font-bold text-xs py-1.5 rounded-lg shadow-sm border border-border-light/50">
          Members ({displayMembers.length})
        </button>
      </div>

      <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {displayMembers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-text-secondary text-xs font-medium">
            <p>No teammates yet.</p>
            {currentTeam?.inviteCode && (
              <p className="mt-2 text-primary-purple font-bold">
                Invite Code: {currentTeam.inviteCode}
              </p>
            )}
          </div>
        ) : (
          displayMembers.map((friend, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 group cursor-pointer"
            >
              <div className="relative">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-9 h-9 rounded-full object-cover shadow-sm group-hover:ring-2 ring-primary-purple ring-offset-1 transition-all"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className="font-bold text-text-primary text-xs truncate">
                    {friend.name}
                  </h4>
                  <span className="text-[10px] text-text-secondary font-bold shrink-0">
                    {friend.time}
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary leading-tight truncate group-hover:text-primary-purple transition-colors">
                  {friend.activity}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border-light">
        <h4 className="font-bold text-text-primary text-xs mb-3">
          Team Progress
        </h4>
        <div className="flex flex-col gap-2.5">
          {displayMembers.length === 0 ? (
            <p className="text-text-secondary text-[10px] italic">No active members yet</p>
          ) : (
            displayMembers.slice(0, 3).map((friend, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-text-primary w-14 truncate">
                  {friend.name}
                </span>
                <div className="flex-1 h-1.5 bg-app-bg rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      i === 0
                        ? "bg-primary-purple"
                        : i === 1
                          ? "bg-soft-purple"
                          : "bg-accent-pink"
                    }`}
                    style={{ width: `${friend.progress}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-bold text-text-secondary w-6 text-right">
                  {friend.progress}%
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
export default FriendsPanel
