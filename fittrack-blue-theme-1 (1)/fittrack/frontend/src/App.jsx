import React, { useState, useEffect, useRef, useCallback } from "react";
import { api } from "./api";
import Icon, { PATHS } from "./components/Icon";
import WaterTank from "./components/WaterTank";
import Confetti from "./components/Confetti";

const TYPES = [
  { name: "Strength", kcal: 8, icon: PATHS.strength },
  { name: "Cardio", kcal: 10, icon: PATHS.cardio },
  { name: "HIIT", kcal: 12, icon: PATHS.hiit },
  { name: "Cycling", kcal: 9, icon: PATHS.cycling },
  { name: "Yoga", kcal: 4, icon: PATHS.yoga },
  { name: "Other", kcal: 6, icon: PATHS.flame },
];

const NAVS = [
  { id: "dashboard", label: "Home", icon: PATHS.home },
  { id: "water", label: "Water", icon: PATHS.water },
  { id: "workouts", label: "Train", icon: PATHS.dumbbell },
  { id: "progress", label: "Progress", icon: PATHS.chart },
  { id: "settings", label: "Goals", icon: PATHS.settings },
];

const DEFAULT_DAY = { steps: 0, waterMl: 0, workouts: [] };
const DEFAULT_GOALS = { stepsGoal: 10000, waterGoal: 2500, workoutMinGoal: 45, reminderEnabled: false, reminderInterval: 60 };

function withRipple(handler) {
  return (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const r = document.createElement("span");
    r.className = "ripple";
    r.style.width = r.style.height = size + "px";
    r.style.left = e.clientX - rect.left - size / 2 + "px";
    r.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.style.position = btn.style.position || "relative";
    btn.appendChild(r);
    setTimeout(() => r.remove(), 600);
    handler(e);
  };
}

