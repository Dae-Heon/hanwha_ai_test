# Hanwha Aerospace Brand Design System Guide (디자인 가이드라인)

본 가이드라인은 글로벌 항공우주·방산 리더인 **한화에어로스페이스(Hanwha Aerospace)**의 공식 브랜드 아이덴티티(CI/BI) 및 디자인 철학을 기반으로 설계되었습니다. 아울러 본 가이드라인은 사내 지능형 자재 조달 분석 포털인 **Shortage Guard AI** 웹 어플리케이션에 완벽히 적용되는 UI/UX 구현 규칙을 수록하고 있습니다.

---

## 1. 브랜드 아이덴티티 (Brand Identity & Vision)

한화에어로스페이스는 우주(Space), 항공(Aviation), 방산(Defense) 분야의 세계적 기술 표준을 선도하며, 인류의 영토를 우주로 확장하는 선구적인 미래를 구축하고 있습니다.

### 핵심 가치 (Core Values)
*   **도전 (Challenge)**: 한계에 타협하지 않고 글로벌 No.1을 향해 나아가는 열정.
*   **헌신 (Dedication)**: 국가의 안보와 인류의 번영에 기여하는 최고 수준의 책임감.
*   **정도 (Integrity)**: 공정하고 투명한 프로세스를 바탕으로 한 절대적 신뢰.

### 디자인 콘셉트: "Cosmic Precision & Solar Energy"
*   우주의 무한하고 신비로운 공간을 상징하는 **Deep Cosmic Dark**를 메인 베이스로 활용합니다.
*   한화그룹의 끊임없는 열정과 도전을 상징하는 태양 에너지의 역동적인 **Hanwha Orange**를 핵심 악센트로 조합하여 고대비(High-Contrast)의 첨단 제어실(Control Room) 무드를 완성합니다.

---

## 2. 디자인 핵심 원칙 (Core Design Principles)

1.  **대담한 정밀성 (Bold Precision)**
    *   방산 및 대형 제조업의 특성에 부합하도록 선, 간격, 테두리 반경이 완벽히 정렬된 그리드를 제공합니다.
    *   어떠한 수치적 왜곡이나 혼선도 허용하지 않는 직관적이고 가독성이 극대화된 레이아웃을 지향합니다.
2.  **우주적 대비 (Cosmic Contrast)**
    *   다크 모드(`bg-[#0f172a]`)를 기본 콘셉트로 설정하여 모니터를 오랫동안 주시하는 현장 조달/자재 관리자들의 눈 피로도를 최소화합니다.
    *   메인 컬러와 무채색의 극명한 고대비(Contrast Ratio 4.5:1 이상)를 구축하여 중요 정보를 즉각 인지하도록 유도합니다.
3.  **안전과 신뢰성 (Security & Safety)**
    *   화려함보다는 신뢰감과 전문성을 전달하기 위해 깔끔하게 마감된 테두리(`border-slate-700`), 플랫한 디자인 및 정제된 마이크로 애니메이션을 적극 활용합니다.
    *   장식적인 요소(슬롭/불필요한 인프라 사양 텍스트)를 최소화하여 군수 수준의 안정적 디자인 무드를 완성합니다.

---

## 3. 전용 색상 시스템 (Color Palette)

한화에어로스페이스의 공식 컬러는 혁신을 선도하는 태양빛 오렌지와 신뢰를 나타내는 그레이, 우주를 대변하는 다크 블루의 세련된 조화로 구현됩니다.

