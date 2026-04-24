# Investment Timing Dashboard Progress

## 1. Overall Progress

- 90%

## 2. Completed Tasks

- [x] Define shared market data types
- [x] Add mock market time-series data for AAPL/TSLA/NVDA/SPY
- [x] Implement analysis utilities (MA, percentile, RSI, volatility, signal, anomalies)
- [x] Implement internal API routes
- [x] Implement API client and React Query hooks
- [x] Document current implementation status

## 3. In-Progress Tasks

- [ ] Full repository verification (`npm run lint`, `npm run build`, `npm run test`)

## 4. Remaining Tasks

- [ ] Integrate API hooks into Overview screen widgets
- [ ] Build Detailed analysis chart UI with range/symbol controls
- [ ] Build anomaly list and interaction panel
- [ ] Add test coverage for analysis utilities and API routes
- [ ] Connect Twelve Data live API mode in production environment

## 5. Next Handover Checklist

- Overview assignee should call:
  - `GET /api/market/timing?symbol=AAPL&range=1y`
  - Use `summary` for top cards and signal badge
  - Use `prices` for overview line/candle chart
- Detailed assignee should use:
  - `prices` from `/api/market/history` or `/api/market/timing`
  - `ma20`, `ma60`, `volume`, and date-based range filters
- Anomaly assignee should use:
  - `anomalies` from `/api/market/timing`
  - `type`, `value`, `description`, and `date` for timeline and highlights

## 6. API Usage Examples

- `/api/market/history?symbol=AAPL&range=1y`
- `/api/market/timing?symbol=AAPL&range=1y`

## 7. Current Limitations

- Current responses run on mock-first behavior and fallback.
- Twelve Data live integration is prepared but not fully validated in production.
- AI one-line diagnosis is currently replaced with rule-based summary text.