export default function App() {
  const [entered, setEntered] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [day, setDay] = useState(DEFAULT_DAY);
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [history, setHistory] = useState([]);
  const [selectedType, setSelectedType] = useState("Strength");
  const [duration, setDuration] = useState(30);
  const [customWater, setCustomWater] = useState("");
  const [toastMsg, setToastMsg] = useState(null);
  const [apiOnline, setApiOnline] = useState(true);
  const [goalForm, setGoalForm] = useState(DEFAULT_GOALS);
  const [waterGoalHit, setWaterGoalHit] = useState(false);

  const confettiRef = useRef(null);
  const toastTimer = useRef(null);
  const reminderTimer = useRef(null);

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2200);
  }, []);

  const loadAll = useCallback(async () => {
    try {
      const [d, g, h] = await Promise.all([api.getDay(), api.getGoals(), api.getHistory(7)]);
      setDay(d);
      setGoals(g);
      setGoalForm(g);
      setHistory(h);
      setApiOnline(true);
      if (d.waterMl >= g.waterGoal) setWaterGoalHit(true);
    } catch (e) {
      setApiOnline(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    clearInterval(reminderTimer.current);
    if (goals.reminderEnabled) {
      const ms = Math.max(1, goals.reminderInterval) * 60 * 1000;
      reminderTimer.current = setInterval(() => {
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("Stay hydrated 💧", { body: "Time for a glass of water!" });
        } else {
          toast("💧 Hydration reminder — drink some water!");
        }
      }, ms);
    }
    return () => clearInterval(reminderTimer.current);
  }, [goals.reminderEnabled, goals.reminderInterval, toast]);

  const addWater = async (ml) => {
    try {
      const d = await api.addWater(ml);
      setDay(d);
      toast(`+${ml}ml logged 💧`);
      if (d.waterMl >= goals.waterGoal && !waterGoalHit) {
        setWaterGoalHit(true);
        confettiRef.current?.fire();
        toast("🎉 Daily hydration goal reached!");
      }
      loadAll();
    } catch (e) { toast("Couldn't reach backend"); }
  };
  const resetWater = async () => {
    const d = await api.resetWater();
    setDay(d); setWaterGoalHit(false); toast("Water log reset");
  };
  const addSteps = async (n) => {
    const d = await api.addSteps(n);
    setDay(d); toast(`+${n.toLocaleString()} steps 👟`);
  };
  const logWorkout = async () => {
    const t = TYPES.find((x) => x.name === selectedType);
    const kcal = Math.round(duration * t.kcal);
    const d = await api.addWorkout({ type: selectedType, duration, kcal });
    setDay(d); toast(`${selectedType} logged — ${kcal} kcal 🔥`);
  };
  const removeWorkout = async (id) => {
    const d = await api.removeWorkout(id);
    setDay(d); toast("Workout removed");
  };
  const saveGoals = async () => {
    const g = await api.saveGoals(goalForm);
    setGoals(g); toast("Goals saved ✓");
  };
  const toggleReminder = async () => {
    const next = { ...goalForm, reminderEnabled: !goalForm.reminderEnabled };
    setGoalForm(next);
    const g = await api.saveGoals(next);
    setGoals(g);
    if (next.reminderEnabled && typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };
  const testReminder = () => {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification("Stay hydrated 💧", { body: "Time for a glass of water!" });
    } else toast("💧 Hydration reminder — drink some water!");
  };

  useEffect(() => { loadAll(); }, [tab]); // eslint-disable-line

  const kcal = day.workouts.reduce((s, w) => s + w.kcal, 0);
  const mins = day.workouts.reduce((s, w) => s + w.duration, 0);
  const waterPct = Math.min(100, Math.round((day.waterMl / goals.waterGoal) * 100)) || 0;
  const circ = 2 * Math.PI * 55;

  return (
    <>
      <div className="bg-mesh">
        <div className="bg-grid" />
        <div className="blob blob1" />
        <div className="blob blob2" />
        <div className="blob blob3" />
      </div>

      <div id="splash" className={entered ? "hide" : ""}>
        <div className="logo-badge">
          <Icon d={PATHS.dumbbell} size={34} color="#fff" strokeWidth={2.4} />
        </div>
        <div className="brand-title display" style={{ marginTop: 14 }}>FITTRACK</div>
        <div className="brand-sub">TRAIN HARD · STAY HYDRATED</div>
        <div className="splash-bar"><div className="splash-bar-fill" /></div>
        <button className="btn-block" style={{ width: 200, marginTop: 34 }} onClick={withRipple(() => setEntered(true))}>
          ENTER APP →
        </button>
      </div>

      <div id="app-shell" className={entered ? "show" : ""}>
        <header className="top">
          <div className="top-row">
            <div className="brand">
              <div className="brand-icon"><Icon d={PATHS.dumbbell} size={18} color="#fff" strokeWidth={2.4} /></div>
              <span className="brand-name display">FITTRACK</span>
            </div>
            <div className="streak-chip">{apiOnline ? "🟢 API live" : "🔴 offline"}</div>
          </div>
          <div className="date-line">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</div>
        </header>

        <main>
          {tab === "dashboard" && (
            <section className="screen">
              <div className="card">
                <div className="hero-row">
                  <div className="ring-wrap">
                    <svg viewBox="0 0 130 130">
                      <circle className="ring-track" cx="65" cy="65" r="55" />
                      <circle className="ring-fill" cx="65" cy="65" r="55" strokeDasharray={circ} strokeDashoffset={circ - (circ * waterPct) / 100} />
                    </svg>
                    <div className="ring-center">
                      <div className="ring-pct mono">{waterPct}%</div>
                      <div className="ring-tag">Hydration</div>
                    </div>
                  </div>
                  <div className="hero-stats">
                    <div>
                      <div className="hero-stat-label">Water today</div>
                      <div className="hero-stat-val">{day.waterMl}<small> / {goals.waterGoal} ml</small></div>
                    </div>
                    <div className="chip-row">
                      <button className="chip-btn hydro" onClick={withRipple(() => addWater(250))}>+250ml</button>
                      <button className="chip-btn hydro" onClick={withRipple(() => addWater(500))}>+500ml</button>
                    </div>
                  </div>
                </div>
                <div className="stat-grid">
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: "rgba(255,68,41,.15)" }}><Icon d={PATHS.steps} size={15} color="#ff4429" /></div>
                    <div className="val mono">{day.steps.toLocaleString()}</div>
                    <div className="lbl">Steps</div>
                    <div className="mini-bar"><div className="mini-bar-fill" style={{ width: `${Math.min(100, (day.steps / goals.stepsGoal) * 100)}%`, background: "var(--energy)" }} /></div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: "rgba(255,176,32,.15)" }}><Icon d={PATHS.flame} size={15} color="#ffb020" /></div>
                    <div className="val mono">{kcal}</div>
                    <div className="lbl">Kcal burned</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: "rgba(58,220,132,.15)" }}><Icon d={PATHS.clock} size={15} color="#3adc84" /></div>
                    <div className="val mono">{mins}</div>
                    <div className="lbl">Min trained</div>
                    <div className="mini-bar"><div className="mini-bar-fill" style={{ width: `${Math.min(100, (mins / goals.workoutMinGoal) * 100)}%`, background: "var(--success)" }} /></div>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="section-title">⚡ QUICK LOG STEPS</div>
                <div className="chip-row">
                  {[1000, 2000, 5000].map((s) => (
                    <button key={s} className="chip-btn energy" onClick={withRipple(() => addSteps(s))}>+{s.toLocaleString()}</button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {tab === "water" && (
            <section className="screen">
              <div className="card">
                <div className="section-title">💧 HYDRATION TANK</div>
                <div className="tank-wrap">
                  <WaterTank pct={waterPct} size={150} />
                  <div style={{ textAlign: "center" }}>
                    <div className="display" style={{ fontSize: 26, color: "var(--hydro)" }}>{day.waterMl} ML</div>
                    <div style={{ color: "var(--muted)", fontSize: 12.5 }}>of {goals.waterGoal}ml daily goal</div>
                  </div>
                  <div className="chip-row" style={{ justifyContent: "center" }}>
                    {[150, 250, 500, 750].map((ml) => (
                      <button key={ml} className="chip-btn hydro" onClick={withRipple(() => addWater(ml))}>+{ml}ml</button>
                    ))}
                  </div>
                  <div className="input-row" style={{ width: "100%" }}>
                    <input type="number" placeholder="Custom amount (ml)" value={customWater} onChange={(e) => setCustomWater(e.target.value)} />
                    <button className="chip-btn ghost" onClick={withRipple(() => { const v = parseInt(customWater, 10); if (v > 0) { addWater(v); setCustomWater(""); } })}>Add</button>
                  </div>
                  <button className="btn-block outline" onClick={withRipple(resetWater)}>Reset today's water</button>
                </div>
              </div>
            </section>
          )}

          {tab === "workouts" && (
            <section className="screen">
              <div className="card">
                <div className="section-title">🏋️ LOG A WORKOUT</div>
                <div className="type-grid">
                  {TYPES.map((t) => (
                    <div key={t.name} className={`type-btn ${selectedType === t.name ? "active" : ""}`} onClick={() => setSelectedType(t.name)}>
                      <Icon d={t.icon} size={18} color={selectedType === t.name ? "#ff4429" : "#8a93a1"} />
                      <span>{t.name}</span>
                    </div>
                  ))}
                </div>
                <div className="dur-row">
                  <button className="dur-btn" onClick={() => setDuration((d) => Math.max(5, d - 5))}>−</button>
                  <div className="dur-val mono">{duration}m</div>
                  <button className="dur-btn" onClick={() => setDuration((d) => d + 5)}>+</button>
                </div>
                <button className="btn-block" onClick={withRipple(logWorkout)}>＋ ADD WORKOUT</button>
              </div>
              <div className="card">
                <div className="section-title">📋 TODAY'S LOG</div>
                {day.workouts.length === 0 ? (
                  <div className="empty-note">No workouts logged yet. Add your first one above.</div>
                ) : (
                  day.workouts.map((w) => {
                    const t = TYPES.find((x) => x.name === w.type) || TYPES[5];
                    return (
                      <div className="log-item" key={w.id}>
                        <div className="ic"><Icon d={t.icon} size={16} color="#ff4429" /></div>
                        <div className="info">
                          <div className="t">{w.type}</div>
                          <div className="s">{w.duration} min · {w.kcal} kcal</div>
                        </div>
                        <button className="del-btn" onClick={() => removeWorkout(w.id)}>✕</button>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          )}

          {tab === "progress" && (
            <section className="screen">
              {[
                { key: "steps", title: "📈 STEPS — LAST 7 DAYS", color: "var(--energy)", grad: "linear-gradient(180deg,#ff7a3d,#ff4429)" },
                { key: "waterMl", title: "💧 HYDRATION — LAST 7 DAYS", color: "var(--hydro)", grad: "linear-gradient(180deg,#00e8f7,#00a5b3)" },
                { key: "kcal", title: "🔥 CALORIES BURNED", color: "var(--gold)", grad: "linear-gradient(180deg,#ffd166,#ffb020)" },
              ].map((chart) => {
                const max = Math.max(...history.map((h) => h[chart.key]), 1);
                return (
                  <div className="card" key={chart.key}>
                    <div className="section-title" style={{ color: chart.color }}>{chart.title}</div>
                    <div className="bar-chart">
                      {history.map((h, i) => (
                        <div className="bar-col" key={i}>
                          <div className="bar" style={{ height: `${(h[chart.key] / max) * 100}%`, background: chart.grad }} />
                          <div className="bar-day">{h.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {tab === "settings" && (
            <section className="screen">
              <div className="card">
                <div className="section-title">🎯 DAILY GOALS</div>
                {[
                  { key: "stepsGoal", label: "Steps goal" },
                  { key: "waterGoal", label: "Water goal (ml)" },
                  { key: "workoutMinGoal", label: "Workout goal (min)" },
                ].map((f) => (
                  <div key={f.key} style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 4 }}>{f.label}</label>
                    <input type="number" value={goalForm[f.key]} onChange={(e) => setGoalForm({ ...goalForm, [f.key]: Number(e.target.value) })}
                      style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 11, padding: "11px 13px", color: "var(--text)", fontSize: 13.5, outline: "none" }} />
                  </div>
                ))}
                <button className="btn-block" onClick={withRipple(saveGoals)}>✓ SAVE GOALS</button>
              </div>
              <div className="card">
                <div className="section-title" style={{ color: "var(--hydro)" }}>🔔 HYDRATION REMINDERS</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>Push reminders</div>
                    <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
                      Permission: {typeof Notification !== "undefined" ? Notification.permission : "unsupported"}
                    </div>
                  </div>
                  <div className={`switch ${goalForm.reminderEnabled ? "on" : ""}`} onClick={toggleReminder}><div className="knob" /></div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 4 }}>Remind every (minutes)</label>
                  <input type="number" value={goalForm.reminderInterval} onChange={(e) => setGoalForm({ ...goalForm, reminderInterval: Number(e.target.value) })}
                    style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 11, padding: "11px 13px", color: "var(--text)", fontSize: 13.5, outline: "none" }} />
                </div>
                <button className="btn-block outline" onClick={withRipple(testReminder)}>Send test reminder now</button>
              </div>
            </section>
          )}
        </main>

        <nav className="bottom">
          {NAVS.map((n) => (
            <button key={n.id} className={`nav-btn ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
              <div className="nav-pill" />
              <Icon d={n.icon} size={19} color={tab === n.id ? "#ff4429" : "#565d68"} strokeWidth={tab === n.id ? 2.6 : 2.1} />
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <Confetti ref={confettiRef} />
      <div id="toast" className={toastMsg ? "show" : ""}>{toastMsg}</div>
    </>
  );
}