| 분류 | 컬러 명칭 | 대표 HEX | RGB | CMYK | 용도 및 가이드라인 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary** | **Hanwha Orange** | `#F37321` | `243, 115, 33` | `0, 64, 91, 0` | 브랜드 핵심 아이덴티티, 메인 버튼, 활성 탭, 주요 상호작용 지점 |
| **Accent** | **Hanwha Amber** | `#F59E0B` | `245, 158, 11` | `0, 40, 95, 4` | 보조 포인트 컬러, 주의 경보 피드백 |
| **Cosmic** | **Space Navy** | `#0F172A` | `15, 23, 42` | `88, 77, 40, 52` | 기본 배경색(Canvas), 깊은 우주적 제어 화면의 무드를 형성 |
| **Dark Neutral** | **Slate Gray** | `#1E293B` | `30, 41, 59` | `80, 68, 48, 45` | 컴포넌트 카드(`bg-slate-800`), 테이블 헤더, 모달 내부 배경색 |
| **Border Neutral** | **Steel Silver** | `#334155` | `51, 65, 85` | `70, 58, 45, 25` | 테두리 실선(`border-slate-700`), 구분선, 비활성 입력 영역 |
| **Text Primary** | **Starlight White** | `#F8FAFC` | `248, 250, 252` | `0, 0, 0, 2` | 주요 텍스트, 메인 타이틀, 강조 라벨 |
| **Text Secondary** | **Nebula Silver** | `#94A3B8` | `148, 163, 184`| `44, 34, 28, 0` | 부가 설명, 타임스탬프, 비활성 메타데이터 |

### 실시간 수급 리스크 등급 컬러 (Status & Alerts)
*   **🚨 위험 (Critical)**: `bg-red-500/10` / `text-red-400` / `border-red-500/20` (오늘 당장 수급 차질 우려)
*   **⏰ 지연 (Overdue)**: `bg-orange-500/10` / `text-orange-400` / `border-orange-500/20` (계획일을 경과한 미납 품목)
*   **💡 경고 (Warning)**: `bg-amber-500/10` / `text-amber-400` / `border-amber-500/20` (3일 내 투입 필요하나 불확실한 품목)
*   **✅ 정상 (Normal)**: `bg-emerald-500/10` / `text-emerald-400` / `border-emerald-500/20` (수급 100% 충족)

---

## 4. 타이포그래피 규칙 (Typography System)

한화에어로스페이스의 지능형 분석 플랫폼은 다양한 데이터 수치(자재코드, 수량, 수급 비율, 날짜)를 완벽히 정렬하여 가시적으로 표현해야 하므로 **고해상도 다목적 가변 서체**와 **고정폭 기술 서체**를 완벽하게 조합합니다.

### 폰트 페어링 (Font Pairing Strategy)
*   **국문 및 기본 UI**: **Pretendard** 또는 **Inter** (sans-serif)
    *   현존하는 국문 폰트 중 힌팅 처리 및 행간 균형이 가장 최적화되어 다크 모드 환경에서도 글씨 번짐 없이 압도적인 시인성을 보장합니다.
*   **영문 타이틀 및 주요 수치**: **Space Grotesk** 또는 **Outfit**
    *   기하학적이고 테크니컬한 디스플레이 서체로서, 항공우주 계기판을 보는 듯한 기술 중심적인 아이덴티티를 심어줍니다.
*   **자재코드 및 수량 수치**: **JetBrains Mono** 또는 **Fira Code** (monospace)
    *   자재코드(예: `HW-AERO-X309`)나 결품 수량, 계산 데이터 등 완벽한 그리드 내 폭 맞춤이 필요한 숫자를 고정폭으로 안전하게 렌더링합니다.

### 크기 및 굵기 위계 (Hierarchy Scale)
*   **Main Hero Title**: `30px (text-3xl)` / ExtraBold (800) / Tracking Tight
*   **Section Header**: `20px (text-xl)` / Bold (700) / Tracking Tight
*   **Component Card Title**: `14px (text-sm)` / SemiBold (600) / Text-White
*   **General UI / Table Data**: `12px (text-xs)` / Medium (500) / Leading Normal
*   **Micro Metadata / Mono Numbers**: `11px` 또는 `10px` / Monospace / Regular or Medium

---

## 5. 비주얼 모티브 및 레이아웃 (Visual Motif & Layout)

