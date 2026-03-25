require("dotenv").config({ path: ".env" });

const apiKey = process.env.GEMINI_API_KEY;

async function testOpenRouter() {
  console.log("Using Key:", apiKey ? apiKey.substring(0, 10) + "..." : "undefined");
  
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-lite-preview-02-05:free",
      messages: [{ role: "user", content: "Say hello!" }]
    })
  });

  const responseText = await response.text();
  console.log("Raw Response:");
  console.log(responseText);
}

testOpenRouter();
