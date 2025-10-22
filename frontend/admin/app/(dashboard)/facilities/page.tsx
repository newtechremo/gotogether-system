"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/lib/components/ProtectedRoute";
import { useFacilities, useCreateFacility, useUpdateFacility, useDeleteFacility } from "@/lib/hooks/useFacility";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, KeyRound } from "lucide-react";
import type { Facility, CreateFacilityRequest, UpdateFacilityRequest } from "@/lib/api/facility.service";
import { ResetPasswordModal } from "@/components/facilities/reset-password-modal";

export default function FacilitiesPage() {
  return (
    <ProtectedRoute>
      <FacilitiesContent />
    </ProtectedRoute>
  );
}

function FacilitiesContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [resettingPasswordFacility, setResettingPasswordFacility] = useState<Facility | null>(null);

  const { data: facilitiesData, isLoading } = useFacilities(page, 10, search);
  const createFacility = useCreateFacility();
  const updateFacility = useUpdateFacility();
  const deleteFacility = useDeleteFacility();

  const [newFacility, setNewFacility] = useState<CreateFacilityRequest>({
    facilityCode: "",
    facilityName: "",
    username: "",
    password: "",
    managerName: "",
    managerPhone: "",
    address: "",
  });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleAddFacility = () => {
    createFacility.mutate(newFacility, {
      onSuccess: () => {
        setShowAddModal(false);
        setNewFacility({
          facilityCode: "",
          facilityName: "",
          username: "",
          password: "",
          managerName: "",
          managerPhone: "",
          address: "",
        });
      },
    });
  };

  const handleUpdateFacility = () => {
    if (!editingFacility) return;

    const updateData: UpdateFacilityRequest = {
      facilityName: editingFacility.facilityName,
      managerName: editingFacility.managerName,
      managerPhone: editingFacility.managerPhone,
      address: editingFacility.address,
    };

    updateFacility.mutate(
      { id: editingFacility.id, data: updateData },
      {
        onSuccess: () => {
          setEditingFacility(null);
        },
      }
    );
  };

  const handleDeleteFacility = (id: number, name: string) => {
    if (confirm(`"${name}" 시설을 삭제하시겠습니까?`)) {
      deleteFacility.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">시설 관리</h1>

          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button size="lg" className="text-lg px-6 py-3 bg-black hover:bg-gray-800">
                <Plus className="mr-2 h-5 w-5" />
                신규 시설 등록
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">신규 시설 등록</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="facilityCode">시설 코드</Label>
                  <Input
                    id="facilityCode"
                    value={newFacility.facilityCode}
                    onChange={(e) => setNewFacility({ ...newFacility, facilityCode: e.target.value })}
                    placeholder="예: FAC001"
                  />
                </div>
                <div>
                  <Label htmlFor="facilityName">시설명</Label>
                  <Input
                    id="facilityName"
                    value={newFacility.facilityName}
                    onChange={(e) => setNewFacility({ ...newFacility, facilityName: e.target.value })}
                    placeholder="예: 서울시각장애인복지관"
                  />
                </div>
                <div>
                  <Label htmlFor="username">로그인 아이디</Label>
                  <Input
                    id="username"
                    value={newFacility.username}
                    onChange={(e) => setNewFacility({ ...newFacility, username: e.target.value })}
                    placeholder="예: facility001"
                  />
                </div>
                <div>
                  <Label htmlFor="password">비밀번호</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newFacility.password}
                    onChange={(e) => setNewFacility({ ...newFacility, password: e.target.value })}
                    placeholder="최소 6자 이상"
                  />
                </div>
                <div>
                  <Label htmlFor="managerName">담당자명</Label>
                  <Input
                    id="managerName"
                    value={newFacility.managerName}
                    onChange={(e) => setNewFacility({ ...newFacility, managerName: e.target.value })}
                    placeholder="예: 김철수"
                  />
                </div>
                <div>
                  <Label htmlFor="managerPhone">담당자 연락처</Label>
                  <Input
                    id="managerPhone"
                    value={newFacility.managerPhone}
                    onChange={(e) => setNewFacility({ ...newFacility, managerPhone: e.target.value })}
                    placeholder="예: 010-1234-5678"
                  />
                </div>
                <div>
                  <Label htmlFor="address">주소</Label>
                  <Input
                    id="address"
                    value={newFacility.address}
                    onChange={(e) => setNewFacility({ ...newFacility, address: e.target.value })}
                    placeholder="예: 서울시 강남구 ..."
                  />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <Button variant="outline" onClick={() => setShowAddModal(false)}>
                    취소
                  </Button>
                  <Button onClick={handleAddFacility} disabled={createFacility.isPending}>
                    {createFacility.isPending ? "등록 중..." : "등록"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="시설명, 시설코드, 담당자명 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="max-w-md"
          />
          <Button onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            검색
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>시설 목록</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">로딩 중...</div>
            ) : !facilitiesData?.data?.items?.length ? (
              <div className="p-8 text-center text-gray-500">등록된 시설이 없습니다.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">No</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">시설코드</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">시설명</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">아이디</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">담당자</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">연락처</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">상태</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {facilitiesData.data.items.map((facility, index) => (
                      <tr key={facility.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">
                          {(facilitiesData.data.page - 1) * facilitiesData.data.limit + index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">{facility.facilityCode}</td>
                        <td className="px-6 py-4 text-sm font-medium">{facility.facilityName}</td>
                        <td className="px-6 py-4 text-sm">{facility.username}</td>
                        <td className="px-6 py-4 text-sm">{facility.managerName || "-"}</td>
                        <td className="px-6 py-4 text-sm">{facility.managerPhone || "-"}</td>
                        <td className="px-6 py-4 text-sm">
                          <Badge className={facility.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {facility.isActive ? "활성" : "비활성"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setEditingFacility(facility)}>
                              수정
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setResettingPasswordFacility(facility)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <KeyRound className="h-4 w-4 mr-1" />
                              비밀번호 재설정
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteFacility(facility.id, facility.facilityName)}
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
            )}
          </CardContent>
        </Card>

        {facilitiesData?.data && facilitiesData.data.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              이전
            </Button>
            <span className="py-2 px-4">
              {page} / {facilitiesData.data.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= facilitiesData.data.totalPages}
            >
              다음
            </Button>
          </div>
        )}

        <Dialog open={editingFacility !== null} onOpenChange={() => setEditingFacility(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">시설 정보 수정</DialogTitle>
            </DialogHeader>
            {editingFacility && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">시설 코드: {editingFacility.facilityCode}</p>
                  <p className="text-sm text-gray-600">아이디: {editingFacility.username}</p>
                </div>
                <div>
                  <Label htmlFor="edit-facilityName">시설명</Label>
                  <Input
                    id="edit-facilityName"
                    value={editingFacility.facilityName}
                    onChange={(e) => setEditingFacility({ ...editingFacility, facilityName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-managerName">담당자명</Label>
                  <Input
                    id="edit-managerName"
                    value={editingFacility.managerName || ""}
                    onChange={(e) => setEditingFacility({ ...editingFacility, managerName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-managerPhone">담당자 연락처</Label>
                  <Input
                    id="edit-managerPhone"
                    value={editingFacility.managerPhone || ""}
                    onChange={(e) => setEditingFacility({ ...editingFacility, managerPhone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-address">주소</Label>
                  <Input
                    id="edit-address"
                    value={editingFacility.address || ""}
                    onChange={(e) => setEditingFacility({ ...editingFacility, address: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <Button variant="outline" onClick={() => setEditingFacility(null)}>
                    취소
                  </Button>
                  <Button onClick={handleUpdateFacility} disabled={updateFacility.isPending}>
                    {updateFacility.isPending ? "수정 중..." : "수정"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {resettingPasswordFacility && (
          <ResetPasswordModal
            facilityId={resettingPasswordFacility.id}
            facilityName={resettingPasswordFacility.facilityName}
            open={resettingPasswordFacility !== null}
            onOpenChange={(open) => !open && setResettingPasswordFacility(null)}
          />
        )}
      </div>
    </div>
  );
}