### 1) 한화 트라이써클 (Hanwha Tricircle)
세 개의 원이 유기적으로 맞물려 역동적인 에너지와 신뢰의 순환을 그리는 디자인 심볼을 간접적으로 계승합니다. 
*   **둥근 유선형 모서리**: 사각의 날카로움을 부드러운 정밀함으로 전환하기 위해 기본 카드의 모서리 반경을 `rounded-xl (12px)` 또는 `rounded-2xl (16px)`로 일관되게 규정합니다.
*   **부드러운 하이라이트**: 카드 및 주요 영역의 외곽선(`border-slate-700/80`)에 미세한 입체감을 더해 우주의 은은한 광채(Ambient Glow)를 선사합니다.

### 2) bento Grid 기반의 정보 배열 (Bento Box Interface)
현장의 방대한 데이터를 직관적인 분할 공간에 담기 위해 벤토 그리드 구조를 채용합니다.
*   **좌측 컬럼 (자재 대조 관제표 및 시각 지표)**: 메인 테이블과 공급사 비중 차트를 2:1로 다단 분할 배치하여 복잡한 데이터를 수평적으로 빠르게 훑어볼 수 있도록 유도합니다.
*   **우측 컬럼 (AI 수급 예측 관제실)**: 핵심 의사결정을 돕는 예측 브리핑 보드 및 이메일 서식 자동화 코너를 종형으로 배치하여 시선의 흐름이 조화롭게 수렴되도록 합니다.

---

## 6. Shortage Guard AI 구현 명세 (Tailwind CSS Specs)

본 솔루션에 수립된 실제 스타일링 코드 가이드라인입니다.

### 전용 테마 변수 (Tailwind @theme 확장)
```css
@theme {
  --color-hanwha-orange: #f37321;
  --color-hanwha-amber: #f59e0b;
  --font-sans: "Inter", "Pretendard", ui-sans-serif, system-ui;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular;
}
```

### 시그니처 컴포넌트 스타일 규격 (Tailwind Snippets)

#### 1) 메인 레이아웃 및 헤더 배너
```html
<!-- 우주 공간 무드의 딥 다크 캔버스 및 내비게이션 -->
<div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans flex flex-col selection:bg-orange-800 selection:text-white">
  <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 text-white shadow-lg">
    ...
  </header>
</div>
```

#### 2) 자재 현황판 업로드 카드 (Drag & Drop Zone)
```html
<div className="bg-slate-800/40 rounded-xl border-2 border-dashed border-slate-700 hover:border-slate-600 bg-slate-800/20 hover:bg-slate-800/40 transition-all flex flex-col items-center justify-center min-h-[300px]">
  <div className="w-12 h-12 bg-slate-900 text-hanwha-orange rounded-full flex items-center justify-center border border-slate-700">
    <FileSpreadsheet size={24} />
  </div>
  ...
</div>
```

#### 3) 인공지능 기반 분석 패널 (AI Report Section)
```html
<div className="bg-gradient-to-br from-slate-800 to-slate-900 text-slate-100 rounded-xl border border-slate-700 border-l-4 border-l-blue-500 p-6 shadow-lg flex flex-col h-[520px]">
  <div className="bg-hanwha-orange/10 text-hanwha-orange p-2 rounded-lg border border-hanwha-orange/20">
    <Sparkles size={18} className="animate-pulse" />
  </div>
  ...
</div>
```

#### 4) 스마트 컬럼 매퍼 모달 (Manual Mapper Modal)
```html
<div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
  <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
    <div className="bg-slate-900 px-5 py-4 border-b border-slate-700 flex items-center gap-3">
      ...
    </div>
  </div>
</div>
```

---

## 7. 결론 및 향후 유지보수 지침

한화에어로스페이스의 디자인 정체성은 **"타협 없는 최고의 기술력과 신뢰성"**에 닿아 있습니다. 본 디자인 가이드를 준수하여 개발된 **Shortage Guard AI**는 단순한 사내 ERP 유틸리티를 넘어, 실제 제조 공장의 의사결정 효율을 최상으로 끌어올리는 혁신적인 시각 도구가 될 것입니다. 

추후 기능 추가나 페이지 확장 시 본 문서에 기재된 전용 컬러 스펙트럼과 타이포그래피 페어링 규칙을 반드시 철저히 지켜 브랜드 일관성을 유지해야 합니다.
