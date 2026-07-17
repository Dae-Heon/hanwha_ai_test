import * as XLSX from "xlsx";
import { ProductionPlan, DeliveryStatus, ColumnMapping } from "../types";
import { detectColumns } from "./analysisEngine";

// Parse a file (xlsx, xls, csv) into a 2D array of rows
export function parseSpreadsheet(file: File): Promise<any[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (!result) {
          reject(new Error("파일을 읽을 수 없습니다."));
          return;
        }

        const workbook = XLSX.read(result, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to 2D array of cells (including empty ones to preserve columns)
        const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1");
        const rows: any[][] = [];
        
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const row: any[] = [];
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = worksheet[cellRef];
            row.push(cell ? cell.v : "");
          }
          rows.push(row);
        }

        // Filter out completely empty rows
        const filteredRows = rows.filter(row => row.some(cell => cell !== ""));
        resolve(filteredRows);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("파일 읽기 도중 에러가 발생했습니다."));
    };

    reader.readAsBinaryString(file);
  });
}

// Convert 2D arrays to ProductionPlans
export function mapToProductionPlans(rows: any[][], mapping: ColumnMapping): ProductionPlan[] {
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => String(h || "").trim());
  
  const codeIdx = headers.indexOf(mapping.materialCode);
  const nameIdx = headers.indexOf(mapping.materialName);
  const qtyIdx = headers.indexOf(mapping.qty);
  const dateIdx = headers.indexOf(mapping.date);
  const stageIdx = mapping.extra ? headers.indexOf(mapping.extra) : -1;

  const plans: ProductionPlan[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const code = String(row[codeIdx] || "").trim();
    if (!code) continue;

    // Excel date serialization can sometimes be a number
    let dateVal = String(row[dateIdx] || "").trim();
    if (/^\d{5}$/.test(dateVal)) {
      // Excel serial date to YYYY-MM-DD
      const serial = parseInt(dateVal);
      const utcDays = serial - 25569;
      const utcValue = utcDays * 86400;
      const dateInfo = new Date(utcValue * 1000);
      const y = dateInfo.getFullYear();
      const m = String(dateInfo.getMonth() + 1).padStart(2, "0");
      const d = String(dateInfo.getDate()).padStart(2, "0");
      dateVal = `${y}-${m}-${d}`;
    }

    plans.push({
      materialCode: code,
      materialName: String(row[nameIdx] || "알 수 없는 품명").trim(),
      requiredQty: Math.max(0, parseInt(row[qtyIdx]) || 0),
      targetDate: dateVal,
      processStage: stageIdx !== -1 ? String(row[stageIdx] || "기본 공정").trim() : "일반 조립 공정"
    });
  }

  return plans;
}

// Convert 2D arrays to DeliveryStatuses
export function mapToDeliveryStatuses(rows: any[][], mapping: ColumnMapping): DeliveryStatus[] {
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => String(h || "").trim());

  const codeIdx = headers.indexOf(mapping.materialCode);
  const nameIdx = headers.indexOf(mapping.materialName);
  const qtyIdx = headers.indexOf(mapping.qty);
  const dateIdx = headers.indexOf(mapping.date);
  const supplierIdx = mapping.extra ? headers.indexOf(mapping.extra) : -1;

  const deliveries: DeliveryStatus[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const code = String(row[codeIdx] || "").trim();
    if (!code) continue;

    let dateVal = String(row[dateIdx] || "").trim();
    if (/^\d{5}$/.test(dateVal)) {
      const serial = parseInt(dateVal);
      const utcDays = serial - 25569;
      const utcValue = utcDays * 86400;
      const dateInfo = new Date(utcValue * 1000);
      const y = dateInfo.getFullYear();
      const m = String(dateInfo.getMonth() + 1).padStart(2, "0");
      const d = String(dateInfo.getDate()).padStart(2, "0");
      dateVal = `${y}-${m}-${d}`;
    }

    deliveries.push({
      materialCode: code,
      materialName: String(row[nameIdx] || "알 수 없는 품명").trim(),
      deliveredQty: Math.max(0, parseInt(row[qtyIdx]) || 0),
      deliveryDate: dateVal,
      supplier: supplierIdx !== -1 ? String(row[supplierIdx] || "공급사 미확인").trim() : "일반 협력사"
    });
  }

  return deliveries;
}
