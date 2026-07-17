import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy-loaded Google GenAI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// AI Analysis and Email Draft Generation Endpoint
app.post("/api/shortage-analysis/report", async (req, res) => {
  try {
    const { criticalItems, overviewStats } = req.body;

    const client = getGeminiClient();

    const prompt = `
당신은 한화에어로스페이스(Hanwha Aerospace)의 최고 자재수급 관리 전문가 및 AI 수급 관제관입니다.
방산 제조 공정(예: K9 자주포, 레드백 장갑차, 천무, 항공엔진 등 육해공 방산 장비 조립 라인)에서 발생한 자재 부족(Shortage) 위기 데이터를 분석하고, 실무를 획기적으로 개선할 수 있는 최고 수준의 국문(Korean) 요약 보고서와 협력사/담당자 대상 이메일 발송 초안을 작성하십시오.

### 입력된 위기 데이터 정보:
- 지연 품목 수: ${overviewStats?.overdueCount || 0}개
- 위험 품목 수: ${overviewStats?.criticalCount || 0}개
- 총 지연 수량: ${overviewStats?.totalOverdueQty || 0}개
- 가장 위험한 Top 품목 리스트:
${JSON.stringify(criticalItems || [], null, 2)}

### 요구사항:
1. **위기 분석 브리핑 (Briefing Report)**:
   - 현재 자재 수급 상황에 대한 직관적이고 군사/방산 제조 관점에서의 위기 진단.
   - 공정 차질(라인 다운) 가능성과 즉각 대처 우선순위 제시.
   - 어조: 매우 객관적이고 신뢰감 있고 엄격하며, 한화에어로스페이스 방산 생산 라인의 긴박함을 반영한 품격 있는 비즈니스 톤앤매너.

2. **구매 부서 및 협력사 이메일 초안 (Email Draft)**:
   - 가장 지연이 심각하거나 납기 위험이 높은 대표적인 자재(또는 상위 1~2개 협력업체)를 주 표적으로 삼아, 해당 협력사 또는 구매 담당자에게 발송할 설득력 있고 신속한 협조 요청 이메일 초안을 작성하십시오.
   - 이메일에는 수신처(예: "[협력사명] 납기관리 담당자 귀하" 또는 "구매팀 [자재명] 담당 매니저님"), 부족 수량, 투입예정일, 그리고 구체적인 조치 요구사항(예: "긴급 대체 운송 수단 확보", "부분 납품 후 잔량 순차 배송", "오늘 17시까지 조치 계획 회신")이 명시되어야 합니다.
   - 예의 바르면서도 방산 국방 납기 준수를 위한 단호함이 돋보이는 문구로 작성하세요.

출력 포맷은 반드시 사용자에게 깔끔하게 보여줄 수 있도록 마크다운(Markdown) 구조로 작성해 주십시오. (예: ### 1. 수급 위기 종합 진단, ### 2. 즉각 조치 권고 사항, ### 3. 긴급 독촉 메일 초안)
`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({
      success: true,
      report: response.text,
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "AI 리포트 생성 중 알 수 없는 오류가 발생했습니다. API 키가 등록되어 있는지 확인해주세요.",
    });
  }
});

// Healthy Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Shortage Guard AI] Server running on http://localhost:${PORT}`);
  });
}

startServer();
