# Investment Timing Dashboard

투자 종목의 가격 흐름, RSI, 변동성, 이동평균, 이상 신호를 기반으로 투자 타이밍 판단을 보조하는 Next.js 기반 분석 대시보드입니다.

외부 API는 클라이언트에서 직접 호출하지 않고, Next.js 내부 API Route에서 데이터를 가공해 전달합니다. API 키가 없거나 외부 API 호출이 실패해도 deterministic mock 데이터로 화면 개발과 테스트가 가능하도록 구성했습니다.

> 본 프로젝트는 학습 및 포트폴리오 목적의 데이터 시각화 프로젝트이며, 실제 투자 자문이 아닙니다.

## 주요 기능

- Overview 대시보드와 종목 상세 화면
- 관심 종목 기반 타이밍 분석 화면
- 가격 history 조회 API
- 투자 타이밍 summary API
- MA20, MA60 이동평균 계산
- RSI, percentile, 변동성 기반 투자 신호 계산
- 급등, 급락, 변동성 이상 구간 탐지
- Twelve Data API 연동 준비 및 mock fallback
- API 응답 출처 표시: `source: "live" | "mock"`
- Playwright 기반 smoke/API contract test

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| Framework | Next.js 16, React 19 |
| Language | TypeScript |
| Styling | Sass, SCSS Module |
| Chart | Recharts |
| Data Fetching | React Query |
| Server | Next.js App Router API Route |
| Validation | Zod |
| External API | Twelve Data API |
| Test | Playwright |
| Deploy | Vercel |

## 역할 분담

| 담당 | 역할 |
| --- | --- |
| 우재민 | 데이터 흐름 설계, 내부 API Route, 분석 로직, mock fallback, API contract test, 배포 설정 |
| 팀원 A | Overview, 핵심 카드, 차트 UI |
| 팀원 B | Timing/Detailed, Anomaly, 필터, 상태 처리 |

## 담당 구현 범위

- `GET /api/market/history` 내부 API 구현
- `GET /api/market/timing` 내부 API 구현
- `TWELVE_DATA_API_KEY` 기반 서버 사이드 외부 API 연동 구조 준비
- API 키 미설정 또는 외부 API 실패 시 mock fallback 처리
- AAPL, TSLA, NVDA, SPY 대상 deterministic mock 시계열 데이터 제공
- 이동평균, RSI, 변동성, percentile, anomaly, signal 분석 유틸 구현
- React Query hook과 typed API client 제공
- `/timing` 화면에서 지원 종목의 market API 데이터와 anomaly 표시 연결
- API contract test 추가

## 내부 API

### 가격 히스토리

```http
GET /api/market/history?symbol=AAPL&range=1y
```

응답 예시:

```ts
type MarketHistoryResponse = {
  symbol: "AAPL" | "TSLA" | "NVDA" | "SPY";
  range: "1m" | "3m" | "6m" | "1y";
  source: "live" | "mock";
  prices: PricePoint[];
};
```

### 투자 타이밍 분석

```http
GET /api/market/timing?symbol=AAPL&range=1y
```

응답 예시:

```ts
type MarketTimingResponse = {
  source: "live" | "mock";
  summary: MarketSummary;
  prices: PricePoint[];
  anomalies: AnomalyPoint[];
};
```

### 주요 타입

```ts
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
```

## 지원 값

| 항목 | 값 |
| --- | --- |
| symbol | `AAPL`, `TSLA`, `NVDA`, `SPY` |
| range | `1m`, `3m`, `6m`, `1y` |
| source | `live`, `mock` |
| signal | `cold`, `neutral`, `hot` |

## 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local`을 생성합니다.

```bash
TWELVE_DATA_API_KEY=your_api_key
```

API 키가 없어도 mock fallback으로 동작합니다. 실제 키 값은 GitHub에 커밋하지 않습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## 스크립트

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드 결과 실행 |
| `npm run lint` | ESLint 검사 |
| `npm run test` | Playwright 테스트 |
| `npm run test:headed` | 브라우저 표시 모드 테스트 |

## 배포 흐름

- Production Branch: `main`
- 통합 브랜치: `develop`
- 기능 작업: `feature/*`
- 기본 PR 흐름: `feature/* -> develop -> main`
- Vercel Environment Variables에 `TWELVE_DATA_API_KEY`를 등록합니다.
- `main`에 merge되면 Vercel Production Deployment가 생성됩니다.

## 현재 한계 및 확장 예정

- 현재 market timing API는 AAPL, TSLA, NVDA, SPY 중심입니다.
- 코인, 외환, ETF의 실제 history/timing API 확장은 후속 작업입니다.
- 인기 종목 ranking API는 아직 별도 구현 전입니다.
- 매수/매도 신호는 외부 API에서 직접 받지 않고 내부 분석 로직으로 계산합니다.
- 한 줄 진단은 AI 생성이 아닌 rule-based summary입니다.

## Disclaimer

이 프로젝트의 데이터와 분석 결과는 투자 판단을 보조하기 위한 데모입니다. 실제 투자 결정과 그 책임은 사용자 본인에게 있습니다.
