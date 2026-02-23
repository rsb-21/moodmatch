import { emotionConfig } from "./emotionConfig.js";

export function buildPrompt(emotion, genre) {
  const profile = emotionConfig[emotion];

  if (!profile) {
    throw new Error("Invalid emotion selected.");
  }
return `
You are a meticulous music curator.

Generate a playlist of exactly 10 REAL, verifiable songs.

Emotion: ${emotion}
Description: ${profile.description}

Musical profile:
- Energy: ${profile.energy}
- Tempo: ${profile.tempo}
- Valence: ${profile.valence}
- Lyrical tone: ${profile.lyricalTone}
- Production density: ${profile.density}

Genre constraint: ${genre}

Rules:
- Only include real songs that exist on major streaming platforms.
- No duplicate artists.
- Do not invent songs.
- Avoid generic or obvious picks unless they strongly fit.
- Prioritize emotional accuracy over popularity.
- Match both genre AND emotional tone precisely.

Output format strictly:
1. Artist - Song
2. Artist - Song
(10 total lines, no commentary, no explanations)
`;
}

import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generatePlaylist(emotion, genre) {
  const prompt = buildPrompt(emotion, genre);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      { role: "user", content: prompt }
    ],
  });

  return response.choices[0].message.content
    .split("\n")
    .filter(line => line.trim().length > 0)
    .slice(0, 10);
}
