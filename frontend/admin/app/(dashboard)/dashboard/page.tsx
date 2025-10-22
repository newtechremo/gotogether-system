"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import the tab components to avoid SSR issues
const GoTogetherManagementTab = dynamic(() => import("@/components/tabs/GoTogetherManagementTab"), { ssr: false });
const RealtimeRentalsTab = dynamic(() => import("@/components/tabs/RealtimeRentalsTab"), { ssr: false });
const OverdueRentalsTab = dynamic(() => import("@/components/tabs/OverdueRentalsTab"), { ssr: false });
const FacilityManagementTab = dynamic(() => import("@/components/tabs/FacilityManagementTab"), { ssr: false });

function DashboardContent() {
  const searchParams = useSearchParams();
  const currentView = searchParams.get("tab") || "facility";

  return (
    <div className="space-y-6">
      {/* 탭 내용 */}
      {currentView === "gotogether" && <GoTogetherManagementTab />}
      {currentView === "realtime" && <RealtimeRentalsTab />}
      {currentView === "overdue" && <OverdueRentalsTab />}
      {currentView === "facility" && <FacilityManagementTab />}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">로딩 중...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
