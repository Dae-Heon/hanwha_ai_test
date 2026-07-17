export interface ProductionPlan {
  materialCode: string; // 자재코드
  materialName: string; // 자재명
  targetDate: string;    // 투입 예정일 (YYYY-MM-DD)
  requiredQty: number;  // 필요 수량
  processStage: string; // 공정 단계
}

export interface DeliveryStatus {
  materialCode: string; // 자재코드
  materialName: string; // 자재명
  deliveryDate: string; // 실제 입고일 또는 예정일 (YYYY-MM-DD)
  deliveredQty: number; // 입고 수량
  supplier: string;     // 협력사명
}

export type ShortageStatus = "CRITICAL" | "OVERDUE" | "WARNING" | "NORMAL";

export interface AnalyzedMaterial {
  materialCode: string;
  materialName: string;
  requiredQty: number;
  deliveredQty: number;
  shortageQty: number;
  targetDate: string;
  deliveryDate: string;
  processStage: string;
  supplier: string;
  status: ShortageStatus;
  delayDays: number;
}

export interface ColumnMapping {
  materialCode: string;
  materialName: string;
  qty: string;
  date: string;
  extra?: string; // 공정단계 또는 협력사명
}
