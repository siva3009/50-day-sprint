import React, { useState } from "react"
import {
  User,
  Target,
  Users,
  Bell,
  Monitor,
  Shield,
  Lock,
  ChevronRight,
  Copy,
  Plus,
  LogOut,
  AlertTriangle,
} from "lucide-react"
import { Header } from "../components/common/Header"
import { useAuth } from "../context/AuthContext"
import { useTeam } from "../context"
import { getSettingsData } from "../services/settingsService"
import type { SettingsTabName } from "../types"

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTabName>("Profile")
  const { profile: defaultProfile, sprintSettings, teamMembers, notifications, teamName, teamCode, teamSize } =
    getSettingsData()
  const { user, profile: authProfile, updateProfile } = useAuth()
  const {
    currentTeam,
    members,
    teamRole,
    currentSprint,
    sprintDayStatus,
    leaveTeam,
  } = useTeam()

  const [codeCopied, setCodeCopied] = useState(false)
  const [leavingTeam, setLeavingTeam] = useState(false)
  const [leaveError, setLeaveError] = useState<string | null>(null)

  // Real profile fields bound to auth profile with default fallbacks
  const [fullName, setFullName] = useState(authProfile?.name ?? defaultProfile.name)
  const [college, setCollege] = useState(authProfile?.college ?? defaultProfile.college)
  const [role, setRole] = useState(authProfile?.role ?? defaultProfile.role)
  const [github, setGithub] = useState(authProfile?.github ?? defaultProfile.github)
  const [linkedin, setLinkedin] = useState(authProfile?.linkedin ?? defaultProfile.linkedin)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Sync state when real profile loads
  React.useEffect(() => {
    if (authProfile) {
      setFullName(authProfile.name || "")
      setCollege(authProfile.college || "")
      setRole(authProfile.role || "")
      setGithub(authProfile.github || "")
      setLinkedin(authProfile.linkedin || "")
    }
  }, [authProfile])

  const userEmail = user?.email ?? authProfile?.email ?? defaultProfile.email
  const activeAvatar = authProfile?.avatar || defaultProfile.avatar
  const activeName = fullName || authProfile?.name || defaultProfile.name

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      const { error } = await updateProfile({
        name: fullName.trim(),
        college: college.trim(),
        role: role.trim(),
        github: github.trim(),
        linkedin: linkedin.trim(),
      })

      if (error) {
        setSaveError(error.message)
      } else {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  const tabs: { name: SettingsTabName; icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }> }[] = [
    { name: "Profile", icon: User },
    { name: "Sprint", icon: Target },
    { name: "Team", icon: Users },
    { name: "Notifications", icon: Bell },
    { name: "Appearance", icon: Monitor },
    { name: "Security", icon: Shield },
  ]

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      <Header
        breadcrumb="SETTINGS"
        title="Settings"
        subtitle="Manage your account, sprint preferences, and notifications."
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6 flex flex-col md:flex-row gap-6">
        {/* Left Nav */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-6">
          {/* Optional Account Summary */}
          <div className="bg-surface-white rounded-[24px] p-5 shadow-sm border border-border-light flex flex-col items-center text-center">
            <img
              src={activeAvatar}
              alt={activeName}
              className="w-16 h-16 rounded-full object-cover shadow-sm mb-3 border-2 border-border-light"
            />
            <h3 className="font-extrabold text-text-primary text-sm mb-0.5">
              {activeName}
            </h3>
            <p className="text-xs font-bold text-primary-purple mb-3 uppercase tracking-wider">
              {sprintDayStatus.label}
            </p>
            <div className="w-full flex justify-between gap-2 border-t border-border-light/50 pt-3 text-left">
              <div>
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-0.5">
                  Progress
                </p>
                <p className="text-xs font-bold text-text-primary">78%</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-0.5">
                  Streak
                </p>
                <p className="text-xs font-bold text-text-primary flex items-center gap-1 justify-end">
                  <span className="text-sm">🔥</span> 14 Days
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface-white rounded-[24px] p-3 shadow-sm border border-border-light flex flex-col gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.name
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                    isActive
                      ? "bg-primary-purple/10 text-primary-purple border border-primary-purple/20"
                      : "text-text-secondary hover:text-text-primary hover:bg-app-bg border border-transparent"
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {tab.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "Profile" && (
            <div className="bg-surface-white rounded-[32px] p-6 shadow-sm border border-border-light">
              <h2 className="text-xl font-extrabold text-text-primary tracking-tight mb-6">
                Profile Information
              </h2>
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-5 mb-2">
                  <img
                    src={activeAvatar}
                    alt={activeName}
                    className="w-20 h-20 rounded-full object-cover shadow-sm border border-border-light"
                  />
                  <button
                    type="button"
                    className="bg-app-bg hover:bg-border-light text-text-primary font-bold text-xs py-2 px-4 rounded-lg transition-colors border border-border-light/50"
                  >
                    Change Avatar
                  </button>
                </div>

                {saveSuccess && (
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600 text-xs font-bold flex items-center gap-2">
                    <span>✓</span> Profile updated successfully!
                  </div>
                )}

                {saveError && (
                  <div className="p-3 rounded-xl bg-accent-pink/10 border border-accent-pink/30 text-accent-pink text-xs font-bold flex items-center gap-2">
                    <AlertTriangle size={14} />
                    <span>{saveError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-app-bg border border-border-light text-text-primary text-sm font-medium py-2.5 px-4 rounded-xl focus:outline-none focus:border-primary-purple/50 focus:ring-2 focus:ring-primary-purple/10 transition-all w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                      Email Address (Connected)
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      disabled
                      className="bg-app-bg/60 border border-border-light text-text-secondary text-sm font-medium py-2.5 px-4 rounded-xl w-full cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                      College
                    </label>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="bg-app-bg border border-border-light text-text-primary text-sm font-medium py-2.5 px-4 rounded-xl focus:outline-none focus:border-primary-purple/50 focus:ring-2 focus:ring-primary-purple/10 transition-all w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                      Role
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="bg-app-bg border border-border-light text-text-primary text-sm font-medium py-2.5 px-4 rounded-xl focus:outline-none focus:border-primary-purple/50 focus:ring-2 focus:ring-primary-purple/10 transition-all w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-border-light/50">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                      GitHub
                    </label>
                    <input
                      type="text"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      className="bg-app-bg border border-border-light text-text-primary text-sm font-medium py-2.5 px-4 rounded-xl focus:outline-none focus:border-primary-purple/50 focus:ring-2 focus:ring-primary-purple/10 transition-all w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                      LinkedIn
                    </label>
                    <input
                      type="text"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="bg-app-bg border border-border-light text-text-primary text-sm font-medium py-2.5 px-4 rounded-xl focus:outline-none focus:border-primary-purple/50 focus:ring-2 focus:ring-primary-purple/10 transition-all w-full"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-primary-purple hover:bg-deep-purple text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md transition-colors flex items-center gap-2 disabled:opacity-60"
                  >
                    {saving ? "SAVING..." : "SAVE CHANGES"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Sprint" && (
            <div className="bg-surface-white rounded-[32px] p-6 shadow-sm border border-border-light">
              <h2 className="text-xl font-extrabold text-text-primary tracking-tight mb-6">
                Sprint Settings
              </h2>

              <div className="bg-primary-purple/5 border border-primary-purple/20 p-4 rounded-xl mb-6 flex items-start gap-3">
                <Target
                  size={18}
                  className="text-primary-purple shrink-0 mt-0.5"
                />
                <p className="text-xs font-bold text-primary-purple leading-snug">
                  Sprint dates and goals affect your progress calculations.
                  Modifying these mid-sprint may shift your expected progress
                  lines in Analytics.
                </p>
              </div>

              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                      Sprint Name
                    </label>
                    <input
                      type="text"
                      defaultValue={currentSprint?.name || sprintSettings.name}
                      className="bg-app-bg border border-border-light text-text-primary text-sm font-medium py-2.5 px-4 rounded-xl focus:outline-none focus:border-primary-purple/50 focus:ring-2 focus:ring-primary-purple/10 transition-all w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                      Start Date
                    </label>
                    <input
                      type="date"
                      defaultValue={currentSprint?.startDate || sprintSettings.startDate}
                      className="bg-app-bg border border-border-light text-text-primary text-sm font-medium py-2.5 px-4 rounded-xl focus:outline-none focus:border-primary-purple/50 focus:ring-2 focus:ring-primary-purple/10 transition-all w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                      End Date
                    </label>
                    <input
                      type="date"
                      defaultValue={currentSprint?.endDate || sprintSettings.endDate}
                      className="bg-app-bg border border-border-light text-text-primary text-sm font-medium py-2.5 px-4 rounded-xl focus:outline-none focus:border-primary-purple/50 focus:ring-2 focus:ring-primary-purple/10 transition-all w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2 mt-2 pt-4 border-t border-border-light/50">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                      Current Day (Calculated)
                    </label>
                    <div className="bg-app-bg/50 border border-border-light text-primary-purple text-sm font-bold py-2.5 px-4 rounded-xl w-full flex items-center justify-between">
                      <span>{sprintDayStatus.label}</span>
                      <Lock size={14} className="text-text-secondary" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                      Daily Target (Hours)
                    </label>
                    <div className="relative">
                      <select 
                        defaultValue={sprintSettings.dailyTargetHours}
                        className="appearance-none bg-app-bg border border-border-light text-text-primary text-sm font-medium py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:border-primary-purple/50 focus:ring-2 focus:ring-primary-purple/10 transition-all w-full"
                      >
                        <option>2 Hours</option>
                        <option>3 Hours</option>
                        <option>4 Hours</option>
                        <option>5 Hours</option>
                        <option>6 Hours</option>
                      </select>
                      <ChevronRight
                        size={14}
                        className="absolute right-4 top-3.5 text-text-secondary pointer-events-none rotate-90"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                      Weekly Target (Hours)
                    </label>
                    <div className="relative">
                      <select 
                        defaultValue={sprintSettings.weeklyTargetHours}
                        className="appearance-none bg-app-bg border border-border-light text-text-primary text-sm font-medium py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:border-primary-purple/50 focus:ring-2 focus:ring-primary-purple/10 transition-all w-full"
                      >
                        <option>15 Hours</option>
                        <option>20 Hours</option>
                        <option>25 Hours</option>
                        <option>30 Hours</option>
                      </select>
                      <ChevronRight
                        size={14}
                        className="absolute right-4 top-3.5 text-text-secondary pointer-events-none rotate-90"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                      Primary Goal
                    </label>
                    <input
                      type="text"
                      defaultValue={sprintSettings.primaryGoal}
                      className="bg-app-bg border border-border-light text-text-primary text-sm font-medium py-2.5 px-4 rounded-xl focus:outline-none focus:border-primary-purple/50 focus:ring-2 focus:ring-primary-purple/10 transition-all w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                      Target Companies
                    </label>
                    <input
                      type="text"
                      defaultValue={sprintSettings.targetCompanies}
                      className="bg-app-bg border border-border-light text-text-primary text-sm font-medium py-2.5 px-4 rounded-xl focus:outline-none focus:border-primary-purple/50 focus:ring-2 focus:ring-primary-purple/10 transition-all w-full"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button className="bg-primary-purple hover:bg-deep-purple text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md transition-colors flex items-center gap-2">
                    SAVE SPRINT SETTINGS
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Team" && (
            <div className="space-y-6">
              <div className="bg-surface-white rounded-[32px] p-6 shadow-sm border border-border-light">
                <h2 className="text-xl font-extrabold text-text-primary tracking-tight mb-6">
                  Team Settings
                </h2>

                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-b border-border-light/50 pb-6 mb-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                        Team Name
                      </label>
                      <input
                        type="text"
                        defaultValue={currentTeam?.name || teamName}
                        className="bg-app-bg border border-border-light text-text-primary text-sm font-medium py-2.5 px-4 rounded-xl focus:outline-none focus:border-primary-purple/50 focus:ring-2 focus:ring-primary-purple/10 transition-all w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                        Team Size
                      </label>
                      <div className="bg-app-bg/50 border border-border-light text-text-primary text-sm font-bold py-2.5 px-4 rounded-xl w-full flex items-center justify-between">
                        <span>
                          {members.length > 0
                            ? `${members.length} / ${currentTeam?.maxMembers || 5}`
                            : teamSize}
                        </span>
                        <Lock size={14} className="text-text-secondary" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                        Team Code
                      </label>
                      <div className="flex gap-2">
                        <div className="bg-app-bg border border-border-light text-text-primary text-sm font-bold py-2.5 px-4 rounded-xl flex-1 tracking-widest text-center">
                          {currentTeam?.inviteCode || teamCode}
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            const code = currentTeam?.inviteCode || teamCode
                            try {
                              await navigator.clipboard.writeText(code)
                              setCodeCopied(true)
                              setTimeout(() => setCodeCopied(false), 2000)
                            } catch (e) {
                              console.error("Failed to copy code", e)
                            }
                          }}
                          className="bg-primary-purple hover:bg-deep-purple text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-colors flex items-center gap-2 shrink-0 active:scale-95"
                        >
                          <Copy size={14} /> {codeCopied ? "COPIED!" : "COPY"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-text-primary text-sm tracking-tight">
                        Members ({members.length > 0 ? members.length : teamMembers.length})
                      </h3>
                      <button
                        type="button"
                        onClick={async () => {
                          const code = currentTeam?.inviteCode || teamCode
                          try {
                            await navigator.clipboard.writeText(code)
                            setCodeCopied(true)
                            setTimeout(() => setCodeCopied(false), 2000)
                          } catch (e) {
                            console.error("Failed to copy code", e)
                          }
                        }}
                        className="text-primary-purple text-xs font-bold hover:text-deep-purple transition-colors flex items-center gap-1"
                      >
                        <Plus size={14} /> {codeCopied ? "Code Copied!" : "Invite Member"}
                      </button>
                    </div>

                    <div className="flex flex-col gap-3">
                      {(members.length > 0
                        ? members.map((m) => ({
                            name: m.name,
                            avatar: m.avatar,
                            owner: m.role === "owner",
                          }))
                        : teamMembers
                      ).map((member, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-xl border border-border-light/50 bg-app-bg/50"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-10 h-10 rounded-full object-cover shadow-sm border border-border-light"
                            />
                            <div>
                              <p className="text-sm font-bold text-text-primary flex items-center gap-2">
                                {member.name}
                                {member.owner && (
                                  <span className="bg-primary-purple/10 text-primary-purple border border-primary-purple/20 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                    Owner
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          {!member.owner && teamRole === "owner" && (
                            <span className="text-[10px] font-bold text-text-secondary px-2 py-1 bg-surface-white border border-border-light rounded-lg">
                              Member
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone inside Team */}
              <div className="bg-surface-white rounded-[24px] p-5 shadow-sm border border-accent-pink/20">
                <h3 className="font-bold text-accent-pink text-sm tracking-tight mb-1">
                  Danger Zone
                </h3>
                {leaveError && (
                  <div className="mt-2 mb-3 p-3 rounded-xl bg-accent-pink/10 border border-accent-pink/30 text-accent-pink text-xs font-bold">
                    {leaveError}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <p className="text-sm font-bold text-text-primary">
                      Leave Team
                    </p>
                    <p className="text-xs font-medium text-text-secondary">
                      Remove yourself from the current sprint team.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={leavingTeam}
                    onClick={async () => {
                      if (
                        !window.confirm(
                          "Are you sure you want to leave this sprint team?",
                        )
                      ) {
                        return
                      }
                      setLeavingTeam(true)
                      setLeaveError(null)
                      try {
                        const { error } = await leaveTeam()
                        if (error) {
                          setLeaveError(error.message)
                        }
                      } catch (err) {
                        setLeaveError(
                          err instanceof Error
                            ? err.message
                            : "Failed to leave team",
                        )
                      } finally {
                        setLeavingTeam(false)
                      }
                    }}
                    className="bg-app-bg hover:bg-accent-pink/10 text-accent-pink font-bold text-xs py-2 px-4 rounded-lg transition-colors border border-accent-pink/30 shadow-sm shrink-0 disabled:opacity-50"
                  >
                    {leavingTeam ? "Leaving..." : "Leave Team"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Notifications" && (
            <div className="bg-surface-white rounded-[32px] p-6 shadow-sm border border-border-light">
              <h2 className="text-xl font-extrabold text-text-primary tracking-tight mb-6">
                Notifications
              </h2>

              <div className="flex flex-col gap-4">
                {notifications.map((notif, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl border border-border-light/50 bg-app-bg/50"
                  >
                    <div>
                      <p className="text-sm font-bold text-text-primary mb-0.5">
                        {notif.title}
                      </p>
                      <p className="text-xs font-medium text-text-secondary">
                        {notif.desc}
                      </p>
                    </div>
                    {/* Toggle Switch */}
                    <div className="relative inline-flex items-center cursor-pointer shrink-0">
                      <div
                        className={`w-11 h-6 rounded-full transition-colors ${
                          notif.on ? "bg-primary-purple" : "bg-border-light"
                        }`}
                      ></div>
                      <div
                        className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          notif.on ? "translate-x-5" : "translate-x-0"
                        } shadow-sm`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Appearance" && (
            <div className="bg-surface-white rounded-[32px] p-6 shadow-sm border border-border-light">
              <h2 className="text-xl font-extrabold text-text-primary tracking-tight mb-6">
                Appearance
              </h2>

              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="font-bold text-text-primary text-sm mb-3">
                    Theme
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button className="flex flex-col gap-3 p-3 rounded-xl border-2 border-primary-purple bg-primary-purple/5 text-left group">
                      <div className="w-full h-24 bg-white rounded-lg border border-border-light overflow-hidden flex flex-col shadow-sm">
                        <div className="h-6 border-b border-border-light bg-app-bg flex items-center px-2">
                          <div className="w-16 h-2 bg-border-light rounded"></div>
                        </div>
                        <div className="flex-1 flex p-2 gap-2">
                          <div className="w-8 bg-app-bg rounded"></div>
                          <div className="flex-1 bg-primary-purple/20 rounded"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-[5px] border-primary-purple bg-white"></div>
                        <span className="text-sm font-bold text-text-primary">
                          Light
                        </span>
                        <span className="text-[10px] font-bold text-text-secondary ml-auto uppercase tracking-wider">
                          Default
                        </span>
                      </div>
                    </button>
                    <button className="flex flex-col gap-3 p-3 rounded-xl border border-border-light bg-surface-white hover:bg-app-bg transition-colors text-left group">
                      <div className="w-full h-24 bg-slate-900 rounded-lg border border-slate-700 overflow-hidden flex flex-col shadow-sm">
                        <div className="h-6 border-b border-slate-700 bg-slate-800 flex items-center px-2">
                          <div className="w-16 h-2 bg-slate-700 rounded"></div>
                        </div>
                        <div className="flex-1 flex p-2 gap-2">
                          <div className="w-8 bg-slate-800 rounded"></div>
                          <div className="flex-1 bg-primary-purple/40 rounded"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-border-light bg-white group-hover:border-primary-purple transition-colors"></div>
                        <span className="text-sm font-bold text-text-secondary group-hover:text-text-primary transition-colors">
                          Dark
                        </span>
                      </div>
                    </button>
                    <button className="flex flex-col gap-3 p-3 rounded-xl border border-border-light bg-surface-white hover:bg-app-bg transition-colors text-left group">
                      <div className="w-full h-24 rounded-lg border border-border-light overflow-hidden flex flex-col shadow-sm bg-gradient-to-r from-white to-slate-900"></div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-border-light bg-white group-hover:border-primary-purple transition-colors"></div>
                        <span className="text-sm font-bold text-text-secondary group-hover:text-text-primary transition-colors">
                          System
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="border-t border-border-light/50 pt-6">
                  <h3 className="font-bold text-text-primary text-sm mb-3">
                    Accent Color
                  </h3>
                  <div className="flex gap-4">
                    <button className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-primary-purple shadow-sm ring-4 ring-primary-purple/20"></div>
                      <span className="text-xs font-bold text-text-primary">
                        Purple
                      </span>
                    </button>
                    <button className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-accent-pink shadow-sm hover:ring-4 ring-accent-pink/20 transition-all opacity-80 hover:opacity-100"></div>
                      <span className="text-xs font-bold text-text-secondary">
                        Pink
                      </span>
                    </button>
                  </div>
                </div>

                <div className="border-t border-border-light/50 pt-6 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border-light/50 bg-app-bg/50">
                    <div>
                      <p className="text-sm font-bold text-text-primary mb-0.5">
                        Compact Mode
                      </p>
                      <p className="text-xs font-medium text-text-secondary">
                        Reduce whitespace and fit more content on screen.
                      </p>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer shrink-0">
                      <div className="w-11 h-6 rounded-full transition-colors bg-border-light"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform translate-x-0 shadow-sm"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-border-light/50 bg-app-bg/50">
                    <div>
                      <p className="text-sm font-bold text-text-primary mb-0.5">
                        Animations
                      </p>
                      <p className="text-xs font-medium text-text-secondary">
                        Enable page transitions and subtle visual effects.
                      </p>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer shrink-0">
                      <div className="w-11 h-6 rounded-full transition-colors bg-primary-purple"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform translate-x-5 shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Security" && (
            <div className="space-y-6">
              <div className="bg-surface-white rounded-[32px] p-6 shadow-sm border border-border-light">
                <h2 className="text-xl font-extrabold text-text-primary tracking-tight mb-6">
                  Security
                </h2>

                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-5 border-b border-border-light/50 pb-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue={userEmail}
                        disabled
                        className="bg-app-bg border border-border-light text-text-secondary text-sm font-medium py-2.5 px-4 rounded-xl w-full opacity-70"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                        Password
                      </label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="password"
                          defaultValue="••••••••"
                          disabled
                          className="bg-app-bg border border-border-light text-text-secondary text-sm font-medium py-2.5 px-4 rounded-xl flex-1 opacity-70 tracking-widest"
                        />
                        <button className="bg-surface-white hover:bg-app-bg text-text-primary border border-border-light font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-colors shrink-0">
                          CHANGE PASSWORD
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-border-light/50 bg-app-bg/50">
                    <div>
                      <p className="text-sm font-bold text-text-primary mb-0.5">
                        Two-Factor Authentication
                      </p>
                      <p className="text-xs font-medium text-text-secondary">
                        Currently: <span className="font-bold">Disabled</span>
                      </p>
                    </div>
                    <button className="bg-surface-white hover:bg-app-bg text-text-primary border border-border-light font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition-colors shrink-0">
                      ENABLE
                    </button>
                  </div>

                  <div className="border border-border-light/50 rounded-xl overflow-hidden">
                    <div className="bg-app-bg/50 p-4 border-b border-border-light/50">
                      <h3 className="font-bold text-text-primary text-sm">
                        Active Sessions
                      </h3>
                    </div>
                    <div className="p-4 flex items-center justify-between bg-surface-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-purple/10 flex items-center justify-center text-primary-purple shrink-0">
                          <Monitor size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-primary">
                            Windows • Chrome
                          </p>
                          <p className="text-xs font-bold text-green-500">
                            Active now
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-app-bg/30 p-3 flex justify-between gap-3 border-t border-border-light/50">
                      <button className="text-primary-purple text-xs font-bold hover:text-deep-purple transition-colors px-2">
                        View Sessions
                      </button>
                      <button className="text-text-secondary text-xs font-bold hover:text-text-primary transition-colors px-2">
                        Sign out of all devices
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-surface-white rounded-[24px] p-5 shadow-sm border border-accent-pink/20 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={18} className="text-accent-pink" />
                  <h3 className="font-bold text-accent-pink text-sm tracking-tight">
                    Danger Zone
                  </h3>
                </div>

                <div className="flex items-center justify-between border-b border-border-light/50 pb-4">
                  <div className="pr-4">
                    <p className="text-sm font-bold text-text-primary">
                      Leave Team
                    </p>
                    <p className="text-xs font-medium text-text-secondary">
                      Remove yourself from the current sprint team.
                    </p>
                  </div>
                  <button className="bg-surface-white hover:bg-accent-pink/10 text-accent-pink font-bold text-xs py-2 px-4 rounded-lg transition-colors border border-border-light shadow-sm shrink-0">
                    Leave Team
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="pr-4">
                    <p className="text-sm font-bold text-text-primary">
                      Delete Account
                    </p>
                    <p className="text-xs font-medium text-text-secondary">
                      Permanently delete your account and associated data.
                    </p>
                  </div>
                  <button className="bg-surface-white hover:bg-accent-pink/10 text-accent-pink font-bold text-xs py-2 px-4 rounded-lg transition-colors border border-border-light shadow-sm shrink-0">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
