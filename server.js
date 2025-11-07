import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";

import { fetchOdds } from "./src/fetchOdds.js";
import { fetchConsensus } from "./src/fetchConsensus.js";
import { normalizeGames } from "./src/normalizeGame.js";
import { updateCache, GAME_CACHE, LAST_UPDATED } from "./src/cache.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

async function refreshData() {
  console.log("Refreshing NFL data...");
  const odds = await fetchOdds();
  const consensus = await fetchConsensus();
  const normalized = normalizeGames(odds, consensus);

  updateCache(normalized);
  console.log(`✅ Updated ${normalized.length} games`);
}

cron.schedule("*/5 * * * *", refreshData);

refreshData();

app.get("/", (req, res) => {
  res.json({ status: "running", updated: LAST_UPDATED });
});

app.get("/api/v1/nfl/games", (req, res) => {
  res.json({ updated: LAST_UPDATED, data: GAME_CACHE });
});

app.get("/api/v1/nfl/games/:id", (req, res) => {
  const g = GAME_CACHE.find(x => x.id === req.params.id);
  if (!g) return res.status(404).json({ error: "Not found" });
  res.json(g);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("✅ Server running on port", PORT));
