import express from "express";
import { generatePlaylist } from "./lib/generatePlaylist.js";
import { emotionConfig } from "./lib/emotionConfig.js";

const app = express();
app.use(express.urlencoded({ extended: true }));

function renderPage(content) {
  return `
    <html>
      <head>
        <title>MoodMatch</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            background: #0f172a;
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 40px;
          }
          .card {
            background: #1e293b;
            padding: 40px;
            border-radius: 16px;
            width: 500px;
          }
          select, button {
            width: 100%;
            padding: 12px;
            margin-top: 12px;
            border-radius: 8px;
            border: none;
            font-size: 16px;
          }
          button {
            background: #22c55e;
            color: white;
            cursor: pointer;
          }
          .yes { background: #22c55e; }
          .no { background: #ef4444; }
          li { margin-bottom: 10px; }
          a { color: #38bdf8; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="card">
          ${content}
        </div>
      </body>
    </html>
  `;
}

app.get("/", (req, res) => {
  const emotionOptions = Object.keys(emotionConfig)
    .map(e => `<option>${e}</option>`)
    .join("");

  res.send(renderPage(`
    <h1>MoodMatch 🎧</h1>
    <p>Find music that meets you where you are.</p>

    <form method="POST" action="/generate">
      <select name="emotion">
        ${emotionOptions}
      </select>

<select name="genre">
  <option>Indie / Alternative</option>
  <option>Pop</option>
  <option>Hip-Hop / Rap</option>
  <option>Electronic</option>
  <option>R&B</option>
  <option>Classical</option>
</select>

<select name="platform">
  <option value="spotify">Spotify</option>
  <option value="apple">Apple Music</option>
  <option value="soundcloud">SoundCloud</option>
  <option value="youtube">YouTube</option> 
</select>

<button id="generateBtn" type="submit">
  Generate Playlist
</button>

<p id="loadingText" style="display:none; margin-top:15px;">
  🎧 Tuning your playlist...
</p>
    </form>
<script>
  const form = document.querySelector("form");
  const button = document.getElementById("generateBtn");
  const loadingText = document.getElementById("loadingText");

  form.addEventListener("submit", () => {
    button.disabled = true;
    button.innerText = "Generating...";
    loadingText.style.display = "block";
  });
</script>
  `));
}); // <-- THIS WAS MISSING

app.post("/generate", async (req, res) => {
const { emotion, genre, platform } = req.body;

  try {
    const playlist = await generatePlaylist(emotion, genre);

    res.send(renderPage(`
      <h2>For when you're feeling ${emotion} 🎧</h2>
      <p><em>${genre}</em></p>

<ul>
  ${playlist.map(song => {
    const searchQuery = encodeURIComponent(song.replace(" - ", " "));
    let url = "";

    if (platform === "spotify") {
      url = `https://open.spotify.com/search/${searchQuery}`;
    } else if (platform === "apple") {
      url = `https://music.apple.com/us/search?term=${searchQuery}`;
    } else if (platform === "soundcloud") {
      url = `https://soundcloud.com/search?q=${searchQuery}`;
    } else if (platform === "youtube") {
      url = `https://www.youtube.com/results?search_query=${searchQuery}`;
    }

    return `
      <li>
        ${song}
        <br/>
        <a href="${url}" target="_blank">
          🎧 Listen on ${platform.charAt(0).toUpperCase() + 
platform.slice(1)}
        </a>
      </li>
    `;
  }).join("")}
</ul>

      <hr/>

      <p><strong>Did this match how you feel?</strong></p>

      <button class="yes" onclick="alert('Glad it resonated ❤️')">
        Yeah, that’s me
      </button>

      <button class="no" onclick="alert('Thank you — that helps us tune 
better.')">
        Not quite
      </button>

      <br/><br/>
      <a href="/">Generate another</a>
    `));

  } catch (err) {
    console.error(err);
    res.send("Something went wrong. Check server logs.");
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
