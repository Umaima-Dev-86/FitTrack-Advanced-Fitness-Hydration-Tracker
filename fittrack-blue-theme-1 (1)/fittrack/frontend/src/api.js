const BASE = "/api";

async function req(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status} on ${path}`);
  return res.json();
}

export const api = {
  getDay: () => req("/day"),
  addWater: (ml) => req("/water", { method: "POST", body: JSON.stringify({ ml }) }),
  resetWater: () => req("/water/reset", { method: "POST", body: JSON.stringify({}) }),
  addSteps: (steps) => req("/steps", { method: "POST", body: JSON.stringify({ steps }) }),
  addWorkout: (w) => req("/workouts", { method: "POST", body: JSON.stringify(w) }),
  removeWorkout: (id) => req(`/workouts/${id}`, { method: "DELETE" }),
  getGoals: () => req("/goals"),
  saveGoals: (g) => req("/goals", { method: "PUT", body: JSON.stringify(g) }),
  getHistory: (days = 7) => req(`/history?days=${days}`),
};
