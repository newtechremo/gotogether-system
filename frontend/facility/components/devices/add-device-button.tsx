"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AddDeviceDialog } from "./add-device-dialog"

export function AddDeviceButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="min-h-[44px] min-w-[44px] bg-black text-white hover:bg-gray-800 border-2 border-black text-lg px-8 py-4 font-semibold"
      >
        + 신규 등록
      </Button>

      {isOpen && <AddDeviceDialog onClose={() => setIsOpen(false)} />}
    </>
  )
}
