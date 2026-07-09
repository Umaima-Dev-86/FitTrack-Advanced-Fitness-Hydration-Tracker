const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "FitTrack API is running", db: "SQLite (local)" });
});

app.listen(PORT, () => {
  console.log(`✅ FitTrack backend running on http://localhost:${PORT}`);
});
