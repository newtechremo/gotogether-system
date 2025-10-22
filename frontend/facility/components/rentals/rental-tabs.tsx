"use client"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RentForm } from "./rent-form"
import { ReturnForm } from "./return-form"
import type { FacilityDevice } from "@/lib/api/device.service"
import type { FacilityRental } from "@/lib/api/rental.service"

interface RentalTabsProps {
  devices: FacilityDevice[]
  currentRentals: FacilityRental[]
}

export function RentalTabs({ devices, currentRentals }: RentalTabsProps) {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<"rent" | "return">("rent")

  // Read URL parameters and set active tab
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'return' || tab === 'rent') {
      setActiveTab(tab)
    }
  }, [searchParams])

  return (
    <Card className="border-2 border-black bg-white">
      <div className="border-b-2 border-black">
        <div className="flex">
          <Button
            onClick={() => setActiveTab("rent")}
            className={`flex-1 min-h-[60px] text-xl font-semibold rounded-none border-r border-black ${
              activeTab === "rent" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            대여하기
          </Button>
          <Button
            onClick={() => setActiveTab("return")}
            className={`flex-1 min-h-[60px] text-xl font-semibold rounded-none ${
              activeTab === "return" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            반납하기
          </Button>
        </div>
      </div>

      <div className="p-8">
        {activeTab === "rent" ? (
          <RentForm devices={devices} />
        ) : (
          <ReturnForm currentRentals={currentRentals} preselectedRentalId={searchParams.get('rentalId')} />
        )}
      </div>
    </Card>
  )
}
