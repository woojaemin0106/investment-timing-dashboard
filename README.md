 Investment Timing Dashboard

> "지금 투자해도 되는가?"라는 질문에 데이터로 답하는 투자 타이밍 분석 대시보드

특정 종목의 현재 가격 위치, RSI, 변동성, 이동평균, 이상 구간을 함께 확인해 투자 판단을 보조하는 Next.js 기반 대시보드입니다. 외부 API를 클라이언트에서 직접 호출하지 않고 내부 API Route에서 데이터를 가공해 전달하며, API 키가 없거나 호출이 실패해도 mock fallback으로 UI 개발이 가능하도록 설계했습니다.

## 주요 기능

- 종목별 가격 히스토리 조회
- 현재가, 전일 대비 등락률, percentile, RSI, 변동성 기반 타이밍 분석
- MA20 / MA60 이동평균 계산
- 급등, 급락, 변동성 확대 구간 anomaly 탐지
- `cold` / `neutral` / `hot` 투자 신호 제공
- Twelve Data API 연동 및 mock fallback
- 응답 데이터 출처 구분: `source: "live" | "mock"`
- Overview / Stock Detail 화면
- Playwright 기반 smoke test 및 API contract test

## 기술 스택

| 영역 | 기술 |
|---|---|
| Framework | Next.js 16, React 19 |
| Language | TypeScript |
| Styling | Sass, SCSS Module |
| Chart | Recharts |
| Data Fetching | React Query |
| Server | Next.js App Router API Route |
| Validation | Zod |
| External Data | Twelve Data API |
| Test | Playwright |
| Deploy | Vercel |

## 역할 분담

| 담당 | 역할 |
|---|---|
| Full-stack / Data API | 데이터 흐름 설계, 내부 API, 분석 로직, mock fallback, 타입 계약, 테스트 |
| Frontend A | Overview 화면, 핵심 카드, 차트 UI |
| Frontend B | 상세 분석, Anomaly, 필터, 상태 처리 |

## 담당 구현 범위

- `GET /api/market/history` 내부 API 구현
- `GET /api/market/timing` 내부 API 구현
- Twelve Data API 서버 연동 구조 준비
- API 키 미설정 또는 외부 API 실패 시 mock fallback 처리
- AAPL / TSLA / NVDA / SPY 시계열 mock 데이터 제공
- 이동평균, RSI, 변동성, percentile, anomaly, signal 분석 유틸 구현
- React Query hook 및 API client 함수 제공
- API 응답에 `source: "live" | "mock"` 추가
- API contract test 추가
- UI 담당자가 사용할 데이터 계약 문서화

## 내부 API

### 가격 히스토리

```http
GET /api/market/history?symbol=AAPL&range=1y
응답:

type MarketHistoryResponse = {
  symbol: "AAPL" | "TSLA" | "NVDA" | "SPY";
  range: "1m" | "3m" | "6m" | "1y";
  source: "live" | "mock";
  prices: PricePoint[];
};
타이밍 분석
GET /api/market/timing?symbol=AAPL&range=1y
응답:

type MarketTimingResponse = {
  source: "live" | "mock";
  summary: MarketSummary;
  prices: PricePoint[];
  anomalies: AnomalyPoint[];
};
주요 타입
type PricePoint = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma20?: number;
  ma60?: number;
};

type MarketSummary = {
  symbol: "AAPL" | "TSLA" | "NVDA" | "SPY";
  currentPrice: number;
  previousClose?: number;
  changeRate: number;
  percentile: number;
  rsi: number;
  volatility: number;
  signal: "cold" | "neutral" | "hot";
  summary: string;
};

type AnomalyPoint = {
  date: string;
  type: "surge" | "drop" | "volatility";
  value: number;
  description: string;
};
지원 값
항목	값
symbol	AAPL, TSLA, NVDA, SPY
range	1m, 3m, 6m, 1y
source	live, mock
signal	cold, neutral, hot
프로젝트 구조
src/
├─ app/
│  ├─ api/
│  │  ├─ market/
│  │  │  ├─ history/
│  │  │  └─ timing/
│  │  └─ stocks/
│  ├─ stock/[code]/
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
│  ├─ OverviewTab/
│  ├─ Sidebar/
│  └─ StockDetailView/
├─ lib/
├─ mocks/
├─ shared/
│  ├─ api/
│  ├─ hooks/
│  ├─ lib/
│  ├─ mocks/
│  ├─ server/
│  └─ types/
├─ styles/
└─ types/
시작하기
1. 의존성 설치
npm install
2. 환경 변수 설정
프로젝트 루트에 .env.local을 생성합니다.

TWELVE_DATA_API_KEY=your_api_key
API 키가 없어도 mock fallback으로 동작합니다.

3. 개발 서버 실행
npm run dev
브라우저에서 http://localhost:3000을 엽니다.

스크립트
명령어	설명
npm run dev	개발 서버 실행
npm run build	프로덕션 빌드
npm run start	빌드 결과 실행
npm run lint	ESLint 검사
npm run test	Playwright 테스트
npm run test:headed	브라우저 표시 모드 테스트
배포
Vercel 배포를 기준으로 합니다.

Production Branch: main
Preview / 통합 브랜치: develop
Feature 작업: feature/*
Vercel Environment Variables에 아래 값을 추가합니다.

TWELVE_DATA_API_KEY=your_api_key
협업 흐름
feature/* -> develop -> main
기능 작업은 feature/* 브랜치에서 진행합니다.
PR 기본 대상은 develop입니다.
안정화 후 develop에서 main으로 머지해 production 배포합니다.
커밋 메시지는 Conventional Commits를 따릅니다.
현재 한계 및 확장 예정
내부 market API는 현재 AAPL, TSLA, NVDA, SPY 중심으로 연결되어 있습니다.
Twelve Data는 코인, 외환, ETF도 지원하지만 내부 history/timing API 확장은 아직 진행 전입니다.
인기종목은 현재 UI 하드코딩 기반이며, 별도 ranking API는 아직 없습니다.
매수/매도 신호는 외부 API에서 직접 받지 않고 내부 분석 로직으로 계산합니다.
한 줄 진단은 AI 생성이 아닌 rule-based summary입니다.
Disclaimer
본 프로젝트는 학습 및 포트폴리오 목적의 투자 데이터 시각화 프로젝트입니다. 제공되는 데이터와 신호는 실제 투자 자문이 아니며, 투자 결정의 책임은 사용자 본인에게 있습니다
