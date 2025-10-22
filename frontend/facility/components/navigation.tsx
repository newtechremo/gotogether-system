"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useCurrentUser, useLogout } from "@/lib/hooks/useAuth"
import { Button } from "@/components/ui/button"

const navigationItems = [
  { href: "/", label: "대시보드", icon: "📊" },
  { href: "/devices", label: "기기관리", icon: "🎧" },
  { href: "/rentals", label: "대여/반납", icon: "🔄" },
  { href: "/history", label: "전체이력", icon: "📋" },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: userData } = useCurrentUser()
  const { mutate: logout } = useLogout()
  const [isNavigating, setIsNavigating] = useState(false)

  const handleLogout = () => {
    logout()
  }

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname !== href) {
      e.preventDefault()
      setIsNavigating(true)
      router.push(href)
    }
  }

  return (
    <div className="bg-white border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4">
        <div className="py-6">
          {/* 헤더: 타이틀 */}
          <div className="flex flex-col items-center mb-4">
            <h1 className="text-3xl font-bold text-black text-center">가치봄 플러스 시설관리자 시스템</h1>
            {userData && (
              <p className="text-xl font-medium text-gray-700 mt-2">
                {userData.facilityName}
              </p>
            )}
          </div>

          {/* 네비게이션 메뉴 */}
          <nav className="flex justify-center">
            <div className="flex space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={cn(
                    "px-6 py-3 text-lg font-medium rounded-lg transition-colors",
                    "min-h-[44px] min-w-[44px] flex items-center justify-center gap-2",
                    "border-2 border-black",
                    pathname === item.href ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100",
                    isNavigating && "pointer-events-none opacity-50"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              {/* 고장신고 버튼 */}
              <Link
                href="/repairs"
                onClick={(e) => handleNavClick(e, "/repairs")}
                className={cn(
                  "px-6 py-3 text-lg font-medium rounded-lg transition-colors",
                  "min-h-[44px] min-w-[44px] flex items-center justify-center gap-2",
                  "border-2 border-black",
                  pathname === "/repairs" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100",
                  isNavigating && "pointer-events-none opacity-50"
                )}
              >
                🔧
                <span>고장신고</span>
              </Link>
              {/* 시설정보 버튼 */}
              <Link href="/profile" onClick={(e) => handleNavClick(e, "/profile")}>
                <button
                  className={cn(
                    "px-6 py-3 text-lg font-medium rounded-lg transition-colors",
                    "min-h-[44px] min-w-[44px] flex items-center justify-center gap-2",
                    "border-2 border-black",
                    pathname === "/profile" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100",
                    isNavigating && "pointer-events-none opacity-50"
                  )}
                >
                  🏢 <span>시설정보</span>
                </button>
              </Link>
              {/* 로그아웃 버튼 */}
              <button
                onClick={handleLogout}
                className={cn(
                  "px-6 py-3 text-lg font-medium rounded-lg transition-colors",
                  "min-h-[44px] min-w-[44px] flex items-center justify-center gap-2",
                  "border-2 border-black bg-white text-black hover:bg-gray-100"
                )}
              >
                🚪 <span>로그아웃</span>
              </button>
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
