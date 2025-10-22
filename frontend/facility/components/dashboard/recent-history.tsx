import { Card } from "@/components/ui/card"
import type { Rental } from "@/lib/database"

interface RecentHistoryProps {
  history: Rental[]
}

const deviceTypeLabels = {
  AR_GLASSES: "AR 글라스",
  BONE_HEADSET: "골전도 이어폰",
  SMARTPHONE: "스마트폰",
}

export function RecentHistory({ history }: RecentHistoryProps) {
  const displayHistory = history.slice(0, 10)

  return (
    
  )
}
