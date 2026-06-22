import { useState } from 'react'

// Read-only viewer for the active mission's evidence files. Clicking a file
// name expands its content inline. This mirrors what `ls` / `cat` show in the
// terminal, for players who prefer clicking over typing.
export default function EvidenceViewer({ files }) {
  const names = Object.keys(files || {})
  const [openName, setOpenName] = useState(names[0] || null)

  return (
    <div>
      <ul className="space-y-1.5">
        {names.map((name) => {
          const active = name === openName
          return (
            <li key={name}>
              <button
                type="button"
                onClick={() => setOpenName(active ? null : name)}
                className={
                  'flex w-full items-center gap-2 rounded-md border px-3 py-2 font-mono text-sm transition-colors ' +
                  (active
                    ? 'border-signal-cyan/40 bg-ink-800 text-signal-cyan'
                    : 'border-slate-800 bg-ink-900/50 text-slate-300 hover:border-signal-cyan/30 hover:text-slate-100')
                }
              >
                <span aria-hidden>{active ? '▾' : '▸'}</span>
                <span aria-hidden className="text-slate-500">
                  ▦
                </span>
                {name}
              </button>
              {active && (
                <pre className="mt-1.5 max-h-72 overflow-auto rounded-md border border-slate-800 bg-ink-950 p-3 font-mono text-[12.5px] leading-relaxed text-slate-300">
                  {String(files[name])}
                </pre>
              )}
            </li>
          )
        })}
      </ul>
      {names.length === 0 && (
        <p className="font-mono text-sm text-slate-500">
          No evidence files attached to this case.
        </p>
      )}
    </div>
  )
}
