# Case404 — Cyber Detective Lab (v2 · Season 1)

> Solve fictional cyber cases. Learn CTF thinking. Become the operator.
> Built by **NOtFound_404**.

Case404 is a dark, polished, fully offline CTF-style detective game. Read
evidence, work a **simulated** operator terminal, decode ciphers, take notes,
and close each case by submitting the right flag. Progress, XP, ranks, scores,
and achievements are saved in your browser.

**Season 1** expands the lab to **25 cases** across **10 categories** and **four
difficulty tiers** (Easy / Medium / Hard / Boss), with a real scoring system and
two multi-step boss finales.

## Safety note (read me)

Everything in Case404 is **fictional, local, and safe**:

- No backend, no database, no external API, and **no AI service** of any kind.
- The terminal is a **simulation** — it executes no real system commands, opens
  no network connection, and reads no real files. Every result is computed in
  the browser from the active mission's data in `src/data/missions.js`.
- No real IPs, domains, targets, credentials, malware, or exploits. Logs, JSON,
  ciphers, and "metadata" are invented teaching props.
- "DARK-AI" is a clearly-labelled **local simulated** hint assistant. It only
  reveals predefined hints — not connected to any model or network.

This is an educational toy for practicing CTF problem-solving patterns.

## Tech stack

- **React 18** + **React Router 6**
- **Vite 5**
- **Tailwind CSS 3**
- **JavaScript** (no TypeScript)
- **localStorage** for progress, scores, notes, and achievements
- **Web Crypto API** for the `hash` command (SHA-256)
- Local JS mission data only

## Install & run

```bash
npm install
npm run dev
```

Open the printed URL (default http://localhost:5173). Works fully offline after
`npm install`.

Production build:

```bash
npm run build
npm run preview
```

## What's new in v2

- **25 missions**: 8 Easy, 10 Medium, 5 Hard, 2 Boss.
- **Difficulty tiers** with distinct badges (Boss has its own look).
- **Expanded terminal** — 21 simulated commands (see below).
- **Scoring with penalties**: hints and wrong attempts cost XP; no-hint and boss
  bonuses reward clean solves.
- **Filtering & search** on the Home page (difficulty, category, title).
- **Boss cases** with multi-step flags assembled from several files.
- **Richer Profile**: completion %, best scores, 10 achievements, rank ladder.
- A live **score breakdown** after each solve.

## Scoring

```
score = baseXP
        − 10 × hints used
        − 5  × wrong flag attempts
        + 25 if solved with no hints
        + 100 if it is a Boss case
score is clamped to a minimum of 25
```

Total XP = the sum of your per-mission scores (so it never drifts).

### Ranks

| XP | Rank |
| --- | --- |
| 0 | Rookie Analyst |
| 100 | Junior Detective |
| 300 | Cyber Investigator |
| 700 | NOtFound_404 Operator |
| 1200 | Threat Hunter |
| 2000 | Elite Case Breaker |
| 3000 | Case404 Master |

### Achievements

First Case Solved · No Hint Solver · Crypto Beginner · Log Hunter ·
Pattern Finder · Web Logic Analyst · Boss Breaker · 10 Cases Solved ·
25 Cases Solved · Perfect Operator

## Unlock logic

- Case 1 is unlocked by default.
- Easy cases unlock sequentially.
- Medium cases unlock after solving **5 Easy** cases.
- Hard cases unlock after solving **6 Medium** cases.
- Boss 1 unlocks after solving **3 Hard** cases.
- Boss 2 unlocks after solving **Boss 1**.

## Terminal commands

| Command | Description |
| --- | --- |
| `help` | List commands |
| `ls` | List evidence files |
| `cat <file>` | Print a file |
| `head <file>` / `tail <file>` | First / last 10 lines |
| `wc <file>` | Count lines / words / chars |
| `grep <keyword> <file>` | Lines containing the keyword |
| `find <keyword>` | Search the keyword across **all** files |
| `strings <file>` | Printable strings from noisy/binary data |
| `sort <file>` / `uniq <file>` | Sort lines / collapse adjacent duplicates |
| `jsonget <file> <path>` | Read a dot path, e.g. `users.2.name` |
| `decode base64 <text>` | Base64 decode |
| `hexdecode <text>` | Hex → text |
| `urldecode <text>` | Percent-decode |
| `rot13 <text>` | ROT13 |
| `caesar <text> <shift>` | Shift letters **backward** |
| `xor <hexOrText> <key>` | XOR with a repeating key |
| `hash <text>` | SHA-256 via Web Crypto |
| `history` | Show command history |
| `submit <FLAG>` | Submit a flag |
| `clear` | Clear the console |

Prompt: `operator@case404:~$` · Up/Down arrows recall history.

All commands are simulated in the browser and can only touch the **current
mission's** files. No real command execution. No network access.

## Architecture

Case404 is a pure frontend app — no server runtime. All logic (mission data,
command parsing, flag checking, scoring, progress) runs in the browser.

```
src/
  data/missions.js        # 25 fictional cases (single source of truth)
  utils/
    terminalEngine.js     # simulated command processor (21 commands)
    progress.js           # scoring, ranks, unlock logic, achievements
    flagChecker.js        # flag comparison
  pages/
    Home.jsx              # hero, filters, search, progress bar, mission grid
    Mission.jsx           # 3-panel workspace + score breakdown
    Profile.jsx           # stats cards, ranks, achievements, best scores
  components/
    Navbar.jsx  MissionCard.jsx  Terminal.jsx  HintAssistant.jsx
    EvidenceViewer.jsx  FlagSubmit.jsx  NotesPanel.jsx  ProgressBadge.jsx
  App.jsx                 # routing + shared game state
  main.jsx  index.css
```

Per-mission `files` drive everything the terminal and evidence viewer show. Each
mission also carries `recommendedCommands`, `hints`, `flag`, and an
`explanation` revealed after solving.

## Categories

Log Analysis · Crypto · Encoding · Forensics · Web Logic · Stego Simulation ·
OSINT-style Puzzle · Incident Response · Threat Hunting · Access Review

## Folder structure

```
case404-cyber-detective-lab/
  package.json
  index.html
  vite.config.js
  tailwind.config.js
  postcss.config.js
  vercel.json
  README.md
  src/
    main.jsx
    App.jsx
    index.css
    data/missions.js
    pages/{Home,Mission,Profile}.jsx
    components/{Navbar,MissionCard,Terminal,HintAssistant,EvidenceViewer,FlagSubmit,NotesPanel,ProgressBadge}.jsx
    utils/{terminalEngine,progress,flagChecker}.js
```

## Deploy (Vercel)

The repo includes `vercel.json` with an SPA rewrite so deep links like
`/mission/12` and `/profile` work on refresh:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Import the repo on Vercel (Framework Preset: **Vite**, Output: `dist`) and deploy.

---

© NOtFound_404 · For learning and fun. All cases are fictional.
