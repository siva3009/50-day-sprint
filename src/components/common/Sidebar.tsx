import React from "react"
import {
  BarChart2,
  BrainCircuit,
  Globe,
  LayoutDashboard,
  Layers,
  LogOut,
  Settings,
  Terminal,
} from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import type { ActiveView } from "../../types"

interface SidebarProps {
  active: ActiveView | string
  setActive: (a: ActiveView) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ active, setActive }) => {
  const { signOut } = useAuth()
  const navItems: { name: ActiveView; icon: typeof LayoutDashboard }[] = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "DSA", icon: BrainCircuit },
    { name: "LeetCode", icon: Terminal },
    { name: "Full Stack", icon: Globe },
    { name: "Projects", icon: Layers },
    { name: "Analytics", icon: BarChart2 },
  ]

  return (
    <div className="w-20 min-w-[80px] bg-primary-purple h-full rounded-[28px] flex flex-col items-center py-6 shadow-xl text-white mr-5 flex-shrink-0 transition-all duration-300 z-50">
      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-8 shadow-inner backdrop-blur-sm">
        <Layers size={20} className="text-white" />
      </div>

      <nav className="flex flex-col gap-2 flex-1 w-full px-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = active === item.name
          return (
            <button
              key={item.name}
              onClick={() => setActive(item.name)}
              className={`w-full aspect-square rounded-[14px] flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                isActive
                  ? "bg-white text-primary-purple shadow-md"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon
                size={isActive ? 22 : 20}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </button>
          )
        })}
      </nav>

      <div className="flex flex-col gap-2 w-full px-3 mt-auto">
        <button
          onClick={() => setActive("Settings")}
          className={`w-full aspect-square rounded-[14px] flex items-center justify-center transition-all ${
            active === "Settings"
              ? "bg-white text-primary-purple shadow-md"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Settings
            size={active === "Settings" ? 22 : 20}
            strokeWidth={active === "Settings" ? 2.5 : 2}
          />
        </button>
        <button
          onClick={() => signOut()}
          title="Sign Out"
          className="w-full aspect-square rounded-[14px] flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  )
}
export default Sidebar
