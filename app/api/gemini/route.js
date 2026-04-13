// import { NextResponse } from "next/server";

// export const runtime = "nodejs";

// const GEMINI_URL =
//   "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

// export async function POST(req) {

//   try {
//     const { prompt } = await req.json();

//     const res = await fetch(
//       `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           contents: [
//             {
//               parts: [{ text: prompt }]
//             }
//           ]
//         })
//       }
//     );

//     const data = await res.json();

//     if (!res.ok) {
//       console.error("Gemini Error:", data);
//       return NextResponse.json({ error: data }, { status: 500 });
//     }

//     const text =
//       data?.candidates?.[0]?.content?.parts?.[0]?.text;

//     return NextResponse.json({ result: text });

//   } catch (error) {
//     console.error("Gemini Server Error:", error);
//     return NextResponse.json({ error: "Gemini failed" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt missing" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key missing in .env.local" },
        { status: 500 }
      );
    }

    // ✅ USING OPENROUTER COMPLETELY FREE TIER
    const url = "https://openrouter.ai/api/v1/chat/completions";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ OpenRouter API ERROR:", data);
      return NextResponse.json(
        { error: data },
        { status: 500 }
      );
    }

    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      return NextResponse.json(
        { error: "Empty Gemini response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: text });

  } catch (err) {
    console.error("❌ Gemini Route Crash:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}