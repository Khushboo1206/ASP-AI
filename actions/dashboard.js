// "use server";
// import { db } from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash"});

// export const generateAIInsights = async (industry) => {
//   const prompt = `
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

//   // const result = await model.generateContent(prompt);
//   const result = await model.generateContent({
//   contents: [
//     {
//       role: "user",
//       parts: [{ text: prompt }]
//     }
//   ]
// });
//   const response = result.response;
//   const text = response.text();
//   const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

//   return JSON.parse(cleanedText);
// };

// export async function getIndustryInsights() {
//   const { userId } = await auth();
//   if (!userId) throw new Error("Unauthorized");

//   const user = await db.user.findUnique({
//     where: { clerkUserId: userId },
//     include: {
//       industryInsight: true,
//     },
//   });

//   if (!user) throw new Error("User not found");

//   // If no insights exist, generate them
//   if (!user.industryInsight) {
//     const insights = await generateAIInsights(user.industry);

//     const industryInsight = await db.industryInsight.create({
//       data: {
//         industry: user.industry,
//         ...insights,
//         nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//       },
//     });

//     return industryInsight;
//   }

//   return user.industryInsight;
// }



"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

/* ================================
   CALL GEMINI THROUGH API ROUTE
================================ */

export const generateAIInsights = async (industry) => {

  const prompt = `
Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format:

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
Return ONLY JSON.
No markdown.
No explanation.
Include at least 5 roles, skills and trends.
`;

  const baseUrl =
    process.env.APP_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/gemini`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  let data;

  try {
    data = await res.json();
  } catch (err) {
    console.error("Gemini invalid JSON response");
    throw new Error("Gemini response parsing failed");
  }

  // if (!res.ok) {
  //   console.error("Gemini API Route Error:", data);
  // }

  if (!res.ok) {
  console.error("❌ Gemini API Route Error:", data);

  throw new Error(
    data?.error?.message ||
    JSON.stringify(data) ||
    "Gemini API failed"
  );
}
if (!data?.result) {
  console.error("❌ Empty Gemini response:", data);
  throw new Error("Gemini returned empty response");
}

  // if (!data?.result) {
  //   throw new Error("Empty Gemini response");
  // }

  const cleanedText = data.result
    .replace(/```(?:json)?/g, "")
    .replace(/```/g, "")
    .trim();

  let parsed;

  try {
    parsed = JSON.parse(cleanedText);
  } catch (err) {
    console.error("Invalid Gemini JSON:", cleanedText);
    throw new Error("Gemini returned invalid JSON");
  }

  return parsed;
};

/* ================================
   GET INDUSTRY INSIGHTS
================================ */

export async function getIndustryInsights() {

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { industryInsight: true },
  });

  if (!user) throw new Error("User not found");

  // Generate only if missing
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

/* ================================
   UPDATE USER PROFILE
================================ */

export async function updateUser(data) {

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {

    // ✅ Check if industry insight exists
    let industryInsight = await db.industryInsight.findUnique({
      where: { industry: data.industry },
    });

    // ✅ Generate AI OUTSIDE transaction
    let insights = null;

    if (!industryInsight) {
      insights = await generateAIInsights(data.industry);
    }

    // ✅ Only DB operations inside transaction
    const result = await db.$transaction(async (tx) => {

      if (!industryInsight && insights) {
        industryInsight = await tx.industryInsight.create({
          data: {
            industry: data.industry,
            ...insights,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          industry: data.industry,
          experience: data.experience,
          bio: data.bio,
          skills: data.skills,
        },
      });

      return { updatedUser, industryInsight };
    });

    return { success: true, ...result };

  } catch (error) {

  console.error("FULL ERROR OBJECT:", error);

  const message =
    error instanceof Error
      ? error.message
      : JSON.stringify(error);

  throw new Error(message);
}

}

/* ================================
   ONBOARDING STATUS
================================ */

export async function getUserOnboardingStatus() {

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return {
    isOnboarded: !!user.industry,
  };
}
