import React, { useState } from "react"
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Flame,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  User,
  Zap,
} from "lucide-react"
import { useAuth } from "../context/AuthContext"

type AuthMode = "signin" | "signup" | "forgot"

export default function AuthView() {
  const { signIn, signUp, resetPassword, isConfigured } = useAuth()

  const [mode, setMode] = useState<AuthMode>("signin")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false)

  const clearMessages = () => {
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const switchMode = (newMode: AuthMode) => {
    clearMessages()
    setNeedsEmailConfirmation(false)
    setMode(newMode)
  }

  const validateInputs = (): boolean => {
    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      setErrorMessage("Please enter a valid email address.")
      return false
    }

    if (mode === "forgot") return true

    if (!password) {
      setErrorMessage("Password is required.")
      return false
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.")
      return false
    }

    if (mode === "signup") {
      if (!fullName.trim()) {
        setErrorMessage("Please enter your full name.")
        return false
      }
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match.")
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()

    if (!isConfigured) {
      setErrorMessage(
        "Supabase credentials are not configured in .env.local. Please add your VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
      )
      return
    }

    if (!validateInputs()) return

    setLoading(true)

    try {
      if (mode === "signin") {
        const { error } = await signIn(email.trim(), password)
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            setErrorMessage("Invalid email or password. Please try again.")
          } else {
            setErrorMessage(error.message)
          }
        }
      } else if (mode === "signup") {
        const result = await signUp(email.trim(), password, fullName.trim())
        if (result.error) {
          if (result.error.message.includes("User already registered")) {
            setErrorMessage(
              "An account with this email already exists. Please sign in instead.",
            )
          } else {
            setErrorMessage(result.error.message)
          }
        } else if (result.needsEmailConfirmation) {
          setNeedsEmailConfirmation(true)
        }
      } else if (mode === "forgot") {
        const { error } = await resetPassword(email.trim())
        if (error) {
          setErrorMessage(error.message)
        } else {
          setSuccessMessage(
            `Password reset link has been sent to ${email}. Check your inbox!`,
          )
        }
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-app-bg flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary-purple shadow-lg shadow-primary-purple/30 flex items-center justify-center text-white mb-3">
            <Flame size={28} className="animate-pulse" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase">
            50 DAY SPRINT
          </h1>
          <p className="text-xs font-bold text-text-secondary mt-1 tracking-wider uppercase">
            Placement Readiness Tracker
          </p>
        </div>

        {/* Configuration Notice if Supabase is not configured */}
        {!isConfigured && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="shrink-0 text-amber-600 mt-0.5" />
              <div className="text-xs">
                <p className="font-extrabold text-amber-900 uppercase tracking-wider mb-1">
                  Supabase Setup Required
                </p>
                <p className="font-medium text-amber-800 leading-relaxed">
                  Supabase credentials are missing or still using placeholder values.
                  Please configure your project keys in <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono">.env.local</code>:
                </p>
                <div className="mt-2 font-mono text-[11px] bg-white/70 p-2 rounded-lg border border-amber-500/20 text-text-primary">
                  VITE_SUPABASE_URL=https://your-ref.supabase.co<br />
                  VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Auth Card */}
        <div className="bg-surface-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-border-light">
          {needsEmailConfirmation ? (
            /* Email Confirmation Required State */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-primary-purple/10 text-primary-purple flex items-center justify-center mx-auto mb-4">
                <Mail size={32} />
              </div>
              <h2 className="text-xl font-extrabold text-text-primary tracking-tight mb-2">
                Check your email
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed mb-6 font-medium">
                We have sent a verification link to{" "}
                <span className="font-bold text-text-primary">{email}</span>. Please click the link to confirm your account, then sign in below.
              </p>
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="w-full bg-primary-purple hover:bg-deep-purple text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                BACK TO SIGN IN
              </button>
            </div>
          ) : (
            <>
              {/* Card Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
                    {mode === "signin" && "Welcome Back"}
                    {mode === "signup" && "Create an Account"}
                    {mode === "forgot" && "Reset Password"}
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-primary-purple/10 text-primary-purple border border-primary-purple/20">
                    Day 1 / 50
                  </span>
                </div>
                <p className="text-xs font-medium text-text-secondary mt-1">
                  {mode === "signin" && "Sign in with your email to continue your sprint."}
                  {mode === "signup" && "Join your sprint team and start preparing today."}
                  {mode === "forgot" && "Enter your email to receive a password reset link."}
                </p>
              </div>

              {/* Mode Toggle Tabs (Sign In / Sign Up) */}
              {mode !== "forgot" && (
                <div className="flex p-1 bg-app-bg rounded-xl mb-6 border border-border-light/60">
                  <button
                    type="button"
                    onClick={() => switchMode("signin")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      mode === "signin"
                        ? "bg-surface-white text-primary-purple shadow-sm border border-border-light/50"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    SIGN IN
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      mode === "signup"
                        ? "bg-surface-white text-primary-purple shadow-sm border border-border-light/50"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    SIGN UP
                  </button>
                </div>
              )}

              {/* Alerts */}
              {errorMessage && (
                <div className="mb-5 p-3 rounded-xl bg-accent-pink/10 border border-accent-pink/30 flex items-start gap-2.5 text-accent-pink text-xs font-semibold">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-5 p-3 rounded-xl bg-green-500/10 border border-green-500/30 flex items-start gap-2.5 text-green-600 text-xs font-semibold">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {mode === "signup" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. Siva"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={loading}
                        className="bg-app-bg border border-border-light text-text-primary text-sm font-medium py-2.5 pl-10 pr-4 rounded-xl focus:outline-none focus:border-primary-purple/50 focus:ring-2 focus:ring-primary-purple/10 transition-all w-full"
                      />
                      <User
                        size={16}
                        className="absolute left-3.5 top-3 text-text-secondary pointer-events-none"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="student@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="bg-app-bg border border-border-light text-text-primary text-sm font-medium py-2.5 pl-10 pr-4 rounded-xl focus:outline-none focus:border-primary-purple/50 focus:ring-2 focus:ring-primary-purple/10 transition-all w-full"
                    />
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-3 text-text-secondary pointer-events-none"
                    />
                  </div>
                </div>

                {mode !== "forgot" && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                        Password
                      </label>
                      {mode === "signin" && (
                        <button
                          type="button"
                          onClick={() => switchMode("forgot")}
                          className="text-[11px] font-bold text-primary-purple hover:underline"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="bg-app-bg border border-border-light text-text-primary text-sm font-medium py-2.5 pl-10 pr-10 rounded-xl focus:outline-none focus:border-primary-purple/50 focus:ring-2 focus:ring-primary-purple/10 transition-all w-full"
                      />
                      <Lock
                        size={16}
                        className="absolute left-3.5 top-3 text-text-secondary pointer-events-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-text-secondary hover:text-text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === "signup" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        className="bg-app-bg border border-border-light text-text-primary text-sm font-medium py-2.5 pl-10 pr-4 rounded-xl focus:outline-none focus:border-primary-purple/50 focus:ring-2 focus:ring-primary-purple/10 transition-all w-full"
                      />
                      <KeyRound
                        size={16}
                        className="absolute left-3.5 top-3 text-text-secondary pointer-events-none"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !isConfigured}
                  className={`mt-2 w-full text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                    loading || !isConfigured
                      ? "bg-primary-purple/60 cursor-not-allowed"
                      : "bg-primary-purple hover:bg-deep-purple active:scale-[0.99]"
                  }`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {mode === "signin" && "SIGN IN"}
                        {mode === "signup" && "CREATE ACCOUNT"}
                        {mode === "forgot" && "SEND RESET LINK"}
                      </span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {mode === "forgot" && (
                  <button
                    type="button"
                    onClick={() => switchMode("signin")}
                    className="text-xs font-bold text-text-secondary hover:text-text-primary transition-colors mt-2 text-center"
                  >
                    Back to Sign In
                  </button>
                )}
              </form>
            </>
          )}
        </div>

        {/* Feature Highlights Footer */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[11px] font-bold text-text-secondary">
          <div className="flex items-center gap-1.5">
            <Zap size={14} className="text-primary-purple" />
            <span>50-Day Curriculum</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-green-500" />
            <span>Peer Accountability</span>
          </div>
        </div>
      </div>
    </div>
  )
}
