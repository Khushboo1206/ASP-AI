


"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
// OpenRouter directly instead of @google/generative-ai to bypass limit:0
export const generateAIInsights = async (industry) => {
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
    
    IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
    Include at least 5 common roles for salary ranges.
    Growth rate should be a percentage.
    Include at least 5 skills and trends.
  `;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openrouter/free",
      messages: [{ role: "user", content: prompt }]
    })
  });

  const result = await response.json();

  if (!response.ok || result.error) {
    console.error("OpenRouter Error:", result);
    throw new Error(`OpenRouter API failed: ${result.error?.message || "Unknown error"}`);
  }
  if (!result.choices || result.choices.length === 0) {
    console.error("OpenRouter empty response:", result);
    throw new Error("OpenRouter returned an empty response. Please try again.");
  }

  const text = result.choices[0].message?.content || "";
  
  // Safely extract the JSON block in case the free model added conversational text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("AI returned invalid JSON format:", text);
    throw new Error("AI did not return valid JSON. Please try again.");
  }

  const cleanedText = jsonMatch[0].trim();
  const parsed = JSON.parse(cleanedText);
  
  return {
    ...parsed,
    demandLevel: parsed.demandLevel?.toUpperCase(),
    marketOutlook: parsed.marketOutlook?.toUpperCase(),
  };
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
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