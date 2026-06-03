import React, { useState, useRef, useEffect } from 'react'
import { MessageSquareText, Send, Sparkles, User, Bot, HelpCircle, Check, AlertCircle } from 'lucide-react'

const initialMessages = [
  {
    id: 1,
    sender: 'bot',
    text: "Hello! I am your **StudyBuddy AI Coach**. 🤖✨\n\nI am here to help you study, synthesize notes, structure revision blocks, or quiz your memory. Click one of the quick commands below to test my core capabilities!",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
]

const quickCommands = [
  { label: 'Explain React useEffect Hooks 💻', text: '/explain useEffect' },
  { label: 'Quiz me on Physics Equations 📝', text: '/quiz physics' },
  { label: 'Generate Chemistry Study Plan 🧪', text: '/schedule chemistry' },
  { label: 'Send Academic Motivation 🌟', text: '/motivate' }
]

export default function AICoach({ awardXp }) {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('studydash_aichat')
    return saved ? JSON.parse(saved) : initialMessages
  })
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef(null)

  // Interactive Quiz State inside chatbot
  const [quizAnswers, setQuizAnswers] = useState({}) // { messageId_questionIdx: selectedOptionIndex }

  useEffect(() => {
    localStorage.setItem('studydash_aichat', JSON.stringify(messages))
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendCommand = (text) => {
    if (!text.trim()) return

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI thinking and streaming response
    setTimeout(() => {
      const responseText = generateBotResponse(text)
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isQuiz: text.toLowerCase().includes('/quiz') || text.toLowerCase().includes('quiz')
      }
      setMessages(prev => [...prev, botMsg])
      setIsTyping(false)
      awardXp(10) // Gain XP for studying with AI Coach!
    }, 1500)
  }

  const generateBotResponse = (input) => {
    const query = input.toLowerCase()

    if (query.includes('useeffect') || query.includes('/explain')) {
      return `### React \`useEffect\` Hook Demystified 💻

The \`useEffect\` hook lets you synchronize a component with an external system (like APIs, DOM events, or timers).

#### 1. Core Syntax & Triggers
\`\`\`javascript
useEffect(() => {
  // 1. Setup Logic runs here
  return () => {
    // 2. Cleanup Logic runs here (unmounting / re-running)
  };
}, [dependencies]); // 3. Dependency Array
\`\`\`

#### 2. Dependency Combinations
| Dependency Array | Trigger Timing |
| :--- | :--- |
| **No Array** (\`[ ]\` omitted) | Runs on *every single render* of the component. |
| **Empty Array** (\`[]\`) | Runs *only once* on mount (initial load). |
| **State/Props Array** (\`[val1, val2]\`) | Runs on mount and *whenever values change*. |

#### 3. Pro-Tip: Memory Cleansing
Always clean up subscriptions or timers in the return callback to avoid performance leaks:
\`\`\`javascript
useEffect(() => {
  const timer = setInterval(() => console.log('tick'), 1000);
  return () => clearInterval(timer); // Crucial!
}, []);
\`\`\`
`;
    }

    if (query.includes('physics') || query.includes('/quiz')) {
      return `### Interactive Physics Memory Quiz 📝
Answer the questions below to test your recall on Thermodynamics:

#### Question 1: What does the variable 'U' represent in thermodynamic equations?
*   (A) Latent Heat Capacity
*   (B) Internal Energy of the System
*   (C) Coefficient of Friction
*   (D) Universal Gas Constant

#### Question 2: In an isothermal process, what variable remains constant?
*   (A) Pressure (P)
*   (B) Volume (V)
*   (C) Temperature (T)
*   (D) Entropy (S)

*Click the options below to verify your scores!*`;
    }

    if (query.includes('schedule') || query.includes('chemistry') || query.includes('plan')) {
      return `### Organic Chemistry Study Plan 🧪
Here is a high-efficiency 3-stage plan for chemical equations revision:

1. **Stage 1: Hydrocarbons Nomenclature (Day 1)**
   * Focus: Alkanes, alkenes, alkynes structural representations.
   * Target: Master IUPAC rules for naming compounds with up to 10 carbon atoms.
   
2. **Stage 2: Reaction Mechanisms (Day 2)**
   * Focus: Nucleophilic substitution ($S_N1$ & $S_N2$) and electrophilic additions.
   * Tool: Create a React Flashcard deck specifically mapping electrophiles vs nucleophiles.

3. **Stage 3: Synthesis Problems (Day 3)**
   * Focus: Multi-step conversions (e.g. Ethanol to Ethene to Polyethylene).
   * Target: Solve 5 practice exam problems without checking notes.

*Reward yourself with a 5-minute Pomodoro short recess after completing each stage!*`;
    }

    if (query.includes('motivate') || query.includes('motivation')) {
      const quotes = [
        "\"The beautiful thing about learning is that no one can take it away from you.\" — B.B. King 🌟",
        "\"An investment in knowledge pays the best interest.\" — Benjamin Franklin 💡",
        "\"It always seems impossible until it's done.\" — Nelson Mandela 🏆",
        "\"Scientists study the world as it is; engineers create the world that has never been.\" — Theodore von Kármán 🚀"
      ]
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
      return `### Academic Motivation Booster 🌟

Here is your focus reminder for today:

> ${randomQuote}

**Why this matters:**
Every study session, habit checked off, or flashcard flipped is building a neural path of capability. You aren't just memorizing formulas; you're developing high-level problem-solving muscles.

Take a deep breath, activate your **Focus Timer**, and let's crush the next session! ⚡`;
    }

    // Default response
    return `### I am ready to assist! 🤖

I couldn't quite resolve that query. Try one of these specific prompts:
*   Write **/explain useEffect** to learn React synchronization.
*   Write **/quiz physics** to launch an interactive recall test.
*   Write **/schedule chemistry** to receive structured syllabus plans.
*   Write **/motivate** for inspirational academic reminders.

Or type custom questions relating to programming or science!`;
  }

  // Quiz interactive click handlers
  const handleQuizAnswer = (messageId, questionIdx, optionIdx, isCorrect) => {
    const key = `${messageId}_${questionIdx}`
    setQuizAnswers(prev => ({
      ...prev,
      [key]: { optionIdx, isCorrect }
    }))
    if (isCorrect) {
      awardXp(5) // Bonus XP for correct quiz answer!
    }
  }

  // Helper to parse custom markdown headers and lists for premium chat bubbles
  const renderMessageText = (msg) => {
    const lines = msg.text.split('\n')
    
    // If it's a quiz, we can render custom interactive buttons for Questions
    if (msg.isQuiz && msg.sender === 'bot') {
      return renderInteractiveQuiz(msg)
    }

    return (
      <div className="space-y-2 text-sm leading-relaxed font-semibold">
        {lines.map((line, idx) => {
          // Headers
          if (line.startsWith('### ')) {
            return <h4 key={idx} className="text-base font-black text-slate-100 mt-2">{line.replace('### ', '')}</h4>
          }
          if (line.startsWith('#### ')) {
            return <h5 key={idx} className="text-xs font-black text-indigo-400 mt-2 uppercase tracking-wide">{line.replace('#### ', '')}</h5>
          }
          // Blockquotes
          if (line.startsWith('> ')) {
            return <blockquote key={idx} className="border-l-4 border-amber-500 pl-3 italic text-slate-300 bg-slate-950/40 py-2 rounded-r-xl my-2">{line.replace('> ', '')}</blockquote>
          }
          // Codeblocks (inline code matches)
          const codeMatch = line.match(/`([^`]+)`/g)
          if (codeMatch) {
            let parts = line.split(/`[^`]+`/g)
            let matches = line.match(/`([^`]+)`/g).map(m => m.replace(/`/g, ''))
            return (
              <p key={idx}>
                {parts.map((p, pIdx) => (
                  <span key={pIdx}>
                    {p}
                    {matches[pIdx] && (
                      <code className="bg-slate-950 text-indigo-400 px-1.5 py-0.5 rounded font-mono text-xs border border-white/5">{matches[pIdx]}</code>
                    )}
                  </span>
                ))}
              </p>
            )
          }

          return <p key={idx} className="text-slate-200">{line}</p>
        })}
      </div>
    )
  }

  const renderInteractiveQuiz = (msg) => {
    // The physics quiz contains Q1 and Q2. Let's hardcode the interactive buttons for high fidelity:
    const q1Key = `${msg.id}_1`
    const q2Key = `${msg.id}_2`

    const q1Ans = quizAnswers[q1Key]
    const q2Ans = quizAnswers[q2Key]

    return (
      <div className="space-y-4 text-sm leading-relaxed font-semibold">
        <h4 className="text-base font-black text-slate-100 mt-1 flex items-center gap-1.5">
          <Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
          <span>Interactive Physics Recall Quiz</span>
        </h4>

        {/* Q1 */}
        <div className="bg-slate-950/40 p-4 border border-white/5 rounded-2xl space-y-2">
          <p className="text-slate-100 text-xs font-bold uppercase tracking-wide text-indigo-400">Question 1</p>
          <p className="text-slate-200">What does the variable 'U' represent in thermodynamic equations?</p>
          
          <div className="space-y-1.5 mt-3">
            {[
              { text: '(A) Latent Heat Capacity', correct: false },
              { text: '(B) Internal Energy of the System', correct: true },
              { text: '(C) Coefficient of Friction', correct: false },
              { text: '(D) Universal Gas Constant', correct: false }
            ].map((opt, oIdx) => {
              const selected = q1Ans?.optionIdx === oIdx
              return (
                <button
                  key={oIdx}
                  disabled={q1Ans !== undefined}
                  onClick={() => handleQuizAnswer(msg.id, 1, oIdx, opt.correct)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    q1Ans === undefined 
                      ? 'bg-slate-900 border-slate-800 hover:border-indigo-500 text-slate-300' 
                      : selected 
                        ? opt.correct 
                          ? 'bg-emerald-950/20 border-emerald-500 text-emerald-400' 
                          : 'bg-rose-950/20 border-rose-500 text-rose-400'
                        : opt.correct
                          ? 'bg-emerald-950/10 border-emerald-900/40 text-emerald-500/80'
                          : 'bg-slate-900/30 border-slate-950 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{opt.text}</span>
                    {q1Ans !== undefined && opt.correct && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                  </div>
                </button>
              )
            })}
          </div>
          {q1Ans && (
            <p className={`text-[10px] font-bold ${q1Ans.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
              {q1Ans.isCorrect ? "Correct! +5 XP awarded! U is the symbol for Internal Energy." : "Incorrect! Option B was the correct answer. Study thermodynamics rules!"}
            </p>
          )}
        </div>

        {/* Q2 */}
        <div className="bg-slate-950/40 p-4 border border-white/5 rounded-2xl space-y-2">
          <p className="text-slate-100 text-xs font-bold uppercase tracking-wide text-indigo-400">Question 2</p>
          <p className="text-slate-200">In an isothermal process, what variable remains constant?</p>
          
          <div className="space-y-1.5 mt-3">
            {[
              { text: '(A) Pressure (P)', correct: false },
              { text: '(B) Volume (V)', correct: false },
              { text: '(C) Temperature (T)', correct: true },
              { text: '(D) Entropy (S)', correct: false }
            ].map((opt, oIdx) => {
              const selected = q2Ans?.optionIdx === oIdx
              return (
                <button
                  key={oIdx}
                  disabled={q2Ans !== undefined}
                  onClick={() => handleQuizAnswer(msg.id, 2, oIdx, opt.correct)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    q2Ans === undefined 
                      ? 'bg-slate-900 border-slate-800 hover:border-indigo-500 text-slate-300' 
                      : selected 
                        ? opt.correct 
                          ? 'bg-emerald-950/20 border-emerald-500 text-emerald-400' 
                          : 'bg-rose-950/20 border-rose-500 text-rose-400'
                        : opt.correct
                          ? 'bg-emerald-950/10 border-emerald-900/40 text-emerald-500/80'
                          : 'bg-slate-900/30 border-slate-950 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{opt.text}</span>
                    {q2Ans !== undefined && opt.correct && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                  </div>
                </button>
              )
            })}
          </div>
          {q2Ans && (
            <p className={`text-[10px] font-bold ${q2Ans.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
              {q2Ans.isCorrect ? "Correct! +5 XP awarded! 'Iso' = same, 'thermal' = temperature (T)." : "Incorrect! Option C was the correct answer. Temperature remains constant."}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-3xl p-6 md:p-8 shadow-xl flex flex-col h-[calc(100vh-14rem)] md:h-[calc(100vh-18rem)] min-h-[500px]">
      
      {/* HEADER INFO */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="bg-indigo-950 text-indigo-400 p-2.5 rounded-xl border border-indigo-900/40">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-150 leading-none">StudyBuddy AI Coach</h3>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-1 leading-none">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" /> Online & Responsive
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            if (window.confirm("Do you want to reset your study assistant chat history?")) {
              setMessages(initialMessages)
              setQuizAnswers({})
            }
          }}
          className="text-xs text-slate-500 hover:text-slate-350 font-bold border border-slate-800 bg-slate-900/40 px-3 py-1.5 rounded-xl transition-all"
        >
          Clear Logs
        </button>
      </div>

      {/* CHAT CHANNELS DISPLAY */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot'
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-[85%] ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div className={`h-8 w-8 rounded-xl flex items-center justify-center border text-xs flex-shrink-0 mt-0.5 ${
                isBot 
                  ? 'bg-indigo-950 border-indigo-900/50 text-indigo-400 shadow-md shadow-indigo-950/20' 
                  : 'bg-violet-950 border-violet-900/50 text-violet-400 shadow-md shadow-violet-950/20'
              }`}>
                {isBot ? <Bot className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
              </div>

              {/* Message Bubble */}
              <div className={`p-4 rounded-2xl ${
                isBot 
                  ? 'bg-slate-900/60 border border-slate-850/60 text-slate-200 rounded-tl-sm shadow-md' 
                  : 'bg-indigo-600 text-white rounded-tr-sm shadow-lg shadow-indigo-650/15'
              }`}>
                {isBot ? renderMessageText(msg) : <p className="text-sm font-semibold whitespace-pre-wrap leading-relaxed">{msg.text}</p>}
                
                <span className={`text-[9px] font-bold block mt-2 text-right ${isBot ? 'text-slate-600' : 'text-indigo-200'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          )
        })}

        {/* Typing bubble */}
        {isTyping && (
          <div className="flex items-start gap-3 mr-auto max-w-[85%] animate-pulse">
            <div className="h-8 w-8 rounded-xl bg-indigo-950 border border-indigo-900/50 text-indigo-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
              <Bot className="h-4.5 w-4.5" />
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-850/60 rounded-2xl rounded-tl-sm flex items-center space-x-1.5 h-11">
              <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce" />
              <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* QUICK COMMANDS CARDS */}
      <div className="py-2.5 border-t border-slate-850 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5 pr-1 flex-shrink-0">
          <HelpCircle className="h-3.5 w-3.5 text-indigo-500" /> Quick Ask:
        </span>
        {quickCommands.map((cmd) => (
          <button
            key={cmd.text}
            onClick={() => handleSendCommand(cmd.text)}
            className="px-3.5 py-1.5 bg-slate-900/60 hover:bg-indigo-950/20 border border-slate-800 hover:border-indigo-550/30 text-slate-350 hover:text-indigo-400 rounded-full text-xs font-bold transition-all active:scale-95 flex-shrink-0 cursor-pointer"
          >
            {cmd.label}
          </button>
        ))}
      </div>

      {/* INPUT FIELD ROW */}
      <div className="flex gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
        <input
          type="text"
          placeholder="Ask a custom question or type a shortcut command..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendCommand(inputValue)}
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-800 bg-slate-900/60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-slate-100"
        />
        <button
          onClick={() => handleSendCommand(inputValue)}
          className="bg-indigo-650 hover:bg-indigo-600 text-white p-3.5 rounded-2xl font-bold active:scale-95 transition-all shadow-md shadow-indigo-650/10 flex items-center justify-center"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>

    </div>
  )
}
