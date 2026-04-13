require("dotenv").config({ path: ".env" });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is missing. Add it to .env or .env.local.");
  process.exit(1);
}

async function testModel(modelName) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] }),
  });
  const data = await res.json();
  console.log(`\n--- ${modelName} ---`);
  if (data.error) {
    console.log(data.error.message.substring(0, 200));
  } else {
    console.log("SUCCESS");
  }
}

async function run() {
  await testModel("gemini-1.5-flash-latest");
  await testModel("gemini-1.5-pro-latest");
  await testModel("gemini-2.0-flash");
}
run();
