import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getMissionById } from '../data/missions.js'
import {
  isMissionUnlocked,
  unlockRequirement,
  scoreBreakdown,
} from '../utils/progress.js'
import EvidenceViewer from '../components/EvidenceViewer.jsx'
import Terminal from '../components/Terminal.jsx'
import HintAssistant from '../components/HintAssistant.jsx'
import NotesPanel from '../components/NotesPanel.jsx'
import FlagSubmit from '../components/FlagSubmit.jsx'

const difficultyColor = {
  Easy: 'text-signal-green',
  Medium: 'text-amber',
  Hard: 'text-alert',
  Boss: 'text-fuchsia-300',
}

export default function Mission({ ctx }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, solveMission, saveNote, noteHintUsed, noteWrongAttempt } = ctx

  const mission = getMissionById(id)
  const solved = mission ? state.solved.includes(mission.id) : false
  const [justSolved, setJustSolved] = useState(null)

  useEffect(() => {
    setJustSolved(null)
  }, [id])

  if (!mission) {
    return (
      <Notice title="Case not found" body="That case file does not exist." />
    )
  }
  if (!isMissionUnlocked(mission, state)) {
    return (
      <Notice
        title="Case locked"
        body={unlockRequirement(mission, state) + ' to open this case.'}
      />
    )
  }

  const hintsUsed = state.hints[mission.id] || 0
  const attempts = state.attempts[mission.id] || 0
  const storedScore = state.scores[mission.id]
  // Live preview of what the score would be right now (before solving).
  const preview = scoreBreakdown(mission, hintsUsed, attempts)

  function handleSolved() {
    const res = solveMission(mission.id)
    if (res.gainedXp > 0) setJustSolved(res)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/" className="font-mono text-xs text-slate-500 hover:text-signal-cyan">
            ← all cases
          </Link>
          <h1 className="mt-1 font-mono text-2xl font-bold text-slate-100 sm:text-3xl">
            <span className="text-slate-500">#{String(mission.id).padStart(3, '0')}</span>{' '}
            {mission.title}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="rounded-md border border-slate-700/60 bg-ink-800 px-2.5 py-1 text-slate-300">
            {mission.category}
          </span>
          <span
            className={
              'rounded-md border border-slate-700/60 bg-ink-800 px-2.5 py-1 ' +
              difficultyColor[mission.difficulty]
            }
          >
            {mission.difficulty}
          </span>
          <span className="rounded-md border border-signal-green/30 bg-signal-green/5 px-2.5 py-1 text-signal-green">
            {mission.xp} XP
          </span>
          {!solved && (
            <span className="rounded-md border border-slate-700/60 px-2.5 py-1 text-slate-400">
              live score: {preview.total}
            </span>
          )}
          {solved && storedScore && (
            <span className="rounded-md border border-signal-green/40 px-2.5 py-1 text-signal-green">
              Solved ✓ · {storedScore.score} XP
            </span>
          )}
        </div>
      </div>

      {/* Solve banner + score breakdown + explanation */}
      {(justSolved || solved) && (
        <div className="animate-fade-up rounded-xl border border-signal-green/30 bg-signal-green/5 p-5 shadow-glow-green">
          <h2 className="font-mono text-lg font-semibold text-signal-green">
            ✓ Case Closed
          </h2>

          {(justSolved?.breakdown || storedScore) && (
            <div className="mt-3 max-w-sm rounded-lg border border-slate-800 bg-ink-950/60 p-3 font-mono text-xs">
              {(justSolved?.breakdown?.rows ||
                scoreBreakdown(mission, storedScore.hintsUsed, storedScore.attempts).rows).map(
                (r, i) => (
                  <div key={i} className="flex justify-between text-slate-400">
                    <span>{r.label}</span>
                    <span className={r.value < 0 ? 'text-alert' : 'text-slate-300'}>
                      {r.value > 0 ? '+' : ''}
                      {r.value}
                    </span>
                  </div>
                )
              )}
              <div className="mt-1.5 flex justify-between border-t border-slate-800 pt-1.5 text-signal-green">
                <span>Final score</span>
                <span>
                  {justSolved?.breakdown?.total ?? storedScore.score} XP
                </span>
              </div>
            </div>
          )}

          {justSolved?.newAchievements?.length > 0 && (
            <p className="mt-3 font-mono text-sm text-signal-green/80">
              🏅 Unlocked: {justSolved.newAchievements.length} achievement
              {justSolved.newAchievements.length > 1 ? 's' : ''}
            </p>
          )}

          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            <span className="font-semibold text-slate-200">How it solved: </span>
            {mission.explanation}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <NextCaseButton mission={mission} navigate={navigate} />
            <Link
              to="/profile"
              className="rounded-lg border border-slate-700 px-4 py-2 font-mono text-xs text-slate-300 hover:border-signal-cyan/40 hover:text-signal-cyan"
            >
              View profile →
            </Link>
          </div>
        </div>
      )}

      {/* 3-panel workspace */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left */}
        <div className="space-y-5 lg:col-span-3">
          <Panel title="Briefing">
            <p className="text-sm leading-relaxed text-slate-300">{mission.story}</p>
          </Panel>
          <Panel title="Objective" accent>
            <p className="text-sm leading-relaxed text-slate-200">{mission.objective}</p>
          </Panel>
          <Panel title="Evidence">
            <EvidenceViewer files={mission.files} />
          </Panel>
          <Panel title="Recommended commands">
            <ul className="space-y-1">
              {mission.recommendedCommands.map((c, i) => (
                <li
                  key={i}
                  className="rounded-md border border-slate-800 bg-ink-950 px-2.5 py-1.5 font-mono text-[12px] text-signal-cyan/90"
                >
                  {c}
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* Center */}
        <div className="lg:col-span-5">
          <Terminal
            mission={mission}
            onSolved={handleSolved}
            onWrongAttempt={() => noteWrongAttempt(mission.id)}
          />
          <p className="mt-2 font-mono text-[11px] text-slate-600">
            Simulated console — runs no real commands and reads only this case's evidence.
          </p>
        </div>

        {/* Right */}
        <div className="space-y-5 lg:col-span-4">
          <FlagSubmit
            mission={mission}
            solved={solved}
            onSolved={handleSolved}
            onWrongAttempt={() => noteWrongAttempt(mission.id)}
          />
          <HintAssistant
            mission={mission}
            revealedCount={hintsUsed}
            solved={solved}
            onUseHint={() => noteHintUsed(mission.id)}
          />
          <NotesPanel
            missionId={mission.id}
            initialValue={state.notes[mission.id] || ''}
            onSave={saveNote}
          />
        </div>
      </div>
    </div>
  )
}

function Panel({ title, children, accent = false }) {
  return (
    <section
      className={
        'rounded-xl border bg-ink-900/60 p-4 ' +
        (accent ? 'border-signal-cyan/25' : 'border-slate-800')
      }
    >
      <h3 className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
        {title}
      </h3>
      {children}
    </section>
  )
}

function NextCaseButton({ mission, navigate }) {
  const next = getMissionById(mission.id + 1)
  if (!next) {
    return (
      <button
        type="button"
        onClick={() => navigate('/profile')}
        className="rounded-lg border border-signal-cyan/40 bg-signal-cyan/10 px-4 py-2 font-mono text-xs text-signal-cyan hover:bg-signal-cyan/20"
      >
        Season complete — see your rank →
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={() => navigate('/mission/' + next.id)}
      className="rounded-lg border border-signal-cyan/40 bg-signal-cyan/10 px-4 py-2 font-mono text-xs text-signal-cyan hover:bg-signal-cyan/20"
    >
      Next case: {next.title} →
    </button>
  )
}

function Notice({ title, body }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-signal-cyan/20 bg-ink-900/60 p-8 text-center">
      <h1 className="font-mono text-xl font-semibold text-slate-100">{title}</h1>
      <p className="mt-2 text-sm text-slate-400">{body}</p>
      <Link
        to="/"
        className="mt-5 inline-block rounded-lg border border-signal-cyan/40 px-4 py-2 font-mono text-sm text-signal-cyan hover:bg-signal-cyan/10"
      >
        Back to cases
      </Link>
    </div>
  )
}
