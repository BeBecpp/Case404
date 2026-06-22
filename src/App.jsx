import { useCallback, useMemo, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Mission from './pages/Mission.jsx'
import Profile from './pages/Profile.jsx'
import {
  loadState,
  saveState,
  resetState,
  applySolve,
  recordHint,
  recordWrongAttempt,
  totalXp,
} from './utils/progress.js'
import { getMissionById } from './data/missions.js'

export default function App() {
  const [state, setState] = useState(() => loadState())

  const persist = useCallback((next) => {
    setState(next)
    saveState(next)
  }, [])

  const solveMission = useCallback(
    (missionId) => {
      const mission = getMissionById(missionId)
      if (!mission) return { gainedXp: 0, breakdown: null, newAchievements: [] }
      const result = applySolve(state, mission)
      persist(result.state)
      return {
        gainedXp: result.gainedXp,
        breakdown: result.breakdown,
        newAchievements: result.newAchievements,
      }
    },
    [state, persist]
  )

  const saveNote = useCallback(
    (missionId, text) =>
      persist({ ...state, notes: { ...state.notes, [missionId]: text } }),
    [state, persist]
  )

  const noteHintUsed = useCallback(
    (missionId) => persist(recordHint(state, missionId)),
    [state, persist]
  )

  const noteWrongAttempt = useCallback(
    (missionId) => persist(recordWrongAttempt(state, missionId)),
    [state, persist]
  )

  const reset = useCallback(() => persist(resetState()), [persist])

  const xp = totalXp(state)

  const ctx = useMemo(
    () => ({ state, xp, solveMission, saveNote, noteHintUsed, noteWrongAttempt, reset }),
    [state, xp, solveMission, saveNote, noteHintUsed, noteWrongAttempt, reset]
  )

  return (
    <>
      <div className="bg-lab" aria-hidden />
      <Navbar xp={xp} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Routes>
          <Route path="/" element={<Home ctx={ctx} />} />
          <Route path="/mission/:id" element={<Mission ctx={ctx} />} />
          <Route path="/profile" element={<Profile ctx={ctx} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6">
        <p className="border-t border-signal-cyan/10 pt-4 text-center font-mono text-[11px] text-slate-600">
          Case404 · Cyber Detective Lab · Season 1 · built by NOtFound_404 · all
          cases are fictional, local, and safe — no real systems, no network, no AI.
        </p>
      </footer>
    </>
  )
}
