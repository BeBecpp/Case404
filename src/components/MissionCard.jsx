import { useNavigate } from 'react-router-dom'

const difficultyBadge = {
  Easy: 'text-signal-green border-signal-green/40 bg-signal-green/5',
  Medium: 'text-amber border-amber/40 bg-amber/5',
  Hard: 'text-alert border-alert/40 bg-alert/5',
  Boss: 'text-fuchsia-300 border-fuchsia-400/50 bg-fuchsia-500/10',
}

const statusStyles = {
  Solved: 'text-signal-green border-signal-green/40',
  Available: 'text-signal-cyan border-signal-cyan/40',
  Locked: 'text-slate-500 border-slate-700',
}

export default function MissionCard({ mission, status, score, hintsUsed, lockReason }) {
  const navigate = useNavigate()
  const locked = status === 'Locked'
  const solved = status === 'Solved'
  const isBoss = mission.difficulty === 'Boss'

  const open = () => {
    if (!locked) navigate('/mission/' + mission.id)
  }

  return (
    <button
      type="button"
      onClick={open}
      disabled={locked}
      aria-disabled={locked}
      className={
        'group relative flex w-full flex-col rounded-xl border p-5 text-left transition-all duration-300 ' +
        (locked
          ? 'cursor-not-allowed border-slate-800 bg-ink-900/40 opacity-60'
          : isBoss
          ? 'border-fuchsia-500/25 bg-ink-900/60 hover:-translate-y-1 hover:border-fuchsia-400/60 hover:shadow-[0_0_26px_-6px_rgba(232,121,249,0.45)]'
          : 'border-signal-cyan/15 bg-ink-900/60 hover:-translate-y-1 hover:border-signal-cyan/50 hover:shadow-glow')
      }
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
          {isBoss ? 'BOSS' : 'Case'} #{String(mission.id).padStart(3, '0')}
        </span>
        <span
          className={
            'rounded-full border px-2.5 py-0.5 font-mono text-[11px] ' +
            statusStyles[status]
          }
        >
          {locked && (
            <span aria-hidden className="mr-1">
              ▣
            </span>
          )}
          {status}
        </span>
      </div>

      <h3
        className={
          'mt-3 font-mono text-lg font-semibold ' +
          (isBoss
            ? 'text-fuchsia-200 group-hover:text-fuchsia-100'
            : 'text-slate-100 group-hover:text-signal-cyan')
        }
      >
        {mission.title}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-400 line-clamp-3">
        {mission.story}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-slate-700/60 bg-ink-800 px-2 py-0.5 font-mono text-[11px] text-slate-300">
          {mission.category}
        </span>
        <span
          className={
            'rounded-md border px-2 py-0.5 font-mono text-[11px] ' +
            difficultyBadge[mission.difficulty]
          }
        >
          {mission.difficulty}
        </span>
        <span className="ml-auto font-mono text-sm text-signal-green">
          {mission.xp} XP
        </span>
      </div>

      {/* footer line: solved score / unlock requirement / open prompt */}
      {solved ? (
        <div className="mt-4 flex items-center justify-between font-mono text-xs">
          <span className="text-signal-green">
            Score {score ?? mission.xp}
          </span>
          <span className="text-slate-500">
            {hintsUsed ? `${hintsUsed} hint${hintsUsed > 1 ? 's' : ''} used` : 'no hints'}
          </span>
        </div>
      ) : locked ? (
        <span className="mt-4 font-mono text-xs text-slate-600">{lockReason}</span>
      ) : (
        <span
          className={
            'mt-4 font-mono text-xs ' +
            (isBoss ? 'text-fuchsia-300/80' : 'text-signal-cyan/70 group-hover:text-signal-cyan')
          }
        >
          Open case →
        </span>
      )}
    </button>
  )
}
