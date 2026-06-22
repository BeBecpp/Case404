import { rankForXp, nextRank } from '../utils/progress.js'

// Compact rank + XP indicator with a thin progress bar to the next rank.
// `compact` trims it down for the navbar.
export default function ProgressBadge({ xp, compact = false }) {
  const rank = rankForXp(xp)
  const next = nextRank(xp)
  const span = next ? next.min - rank.min : 1
  const pct = next
    ? Math.min(100, Math.round(((xp - rank.min) / span) * 100))
    : 100

  return (
    <div
      className={
        'rounded-lg border border-signal-cyan/20 bg-ink-900/70 ' +
        (compact ? 'px-3 py-1.5' : 'px-4 py-3')
      }
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={
            'font-mono text-signal-cyan ' + (compact ? 'text-xs' : 'text-sm')
          }
        >
          {rank.name}
        </span>
        <span
          className={
            'font-mono text-slate-400 ' + (compact ? 'text-xs' : 'text-sm')
          }
        >
          {xp} XP
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-signal-cyan to-signal-green transition-all duration-500"
          style={{ width: pct + '%' }}
        />
      </div>
      {!compact && (
        <p className="mt-1.5 font-mono text-[11px] text-slate-500">
          {next
            ? `${next.min - xp} XP to ${next.name}`
            : 'Max rank reached — Elite Case Breaker'}
        </p>
      )}
    </div>
  )
}
