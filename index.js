import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import { buildPrompt } from "./lib/generatePlaylist.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

console.log("OpenAI key loaded:", process.env.OPENAI_API_KEY ? "YES" : "NO");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function run() {
  const emotion = "Anxious";
  const genre = "Indie / Alternative";

  const prompt = buildPrompt(emotion, genre);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      { role: "user", content: prompt }
    ],
  });

  console.log("\n🎧 Generated Playlist:\n");
  console.log(response.choices[0].message.content);
}

run();
