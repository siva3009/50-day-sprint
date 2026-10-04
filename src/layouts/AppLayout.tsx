import React from "react"
import { FriendsPanel, Sidebar } from "../components"
import type { ActiveView } from "../types"

interface AppLayoutProps {
  activeView: ActiveView
  setActiveView: (view: ActiveView) => void
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeView,
  setActiveView,
  children,
}) => {
  return (
    <div className="h-screen w-full bg-app-bg flex overflow-hidden p-5 font-sans">
      <Sidebar active={activeView} setActive={setActiveView} />

      {children}

      {activeView === "Dashboard" && (
        <div className="hidden xl:block h-full">
          <FriendsPanel />
        </div>
      )}
    </div>
  )
}
export default AppLayout
