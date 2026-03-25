// import { getUserOnboardingStatus } from '@/actions/user';
// import { redirect } from 'next/navigation';
// import React from 'react'
// import { getIndustryInsights } from '@/actions/dashboard';
// import DashboardView from './_component/dashboard-view';  
// export const runtime = "nodejs";


// const IndustryInsigtsPage = async() => {
//   const {isOnboarded} = await getUserOnboardingStatus();

//     if (!isOnboarded){
//       redirect("/onboarding");
//     }

//     return <div> IndustryInsightsPage</div>
// }

// export default IndustryInsigtsPage;

import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from "./_components/dashboard-view";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  // If not onboarded, redirect to onboarding page
  // Skip this check if already on the onboarding page
  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const insights = await getIndustryInsights();

  return (
    <div className="container mx-auto">
      <DashboardView insights={insights} />
    </div>
  );
}
