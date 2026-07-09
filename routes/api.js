const express = require("express");
const db = require("../db");
const router = express.Router();

const todayStr = () => new Date().toISOString().slice(0, 10);

function ensureDay(date) {
  const row = db.prepare("SELECT * FROM days WHERE date = ?").get(date);
  if (!row) {
    db.prepare("INSERT INTO days (date, steps, water_ml) VALUES (?, 0, 0)").run(date);
    return { date, steps: 0, water_ml: 0 };
  }
  return row;
}

function dayPayload(date) {
  const d = ensureDay(date);
  const workouts = db
    .prepare("SELECT * FROM workouts WHERE date = ? ORDER BY created_at ASC")
    .all(date);
  return {
    date: d.date,
    steps: d.steps,
    waterMl: d.water_ml,
    workouts: workouts.map((w) => ({ id: w.id, type: w.type, duration: w.duration, kcal: w.kcal })),
  };
}

/* GET today's (or given date's) full day payload */
router.get("/day/:date?", (req, res) => {
  const date = req.params.date || todayStr();
  res.json(dayPayload(date));
});

/* POST water delta { ml } for a given date (defaults today) */
router.post("/water", (req, res) => {
  const { ml, date } = req.body;
  const d = date || todayStr();
  ensureDay(d);
  db.prepare("UPDATE days SET water_ml = MAX(0, water_ml + ?) WHERE date = ?").run(ml, d);
  res.json(dayPayload(d));
});

/* POST reset water for a date */
router.post("/water/reset", (req, res) => {
  const d = req.body.date || todayStr();
  ensureDay(d);
  db.prepare("UPDATE days SET water_ml = 0 WHERE date = ?").run(d);
  res.json(dayPayload(d));
});

/* POST steps delta { steps } */
router.post("/steps", (req, res) => {
  const { steps, date } = req.body;
  const d = date || todayStr();
  ensureDay(d);
  db.prepare("UPDATE days SET steps = MAX(0, steps + ?) WHERE date = ?").run(steps, d);
  res.json(dayPayload(d));
});

/* POST new workout { type, duration, kcal, date } */
router.post("/workouts", (req, res) => {
  const { type, duration, kcal, date } = req.body;
  const d = date || todayStr();
  ensureDay(d);
  db.prepare("INSERT INTO workouts (date, type, duration, kcal) VALUES (?, ?, ?, ?)").run(d, type, duration, kcal);
  res.json(dayPayload(d));
});

/* DELETE a workout by id */
router.delete("/workouts/:id", (req, res) => {
  const w = db.prepare("SELECT * FROM workouts WHERE id = ?").get(req.params.id);
  if (!w) return res.status(404).json({ error: "Workout not found" });
  db.prepare("DELETE FROM workouts WHERE id = ?").run(req.params.id);
  res.json(dayPayload(w.date));
});

/* GET goals */
router.get("/goals", (req, res) => {
  const g = db.prepare("SELECT * FROM goals WHERE id = 1").get();
  res.json({
    stepsGoal: g.steps_goal,
    waterGoal: g.water_goal,
    workoutMinGoal: g.workout_min_goal,
    reminderEnabled: !!g.reminder_enabled,
    reminderInterval: g.reminder_interval,
  });
});

/* PUT update goals */
router.put("/goals", (req, res) => {
  const { stepsGoal, waterGoal, workoutMinGoal, reminderEnabled, reminderInterval } = req.body;
  db.prepare(
    `UPDATE goals SET steps_goal = ?, water_goal = ?, workout_min_goal = ?, reminder_enabled = ?, reminder_interval = ? WHERE id = 1`
  ).run(stepsGoal, waterGoal, workoutMinGoal, reminderEnabled ? 1 : 0, reminderInterval);
  const g = db.prepare("SELECT * FROM goals WHERE id = 1").get();
  res.json({
    stepsGoal: g.steps_goal,
    waterGoal: g.water_goal,
    workoutMinGoal: g.workout_min_goal,
    reminderEnabled: !!g.reminder_enabled,
    reminderInterval: g.reminder_interval,
  });
});

/* GET history for last N days (default 7) */
router.get("/history", (req, res) => {
  const n = parseInt(req.query.days, 10) || 7;
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const payload = dayPayload(date);
    out.push({
      date,
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      steps: payload.steps,
      waterMl: payload.waterMl,
      kcal: payload.workouts.reduce((s, w) => s + w.kcal, 0),
    });
  }
  res.json(out);
});

module.exports = router;
