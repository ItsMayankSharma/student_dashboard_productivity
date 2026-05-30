import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import { Edit2, Check, Sparkles, GraduationCap, LogOut } from 'lucide-react'

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

  // Force system-wide deep dark mode class on document load
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

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
          />
        </main>
      </div>
    </div>
  )
}

export default App
