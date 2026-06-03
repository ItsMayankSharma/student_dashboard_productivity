import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import { Edit2, Check, Sparkles, GraduationCap, LogOut, Trophy } from 'lucide-react'

// Default tasks if local storage is blank
const defaultTasks = [
  { id: 1, text: 'Complete Physics Assignment', completed: false, category: 'Study', priority: 'High' },
  { id: 2, text: 'Design student dashboard landing mock', completed: true, category: 'Work', priority: 'Medium' },
  { id: 3, text: 'Revise organic chemistry equations', completed: false, category: 'Study', priority: 'High' },
  { id: 4, text: 'Meditate for 10 minutes', completed: false, category: 'Personal', priority: 'Low' }
]

function App() {
  // 1. Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('studydash_loggedin') === 'true'
  })

  // 2. Navigation State
  const [activeTab, setActiveTab] = useState('dashboard')

  // 3. Profile States (Interactive Student Username!)
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('studydash_username') || 'Aanya Sharma'
  })
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [tempUsername, setTempUsername] = useState(username)

  // 4. Global Synced Productivity States
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('studydash_tasks')
    return saved ? JSON.parse(saved) : defaultTasks
  })

  const [notes, setNotes] = useState(() => {
    return localStorage.getItem('studydash_notes') || 'Welcome to your Study Notebook! Feel free to overwrite this sticky notes card with custom formulas, study plans, or tasks.'
  })

  const [studyHours, setStudyHours] = useState(() => {
    const saved = localStorage.getItem('studydash_studyhours')
    return saved ? parseFloat(saved) : 3.5
  })

  const [focusScore, setFocusScore] = useState(() => {
    const saved = localStorage.getItem('studydash_focusscore')
    return saved ? parseInt(saved) : 82
  })

  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem('studydash_xp')
    return saved ? parseInt(saved) : 0
  })

  const [level, setLevel] = useState(() => {
    const saved = localStorage.getItem('studydash_level')
    return saved ? parseInt(saved) : 1
  })

  // Force system-wide deep dark mode class on document load
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  // Sync persistent states to local storage
  useEffect(() => {
    localStorage.setItem('studydash_xp', xp.toString())
  }, [xp])

  useEffect(() => {
    localStorage.setItem('studydash_level', level.toString())
  }, [level])

  const awardXp = (amount) => {
    setXp((prevXp) => {
      let newXp = prevXp + amount
      let currentLevel = level
      let xpNeeded = currentLevel * 100
      let leveledUp = false

      while (newXp >= xpNeeded) {
        newXp -= xpNeeded
        currentLevel += 1
        xpNeeded = currentLevel * 100
        leveledUp = true
      }

      if (leveledUp) {
        setLevel(currentLevel)
        // Play level up sound using Web Audio API synthesis
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
          const osc1 = audioCtx.createOscillator()
          const osc2 = audioCtx.createOscillator()
          const gainNode = audioCtx.createGain()
          
          osc1.connect(gainNode)
          osc2.connect(gainNode)
          gainNode.connect(audioCtx.destination)
          
          osc1.type = 'triangle'
          osc2.type = 'sine'
          
          const now = audioCtx.currentTime
          osc1.frequency.setValueAtTime(523.25, now) // C5
          osc1.frequency.setValueAtTime(659.25, now + 0.1) // E5
          osc1.frequency.setValueAtTime(783.99, now + 0.2) // G5
          osc1.frequency.setValueAtTime(1046.50, now + 0.3) // C6
          
          osc2.frequency.setValueAtTime(261.63, now) // C4
          osc2.frequency.setValueAtTime(329.63, now + 0.1) // E4
          osc2.frequency.setValueAtTime(392.00, now + 0.2) // G4
          osc2.frequency.setValueAtTime(523.25, now + 0.3) // C5
          
          gainNode.gain.setValueAtTime(0, now)
          gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05)
          gainNode.gain.setValueAtTime(0.2, now + 0.4)
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.7)
          
          osc1.start(now)
          osc2.start(now)
          osc1.stop(now + 0.7)
          osc2.stop(now + 0.7)
        } catch (e) {
          console.warn('Level up sound failed', e)
        }
      }

      return newXp
    })
  }

  // Sync persistent states to local storage
  useEffect(() => {
    localStorage.setItem('studydash_tasks', JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem('studydash_notes', notes)
  }, [notes])

  useEffect(() => {
    localStorage.setItem('studydash_studyhours', studyHours.toString())
  }, [studyHours])

  useEffect(() => {
    localStorage.setItem('studydash_focusscore', focusScore.toString())
  }, [focusScore])

  // Authentication Handlers
  const handleLogin = (user) => {
    setUsername(user)
    setIsLoggedIn(true)
    localStorage.setItem('studydash_username', user)
    localStorage.setItem('studydash_loggedin', 'true')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.setItem('studydash_loggedin', 'false')
  }

  const handleSaveUsername = () => {
    const finalName = tempUsername.trim() ? tempUsername.trim() : 'Student'
    setUsername(finalName)
    localStorage.setItem('studydash_username', finalName)
    setIsEditingUsername(false)
  }

  // Render Login page if not authenticated
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6 transition-colors duration-300">
      
      {/* Outer Flex Container */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        
        {/* Responsive Floating Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          taskCount={tasks.filter(t => !t.completed).length} 
        />

        {/* Main Content Pane */}
        <main className="flex-1 space-y-6">
          
          {/* Header Row */}
          <header className="glass rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-300">
            
            {/* Greetings / Profile Widget */}
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold text-xl shadow-inner">
                <GraduationCap className="h-6 w-6" />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100">
                    Welcome Back, 
                  </h1>
                  
                  {isEditingUsername ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={tempUsername}
                        onChange={(e) => setTempUsername(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveUsername()}
                        className="px-2 py-0.5 border border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-lg text-sm bg-slate-900 font-semibold"
                        autoFocus
                      />
                      <button 
                        onClick={handleSaveUsername}
                        className="p-1 rounded bg-indigo-600 text-white"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5 group">
                      <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                        {username}
                      </span>
                      <button
                        onClick={() => {
                          setTempUsername(username)
                          setIsEditingUsername(true)
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-400 p-1 rounded-lg transition-all"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  <span className="text-lg md:text-2xl animate-bounce">👋</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {activeTab === 'dashboard' ? "Here is your study summary for today!" : 
                   activeTab === 'tasks' ? "Let's organize your focus modules" :
                   activeTab === 'notes' ? "Scribble research summaries and notes" :
                   "Time block your revisions for maximum memory retention"}
                </p>
              </div>
            </div>

            {/* Level & XP Widget */}
            <div className="flex items-center space-x-3 bg-slate-900/50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800 px-4 py-2.5 rounded-2xl">
              <div className="bg-amber-500/10 text-amber-500 p-2 rounded-xl animate-pulse">
                <Trophy className="h-5 w-5" />
              </div>
              <div className="min-w-[120px] sm:min-w-[140px]">
                <div className="flex items-center justify-between text-[11px] font-black text-slate-350 dark:text-slate-300 mb-1">
                  <span>LVL {level}</span>
                  <span className="text-indigo-400 font-extrabold">{xp} / {level * 100} XP</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 via-indigo-500 to-violet-500 transition-all duration-500"
                    style={{ width: `${(xp / (level * 100)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Config controls */}
            <div className="flex items-center space-x-3 self-end sm:self-auto">
              <button
                onClick={handleLogout}
                className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-3 rounded-2xl text-xs font-bold active:scale-95 shadow-lg shadow-rose-600/10 flex items-center space-x-2 transition-all"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Logout</span>
              </button>
            </div>
          </header>

          {/* Subrouted Widget Layout Container */}
          <Dashboard 
            tasks={tasks}
            setTasks={setTasks}
            notes={notes}
            setNotes={setNotes}
            studyHours={studyHours}
            setStudyHours={setStudyHours}
            focusScore={focusScore}
            setFocusScore={setFocusScore}
            activeTab={activeTab}
            xp={xp}
            setXp={setXp}
            level={level}
            setLevel={setLevel}
            awardXp={awardXp}
          />
        </main>
      </div>
    </div>
  )
}

export default App
