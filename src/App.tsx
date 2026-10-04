import { useState } from "react"
import { AuthProvider, TeamProvider, useAuth, useTeam } from "./context"
import { AppLayout } from "./layouts"
import {
  AuthView,
  TeamOnboardingView,
  DashboardView,
  DSAView,
  LeetCodeView,
  FullStackView,
  ProjectsView,
  AnalyticsView,
  SettingsView,
} from "./views"
import type { ActiveView } from "./types"

function AppContent() {
  const { user, loading: authLoading } = useAuth()
  const { currentTeam, loading: teamLoading } = useTeam()
  const [activeView, setActiveView] = useState<ActiveView>("Dashboard")

  // Loading state while restoring Supabase auth session or resolving team context
  if (authLoading || (user && teamLoading)) {
    return (
      <div className="h-screen w-full bg-app-bg flex flex-col items-center justify-center gap-3 font-sans">
        <div className="w-10 h-10 border-4 border-primary-purple/20 border-t-primary-purple rounded-full animate-spin" />
        <p className="text-xs font-bold text-text-secondary tracking-widest uppercase">
          Loading 50 Day Sprint...
        </p>
      </div>
    )
  }

  // Auth Guard: Unauthenticated users are presented with the login/signup screen
  if (!user) {
    return <AuthView />
  }

  // Team Setup Flow (Phase 5):
  // If user has no team, prompt them to create or join a team
  if (!currentTeam) {
    return <TeamOnboardingView />
  }

  // Authenticated users with established team context enter the application
  return (
    <AppLayout activeView={activeView} setActiveView={setActiveView}>
      {activeView === "Dashboard" && <DashboardView />}
      {activeView === "DSA" && <DSAView />}
      {activeView === "LeetCode" && <LeetCodeView />}
      {activeView === "Full Stack" && <FullStackView />}
      {activeView === "Projects" && <ProjectsView />}
      {activeView === "Analytics" && <AnalyticsView />}
      {activeView === "Settings" && <SettingsView />}

      {activeView !== "Dashboard" &&
        activeView !== "DSA" &&
        activeView !== "LeetCode" &&
        activeView !== "Full Stack" &&
        activeView !== "Projects" &&
        activeView !== "Analytics" &&
        activeView !== "Settings" && (
          <div className="flex-1 flex items-center justify-center text-text-secondary font-bold">
            {activeView} View (Coming Soon)
          </div>
        )}
    </AppLayout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <TeamProvider>
        <AppContent />
      </TeamProvider>
    </AuthProvider>
  )
}

