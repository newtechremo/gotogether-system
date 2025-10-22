"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useKiosks,
  useCreateKiosk,
  useDeleteKiosk,
} from "@/lib/hooks/useKiosks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus } from "lucide-react";

export default function GoTogetherManagementTab() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null);

  // 폼 상태
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    managerName: "",
    managerPhone: "",
    installationDate: "",
    status: "active" as "active" | "inactive" | "maintenance",
    notes: "",
  });

  const { data: kiosksData, isLoading: kiosksLoading, refetch } = useKiosks(page, 10);
  const createKiosk = useCreateKiosk();
  const deleteKiosk = useDeleteKiosk();

  // 검색 필터 적용
  const filteredKiosks = kiosksData?.items.filter((kiosk) => {
    if (!searchTerm) return true;
    return (
      kiosk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kiosk.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kiosk.managerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // 상태별 뱃지 색상
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-300">운영중</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">비활성</Badge>;
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">점검중</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };


  // 키오스크 등록 핸들러
  const handleCreateKiosk = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createKiosk.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        location: "",
        managerName: "",
        managerPhone: "",
        installationDate: "",
        status: "active",
        notes: "",
      });
      refetch();
      alert("키오스크 위치가 성공적으로 등록되었습니다");
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "등록 중 오류가 발생했습니다");
    }
  };

  // 키오스크 상세 보기 - 별도 페이지로 이동
  const handleViewDetail = (kioskId: number) => {
    setLoadingDetailId(kioskId);
    router.push(`/kiosks/${kioskId}`);
  };

  // 키오스크 삭제
  const handleDeleteKiosk = async (id: number, name: string) => {
    if (!confirm(`정말 "${name}" 키오스크를 삭제하시겠습니까?`)) return;

    try {
      await deleteKiosk.mutateAsync(id);
      refetch();
      alert("키오스크가 성공적으로 삭제되었습니다");
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "삭제 중 오류가 발생했습니다");
    }
  };

  if (kiosksLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Go Together 키오스크 위치 관리</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="text-lg px-6 py-3 bg-black hover:bg-gray-800">
              <Plus className="mr-2 h-5 w-5" />
              신규 키오스크 등록
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">신규 키오스크 등록</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateKiosk} className="space-y-4">
              <div>
                <Label htmlFor="name">키오스크 이름 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: CGV강남점"
                  required
                />
              </div>

              <div>
                <Label htmlFor="location">설치 장소 *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="예: 서울 강남구 강남대로 438"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="managerName">담당자명</Label>
                  <Input
                    id="managerName"
                    value={formData.managerName}
                    onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                    placeholder="김영화"
                  />
                </div>
                <div>
                  <Label htmlFor="managerPhone">담당자 연락처</Label>
                  <Input
                    id="managerPhone"
                    value={formData.managerPhone}
                    onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                    placeholder="010-1234-5678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="installationDate">설치일</Label>
                  <Input
                    id="installationDate"
                    type="date"
                    value={formData.installationDate}
                    onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="status">상태</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">운영중</SelectItem>
                      <SelectItem value="inactive">비활성</SelectItem>
                      <SelectItem value="maintenance">점검중</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">비고</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="추가 정보 입력 (선택)"
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={createKiosk.isPending}
                >
                  {createKiosk.isPending ? "등록 중..." : "등록"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 검색 */}
      <div className="flex gap-4">
        <Input
          type="text"
          placeholder="키오스크명, 위치, 담당자명 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={() => refetch()}>
          <Search className="mr-2 h-4 w-4" />
          검색
        </Button>
      </div>

      {/* 키오스크 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>키오스크 위치 목록</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!filteredKiosks || filteredKiosks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">등록된 키오스크가 없습니다.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">No</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">키오스크명</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">위치</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">담당자</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">연락처</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">상태</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredKiosks.map((kiosk, index) => (
                      <tr key={kiosk.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">
                          {(page - 1) * 10 + index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">{kiosk.name}</td>
                        <td className="px-6 py-4 text-sm">{kiosk.location}</td>
                        <td className="px-6 py-4 text-sm">{kiosk.managerName || "-"}</td>
                        <td className="px-6 py-4 text-sm">{kiosk.managerPhone || "-"}</td>
                        <td className="px-6 py-4 text-sm">{getStatusBadge(kiosk.status)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetail(kiosk.id)}
                              disabled={loadingDetailId === kiosk.id}
                            >
                              {loadingDetailId === kiosk.id ? "로딩 중..." : "상세"}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteKiosk(kiosk.id, kiosk.name)}
                              disabled={loadingDetailId !== null}
                            >
                              삭제
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </>
          )}
        </CardContent>
      </Card>

      {/* 페이지네이션 */}
      {kiosksData && kiosksData.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            이전
          </Button>
          <span className="py-2 px-4">
            {page} / {kiosksData.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page >= kiosksData.totalPages}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
