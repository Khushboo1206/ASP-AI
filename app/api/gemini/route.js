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
    // 🔍 DEBUG: check if key is loading
    console.log("Loaded GEMINI KEY:", process.env.GEMINI_API_KEY);

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

    // ✅ WORKING MODEL (free tier supported)
    const url =
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Gemini API ERROR:", data);
      return NextResponse.json(
        { error: data },
        { status: 500 }
      );
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

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