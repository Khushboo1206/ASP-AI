require("dotenv").config({ path: ".env" });
fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": "Bearer " + process.env.GEMINI_API_KEY,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "google/gemini-2.0-flash-exp:free",
    messages: [{ role: "user", content: "Hi" }]
  })
}).then(r=>r.json()).then(console.log);
