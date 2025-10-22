"use client";

import dynamic from "next/dynamic";

// Dynamically import the facilities page to avoid SSR issues
const FacilitiesContent = dynamic(() => import("@/app/(dashboard)/facilities/page"), { ssr: false });

export default function FacilityManagementTab() {
  return <FacilitiesContent />;
}
