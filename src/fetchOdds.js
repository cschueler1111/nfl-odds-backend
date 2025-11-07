import axios from "axios";

export async function fetchOdds() {
  try {
    const result = await axios.get(
      "https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds",
      {
        params: {
          apiKey: process.env.THE_ODDS_API_KEY,
          regions: "us",
          markets: "spreads,totals,h2h"
        }
      }
    );
    return result.data || [];
  } catch (err) {
    console.error("Odds error:", err.message);
    return [];
  }
}
