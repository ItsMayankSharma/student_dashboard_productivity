import React from 'react'
import { Home, CheckSquare, FileText, Clock, Sparkles, Flame, Brain, BarChart3, MessageSquareText } from 'lucide-react'

export default function Sidebar({ activeTab, setActiveTab, taskCount }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: taskCount > 0 ? taskCount : null },
    { id: 'habits', label: 'Habits & XP', icon: Flame },
    { id: 'timer', label: 'Timer & Sounds', icon: Clock },
    { id: 'flashcards', label: 'Flashcards', icon: Brain },
    { id: 'grades', label: 'Grade Book', icon: BarChart3 },
    { id: 'aicoach', label: 'AI Coach', icon: MessageSquareText },
    { id: 'notes', label: 'Notes', icon: FileText }
  ]

  return (
    <aside className="w-full md:w-64 glass md:h-[calc(100vh-2rem)] md:sticky md:top-4 rounded-3xl p-6 flex flex-col justify-between shadow-xl shadow-slate-100 dark:shadow-none mb-6 md:mb-0 transition-all duration-300">
      <div>
        {/* Brand Header */}
        <div className="flex items-center space-x-3 mb-8 px-2">
          <div className="bg-indigo-600 text-white p-2.5 rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center justify-center">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              StudyDash
            </h2>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Your Study Partner</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-slate-800/40'
                }`}
              >
                {/* Visual hover bubble effect */}
                {!isActive && (
                  <span className="absolute inset-0 w-full h-full bg-indigo-500/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                )}

                <div className="flex items-center space-x-3 relative z-10">
                  <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                  }`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold relative z-10 transition-colors duration-300 ${
                    isActive 
                      ? 'bg-white text-indigo-600' 
                      : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 text-center md:text-left px-2">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Made with ❤️ for students
        </p>
      </div>
    </aside>
  )
}
