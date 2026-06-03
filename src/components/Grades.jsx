import React, { useState, useEffect } from 'react'
import { Award, Plus, Trash2, ShieldAlert, CheckCircle, Percent, Compass, Calculator } from 'lucide-react'

// Letter grade to GPA mappings
const gradeScale = {
  'A+': 4.0,
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'F': 0.0
}

const defaultCourses = [
  { id: 1, name: 'Computer Science: React & Vite', credits: 4, targetGrade: 'A', currentGrade: 'A', score: 95 },
  { id: 2, name: 'Mathematics: Linear Algebra', credits: 3, targetGrade: 'A-', currentGrade: 'B+', score: 87 },
  { id: 3, name: 'Physics: Classical Mechanics', credits: 4, targetGrade: 'B+', currentGrade: 'B-', score: 81 },
  { id: 4, name: 'Chemistry: Organic Hydrocarbons', credits: 3, targetGrade: 'B+', currentGrade: 'C+', score: 77 }
]

export default function Grades({ awardXp }) {
  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('studydash_grades')
    return saved ? JSON.parse(saved) : defaultCourses
  })

  // Form states
  const [nameInput, setNameInput] = useState('')
  const [creditsInput, setCreditsInput] = useState(3)
  const [targetInput, setTargetInput] = useState('A')
  const [currentInput, setCurrentInput] = useState('B')
  const [scoreInput, setScoreInput] = useState(85)

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('studydash_grades', JSON.stringify(courses))
  }, [courses])

  // Calculation helpers
  const calculateGPA = (list) => {
    let totalCredits = 0
    let weightedPoints = 0

    list.forEach(c => {
      const gpaPoints = gradeScale[c.currentGrade] !== undefined ? gradeScale[c.currentGrade] : 3.0
      weightedPoints += gpaPoints * c.credits
      totalCredits += c.credits
    })

    return totalCredits > 0 ? parseFloat((weightedPoints / totalCredits).toFixed(2)) : 0.0
  }

  const calculateTargetGPA = (list) => {
    let totalCredits = 0
    let weightedPoints = 0

    list.forEach(c => {
      const targetPoints = gradeScale[c.targetGrade] !== undefined ? gradeScale[c.targetGrade] : 4.0
      weightedPoints += targetPoints * c.credits
      totalCredits += c.credits
    })

    return totalCredits > 0 ? parseFloat((weightedPoints / totalCredits).toFixed(2)) : 0.0
  }

  const currentGPA = calculateGPA(courses)
  const targetGPA = calculateTargetGPA(courses)

  const handleAddCourse = () => {
    if (!nameInput.trim()) return
    const newCourse = {
      id: Date.now(),
      name: nameInput.trim(),
      credits: parseInt(creditsInput) || 3,
      targetGrade: targetInput,
      currentGrade: currentInput,
      score: parseInt(scoreInput) || 85
    }
    setCourses([...courses, newCourse])
    setNameInput('')
    setCreditsInput(3)
    setScoreInput(85)
    awardXp(15) // XP for adding course
  }

  const handleDeleteCourse = (id) => {
    setCourses(courses.filter(c => c.id !== id))
  }

  const getPerformanceMessage = () => {
    if (currentGPA >= targetGPA) {
      return { text: "Outstanding! You are currently meeting or exceeding your target GPA! 🚀", color: "text-emerald-400 bg-emerald-950/20 border-emerald-900/40" }
    } else if (targetGPA - currentGPA < 0.3) {
      return { text: "So close! A small boost in your lowest course will hit your goal. Keep grinding! ⚡", color: "text-amber-400 bg-amber-950/20 border-amber-900/40" }
    } else {
      return { text: "Action required: Several modules are falling behind. Focus revisions here! ⚠️", color: "text-rose-400 bg-rose-950/20 border-rose-900/40" }
    }
  }

  const feedback = getPerformanceMessage()

  return (
    <div className="glass rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
      
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Calculator className="h-6 w-6 text-indigo-400" />
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Grade Book & GPA Tracker
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor course scores, weights, targets, and predict overall GPA scales.
          </p>
        </div>
      </div>

      {/* TOP SUMMARY GRAPH GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GPA Dial Widget */}
        <div className="bg-slate-900/50 border border-slate-850 p-6 rounded-3xl flex flex-col items-center justify-center text-center">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Predicted GPA Scale</h4>
          
          <div className="relative w-44 h-24 flex items-center justify-center overflow-hidden">
            {/* Semi-Circle Progress Gauge */}
            <svg className="absolute top-0 w-36 h-36" viewBox="0 0 100 100">
              {/* Backing Ring */}
              <path 
                d="M 10 50 A 40 40 0 0 1 90 50" 
                fill="none" 
                stroke="rgba(255,255,255,0.03)" 
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Target GPA Ring */}
              <path 
                d="M 10 50 A 40 40 0 0 1 90 50" 
                fill="none" 
                stroke="rgba(99, 102, 241, 0.2)" 
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={126}
                strokeDashoffset={126 - (targetGPA / 4.0) * 126}
              />
              {/* Current GPA Ring */}
              <path 
                d="M 10 50 A 40 40 0 0 1 90 50" 
                fill="none" 
                stroke="url(#gpaGrad)" 
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={126}
                strokeDashoffset={126 - (currentGPA / 4.0) * 126}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gpaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            
            <div className="absolute bottom-1 z-10">
              <span className="text-3xl font-black text-white">{currentGPA}</span>
              <span className="text-[10px] text-slate-500 font-bold block">CURRENT GPA / 4.0</span>
            </div>
          </div>

          <div className="w-full flex justify-between items-center text-xs font-semibold text-slate-400 mt-4 px-4 border-t border-slate-850/60 pt-3">
            <span>Target Goal: <strong>{targetGPA}</strong></span>
            <span className={currentGPA >= targetGPA ? 'text-emerald-400' : 'text-amber-500'}>
              {currentGPA >= targetGPA ? 'Achieved 🏆' : `Short by ${Math.abs(targetGPA - currentGPA).toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* GPA Advice / Summary */}
        <div className="lg:col-span-2 bg-slate-900/30 border border-slate-850 p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Academic Status Report</h4>
            
            <div className="space-y-3">
              <div className={`p-4 border rounded-2xl text-xs font-semibold flex items-start gap-3 ${feedback.color}`}>
                <ShieldAlert className="h-5 w-5 flex-shrink-0" />
                <span>{feedback.text}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="p-3.5 bg-slate-900/50 border border-slate-850 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Credits</span>
                  <span className="text-lg font-black text-slate-100">{courses.reduce((acc, c) => acc + c.credits, 0)} Credits</span>
                </div>
                <div className="p-3.5 bg-slate-900/50 border border-slate-850 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Course Count</span>
                  <span className="text-lg font-black text-slate-100">{courses.length} Enrolled</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xxs text-slate-500 font-medium border-t border-slate-850/60 pt-3 mt-4">
            💡 Formulas are computed based on standard weighted university credits scale.
          </div>
        </div>
      </div>

      {/* CORE SYLLABUS LISTING & FORM WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Subject creation form */}
        <div className="lg:col-span-1 bg-slate-900/30 border border-slate-850 p-6 rounded-3xl space-y-4 h-fit">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Enroll New Course</h4>
          
          <div className="space-y-3.5">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Course Name</label>
              <input
                type="text"
                placeholder="E.g., Algorithms & Structures"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-100 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Credits Weight</label>
                <select
                  value={creditsInput}
                  onChange={(e) => setCreditsInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs focus:outline-none text-slate-300 font-semibold"
                >
                  {[1, 2, 3, 4, 5].map(c => <option key={c} value={c}>{c} Credits</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Score %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scoreInput}
                  onChange={(e) => setScoreInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-100 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Target Grade</label>
                <select
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs focus:outline-none text-slate-350 font-semibold"
                >
                  {Object.keys(gradeScale).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Current Grade</label>
                <select
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs focus:outline-none text-slate-350 font-semibold"
                >
                  {Object.keys(gradeScale).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={handleAddCourse}
              className="w-full bg-indigo-650 hover:bg-indigo-600 text-white py-3.5 rounded-2xl text-xs font-black shadow-lg shadow-indigo-650/15 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Enroll Course (+15 XP)</span>
            </button>
          </div>
        </div>

        {/* Course listing feed */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Course Modules ({courses.length})</h4>

          <div className="space-y-3.5">
            {courses.length === 0 ? (
              <div className="p-16 text-center border border-dashed border-slate-800 rounded-3xl text-slate-500 flex flex-col items-center">
                <Award className="h-10 w-10 text-slate-700 animate-pulse mb-2" />
                <p className="font-semibold text-sm">No course records listed.</p>
                <p className="text-xs">Enroll courses on the left panel to begin tracking GPA projections.</p>
              </div>
            ) : (
              courses.map(c => {
                const targetPoints = gradeScale[c.targetGrade] || 3.0
                const currentPoints = gradeScale[c.currentGrade] || 3.0
                const belowTarget = currentPoints < targetPoints

                return (
                  <div 
                    key={c.id}
                    className={`bg-slate-900/40 border p-4.5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between group gap-4 transition-all duration-300 ${
                      belowTarget 
                        ? 'border-rose-950/40 bg-rose-950/5' 
                        : 'border-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-[10px] font-black bg-slate-850 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                          {c.credits} Credits
                        </span>
                        {belowTarget && (
                          <span className="text-[9px] font-black bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3" /> Focus Required
                          </span>
                        )}
                        {!belowTarget && (
                          <span className="text-[9px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> On Track
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-black text-slate-150 mt-2 truncate">{c.name}</h3>
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-455 mt-1.5">
                        <span className="flex items-center gap-0.5"><Percent className="h-3.5 w-3.5" /> Score: <strong className="text-slate-300">{c.score}%</strong></span>
                        <span>GPA Weight: <strong className="text-slate-300">{currentPoints.toFixed(1)}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-850/60">
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[9px] font-bold text-slate-500 block">CURRENT</span>
                          <span className="text-sm font-black text-slate-100">{c.currentGrade}</span>
                        </div>
                        <div className="h-6 w-px bg-slate-850" />
                        <div className="text-left">
                          <span className="text-[9px] font-bold text-slate-500 block">TARGET</span>
                          <span className="text-sm font-black text-indigo-400">{c.targetGrade}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteCourse(c.id)}
                        className="text-slate-500 hover:text-rose-500 p-2 rounded-xl hover:bg-rose-950/20 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>

    </div>
  )
}
