import React, { useState, useEffect } from "react";
import { ProductionPlan, DeliveryStatus, AnalyzedMaterial, ColumnMapping } from "./types";
import { SAMPLE_PRODUCTION_PLANS, SAMPLE_DELIVERY_STATUS, REFERENCE_TODAY, convertPlansToCSV, convertDeliveriesToCSV } from "./data/demoData";
import { analyzeShortages } from "./utils/analysisEngine";
import { parseSpreadsheet, mapToProductionPlans, mapToDeliveryStatuses } from "./utils/excelParser";

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
    bg: "bg-slate-800",
    border: "border-slate-700",
    textClass: "text-slate-400"
  };

  if (analyzed.length > 0) {
    if (criticalCount > 0) {
      riskLevel = {
        text: "🚨 즉각 공정단절 위험 (CRITICAL)",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        textClass: "text-red-400"
      };
    } else if (overdueCount > 0) {
      riskLevel = {
        text: "⚠️ 자재 수급 지연 (OVERDUE)",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
        textClass: "text-orange-400"
      };
    } else if (warningCount > 0) {
      riskLevel = {
        text: "💡 관심 등급 (WARNING)",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        textClass: "text-amber-400"
      };
    } else {
      riskLevel = {
        text: "✅ 조달 100% 만족 (STABLE)",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        textClass: "text-emerald-400"
      };
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans flex flex-col selection:bg-orange-800 selection:text-white">
      {/* Navbar Banner */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-orange-600 to-amber-500 p-2 rounded-lg text-white">
              <ShieldAlert size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider text-orange-400 font-mono uppercase bg-orange-500/10 px-1.5 py-0.5 rounded">Hanwha Aerospace</span>
              </div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                Shortage Guard AI <span className="text-[11px] text-slate-400 font-normal">v1.2</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "dashboard" ? "bg-hanwha-orange text-white shadow-md shadow-orange-950/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
              }`}
            >
              관제 대시보드
            </button>
            <button
              onClick={() => setActiveTab("help")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "help" ? "bg-hanwha-orange text-white shadow-md shadow-orange-950/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
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
      </header>

      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {activeTab === "help" ? (
          /* Help Guidelines View */
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-xl max-w-3xl mx-auto space-y-6 text-slate-200">
            <div className="border-b border-slate-700 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="text-hanwha-orange" />
                Shortage Guard AI 사용 가이드
              </h2>
              <p className="text-xs text-slate-400 mt-1">ERP 다운로드 엑셀 파일 매칭 및 분석 절차입니다.</p>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <p>
                본 솔루션은 한화에어로스페이스 방산 제조 현장에서 매일 아침 수행하는 단순 대조 작업을 무설치 기법으로 브라우저 상에서 10초 내로 자동화합니다. 업로드된 모든 사내 데이터는 **웹 브라우저 메모리 내부(휘발성)**에서 처리되므로 외부 보안 규정을 완벽 준수합니다.
              </p>

              <h3 className="font-bold text-white text-sm border-l-2 border-hanwha-orange pl-2">1. 데이터 입력 방법</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>파일 A: 생산 공정 계획표</strong>: 생산 계획 상 투입 예정 자재 및 계획 수량이 포함된 ERP 추출 파일 (.xlsx, .csv)</li>
                <li><strong>파일 B: 자재 입고 현황판</strong>: 협력업체로부터 입고되거나 통관 완료된 입고 수량 현황 파일 (.xlsx, .csv)</li>
                <li>오측의 <strong>'템플릿 다운로드'</strong> 링크를 이용하여 샘플 데이터 구조를 로컬에서 받아보고 가공하여 대조해 보실 수 있습니다.</li>
              </ul>

              <h3 className="font-bold text-white text-sm border-l-2 border-hanwha-orange pl-2">2. 위기 등급 분류 기준</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-red-500/10 p-3 rounded border border-red-500/20">
                  <p className="font-bold text-red-400 mb-0.5">🚨 위험 (Critical)</p>
                  <p className="text-[10px] text-slate-400">투입 예정일이 오늘(2026-07-16)인데 입고 수량이 부족한 품목입니다. 즉시 독촉 필요.</p>
                </div>
                <div className="bg-orange-500/10 p-3 rounded border border-orange-500/20">
                  <p className="font-bold text-orange-400 mb-0.5">⏰ 지연 (Overdue)</p>
                  <p className="text-[10px] text-slate-400">투입 예정일이 이미 지났음에도 수급 목표량에 도달하지 못한 장기 미납 부품입니다.</p>
                </div>
                <div className="bg-amber-500/10 p-3 rounded border border-amber-500/20">
                  <p className="font-bold text-amber-400 mb-0.5">💡 경고 (Warning)</p>
                  <p className="text-[10px] text-slate-400">투입 예정일이 3일 이내로 긴박하게 다가왔으나, 아직 실재고나 수급량이 확보되지 않은 품목입니다.</p>
                </div>
              </div>

              <h3 className="font-bold text-white text-sm border-l-2 border-hanwha-orange pl-2">3. 주요 특장점</h3>
              <p>
                - <strong>스마트 컬럼 감지</strong>: 사내 엑셀의 헤더명이 매칭(예: '코드' ↔ '자재코드', 'qty' ↔ '수량')되지 않더라도, AI 기반 유사 분석 알고리즘이 매핑하여 분석 실패를 최소화합니다.<br/>
                - <strong>부족 수량 합산 처리</strong>: 복수의 계획행 및 입고 분할 내역을 자동 집계하여, 최종 단일 부족 수량 기준으로 정확히 가이드라인을 제공합니다.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-700 flex justify-end">
              <button
                onClick={() => setActiveTab("dashboard")}
                className="px-4 py-2 bg-hanwha-orange hover:bg-hanwha-orange/90 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
              >
                관제 대시보드로 복귀
              </button>
            </div>
          </div>
        ) : analyzed.length === 0 ? (
          /* Empty / Upload Required Dashboard State */
          <div className="space-y-6">
            
            {/* Introductory Hero banner */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-6 md:p-8 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative border-l-4 border-l-hanwha-orange">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold bg-hanwha-orange/10 text-hanwha-orange border border-hanwha-orange/20">
                  <Sparkles size={12} />
                  AI 기반 스마트 분석 관제
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight leading-tight">
                  방산 생산라인을 지키는 단 5분의 대조 혁신
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  매일 생산라인 조립 착수 전, ERP에서 추출한 두 개의 현황 장표를 이곳에 업로드하세요. 
                  AI 기반 스마트 자재코드 그룹핑 및 실시간 결품 등급 판단을 통하여 납기 지연을 사전에 봉쇄합니다.
                </p>
              </div>

              {/* Demo button */}
              <div className="shrink-0">
                <button
                  onClick={handleLoadDemoData}
                  disabled={isLoading}
                  className="px-5 py-3 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-950/20 hover:shadow-lg transition-all flex items-center gap-2 group cursor-pointer disabled:opacity-50"
                >
                  <Sparkles size={15} className="group-hover:rotate-12 transition-transform" />
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
                className={`bg-slate-800/40 rounded-xl border-2 border-dashed p-8 shadow-md flex flex-col items-center text-center justify-center min-h-[300px] transition-all relative ${
                  dragActiveA ? "border-hanwha-orange bg-hanwha-orange/5 scale-[1.01]" : "border-slate-700 hover:border-slate-600 bg-slate-800/20 hover:bg-slate-800/40"
                }`}
              >
                {plans.length > 0 ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mx-auto border border-emerald-500/20">
                      <FileCheck size={24} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">생산 공정 계획표 로드 성공</h4>
                      <p className="text-[11px] text-slate-400 mt-1">{plans.length}개의 자재 계획 데이터 등록 완료</p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <label className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[10px] font-semibold cursor-pointer border border-slate-600 transition-colors">
                        파일 교체
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
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-slate-900 text-hanwha-orange rounded-full flex items-center justify-center border border-slate-700 mx-auto">
                      <FileSpreadsheet size={24} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">파일 A: 생산 공정 계획표 업로드</h4>
                      <p className="text-[11px] text-slate-400 mt-1">자재코드, 투입예정일, 필요수량 열이 필수 포함됩니다.</p>
                    </div>
                    <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-hanwha-orange hover:bg-hanwha-orange/90 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-md shadow-orange-950/20">
                      <Upload size={13} />
                      엑셀/CSV 선택
                      <input 
                        type="file" 
                        accept=".xlsx,.xls,.csv" 
                        className="hidden" 
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "plan")}
                      />
                    </label>
                    <p className="text-[10px] text-slate-500">또는 마우스로 드래그 & 드롭 하세요.</p>
                    
                    <button 
                      onClick={() => handleDownloadTemplate("plan")}
                      className="text-[10px] text-hanwha-orange hover:underline block pt-2 cursor-pointer"
                    >
                      💡 생산공정 계획 템플릿 다운로드 (.csv)
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
                className={`bg-slate-800/40 rounded-xl border-2 border-dashed p-8 shadow-md flex flex-col items-center text-center justify-center min-h-[300px] transition-all relative ${
                  dragActiveB ? "border-hanwha-orange bg-hanwha-orange/5 scale-[1.01]" : "border-slate-700 hover:border-slate-600 bg-slate-800/20 hover:bg-slate-800/40"
                }`}
              >
                {deliveries.length > 0 ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mx-auto border border-emerald-500/20">
                      <FileCheck size={24} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">자재 입고 현황판 로드 성공</h4>
                      <p className="text-[11px] text-slate-400 mt-1">{deliveries.length}개의 입고 내역 등록 완료</p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <label className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[10px] font-semibold cursor-pointer border border-slate-600 transition-colors">
                        파일 교체
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
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-slate-900 text-hanwha-orange rounded-full flex items-center justify-center border border-slate-700 mx-auto">
                      <FileSpreadsheet size={24} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">파일 B: 자재 입고 현황판 업로드</h4>
                      <p className="text-[11px] text-slate-400 mt-1">자재코드, 입고일, 입고수량, 협력사명 열이 매칭됩니다.</p>
                    </div>
                    <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-hanwha-orange hover:bg-hanwha-orange/90 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-md shadow-orange-950/20">
                      <Upload size={13} />
                      엑셀/CSV 선택
                      <input 
                        type="file" 
                        accept=".xlsx,.xls,.csv" 
                        className="hidden" 
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "delivery")}
                      />
                    </label>
                    <p className="text-[10px] text-slate-500">또는 마우스로 드래그 & 드롭 하세요.</p>
                    
                    <button 
                      onClick={() => handleDownloadTemplate("delivery")}
                      className="text-[10px] text-hanwha-orange hover:underline block pt-2 cursor-pointer"
                    >
                      💡 자재입고 현황 템플릿 다운로드 (.csv)
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Quick Helper Tips */}
            <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl flex items-start gap-3">
              <Info size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="space-y-1 text-xs text-slate-400 leading-normal">
                <p className="font-semibold text-white">💡 엑셀 대조 가이드라인</p>
                <p>
                  1. 두 엑셀의 자재코드가 일치하면 자동으로 매핑되어 수급 격차가 산출됩니다.<br/>
                  2. 한 엑셀 파일 내 동일한 자재코드가 중복되어 여러 번 등재되어 있더라도 수급 엔진이 사전에 이를 <strong>동일 자재코드 수량 합산</strong>으로 처리하므로 수동 전처리 작업이 필요하지 않습니다.
                </p>
              </div>
            </div>

          </div>
        ) : (
          /* Active Shortage 관제 Dashboard State */
          <div className="space-y-6">
            
            {/* Realtime KPI Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
              {/* Risk State Card */}
              <div className={`p-5 rounded-xl border shadow-md flex flex-col justify-between h-28 ${riskLevel.bg} ${riskLevel.border}`}>
                <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">종합 수급 리스크</span>
                <span className={`text-sm sm:text-base font-extrabold ${riskLevel.textClass}`}>{riskLevel.text}</span>
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 pt-1">
                  <Calendar size={11} /> 기준일자: {REFERENCE_TODAY}
                </span>
              </div>

              {/* Overdue Count */}
              <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md flex flex-col justify-between h-28">
                <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">지연 품목 수 (Overdue)</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-orange-400">{overdueCount}</span>
                  <span className="text-[11px] text-slate-400 font-semibold">건</span>
                </div>
                <span className="text-[10px] text-slate-400 leading-normal">투입 예정일 초과 부품</span>
              </div>

              {/* Critical Count */}
              <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md flex flex-col justify-between h-28">
                <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">당일 위험 품목 (Critical)</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-red-400">{criticalCount}</span>
                  <span className="text-[11px] text-slate-400 font-semibold">건</span>
                </div>
                <span className="text-[10px] text-slate-400 leading-normal">오늘 즉시 투입 요망</span>
              </div>

              {/* Sum of shortages */}
              <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md flex flex-col justify-between h-28">
                <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">누적 결품 부족량</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-white">{totalOverdueQty}</span>
                  <span className="text-[11px] text-slate-400 font-semibold">개</span>
                </div>
                <span className="text-[10px] text-slate-400 leading-normal">전체 조달 충족을 위한 누락량</span>
              </div>
            </div>

            {/* Dashboard Bento Grid (Main Layout) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Data Grid and Recharts Charts */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Data Grid Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Database size={15} className="text-hanwha-orange" />
                      오늘의 자재 대조 수급 관제표
                    </h3>
                    {isDemo && (
                      <span className="text-[10px] font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded px-1.5 py-0.5">
                        실습용 가상 데이터 탑재 상태
                      </span>
                    )}
                  </div>
                  <ShortageList materials={analyzed} />
                </div>

                {/* Dashboard Interactive Charts */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white">
                    실시간 지연 시각 지표
                  </h3>
                  <SupplierChart data={analyzed} />
                </div>

              </div>

              {/* Right Column: AI Section (Briefing & Actionable Email) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sparkles size={14} className="text-hanwha-orange" />
                    AI 수급 예측 관제실
                  </h3>
                </div>
                <AIReportSection
                  criticalItems={analyzed.filter(m => m.status === "CRITICAL" || m.status === "OVERDUE")}
                  overdueCount={overdueCount}
                  criticalCount={criticalCount}
                  totalOverdueQty={totalOverdueQty}
                />

                {/* Secure handling note */}
                <div className="bg-slate-850 rounded-lg p-3.5 border border-slate-700 text-slate-400 text-[11px] leading-relaxed">
                  <p className="font-bold text-slate-200 flex items-center gap-1 mb-1">
                    🔒 한화 내부 정보 보안 규정 가시화
                  </p>
                  <p>
                    Shortage Guard AI는 실습 전용 프로토타입으로, 업로드된 엑셀/CSV 데이터의 실제 처리 및 파싱을 외부 클라우드 서버에 전송하지 않고 <strong>귀하의 PC 메모리(Local Sandbox Memory) 내에서만 격리 처리</strong>합니다.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Footer Branding and Details */}
      <footer className="bg-[#0b0f19] border-t border-slate-800 py-6 mt-12 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-[11px] space-y-1.5 font-sans">
          <p className="font-semibold text-slate-400">Hanwha Aerospace Co., Ltd. — 자재관리 자동화 실습 전용</p>
          <p>© 2026 Shortage Guard AI Portal. All Rights Reserved. 본 환경은 사내 보안 기준을 준수합니다.</p>
        </div>
      </footer>

      {/* Global Loading Spinner Backdrop */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center z-50">
          <div className="relative flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-hanwha-orange animate-spin"></div>
            <ShieldAlert size={18} className="absolute text-hanwha-orange animate-pulse" />
          </div>
          <p className="text-xs font-bold text-hanwha-orange mt-4 animate-pulse">지능형 자재 수급 대조 분석기 가동 중...</p>
          <p className="text-[10px] text-slate-400 mt-1">사내 엑셀 구조 분석 및 동기화 매핑 중입니다.</p>
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
