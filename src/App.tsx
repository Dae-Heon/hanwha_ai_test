import React, { useState, useEffect } from "react";
import { ProductionPlan, DeliveryStatus, AnalyzedMaterial, ColumnMapping } from "./types";
import { SAMPLE_PRODUCTION_PLANS, SAMPLE_DELIVERY_STATUS, REFERENCE_TODAY, convertPlansToCSV, convertDeliveriesToCSV } from "./data/demoData";
import { analyzeShortages } from "./utils/analysisEngine";
import { parseSpreadsheet, mapToProductionPlans, mapToDeliveryStatuses } from "./utils/excelParser";

const blueprintBg = "/src/assets/images/aerospace_blueprint_bg_1784254410498.jpg";

// Components
import { ShortageList } from "./components/ShortageList";
import { SupplierChart } from "./components/SupplierChart";
import { AIReportSection } from "./components/AIReportSection";
import { ManualMapperModal } from "./components/ManualMapperModal";

// Icons
import { 
  ShieldAlert, 
  Upload, 
  FileSpreadsheet, 
  RefreshCw, 
  Sparkles, 
  FileCheck, 
  Check, 
  HelpCircle,
  Database,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Info
} from "lucide-react";

export function HanwhaTricircle({ size = "md", animate = false }: { size?: "sm" | "md" | "lg"; animate?: boolean }) {
  const scaleClass = size === "sm" ? "scale-75" : size === "lg" ? "scale-125" : "scale-100";
  const animationClass = animate ? "animate-pulse" : "";
  return (
    <div className={`relative flex items-center justify-center w-10 h-10 ${scaleClass} ${animationClass} select-none shrink-0`}>
      {/* Circle 1 - Left Bottom */}
      <div className="absolute w-5 h-5 rounded-full bg-gradient-to-tr from-[#f37321] to-[#ff9843] opacity-80 -translate-x-1.5 translate-y-1 shadow-sm" />
      {/* Circle 2 - Top Center */}
      <div className="absolute w-5 h-5 rounded-full bg-gradient-to-tr from-[#ff4d00] to-[#f37321] opacity-90 -translate-y-1.5 shadow-sm" />
      {/* Circle 3 - Right Bottom */}
      <div className="absolute w-5 h-5 rounded-full bg-gradient-to-tr from-[#f59e0b] to-[#f37321] opacity-85 translate-x-1.5 translate-y-1 shadow-sm" />
    </div>
  );
}

