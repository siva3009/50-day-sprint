import React, { useState } from "react"
import { CheckCircle2, Clock, Sparkles, Target, X } from "lucide-react"
import {
  submitDailyCheckin,
  getLocalTodayDateString,
  type DailyCheckin,
} from "../../services/dailyCheckinService"

interface DailyCheckinModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  sprintId: string
  teamId?: string
  sprintDayLabel: string
  existingCheckin?: DailyCheckin | null
  onSuccess: () => void
}

export const DailyCheckinModal: React.FC<DailyCheckinModalProps> = ({
  isOpen,
  onClose,
  userId,
  sprintId,
  teamId,
  sprintDayLabel,
  existingCheckin,
  onSuccess,
}) => {
  const [studyMinutes, setStudyMinutes] = useState<number>(
    existingCheckin ? Math.round(existingCheckin.studyHours * 60) : 60,
  )
  const [problemsSolved, setProblemsSolved] = useState<number>(
    existingCheckin ? existingCheckin.problemsSolvedCount : 2,
  )
  const [dsaCompleted, setDsaCompleted] = useState<boolean>(
    existingCheckin ? existingCheckin.dsaCompleted : false,
  )
  const [leetcodeCompleted, setLeetcodeCompleted] = useState<boolean>(
    existingCheckin ? existingCheckin.leetcodeCompleted : false,
  )
  const [fullstackCompleted, setFullstackCompleted] = useState<boolean>(
    existingCheckin ? existingCheckin.fullstackCompleted : false,
  )
  const [projectCompleted, setProjectCompleted] = useState<boolean>(
    existingCheckin ? existingCheckin.projectCompleted : false,
  )
  const [notes, setNotes] = useState<string>(existingCheckin?.notes || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const todayStr = getLocalTodayDateString()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await submitDailyCheckin({
      userId,
      sprintId,
      teamId,
      checkinDate: todayStr,
      studyMinutes: Number(studyMinutes) || 0,
      problemsSolved: Number(problemsSolved) || 0,
      dsaCompleted,
      leetcodeCompleted,
      fullstackCompleted,
      projectCompleted,
      notes,
    })

    setLoading(false)

    if (res.error) {
      setError(res.error.message)
    } else {
      onSuccess()
      onClose()
    }
  }

  const hoursDisplay = (Math.max(0, studyMinutes) / 60).toFixed(1)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-white rounded-[28px] border border-border-light shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-border-light/60 bg-app-bg/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-purple text-white flex items-center justify-center shadow-sm">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-text-primary">
                Daily Check-in
              </h2>
              <p className="text-xs font-bold text-primary-purple uppercase tracking-wider">
                {sprintDayLabel} • {todayStr}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-4"
        >
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Study Minutes */}
          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={13} className="text-primary-purple" />
                Study Time
              </label>
              <span className="text-xs font-bold text-primary-purple">
                {hoursDisplay} hrs ({studyMinutes} mins)
              </span>
            </div>
            <input
              type="number"
              min="0"
              max="1440"
              value={studyMinutes}
              onChange={(e) => setStudyMinutes(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-app-bg border border-border-light rounded-xl px-3.5 py-2.5 text-sm font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-purple/20 focus:border-primary-purple"
              placeholder="e.g. 90"
            />
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {[30, 60, 90, 120, 180].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setStudyMinutes(m)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                    studyMinutes === m
                      ? "bg-primary-purple text-white border-primary-purple"
                      : "bg-surface-white text-text-secondary border-border-light hover:border-primary-purple/40"
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {/* Problems Solved */}
          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Target size={13} className="text-accent-pink" />
                Problems Solved Today
              </label>
              <span className="text-xs font-bold text-text-primary">
                {problemsSolved} solved
              </span>
            </div>
            <input
              type="number"
              min="0"
              max="100"
              value={problemsSolved}
              onChange={(e) => setProblemsSolved(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-app-bg border border-border-light rounded-xl px-3.5 py-2.5 text-sm font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-purple/20 focus:border-primary-purple"
              placeholder="e.g. 3"
            />
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {[0, 1, 2, 3, 5, 8].map((count) => (
                <button
                  type="button"
                  key={count}
                  onClick={() => setProblemsSolved(count)}
                  className={`text-[11px] font-bold px-3 py-1 rounded-lg border transition-colors ${
                    problemsSolved === count
                      ? "bg-primary-purple text-white border-primary-purple"
                      : "bg-surface-white text-text-secondary border-border-light hover:border-primary-purple/40"
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Track Completion Checkpoints */}
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2">
              Completed Today
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border-light hover:bg-app-bg cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={dsaCompleted}
                  onChange={(e) => setDsaCompleted(e.target.checked)}
                  className="rounded text-primary-purple focus:ring-primary-purple/20 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-text-primary">DSA Practice</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border-light hover:bg-app-bg cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={leetcodeCompleted}
                  onChange={(e) => setLeetcodeCompleted(e.target.checked)}
                  className="rounded text-primary-purple focus:ring-primary-purple/20 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-text-primary">LeetCode</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border-light hover:bg-app-bg cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={fullstackCompleted}
                  onChange={(e) => setFullstackCompleted(e.target.checked)}
                  className="rounded text-primary-purple focus:ring-primary-purple/20 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-text-primary">Full Stack</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border-light hover:bg-app-bg cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={projectCompleted}
                  onChange={(e) => setProjectCompleted(e.target.checked)}
                  className="rounded text-primary-purple focus:ring-primary-purple/20 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-text-primary">Project Work</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
              Daily Notes & Reflection
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What went well? Any concepts to review?"
              className="w-full bg-app-bg border border-border-light rounded-xl p-3 text-xs font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-purple/20 focus:border-primary-purple resize-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary-purple hover:bg-deep-purple text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  {existingCheckin ? "Update Check-in" : "Record Check-in"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default DailyCheckinModal
