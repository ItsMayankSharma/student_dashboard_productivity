import React, { useState, useEffect } from 'react'
import { Brain, Plus, Trash2, ChevronLeft, ChevronRight, RefreshCw, Layers, Sparkles, BookOpen, AlertCircle } from 'lucide-react'

const defaultDecks = [
  {
    id: 1,
    name: 'Physics: Thermodynamics',
    description: 'Laws, heat engines, entropy, and kinetic theory equations.',
    cards: [
      { id: 101, front: 'What is the First Law of Thermodynamics?', back: 'Energy cannot be created or destroyed; the change in internal energy equals heat added minus work done (ΔU = Q - W).' },
      { id: 102, front: 'State the Second Law of Thermodynamics (Kelvin-Planck statement).', back: 'It is impossible to construct a device operating in a cycle whose sole effect is to extract heat from a reservoir and perform an equivalent amount of work.' },
      { id: 103, front: 'What is entropy mathematically?', back: 'dS = dQ_rev / T. It measures the degree of disorder/randomness in a system.' },
      { id: 104, front: 'What is the efficiency of a Carnot Engine?', back: 'η = 1 - (T_C / T_H), where T_C and T_H are absolute temperatures of cold and hot reservoirs.' }
    ]
  },
  {
    id: 2,
    name: 'React: Hooks API',
    description: 'Core concepts for hooks and state synchronization.',
    cards: [
      { id: 201, front: 'What is the main purpose of useEffect cleanup function?', back: 'To clean up subscriptions, timers, or event listeners before the component unmounts or before re-running the effect to prevent memory leaks.' },
      { id: 202, front: 'What is the rule of Hook nesting?', back: 'Hooks must ONLY be called at the top level of a functional component; never inside loops, conditions, or nested functions.' },
      { id: 203, front: 'How does useMemo differ from useCallback?', back: 'useMemo returns a memoized VALUE computed from a function. useCallback returns a memoized CALLBACK FUNCTION itself.' }
    ]
  }
]