export default function App() {
  // Main Data States
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryStatus[]>([]);
  const [analyzed, setAnalyzed] = useState<AnalyzedMaterial[]>([]);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "help">("dashboard");

  // File Upload / Mapper States
  const [mapperOpen, setMapperOpen] = useState(false);
  const [rawRows, setRawRows] = useState<any[][]>([]);
  const [currentFileName, setCurrentFileName] = useState("");
  const [currentFileType, setCurrentFileType] = useState<"plan" | "delivery">("plan");

  // Drag-and-Drop visual feedback states
  const [dragActiveA, setDragActiveA] = useState(false);
  const [dragActiveB, setDragActiveB] = useState(false);

  // Recalculate shortage analysis when plans or deliveries change
  useEffect(() => {
    if (plans.length > 0 || deliveries.length > 0) {
      const results = analyzeShortages(plans, deliveries, REFERENCE_TODAY);
      setAnalyzed(results);
    } else {
      setAnalyzed([]);
    }
  }, [plans, deliveries]);

  // Handle Loading Realistic Demo Data
  const handleLoadDemoData = () => {
    setIsLoading(true);
    setIsDemo(true);
    
    // Simulate realistic analytical pipeline delay (1 second)
    setTimeout(() => {
      setPlans(SAMPLE_PRODUCTION_PLANS);
      setDeliveries(SAMPLE_DELIVERY_STATUS);
      setIsLoading(false);
    }, 1000);
  };

  // Reset Application Data State
  const handleReset = () => {
    setPlans([]);
    setDeliveries([]);
    setAnalyzed([]);
    setIsDemo(false);
  };

  // Generic File Upload Handler
  const handleFileUpload = async (file: File, type: "plan" | "delivery") => {
    try {
      setIsLoading(true);
      const rows = await parseSpreadsheet(file);
      if (rows.length < 2) {
        alert("스프레드시트 형식이 유효하지 않거나 데이터 행이 부족합니다.");
        setIsLoading(false);
        return;
      }

      setRawRows(rows);
      setCurrentFileName(file.name);
      setCurrentFileType(type);
      setMapperOpen(true);
    } catch (error: any) {
      alert(`파일 파싱 도중 오류가 발생했습니다: ${error?.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Column Mapping Modal Confirmation
  const handleMappingConfirm = (mapping: ColumnMapping) => {
    if (currentFileType === "plan") {
      const mappedPlans = mapToProductionPlans(rawRows, mapping);
      setPlans(mappedPlans);
    } else {
      const mappedDeliveries = mapToDeliveryStatuses(rawRows, mapping);
      setDeliveries(mappedDeliveries);
    }
    setMapperOpen(false);
  };

  // Drag & Drop handlers for Uploader A
  const handleDragA = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveA(true);
    } else if (e.type === "dragleave") {
      setDragActiveA(false);
    }
  };

  const handleDropA = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveA(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0], "plan");
    }
  };

  // Drag & Drop handlers for Uploader B
  const handleDragB = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveB(true);
    } else if (e.type === "dragleave") {
      setDragActiveB(false);
    }
  };

  const handleDropB = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveB(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0], "delivery");
    }
  };

  // Trigger Local Download of Demo CSV templates so user has raw files to test
  const handleDownloadTemplate = (type: "plan" | "delivery") => {
    const csvContent = type === "plan" 
      ? "\uFEFF" + convertPlansToCSV(SAMPLE_PRODUCTION_PLANS)
      : "\uFEFF" + convertDeliveriesToCSV(SAMPLE_DELIVERY_STATUS);

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ShortageGuard_Template_${type === "plan" ? "생산공정계획" : "자재입고현황"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate high-level crisis metrics
  const overdueCount = analyzed.filter((item) => item.status === "OVERDUE").length;
  const criticalCount = analyzed.filter((item) => item.status === "CRITICAL").length;
  const warningCount = analyzed.filter((item) => item.status === "WARNING").length;
  const totalOverdueQty = analyzed.reduce((acc, item) => acc + item.shortageQty, 0);

  // Derive risk assessment level
  let riskLevel: { text: string; bg: string; border: string; textClass: string } = {
    text: "데이터 대기 중",
    bg: "bg-slate-100",
    border: "border-slate-200",
    textClass: "text-slate-500 font-bold"
  };

  if (analyzed.length > 0) {
    if (criticalCount > 0) {
      riskLevel = {
        text: "🚨 즉각 공정단절 위험 (CRITICAL)",
        bg: "bg-rose-50",
        border: "border-rose-100",
        textClass: "text-rose-600 font-extrabold"
      };
    } else if (overdueCount > 0) {
      riskLevel = {
        text: "⚠️ 자재 수급 지연 (OVERDUE)",
        bg: "bg-orange-50",
        border: "border-orange-100",
        textClass: "text-orange-600 font-extrabold"
      };
    } else if (warningCount > 0) {
      riskLevel = {
        text: "💡 관심 등급 (WARNING)",
        bg: "bg-amber-50",
        border: "border-amber-100",
        textClass: "text-amber-600 font-extrabold"
      };
    } else {
      riskLevel = {
        text: "✅ 조달 100% 만족 (STABLE)",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        textClass: "text-emerald-600 font-extrabold"
      };
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f6fa] text-slate-800 font-sans flex flex-col selection:bg-orange-100 selection:text-orange-950 relative overflow-x-hidden tech-grid">
      {/* Dynamic Technical Blueprint Background Layer (Highly Aesthetic, 4.5% Opacity) */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.045] mix-blend-multiply bg-center bg-no-repeat bg-cover z-0" 
        style={{ backgroundImage: `url(${blueprintBg})` }}
      />
      
      {/* Ambient Gradient Glow overlay for deep perspective */}
      <div className="fixed inset-0 pointer-events-none bg-radial-gradient from-transparent via-[#f3f6fa]/60 to-[#f3f6fa] z-0" />

      {/* Navbar Banner */}
      <header className="bg-[#111111]/95 backdrop-blur-md border-b border-hanwha-orange sticky top-0 z-40 text-white shadow-lg relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HanwhaTricircle size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold tracking-wider text-orange-400 font-mono uppercase bg-orange-500/15 px-2 py-0.5 rounded-full border border-orange-500/20">Hanwha Aerospace</span>
                <span className="text-[9px] font-bold tracking-wider text-slate-400 font-mono uppercase bg-slate-800 px-1.5 py-0.5 rounded">Defense Div.</span>
              </div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                Shortage Guard AI <span className="text-[10px] text-slate-400 font-normal">v1.2</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "dashboard" ? "bg-hanwha-orange text-white shadow-md shadow-orange-500/10" : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              관제 대시보드
            </button>
            <button
              onClick={() => setActiveTab("help")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "help" ? "bg-hanwha-orange text-white shadow-md shadow-orange-500/10" : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              사용 가이드
            </button>

            {analyzed.length > 0 && (
              <button
                onClick={handleReset}
                className="ml-2 px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw size={13} />
                초기화
              </button>
            )}
          </div>
        </div>
        {/* Futuristic glowing thin ambient light under header */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />
      </header>

      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 relative z-10">
        
        {activeTab === "help" ? (
          /* Help Guidelines View */
          <div className="glass-card rounded-2xl p-8 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] max-w-3xl mx-auto space-y-6 text-slate-700 border-t-4 border-t-hanwha-orange relative overflow-hidden">
            {/* Soft decorative mesh overlay inside card */}
            <div className="absolute inset-0 tech-dots pointer-events-none opacity-40" />
            
            <div className="border-b border-slate-200/80 pb-4 relative z-10">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="text-hanwha-orange" />
                Shortage Guard AI 사용 가이드
              </h2>
              <p className="text-xs text-slate-500 mt-1">ERP 다운로드 엑셀 파일 매칭 및 분석 절차입니다.</p>
            </div>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed font-medium relative z-10">
              <p>
                본 솔루션은 한화에어로스페이스 방산 제조 현장에서 매일 아침 수행하는 단순 대조 작업을 무설치 기법으로 브라우저 상에서 10초 내로 자동화합니다. 업로드된 모든 사내 데이터는 **웹 브라우저 메모리 내부(휘발성)**에서 처리되므로 외부 보안 규정을 완벽 준수합니다.
              </p>

              <h3 className="font-bold text-slate-900 text-sm border-l-2 border-hanwha-orange pl-2">1. 데이터 입력 방법</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li><strong>파일 A: 생산 공정 계획표</strong>: 생산 계획 상 투입 예정 자재 및 계획 수량이 포함된 ERP 추출 파일 (.xlsx, .csv)</li>
                <li><strong>파일 B: 자재 입고 현황판</strong>: 협력업체로부터 입고되거나 통관 완료된 입고 수량 현황 파일 (.xlsx, .csv)</li>
                <li>오측의 <strong>'템플릿 다운로드'</strong> 링크를 이용하여 샘플 데이터 구조를 로컬에서 받아보고 가공하여 대조해 보실 수 있습니다.</li>
              </ul>

              <h3 className="font-bold text-slate-900 text-sm border-l-2 border-hanwha-orange pl-2">2. 위기 등급 분류 기준</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-rose-500/5 p-4 rounded-xl border border-rose-500/10">
                  <p className="font-bold text-rose-600 mb-1 flex items-center gap-1">🚨 위험 (Critical)</p>
                  <p className="text-[10px] text-slate-500 font-medium">투입 예정일이 오늘(2026-07-16)인데 입고 수량이 부족한 품목입니다. 즉시 독촉 필요.</p>
                </div>
                <div className="bg-orange-500/5 p-4 rounded-xl border border-orange-500/10">
                  <p className="font-bold text-orange-600 mb-1 flex items-center gap-1">⏰ 지연 (Overdue)</p>
                  <p className="text-[10px] text-slate-500 font-medium">투입 예정일이 이미 지났음에도 수급 목표량에 도달하지 못한 장기 미납 부품입니다.</p>
                </div>
                <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
                  <p className="font-bold text-amber-600 mb-1 flex items-center gap-1">💡 경고 (Warning)</p>
                  <p className="text-[10px] text-slate-500 font-medium">투입 예정일이 3일 이내로 긴박하게 다가왔으나, 아직 실재고나 수급량이 확보되지 않은 품목입니다.</p>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-sm border-l-2 border-hanwha-orange pl-2">3. 주요 특장점</h3>
              <p className="text-slate-600">
                - <strong>스마트 컬럼 감지</strong>: 사내 엑셀의 헤더명이 매칭(예: '코드' ↔ '자재코드', 'qty' ↔ '수량')되지 않더라도, AI 기반 유사 분석 알고리즘이 매핑하여 분석 실패를 최소화합니다.<br/>
                - <strong>부족 수량 합산 처리</strong>: 복수의 계획행 및 입고 분할 내역을 자동 집계하여, 최종 단일 부족 수량 기준으로 정확히 가이드라인을 제공합니다.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200/80 flex justify-end relative z-10">
              <button
                onClick={() => setActiveTab("dashboard")}
                className="px-5 py-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white rounded-lg font-bold text-xs shadow-md shadow-orange-500/10 transition-colors cursor-pointer"
              >
                관제 대시보드로 복귀
              </button>
            </div>
          </div>
        ) : analyzed.length === 0 ? (
          /* Empty / Upload Required Dashboard State */
          <div className="space-y-6">
            
            {/* Introductory Premium Hero Banner - Stunning Slate/Jet Black and Hanwha Orange Theme */}
            <div className="bg-gradient-to-br from-[#121a2e] via-[#0b0f19] to-[#121c32] rounded-3xl border border-slate-800/80 p-6 md:p-10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
              {/* Futuristic light accents */}
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-10 left-10 w-80 h-80 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

              {/* Decorative absolute background Tricircle */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 opacity-[0.04] blur-[1px] pointer-events-none scale-[3.5]">
                <HanwhaTricircle size="lg" />
              </div>
              
              <div className="space-y-3 max-w-2xl relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase tracking-widest">
                  <Sparkles size={11} className="text-orange-400 animate-spin" style={{ animationDuration: '4s' }} />
                  Hanwha Smart Logistics Control
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                  방산 생산라인을 지키는 <br className="hidden sm:inline"/>단 5분의 <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f37321] to-[#ffaa66]">대조 자동화 혁신</span>
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  매일 생산라인 조립 착수 전, ERP에서 추출한 두 개의 현황 장표를 이곳에 업로드하세요. 
                  AI 기반 스마트 자재코드 그룹핑 및 실시간 결품 등급 판단을 통하여 납기 지연을 사전에 봉쇄합니다.
                </p>
              </div>

              {/* Demo button */}
              <div className="shrink-0 relative z-10">
                <button
                  onClick={handleLoadDemoData}
                  disabled={isLoading}
                  className="px-6 py-4 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white text-xs font-black rounded-2xl shadow-xl shadow-orange-950/40 hover:shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 group cursor-pointer disabled:opacity-50"
                >
                  <Sparkles size={16} className="group-hover:rotate-12 transition-transform text-white animate-pulse" />
                  실습용 가상 시나리오 데이터 탑재
                </button>
              </div>
            </div>

            {/* Smart Upload Workspace */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Uploader A */}
              <div 
                onDragEnter={handleDragA}
                onDragOver={handleDragA}
                onDragLeave={handleDragA}
                onDrop={handleDropA}
                className={`glass-card rounded-3xl border-2 border-dashed p-10 flex flex-col items-center text-center justify-center min-h-[320px] transition-all relative ${
                  dragActiveA 
                    ? "border-hanwha-orange bg-orange-500/5 scale-[1.015] shadow-lg shadow-orange-500/5" 
                    : "border-slate-300/80 hover:border-hanwha-orange/60 hover:bg-white/95 hover:shadow-md"
                }`}
              >
                {plans.length > 0 ? (
                  <div className="space-y-4 animate-fade-in relative z-10">
                    <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-inner">
                      <FileCheck size={28} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-950">생산 공정 계획표 로드 완료</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1.5 bg-emerald-50 px-2.5 py-1 rounded-full inline-block border border-emerald-100">
                        {plans.length}개의 자재 계획 데이터 분석 준비 완료
                      </p>
                    </div>
                    <div className="pt-2">
                      <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-black cursor-pointer border border-slate-200 transition-all shadow-sm">
                        다른 파일로 교체
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "plan")}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5 relative z-10">
                    <div className="w-14 h-14 bg-orange-500/10 text-hanwha-orange rounded-full flex items-center justify-center border border-orange-200/50 mx-auto shadow-inner">
                      <FileSpreadsheet size={26} />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">파일 A : 생산 공정 계획표</h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-1 max-w-[280px] mx-auto leading-normal">
                        자재코드, 투입예정일, 필요수량 열이 필수적으로 포함된 생산 계획서 엑셀 장표입니다.
                      </p>
                    </div>
                    <label className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-[#111111] hover:bg-hanwha-orange hover:shadow-orange-500/20 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md">
                      <Upload size={14} />
                      생산계획 파일 선택
                      <input 
                        type="file" 
                        accept=".xlsx,.xls,.csv" 
                        className="hidden" 
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "plan")}
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 font-medium">또는 마우스로 드래그 & 드롭 하세요</p>
                    
                    <button 
                      onClick={() => handleDownloadTemplate("plan")}
                      className="text-[10px] text-hanwha-orange hover:underline block pt-2 mx-auto cursor-pointer font-bold bg-orange-500/5 px-2.5 py-1 rounded-full border border-orange-500/10"
                    >
                      💡 생산계획 표준 양식 다운로드 (.csv)
                    </button>
                  </div>
                )}
              </div>
 
              {/* Uploader B */}
              <div 
                onDragEnter={handleDragB}
                onDragOver={handleDragB}
                onDragLeave={handleDragB}
                onDrop={handleDropB}
                className={`glass-card rounded-3xl border-2 border-dashed p-10 flex flex-col items-center text-center justify-center min-h-[320px] transition-all relative ${
                  dragActiveB 
                    ? "border-hanwha-orange bg-orange-500/5 scale-[1.015] shadow-lg shadow-orange-500/5" 
                    : "border-slate-300/80 hover:border-hanwha-orange/60 hover:bg-white/95 hover:shadow-md"
                }`}
              >
                {deliveries.length > 0 ? (
                  <div className="space-y-4 animate-fade-in relative z-10">
                    <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-inner">
                      <FileCheck size={28} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-950">자재 입고 현황판 로드 완료</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1.5 bg-emerald-50 px-2.5 py-1 rounded-full inline-block border border-emerald-100">
                        {deliveries.length}개의 입고 거래 데이터 분석 준비 완료
                      </p>
                    </div>
                    <div className="pt-2">
                      <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-black cursor-pointer border border-slate-200 transition-all shadow-sm">
                        다른 파일로 교체
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "delivery")}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5 relative z-10">
                    <div className="w-14 h-14 bg-orange-500/10 text-hanwha-orange rounded-full flex items-center justify-center border border-orange-200/50 mx-auto shadow-inner">
                      <FileSpreadsheet size={26} />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">파일 B : 자재 입고 현황판</h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-1 max-w-[280px] mx-auto leading-normal">
                        자재코드, 입고일자, 입고수량, 협력업체명 정보가 매칭되는 물류 ERP 엑셀 데이터 장표입니다.
                      </p>
                    </div>
                    <label className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-[#111111] hover:bg-hanwha-orange hover:shadow-orange-500/20 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md">
                      <Upload size={14} />
                      입고현황 파일 선택
                      <input 
                        type="file" 
                        accept=".xlsx,.xls,.csv" 
                        className="hidden" 
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "delivery")}
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 font-medium">또는 마우스로 드래그 & 드롭 하세요</p>
                    
                    <button 
                      onClick={() => handleDownloadTemplate("delivery")}
                      className="text-[10px] text-hanwha-orange hover:underline block pt-2 mx-auto cursor-pointer font-bold bg-orange-500/5 px-2.5 py-1 rounded-full border border-orange-500/10"
                    >
                      💡 입고현황 표준 양식 다운로드 (.csv)
                    </button>
                  </div>
                )}
              </div>
 
            </div>
 
            {/* Quick Helper Tips */}
            <div className="glass-card rounded-2xl border-l-4 border-l-hanwha-orange p-6 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 tech-dots pointer-events-none opacity-20" />
              <div className="flex items-start gap-3.5 relative z-10">
                <Info size={18} className="text-hanwha-orange mt-0.5 shrink-0" />
                <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed font-medium">
                  <p className="font-bold text-slate-950 text-sm">💡 엑셀 스마트 대조 가이드라인</p>
                  <p>
                    1. 두 장표의 자재코드가 일치하면 자동으로 매핑되어 수급 결품 격차가 완벽히 계산됩니다.<br/>
                    2. 계획서나 입고 현황판 내에 하나의 자재코드가 여러 일자나 여러 행으로 중복 분할되어 기록되어 있더라도, <strong className="text-hanwha-orange font-bold">Shortage Guard 엔진이 동일 자재코드 기준으로 수량을 통합 합산</strong>하여 전처리하므로 수동 계산이 전혀 필요하지 않습니다.
                  </p>
                </div>
              </div>
            </div>
 
          </div>
        ) : (
          /* Active Shortage 관제 Dashboard State */
          <div className="space-y-6">
            
            {/* Realtime KPI Overview Cards - Redesigned as glowing glass panels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
              {/* Risk State Card */}
              <div className={`p-5 rounded-2xl border shadow-md flex flex-col justify-between h-28 glass-card border-l-4 relative overflow-hidden transition-all duration-300 hover:-translate-y-1`}>
                <div className="absolute inset-0 tech-dots pointer-events-none opacity-20" />
                <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase relative z-10">종합 수급 리스크 등급</span>
                <span className={`text-[15px] ${riskLevel.textClass} relative z-10 flex items-center gap-1 mt-1`}>
                  {riskLevel.text}
                </span>
                <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 pt-1.5 border-t border-slate-100 relative z-10 font-bold">
                  <Calendar size={11} className="text-hanwha-orange" /> 대조일자: {REFERENCE_TODAY}
                </span>
              </div>
 
              {/* Overdue Count */}
              <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between h-28 transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-md border-t-2 border-t-orange-400">
                <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">미납입/지연 품목 수 (Overdue)</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-extrabold text-orange-600">{overdueCount}</span>
                  <span className="text-[11px] text-slate-500 font-bold">종류</span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold leading-normal pt-1.5 border-t border-slate-50">투입 목표일 기준 경과 자재</span>
              </div>
 
              {/* Critical Count */}
              <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between h-28 transition-all duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-md border-t-2 border-t-rose-500">
                <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">당일 공정 단절 품목 (Critical)</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-extrabold text-rose-600 animate-pulse">{criticalCount}</span>
                  <span className="text-[11px] text-slate-500 font-bold">종류</span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold leading-normal pt-1.5 border-t border-slate-50">금일 즉시 투입 확보 필요</span>
              </div>
 
              {/* Sum of shortages */}
              <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between h-28 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md border-t-2 border-t-[#111111]">
                <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">누적 미매칭 결품 수량</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-extrabold text-slate-950">{totalOverdueQty}</span>
                  <span className="text-[11px] text-slate-500 font-bold">개수</span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold leading-normal pt-1.5 border-t border-slate-50">안정 제조 착수를 위한 최소 조달량</span>
              </div>
            </div>
 
            {/* Dashboard Bento Grid (Main Layout) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
              
              {/* Left Column: Data Grid and Recharts Charts */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Data Grid Section (Glass-card Wrapper) */}
                <div className="space-y-3 bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-sm">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                      <Database size={16} className="text-hanwha-orange" />
                      실시간 자재 대조 수급 관제 현황판
                    </h3>
                    {isDemo && (
                      <span className="text-[9px] font-black text-orange-600 bg-orange-50 border border-orange-100 rounded-full px-2.5 py-0.5 animate-pulse">
                        가상 분석 시나리오 로드됨
                      </span>
                    )}
                  </div>
                  <ShortageList materials={analyzed} />
                </div>
 
                {/* Dashboard Interactive Charts (Glass-card Wrapper) */}
                <div className="space-y-3 bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-sm">
                  <h3 className="text-sm font-black text-slate-950 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-3.5 bg-hanwha-orange rounded-full" />
                    공급처별 납기 지연 시간 분포도 (차트 분석)
                  </h3>
                  <SupplierChart data={analyzed} />
                </div>
 
              </div>
 
              {/* Right Column: AI Section (Briefing & Actionable Email) */}
              <div className="space-y-6">
                
                {/* AI Briefing container with high contrast border */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                      <Sparkles size={15} className="text-hanwha-orange" />
                      AI 실시간 독촉 브리핑실
                    </h3>
                  </div>
                  <AIReportSection
                    criticalItems={analyzed.filter(m => m.status === "CRITICAL" || m.status === "OVERDUE")}
                    overdueCount={overdueCount}
                    criticalCount={criticalCount}
                    totalOverdueQty={totalOverdueQty}
                  />
                </div>
 
                {/* Secure handling note styled as a premium security card */}
                <div className="glass-card rounded-2xl p-5 border-t-2 border-t-slate-800 shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 tech-dots pointer-events-none opacity-20" />
                  <div className="relative z-10 space-y-2">
                    <p className="font-extrabold text-[12px] text-slate-950 flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                      🔒 내부 기밀 정보의 보안 규정 (로컬 무설치 기법)
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Shortage Guard AI는 완벽한 오프라인 독립 실행 모델입니다. 업로드된 모든 사내 자재 엑셀 데이터는 외부 클라우드로 단 한 글자도 전송되지 않으며, <strong>웹 브라우저 내부 가상 메모리(Local Sandbox Memory) 영역 내에서만 안전하게 처리 및 전처리</strong>됩니다.
                    </p>
                  </div>
                </div>
              </div>
 
            </div>
 
          </div>
        )}
 
      </main>
 
      {/* Footer Branding (Deep Charcoal background like official Hanwha page) */}
      <footer className="bg-[#111111] border-t border-slate-800 py-10 mt-16 shrink-0 text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[11px] space-y-2.5 font-sans font-medium">
          <div className="flex justify-center items-center gap-2 opacity-80">
            <HanwhaTricircle size="sm" />
            <span className="font-black text-white text-xs tracking-wider">Hanwha Aerospace Co., Ltd.</span>
          </div>
          <p className="text-slate-500 pt-1">자재관리 자동화 실습 전용 보안 가시화 포탈 — Defense Logistics Group</p>
          <p className="text-slate-600">© 2026 Shortage Guard AI Engine. All Rights Reserved. 본 환경은 사내 데이터 유출 원천 차단 기준을 준수합니다.</p>
        </div>
      </footer>
 
      {/* Global Loading Spinner Backdrop with Technical Blueprint design overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#0b0f19]/90 backdrop-blur-md flex flex-col items-center justify-center z-50">
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.06] bg-center bg-no-repeat bg-cover" 
            style={{ backgroundImage: `url(${blueprintBg})` }}
          />
          <div className="relative flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-hanwha-orange animate-spin absolute"></div>
            <HanwhaTricircle size="lg" animate={true} />
          </div>
          <p className="text-sm font-black text-white tracking-widest mt-4 uppercase animate-pulse">지능형 자재 수급 대조 매핑 엔진 가동 중...</p>
          <p className="text-xs text-orange-400 mt-2 font-bold">사내 ERP 엑셀 내부 자재코드 자동 파싱 및 병합 중</p>
        </div>
      )}
 
      {/* Header Manual Mapper Modal */}
      <ManualMapperModal
         isOpen={mapperOpen}
         fileName={currentFileName}
         fileType={currentFileType}
         headers={rawRows.length > 0 ? rawRows[0].map(h => String(h || "").trim()) : []}
         sampleRow={rawRows.length > 1 ? rawRows[1] : []}
         onConfirm={handleMappingConfirm}
         onClose={() => setMapperOpen(false)}
      />
 
    </div>
  );
}
