import React, { useState } from 'react'
import { Sparkles, Mail, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react'

export default function Login({ onLogin }) {
  const [emailOrUser, setEmailOrUser] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!emailOrUser.trim()) {
      setError('Please enter your email or student username.')
      return
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.')
      return
    }

    setIsLoading(true)
    
    // Simulate premium dashboard entry loading transition
    setTimeout(() => {
      setIsLoading(false)
      const rawName = emailOrUser.includes('@') ? emailOrUser.split('@')[0] : emailOrUser
      const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1)
      onLogin(formattedName)
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Decorative ambient glowing orbs in the background */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-300/30 dark:bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-300/25 dark:bg-violet-600/15 rounded-full blur-3xl animate-pulse delay-700" />

      {/* Glassmorphic Login Container */}
      <div className="w-full max-w-md glass rounded-3xl p-8 shadow-xl relative z-10 transition-all duration-300">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-600/25 mb-3 flex items-center justify-center">
            <GraduationCap className="h-8 w-8 animate-bounce" />
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
            StudyDash
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
            Log in to access your customized productivity portal
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 rounded-2xl text-xs font-semibold text-center animate-shake">
            ⚠️ {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 block">
              Email or Student Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                placeholder="e.g. aanya_sharma"
                value={emailOrUser}
                onChange={(e) => setEmailOrUser(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 block">
              Workspace Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500 accent-indigo-600" />
              <span>Remember Workspace</span>
            </label>
            <span className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">Forgot?</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white py-3.5 px-5 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-600/20 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                <span>Enter StudyDash</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-400 dark:text-slate-500 text-[10px] font-bold tracking-wider uppercase">
          By logging in you agree to our terms
        </div>
      </div>
    </div>
  )
}
