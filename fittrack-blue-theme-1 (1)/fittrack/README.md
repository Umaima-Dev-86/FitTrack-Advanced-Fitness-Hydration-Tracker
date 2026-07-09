# 🏋️ FitTrack — Advanced Fitness & Hydration Tracker

A gym-themed, full-stack fitness and hydration tracker with local SQLite storage,
an animated water intake visualizer, and hydration push-notification reminders.

```
fittrack/
├── demo/
│   └── index.html        ← Standalone demo. Just double-click to open — no install needed.
├── backend/               ← Express + SQLite REST API (the "local database storage")
│   ├── server.js
│   ├── db.js
│   └── routes/api.js
└── frontend/               ← React (Vite) app that talks to the backend
    ├── src/App.jsx
    └── ...
```

## 1. Quickest way to see it — the demo (no install)

Open **`demo/index.html`** directly in any browser (double-click it, or drag it into Chrome).
Everything works instantly: splash screen, animated hydration tank, workout logging, charts,
goals, and reminders — all saved locally in the browser (`localStorage`), so your data is
still there next time you open it. This is the best one to use for a screen recording.

## 2. Running the real full-stack app (backend + frontend)

You'll need [Node.js](https://nodejs.org) (v18+) installed on your computer.

### Step 1 — Start the backend (SQLite API)
```bash
cd backend
npm install
npm start
```
This starts the API on **http://localhost:4000** and creates a `fittrack.db` SQLite file
automatically (your real local database — no setup required).

### Step 2 — Start the frontend (React)
Open a **second terminal**:
```bash
cd frontend
npm install
npm run dev
```
This starts the app on **http://localhost:5173**. Open that URL in your browser —
it's the same design as the demo, but every action (logging water, workouts, steps,
saving goals) is now saved for real in the SQLite database via the backend API.

## Features

- 🎬 Animated splash/title screen with logo glow + loading bar
- 💧 Interactive hydration tank visualizer with wave animation, quick-add buttons, custom amount, and a progress ring on the dashboard
- 🎉 Confetti celebration when you hit your daily hydration goal
- 🏋️ Workout logger (Strength / Cardio / HIIT / Cycling / Yoga / Other) with auto calorie calculation
- 📈 7-day animated bar charts for steps, hydration, and calories
- 🔔 Push notification reminders for hydration (uses the browser Notification API), with a configurable interval
- ✨ Ripple button effects, smooth screen transitions, glowing gradient background, sliding bottom-nav indicator
- 🗄️ Real backend: Express REST API + SQLite (`better-sqlite3`) for persistent local storage

## API Endpoints (backend)

| Method | Endpoint              | Description                     |
|--------|------------------------|----------------------------------|
| GET    | `/api/day`             | Get today's steps/water/workouts |
| POST   | `/api/water`            | Add/subtract water (`{ml}`)      |
| POST   | `/api/water/reset`      | Reset today's water to 0         |
| POST   | `/api/steps`            | Add steps (`{steps}`)            |
| POST   | `/api/workouts`         | Log a workout                    |
| DELETE | `/api/workouts/:id`     | Delete a workout                 |
| GET    | `/api/goals`            | Get saved goals                  |
| PUT    | `/api/goals`            | Update goals                     |
| GET    | `/api/history?days=7`   | Get last N days for charts       |

## Notes

- Push notifications require you to click **"Enable"** in the Goals tab so the browser
  can ask for notification permission (browsers block this without a user click).
- Want MongoDB instead of SQLite, or a native Android build (Kotlin + Room)? Both are
  possible as a next step — just ask and it can be built out from here.
