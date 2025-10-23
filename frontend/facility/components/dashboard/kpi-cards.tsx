import { Card } from "@/components/ui/card"

interface KPICardsProps {
  totalDevices: number
  currentRentals: number
  availableDevices: number
  todayRentals: number
  todayReturns: number
}

export function KPICards({
  totalDevices,
  currentRentals,
  availableDevices,
  todayRentals,
  todayReturns,
}: KPICardsProps) {
  const kpiData = [
    {
      title: "총 보유 기기",
      value: totalDevices,
      description: "전체 등록된 기기 수량",
    },
    {
      title: "현재 대여중",
      value: currentRentals,
      description: "대여 중인 기기 수량",
    },
    {
      title: "대여 가능",
      value: availableDevices,
      description: "대여 가능한 기기 수량",
    },
    {
      title: "오늘 처리",
      value: `대여 ${todayRentals} / 반납 ${todayReturns}`,
      description: "오늘 대여/반납 건수",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpiData.map((item, index) => (
        <Card key={index} className="p-6 border-2 border-black bg-white">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-black leading-relaxed">{item.title}</h3>
            <div className="text-4xl font-bold text-black">{item.value}</div>
            
          </div>
        </Card>
      ))}
    </div>
  )
}
