import { useEffect, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// DARK-AI is a LOCAL, SIMULATED assistant. No AI service, no network. It only
// reveals the mission's predefined hints, one level at a time, with a fake
// "Analyzing evidence..." delay. Each revealed hint costs 10 XP, tracked via
// `revealedCount` (persisted by the parent) and the onUseHint callback.
// ---------------------------------------------------------------------------

const LEVEL_LABELS = ['Hint 1 · vague', 'Hint 2 · useful', 'Hint 3 · almost there']

export default function HintAssistant({ mission, revealedCount = 0, solved, onUseHint }) {
  const [revealed, setRevealed] = useState(revealedCount)
  const [analyzing, setAnalyzing] = useState(false)
  const timerRef = useRef(null)

  // Sync with persisted count when switching missions.
  useEffect(() => {
    setRevealed(revealedCount)
    setAnalyzing(false)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [mission.id, revealedCount])

  useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), [])

  const total = mission.hints.length

  function requestHint() {
    if (analyzing || revealed >= total) return
    setAnalyzing(true)
    timerRef.current = setTimeout(() => {
      setRevealed((n) => n + 1)
      if (!solved) onUseHint?.() // -10 XP, persisted by parent
      setAnalyzing(false)
    }, 850)
  }

  return (
    <div className="rounded-xl border border-signal-green/20 bg-ink-900/60 p-4">
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-md border border-signal-green/40 bg-ink-950 font-mono text-signal-green">
          <span className="animate-flicker">◈</span>
        </span>
        <div className="leading-tight">
          <p className="font-mono text-sm font-semibold text-signal-green">DARK-AI</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            local · simulated · no network
          </p>
        </div>
        <span className="ml-auto font-mono text-[11px] text-amber">−10 XP / hint</span>
      </div>

      <div className="mt-4 space-y-2">
        {Array.from({ length: Math.min(revealed, total) }).map((_, i) => (
          <div
            key={i}
            className="animate-fade-up rounded-lg border border-slate-800 bg-ink-950/70 p-3"
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-signal-green/70">
              {LEVEL_LABELS[i] || `Hint ${i + 1}`}
            </p>
            <p className="mt-1 text-sm text-slate-300">{mission.hints[i]}</p>
          </div>
        ))}

        {analyzing && (
          <div className="rounded-lg border border-slate-800 bg-ink-950/70 p-3">
            <p className="font-mono text-sm text-signal-green">
              Analyzing evidence
              <span className="animate-blink">_</span>
            </p>
          </div>
        )}

        {revealed === 0 && !analyzing && (
          <p className="text-sm text-slate-500">
            Stuck? Request a hint. DARK-AI reveals clues from vague to
            almost-solution — each one trims your score.
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={requestHint}
          disabled={analyzing || revealed >= total}
          className={
            'rounded-lg border px-3 py-2 font-mono text-xs transition-colors ' +
            (revealed >= total
              ? 'cursor-not-allowed border-slate-800 text-slate-600'
              : 'border-signal-green/40 text-signal-green hover:bg-signal-green/10')
          }
        >
          {revealed >= total ? 'All hints revealed' : 'Request hint'}
        </button>
        <span className="font-mono text-xs text-slate-500">
          {Math.min(revealed, total)}/{total}
        </span>
      </div>
    </div>
  )
}
