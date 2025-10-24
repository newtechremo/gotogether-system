"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/lib/components/ProtectedRoute";
import { useFacilities, useCreateFacility, useUpdateFacility, useDeleteFacility } from "@/lib/hooks/useFacility";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, KeyRound } from "lucide-react";
import type { Facility, CreateFacilityRequest, UpdateFacilityRequest } from "@/lib/api/facility.service";
import { ResetPasswordModal } from "@/components/facilities/reset-password-modal";
import { AlertDialogConfirm } from "@/components/ui/alert-dialog-confirm";
import { toast } from "sonner";

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
  const [passwordError, setPasswordError] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    id: number;
    name: string;
  }>({ open: false, id: 0, name: "" });

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

  const isPasswordValid = (password: string) => {
    return password.length >= 8 && /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/.test(password);
  };

  const handleAddFacility = () => {
    if (!isPasswordValid(newFacility.password)) {
      setPasswordError("비밀번호는 최소 8자 이상, 영문과 숫자를 포함해야 합니다.");
      return;
    }

    setPasswordError("");
    createFacility.mutate(newFacility, {
      onSuccess: () => {
        setShowAddModal(false);
        setPasswordError("");
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
      isActive: editingFacility.isActive,
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
    setConfirmDialog({ open: true, id, name });
  };

  const executeDeleteFacility = async () => {
    try {
      await deleteFacility.mutateAsync(confirmDialog.id);
      toast.success("삭제 완료", {
        description: "시설이 성공적으로 삭제되었습니다",
      });
    } catch (error: any) {
      toast.error("삭제 실패", {
        description: error.response?.data?.error?.message || "시설 삭제 중 오류가 발생했습니다",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">시설 관리</h1>

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
                <div className="space-y-2">
                  <Label htmlFor="facilityCode">시설 코드</Label>
                  <Input
                    id="facilityCode"
                    value={newFacility.facilityCode}
                    onChange={(e) => setNewFacility({ ...newFacility, facilityCode: e.target.value })}
                    placeholder="8자 이내 (예: FAC001)"
                    maxLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facilityName">시설명</Label>
                  <Input
                    id="facilityName"
                    value={newFacility.facilityName}
                    onChange={(e) => setNewFacility({ ...newFacility, facilityName: e.target.value })}
                    placeholder="20자 이내 (예: 서울시각장애인복지관)"
                    maxLength={20}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">로그인 아이디</Label>
                  <Input
                    id="username"
                    value={newFacility.username}
                    onChange={(e) => setNewFacility({ ...newFacility, username: e.target.value })}
                    placeholder="20자 이내 (예: facility001)"
                    maxLength={20}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newFacility.password}
                    onChange={(e) => {
                      setNewFacility({ ...newFacility, password: e.target.value });
                      setPasswordError("");
                    }}
                    placeholder="최소 8자, 영문+숫자 조합"
                  />
                  {passwordError && (
                    <p className="text-sm text-red-600">{passwordError}</p>
                  )}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700 font-semibold mb-1">비밀번호 요구사항:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      <li>최소 8자 이상</li>
                      <li>영문과 숫자 포함 필수</li>
                      <li>특수문자 사용 가능 (@$!%*#?&)</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managerName">담당자명</Label>
                  <Input
                    id="managerName"
                    value={newFacility.managerName}
                    onChange={(e) => setNewFacility({ ...newFacility, managerName: e.target.value })}
                    placeholder="예: 김철수"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managerPhone">담당자 연락처</Label>
                  <Input
                    id="managerPhone"
                    value={newFacility.managerPhone}
                    onChange={(e) => setNewFacility({ ...newFacility, managerPhone: e.target.value })}
                    placeholder="예: 010-1234-5678"
                  />
                </div>
                <div className="space-y-2">
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
            className="max-w-md text-base"
          />
          <Button onClick={handleSearch} className="text-base">
            <Search className="mr-2 h-4 w-4" />
            검색
          </Button>
        </div>

        {isLoading ? (
          <Card className="border-2 border-black bg-white">
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg">로딩 중...</p>
            </div>
          </Card>
        ) : !facilitiesData?.data?.items?.length ? (
          <Card className="border-2 border-black bg-white">
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg">등록된 시설이 없습니다.</p>
            </div>
          </Card>
        ) : (
          <Card className="border-2 border-black bg-white">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col style={{ width: '4%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '22%' }} />
                </colgroup>
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="px-3 py-6 text-left text-lg font-semibold text-black whitespace-nowrap">번호</th>
                    <th className="px-4 py-6 text-left text-lg font-semibold text-black">시설코드</th>
                    <th className="px-4 py-6 text-left text-lg font-semibold text-black">시설명</th>
                    <th className="px-4 py-6 text-left text-lg font-semibold text-black">아이디</th>
                    <th className="px-4 py-6 text-left text-lg font-semibold text-black">담당자</th>
                    <th className="px-4 py-6 text-left text-lg font-semibold text-black">연락처</th>
                    <th className="px-4 py-6 text-left text-lg font-semibold text-black">상태</th>
                    <th className="px-3 py-6 text-center text-lg font-semibold text-black">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {facilitiesData.data.items.map((facility, index) => (
                    <tr key={facility.id} className="hover:bg-gray-50">
                      <td className="px-3 py-4 text-base">
                        {(facilitiesData.data.page - 1) * facilitiesData.data.limit + index + 1}
                      </td>
                      <td className="px-4 py-4 text-base font-medium truncate" title={facility.facilityCode}>{facility.facilityCode}</td>
                      <td className="px-4 py-4 text-base font-medium" title={facility.facilityName}>
                        <div className="line-clamp-2">{facility.facilityName}</div>
                      </td>
                      <td className="px-4 py-4 text-base" title={facility.username}>
                        <div className="line-clamp-2 break-all">{facility.username}</div>
                      </td>
                      <td className="px-4 py-4 text-base truncate" title={facility.managerName || "-"}>{facility.managerName || "-"}</td>
                      <td className="px-4 py-4 text-base truncate" title={facility.managerPhone || "-"}>{facility.managerPhone || "-"}</td>
                      <td className="px-4 py-4 text-base">
                        <Badge className={facility.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {facility.isActive ? "활성" : "비활성"}
                        </Badge>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex justify-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingFacility(facility)} className="text-sm">
                            수정
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setResettingPasswordFacility(facility)}
                            className="text-blue-600 hover:text-blue-700"
                            title="비밀번호 재설정"
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteFacility(facility.id, facility.facilityName)}
                            className="text-base"
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
          </Card>
        )}

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
                <div className="space-y-2">
                  <Label htmlFor="edit-facilityName">시설명</Label>
                  <Input
                    id="edit-facilityName"
                    value={editingFacility.facilityName}
                    onChange={(e) => setEditingFacility({ ...editingFacility, facilityName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-managerName">담당자명</Label>
                  <Input
                    id="edit-managerName"
                    value={editingFacility.managerName || ""}
                    onChange={(e) => setEditingFacility({ ...editingFacility, managerName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-managerPhone">담당자 연락처</Label>
                  <Input
                    id="edit-managerPhone"
                    value={editingFacility.managerPhone || ""}
                    onChange={(e) => setEditingFacility({ ...editingFacility, managerPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-address">주소</Label>
                  <Input
                    id="edit-address"
                    value={editingFacility.address || ""}
                    onChange={(e) => setEditingFacility({ ...editingFacility, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-isActive">상태</Label>
                  <Select
                    value={editingFacility.isActive ? "active" : "inactive"}
                    onValueChange={(value) => setEditingFacility({ ...editingFacility, isActive: value === "active" })}
                  >
                    <SelectTrigger id="edit-isActive">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">활성</SelectItem>
                      <SelectItem value="inactive">비활성</SelectItem>
                    </SelectContent>
                  </Select>
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

        <AlertDialogConfirm
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
          title="시설 삭제 확인"
          description={`"${confirmDialog.name}" 시설을 삭제하시겠습니까?`}
          confirmText="삭제"
          cancelText="취소"
          onConfirm={executeDeleteFacility}
          variant="destructive"
        />
    </div>
  );
}
