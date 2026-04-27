# Investment Timing Dashboard Progress

## Overall Progress

- 100%

Progress basis:

- Type definitions: 10 / 10
- Mock data: 15 / 15
- Analysis logic: 20 / 20
- API Route: 20 / 20
- API client/hook: 15 / 15
- Documentation: 10 / 10
- lint/build/test: 10 / 10

## Completed

- [x] Defined shared market data contracts for prices, ranges, symbols, summaries, signals, history responses, timing responses, and anomaly points.
- [x] Added deterministic mock market price data for AAPL, TSLA, NVDA, and SPY.
- [x] Added range support for `1m`, `3m`, `6m`, and `1y`.
- [x] Implemented moving averages, percentile, RSI, volatility, change-rate, signal, summary, and anomaly utilities.
- [x] Implemented internal App Router API routes for market history and timing.
- [x] Prepared server-side Twelve Data adapter with `TWELVE_DATA_API_KEY` fallback to mock data.
- [x] Added typed market API client functions and React Query hooks.
- [x] Added Playwright API contract smoke tests.
- [x] Verified `npm run lint`, `npm run build`, and `npm run test`.

## In Progress

- [ ] None for the current data/API foundation scope.

## Remaining Tasks

- [ ] Integrate market API hooks into Overview widgets where the UI owner wants live timing data.
- [ ] Build detailed analysis controls for symbol/range selection.
- [ ] Build anomaly list and interaction panel.
- [ ] Expand analysis/API test coverage if the formulas become product-critical.
- [ ] Validate Twelve Data live mode in a production-like environment.

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

## For Overview Developer

- Use `GET /api/market/timing?symbol=AAPL&range=1y` when a widget needs timing analysis.
- Use `summary.currentPrice`, `summary.changeRate`, `summary.percentile`, `summary.rsi`, `summary.volatility`, `summary.signal`, and `summary.summary` for cards or badges.
- Use `prices` for chart series. Each point includes `date`, OHLC, `volume`, and optional `ma20` / `ma60`.
- Existing Overview UI can stay mock-backed until the UI owner chooses where to connect these values.

## For Detailed Developer

- Use `GET /api/market/history?symbol=TSLA&range=6m` for chart-only data.
- Use `GET /api/market/timing?symbol=TSLA&range=6m` when the page also needs summary/anomaly data.
- `prices` are sorted by ascending date and are safe for Recharts line, area, or composed charts.

## For Anomaly Developer

- Use `anomalies` from `/api/market/timing`.
- Each anomaly includes `date`, `type`, `value`, and `description`.
- Supported anomaly types are `surge`, `drop`, and `volatility`.

## Current Limitations

- Current MVP remains mock-first and falls back to mock data when `TWELVE_DATA_API_KEY` is empty or the external API fails.
- Twelve Data live mode is structurally prepared but not production-validated yet.
- The one-line diagnosis is rule-based; no AI-generated diagnosis is used yet.
- Local `next build` may need network access because the current layout uses `next/font/google`.
