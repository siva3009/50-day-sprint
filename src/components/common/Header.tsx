import React from "react"
import { Bell, Search } from "lucide-react"
import { useTeam } from "../../context"

interface HeaderProps {
  breadcrumb: string
  title: string
  subtitle?: string
}

export const Header: React.FC<HeaderProps> = ({
  breadcrumb,
  title,
  subtitle,
}) => {
  const { members } = useTeam()

  const displayedMembers = members.slice(0, 2)
  const remainingCount = Math.max(0, members.length - 2)

  return (
    <header className="flex justify-between items-center mb-5 shrink-0">
      <div>
        <p className="text-text-secondary text-xs font-bold tracking-wider uppercase mb-0.5">
          {breadcrumb}
        </p>
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <span className="text-text-secondary text-sm font-medium">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative flex items-center group">
          <Search
            size={16}
            className="absolute left-3 text-text-secondary group-focus-within:text-primary-purple transition-colors"
          />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 rounded-xl bg-surface-white border border-border-light focus:outline-none focus:ring-2 focus:ring-primary-purple/20 focus:border-primary-purple transition-all w-56 text-sm font-medium text-text-primary placeholder:font-normal shadow-sm"
          />
        </div>

        <button className="relative w-10 h-10 rounded-xl bg-surface-white border border-border-light flex items-center justify-center text-text-secondary hover:text-primary-purple hover:border-primary-purple/30 transition-all shadow-sm">
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent-pink rounded-full ring-2 ring-surface-white"></span>
        </button>

        <div className="flex -space-x-3 hover:-space-x-2 transition-all duration-300">
          {members.length > 0 ? (
            <>
              {displayedMembers.map((member, idx) => (
                <img
                  key={member.id || idx}
                  src={member.avatar}
                  alt={member.name}
                  title={`${member.name} (${member.role})`}
                  className={`w-10 h-10 rounded-full border-2 border-app-bg object-cover shadow-sm ${
                    idx === 0 ? "z-30" : "z-20"
                  }`}
                />
              ))}
              {remainingCount > 0 && (
                <div className="w-10 h-10 rounded-full border-2 border-app-bg bg-primary-purple text-white flex items-center justify-center text-[10px] font-bold shadow-sm z-10">
                  +{remainingCount}
                </div>
              )}
            </>
          ) : (
            <>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&auto=format"
                alt="User 1"
                className="w-10 h-10 rounded-full border-2 border-app-bg object-cover shadow-sm z-30"
              />
              <img
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&auto=format"
                alt="User 2"
                className="w-10 h-10 rounded-full border-2 border-app-bg object-cover shadow-sm z-20"
              />
              <div className="w-10 h-10 rounded-full border-2 border-app-bg bg-primary-purple text-white flex items-center justify-center text-[10px] font-bold shadow-sm z-10">
                +3
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
export default Header
