// db.js — SQLite local database setup (better-sqlite3)
const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "fittrack.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS days (
    date TEXT PRIMARY KEY,
    steps INTEGER NOT NULL DEFAULT 0,
    water_ml INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    duration INTEGER NOT NULL,
    kcal INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    steps_goal INTEGER NOT NULL DEFAULT 10000,
    water_goal INTEGER NOT NULL DEFAULT 2500,
    workout_min_goal INTEGER NOT NULL DEFAULT 45,
    reminder_enabled INTEGER NOT NULL DEFAULT 0,
    reminder_interval INTEGER NOT NULL DEFAULT 60
  );
`);

// Seed default goals row if missing
const existing = db.prepare("SELECT id FROM goals WHERE id = 1").get();
if (!existing) {
  db.prepare(
    "INSERT INTO goals (id, steps_goal, water_goal, workout_min_goal, reminder_enabled, reminder_interval) VALUES (1, 10000, 2500, 45, 0, 60)"
  ).run();
}

module.exports = db;
