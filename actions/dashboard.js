// "use server"

// import { db } from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model= genAI.getGenerativeModel({
// model: "gemini-1.5-flash",
// });

// export const generateAIInsights= async (industry)=>{
//    const prompt = `
//           Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
//           {
//             "salaryRanges": [
//               { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
//             ],
//             "growthRate": number,
//             "demandLevel": "High" | "Medium" | "Low",
//             "topSkills": ["skill1", "skill2"],
//             "marketOutlook": "Positive" | "Neutral" | "Negative",
//             "keyTrends": ["trend1", "trend2"],
//             "recommendedSkills": ["skill1", "skill2"]
//           }
          
//           IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
//           Include at least 5 common roles for salary ranges.
//           Growth rate should be a percentage.
//           Include at least 5 skills and trends.
//         `;        

//   const result = await model.generateContent(prompt);
//   const response = result.response;
//   const text = response.text();
//   const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

//   return JSON.parse(cleanedText);
// };

// export async function getIndustryInsight(){
//     const { userId } = await auth();
//     if (!userId) throw new Error ("Unauthorized");
    
//     const user = await db.user.findUnique({
//         where:{clerkUserId: userId},
//     });
//     if (!user) throw new Error("User not found");

//     if(!user.industryInsight){
//         const insights = await generateAIInsights (user.industry);

//         const industryInsight= await db.industryInsight.create({
//             data:{
//                 industry: user.industry,
//                 ...insights,
//                 nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 1000),
//             },
//         });
//         return industryInsight;
//     }   
//     return user.industryInsight;
// }

"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// ✅ Use a model you ACTUALLY have access to (from /v1/models)
const MODEL_NAME = "gemini-1.5-pro";

export const generateAIInsights = async (industry) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  // ✅ FULL ORIGINAL PROMPT (restored)
  const prompt = `
Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:

{
  "salaryRanges": [
    { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
  ],
  "growthRate": number,
  "demandLevel": "High" | "Medium" | "Low",
  "topSkills": ["skill1", "skill2"],
  "marketOutlook": "Positive" | "Neutral" | "Negative",
  "keyTrends": ["trend1", "trend2"],
  "recommendedSkills": ["skill1", "skill2"]
}

IMPORTANT:
- Return ONLY valid JSON
- No markdown
- No explanations
- Include at least 5 common roles in salaryRanges
- growthRate must be a percentage number
- Include at least 5 skills and trends
`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("🔥 Gemini API error:", res.status, err);
    throw new Error("Gemini API request failed");
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Empty Gemini response");
  }

  // ✅ Safety cleanup (in case Gemini adds ```json)
  const cleanedText = text.replace(/```(?:json)?/g, "").trim();

  return JSON.parse(cleanedText);
};

export async function getIndustryInsight() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { industryInsight: true },
  });

  if (!user) throw new Error("User not found");

  if (!user.industryInsight) {
    const insights = await generateAIInsights(user.industry);

    const industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return industryInsight;
  }

  return user.industryInsight;
}

