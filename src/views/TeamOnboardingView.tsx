import React, { useState } from "react"
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Clock,
  Copy,
  LogOut,
  Sparkles,
  Target,
  Users,
} from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useTeam } from "../context/TeamContext"

type OnboardingTab = "create" | "join"

export default function TeamOnboardingView() {
  const { signOut, profile } = useAuth()
  const { createTeam, joinTeam } = useTeam()

  const [activeTab, setActiveTab] = useState<OnboardingTab>("create")
  const [teamName, setTeamName] = useState("")
  const [sprintName, setSprintName] = useState("50 Day Sprint")
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  )
  const [dailyHours, setDailyHours] = useState("4.0")
  const [weeklyHours, setWeeklyHours] = useState("25.0")
  const [inviteCode, setInviteCode] = useState("")

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Calculate projected end date (startDate + 49 days = 50 calendar days inclusive)
  const getCalculatedEndDate = (start: string): string => {
    try {
      const d = new Date(start)
      d.setDate(d.getDate() + 49)
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return "—"
    }
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!teamName.trim()) {
      setErrorMessage("Please enter a team name.")
      return
    }

    setLoading(true)
    try {
      const { error } = await createTeam(
        teamName.trim(),
        sprintName.trim() || "50 Day Sprint",
        startDate,
        parseFloat(dailyHours) || 4.0,
        parseFloat(weeklyHours) || 25.0,
      )

      if (error) {
        setErrorMessage(error.message)
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to create team",
      )
    } finally {
      setLoading(false)
    }
  }

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const cleanCode = inviteCode.trim().toUpperCase()
    if (!cleanCode) {
      setErrorMessage("Please enter an invite code.")
      return
    }

    setLoading(true)
    try {
      const { error } = await joinTeam(cleanCode)
      if (error) {
        setErrorMessage(error.message)
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to join team",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-app-bg flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-xl">
        {/* Header Badge */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary-purple shadow-lg shadow-primary-purple/30 flex items-center justify-center text-white mb-3">
            <Users size={28} />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-primary-purple/10 text-primary-purple border border-primary-purple/20 mb-2">
            Step 2: Team Setup
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary uppercase">
            Welcome, {profile?.name?.split(" ")[0] || "Scholar"}!
          </h1>
          <p className="text-xs sm:text-sm font-medium text-text-secondary mt-1 max-w-md">
            The 50 Day Sprint is designed for groups of 2–5 peers. Create a new team for your friends or join an existing sprint with an invite code.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex p-1.5 bg-surface-white rounded-2xl mb-6 shadow-sm border border-border-light max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => {
              setErrorMessage(null)
              setActiveTab("create")
            }}
            className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "create"
                ? "bg-primary-purple text-white shadow-md"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Sparkles size={14} />
            CREATE TEAM
          </button>
          <button
            type="button"
            onClick={() => {
              setErrorMessage(null)
              setActiveTab("join")
            }}
            className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "join"
                ? "bg-primary-purple text-white shadow-md"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Copy size={14} />
            JOIN TEAM
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-surface-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-border-light">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-accent-pink/10 border border-accent-pink/30 flex items-start gap-3 text-accent-pink text-xs font-semibold">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === "create" ? (
            /* CREATE TEAM FORM */
            <form onSubmit={handleCreateTeam} className="flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-extrabold text-text-primary tracking-tight">
                  Initialize Your 50-Day Sprint
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  You will become the team owner and receive an invite code to share with up to 4 peers.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  Team Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Code Warriors"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  disabled={loading}
                  className="bg-app-bg border border-border-light text-text-primary text-sm font-medium py-2.5 px-4 rounded-xl focus:outline-none focus:border-primary-purple/50 focus:ring-2 focus:ring-primary-purple/10 transition-all w-full"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    Sprint Name
                  </label>
                  <input
                    type="text"
                    value={sprintName}
                    onChange={(e) => setSprintName(e.target.value)}
                    disabled={loading}
                    className="bg-app-bg border border-border-light text-text-primary text-sm font-medium py-2.5 px-4 rounded-xl focus:outline-none focus:border-primary-purple/50 focus:ring-2 focus:ring-primary-purple/10 transition-all w-full"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={loading}
                    className="bg-app-bg border border-border-light text-text-primary text-sm font-medium py-2.5 px-4 rounded-xl focus:outline-none focus:border-primary-purple/50 focus:ring-2 focus:ring-primary-purple/10 transition-all w-full"
                  />
                </div>
              </div>

              {/* Sprint Schedule Info Card */}
              <div className="p-4 rounded-2xl bg-primary-purple/5 border border-primary-purple/20 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-primary-purple">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} /> Duration: 50 Days (Inclusive)
                  </span>
                  <span>Ends: {getCalculatedEndDate(startDate)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-medium text-text-secondary pt-2 border-t border-primary-purple/10">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> Target: 4 hrs / day • 25 hrs / week
                  </span>
                  <span className="flex items-center gap-1">
                    <Target size={12} /> Goal: Placement Ready
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full bg-primary-purple hover:bg-deep-purple text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>CREATE TEAM & START SPRINT</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* JOIN TEAM FORM */
            <form onSubmit={handleJoinTeam} className="flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-extrabold text-text-primary tracking-tight">
                  Join with Invite Code
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Ask your sprint peer or team owner for their 6-character team invite code.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  Team Invite Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={8}
                    placeholder="e.g. VX7K92"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    disabled={loading}
                    className="bg-app-bg border border-border-light text-text-primary text-base font-extrabold py-3 px-4 rounded-xl focus:outline-none focus:border-primary-purple/50 focus:ring-2 focus:ring-primary-purple/10 tracking-widest text-center uppercase transition-all w-full"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-app-bg border border-border-light/60 flex items-start gap-3">
                <Users size={16} className="text-primary-purple shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-text-secondary leading-relaxed">
                  Teams are limited to a maximum of 5 members. Once joined, your progress will sync with your teammates in the live Friends panel and Team sprint leaderboard.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full bg-primary-purple hover:bg-deep-purple text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>JOIN TEAM SPRINT</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer Logout Option */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => signOut()}
            className="text-xs font-bold text-text-secondary hover:text-accent-pink transition-colors flex items-center gap-1.5"
          >
            <LogOut size={14} />
            <span>Sign out ({profile?.email})</span>
          </button>
        </div>
      </div>
    </div>
  )
}
