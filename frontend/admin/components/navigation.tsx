"use client"
import { useState, useEffect } from "react"
import { useCurrentUser, useLogout } from "@/lib/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { Package, Clock, AlertTriangle, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navigation() {
  const { data: userData } = useCurrentUser()
  const { mutate: logout } = useLogout()
  const router = useRouter()
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)

  // pathname이 변경되면 로딩 종료
  useEffect(() => {
    setIsNavigating(false)
  }, [pathname])

  // 키오스크 상세 페이지인 경우 gotogether 탭 활성화
  const isKioskDetailPage = pathname?.startsWith("/kiosks/")

  // Determine current tab based on pathname
  const getCurrentTab = () => {
    if (isKioskDetailPage || pathname === "/gotogether") return "gotogether"
    if (pathname === "/realtime") return "realtime"
    if (pathname === "/overdue") return "overdue"
    if (pathname === "/facilities") return "facility"
    return "facility" // default
  }

  const currentTab = getCurrentTab()

  const handleLogout = () => {
    logout()
  }

  const handleTabClick = (route: string) => {
    if (pathname !== route) {
      setIsNavigating(true)
      router.push(route)
    }
  }

  return (
    <div className="bg-white border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4">
        <div className="py-6">
          {/* 헤더: 타이틀과 사용자 정보 */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1" />
            <h1 className="text-3xl font-bold text-black flex-1 text-center whitespace-nowrap">
              가치봄 플러스 Go Together 관리자 시스템
            </h1>
            <div className="flex-1 flex justify-end items-center gap-4">
              {userData && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {userData.name}
                  </span>
                </div>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-2 border-black text-black hover:bg-black hover:text-white transition-colors"
              >
                🚪 로그아웃
              </Button>
            </div>
          </div>

          {/* Go Together 탭 메뉴 */}
          <nav className="flex justify-center">
            <div className="flex space-x-1">
              <Button
                onClick={() => handleTabClick("/gotogether")}
                variant={currentTab === "gotogether" ? "default" : "outline"}
                size="lg"
                className={cn(
                  "text-lg px-8 py-4 h-auto",
                  isNavigating && "pointer-events-none opacity-50"
                )}
                disabled={isNavigating}
              >
                <Package className="mr-2 h-5 w-5" />
                Go Together 관리
              </Button>
              <Button
                onClick={() => handleTabClick("/realtime")}
                variant={currentTab === "realtime" ? "default" : "outline"}
                size="lg"
                className={cn(
                  "text-lg px-8 py-4 h-auto",
                  isNavigating && "pointer-events-none opacity-50"
                )}
                disabled={isNavigating}
              >
                <Clock className="mr-2 h-5 w-5" />
                Go Together 실시간 대여 현황
              </Button>
              <Button
                onClick={() => handleTabClick("/overdue")}
                variant={currentTab === "overdue" ? "default" : "outline"}
                size="lg"
                className={cn(
                  "text-lg px-8 py-4 h-auto",
                  isNavigating && "pointer-events-none opacity-50"
                )}
                disabled={isNavigating}
              >
                <AlertTriangle className="mr-2 h-5 w-5" />
                Go Together 장기 미반납자
              </Button>
              <Button
                onClick={() => handleTabClick("/facilities")}
                variant={currentTab === "facility" ? "default" : "outline"}
                size="lg"
                className={cn(
                  "text-lg px-8 py-4 h-auto",
                  isNavigating && "pointer-events-none opacity-50"
                )}
                disabled={isNavigating}
              >
                <Building2 className="mr-2 h-5 w-5" />
                시설관리
              </Button>
            </div>
          </nav>
        </div>
      </div>

      {/* 로딩 오버레이 */}
      {isNavigating && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
          <div className="bg-white rounded-lg p-8 border-4 border-black shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
              <p className="text-2xl font-bold text-black">페이지 이동 중...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
