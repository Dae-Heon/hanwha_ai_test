import React, { useState, useEffect } from "react";
import { ColumnMapping } from "../types";
import { detectColumns } from "../utils/analysisEngine";
import { Table, Check, AlertCircle } from "lucide-react";

interface ManualMapperModalProps {
  isOpen: boolean;
  fileName: string;
  fileType: "plan" | "delivery"; // Plan has 'ProcessStage', Delivery has 'Supplier'
  headers: string[];
  sampleRow: any[];
  onConfirm: (mapping: ColumnMapping) => void;
  onClose: () => void;
}

export const ManualMapperModal: React.FC<ManualMapperModalProps> = ({
  isOpen,
  fileName,
  fileType,
  headers,
  sampleRow,
  onConfirm,
  onClose
}) => {
  const [mapping, setMapping] = useState<ColumnMapping>({
    materialCode: "",
    materialName: "",
    qty: "",
    date: "",
    extra: ""
  });

  useEffect(() => {
    if (headers.length > 0) {
      const autoDetected = detectColumns(headers);
      setMapping(autoDetected);
    }
  }, [headers]);

  if (!isOpen) return null;

  const handleFieldChange = (field: keyof ColumnMapping, val: string) => {
    setMapping((prev) => ({
      ...prev,
      [field]: val
    }));
  };

  const isCompleted = mapping.materialCode && mapping.materialName && mapping.qty && mapping.date;

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center gap-3">
          <div className="bg-hanwha-orange/10 text-hanwha-orange p-2 rounded-lg border border-hanwha-orange/20">
            <Table size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">스마트 컬럼 매퍼 (자동 감지)</h3>
            <p className="text-[11px] text-slate-500 font-medium truncate max-w-[280px]">파일: {fileName}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-100 flex items-start gap-2.5">
            <AlertCircle size={15} className="text-hanwha-orange mt-0.5 shrink-0" />
            <p className="text-xs text-orange-800 leading-relaxed font-medium">
              업로드된 파일에서 헤더 행을 자동 인지하여 매핑했습니다. 불일치하는 항목이 있다면 아래 드롭다운을 통해 직접 컬럼을 지정해 주세요.
            </p>
          </div>

          <div className="space-y-3 text-slate-800">
            {/* Material Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                자재코드 <span className="text-red-500">*</span> (고유 식별자)
              </label>
              <select
                value={mapping.materialCode}
                onChange={(e) => handleFieldChange("materialCode", e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-hanwha-orange font-medium"
              >
                <option value="">-- 컬럼 선택 --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h} (샘플: {String(sampleRow[headers.indexOf(h)] || "N/A")})
                  </option>
                ))}
              </select>
            </div>

            {/* Material Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                자재명 / 품목명 <span className="text-red-500">*</span>
              </label>
              <select
                value={mapping.materialName}
                onChange={(e) => handleFieldChange("materialName", e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-hanwha-orange font-medium"
              >
                <option value="">-- 컬럼 선택 --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h} (샘플: {String(sampleRow[headers.indexOf(h)] || "N/A")})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                수량 (필요 또는 입고량) <span className="text-red-500">*</span>
              </label>
              <select
                value={mapping.qty}
                onChange={(e) => handleFieldChange("qty", e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-hanwha-orange font-medium"
              >
                <option value="">-- 컬럼 선택 --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h} (샘플: {String(sampleRow[headers.indexOf(h)] || "N/A")})
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                투입 또는 입고 예정일 <span className="text-red-500">*</span>
              </label>
              <select
                value={mapping.date}
                onChange={(e) => handleFieldChange("date", e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-hanwha-orange font-medium"
              >
                <option value="">-- 컬럼 선택 --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h} (샘플: {String(sampleRow[headers.indexOf(h)] || "N/A")})
                  </option>
                ))}
              </select>
            </div>

            {/* Extra Info */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {fileType === "plan" ? "공정 단계 (선택 사항)" : "협력사명 (선택 사항)"}
              </label>
              <select
                value={mapping.extra}
                onChange={(e) => handleFieldChange("extra", e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-hanwha-orange font-medium"
              >
                <option value="">-- 컬럼 선택 --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h} (샘플: {String(sampleRow[headers.indexOf(h)] || "N/A")})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 bg-white hover:bg-slate-100 transition-colors cursor-pointer font-bold"
          >
            취소
          </button>
          <button
            onClick={() => onConfirm(mapping)}
            disabled={!isCompleted}
            className="px-4 py-1.5 bg-hanwha-orange text-white rounded-lg hover:bg-hanwha-orange/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors font-bold cursor-pointer"
          >
            <Check size={14} />
            데이터 매핑 완료
          </button>
        </div>

      </div>
    </div>
  );
};
