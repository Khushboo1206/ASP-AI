const apiKey = "AIzaSyCgAWtDATlh6ZERYNIW6ZXfogzGxBeIgyw";
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
