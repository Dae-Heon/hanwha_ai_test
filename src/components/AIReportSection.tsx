import React, { useState } from "react";
import { AnalyzedMaterial } from "../types";
import { Sparkles, Mail, Copy, Check, AlertCircle, FileText, Loader2 } from "lucide-react";

interface AIReportSectionProps {
  criticalItems: AnalyzedMaterial[];
  overdueCount: number;
  criticalCount: number;
  totalOverdueQty: number;
}

export const AIReportSection: React.FC<AIReportSectionProps> = ({
  criticalItems,
  overdueCount,
  criticalCount,
  totalOverdueQty
}) => {
  const [loading, setLoading] = useState(false);
  const [reportText, setReportText] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  const [apiWarning, setApiWarning] = useState<string | null>(null);

  // Fallback locally generated high-fidelity briefing & email if Gemini key is not registered
  const generateLocalReport = () => {
    const topItem = criticalItems[0];
    const secondItem = criticalItems[1];

    let itemsDetails = "";
    criticalItems.slice(0, 3).forEach((item, idx) => {
      itemsDetails += `${idx + 1}. [${item.materialCode}] ${item.materialName} | 부족량: ${item.shortageQty}개 | 납기일: ${item.targetDate} | 협력사: ${item.supplier}\n`;
    });

    const emailTarget = topItem ? topItem.supplier : "협력사";
    const emailMaterial = topItem ? topItem.materialName : "납기 부품";
    const emailShortage = topItem ? topItem.shortageQty : "발주 수량";
    const emailDate = topItem ? topItem.targetDate : "투입일";

    const report = `### 🚨 자재 수급 위기 종합 실시간 진단 (시스템 예측)

현재 생산 공정 관리 시스템 대조 결과, 총 **${overdueCount + criticalCount}건**의 수급 이슈가 감지되었습니다. 
* **지연(Overdue) 건수**: ${overdueCount}건 (투입 예정일 초과 완료)
* **위험(Critical) 건수**: ${criticalCount}건 (금일 즉시 투입 필요)
* **누적 결품 부족 수량**: 총 ${totalOverdueQty}개

#### 1. 최고 위험 부품 현황 및 공정 차질 진단
현재 가장 긴급한 병목 지점은 **${topItem ? topItem.materialName : "주요 방산 부품"}**입니다. 해당 자재는 **${topItem ? topItem.processStage : "조립 단계"}**에 투입되어야 하나, 협력사로부터 예정량 대비 **${topItem ? topItem.shortageQty : "일부"}개**가 미달 납품된 상태입니다. 즉각 보완되지 않을 시 생산 라인 다운이 확실시됩니다.

#### 2. 즉각 조치 권고 사항
1. **긴급 핫라인 가동**: 상위 지연 협력사인 **'${topItem ? topItem.supplier : "한성정밀"}'** 및 **'${secondItem ? secondItem.supplier : "삼강테크"}'** 납기 총괄 실무자와의 즉시 유선 연락을 수립하십시오.
2. **부분 납품 협의**: 전체 수량 입고 전, 금일 공정 유지에 필요한 최소 수량의 퀵 발송(특송 화물)을 최우선 요청하십시오.
3. **대체 공정 선행**: 조립 라인의 전면 중단을 막기 위해, 해당 자재 미요구 부차 조립 단계 또는 타 생산 편대 일정을 임시 선조치하는 방안을 고려하십시오.

---

### ✉️ 구매 담당자 발송용 긴급 납기독촉 이메일 초안

**수신**: ${emailTarget} 납기관리 담당자 귀하 (CC: 한화에어로스페이스 구매 1팀장)
**제목**: [긴급] 한화에어로스페이스 방산 생산 부품 (${emailMaterial}) 납기 지연에 따른 긴급 납품 촉구 및 조치 계획 요청의 건

안녕하세요. 
한화에어로스페이스 자재관리실 K9/레드백 생산라인 수급관리 담당자입니다.

귀사에서 공급하는 아래 품목의 납기가 지연되거나 부족 납품되어, 한화에어로스페이스의 국방 방산 장비 조립 공정에 전례 없는 심각한 차질이 우려되는 엄중한 상황입니다.

* **대상 품목**: ${emailMaterial}
* **자재 코드**: ${topItem ? topItem.materialCode : "HW-ACT-XXXX"}
* **납기 예정일**: ${emailDate} (현재 지연 중)
* **필요 수량**: ${topItem ? topItem.requiredQty : 0} 개
* **실제 입고**: ${topItem ? topItem.deliveredQty : 0} 개
* **현재 부족량**: **${emailShortage} 개** (즉각 보충 필요)

본 자재는 국가 안보와 국방 납기 준수가 생명인 핵심 조립 라인(${topItem ? topItem.processStage : "조립 단계"})의 직납 품목입니다. 라인 중단 시 발생하는 모든 지체 상금 및 공정 손실에 대한 엄격한 계약 조항이 발효될 수 있음을 양해하여 주시기 바랍니다.

이에 따라 귀사에서는 본 메일을 수신하시는 대로 **금일 17:00까지** 아래 사항을 확인하시어 즉시 공식 조치 계획을 회신하여 주시기 바랍니다.

1. **지연 자재의 긴급 특송(화물) 배송 계획 (금일중 출하 가능 수량 명시)**
2. **잔여 미입고 수량에 대한 분할 납품 일정**
3. **지연 원인 분석 및 긴급 재발 방지책**

한화에어로스페이스와의 지속적이고 신뢰할 수 있는 협력을 위해 귀사의 전사적인 조속한 대응과 협조를 강력히 촉구합니다.

감사합니다.

한화에어로스페이스 자재관리실 배상`;

    return report;
  };

  const generateReport = async () => {
    if (criticalItems.length === 0) {
      alert("분석할 수급 결품 데이터가 없습니다. 먼저 엑셀 파일을 탑재하거나 데모 시나리오를 실행해 주세요.");
      return;
    }

    setLoading(true);
    setApiWarning(null);

    try {
      const response = await fetch("/api/shortage-analysis/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          criticalItems: criticalItems.slice(0, 5), // Send top 5 critical items for context
          overviewStats: {
            overdueCount,
            criticalCount,
            totalOverdueQty
          }
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setReportText(data.report);
      } else {
        // API key missing or backend error - trigger the high-quality local fallback engine
        console.warn("Backend API returned error, activating local high-fidelity generator.");
        setApiWarning("서버의 Gemini API가 비활성화 상태이거나 오류가 발생하여, 스마트 수급 가이드라인에 기초한 고충실도 로컬 리포트를 대체 출력했습니다.");
        setReportText(generateLocalReport());
      }
    } catch (error) {
      console.error("Fetch report error:", error);
      setApiWarning("네트워크 연결 이상으로 실시간 지능형 로컬 리포트를 자동 생성하여 출력했습니다.");
      setReportText(generateLocalReport());
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!reportText) return;
    navigator.clipboard.writeText(reportText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-white text-slate-800 rounded-2xl border border-slate-200 border-l-4 border-l-hanwha-orange p-6 shadow-xs flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="bg-hanwha-orange/10 text-hanwha-orange p-2 rounded-lg border border-hanwha-orange/20">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI 위기분석 및 메일 초안</h3>
            <p className="text-[11px] text-slate-500 font-medium">결품 데이터를 심층 분석하여 즉각적인 조치 시나리오를 작성합니다.</p>
          </div>
        </div>

        {reportText && (
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-100 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition-all border border-slate-200 cursor-pointer font-medium"
          >
            {isCopied ? (
              <>
                <Check size={13} className="text-emerald-600" />
                복사 완료
              </>
            ) : (
              <>
                <Copy size={13} />
                리포트 전체 복사
              </>
            )}
          </button>
        )}
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 min-h-0 flex flex-col justify-between">
        {!reportText ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="bg-slate-50 p-4 rounded-full border border-slate-200">
              <Mail size={32} className="text-slate-400" />
            </div>
            <div className="max-w-xs space-y-1.5">
              <p className="text-sm font-bold text-slate-900">실시간 AI 위기관리 비서 가동</p>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                현재 분석된 결품 데이터를 토대로 ERP 대조 요약 및 한화 보안 기준을 준수한 고품격 구매처 이메일 초안을 단 3초 만에 받아보세요.
              </p>
            </div>
            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full max-w-xs py-2 px-4 bg-hanwha-orange hover:bg-hanwha-orange/90 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/10 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  AI 분석 브리핑 작성 중...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Shortage AI 브리핑 & 메일 작성
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {apiWarning && (
              <div className="mb-3 bg-amber-50 border border-amber-100 p-2.5 rounded-lg flex items-start gap-2">
                <AlertCircle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[10px] text-amber-800 leading-normal font-medium">{apiWarning}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto bg-slate-50 rounded-lg p-4 border border-slate-200 font-sans text-xs leading-relaxed space-y-4 selection:bg-orange-100 selection:text-orange-900">
              {/* Simple Custom Markdown Renderer inside pre-formatted blocks */}
              <div className="whitespace-pre-wrap text-slate-700 space-y-3 font-medium">
                {reportText.split("\n").map((line, idx) => {
                  if (line.startsWith("###")) {
                    return (
                      <h4 key={idx} className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1 pt-2 uppercase tracking-wide">
                        {line.replace("###", "").trim()}
                      </h4>
                    );
                  }
                  if (line.startsWith("####")) {
                    return (
                      <h5 key={idx} className="text-xs font-bold text-hanwha-orange pt-1">
                        {line.replace("####", "").trim()}
                      </h5>
                    );
                  }
                  if (line.startsWith("* **")) {
                    return (
                      <div key={idx} className="pl-2 text-slate-700 font-medium">
                        • <span className="font-bold text-slate-900">{line.replace("* **", "").replace("**", "").trim()}</span>
                      </div>
                    );
                  }
                  if (line.startsWith("* ")) {
                    return (
                      <div key={idx} className="pl-2 text-slate-600">
                        • {line.replace("* ", "").trim()}
                      </div>
                    );
                  }
                  if (line.includes("**")) {
                    // Split and bold mid-sentence parts
                    const parts = line.split("**");
                    return (
                      <p key={idx} className="text-slate-700">
                        {parts.map((p, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="text-slate-900 font-bold">{p}</strong> : p)}
                      </p>
                    );
                  }
                  return <p key={idx} className="text-slate-600">{line}</p>;
                })}
              </div>
            </div>

            {/* Generate Again Button */}
            <div className="mt-3 shrink-0">
              <button
                onClick={generateReport}
                disabled={loading}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    다시 작성 중...
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    AI 리포트 재생성 (업데이트 반영)
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
