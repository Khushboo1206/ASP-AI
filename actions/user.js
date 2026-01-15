"use server";
import { MarketOutlook, DemandLevel } from "@/lib/generated/prisma";
import { db } from "@/lib/prisma";
import {auth} from "@clerk/nextjs/server"
import { generateAIInsights } from "./dashboard";

export async function updateUser(data){
const { userId } = await auth();
if (!userId) throw new Error ("Unauthorized");

const user = await db.user.findUnique({
    where:{
        clerkUserId: userId,
    }
});

if (!user) throw new Error("User not found");

try {
const result = await db.$transaction(
    async (tx)=>  {
        // find if the industry exists
    let industryInsight = await tx.industryInsight.findUnique({
     where:{
        industry: data.industry,
     },
    });
    // If industries doesnt exist , create it with default values- will replace it with ai later
    
    if(!industryInsight){
        const insights = await generateAIInsights (data.industry);
        
        industryInsight= await db.industryInsight.create({
                    data:{
                        industry: data.industry,
                        ...insights,
                        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 1000),
                    },
                });
    }
console.log("PRISMA DEBUG:", {
  hasDb: !!db,
  userModel: db?.user,
  industryInsightModel: db?.industryInsight,
});
    // updateUser the user
    const updateUser = await tx.user.update({
        where:{
            id: user.id,
        },
        data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
        },
    });
    console.log("UPDATED USER INDUSTRY:", updateUser.industry);

     return { updateUser, industryInsight};
    },
    {
   timeout: 10000,
});
 return {sucess:true,...result};
} catch (error){
    console.error("Error updating user and industry:", error.message);
    throw new Error("Failed to updateUser profile" + error.message);
} 
}

export async function getUserOnboardingStatus() {
    const { userId } = await auth();
if (!userId) throw new Error ("Unauthorized");

const user = await db.user.findUnique({
    where:{clerkUserId: userId},
});

if (!user) throw new Error("User not found");

try {
   const user = await db.user.findUnique({
    where:{
        clerkUserId: userId,
    },
   });

   return{
    isOnboarded: !!user?.industry,
   };
}catch (error){
console.error("Error checking onboaarding status:" , error.message);
throw new Error("Failed to check onboarding ststus")
}
}