import { useEffect, useRef, useState } from 'react'

// Per-mission scratchpad. Notes persist via the parent's onSave (localStorage).
// Saves are debounced so we don't write on every keystroke.
export default function NotesPanel({ missionId, initialValue, onSave }) {
  const [text, setText] = useState(initialValue || '')
  const [saved, setSaved] = useState(false)
  const timerRef = useRef(null)

  // Load the right note when switching missions.
  useEffect(() => {
    setText(initialValue || '')
  }, [missionId, initialValue])

  useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), [])

  function handleChange(e) {
    const next = e.target.value
    setText(next)
    setSaved(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onSave(missionId, next)
      setSaved(true)
    }, 500)
  }

  return (
    <div className="rounded-xl border border-signal-cyan/15 bg-ink-900/60 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-sm font-semibold text-slate-200">
          Case Notes
        </h3>
        <span className="font-mono text-[11px] text-slate-500">
          {saved ? 'saved ✓' : 'autosaves locally'}
        </span>
      </div>
      <textarea
        value={text}
        onChange={handleChange}
        rows={6}
        spellCheck={false}
        placeholder="Track suspects, IPs, decoded strings, theories…"
        className="mt-3 w-full resize-y rounded-lg border border-slate-800 bg-ink-950 p-3 font-mono text-[13px] leading-relaxed text-slate-200 outline-none placeholder:text-slate-600 focus:border-signal-cyan/40"
      />
    </div>
  )
}
