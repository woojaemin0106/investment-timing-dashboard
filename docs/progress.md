# Investment Timing Dashboard Progress

## Overall Progress

- 제출 MVP 기준: 95%

영역별 진행률:

- 데이터/API/분석: 100%
- Overview/UI: 90%+
- Timing/Detailed/Anomaly: 85%+
- 배포/문서: 90%+

기존 데이터/API 기반 산정:

- Type definitions: 10 / 10
- Mock data: 15 / 15
- Analysis logic: 20 / 20
- API Route: 20 / 20
- API client/hook: 15 / 15
- Documentation: 10 / 10
- lint/build/test: 10 / 10

## Completed

- [x] Shared market data contracts were defined for price, range, symbol, summary, source, timing response, and anomaly data.
- [x] Deterministic mock data was added for AAPL, TSLA, NVDA, and SPY.
- [x] Range handling was added for `1m`, `3m`, `6m`, and `1y`.
- [x] Moving average, percentile, RSI, volatility, change-rate, signal, summary, and anomaly utilities were implemented.
- [x] Internal App Router API routes were implemented for market history and timing.
- [x] Server-side Twelve Data adapter structure was prepared with `TWELVE_DATA_API_KEY` fallback.
- [x] Market API responses include `source: "live" | "mock"`.
- [x] Typed API client functions and React Query hooks were added.
- [x] `/timing` detail chart can use market API prices for AAPL, TSLA, NVDA, and SPY.
- [x] `/timing` detail chart displays market API source and anomaly results.
- [x] Random alert time generation was replaced with deterministic code-based time generation.
- [x] README was corrected for GitHub Markdown rendering.
- [x] Playwright API contract smoke tests were added.

## In Progress

- [ ] Final deployment flow: `feature/final-submission-polish -> develop -> main`.
- [ ] Vercel Production deployment confirmation after `main` merge.

## Remaining Tasks

- [ ] Expand market API support for crypto, forex, ETF, and domestic stocks.
- [ ] Add a dedicated popular/ranking API if the UI needs "popular symbols".
- [ ] Validate Twelve Data live mode in production with quota and error handling.
- [ ] Improve Detailed/Anomaly filters after the MVP submission.
- [ ] Replace rule-based summary with AI or richer analysis only if product scope requires it.

## API Usage

```http
GET /api/market/history?symbol=AAPL&range=1y
GET /api/market/timing?symbol=AAPL&range=1y
```

Defaults:

- `symbol`: `AAPL`
- `range`: `1y`

Supported values:

- `symbol`: `AAPL`, `TSLA`, `NVDA`, `SPY`
- `range`: `1m`, `3m`, `6m`, `1y`

Error shape:

```json
{
  "error": {
    "message": "Unsupported symbol: INVALID",
    "code": "UNSUPPORTED_SYMBOL",
    "field": "symbol",
    "supported": ["AAPL", "TSLA", "NVDA", "SPY"]
  }
}
```

Data source:

- `source: "live"` means the response used Twelve Data.
- `source: "mock"` means the response used deterministic fallback data.

## For Overview Developer

- Use `GET /api/market/timing?symbol=AAPL&range=1y` when a widget needs timing analysis.
- Use `summary.currentPrice`, `summary.changeRate`, `summary.percentile`, `summary.rsi`, `summary.volatility`, `summary.signal`, and `summary.summary` for cards and badges.
- Use `prices` for charts. Each point includes `date`, OHLC, `volume`, and optional `ma20` / `ma60`.
- Use top-level `source` to show whether the data is live or mock-backed.

## For Detailed Developer

- Use `GET /api/market/history?symbol=TSLA&range=6m` for chart-only data.
- Use `GET /api/market/timing?symbol=TSLA&range=6m` when the page also needs summary and anomaly data.
- `prices` are sorted by ascending date and are safe for Recharts line, area, or composed charts.
- The current `/timing` detail chart already falls back to the existing generated chart data for unsupported symbols.

## For Anomaly Developer

- Use `anomalies` from `/api/market/timing`.
- Each anomaly includes `date`, `type`, `value`, and `description`.
- Supported anomaly types are `surge`, `drop`, and `volatility`.
- If the list is empty, show `최근 감지된 이상 신호가 없습니다.`

## Current Limitations

- Current MVP remains mock-first and falls back to mock data when `TWELVE_DATA_API_KEY` is empty or the external API fails.
- Crypto, forex, ETF, and domestic stocks are not yet connected to the market history/timing API.
- Popular symbols are not yet provided by a dedicated ranking API.
- The one-line diagnosis is rule-based; no AI-generated diagnosis is used yet.
- Local `next build` may need network access because the current layout uses `next/font/google`.
