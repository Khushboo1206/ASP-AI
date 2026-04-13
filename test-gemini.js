require("dotenv").config({ path: ".env" });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is missing. Add it to .env or .env.local.");
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "Hello, testing API key" }] }],
  }),
})
  .then(res => res.json())
  .then(data => {
    console.log("Response:", JSON.stringify(data, null, 2));
  })
  .catch(err => {
    console.error("Fetch Error:", err);
  });
