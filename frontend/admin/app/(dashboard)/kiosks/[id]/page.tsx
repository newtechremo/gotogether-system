"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useKiosk,
  useKioskExaminations,
  useCreateExamination,
  useUpdateKiosk,
  useDeleteKiosk,
  useKioskDevices,
  useCreateKioskDevice,
  useUpdateKioskDevice,
  useDeleteKioskDevice,
  useKioskRentals,
  useForceReturnRental,
  type KioskExamination,
  type KioskDevice,
  type KioskRental,
} from "@/lib/hooks/useKiosks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, ClipboardCheck, Edit, Trash2, MoreVertical, Phone, MessageSquare } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface KioskDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function KioskDetailPage({ params }: KioskDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const kioskId = parseInt(id);

  const [isExaminationDialogOpen, setIsExaminationDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeviceDialogOpen, setIsDeviceDialogOpen] = useState(false);
  const [isDeviceEditDialogOpen, setIsDeviceEditDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<KioskDevice | null>(null);

  const [examinationFormData, setExaminationFormData] = useState({
    examinationDate: new Date().toISOString().split("T")[0],
    result: "pass" as "pass" | "fail" | "pending",
    status: "normal" as "normal" | "warning" | "critical",
    notes: "",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    location: "",
    managerName: "",
    managerPhone: "",
    installationDate: "",
    status: "active" as "active" | "inactive" | "maintenance",
    notes: "",
  });

  const [deviceFormData, setDeviceFormData] = useState({
    deviceType: "AR_GLASS" as "AR_GLASS" | "BONE_CONDUCTION" | "SMARTPHONE",
    serialNumber: "",
    nfcTagId: "",
    purchaseDate: "",
    notes: "",
  });

  // 시리얼번호 자동 생성 함수
  const generateSerialNumber = (deviceType: string): string => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    const prefix = deviceType === "AR_GLASS" ? "AR"
                  : deviceType === "BONE_CONDUCTION" ? "BC"
                  : "SP";

    return `${prefix}${year}${month}${day}${random}`;
  };

  const [deviceEditFormData, setDeviceEditFormData] = useState({
    deviceType: "AR_GLASS" as "AR_GLASS" | "BONE_CONDUCTION" | "SMARTPHONE",
    serialNumber: "",
    boxNumber: 1,
    status: "available" as "available" | "rented" | "maintenance" | "broken",
    nfcTagId: "",
    purchaseDate: "",
    notes: "",
  });

  const { data: kiosk, isLoading: kioskLoading, refetch } = useKiosk(kioskId);
  const { data: examinations, refetch: refetchExaminations } = useKioskExaminations(kioskId);
  const { data: devices, refetch: refetchDevices } = useKioskDevices(kioskId);
  const { data: rentals, refetch: refetchRentals } = useKioskRentals(kioskId);
  const createExamination = useCreateExamination();
  const updateKiosk = useUpdateKiosk();
  const deleteKiosk = useDeleteKiosk();
  const createDevice = useCreateKioskDevice();
  const updateDevice = useUpdateKioskDevice();
  const deleteDevice = useDeleteKioskDevice();
  const forceReturnRental = useForceReturnRental();

  // 키오스크 데이터가 로드되면 편집 폼 초기화
  useEffect(() => {
    if (kiosk) {
      setEditFormData({
        name: kiosk.name,
        location: kiosk.location,
        managerName: kiosk.managerName || "",
        managerPhone: kiosk.managerPhone || "",
        installationDate: kiosk.installationDate || "",
        status: kiosk.status,
        notes: kiosk.notes || "",
      });
    }
  }, [kiosk]);

  // 장비 등록 다이얼로그가 열릴 때 시리얼번호 자동 생성
  useEffect(() => {
    if (isDeviceDialogOpen) {
      const serialNumber = generateSerialNumber(deviceFormData.deviceType);
      setDeviceFormData(prev => ({ ...prev, serialNumber }));
    }
  }, [isDeviceDialogOpen]);

  // 장비 타입이 변경될 때 시리얼번호 재생성
  useEffect(() => {
    if (isDeviceDialogOpen) {
      const serialNumber = generateSerialNumber(deviceFormData.deviceType);
      setDeviceFormData(prev => ({ ...prev, serialNumber }));
    }
  }, [deviceFormData.deviceType, isDeviceDialogOpen]);

  // 상태별 뱃지
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

  // 장비 상태별 뱃지
  const getDeviceStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800 border-green-300">사용가능</Badge>;
      case "rented":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">대여중</Badge>;
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">점검중</Badge>;
      case "broken":
        return <Badge className="bg-red-100 text-red-800 border-red-300">고장</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // 장비 타입명
  const getDeviceTypeName = (type: string) => {
    switch (type) {
      case "AR_GLASS":
        return "AR 글라스";
      case "BONE_CONDUCTION":
        return "골전도 이어폰";
      case "SMARTPHONE":
        return "스마트폰";
      default:
        return type;
    }
  };

  // 검점결과 뱃지
  const getExaminationResultBadge = (result: string) => {
    switch (result) {
      case "pass":
        return <Badge className="bg-green-100 text-green-800 border-green-300">통과</Badge>;
      case "fail":
        return <Badge className="bg-red-100 text-red-800 border-red-300">실패</Badge>;
      case "pending":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">대기</Badge>;
      default:
        return <Badge>{result}</Badge>;
    }
  };

  // 대여 상태 뱃지
  const getRentalStatusBadge = (status: string) => {
    switch (status) {
      case "rented":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">대여중</Badge>;
      case "returned":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">반납완료</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800 border-red-300">연체</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // 모바일 디바이스 감지
  const isMobileDevice = () => {
    if (typeof window === "undefined") return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // 점검 기록 추가 - 점검 결과에 따라 키오스크 상태 변경
  const handleCreateExamination = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 점검 기록 추가
      await createExamination.mutateAsync({
        kioskId,
        ...examinationFormData,
      });

      // 점검 결과에 따라 키오스크 상태 변경
      const newStatus = examinationFormData.result === "fail" ? "inactive" : "active";
      await updateKiosk.mutateAsync({
        id: kioskId,
        status: newStatus,
      });

      setIsExaminationDialogOpen(false);
      setExaminationFormData({
        examinationDate: new Date().toISOString().split("T")[0],
        result: "pass",
        status: "normal",
        notes: "",
      });
      refetchExaminations();
      refetch();
      alert(
        `점검 기록이 성공적으로 추가되었습니다.\n키오스크 상태가 "${
          newStatus === "active" ? "운영중" : "비활성"
        }"으로 변경되었습니다.`
      );
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "점검 기록 추가 중 오류가 발생했습니다");
    }
  };

  // 장비 등록
  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createDevice.mutateAsync({
        kioskId,
        ...deviceFormData,
      });
      setIsDeviceDialogOpen(false);
      setDeviceFormData({
        deviceType: "AR_GLASS",
        serialNumber: "",
        nfcTagId: "",
        purchaseDate: "",
        notes: "",
      });
      refetchDevices();
      refetch();
      alert("장비가 성공적으로 등록되었습니다");
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "장비 등록 중 오류가 발생했습니다");
    }
  };

  // 장비 수정 다이얼로그 열기
  const handleEditDevice = (device: KioskDevice) => {
    setEditingDevice(device);
    setDeviceEditFormData({
      deviceType: device.deviceType,
      serialNumber: device.serialNumber,
      boxNumber: device.boxNumber,
      status: device.status,
      nfcTagId: device.nfcTagId || "",
      purchaseDate: device.purchaseDate || "",
      notes: device.notes || "",
    });
    setIsDeviceEditDialogOpen(true);
  };

  // 장비 수정
  const handleUpdateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice) return;

    try {
      await updateDevice.mutateAsync({
        id: editingDevice.id,
        kioskId,
        ...deviceEditFormData,
      });
      setIsDeviceEditDialogOpen(false);
      setEditingDevice(null);
      refetchDevices();
      refetch();
      alert("장비 정보가 성공적으로 수정되었습니다");
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "장비 수정 중 오류가 발생했습니다");
    }
  };

  // 장비 삭제
  const handleDeleteDevice = async (deviceId: number, serialNumber: string) => {
    if (!confirm(`정말 "${serialNumber}" 장비를 삭제하시겠습니까?`)) return;

    try {
      await deleteDevice.mutateAsync({ id: deviceId, kioskId });
      refetchDevices();
      refetch();
      alert("장비가 성공적으로 삭제되었습니다");
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "장비 삭제 중 오류가 발생했습니다");
    }
  };

  // 전화번호 유효성 검사 함수
  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone) return true; // 선택 필드이므로 빈 값은 허용
    const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  // 키오스크 정보 수정
  const handleUpdateKiosk = async (e: React.FormEvent) => {
    e.preventDefault();

    // 전화번호 유효성 검사
    if (editFormData.managerPhone && !validatePhoneNumber(editFormData.managerPhone)) {
      alert("올바른 전화번호 형식이 아닙니다.\n예: 010-1234-5678");
      return;
    }

    try {
      await updateKiosk.mutateAsync({
        id: kioskId,
        ...editFormData,
      });
      setIsEditDialogOpen(false);
      refetch();
      alert("키오스크 정보가 성공적으로 수정되었습니다");
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "수정 중 오류가 발생했습니다");
    }
  };

  // 키오스크 삭제
  const handleDeleteKiosk = async () => {
    if (!kiosk) return;
    if (!confirm(`정말 "${kiosk.name}" 키오스크를 삭제하시겠습니까?`)) return;

    try {
      await deleteKiosk.mutateAsync(kioskId);
      alert("키오스크가 성공적으로 삭제되었습니다");
      router.push("/dashboard?tab=gotogether");
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "삭제 중 오류가 발생했습니다");
    }
  };

  // 강제 반납 처리
  const handleForceReturn = async (rentalId: number, renterName: string) => {
    if (!confirm(`"${renterName}"님의 대여를 강제 반납하시겠습니까?`)) return;

    try {
      await forceReturnRental.mutateAsync({ id: rentalId, kioskId });
      refetchRentals();
      refetchDevices();
      alert("강제 반납이 완료되었습니다");
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "강제 반납 중 오류가 발생했습니다");
    }
  };

  // 전화걸기
  const handleCall = (phone: string) => {
    if (isMobileDevice()) {
      window.location.href = `tel:${phone}`;
    } else {
      alert(`연락처: ${phone}\n\n※ 모바일에서는 자동으로 전화 앱이 실행됩니다.`);
    }
  };

  // SMS 보내기
  const handleSMS = (phone: string) => {
    if (isMobileDevice()) {
      window.location.href = `sms:${phone}`;
    } else {
      alert(`연락처: ${phone}\n\n※ 모바일에서는 자동으로 SMS 앱이 실행됩니다.`);
    }
  };

  if (kioskLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!kiosk) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-600">키오스크를 찾을 수 없습니다.</p>
          <Button onClick={() => router.push("/dashboard?tab=gotogether")} className="mt-4">
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard?tab=gotogether")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Button>
          <h1 className="text-3xl font-bold">{kiosk.name}</h1>
          {getStatusBadge(kiosk.status)}
        </div>
        <div className="flex gap-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                수정
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">키오스크 정보 수정</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateKiosk} className="space-y-4">
                <div>
                  <Label htmlFor="name">키오스크 이름 *</Label>
                  <Input
                    id="name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">설치 장소 *</Label>
                  <Input
                    id="location"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="managerName">담당자명</Label>
                    <Input
                      id="managerName"
                      value={editFormData.managerName}
                      onChange={(e) => setEditFormData({ ...editFormData, managerName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="managerPhone">담당자 연락처</Label>
                    <Input
                      id="managerPhone"
                      value={editFormData.managerPhone}
                      onChange={(e) => setEditFormData({ ...editFormData, managerPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="installationDate">설치일</Label>
                    <Input
                      id="installationDate"
                      type="date"
                      value={editFormData.installationDate}
                      onChange={(e) => setEditFormData({ ...editFormData, installationDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">상태</Label>
                    <Select value={editFormData.status} onValueChange={(value: any) => setEditFormData({ ...editFormData, status: value })}>
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
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    취소
                  </Button>
                  <Button type="submit" disabled={updateKiosk.isPending}>
                    {updateKiosk.isPending ? "수정 중..." : "수정"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="destructive" onClick={handleDeleteKiosk}>
            <Trash2 className="mr-2 h-4 w-4" />
            삭제
          </Button>
        </div>
      </div>

      {/* 기본 정보 */}
      <Card className="border-2 border-black bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-black">기본 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-base text-gray-600">키오스크 이름</Label>
              <p className="text-lg font-medium">{kiosk.name}</p>
            </div>
            <div>
              <Label className="text-base text-gray-600">상태</Label>
              <div>{getStatusBadge(kiosk.status)}</div>
            </div>
            <div className="col-span-2">
              <Label className="text-base text-gray-600">설치 장소</Label>
              <p className="text-lg font-medium">{kiosk.location}</p>
            </div>
            <div>
              <Label className="text-base text-gray-600">담당자</Label>
              <p className="text-lg font-medium">{kiosk.managerName || "-"}</p>
            </div>
            <div>
              <Label className="text-base text-gray-600">연락처</Label>
              <p className="text-lg font-medium">{kiosk.managerPhone || "-"}</p>
            </div>
            <div>
              <Label className="text-base text-gray-600">설치일</Label>
              <p className="text-lg font-medium">
                {kiosk.installationDate ? new Date(kiosk.installationDate).toLocaleDateString() : "-"}
              </p>
            </div>
            <div>
              <Label className="text-base text-gray-600">등록 장비 수</Label>
              <p className="text-lg font-medium">{devices?.length || 0}대</p>
            </div>
            {kiosk.notes && (
              <div className="col-span-2">
                <Label className="text-base text-gray-600">비고</Label>
                <p className="text-lg font-medium">{kiosk.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 등록된 장비 */}
      <Card className="border-2 border-black bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-black">등록된 장비</CardTitle>
            <Dialog open={isDeviceDialogOpen} onOpenChange={setIsDeviceDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  장비 등록
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl">장비 등록</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateDevice} className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deviceType">장비 유형 *</Label>
                      <Select value={deviceFormData.deviceType} onValueChange={(value: any) => setDeviceFormData({ ...deviceFormData, deviceType: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AR_GLASS">AR 글라스</SelectItem>
                          <SelectItem value="BONE_CONDUCTION">골전도 이어폰</SelectItem>
                          <SelectItem value="SMARTPHONE">스마트폰</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serialNumber">시리얼 번호 (자동생성)</Label>
                      <Input
                        id="serialNumber"
                        value={deviceFormData.serialNumber}
                        readOnly
                        disabled
                        className="bg-gray-100 cursor-not-allowed"
                        placeholder="자동으로 생성됩니다"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nfcTagId">NFC 태그 ID</Label>
                      <Input
                        id="nfcTagId"
                        value={deviceFormData.nfcTagId}
                        onChange={(e) => setDeviceFormData({ ...deviceFormData, nfcTagId: e.target.value })}
                        placeholder="예: NFC_AR_001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purchaseDate">구매일</Label>
                      <Input
                        id="purchaseDate"
                        type="date"
                        value={deviceFormData.purchaseDate}
                        onChange={(e) => setDeviceFormData({ ...deviceFormData, purchaseDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deviceNotes">비고</Label>
                    <Textarea
                      id="deviceNotes"
                      value={deviceFormData.notes}
                      onChange={(e) => setDeviceFormData({ ...deviceFormData, notes: e.target.value })}
                      placeholder="추가 정보 입력 (선택)"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDeviceDialogOpen(false)}>
                      취소
                    </Button>
                    <Button type="submit" disabled={createDevice.isPending}>
                      {createDevice.isPending ? "등록 중..." : "등록"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {devices && devices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="p-6 text-left text-lg font-semibold text-black">장비 유형</th>
                    <th className="p-6 text-left text-lg font-semibold text-black">시리얼 번호</th>
                    <th className="p-6 text-left text-lg font-semibold text-black">상태</th>
                    <th className="p-6 text-left text-lg font-semibold text-black">NFC 태그</th>
                    <th className="p-6 text-right text-lg font-semibold text-black">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {devices.map((device) => (
                    <tr key={device.id} className="hover:bg-gray-50">
                      <td className="p-6 text-base font-medium">{getDeviceTypeName(device.deviceType)}</td>
                      <td className="p-6 text-base">{device.serialNumber}</td>
                      <td className="p-6 text-base">{getDeviceStatusBadge(device.status)}</td>
                      <td className="p-6 text-base">{device.nfcTagId || "-"}</td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditDevice(device)} className="text-base">
                            <Edit className="mr-1 h-3 w-3" />
                            수정
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteDevice(device.id, device.serialNumber)} className="text-base">
                            삭제
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">등록된 장비가 없습니다</p>
              <p className="text-sm text-gray-400">위 버튼을 클릭하여 장비를 등록하세요</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 장비 수정 다이얼로그 */}
      <Dialog open={isDeviceEditDialogOpen} onOpenChange={setIsDeviceEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">장비 정보 수정</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateDevice} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editDeviceType">장비 유형 *</Label>
                <Select
                  value={deviceEditFormData.deviceType}
                  onValueChange={(value: any) => setDeviceEditFormData({ ...deviceEditFormData, deviceType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AR_GLASS">AR 글라스</SelectItem>
                    <SelectItem value="BONE_CONDUCTION">골전도 이어폰</SelectItem>
                    <SelectItem value="SMARTPHONE">스마트폰</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSerialNumber">시리얼 번호 *</Label>
                <Input
                  id="editSerialNumber"
                  value={deviceEditFormData.serialNumber}
                  onChange={(e) => setDeviceEditFormData({ ...deviceEditFormData, serialNumber: e.target.value })}
                  placeholder="예: AR2024001"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editBoxNumber">박스 번호 *</Label>
                <Input
                  id="editBoxNumber"
                  type="number"
                  value={deviceEditFormData.boxNumber}
                  onChange={(e) => setDeviceEditFormData({ ...deviceEditFormData, boxNumber: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStatus">상태 *</Label>
                <Select
                  value={deviceEditFormData.status}
                  onValueChange={(value: any) => setDeviceEditFormData({ ...deviceEditFormData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">사용가능</SelectItem>
                    <SelectItem value="rented">대여중</SelectItem>
                    <SelectItem value="maintenance">점검중</SelectItem>
                    <SelectItem value="broken">고장</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editNfcTagId">NFC 태그 ID</Label>
                <Input
                  id="editNfcTagId"
                  value={deviceEditFormData.nfcTagId}
                  onChange={(e) => setDeviceEditFormData({ ...deviceEditFormData, nfcTagId: e.target.value })}
                  placeholder="예: NFC_AR_001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPurchaseDate">구매일</Label>
                <Input
                  id="editPurchaseDate"
                  type="date"
                  value={deviceEditFormData.purchaseDate}
                  onChange={(e) => setDeviceEditFormData({ ...deviceEditFormData, purchaseDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDeviceNotes">비고</Label>
              <Textarea
                id="editDeviceNotes"
                value={deviceEditFormData.notes}
                onChange={(e) => setDeviceEditFormData({ ...deviceEditFormData, notes: e.target.value })}
                placeholder="추가 정보 입력 (선택)"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDeviceEditDialogOpen(false)}>
                취소
              </Button>
              <Button type="submit" disabled={updateDevice.isPending}>
                {updateDevice.isPending ? "수정 중..." : "수정"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 대여 목록 */}
      <Card className="border-2 border-black bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-black">대여 목록</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {rentals && rentals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="p-6 text-left text-lg font-semibold text-black">장비 ID</th>
                    <th className="p-6 text-left text-lg font-semibold text-black">장비 이름</th>
                    <th className="p-6 text-left text-lg font-semibold text-black">상태</th>
                    <th className="p-6 text-left text-lg font-semibold text-black">대여시간</th>
                    <th className="p-6 text-left text-lg font-semibold text-black">반납시간</th>
                    <th className="p-6 text-left text-lg font-semibold text-black">임차인 연락처</th>
                    <th className="p-6 text-right text-lg font-semibold text-black">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rentals.map((rental) => (
                    <tr key={rental.id} className="hover:bg-gray-50">
                      <td className="p-6 text-base">{rental.deviceId}</td>
                      <td className="p-6 text-base font-medium">{rental.deviceName}</td>
                      <td className="p-6 text-base">{getRentalStatusBadge(rental.status)}</td>
                      <td className="p-6 text-base">
                        {new Date(rental.rentalDatetime).toLocaleString()}
                      </td>
                      <td className="p-6 text-base">
                        {rental.actualReturnDatetime
                          ? new Date(rental.actualReturnDatetime).toLocaleString()
                          : new Date(rental.expectedReturnDatetime).toLocaleString() + " (예정)"}
                      </td>
                      <td className="p-6 text-base">
                        <div className="flex items-center gap-2">
                          <span>{rental.renterPhoneMasked}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleCall(rental.renterPhone)}>
                                <Phone className="mr-2 h-4 w-4" />
                                전화걸기
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSMS(rental.renterPhone)}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                SMS 보내기
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        {(rental.status === "rented" || rental.status === "overdue") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleForceReturn(rental.id, rental.renterName)}
                            disabled={forceReturnRental.isPending}
                            className="text-base"
                          >
                            강제반납
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">대여 기록이 없습니다</p>
              <p className="text-sm text-gray-400">키오스크를 통해 대여가 이루어지면 여기에 표시됩니다</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 점검 기록 */}
      <Card className="border-2 border-black bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-black">점검 기록</CardTitle>
            <Dialog open={isExaminationDialogOpen} onOpenChange={setIsExaminationDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  점검 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl">점검 기록 추가</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateExamination} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="examinationDate">점검 일자 *</Label>
                    <Input
                      id="examinationDate"
                      type="date"
                      value={examinationFormData.examinationDate}
                      onChange={(e) => setExaminationFormData({ ...examinationFormData, examinationDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="result">점검 결과 *</Label>
                      <Select value={examinationFormData.result} onValueChange={(value: any) => setExaminationFormData({ ...examinationFormData, result: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pass">통과</SelectItem>
                          <SelectItem value="fail">실패</SelectItem>
                          <SelectItem value="pending">대기</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="examinationStatus">점검 상태 *</Label>
                      <Select value={examinationFormData.status} onValueChange={(value: any) => setExaminationFormData({ ...examinationFormData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">정상</SelectItem>
                          <SelectItem value="warning">주의</SelectItem>
                          <SelectItem value="critical">긴급</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="examinationNotes">비고</Label>
                    <Textarea
                      id="examinationNotes"
                      value={examinationFormData.notes}
                      onChange={(e) => setExaminationFormData({ ...examinationFormData, notes: e.target.value })}
                      placeholder="점검 내용 및 특이사항 입력"
                      rows={4}
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>안내:</strong> 점검 결과가 <strong>실패</strong>인 경우 키오스크 상태가 자동으로 <strong>비활성</strong>으로 변경됩니다.
                      <br />
                      점검 결과가 <strong>통과</strong>인 경우 키오스크 상태가 자동으로 <strong>운영중</strong>으로 변경됩니다.
                    </p>
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsExaminationDialogOpen(false)}>
                      취소
                    </Button>
                    <Button type="submit" disabled={createExamination.isPending}>
                      {createExamination.isPending ? "추가 중..." : "추가"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {examinations && examinations.length > 0 ? (
            <div className="space-y-3">
              {examinations.map((exam) => (
                <div key={exam.id} className="border p-4 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <ClipboardCheck className="h-5 w-5 text-gray-500" />
                      <span className="text-lg font-medium">{new Date(exam.examinationDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2">
                      {getExaminationResultBadge(exam.result)}
                      <Badge
                        className={
                          exam.status === "critical"
                            ? "bg-red-100 text-red-800"
                            : exam.status === "warning"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }
                      >
                        {exam.status === "critical" ? "긴급" : exam.status === "warning" ? "주의" : "정상"}
                      </Badge>
                    </div>
                  </div>
                  {exam.notes && <p className="text-sm text-gray-600 ml-8">{exam.notes}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-gray-300 rounded">
              <ClipboardCheck className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-600 text-sm">점검 기록이 없습니다</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