export default function Flashcards({ awardXp }) {
  const [decks, setDecks] = useState(() => {
    const saved = localStorage.getItem('studydash_flashcards')
    return saved ? JSON.parse(saved) : defaultDecks
  })

  // Navigation states
  const [activeDeckId, setActiveDeckId] = useState(null)
  const [isStudyMode, setIsStudyMode] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  // Card list for the active review session
  const [sessionCards, setSessionCards] = useState([])
  const [masteredCount, setMasteredCount] = useState(0)

  // Form states
  const [newDeckName, setNewDeckName] = useState('')
  const [newDeckDesc, setNewDeckDesc] = useState('')
  const [newCardFront, setNewCardFront] = useState('')
  const [newCardBack, setNewCardBack] = useState('')

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('studydash_flashcards', JSON.stringify(decks))
  }, [decks])

  const activeDeck = decks.find(d => d.id === activeDeckId)

  // Deck Management Actions
  const handleCreateDeck = () => {
    if (!newDeckName.trim()) return
    const newDeck = {
      id: Date.now(),
      name: newDeckName.trim(),
      description: newDeckDesc.trim() || 'Custom created flashcard deck.',
      cards: []
    }
    setDecks([...decks, newDeck])
    setNewDeckName('')
    setNewDeckDesc('')
    awardXp(10)
  }

  const handleDeleteDeck = (id, e) => {
    e.stopPropagation()
    setDecks(decks.filter(d => d.id !== id))
    if (activeDeckId === id) {
      setActiveDeckId(null)
      setIsStudyMode(false)
    }
  }

  // Card Management Actions
  const handleAddCard = () => {
    if (!newCardFront.trim() || !newCardBack.trim()) return
    const newCard = {
      id: Date.now(),
      front: newCardFront.trim(),
      back: newCardBack.trim()
    }
    setDecks(decks.map(d => {
      if (d.id === activeDeckId) {
        return {
          ...d,
          cards: [...d.cards, newCard]
        }
      }
      return d
    }))
    setNewCardFront('')
    setNewCardBack('')
    awardXp(5)
  }

  const handleDeleteCard = (cardId) => {
    setDecks(decks.map(d => {
      if (d.id === activeDeckId) {
        return {
          ...d,
          cards: d.cards.filter(c => c.id !== cardId)
        }
      }
      return d
    }))
  }

  // Active Recall Session Actions
  const handleStartStudy = () => {
    if (!activeDeck || activeDeck.cards.length === 0) return
    setSessionCards([...activeDeck.cards])
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setMasteredCount(0)
    setIsStudyMode(true)
  }

  const handleRateCard = (mastered) => {
    setIsFlipped(false)
    
    setTimeout(() => {
      if (mastered) {
        setMasteredCount(prev => prev + 1)
        // Remove card from this active review session
        const nextCards = sessionCards.filter((_, idx) => idx !== currentCardIndex)
        setSessionCards(nextCards)
        
        // If empty, session is cleared
        if (nextCards.length === 0) {
          handleSessionComplete()
          return
        }
        
        // Boundaries check
        if (currentCardIndex >= nextCards.length) {
          setCurrentCardIndex(0)
        }
      } else {
        // "Needs Review" -> Keep in queue and advance index
        setCurrentCardIndex(prev => (prev + 1) % sessionCards.length)
      }
    }, 200)
  }

  const handleSessionComplete = () => {
    awardXp(30) // +30 XP bonus for clearing a deck!
    alert(`🎉 Revision Session Complete! You mastered all cards in '${activeDeck.name}'! +30 XP awarded! 🚀`)
    setIsStudyMode(false)
  }

  return (
    <div className="glass rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-indigo-400" />
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Active Recall Flashcards
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Create revision decks and study them using space repetition methods.
          </p>
        </div>

        {activeDeckId && (
          <button
            onClick={() => { setActiveDeckId(null); setIsStudyMode(false); }}
            className="self-start sm:self-auto bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-350 hover:text-white px-4 py-2 rounded-2xl text-xs font-bold transition-all active:scale-[0.98]"
          >
            ← Back to Decks
          </button>
        )}
      </div>

      {/* VIEW 1: STUDY SESSION MODE */}
      {isStudyMode && activeDeck && (
        <div className="max-w-xl mx-auto space-y-6">
          
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Deck: <strong className="text-slate-200">{activeDeck.name}</strong></span>
            <span>{sessionCards.length} Cards Remaining (Mastered {masteredCount}/{activeDeck.cards.length})</span>
          </div>

          <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${(masteredCount / activeDeck.cards.length) * 100}%` }}
            />
          </div>

          {/* Interactive 3D Flip Card */}
          {sessionCards.length > 0 && (
            <div 
              className="w-full h-72 [perspective:1000px] cursor-pointer group"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div 
                className="relative w-full h-full text-center transition-transform duration-500 [transform-style:preserve-3d]"
                style={{ 
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transformStyle: 'preserve-3d' 
                }}
              >
                
                {/* FRONT SIDE (Question) */}
                <div 
                  className="absolute inset-0 w-full h-full rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 flex flex-col justify-between p-6 transition-colors"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">QUESTION</span>
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-lg md:text-xl font-bold text-slate-100 px-4 leading-relaxed">
                      {sessionCards[currentCardIndex].front}
                    </p>
                  </div>
                  <span className="text-xxs font-extrabold text-indigo-400 uppercase tracking-wide">Click card to reveal answer 🔄</span>
                </div>

                {/* BACK SIDE (Answer) */}
                <div 
                  className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-indigo-950/70 to-violet-950/50 border border-indigo-500/30 flex flex-col justify-between p-6"
                  style={{ 
                    backfaceVisibility: 'hidden', 
                    WebkitBackfaceVisibility: 'hidden', 
                    transform: 'rotateY(180deg)' 
                  }}
                >
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest text-left">ANSWER / REMARK</span>
                  <div className="flex-1 flex items-center justify-center overflow-y-auto">
                    <p className="text-base font-semibold text-slate-200 px-4 leading-relaxed">
                      {sessionCards[currentCardIndex].back}
                    </p>
                  </div>
                  <span className="text-xxs font-extrabold text-slate-500 uppercase tracking-wide">Click card to view question 🔄</span>
                </div>

              </div>
            </div>
          )}

          {/* Rating Controls (Leitner feedback) */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleRateCard(false)}
              className="bg-rose-950/20 hover:bg-rose-900/20 border border-rose-900/30 hover:border-rose-500/40 text-rose-400 py-3.5 px-6 rounded-2xl text-sm font-bold transition-all active:scale-[0.98]"
            >
              ❌ Needs Work
            </button>
            
            <button
              onClick={() => handleRateCard(true)}
              className="bg-emerald-950/20 hover:bg-emerald-900/20 border border-emerald-900/30 hover:border-emerald-500/40 text-emerald-400 py-3.5 px-6 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <Sparkles className="h-4.5 w-4.5 animate-pulse text-amber-500" />
              <span>Know It!</span>
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => setIsStudyMode(false)}
              className="text-slate-500 hover:text-slate-300 text-xs font-semibold underline"
            >
              Cancel Session
            </button>
          </div>

        </div>
      )}

      {/* VIEW 2: CARD WORKSPACE (DECK OPENED) */}
      {!isStudyMode && activeDeckId !== null && activeDeck && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel: Add Card Form & Deck Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/50 border border-slate-850 p-6 rounded-3xl space-y-4">
              <div>
                <h3 className="text-lg font-black text-slate-100 truncate">{activeDeck.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{activeDeck.description}</p>
              </div>

              <div className="h-px bg-slate-800" />

              <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                <span>Cards count:</span>
                <span className="text-slate-200">{activeDeck.cards.length} items</span>
              </div>

              {activeDeck.cards.length > 0 ? (
                <button
                  onClick={handleStartStudy}
                  className="w-full bg-indigo-650 hover:bg-indigo-600 text-white py-3 px-5 rounded-2xl text-xs font-black shadow-lg shadow-indigo-650/15 active:scale-95 flex items-center justify-center space-x-2 transition-all"
                >
                  <Layers className="h-4.5 w-4.5" />
                  <span>Ignite Revision Session</span>
                </button>
              ) : (
                <div className="flex gap-1.5 items-center p-3 bg-indigo-950/20 border border-indigo-900/50 rounded-xl text-xs text-indigo-400 font-medium">
                  <AlertCircle className="h-4.5 w-4.5 text-indigo-400 flex-shrink-0" />
                  <span>Add cards below to start reviewing!</span>
                </div>
              )}
            </div>

            {/* Add Card Form */}
            <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-3xl space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Append New Card</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Front (Question / Prompt)</label>
                  <textarea
                    placeholder="E.g., What is Newton's 2nd Law?"
                    value={newCardFront}
                    onChange={(e) => setNewCardFront(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-100 font-semibold"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Back (Answer / Definition)</label>
                  <textarea
                    placeholder="E.g., F = ma. The acceleration of an object is dependent upon the net force..."
                    value={newCardBack}
                    onChange={(e) => setNewCardBack(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-100 font-semibold"
                    rows={3}
                  />
                </div>

                <button
                  onClick={handleAddCard}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-white/5 text-indigo-400 hover:text-white py-3.5 rounded-2xl text-xs font-bold active:scale-[0.98] transition-all"
                >
                  Create Card (+5 XP)
                </button>
              </div>
            </div>
          </div>

          {/* Right panel: Deck's Card List */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Deck Cards ({activeDeck.cards.length})</h4>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {activeDeck.cards.length === 0 ? (
                <div className="p-16 text-center border border-dashed border-slate-800 rounded-3xl text-slate-500 flex flex-col items-center">
                  <Brain className="h-10 w-10 text-slate-700 animate-pulse mb-2" />
                  <p className="font-semibold text-sm">No cards in this deck.</p>
                  <p className="text-xs">Create your first revision card using the left panel form.</p>
                </div>
              ) : (
                activeDeck.cards.map((c, index) => (
                  <div 
                    key={c.id}
                    className="bg-slate-900/40 border border-slate-850 p-4.5 rounded-2xl flex items-start justify-between group gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-black bg-slate-850 px-2 py-0.5 rounded-md text-slate-400">#{index+1}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-200 mt-2">Q: {c.front}</p>
                      <p className="text-xs text-slate-450 mt-1 font-semibold pl-4 border-l border-indigo-950">A: {c.back}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteCard(c.id)}
                      className="text-slate-500 hover:text-rose-500 p-2 rounded-xl hover:bg-rose-950/20 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 3: DECKS GALLERY */}
      {!isStudyMode && activeDeckId === null && (
        <div className="space-y-6">
          
          {/* Deck creator form */}
          <div className="p-5 bg-slate-900/30 border border-slate-850 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Deck Name</label>
              <input
                type="text"
                placeholder="E.g., Chemistry: Organic Equations"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-100 font-semibold"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Description</label>
              <input
                type="text"
                placeholder="E.g., Carbon chains & reactions..."
                value={newDeckDesc}
                onChange={(e) => setNewDeckDesc(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-800 bg-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-100 font-semibold"
              />
            </div>

            <div>
              <button
                onClick={handleCreateDeck}
                className="w-full bg-indigo-650 hover:bg-indigo-600 text-white py-3 rounded-2xl text-xs font-black shadow-lg shadow-indigo-650/10 active:scale-98 transition-all flex items-center justify-center space-x-1.5"
              >
                <Plus className="h-4.5 w-4.5" />
                <span>Create Deck (+10 XP)</span>
              </button>
            </div>
          </div>

          {/* Decks Grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map(d => (
              <div
                key={d.id}
                onClick={() => setActiveDeckId(d.id)}
                className="bg-slate-900/40 border border-slate-850 hover:border-slate-700 hover:scale-[1.02] p-5 rounded-3xl flex flex-col justify-between h-48 cursor-pointer group transition-all duration-300 relative overflow-hidden"
              >
                {/* Ambient glow in corner */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-650/5 blur-2xl rounded-full" />
                
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black bg-indigo-950/60 border border-indigo-900/50 text-indigo-400 px-3 py-1 rounded-full uppercase tracking-wider">
                      {d.cards.length} Cards
                    </span>
                    <button
                      onClick={(e) => handleDeleteDeck(d.id, e)}
                      className="text-slate-500 hover:text-rose-500 p-1.5 rounded-xl hover:bg-rose-950/20 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <h3 className="text-base font-black text-slate-150 mt-4 group-hover:text-indigo-400 transition-colors truncate">
                    {d.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1.5 line-clamp-2">
                    {d.description}
                  </p>
                </div>

                <div className="border-t border-slate-850/60 pt-3 flex items-center justify-between text-xxs font-black text-indigo-400 uppercase tracking-widest mt-4">
                  <span>open deck workspace</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  )
}
