import React from "react"
import { CheckCircle2, ChevronRight, Clock, Globe, Lock } from "lucide-react"
import { DSAMetricCard, Header, MissionCardTemplate } from "../components"
import { getFullStackData } from "../services"

export const FullStackView: React.FC = () => {
  const { roadmap, skills, weakAreas, recentCompleted } = getFullStackData()

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      <Header
        breadcrumb="Learning"
        title="Full Stack"
        subtitle="Build production-ready web applications in 50 days"
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6 space-y-6">
        {/* Top Summary Section */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
          <div className="xl:col-span-5 flex">
            <div className="bg-gradient-to-br from-primary-purple to-deep-purple rounded-[24px] p-6 shadow-md text-white flex flex-col justify-between relative overflow-hidden h-full group min-h-[160px] w-full">
              <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent-pink/20 rounded-full blur-xl"></div>

              <div className="z-10 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white/90 tracking-wider text-xs uppercase mb-1">
                    FULL STACK PROGRESS
                  </h3>
                  <p className="text-5xl font-extrabold tracking-tight mt-1">
                    58<span className="text-3xl opacity-80">%</span>
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
                      Modules Completed
                    </p>
                    <p className="text-sm font-bold">12 / 20</p>
                  </div>
                  <div>
                    <p className="text-white/80 text-[10px] uppercase font-bold tracking-wider mb-0.5">
                      Project Progress
                    </p>
                    <p className="text-sm font-bold">65%</p>
                  </div>
                  <div>
                    <p className="text-white/80 text-[10px] uppercase font-bold tracking-wider mb-0.5">
                      Learning Time
                    </p>
                    <p className="text-sm font-bold">46 hrs</p>
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-3 flex justify-between items-center border border-white/10">
                  <div>
                    <p className="text-white/70 text-[10px] uppercase font-bold tracking-wider">
                      Current Focus
                    </p>
                    <p className="text-xs font-bold mt-0.5">React Hooks</p>
                  </div>
                  <ChevronRight size={14} className="text-white/50" />
                  <div className="text-right">
                    <p className="text-white/70 text-[10px] uppercase font-bold tracking-wider">
                      Target
                    </p>
                    <p className="text-xs font-bold mt-0.5">Production Ready</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
            <DSAMetricCard
              title="Technologies"
              mainStat="12 / 20"
              subStats={[
                { label: "Completed", value: "12", color: "text-green-500" },
                { label: "In Progress", value: "3", color: "text-yellow-500" },
                { label: "Upcoming", value: "5", color: "text-text-secondary" },
              ]}
            />
            <DSAMetricCard
              title="This Week"
              mainStat="9 hrs"
              subStats={[
                { label: "Learning", value: "6 hrs" },
                { label: "Building", value: "3 hrs" },
                {
                  label: "Trend",
                  value: "+12% vs last week",
                  color: "text-primary-purple",
                },
              ]}
            />
            <DSAMetricCard
              title="Project"
              mainStat="65%"
              subStats={[
                { label: "Features", value: "13 / 20" },
                {
                  label: "Status",
                  value: "In Development",
                  color: "text-primary-purple",
                },
              ]}
              isHighlight={true}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
          {/* Left/Main Column - Roadmap */}
          <div className="lg:col-span-2 xl:col-span-3 space-y-6">
            <div className="bg-surface-white rounded-[32px] p-6 shadow-sm border border-border-light overflow-hidden">
              <div className="mb-6">
                <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
                  Full Stack Roadmap
                </h2>
                <p className="text-sm font-medium text-text-secondary mt-1">
                  Follow the recommended progression from fundamentals to
                  production deployment.
                </p>
              </div>

              <div className="space-y-8 relative z-10">
                {roadmap.map((section, idx) => (
                  <div key={idx} className="space-y-4 relative">
                    {/* Visual stage connector */}
                    {idx < roadmap.length - 1 && (
                      <div className="absolute left-6 top-10 bottom-[-2rem] w-0.5 bg-border-light z-[-1] hidden md:block"></div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-12 text-center shrink-0 hidden md:block">
                        <div className="w-8 h-8 rounded-full bg-app-bg border border-border-light flex items-center justify-center text-[10px] font-bold text-text-secondary mx-auto">
                          0{idx + 1}
                        </div>
                      </div>
                      <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                        {section.stage}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:pl-12">
                      {section.modules.map((mod) => (
                        <div
                          key={mod.id}
                          className={`rounded-2xl p-4 border transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col ${
                            mod.status === "UP NEXT"
                              ? "bg-surface-white/50 border-border-light/50 opacity-70"
                              : "bg-surface-white border-border-light shadow-sm"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-text-secondary/70">
                                {mod.id}
                              </span>
                              <h4
                                className={`text-sm font-bold truncate max-w-[120px] ${
                                  mod.status === "UP NEXT"
                                    ? "text-text-secondary"
                                    : "text-text-primary"
                                }`}
                                title={mod.name}
                              >
                                {mod.name}
                              </h4>
                            </div>
                            <div
                              className={`px-2 py-1 rounded-md border flex items-center gap-1 text-[10px] font-bold ${
                                mod.status === "COMPLETED"
                                  ? "bg-primary-purple/10 text-primary-purple border-primary-purple/20"
                                  : mod.status === "IN PROGRESS"
                                    ? "bg-accent-pink/10 text-accent-pink border-accent-pink/20"
                                    : "bg-app-bg text-text-secondary border-border-light/50"
                              }`}
                            >
                              {mod.status === "COMPLETED" ? (
                                <CheckCircle2 size={14} />
                              ) : mod.status === "IN PROGRESS" ? (
                                <Clock size={14} />
                              ) : (
                                <Lock size={14} />
                              )}
                              <span className="hidden sm:inline-block">
                                {mod.status}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-1.5 mt-auto">
                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                              Progress
                            </span>
                            <span className="text-[10px] font-bold text-text-primary">
                              {mod.percent}%
                            </span>
                          </div>

                          <div className="h-1.5 w-full bg-app-bg rounded-full overflow-hidden mb-3">
                            <div
                              className={`h-full rounded-full ${
                                mod.status === "IN PROGRESS"
                                  ? "bg-accent-pink"
                                  : "bg-primary-purple"
                              }`}
                              style={{ width: `${mod.percent}%` }}
                            ></div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div>
                              <span className="font-bold text-text-secondary uppercase tracking-wider">
                                Topics:
                              </span>{" "}
                              <span className="font-bold text-text-primary">
                                {mod.topics}
                              </span>
                            </div>
                            <div>
                              <span className="font-bold text-text-secondary uppercase tracking-wider">
                                Practice:
                              </span>{" "}
                              <span className="font-bold text-text-primary">
                                {mod.practice}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-white rounded-[24px] p-5 shadow-sm border border-border-light flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-text-primary text-sm tracking-tight">
                    Recently Completed
                  </h3>
                  <button className="text-primary-purple text-xs font-bold hover:text-deep-purple transition-colors">
                    View All
                  </button>
                </div>

                <div className="flex flex-col gap-2.5">
                  {recentCompleted.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-border-light/50 group hover:border-primary-purple/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-xs font-bold text-text-primary leading-tight truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] font-bold text-text-secondary mt-0.5 truncate">
                          {item.date}
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={12} strokeWidth={3} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface-white rounded-[24px] p-5 shadow-sm border border-border-light flex flex-col h-full justify-between">
                <div>
                  <h3 className="font-bold text-text-primary text-sm tracking-tight mb-2">
                    50 Day Full Stack Goal
                  </h3>

                  <div className="flex justify-between items-end mb-2">
                    <span className="text-2xl font-extrabold text-primary-purple">
                      12{" "}
                      <span className="text-sm text-text-secondary font-bold">
                        / 20
                      </span>
                    </span>
                    <span className="text-[10px] text-text-secondary font-bold uppercase">
                      8 modules remaining
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-app-bg rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-primary-purple rounded-full"
                      style={{ width: `60%` }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-app-bg p-2 rounded-lg text-center">
                      <p className="text-xs font-bold text-text-primary">65%</p>
                      <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-0.5">
                        Project
                      </p>
                    </div>
                    <div className="bg-app-bg p-2 rounded-lg text-center">
                      <p className="text-xs font-bold text-text-primary">
                        Day 44
                      </p>
                      <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-0.5">
                        Expected
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                  <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider">
                    Status
                  </span>
                  <span className="text-xs font-extrabold text-green-600">
                    ON TRACK
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Side Info */}
          <div className="lg:col-span-1 flex flex-col gap-6 w-full">
            <MissionCardTemplate
              title="Today's Full Stack Mission"
              day={17}
              icon={Globe}
              highlight={{
                label: "Current Module",
                value: "React Hooks",
                icon: Globe,
              }}
              tasks={[
                { text: "Review useState", done: true },
                { text: "Learn useEffect", done: false },
                { text: "Practice custom hooks", done: false },
                { text: "Build one mini component", done: false },
                { text: "Add hooks to project", done: false },
              ]}
              expectedTime="1 hr 30 min"
              buttonText="START MISSION"
            />

            <div className="bg-surface-white rounded-[24px] p-5 shadow-sm border border-border-light flex flex-col">
              <h3 className="font-bold text-text-primary text-sm tracking-tight mb-1">
                Project Skills
              </h3>
              <p className="text-[10px] text-text-secondary font-bold mb-4">
                Practical skills applied in project
              </p>

              <div className="flex flex-col gap-3 flex-1">
                {skills.map((skill, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-text-primary">{skill.name}</span>
                      <span className="text-primary-purple">
                        {skill.score}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-app-bg rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-purple rounded-full"
                        style={{ width: `${skill.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-white rounded-[24px] p-5 shadow-sm border border-border-light flex flex-col">
              <h3 className="font-bold text-text-primary text-sm tracking-tight mb-1">
                Weak Areas
              </h3>
              <p className="text-[10px] text-text-secondary font-bold mb-4">
                Areas needing additional practice
              </p>

              <div className="flex flex-col gap-3 flex-1">
                {weakAreas.map((area, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-text-primary">{area.name}</span>
                      <span className="text-accent-pink">{area.score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-app-bg rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-pink rounded-full"
                        style={{ width: `${area.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-4 w-full py-2 bg-app-bg hover:bg-border-light text-text-primary font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors">
                VIEW DETAILED ANALYSIS
              </button>
            </div>

            <div className="bg-surface-white rounded-[24px] p-5 shadow-sm border border-border-light flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-text-primary text-sm tracking-tight">
                  Up Next
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  "React Hooks",
                  "Express Routing",
                  "PostgreSQL",
                  "Authentication",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 p-2 rounded-xl border border-border-light/60 bg-app-bg/50"
                  >
                    <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-text-secondary font-bold text-xs border border-border-light shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-text-primary text-xs leading-tight">
                        {item}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-white rounded-[24px] p-5 shadow-sm border border-border-light flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-text-primary text-sm tracking-tight">
                    Learning vs Building
                  </h3>
                  <p className="text-[10px] text-text-secondary font-bold mt-0.5">
                    This Week (Target: 10 hrs)
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
                    <span className="text-text-secondary">Learning</span>
                    <span className="text-text-primary">6 hrs</span>
                  </div>
                  <div className="h-2 w-full bg-app-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-soft-purple rounded-full"
                      style={{ width: `60%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
                    <span className="text-text-secondary">Building</span>
                    <span className="text-text-primary">3 hrs</span>
                  </div>
                  <div className="h-2 w-full bg-app-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-purple rounded-full"
                      style={{ width: `30%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default FullStackView
