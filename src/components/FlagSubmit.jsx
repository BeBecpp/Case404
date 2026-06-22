import { useEffect, useState } from 'react'
import { checkFlag } from '../utils/flagChecker.js'

// Flag submission. Correct -> onSolved(); wrong -> onWrongAttempt() (−5 XP).
export default function FlagSubmit({ mission, solved, onSolved, onWrongAttempt }) {
  const [value, setValue] = useState('')
  const [feedback, setFeedback] = useState(null) // 'correct' | 'wrong' | null

  useEffect(() => {
    setValue('')
    setFeedback(null)
  }, [mission.id])

  function submit(e) {
    e.preventDefault()
    const flag = value.trim()
    if (!flag) return
    if (checkFlag(flag, mission.flag)) {
      setFeedback('correct')
      onSolved?.()
    } else {
      setFeedback('wrong')
      if (!solved) onWrongAttempt?.()
    }
  }

  return (
    <div className="rounded-xl border border-signal-cyan/20 bg-ink-900/60 p-4">
      <h3 className="font-mono text-sm font-semibold text-slate-200">Submit Flag</h3>
      <p className="mt-1 font-mono text-[11px] text-slate-500">
        format: NOtFound404{'{...}'} · wrong attempt = −5 XP
      </p>

      <form onSubmit={submit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setFeedback(null)
          }}
          spellCheck={false}
          autoComplete="off"
          aria-label="flag input"
          placeholder="NOtFound404{...}"
          className="w-full rounded-lg border border-slate-800 bg-ink-950 px-3 py-2 font-mono text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-signal-cyan/50"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg border border-signal-cyan/40 bg-signal-cyan/10 px-4 py-2 font-mono text-sm text-signal-cyan transition-colors hover:bg-signal-cyan/20"
        >
          Submit
        </button>
      </form>

      {feedback === 'correct' && (
        <p className="mt-3 animate-fade-up font-mono text-sm text-signal-green">
          ✓ Flag accepted — case closed.
        </p>
      )}
      {feedback === 'wrong' && (
        <p className="mt-3 animate-fade-up font-mono text-sm text-alert">
          ✗ Flag rejected — keep investigating. (−5 XP)
        </p>
      )}
      {solved && feedback !== 'correct' && (
        <p className="mt-3 font-mono text-sm text-signal-green/80">✓ Already solved.</p>
      )}
    </div>
  )
}
