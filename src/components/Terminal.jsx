import { useEffect, useRef, useState } from 'react'
import { runCommand, TONES } from '../utils/terminalEngine.js'

const PROMPT = 'operator@case404:~$'

// Simulated terminal. Never runs real commands — every result comes from
// runCommand() over the active mission data. Up/Down = history. The `history`
// command reads the same command log. Correct submit -> onSolved; wrong
// submit -> onWrongAttempt (−5 XP).
export default function Terminal({ mission, onSolved, onWrongAttempt }) {
  const initialLines = () => [
    {
      text: `Loaded case #${String(mission.id).padStart(3, '0')} — ${mission.title}`,
      tone: 'accent',
    },
    { text: "Type 'help' for commands. Try: ls", tone: 'muted' },
  ]

  const [history, setHistory] = useState(initialLines)
  const [value, setValue] = useState('')
  const [cmdLog, setCmdLog] = useState([])
  const [logIndex, setLogIndex] = useState(-1)
  const [busy, setBusy] = useState(false)

  const cmdLogRef = useRef([]) // mirror for passing into the engine synchronously
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  // Reset console when switching missions.
  useEffect(() => {
    setHistory(initialLines())
    setCmdLog([])
    cmdLogRef.current = []
    setLogIndex(-1)
    setValue('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mission.id])

  // Autoscroll to newest line.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [history])

  async function execute(input) {
    const echo = { text: `${PROMPT} ${input}`, tone: 'prompt' }
    setBusy(true)

    // Pass the command history *before* this command to the engine.
    const result = await runCommand(input, mission, { history: cmdLogRef.current })

    // Record into the log after running (so `history` shows prior commands).
    cmdLogRef.current = [...cmdLogRef.current, input]
    setCmdLog(cmdLogRef.current)

    if (result.action?.kind === 'clear') {
      setHistory([])
      setBusy(false)
      return
    }

    setHistory((prev) => [...prev, echo, ...result.output])

    if (result.action?.kind === 'submit') {
      if (result.action.correct) onSolved?.()
      else onWrongAttempt?.()
    }
    setBusy(false)
  }

  function onSubmit(e) {
    e.preventDefault()
    const input = value.trim()
    if (!input || busy) return
    setLogIndex(-1)
    setValue('')
    execute(input)
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (cmdLog.length === 0) return
      const idx = logIndex === -1 ? cmdLog.length - 1 : Math.max(0, logIndex - 1)
      setLogIndex(idx)
      setValue(cmdLog[idx])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (logIndex === -1) return
      const idx = logIndex + 1
      if (idx >= cmdLog.length) {
        setLogIndex(-1)
        setValue('')
      } else {
        setLogIndex(idx)
        setValue(cmdLog[idx])
      }
    }
  }

  return (
    <div className="scanlines relative flex h-full min-h-[26rem] flex-col overflow-hidden rounded-xl border border-signal-cyan/20 bg-ink-950 shadow-glow">
      <div className="flex items-center gap-2 border-b border-signal-cyan/10 bg-ink-900/80 px-4 py-2">
        <span className="h-3 w-3 rounded-full bg-alert/70" />
        <span className="h-3 w-3 rounded-full bg-amber/70" />
        <span className="h-3 w-3 rounded-full bg-signal-green/70" />
        <span className="ml-2 font-mono text-xs text-slate-500">
          operator console — case #{String(mission.id).padStart(3, '0')}
        </span>
      </div>

      <div
        ref={scrollRef}
        onClick={() => inputRef.current?.focus()}
        className="flex-1 cursor-text overflow-auto p-4 font-mono text-[13px] leading-relaxed"
      >
        {history.map((l, i) => (
          <div
            key={i}
            className={
              l.tone === 'prompt' ? 'text-slate-400' : TONES[l.tone] || TONES.normal
            }
          >
            {l.text === '' ? '\u00a0' : l.text}
          </div>
        ))}
        {busy && <div className="text-slate-500">…</div>}
      </div>

      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 border-t border-signal-cyan/10 bg-ink-900/60 px-4 py-3 font-mono text-[13px]"
      >
        <span className="shrink-0 text-signal-green">{PROMPT}</span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          aria-label="terminal command input"
          className="w-full bg-transparent text-slate-100 caret-signal-cyan outline-none placeholder:text-slate-600"
          placeholder="type a command…"
        />
      </form>
    </div>
  )
}
