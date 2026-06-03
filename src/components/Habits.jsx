import React, { useState, useEffect } from 'react'
import { Check, Plus, Trash2, Flame, Award, ShieldAlert, Sparkles, RefreshCw, Calendar } from 'lucide-react'

// Default starter habits
const defaultHabitsList = [
  { id: 1, text: 'Drink 3L Water 💧', completed: false },
  { id: 2, text: 'Solve 1 LeetCode/Algorithmic Problem 💻', completed: false },
  { id: 3, text: 'Read 10 Pages of a Book 📚', completed: false },
  { id: 4, text: '10 Min Meditation or Breathing Exercise 🧘', completed: false },
  { id: 5, text: 'Stretch / Exercise for 20 mins 🏃', completed: false }
]

export default function Habits({ awardXp, setFocusScore }) {
  // Sync habits list
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('studydash_habits')
    return saved ? JSON.parse(saved) : defaultHabitsList
  })

  // Sync streaks & date
  const [streakData, setStreakData] = useState(() => {
    const saved = localStorage.getItem('studydash_streak_data')
    return saved ? JSON.parse(saved) : { currentStreak: 0, maxStreak: 0, lastCheckDate: '' }
  })

  const [newHabitText, setNewHabitText] = useState('')
  const [showCelebration, setShowCelebration] = useState(false)

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('studydash_habits', JSON.stringify(habits))
  }, [habits])

  useEffect(() => {
    localStorage.setItem('studydash_streak_data', JSON.stringify(streakData))
  }, [streakData])

  const handleToggleHabit = (id) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const nextState = !h.completed
        if (nextState) {
          awardXp(15) // +15 XP for a habit checked!
          setFocusScore(prevScore => Math.min(100, prevScore + 1))
          
          // Check if this makes all habits completed today
          const otherHabitsDone = habits.filter(item => item.id !== id).every(item => item.completed)
          if (otherHabitsDone) {
            handleAllCompletedToday()
          }
        }
        return { ...h, completed: nextState }
      }
      return h
    }))
  }

  const handleAllCompletedToday = () => {
    const today = new Date().toDateString()
    
    // If already checked today, just celebrate
    if (streakData.lastCheckDate === today) {
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 2500)
      return
    }

    // Determine streak increment
    let nextStreak = streakData.currentStreak + 1
    
    // Check if streak was broken (last check date is not yesterday)
    if (streakData.lastCheckDate) {
      const last = new Date(streakData.lastCheckDate)
      const now = new Date()
      // Difference in days
      const diffTime = Math.abs(now - last)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays > 1) {
        nextStreak = 1 // Streak broken, restart
      }
    }

    setStreakData(prev => ({
      currentStreak: nextStreak,
      maxStreak: Math.max(prev.maxStreak, nextStreak),
      lastCheckDate: today
    }))

    awardXp(50) // Bonus XP for full deck cleared!
    setShowCelebration(true)
    setTimeout(() => setShowCelebration(false), 3000)
  }

  const handleAddHabit = () => {
    if (!newHabitText.trim()) return
    const newHabit = {
      id: Date.now(),
      text: newHabitText.trim(),
      completed: false
    }
    setHabits([...habits, newHabit])
    setNewHabitText('')
  }

  const handleDeleteHabit = (id) => {
    setHabits(prev => prev.filter(h => h.id !== id))
  }

  // Simulator to skip to next day for testing
  const handleSimulateNextDay = () => {
    // Clear checks but keep habits
    setHabits(prev => prev.map(h => ({ ...h, completed: false })))
    
    // Alter last checked date to be "yesterday" in state, simulating date rollover
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    setStreakData(prev => ({
      ...prev,
      lastCheckDate: yesterday.toDateString()
    }))

    alert("📅 Simulated Rollover: It is now 'tomorrow'! Completing all habits today will continue your streak! 🔥")
  }

  const completedCount = habits.filter(h => h.completed).length
  const progressPercent = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0

  return (
    <div className="glass rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-indigo-500 bg-clip-text text-transparent">
            Daily Habits & Streaks
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Complete daily activities to lock in streaks and earn massive level XP!
          </p>
        </div>

        {/* Streaks Widget */}
        <div className="flex items-center space-x-4 bg-slate-900/60 border border-slate-800 p-3 rounded-2xl">
          <div className="flex items-center space-x-2">
            <Flame className={`h-6 w-6 ${streakData.currentStreak > 0 ? 'text-orange-500 animate-bounce' : 'text-slate-600'}`} />
            <div>
              <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest leading-none">Streak</p>
              <p className="text-lg font-black text-slate-100 leading-none mt-1">{streakData.currentStreak} Days</p>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="flex items-center space-x-2">
            <Award className="h-6 w-6 text-amber-500" />
            <div>
              <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest leading-none">Best Streak</p>
              <p className="text-lg font-black text-slate-100 leading-none mt-1">{streakData.maxStreak} Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* List of Habits */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Your Habits Checklist</h3>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-900/50 px-2.5 py-0.5 rounded-full">
              +{completedCount * 15} XP Earned
            </span>
          </div>

          {/* Add Habit Input */}
          <div className="flex gap-2.5">
            <input
              type="text"
              placeholder="Add a new daily habit (e.g. Code 30m, Stretch)..."
              value={newHabitText}
              onChange={(e) => setNewHabitText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-800 bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-slate-100"
            />
            <button
              onClick={handleAddHabit}
              className="bg-indigo-650 hover:bg-indigo-600 text-white p-3 rounded-2xl font-bold active:scale-95 transition-all shadow-md shadow-indigo-650/10 flex items-center justify-center"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* Habits Feed */}
          <div className="space-y-3">
            {habits.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-3xl text-slate-500">
                <p className="font-semibold text-sm">Your habit sheet is empty.</p>
                <p className="text-xs mt-1">Add custom habits above to begin your streaks!</p>
              </div>
            ) : (
              habits.map(h => (
                <div
                  key={h.id}
                  onClick={() => handleToggleHabit(h.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 cursor-pointer group ${
                    h.completed
                      ? 'bg-emerald-950/10 border-emerald-900/30 opacity-70'
                      : 'bg-slate-900/40 border-slate-850 hover:border-slate-700 hover:scale-[1.01]'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                    <div className={`h-6 w-6 rounded-lg flex items-center justify-center border transition-all ${
                      h.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-700 group-hover:border-indigo-500'
                    }`}>
                      {h.completed && <Check className="h-4.5 w-4.5" />}
                    </div>
                    <span className={`text-sm font-semibold truncate ${h.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                      {h.text}
                    </span>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteHabit(h.id); }}
                    className="text-slate-500 hover:text-rose-500 p-1.5 rounded-xl hover:bg-rose-950/20 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Progress & Simulation Box */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl flex flex-col justify-between space-y-6">
            
            {/* Progress Area */}
            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Daily Consistency</h4>
              
              <div className="relative flex flex-col items-center justify-center py-4">
                
                {/* SVG Progress Arc */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                    <circle 
                      cx="50" cy="50" r="44" 
                      fill="none" 
                      stroke="url(#habitGrad)" 
                      strokeWidth="8" 
                      strokeDasharray={276}
                      strokeDashoffset={276 - (progressPercent / 100) * 276}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />
                    <defs>
                      <linearGradient id="habitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="flex flex-col items-center justify-center z-10">
                    <span className="text-2xl font-black text-slate-100">{progressPercent}%</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">cleared</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar Subtitle */}
              <div className="text-center mt-2 text-xs font-semibold text-slate-400">
                {progressPercent === 100 ? (
                  <span className="text-emerald-400 flex items-center justify-center gap-1">
                    <Sparkles className="h-4.5 w-4.5 animate-pulse" /> All habits locked in! +50 XP Streak Bonus!
                  </span>
                ) : (
                  <span>Check off {habits.length - completedCount} more to increment streak</span>
                )}
              </div>
            </div>

            {/* Streak Rule Info */}
            <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-[11px] text-amber-500/90 font-medium flex gap-2">
              <ShieldAlert className="h-5 w-5 flex-shrink-0 text-amber-500" />
              <span>Complete all daily habits before sleeping to advance your streak. Skipping a day resets it!</span>
            </div>

            {/* Simulator for testing */}
            <div className="border-t border-slate-800/80 pt-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">Prototype Tester Control</p>
              <button
                onClick={handleSimulateNextDay}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-white/5 text-slate-350 hover:text-white py-2.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
              >
                <Calendar className="h-4.5 w-4.5 text-indigo-400" />
                <span>Simulate Tomorrow</span>
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Level-Up/Streaks Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center bg-indigo-950/15 backdrop-blur-[2px] transition-all duration-300">
          <div className="bg-slate-900 border border-indigo-500/30 p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center animate-bounce scale-110">
            <div className="h-16 w-16 bg-gradient-to-tr from-amber-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-3xl shadow-lg shadow-indigo-500/35">
              🔥
            </div>
            <h4 className="text-xl font-black text-slate-100 mt-4 bg-gradient-to-r from-amber-400 to-indigo-400 bg-clip-text text-transparent">Streak Continued!</h4>
            <p className="text-xs font-bold text-slate-400 mt-1">Streaked to {streakData.currentStreak} Days! Earned +50 XP bonus! 🚀</p>
          </div>
        </div>
      )}
    </div>
  )
}
