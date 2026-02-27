import express from "express";
import { generatePlaylist } from "./lib/generatePlaylist.js";
import { emotionConfig } from "./lib/emotionConfig.js";

const app = express();
app.use(express.urlencoded({ extended: true }));

function renderPage(content) {
  return `
    <html>
      <head>
        <title>MoodMatch 🎶</title>

        <meta name="viewport" content="width=device-width, 
initial-scale=1.0" />

        <!-- Google Font -->
<link 
href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital@0;1&display=swap" 
rel="stylesheet">
        <style>
          body {
            font-family: 'Inter', sans-serif;
background: linear-gradient(
  135deg,
  #f6eefe 0%,
  #eaf6ff 50%,
  #fbe9f1 100%
);
background-attachment: fixed;
            color: #1e293b;
            margin: 0;
            padding: 24px;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 100vh;
            padding-top: 60px
          }
select {
  color: #000;
  -webkit-appearance: none;
  appearance: none;
}
          .card {
            background: white;
            padding: 32px;
            border-radius: 20px;
            width: 100%;
            max-width: 480px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.06);
          }
h1 {
  font-family: 'Playfair Display', serif;
  font-weight: 500;
  font-size: 32px;
  letter-spacing: -0.5px;
}
          h1, h2 {
            margin-top: 0;
            font-weight: 600;
          }

          p {
            color: #64748b;
          }

          select, button {
            width: 100%;
            padding: 14px;
            margin-top: 16px;
            border-radius: 14px;
            border: 1px solid #e2e8f0;
            font-size: 16px;
            font-family: 'Inter', sans-serif;
          }

          select {
            background: #f1f5f9;
          }

          select:focus {
            outline: none;
            border-color: #7c3aed;
          }

          button {
            background: #875c96;
            color: white;
            border: none;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          button:hover {
            opacity: 0.9;
            transform: translateY(-1px);
          }

          .yes {
            background: #16a34a;
          }

          .no {
            background: #dc2626;
          }

          ul {
            padding-left: 18px;
          }

          li {
            margin-bottom: 14px;
          }

          a {
            color: #7c3aed;
            text-decoration: none;
            font-size: 14px;
          }

          hr {
            border: none;
            height: 1px;
            background: #e2e8f0;
            margin: 24px 0;
          }

          /* Mobile spacing tweak */
          @media (max-width: 480px) {
            body {
              padding: 16px;
            }
            .card {
              padding: 24px;
            }
          }
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

app.get("/", (req, 
res) => {
const emotionOptions = Object.keys(emotionConfig)
  .sort()
  .map(e => 
`<option>${e}</option>`)
    .join("");

  res.send(renderPage(`
    <h1>MoodMatch 🎶</h1>
    <p>Find music that meets you where you are.</p>

    <form method="POST" action="/generate">
<select name="emotion" required>
  <option value="" disabled selected>
    What's your mood right now?
  </option>
  ${emotionOptions}
</select>

<select name="genre" required>
  <option value="" disabled selected>
    Which genre are you feeling?
  </option>
<option>Classical</option>
<option>Electronic</option>
<option>Hip-Hop / Rap</option>
<option>Indie / Alternative</option>
<option>Pop</option>
<option>R&B</option>
</select>

<select name="platform" required>
  <option value="" disabled selected>
    What platform do you vibe out on?
  </option>
<option value="apple">Apple Music</option>
<option value="soundcloud">SoundCloud</option>
<option value="spotify">Spotify</option>
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

<ul style="margin-top:24px;">
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
      <li style="margin-bottom:12px;">
        ${song}
        <br/>
        <a href="${url}" target="_blank">
          🎧 Listen on ${platform.charAt(0).toUpperCase() + platform.slice(1)}
        </a>
      </li>
    `;
  }).join("")}
</ul>

<hr/>

<p><strong>Did this match how you feel?</strong></p>

<div style="display:flex; gap:16px; margin-top:12px;">
  <button id="thumbUp"
    style="
      background:white;
      border:2px solid #875c96;
      color:#875c96;
      border-radius:12px;
      font-size:20px;
      padding:10px 18px;
    ">
    👍
  </button>

  <button id="thumbDown"
    style="
      background:white;
      border:2px solid #875c96;
      color:#875c96;
      border-radius:12px;
      font-size:20px;
      padding:10px 18px;
    ">
    👎
  </button>
</div>

<p id="feedbackMessage" style="
  margin-top:12px;
  font-size:14px;
  color:#6b7280;
"></p>

<script>
  const up = document.getElementById("thumbUp");
  const down = document.getElementById("thumbDown");
  const message = document.getElementById("feedbackMessage");

  up.addEventListener("click", () => {
    message.innerText = "Glad it resonated 💜";
  });

  down.addEventListener("click", () => {
    message.innerText = "Thank you — that helps us tune better.";
  });
</script>

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
