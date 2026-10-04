import React from "react"
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ExternalLink,
  GitBranch,
  Globe,
  MoreHorizontal,
  PenTool,
  Plus,
  Search,
  Settings,
} from "lucide-react"
import { DSAMetricCard } from "../components"
import { getProjectsData } from "../services"

export const ProjectsView: React.FC = () => {
  const { features, team, recentActivity, milestones } = getProjectsData()

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      <header className="flex justify-between items-center mb-5 shrink-0">
        <div>
          <p className="text-text-secondary text-xs font-bold tracking-wider uppercase mb-0.5">
            Build
          </p>
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
              Projects
            </h1>
            <span className="text-text-secondary text-sm font-medium">
              Build real-world applications and become interview-ready.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="relative flex items-center group hidden sm:flex">
            <Search
              size={16}
              className="absolute left-3 text-text-secondary group-focus-within:text-primary-purple transition-colors"
            />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-2 rounded-xl bg-surface-white border border-border-light focus:outline-none focus:ring-2 focus:ring-primary-purple/20 focus:border-primary-purple transition-all w-48 text-sm font-medium text-text-primary placeholder:font-normal shadow-sm"
            />
          </div>

          <button className="relative w-10 h-10 rounded-xl bg-surface-white border border-border-light flex items-center justify-center text-text-secondary hover:text-primary-purple hover:border-primary-purple/30 transition-all shadow-sm shrink-0">
            <Bell size={18} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent-pink rounded-full ring-2 ring-surface-white"></span>
          </button>

          <div className="hidden sm:flex -space-x-3 hover:-space-x-2 transition-all duration-300">
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
          </div>

          <button className="bg-primary-purple hover:bg-deep-purple text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-colors flex items-center gap-2 shrink-0">
            <Plus size={16} />{" "}
            <span className="hidden sm:inline-block">NEW PROJECT</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6 space-y-6">
        {/* Project Selector (Mobile/Tablet friendly) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2 sm:pb-0">
            <div className="flex items-center gap-2 bg-surface-white border border-border-light p-1.5 rounded-xl shadow-sm shrink-0">
              <button className="bg-primary-purple/10 text-primary-purple border border-primary-purple/20 px-3 py-1.5 rounded-lg text-xs font-bold">
                Job Connect
              </button>
              <button className="text-text-secondary hover:text-text-primary hover:bg-app-bg px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                E-Commerce
              </button>
              <button className="text-text-secondary hover:text-text-primary hover:bg-app-bg px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                Portfolio
              </button>
            </div>
            <button className="w-8 h-8 rounded-lg bg-surface-white border border-border-light flex items-center justify-center text-text-secondary hover:text-primary-purple hover:border-primary-purple/30 transition-all shadow-sm shrink-0">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* Top Summary Section */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
          <div className="xl:col-span-5 flex">
            <div className="bg-gradient-to-br from-primary-purple to-deep-purple rounded-[24px] p-6 shadow-md text-white flex flex-col justify-between relative overflow-hidden h-full group min-h-[160px] w-full">
              <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent-pink/20 rounded-full blur-xl"></div>

              <div className="z-10 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white/90 tracking-wider text-xs uppercase mb-1">
                    PROJECT PROGRESS
                  </h3>
                  <p className="text-5xl font-extrabold tracking-tight mt-1">
                    65<span className="text-3xl opacity-80">%</span>
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-2.5 px-4 text-center border border-white/10">
                  <p className="text-[10px] uppercase font-bold text-white/80 tracking-wider mb-0.5">
                    Status
                  </p>
                  <p className="text-xs font-extrabold text-white">ON TRACK</p>
                </div>
              </div>

              <div className="z-10 mt-6 space-y-4">
                <div className="flex gap-6 flex-wrap">
                  <div>
                    <p className="text-white/80 text-[10px] uppercase font-bold tracking-wider mb-0.5">
                      Features Completed
                    </p>
                    <p className="text-sm font-bold">13 / 20</p>
                  </div>
                  <div>
                    <p className="text-white/80 text-[10px] uppercase font-bold tracking-wider mb-0.5">
                      Projects
                    </p>
                    <p className="text-sm font-bold">2 Active / 1 Done</p>
                  </div>
                  <div>
                    <p className="text-white/80 text-[10px] uppercase font-bold tracking-wider mb-0.5">
                      Deployment
                    </p>
                    <p className="text-sm font-bold flex items-center gap-1">
                      1 / 2
                    </p>
                  </div>
                </div>

                <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-white rounded-full"
                    style={{ width: `65%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
            <DSAMetricCard
              title="Active Projects"
              mainStat="2"
              subStats={[
                {
                  label: "Job Connect",
                  value: "65%",
                  color: "text-primary-purple",
                },
                { label: "E-Commerce", value: "12%", color: "text-yellow-500" },
              ]}
            />
            <DSAMetricCard
              title="Completed"
              mainStat="1"
              subStats={[
                { label: "Portfolio", value: "Done", color: "text-green-500" },
              ]}
            />
            <DSAMetricCard
              title="Team Contributors"
              mainStat="4"
              subStats={[
                { label: "Siva", value: "Frontend" },
                { label: "Vasi", value: "Backend" },
                { label: "Shameem", value: "Database" },
              ]}
              isHighlight={true}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
          {/* Left/Main Column - Workspace */}
          <div className="lg:col-span-2 xl:col-span-3 space-y-6">
            {/* Project Header Card */}
            <div className="bg-surface-white rounded-[32px] p-6 shadow-sm border border-border-light overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">
                      Job Connect
                    </h2>
                    <span className="bg-primary-purple/10 text-primary-purple border border-primary-purple/20 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      IN DEVELOPMENT
                    </span>
                  </div>
                  <p className="text-sm font-medium text-text-secondary max-w-2xl">
                    A full-stack job portal built as the team's main placement
                    project. Build a production-style job portal allowing users
                    to discover jobs, apply to positions, manage profiles, and
                    administer listings.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button className="w-10 h-10 rounded-xl bg-app-bg border border-border-light flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-light/80 transition-all shadow-sm">
                    <GitBranch size={18} />
                  </button>
                  <button className="w-10 h-10 rounded-xl bg-app-bg border border-border-light flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-light/80 transition-all shadow-sm">
                    <ExternalLink size={18} />
                  </button>
                  <button className="w-10 h-10 rounded-xl bg-app-bg border border-border-light flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-light/80 transition-all shadow-sm">
                    <Settings size={18} />
                  </button>
                  <button className="bg-primary-purple hover:bg-deep-purple text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md transition-colors flex items-center gap-2">
                    Continue <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 pt-6 border-t border-border-light">
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                    Start Date
                  </p>
                  <p className="text-sm font-bold text-text-primary">Day 11</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                    Target
                  </p>
                  <p className="text-sm font-bold text-text-primary">Day 35</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                    Current Day
                  </p>
                  <p className="text-sm font-bold text-primary-purple">
                    Day 17
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                    Expected
                  </p>
                  <p className="text-sm font-bold text-text-primary">Day 33</p>
                </div>
                <div className="hidden lg:block">
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                    Goal
                  </p>
                  <p className="text-xs font-bold text-text-primary truncate">
                    Portfolio quality project
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Tracker */}
            <div className="bg-surface-white rounded-[32px] p-6 shadow-sm border border-border-light overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-text-primary text-base tracking-tight">
                  Features
                </h3>
                <div className="flex gap-2">
                  <span className="text-xs font-bold text-text-secondary">
                    Progress:
                  </span>
                  <span className="text-xs font-bold text-primary-purple">
                    13 / 20
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {features.map((category, idx) => (
                  <div key={idx} className="space-y-3">
                    <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider border-b border-border-light pb-2">
                      {category.category}
                    </h4>
                    <div className="space-y-2">
                      {category.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-border-light/50 bg-app-bg/50 hover:bg-app-bg transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-[4px] flex items-center justify-center flex-shrink-0 border cursor-pointer transition-colors ${
                                task.checked
                                  ? "bg-primary-purple border-primary-purple text-white"
                                  : "bg-surface-white border-border-light"
                              }`}
                            >
                              {task.checked && (
                                <CheckCircle2 size={12} strokeWidth={3} />
                              )}
                            </div>
                            <span
                              className={`text-xs font-bold ${
                                task.checked
                                  ? "text-text-secondary line-through opacity-70"
                                  : "text-text-primary"
                              }`}
                            >
                              {task.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-text-secondary bg-surface-white border border-border-light/60 px-2 py-0.5 rounded-md">
                              {task.assignee}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                task.status === "Done"
                                  ? "bg-green-500/10 text-green-500"
                                  : "bg-yellow-500/10 text-yellow-500"
                              }`}
                            >
                              {task.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Contributor Status */}
            <div className="bg-surface-white rounded-[32px] p-6 shadow-sm border border-border-light overflow-hidden">
              <h3 className="font-bold text-text-primary text-base tracking-tight mb-6">
                Team Contributors
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {team.map((member, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl border border-border-light/60 bg-app-bg/30 flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover shadow-sm border border-border-light"
                      />
                      <div>
                        <h4 className="font-bold text-text-primary text-sm">
                          {member.name}
                        </h4>
                        <p className="text-[10px] text-text-secondary font-medium">
                          {member.role}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-bold mb-1">
                        <span className="text-text-secondary">Tasks</span>
                        <span className="text-text-primary">
                          {member.tasks}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-app-bg rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-purple rounded-full"
                          style={{ width: `${member.percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-surface-white rounded-[32px] p-6 shadow-sm border border-border-light overflow-hidden">
              <h3 className="font-bold text-text-primary text-base tracking-tight mb-4">
                Recent Project Activity
              </h3>

              <div className="space-y-3">
                {recentActivity.map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl border border-border-light/40 hover:bg-app-bg/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={activity.avatar}
                        alt={activity.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <p className="text-xs text-text-primary">
                        <span className="font-bold">{activity.name}</span>{" "}
                        <span className="text-text-secondary">
                          {activity.action}
                        </span>{" "}
                        <span className="font-bold text-primary-purple">
                          {activity.target}
                        </span>
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-text-secondary">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Side Info */}
          <div className="lg:col-span-1 flex flex-col gap-6 w-full">
            <div className="bg-surface-white rounded-[24px] p-5 shadow-sm border border-border-light flex flex-col">
              <h3 className="font-bold text-text-primary text-sm tracking-tight mb-4">
                Milestones & Timeline
              </h3>

              <div className="relative pl-3 space-y-4">
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border-light z-0"></div>

                {milestones.map((milestone, i) => (
                  <div
                    key={i}
                    className={`relative z-10 flex gap-3 ${
                      milestone.active
                        ? "opacity-100"
                        : milestone.done
                          ? "opacity-70"
                          : "opacity-50"
                    }`}
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                        milestone.done
                          ? "bg-primary-purple ring-4 ring-white"
                          : "bg-border-light ring-4 ring-white"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <p
                          className={`text-xs font-bold ${
                            milestone.active
                              ? "text-primary-purple"
                              : "text-text-primary"
                          }`}
                        >
                          {milestone.title}
                        </p>
                        <p className="text-[10px] font-bold text-text-secondary">
                          Day {milestone.day}
                        </p>
                      </div>
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                        {milestone.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-white rounded-[24px] p-5 shadow-sm border border-border-light flex flex-col">
              <h3 className="font-bold text-text-primary text-sm tracking-tight mb-3">
                Interview Value
              </h3>
              <p className="text-[10px] text-text-secondary font-bold mb-4">
                This project demonstrates:
              </p>

              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  "React",
                  "REST APIs",
                  "Authentication",
                  "Database Design",
                  "Git/GitHub",
                  "Deployment",
                ].map((tech, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 bg-app-bg px-2 py-1 rounded border border-border-light/50"
                  >
                    <CheckCircle2 size={10} className="text-primary-purple" />
                    <span className="text-[10px] font-bold text-text-secondary">
                      {tech}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-primary-purple/10 to-transparent rounded-xl border border-primary-purple/20">
                <span className="text-[10px] text-primary-purple font-bold uppercase tracking-wider">
                  Project Readiness
                </span>
                <span className="text-sm font-extrabold text-primary-purple">
                  74%
                </span>
              </div>
            </div>

            <div className="bg-surface-white rounded-[24px] p-5 shadow-sm border border-border-light flex flex-col">
              <h3 className="font-bold text-text-primary text-sm tracking-tight mb-4">
                Tech Stack & Links
              </h3>

              <div className="space-y-3 mb-5 text-[10px] font-bold border-b border-border-light/50 pb-4">
                <div className="flex gap-2">
                  <span className="text-text-secondary uppercase tracking-wider w-16">
                    Frontend:
                  </span>
                  <span className="text-text-primary">
                    React, TypeScript, Tailwind
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-text-secondary uppercase tracking-wider w-16">
                    Backend:
                  </span>
                  <span className="text-text-primary">Node.js, Express</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-text-secondary uppercase tracking-wider w-16">
                    Database:
                  </span>
                  <span className="text-text-primary">PostgreSQL</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-text-secondary uppercase tracking-wider w-16">
                    Deploy:
                  </span>
                  <span className="text-text-primary">Vercel</span>
                </div>
              </div>

              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-app-bg transition-colors border border-transparent hover:border-border-light group">
                  <div className="flex items-center gap-2">
                    <GitBranch
                      size={14}
                      className="text-text-secondary group-hover:text-text-primary"
                    />
                    <span className="text-xs font-bold text-text-secondary group-hover:text-text-primary">
                      GitHub Repository
                    </span>
                  </div>
                  <ExternalLink
                    size={12}
                    className="text-text-secondary opacity-0 group-hover:opacity-100"
                  />
                </button>
                <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-app-bg transition-colors border border-transparent hover:border-border-light group">
                  <div className="flex items-center gap-2">
                    <Globe
                      size={14}
                      className="text-text-secondary group-hover:text-text-primary"
                    />
                    <span className="text-xs font-bold text-text-secondary group-hover:text-text-primary">
                      Live Preview
                    </span>
                  </div>
                  <ExternalLink
                    size={12}
                    className="text-text-secondary opacity-0 group-hover:opacity-100"
                  />
                </button>
                <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-app-bg transition-colors border border-transparent hover:border-border-light group">
                  <div className="flex items-center gap-2">
                    <PenTool
                      size={14}
                      className="text-text-secondary group-hover:text-text-primary"
                    />
                    <span className="text-xs font-bold text-text-secondary group-hover:text-text-primary">
                      Design
                    </span>
                  </div>
                  <ExternalLink
                    size={12}
                    className="text-text-secondary opacity-0 group-hover:opacity-100"
                  />
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-b from-primary-purple/5 to-surface-white rounded-[24px] p-5 shadow-sm border border-primary-purple/20 flex flex-col mt-auto">
              <h3 className="font-bold text-text-primary text-sm tracking-tight mb-3">
                Up Next
              </h3>
              <div className="space-y-2 mb-4">
                {[
                  "Forgot Password",
                  "Search & Filters",
                  "Application Flow",
                ].map((task, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-[4px] border border-border-light bg-surface-white shrink-0"></div>
                    <span className="text-xs font-bold text-text-primary">
                      {task}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-surface-white rounded-xl p-3 border border-border-light mb-4 shadow-sm flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-0.5">
                    Next Milestone
                  </p>
                  <p className="text-xs font-bold text-primary-purple">
                    Core Features
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-0.5">
                    Expected
                  </p>
                  <p className="text-xs font-bold text-text-primary">6 days</p>
                </div>
              </div>

              <button className="w-full py-2.5 bg-primary-purple hover:bg-deep-purple text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                CONTINUE PROJECT <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default ProjectsView
