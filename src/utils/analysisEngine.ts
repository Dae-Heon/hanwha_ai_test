import { ProductionPlan, DeliveryStatus, AnalyzedMaterial, ShortageStatus, ColumnMapping } from "../types";
import { REFERENCE_TODAY } from "../data/demoData";

// Fuzzy mapping scorer
export function detectColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    materialCode: "",
    materialName: "",
    qty: "",
    date: "",
    extra: ""
  };

  const codeKeywords = ["자재코드", "품목코드", "자재id", "code", "material_code", "id", "코드"];
  const nameKeywords = ["자재명", "품목명", "자재이름", "name", "material_name", "품명", "이름"];
  const qtyKeywords = ["필요수량", "입고수량", "수량", "qty", "quantity", "수량(개)", "필요", "입고"];
  const dateKeywords = ["투입예정일", "실제입고일", "예정일", "입고일", "일자", "날짜", "date", "납기일", "투입일"];
  const extraKeywords = ["공정단계", "공정", "단계", "stage", "협력사명", "협력사", "공급사", "supplier", "vendor", "업체명", "업체"];

  const findBestMatch = (keywords: string[]): string => {
    let bestMatch = "";
    let maxScore = -1;

    for (const h of headers) {
      const cleanHeader = h.trim().toLowerCase().replace(/[\s_\-()]/g, "");
      for (const kw of keywords) {
        const cleanKw = kw.toLowerCase().replace(/[\s_\-()]/g, "");
        if (cleanHeader === cleanKw) {
          return h; // Exact clean match
        }
        if (cleanHeader.includes(cleanKw) || cleanKw.includes(cleanHeader)) {
          const score = Math.max(cleanHeader.length, cleanKw.length) - Math.abs(cleanHeader.length - cleanKw.length);
          if (score > maxScore) {
            maxScore = score;
            bestMatch = h;
          }
        }
      }
    }
    return bestMatch || headers[0] || "";
  };

  mapping.materialCode = findBestMatch(codeKeywords);
  mapping.materialName = findBestMatch(nameKeywords);
  mapping.qty = findBestMatch(qtyKeywords);
  mapping.date = findBestMatch(dateKeywords);
  mapping.extra = findBestMatch(extraKeywords);

  return mapping;
}

// Convert date string YYYY-MM-DD to Date object for comparison
export function parseDateString(dateStr: string): Date {
  try {
    const parts = dateStr.trim().split("-");
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
  } catch (e) {
    // Ignore and fallback
  }
  return new Date(dateStr);
}

// Compute days difference (day2 - day1)
export function getDaysDifference(dateStr1: string, dateStr2: string): number {
  const d1 = parseDateString(dateStr1);
  const d2 = parseDateString(dateStr2);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Main shortage analysis engine
export function analyzeShortages(
  plans: ProductionPlan[],
  deliveries: DeliveryStatus[],
  todayStr: string = REFERENCE_TODAY
): AnalyzedMaterial[] {
  // 1. Group and sum production plans by Material Code (handling duplicate codes)
  const planMap: { [code: string]: { materialName: string; requiredQty: number; targetDate: string; processStage: string } } = {};
  
  for (const p of plans) {
    const code = p.materialCode.trim();
    if (!code) continue;

    if (!planMap[code]) {
      planMap[code] = {
        materialName: p.materialName,
        requiredQty: 0,
        targetDate: p.targetDate,
        processStage: p.processStage || "기본 공정"
      };
    }
    
    planMap[code].requiredQty += Number(p.requiredQty) || 0;
    
    // If dates differ, keep the earliest target date as the critical milestone
    if (p.targetDate && planMap[code].targetDate) {
      if (p.targetDate < planMap[code].targetDate) {
        planMap[code].targetDate = p.targetDate;
      }
    } else if (p.targetDate) {
      planMap[code].targetDate = p.targetDate;
    }
  }

  // 2. Group and sum delivery status by Material Code (handling duplicate codes)
  const deliveryMap: { [code: string]: { materialName: string; deliveredQty: number; deliveryDate: string; supplier: string } } = {};
  
  for (const d of deliveries) {
    const code = d.materialCode.trim();
    if (!code) continue;

    if (!deliveryMap[code]) {
      deliveryMap[code] = {
        materialName: d.materialName,
        deliveredQty: 0,
        deliveryDate: d.deliveryDate,
        supplier: d.supplier || "미지정 협력사"
      };
    }
    
    deliveryMap[code].deliveredQty += Number(d.deliveredQty) || 0;
    
    // Keep the latest delivery status date or update as needed
    if (d.deliveryDate && deliveryMap[code].deliveryDate) {
      if (d.deliveryDate > deliveryMap[code].deliveryDate) {
        deliveryMap[code].deliveryDate = d.deliveryDate;
      }
    } else if (d.deliveryDate) {
      deliveryMap[code].deliveryDate = d.deliveryDate;
    }
  }

  // 3. Merge and analyze shortages
  const allCodes = Array.from(new Set([...Object.keys(planMap), ...Object.keys(deliveryMap)]));
  const results: AnalyzedMaterial[] = [];

  for (const code of allCodes) {
    const plan = planMap[code];
    const delivery = deliveryMap[code];

    const materialName = plan?.materialName || delivery?.materialName || "알 수 없는 자재";
    const requiredQty = plan?.requiredQty || 0;
    const deliveredQty = delivery?.deliveredQty || 0;
    const shortageQty = Math.max(0, requiredQty - deliveredQty);
    const targetDate = plan?.targetDate || todayStr;
    const deliveryDate = delivery?.deliveryDate || "-";
    const processStage = plan?.processStage || "N/A";
    const supplier = delivery?.supplier || "공급 계획 미등록";

    let status: ShortageStatus = "NORMAL";
    let delayDays = 0;

    if (shortageQty > 0) {
      if (targetDate < todayStr) {
        status = "OVERDUE"; // 지연: 투입일이 오늘 이전인데 수량 부족
        delayDays = getDaysDifference(targetDate, todayStr);
      } else if (targetDate === todayStr) {
        status = "CRITICAL"; // 위험: 투입일이 오늘인데 수량 부족
      } else {
        // 투입일이 미래인데 수량 부족
        const daysToTarget = getDaysDifference(todayStr, targetDate);
        if (daysToTarget <= 3) {
          status = "WARNING"; // 경고: 3일 이내 투입 예정이나 미납
        } else {
          status = "NORMAL"; // 3일 초과 여유 있음은 정상/기본처리
        }
      }
    } else {
      status = "NORMAL"; // 납기 충족
    }

    results.push({
      materialCode: code,
      materialName,
      requiredQty,
      deliveredQty,
      shortageQty,
      targetDate,
      deliveryDate,
      processStage,
      supplier,
      status,
      delayDays
    });
  }

  // Sort: OVERDUE, CRITICAL, WARNING, NORMAL
  const statusPriority: { [key in ShortageStatus]: number } = {
    CRITICAL: 0,
    OVERDUE: 1,
    WARNING: 2,
    NORMAL: 3
  };

  return results.sort((a, b) => {
    if (a.status !== b.status) {
      return statusPriority[a.status] - statusPriority[b.status];
    }
    // Secondary sort: shortage quantity descending
    return b.shortageQty - a.shortageQty;
  });
}
