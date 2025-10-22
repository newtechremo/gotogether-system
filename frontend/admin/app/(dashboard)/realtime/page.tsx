"use client";

import { ProtectedRoute } from "@/lib/components/ProtectedRoute";
import RealtimeRentalsTab from "@/components/tabs/RealtimeRentalsTab";

export default function RealtimePage() {
  return (
    <ProtectedRoute>
      <RealtimeRentalsTab />
    </ProtectedRoute>
  );
}
