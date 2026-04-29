export type MarketSymbol = "AAPL" | "TSLA" | "NVDA" | "SPY";

export type MarketRange = "1m" | "3m" | "6m" | "1y";

export type InvestmentSignal = "cold" | "neutral" | "hot";

export type MarketDataSource = "live" | "mock";

export interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma20?: number;
  ma60?: number;
}

export interface MarketSummary {
  symbol: MarketSymbol;
  currentPrice: number;
  previousClose?: number;
  changeRate: number;
  percentile: number;
  rsi: number;
  volatility: number;
  signal: InvestmentSignal;
  summary: string;
}

export interface AnomalyPoint {
  date: string;
  type: "surge" | "drop" | "volatility";
  value: number;
  description: string;
}

export interface MarketHistoryResponse {
  symbol: MarketSymbol;
  range: MarketRange;
  source: MarketDataSource;
  prices: PricePoint[];
}

export interface MarketTimingResponse {
  source: MarketDataSource;
  summary: MarketSummary;
  prices: PricePoint[];
  anomalies: AnomalyPoint[];
}
