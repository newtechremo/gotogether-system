"use client";

import { ProtectedRoute } from "@/lib/components/ProtectedRoute";
import GoTogetherManagementTab from "@/components/tabs/GoTogetherManagementTab";

export default function GoTogetherPage() {
  return (
    <ProtectedRoute>
      <GoTogetherManagementTab />
    </ProtectedRoute>
  );
}
