import React, { useState, useEffect, useRef } from 'react'
import {
  CheckSquare, Plus, Trash2, Clock, Play, Pause, RotateCcw,
  BookOpen, CloudSun, Award, CheckCircle, Save,
  Flame, TrendingUp, Sparkles, Volume2, VolumeX, ListTodo, RefreshCw,
  PlusCircle, MinusCircle, Compass, X, Delete
} from 'lucide-react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function Dashboard({
  tasks,
  setTasks,
  notes,
  setNotes,
  studyHours,
  setStudyHours,
  focusScore,
  setFocusScore,
  activeTab
}) {
  const isDark = document.documentElement.classList.contains('dark')

  // Sound effects enabled
  const [soundEnabled, setSoundEnabled] = useState(true)

  // 1. Pomodoro Timer States (Flexible & Custom Durations!)
  const [customDurations, setCustomDurations] = useState(() => {
    const saved = localStorage.getItem('studydash_durations')
    return saved ? JSON.parse(saved) : { work: 25, short: 5, long: 15 }
  })

  // Rehydrate timer from localStorage on mount (survive page refresh)
  const [timerMode, setTimerMode] = useState(() => {
    try {
      const snap = JSON.parse(localStorage.getItem('studydash_timer_snap') || 'null')
      return snap?.timerMode || 'work'
    } catch { return 'work' }
  })

  const [timeLeft, setTimeLeft] = useState(() => {
    try {
      const snap = JSON.parse(localStorage.getItem('studydash_timer_snap') || 'null')
      if (!snap) return (JSON.parse(localStorage.getItem('studydash_durations') || 'null') || { work: 25 })[snap?.timerMode || 'work'] * 60
      if (snap.running && snap.startedAt) {
        const elapsed = Math.floor((Date.now() - snap.startedAt) / 1000)
        const remaining = snap.timeLeft - elapsed
        return remaining > 0 ? remaining : 0
      }
      return snap.timeLeft
    } catch {
      return 25 * 60
    }
  })

  const [timerRunning, setTimerRunning] = useState(() => {
    try {
      const snap = JSON.parse(localStorage.getItem('studydash_timer_snap') || 'null')
      if (!snap?.running || !snap?.startedAt) return false
      // If timer would have already finished during the page-away period, don't auto-start
      const elapsed = Math.floor((Date.now() - snap.startedAt) / 1000)
      return elapsed < snap.timeLeft
    } catch { return false }
  })

  const timerRef = useRef(null)
  // Tracks the wall-clock moment the timer was last started (not updated on every tick)
  const timerStartedAtRef = useRef(null)

  // Sync custom durations to localStorage
  useEffect(() => {
    localStorage.setItem('studydash_durations', JSON.stringify(customDurations))
  }, [customDurations])

  // Persist timer snapshot: when running state changes, lock in the startedAt timestamp
  useEffect(() => {
    if (timerRunning) {
      timerStartedAtRef.current = Date.now()
    }
    const snap = {
      timeLeft,
      timerMode,
      running: timerRunning,
      startedAt: timerRunning ? timerStartedAtRef.current : null,
    }
    localStorage.setItem('studydash_timer_snap', JSON.stringify(snap))
  }, [timerRunning, timerMode]) // Only re-lock startedAt on run/pause toggle

  // Keep timeLeft snapshot in sync on every tick (without changing startedAt)
  useEffect(() => {
    const raw = localStorage.getItem('studydash_timer_snap')
    if (!raw) return
    try {
      const snap = JSON.parse(raw)
      snap.timeLeft = timeLeft
      localStorage.setItem('studydash_timer_snap', JSON.stringify(snap))
    } catch { /* ignore */ }
  }, [timeLeft])

  // Update timer remaining time when selected mode's custom duration changes (and timer is not running)
  useEffect(() => {
    if (!timerRunning) {
      setTimeLeft(customDurations[timerMode] * 60)
    }
  }, [customDurations, timerMode])

  // 2. Weather States
  const [cityInput, setCityInput] = useState('')
  const [isWeatherLoading, setIsWeatherLoading] = useState(false)
  const [weatherData, setWeatherData] = useState({
    city: 'Mumbai',
    temp: 30,
    desc: 'Humid Haze ⛅',
    type: 'cloudy' // 'sunny', 'cloudy', 'rainy', 'snowy'
  })

  // 3. Daily Goals States
  const [goals, setGoals] = useState([
    { id: 1, text: 'Complete Java Assignment', completed: false },
    { id: 2, text: 'Study 2 Hours', completed: false },
    { id: 3, text: 'Practice Web Development', completed: true },
    { id: 4, text: 'Read 10 Pages', completed: false }
  ])

  // 4. Task Manager States
  const [newTaskText, setNewTaskText] = useState('')
  const [taskCategory, setTaskCategory] = useState('Study')
  const [taskPriority, setTaskPriority] = useState('Medium')
  const [taskFilter, setTaskFilter] = useState('All')

  // 5. Notes Widget States
  const [noteColor, setNoteColor] = useState('yellow') // 'yellow', 'blue', 'pink', 'green', 'purple'
  const [saveStatus, setSaveStatus] = useState('')

  // Synth sound generator using Web Audio API
  const playTimerBeep = () => {
    if (!soundEnabled) return
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()

      osc.connect(gain)
      gain.connect(audioCtx.destination)

      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, audioCtx.currentTime) // A5 note
      gain.gain.setValueAtTime(0, audioCtx.currentTime)
      gain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5)

      osc.start(audioCtx.currentTime)
      osc.stop(audioCtx.currentTime + 0.5)
    } catch (e) {
      console.warn('Audio synthesis failed to initialize', e)
    }
  }

  // Handle Pomodoro Logic
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setTimerRunning(false)
            playTimerBeep()

            if (timerMode === 'work') {
              setStudyHours((h) => parseFloat((h + 0.4).toFixed(1)))
              setFocusScore((s) => Math.min(100, s + 3))
              alert('🎉 Focus session completed! Great job. Time for a break!')
            } else {
              alert('⏰ Break finished! Ready to focus?')
            }

            resetTimer(timerMode, false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timerRunning, timerMode, customDurations])

  const startPauseTimer = () => {
    setTimerRunning(!timerRunning)
  }

  const resetTimer = (mode = timerMode, stop = true) => {
    if (stop) setTimerRunning(false)
    const minutes = customDurations[mode] || 25
    const freshTime = minutes * 60
    setTimeLeft(freshTime)
    // Clear running snapshot so refresh restores a clean stopped state
    localStorage.setItem('studydash_timer_snap', JSON.stringify({
      timeLeft: freshTime,
      timerMode: mode,
      running: false,
      startedAt: null,
    }))
  }

  const changeTimerMode = (mode) => {
    setTimerMode(mode)
    resetTimer(mode, true)
  }

  // Dynamic hh:mm:ss formatter
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    const mm = mins.toString().padStart(2, '0')
    const ss = secs.toString().padStart(2, '0')
    
    if (hrs > 0) {
      const hh = hrs.toString().padStart(2, '0')
      return `${hh}:${mm}:${ss}`
    }
    return `${mm}:${ss}`
  }

  // Flexible Increment/Decrement handlers
  const adjustTimeLeftOnFly = (amountSeconds) => {
    setTimeLeft((prev) => Math.max(10, prev + amountSeconds))
  }

  const adjustCustomDurationSetting = (mode, amountMinutes) => {
    setCustomDurations((prev) => {
      const nextMin = Math.max(1, prev[mode] + amountMinutes)
      return {
        ...prev,
        [mode]: nextMin
      }
    })
  }

  // Analog Clock Dialer Ticks Configuration
  const analogTicks = [
    { min: 5, angle: 30 },
    { min: 10, angle: 60 },
    { min: 15, angle: 90 },
    { min: 20, angle: 120 },
    { min: 25, angle: 150 },
    { min: 30, angle: 180 },
    { min: 35, angle: 210 },
    { min: 40, angle: 240 },
    { min: 45, angle: 270 },
    { min: 50, angle: 300 },
    { min: 55, angle: 330 },
    { min: 60, angle: 360 }
  ]

  const handleSetAnalogMinutes = (mins) => {
    setTimeLeft((prev) => {
      const currentHrs = Math.floor(prev / 3600)
      const nextTotal = (currentHrs * 3600) + (mins * 60)
      
      const totalMinutes = Math.round(nextTotal / 60)
      setCustomDurations((prevDurations) => ({
        ...prevDurations,
        [timerMode]: Math.max(1, totalMinutes)
      }))
      
      return nextTotal
    })
  }

  // Adjust minutes with carrying over to hours or borrowing cleanly
  const adjustMinutes = (deltaMins) => {
    setTimeLeft((prev) => {
      const currentHrs = Math.floor(prev / 3600)
      const currentMins = Math.round((prev % 3600) / 60)
      let nextMins = currentMins + deltaMins
      let nextHrs = currentHrs
      
      if (nextMins >= 60) {
        nextHrs += Math.floor(nextMins / 60)
        nextMins = nextMins % 60
      } else if (nextMins < 0) {
        const borrowHrs = Math.ceil(Math.abs(nextMins) / 60)
        nextHrs = Math.max(0, nextHrs - borrowHrs)
        nextMins = (60 + (nextMins % 60)) % 60
      }
      
      const nextTotal = (nextHrs * 3600) + (nextMins * 60)
      
      // Keep custom durations in sync
      const totalMinutes = Math.round(nextTotal / 60)
      setCustomDurations((prevDurations) => ({
        ...prevDurations,
        [timerMode]: Math.max(1, totalMinutes)
      }))
      
      return Math.max(60, nextTotal) // minimum 1 minute
    })
  }

  const adjustHours = (delta) => {
    setTimeLeft((prev) => {
      const currentHrs = Math.floor(prev / 3600)
      const currentMins = Math.round((prev % 3600) / 60)
      const nextHrs = Math.max(0, currentHrs + delta)
      const nextTotal = (nextHrs * 3600) + (currentMins * 60)
      
      // Keep custom durations in sync
      const totalMinutes = Math.round(nextTotal / 60)
      setCustomDurations((prevDurations) => ({
        ...prevDurations,
        [timerMode]: Math.max(1, totalMinutes)
      }))
      
      return Math.max(60, nextTotal) // minimum 1 minute
    })
  }

  // REAL-TIME DYNAMIC WEATHER INTEGRATION
  const mapWeatherCodeToType = (code, desc) => {
    const d = desc.toLowerCase()
    if (d.includes('snow') || d.includes('ice') || d.includes('sleet') || d.includes('blizzard') || d.includes('frost')) return 'snowy'
    if (d.includes('rain') || d.includes('drizzle') || d.includes('shower') || d.includes('thunder') || d.includes('storm')) return 'rainy'
    if (d.includes('cloud') || d.includes('overcast') || d.includes('mist') || d.includes('fog') || d.includes('haze') || d.includes('smoke')) return 'cloudy'
    return 'sunny'
  }

  const fetchRealWeather = async (cityName) => {
    const queryCity = cityName.trim()
    if (!queryCity) return
    setIsWeatherLoading(true)
    
    try {
      const res = await fetch(`https://wttr.in/${encodeURIComponent(queryCity)}?format=j1`)
      if (!res.ok) throw new Error('wttr API request failed')
      const data = await res.json()
      
      const condition = data.current_condition[0]
      const area = data.nearest_area[0]
      
      const temp = parseInt(condition.temp_C)
      const rawDesc = condition.weatherDesc[0].value
      const code = condition.weatherCode
      const actualCity = area.areaName[0].value
      
      const weatherType = mapWeatherCodeToType(code, rawDesc)
      const emojis = {
        sunny: '☀️',
        cloudy: '☁️',
        rainy: '🌧️',
        snowy: '❄️'
      }
      
      setWeatherData({
        city: actualCity,
        temp: temp,
        desc: `${rawDesc} ${emojis[weatherType] || '☀️'}`,
        type: weatherType
      })
    } catch (e) {
      console.warn('Real weather API failed, using fallback offline mockup geocode', e)
      
      const cleanQuery = queryCity.toLowerCase().replace(/\s+/g, '')
      const mockWeatherCities = {
        mumbai: { temp: 32, desc: 'Thunderstorm ⛈️', type: 'rainy' },
        delhi: { temp: 41, desc: 'Scorching Sunny ☀️', type: 'sunny' },
        london: { temp: 14, desc: 'Drizzly Clouds 🌧️', type: 'rainy' },
        tokyo: { temp: 22, desc: 'Sakura Breeze 🌸', type: 'sunny' },
        newyork: { temp: 18, desc: 'Overcast Skies ☁️', type: 'cloudy' },
        sydney: { temp: 26, desc: 'Warm Sunny ☀️', type: 'sunny' },
        paris: { temp: 16, desc: 'Light Showers 🌦️', type: 'rainy' },
        moscow: { temp: -2, desc: 'Powder Snow ❄️', type: 'snowy' }
      }
      
      if (mockWeatherCities[cleanQuery]) {
        setWeatherData({
          city: queryCity.charAt(0).toUpperCase() + queryCity.slice(1),
          ...mockWeatherCities[cleanQuery]
        })
      } else {
        const hash = cleanQuery.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const temps = [12, 28, 5, 20, 35, 15]
        const types = ['cloudy', 'sunny', 'snowy', 'cloudy', 'sunny', 'rainy']
        const descList = ['Misty Clouds ☁️', 'Golden Sun ☀️', 'Fresh Snowfall ❄️', 'Light Drizzle 🌧️', 'Warm Breeze ☀️', 'Heavy Storm ⛈️']
        
        const idx = hash % temps.length
        setWeatherData({
          city: queryCity.charAt(0).toUpperCase() + queryCity.slice(1),
          temp: temps[idx],
          desc: descList[idx],
          type: types[idx]
        })
      }
    } finally {
      setIsWeatherLoading(false)
    }
  }

  useEffect(() => {
    fetchRealWeather('Mumbai')
  }, [])

  const handleGetWeather = () => {
    if (!cityInput.trim()) return
    fetchRealWeather(cityInput)
    setCityInput('')
  }

  // Goal logic
  const handleToggleGoal = (id) => {
    setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g))
  }

  const completedGoalsCount = goals.filter(g => g.completed).length
  const goalsProgressPercent = Math.round((completedGoalsCount / goals.length) * 100)

  // Notes Logic
  const handleSaveNotes = () => {
    setSaveStatus('Saving...')
    setTimeout(() => {
      setSaveStatus('Notes Auto-Saved! ✨')
      setTimeout(() => setSaveStatus(''), 2000)
    }, 600)
  }

  // Task manager actions
  const handleAddTask = () => {
    if (!newTaskText.trim()) return
    const newTask = {
      id: Date.now(),
      text: newTaskText,
      completed: false,
      category: taskCategory,
      priority: taskPriority
    }
    setTasks([newTask, ...tasks])
    setNewTaskText('')
    setFocusScore(prev => Math.min(100, prev + 1))
  }

  const handleToggleTask = (id) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const nextState = !t.completed
        if (nextState) {
          setFocusScore(prev => Math.min(100, prev + 2))
        }
        return { ...t, completed: nextState }
      }
      return t
    }))
  }

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'Active') return !t.completed
    if (taskFilter === 'Completed') return t.completed
    return true
  })

  // Chart configs
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Focus Study Hours',
        data: [2.5, 3.8, 1.5, studyHours, studyHours + 1.2, 4.0, studyHours > 3.5 ? studyHours : 3.5],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#fff',
        pointHoverRadius: 8,
        pointRadius: 5
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#94a3b8' : '#475569',
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.2)'
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#475569'
        }
      },
      y: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#475569'
        }
      }
    }
  }

  // Background gradients for Weather card
  const weatherCardGradients = {
    sunny: 'from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/25',
    cloudy: 'from-cyan-500 to-slate-500 text-white shadow-lg shadow-slate-500/20',
    rainy: 'from-indigo-650 to-slate-800 text-white shadow-lg shadow-indigo-600/20',
    snowy: 'from-blue-200 to-teal-150 text-slate-800'
  }

  // Sticky note configs
  const noteStyles = {
    yellow: 'bg-amber-100 border-amber-300 dark:bg-amber-950/20 dark:border-amber-800 text-amber-900 dark:text-amber-250',
    blue: 'bg-blue-100 border-blue-300 dark:bg-blue-950/20 dark:border-blue-800 text-blue-900 dark:text-blue-250',
    pink: 'bg-pink-100 border-pink-300 dark:bg-pink-950/20 dark:border-pink-800 text-pink-900 dark:text-pink-250',
    green: 'bg-emerald-100 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800 text-emerald-900 dark:text-emerald-250',
    purple: 'bg-purple-100 border-purple-300 dark:bg-purple-950/20 dark:border-purple-800 text-purple-900 dark:text-purple-250'
  }

  const totalCompletedTasks = tasks.filter(t => t.completed).length

  return (
    <div className="space-y-6">
      {/* -------------------- VIEW 1: MAIN DASHBOARD GRID -------------------- */}
      {activeTab === 'dashboard' && (
        <>
          {/* Dashboard Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass rounded-3xl p-6 flex items-center justify-between shadow-lg shadow-slate-100 dark:shadow-none hover:scale-[1.02] transition-all duration-300">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-455 uppercase tracking-wider">
                  Tasks Completed
                </span>
                <h3 className="text-3xl font-extrabold mt-1 text-indigo-600 dark:text-indigo-400">
                  {totalCompletedTasks}
                </h3>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-950/50 p-4 rounded-2xl text-indigo-600 dark:text-indigo-400">
                <CheckSquare className="h-7 w-7" />
              </div>
            </div>

            <div className="glass rounded-3xl p-6 flex items-center justify-between shadow-lg shadow-slate-100 dark:shadow-none hover:scale-[1.02] transition-all duration-300">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-455 uppercase tracking-wider">
                  Study Hours
                </span>
                <h3 className="text-3xl font-extrabold mt-1 text-violet-600 dark:text-violet-400">
                  {studyHours} hrs
                </h3>
              </div>
              <div className="bg-violet-50 dark:bg-violet-950/50 p-4 rounded-2xl text-violet-600 dark:text-violet-400">
                <BookOpen className="h-7 w-7" />
              </div>
            </div>

            <div className="glass rounded-3xl p-6 flex items-center justify-between shadow-lg shadow-slate-100 dark:shadow-none hover:scale-[1.02] transition-all duration-300">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-455 uppercase tracking-wider">
                  Focus Score
                </span>
                <h3 className="text-3xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Flame className="h-6 w-6 animate-pulse text-amber-500" />
                  {focusScore}%
                </h3>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/50 p-4 rounded-2xl text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-7 w-7" />
              </div>
            </div>
          </div>

          {/* Interactive Core Section Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: TIMER & WEATHER */}
            <div className="lg:col-span-1 space-y-6">
              {/* Pomodoro Timer Mini-Widget */}
              <div className="glass rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col items-center justify-center text-center">
                
                {/* Clean Horizontal Header Layout with Perfectly Aligned Icon Trays */}
                <div className="w-full flex items-center justify-between mb-6 pb-2 border-b border-white/5">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="h-4.5 w-4.5 text-indigo-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Focus Mode</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      title="Toggle Audio Feedback"
                      className="flex items-center justify-center p-1.5 rounded-lg border border-white/5 hover:bg-slate-800/50 text-slate-400 hover:text-slate-355 transition-all active:scale-90"
                    >
                      {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-rose-500" />}
                    </button>

                    <span className="text-xxs font-extrabold bg-indigo-950/80 text-indigo-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {timerMode}
                    </span>
                  </div>
                </div>

                {/* Premium Focus Timer Ring */}
                <div className="relative flex flex-col items-center justify-center w-full gap-5">

                  {/* Large SVG Ring */}
                  <div className={`relative w-56 h-56 flex items-center justify-center select-none transition-all duration-500 ${timerRunning ? 'drop-shadow-[0_0_32px_rgba(99,102,241,0.35)]' : ''}`}>

                    {/* Outer glow ring (decorative) */}
                    <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${timerRunning ? 'ring-4 ring-indigo-500/10 ring-offset-2 ring-offset-slate-950' : 'ring-2 ring-indigo-500/5'}`} />

                    {/* SVG Progress Ring */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 224 224">
                      <defs>
                        <linearGradient id="timerGradientMini" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#818cf8" />
                          <stop offset="50%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#a78bfa" />
                        </linearGradient>
                        <filter id="glowMini">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                        </filter>
                      </defs>
                      {/* Track */}
                      <circle cx="112" cy="112" r="100" fill="none" stroke="rgba(99,102,241,0.06)" strokeWidth="10" />
                      {/* Secondary decorative track */}
                      <circle cx="112" cy="112" r="88" fill="none" stroke="rgba(139,92,246,0.04)" strokeWidth="2" />
                      {/* Progress arc */}
                      <circle
                        cx="112" cy="112" r="100"
                        fill="none"
                        stroke="url(#timerGradientMini)"
                        strokeWidth="10"
                        strokeDasharray={628}
                        strokeDashoffset={628 - Math.min(1, Math.max(0, timeLeft / (customDurations[timerMode] * 60))) * 628}
                        strokeLinecap="round"
                        filter="url(#glowMini)"
                        className="transition-all duration-1000 ease-linear"
                      />
                    </svg>

                    {/* Inner dark circle background */}
                    <div className="absolute inset-4 rounded-full bg-slate-950/90 border border-indigo-500/10" />

                    {/* Center content */}
                    <div className="relative z-10 flex flex-col items-center justify-center gap-1">

                      {/* Time display */}
                      <span className="text-3xl font-black tracking-tight tabular-nums bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent leading-none">
                        {formatTime(timeLeft)}
                      </span>

                      {/* Hours adjuster */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); adjustHours(-1); }}
                          disabled={timerRunning}
                          className={`w-5 h-5 rounded-full bg-slate-800 border border-white/10 text-slate-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all flex items-center justify-center text-[10px] font-black leading-none ${timerRunning ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-90'}`}
                        >−</button>
                        <span className="text-[10px] font-extrabold text-indigo-400 tabular-nums min-w-[24px] text-center">
                          {Math.floor(timeLeft / 3600)}h
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); adjustHours(1); }}
                          disabled={timerRunning}
                          className={`w-5 h-5 rounded-full bg-slate-800 border border-white/10 text-slate-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all flex items-center justify-center text-[10px] font-black leading-none ${timerRunning ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-90'}`}
                        >+</button>
                      </div>

                      <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">
                        {timerRunning ? '● Focusing' : 'click ± to adjust'}
                      </span>
                    </div>
                  </div>

                  {/* Minutes quick-adjust row */}
                  <div className="flex items-center gap-2 w-full justify-center">
                    {[-5, -1].map(d => (
                      <button
                        key={d}
                        onClick={() => adjustMinutes(d)}
                        disabled={timerRunning}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/5 text-rose-400 hover:bg-rose-950/40 hover:border-rose-500/30 hover:text-rose-300 transition-all text-xs font-bold ${timerRunning ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
                      >
                        {d}m
                      </button>
                    ))}
                    <div className="h-5 w-px bg-white/10 mx-1" />
                    {[1, 5].map(d => (
                      <button
                        key={d}
                        onClick={() => adjustMinutes(d)}
                        disabled={timerRunning}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/5 text-emerald-400 hover:bg-emerald-950/40 hover:border-emerald-500/30 hover:text-emerald-300 transition-all text-xs font-bold ${timerRunning ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
                      >
                        +{d}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Controls */}
                <div className="flex items-center space-x-3 mt-4">
                  <button
                    onClick={startPauseTimer}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-2xl font-bold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/30 active:scale-95 flex items-center space-x-2 transition-all text-sm cursor-pointer"
                  >
                    {timerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                    <span>{timerRunning ? 'Pause' : 'Start'}</span>
                  </button>

                  <button
                    onClick={() => resetTimer(timerMode, true)}
                    className="bg-slate-800 hover:bg-slate-700 border border-white/5 text-slate-400 hover:text-white p-2.5 rounded-2xl active:scale-95 transition-all cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Weather Widget */}
              <div className="glass rounded-3xl p-6 shadow-xl">
                <h4 className="text-sm font-semibold text-slate-555 dark:text-slate-455 uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>Weather Widget</span>
                  <CloudSun className="h-5 w-5 text-indigo-500" />
                </h4>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search city (e.g. London)..."
                      value={cityInput}
                      onChange={(e) => setCityInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGetWeather()}
                      className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-255 dark:border-slate-850 bg-white dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-slate-800 dark:text-white"
                    />
                    <button
                      onClick={handleGetWeather}
                      className="bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-4 rounded-2xl text-xs font-bold active:scale-95 transition-all"
                    >
                      Get
                    </button>
                  </div>

                  <div className={`p-5 rounded-2xl bg-gradient-to-br ${weatherCardGradients[weatherData.type]} flex items-center justify-between overflow-hidden relative group transition-all duration-500`}>
                    {isWeatherLoading ? (
                      <div className="flex items-center justify-center space-x-2 w-full py-2">
                        <RefreshCw className="h-5 w-5 animate-spin text-white" />
                        <span className="text-xs font-semibold animate-pulse text-white/90">Syncing Live Atmosphere...</span>
                      </div>
                    ) : (
                      <>
                        <div className="relative z-10">
                          <h5 className="font-bold text-lg tracking-tight">{weatherData.city}</h5>
                          <p className="text-xs font-semibold opacity-95 mt-0.5">{weatherData.desc}</p>
                        </div>
                        <div className="text-right relative z-10">
                          <span className="text-3xl font-black">{weatherData.temp}°C</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* MIDDLE COLUMN: TASK MANAGER LIST */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass rounded-3xl p-6 shadow-xl flex flex-col h-full min-h-[400px]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                      Weekly Focus Tasks
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-455 font-medium">
                      Manage and track your immediate priorities
                    </p>
                  </div>
                  <span className="text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full">
                    {filteredTasks.length} total
                  </span>
                </div>

                <div className="flex flex-col md:flex-row gap-3 mb-6">
                  <input
                    type="text"
                    placeholder="E.g., Complete chemistry equations..."
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                    className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-slate-855 dark:text-white"
                  />
                  
                  <div className="flex gap-2">
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value)}
                      className="px-3 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-xs font-bold text-slate-600 dark:text-slate-350 focus:outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>

                    <button
                      onClick={handleAddTask}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-2xl text-xs font-bold active:scale-95 flex items-center space-x-1 transition-all shadow-md shadow-indigo-600/10"
                    >
                      <Plus className="h-4.5 w-4.5" />
                      <span>Add Task</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto max-h-[250px] pr-1">
                  {filteredTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-slate-505">
                      <ListTodo className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2 animate-bounce" />
                      <span className="text-sm font-semibold">No tasks listed</span>
                      <span className="text-xs">Add a new item to get started!</span>
                    </div>
                  ) : (
                    filteredTasks.map((t) => (
                      <div
                        key={t.id}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 group ${
                          t.completed
                            ? 'bg-slate-50/50 border-slate-150/50 dark:bg-slate-900/35 dark:border-slate-800/40 opacity-70'
                            : 'bg-white border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 shadow-sm shadow-slate-100/40 dark:shadow-none'
                        }`}
                      >
                        <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                          <button
                            onClick={() => handleToggleTask(t.id)}
                            className={`h-6 w-6 rounded-lg flex items-center justify-center border transition-all duration-300 ${
                              t.completed
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500'
                            }`}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          
                          <div className="truncate flex-1">
                            <p className={`text-sm font-semibold tracking-tight ${t.completed ? 'line-through text-slate-400 dark:text-slate-555' : 'text-slate-755 dark:text-slate-150'}`}>
                              {t.text}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xxs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-405">
                                {t.category}
                              </span>
                              <span className={`text-xxs font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                                t.priority === 'High' ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-455' :
                                t.priority === 'Medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-455' :
                                'bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-455'
                              }`}>
                                {t.priority}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteTask(t.id)}
                          className="text-slate-400 hover:text-rose-550 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

              </div>

            </div>

          </div>

          {/* LOWER GRID: ANALYTICS, GOALS & NOTES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Analytics Widget */}
            <div className="glass rounded-3xl p-6 shadow-xl lg:col-span-2">
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-4 flex items-center justify-between">
                <span>Weekly Study Progress</span>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full">
                  Interactive Live Graph
                </span>
              </h4>
              <div className="h-[250px] w-full">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Goals & Note Widget Stack */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Daily Goal Tracker */}
              <div className="glass rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center justify-between mb-3">
                    <span>Daily Goals</span>
                    <Award className="h-5.5 w-5.5 text-amber-500" />
                  </h4>

                  <div className="space-y-2.5">
                    {goals.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => handleToggleGoal(g.id)}
                        className={`flex items-center space-x-3 p-3 rounded-2xl cursor-pointer transition-all duration-300 border ${
                          g.completed 
                            ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/15 dark:border-emerald-900/30' 
                            : 'bg-white border-slate-200 dark:bg-slate-900/50 dark:border-slate-800/40 hover:scale-[1.01] hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={g.completed}
                          onChange={() => {}}
                          className="h-4.5 w-4.5 rounded text-indigo-655 focus:ring-indigo-500 accent-emerald-500 cursor-pointer"
                        />
                        <span className={`text-sm font-semibold ${g.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-355'}`}>
                          {g.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-555 dark:text-slate-400 mb-1.5">
                    <span>Target Accomplishment</span>
                    <span className="text-emerald-500">{goalsProgressPercent}%</span>
                  </div>
                  
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden shadow-inner border border-slate-200/50 dark:border-none">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${goalsProgressPercent}%` }}
                    />
                  </div>

                  {goalsProgressPercent === 100 && (
                    <div className="flex items-center space-x-1.5 mt-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 p-2 rounded-xl text-xs font-bold animate-pulse justify-center">
                      <Sparkles className="h-4 w-4" />
                      <span>All goals cleared! Outstanding! 🚀</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Note Pad Mini Widget */}
              <div className="glass rounded-3xl p-6 shadow-xl relative">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                    Quick Notes
                  </h4>
                  {saveStatus && (
                    <span className="text-xxs font-bold text-emerald-555 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full animate-bounce">
                      {saveStatus}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <textarea
                    placeholder="Scribble immediate thoughts, links, or equations..."
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value)
                      handleSaveNotes()
                    }}
                    className={`w-full min-h-[120px] rounded-2xl p-4 text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-semibold ${noteStyles[noteColor]}`}
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      {['yellow', 'blue', 'pink', 'green', 'purple'].map((c) => (
                        <button
                          key={c}
                          onClick={() => setNoteColor(c)}
                          className={`h-4.5 w-4.5 rounded-full border transition-all hover:scale-115 ${
                            c === 'yellow' ? 'bg-amber-200 border-amber-350' :
                            c === 'blue' ? 'bg-blue-200 border-blue-350' :
                            c === 'pink' ? 'bg-pink-200 border-pink-350' :
                            c === 'green' ? 'bg-emerald-250 border-emerald-355' :
                            'bg-purple-200 border-purple-355'
                          } ${noteColor === c ? 'ring-2 ring-indigo-500' : ''}`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleSaveNotes}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl font-bold text-xs active:scale-95 shadow-md shadow-indigo-600/10 flex items-center gap-1 transition-all"
                    >
                      <Save className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </>
      )}

      {/* -------------------- VIEW 2: FULL TASKS MANAGER VIEW -------------------- */}
      {activeTab === 'tasks' && (
        <div className="glass rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                Task Workspace
              </h2>
              <p className="text-sm text-slate-550 dark:text-slate-455 mt-0.5">
                Organize your course syllabus, revision blocks, and homework
              </p>
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              {['All', 'Active', 'Completed'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTaskFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    taskFilter === filter
                      ? 'bg-white dark:bg-indigo-600 shadow-sm text-indigo-600 dark:text-white'
                      : 'text-slate-555 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Add Custom Workspace */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/40 rounded-2xl">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-455 uppercase tracking-wider mb-1.5 block">Task Description</label>
              <input
                type="text"
                placeholder="What study task are we conquering today?..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-555 dark:text-slate-455 uppercase tracking-wider mb-1.5 block">Category</label>
              <select
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-600 dark:text-slate-350 focus:outline-none"
              >
                <option value="Study">📚 Study</option>
                <option value="Work">💻 Programming</option>
                <option value="Exam">📝 Exam Revision</option>
                <option value="Personal">🌿 Lifestyle</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <button
                onClick={handleAddTask}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-5 rounded-2xl text-xs font-bold active:scale-98 flex items-center justify-center space-x-1.5 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all"
              >
                <Plus className="h-5 w-5" />
                <span>Add Task Item</span>
              </button>
            </div>
          </div>

          {/* Large Task Feed */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                <ListTodo className="h-16 w-16 text-slate-300 dark:text-slate-750 mb-3 animate-pulse" />
                <h5 className="text-base font-bold text-slate-655 dark:text-slate-355">
                  No tasks matched your criteria
                </h5>
                <p className="text-xs text-slate-450 max-w-xs mt-1">
                  Adjust the filter tab or append a new checklist task to fill this workspace!
                </p>
              </div>
            ) : (
              filteredTasks.map((t) => (
                <div
                  key={t.id}
                  className={`flex flex-col md:flex-row md:items-center justify-between p-4.5 rounded-2xl border transition-all duration-300 group gap-3 ${
                    t.completed
                      ? 'bg-slate-50/50 border-slate-150/45 dark:bg-slate-900/35 dark:border-slate-800/40 opacity-70'
                      : 'bg-white border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 shadow-sm shadow-slate-100/40 dark:shadow-none hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleTask(t.id)}
                      className={`h-7 w-7 rounded-xl flex items-center justify-center border transition-all duration-300 flex-shrink-0 ${
                        t.completed
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 hover:scale-105'
                      }`}
                    >
                      {t.completed && <CheckCircle className="h-4.5 w-4.5" />}
                    </button>
                    
                    <div className="truncate flex-1">
                      <p className={`text-base font-bold tracking-tight ${t.completed ? 'line-through text-slate-450 dark:text-slate-555' : 'text-slate-750 dark:text-slate-150'}`}>
                        {t.text}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xxs font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-405 uppercase tracking-wide">
                          {t.category}
                        </span>
                        <span className={`text-xxs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${
                          t.priority === 'High' ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-450' :
                          t.priority === 'Medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-455' :
                          'bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-455'
                        }`}>
                          Priority: {t.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800/80">
                    <span className="text-xxs font-semibold text-slate-450 block md:hidden">
                      Click to toggle status
                    </span>
                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      className="text-slate-455 hover:text-rose-500 p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all flex items-center space-x-1"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                      <span className="text-xs font-bold">Delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* -------------------- VIEW 3: FULL QUICK NOTES WORKSPACE -------------------- */}
      {activeTab === 'notes' && (
        <div className="glass rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                Study Sticky Notebook
              </h2>
              <p className="text-sm text-slate-550 dark:text-slate-455 mt-0.5">
                Draft outlines, compile code notes, or copy research links seamlessly
              </p>
            </div>
            
            {saveStatus && (
              <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full animate-bounce">
                {saveStatus}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Notes Sidebar Selector */}
            <div className="lg:col-span-1 space-y-4">
              <h5 className="text-xs font-bold text-slate-455 dark:text-slate-550 uppercase tracking-wider block">Notebook Themes</h5>
              
              <div className="flex flex-row lg:flex-col gap-2">
                {Object.keys(noteStyles).map((color) => (
                  <button
                    key={color}
                    onClick={() => setNoteColor(color)}
                    className={`w-full text-left px-4 py-3 rounded-2xl border text-sm font-bold capitalize transition-all duration-300 flex items-center space-x-2.5 ${
                      noteStyles[color]
                    } ${noteColor === color ? 'ring-3 ring-indigo-500/50' : 'hover:scale-[1.01]'}`}
                  >
                    <span className={`h-4.5 w-4.5 rounded-full border border-black/10 ${
                      color === 'yellow' ? 'bg-amber-200' :
                      color === 'blue' ? 'bg-blue-200' :
                      color === 'pink' ? 'bg-pink-200' :
                      color === 'green' ? 'bg-emerald-250' :
                      'bg-purple-200'
                    }`} />
                    <span>{color} Pad</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Note Canvas */}
            <div className="lg:col-span-3 space-y-4">
              <div className={`rounded-3xl border p-6 transition-all duration-300 relative shadow-inner ${noteStyles[noteColor]}`}>
                <textarea
                  placeholder="Start jotting down anything! StudyDash automatically autosaves your drafts dynamically on keystrokes..."
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value)
                    handleSaveNotes()
                  }}
                  className="w-full min-h-[350px] bg-transparent border-none text-base focus:outline-none font-bold resize-y placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/40 p-4 rounded-2xl">
                <span className="text-xs text-slate-505 dark:text-slate-455 font-semibold">
                  Autosaved to your browser local storage
                </span>
                
                <button
                  onClick={handleSaveNotes}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-2xl active:scale-98 shadow-md shadow-indigo-600/10 flex items-center gap-1.5 transition-all"
                >
                  <Save className="h-4.5 w-4.5" />
                  <span>Manual Force Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- VIEW 4: IMMERSIVE FULL TIMER VIEW -------------------- */}
      {activeTab === 'timer' && (
        <div className="glass rounded-3xl p-6 md:p-12 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[500px]">
          
          {/* Aligned Audio button at top right */}
          <div className="absolute top-6 right-6 flex items-center space-x-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center justify-center p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-550 hover:text-slate-700 transition-colors active:scale-95 cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="h-5.5 w-5.5" /> : <VolumeX className="h-5.5 w-5.5 text-rose-500" />}
            </button>
          </div>

          <div className="max-w-md w-full space-y-8 relative z-10">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                Pomodoro Focus Arena
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-455 mt-1.5 max-w-sm mx-auto">
                Power up productivity by dedicating blocks of absolute focus, followed by rests
              </p>
            </div>

            {/* Immersive Mode Selectors */}
            <div className="flex items-center justify-center space-x-2 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/40">
              {[
                { id: 'work', label: 'Study Block' },
                { id: 'short', label: 'Short Break' },
                { id: 'long', label: 'Long Break' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => changeTimerMode(m.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    timerMode === m.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-555 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  {m.label} ({customDurations[m.id]}m)
                </button>
              ))}
            </div>

            {/* Premium Immersive Focus Ring */}
            <div className="relative flex flex-col items-center justify-center w-full gap-8">

              {/* Massive SVG Ring */}
              <div className={`relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center select-none transition-all duration-700 ${timerRunning ? 'drop-shadow-[0_0_60px_rgba(99,102,241,0.4)]' : ''}`}>

                {/* Outer ambient glow rings */}
                <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${timerRunning ? 'ring-[6px] ring-indigo-500/15 ring-offset-4 ring-offset-slate-950' : 'ring-2 ring-indigo-500/5'}`} />
                <div className={`absolute inset-2 rounded-full transition-all duration-1000 ${timerRunning ? 'ring-[3px] ring-violet-500/8' : ''}`} />

                {/* SVG Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 320 320">
                  <defs>
                    <linearGradient id="timerGradientFull" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="40%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                    <linearGradient id="timerGradientFullSub" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#312e81" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.2" />
                    </linearGradient>
                    <filter id="glowFull" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>
                  {/* Outer decorative track */}
                  <circle cx="160" cy="160" r="148" fill="none" stroke="rgba(99,102,241,0.05)" strokeWidth="1" />
                  {/* Main track */}
                  <circle cx="160" cy="160" r="140" fill="none" stroke="rgba(99,102,241,0.08)" strokeWidth="14" />
                  {/* Inner decorative track */}
                  <circle cx="160" cy="160" r="124" fill="none" stroke="url(#timerGradientFullSub)" strokeWidth="2" />
                  {/* Progress arc */}
                  <circle
                    cx="160" cy="160" r="140"
                    fill="none"
                    stroke="url(#timerGradientFull)"
                    strokeWidth="14"
                    strokeDasharray={880}
                    strokeDashoffset={880 - Math.min(1, Math.max(0, timeLeft / (customDurations[timerMode] * 60))) * 880}
                    strokeLinecap="round"
                    filter="url(#glowFull)"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>

                {/* Inner background */}
                <div className="absolute inset-[18px] rounded-full bg-slate-950/95 border border-indigo-500/10" />
                <div className="absolute inset-[22px] rounded-full bg-gradient-to-b from-slate-900/30 to-transparent" />

                {/* Center content */}
                <div className="relative z-10 flex flex-col items-center justify-center gap-3">

                  {/* Mode badge */}
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full border ${
                    timerMode === 'work' ? 'text-indigo-300 border-indigo-500/30 bg-indigo-950/50' :
                    timerMode === 'short' ? 'text-emerald-300 border-emerald-500/30 bg-emerald-950/50' :
                    'text-violet-300 border-violet-500/30 bg-violet-950/50'
                  }`}>
                    {timerMode === 'work' ? '● Study Block' : timerMode === 'short' ? '● Short Break' : '● Long Break'}
                  </span>

                  {/* Main time display */}
                  <span className="text-6xl md:text-7xl font-black tracking-tight tabular-nums bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent leading-none">
                    {formatTime(timeLeft)}
                  </span>

                  {/* Hours adjuster row */}
                  <div className="flex items-center gap-3 mt-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); adjustHours(-1); }}
                      disabled={timerRunning}
                      className={`w-8 h-8 rounded-full bg-slate-800 border border-white/10 text-slate-300 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all flex items-center justify-center text-base font-black shadow-md ${timerRunning ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-90'}`}
                    >−</button>
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-black text-indigo-400 tabular-nums leading-none">
                        {Math.floor(timeLeft / 3600)}
                      </span>
                      <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">hours</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); adjustHours(1); }}
                      disabled={timerRunning}
                      className={`w-8 h-8 rounded-full bg-slate-800 border border-white/10 text-slate-300 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all flex items-center justify-center text-base font-black shadow-md ${timerRunning ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-90'}`}
                    >+</button>
                  </div>

                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                    {timerRunning ? '⚡ Engine Running' : 'Adjust time above'}
                  </span>
                </div>
              </div>

              {/* Minutes quick-adjust row */}
              <div className="flex items-center gap-3 justify-center flex-wrap">
                {[-15, -5, -1].map(d => (
                  <button
                    key={d}
                    onClick={() => adjustMinutes(d)}
                    disabled={timerRunning}
                    className={`px-4 py-2 rounded-2xl bg-slate-900 border border-white/5 text-rose-400 hover:bg-rose-950/50 hover:border-rose-500/30 hover:text-rose-300 transition-all text-sm font-bold shadow-sm ${timerRunning ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
                  >
                    {d}m
                  </button>
                ))}
                <div className="h-8 w-px bg-white/10" />
                {[1, 5, 15].map(d => (
                  <button
                    key={d}
                    onClick={() => adjustMinutes(d)}
                    disabled={timerRunning}
                    className={`px-4 py-2 rounded-2xl bg-slate-900 border border-white/5 text-emerald-400 hover:bg-emerald-950/50 hover:border-emerald-500/30 hover:text-emerald-300 transition-all text-sm font-bold shadow-sm ${timerRunning ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
                  >
                    +{d}m
                  </button>
                ))}
              </div>

            </div>

            {/* Flexible Custom Duration Adjuster Configuration Panel */}
            <div className="glass p-5 rounded-3xl border border-white/5 space-y-4 max-w-sm mx-auto text-left">
              <h5 className="text-xs font-bold text-slate-455 uppercase tracking-wider block mb-2 text-center">
                Configure Standard Session Blocks
              </h5>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-355">
                  <span>💼 Work Interval:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => adjustCustomDurationSetting('work', -1)}
                      className="h-6 w-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-black active:scale-90 transition-all cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-indigo-400 font-extrabold">{customDurations.work} min</span>
                    <button
                      onClick={() => adjustCustomDurationSetting('work', 1)}
                      className="h-6 w-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-black active:scale-90 transition-all cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-slate-355">
                  <span>☕ Short Rest:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => adjustCustomDurationSetting('short', -1)}
                      className="h-6 w-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-black active:scale-90 transition-all cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-indigo-400 font-extrabold">{customDurations.short} min</span>
                    <button
                      onClick={() => adjustCustomDurationSetting('short', 1)}
                      className="h-6 w-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-black active:scale-90 transition-all cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-slate-355">
                  <span>💤 Long Recess:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => adjustCustomDurationSetting('long', -1)}
                      className="h-6 w-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-black active:scale-90 transition-all cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-indigo-400 font-extrabold">{customDurations.long} min</span>
                    <button
                      onClick={() => adjustCustomDurationSetting('long', 1)}
                      className="h-6 w-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-black active:scale-90 transition-all cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* controls */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={startPauseTimer}
                className="bg-indigo-650 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-650/15 active:scale-95 flex items-center space-x-2 transition-all cursor-pointer"
              >
                {timerRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                <span>{timerRunning ? 'Pause Engine' : 'Ignite Focus'}</span>
              </button>

              <button
                onClick={() => resetTimer(timerMode, true)}
                className="bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-255 dark:border-slate-700 text-slate-655 dark:text-slate-350 p-4 rounded-2xl active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>

            {/* Tips Banner */}
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-150/10 dark:border-indigo-900/30 rounded-2xl text-xs text-indigo-600 dark:text-indigo-400 font-semibold max-w-sm mx-auto">
              💡 Tip: Put your phone on Silent and focus entirely on a single task!
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
