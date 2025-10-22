"use client";

import { ProtectedRoute } from "@/lib/components/ProtectedRoute";
import OverdueRentalsTab from "@/components/tabs/OverdueRentalsTab";

export default function OverduePage() {
  return (
    <ProtectedRoute>
      <OverdueRentalsTab />
    </ProtectedRoute>
  );
}
