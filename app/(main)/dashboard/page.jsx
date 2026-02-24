import { getUserOnboardingStatus } from '@/actions/user';
import { redirect } from 'next/navigation';
import React from 'react'

export const runtime = "nodejs";


const IndustryInsigtsPage = async() => {
  
    const {isOnboarded} = await getUserOnboardingStatus();
  
    if (!isOnboarded){
      redirect("/onboarding");
    }

    return <div> IndustryInsightsPage</div>
}
 
  

export default IndustryInsigtsPage;