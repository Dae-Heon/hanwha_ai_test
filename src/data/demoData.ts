import { ProductionPlan, DeliveryStatus } from "../types";

// Base reference "Today" as 2026-07-16
export const REFERENCE_TODAY = "2026-07-16";

export const SAMPLE_PRODUCTION_PLANS: ProductionPlan[] = [
  {
    materialCode: "HW-K9-ACT-004",
    materialName: "주퇴복좌기 유압 실린더 Assembly",
    targetDate: "2026-07-16", // Critical (Today, not fully delivered)
    requiredQty: 12,
    processStage: "포신 및 포탑 조립 단계"
  },
  {
    materialCode: "HW-RD-ARM-110",
    materialName: "레드백 장갑차 고무궤도 트랙 링크",
    targetDate: "2026-07-14", // Overdue (Past, undelivered)
    requiredQty: 180,
    processStage: "차체 현가장치 결합 공정"
  },
  {
    materialCode: "HW-AE-TBN-901",
    materialName: "가스터빈 압축기 1단 블레이드 (Titanium Alloy)",
    targetDate: "2026-07-16", // Critical
    requiredQty: 45,
    processStage: "항공기 엔진 로터 최종 조립"
  },
  {
    materialCode: "HW-CM-RL-202",
    materialName: "천무 다연장 유도무기 구동제어 구동기",
    targetDate: "2026-07-12", // Overdue
    requiredQty: 8,
    processStage: "발사대 구동부 전자 조립"
  },
  {
    materialCode: "HW-K9-TRN-301",
    materialName: "K9 자주포 변속기 오일 쿨러 모듈",
    targetDate: "2026-07-15", // Overdue
    requiredQty: 15,
    processStage: "엔진룸 의장 결합 공정"
  },
  {
    materialCode: "HW-AE-SNC-088",
    materialName: "F404 엔진 가변 노즐 액추에이터 센서",
    targetDate: "2026-07-18", // Warning (Soon, partially delivered)
    requiredQty: 24,
    processStage: "엔진 통합 관제 센서 검사"
  },
  {
    materialCode: "HW-RD-WLD-505",
    materialName: "특수 합금 방탄 장갑 판재 (1200x2400)",
    targetDate: "2026-07-20", // Normal (In future, fully delivered)
    requiredQty: 30,
    processStage: "차체 용접 및 방호 결합"
  },
  {
    materialCode: "HW-GEN-GEN-001",
    materialName: "산업용 볼트 6각 고강도 (M12x50)",
    targetDate: "2026-07-16", // Normal (Today, fully delivered)
    requiredQty: 500,
    processStage: "체결 일반 가공 부품 공정"
  },
  {
    materialCode: "HW-K9-ARM-404",
    materialName: "포탑 회전용 선회 베어링 (대형)",
    targetDate: "2026-07-17", // Warning
    requiredQty: 6,
    processStage: "포탑 선회 기어 마운팅"
  }
];

export const SAMPLE_DELIVERY_STATUS: DeliveryStatus[] = [
  {
    materialCode: "HW-K9-ACT-004",
    materialName: "주퇴복좌기 유압 실린더 Assembly",
    deliveryDate: "2026-07-16",
    deliveredQty: 4, // 8 short
    supplier: "(주)한성 정밀기계"
  },
  {
    materialCode: "HW-RD-ARM-110",
    materialName: "레드백 장갑차 고무궤도 트랙 링크",
    deliveryDate: "2026-07-14",
    deliveredQty: 120, // 60 short
    supplier: "삼강 테크놀로지"
  },
  {
    materialCode: "HW-AE-TBN-901",
    materialName: "가스터빈 압축기 1단 블레이드 (Titanium Alloy)",
    deliveryDate: "2026-07-15",
    deliveredQty: 0, // 45 short
    supplier: "에어로 컴포넌트 솔루션"
  },
  {
    materialCode: "HW-CM-RL-202",
    materialName: "천무 다연장 유도무기 구동제어 구동기",
    deliveryDate: "2026-07-10",
    deliveredQty: 3, // 5 short
    supplier: "해성 마이크로콤"
  },
  {
    materialCode: "HW-K9-TRN-301",
    materialName: "K9 자주포 변속기 오일 쿨러 모듈",
    deliveryDate: "2026-07-14",
    deliveredQty: 5, // 10 short
    supplier: "(주)우진 유체기계"
  },
  {
    materialCode: "HW-AE-SNC-088",
    materialName: "F404 엔진 가변 노즐 액추에이터 센서",
    deliveryDate: "2026-07-16",
    deliveredQty: 16, // 8 short, but targetDate is 18th (Warning)
    supplier: "일렉트로 센서스"
  },
  {
    materialCode: "HW-RD-WLD-505",
    materialName: "특수 합금 방탄 장갑 판재 (1200x2400)",
    deliveryDate: "2026-07-15",
    deliveredQty: 35, // Fully delivered
    supplier: "포스코 특수강 파트너스"
  },
  {
    materialCode: "HW-GEN-GEN-001",
    materialName: "산업용 볼트 6각 고강도 (M12x50)",
    deliveryDate: "2026-07-16",
    deliveredQty: 500, // Fully delivered
    supplier: "대명 체결부품"
  },
  {
    materialCode: "HW-K9-ARM-404",
    materialName: "포탑 회전용 선회 베어링 (대형)",
    deliveryDate: "2026-07-18", // Late delivery planned
    deliveredQty: 2, // 4 short
    supplier: "한성 정밀기계"
  }
];

// Helpers to export sample tables as CSV string
export function convertPlansToCSV(plans: ProductionPlan[]): string {
  const headers = ["자재코드", "자재명", "투입예정일", "필요수량", "공정단계"];
  const rows = plans.map(p => [
    p.materialCode,
    p.materialName,
    p.targetDate,
    p.requiredQty,
    p.processStage
  ]);
  return [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");
}

export function convertDeliveriesToCSV(deliveries: DeliveryStatus[]): string {
  const headers = ["자재코드", "자재명", "실제입고일", "입고수량", "협력사명"];
  const rows = deliveries.map(d => [
    d.materialCode,
    d.materialName,
    d.deliveryDate,
    d.deliveredQty,
    d.supplier
  ]);
  return [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");
}
