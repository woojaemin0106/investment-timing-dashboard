export type SignalType = "all" | "success" | "warning" | "danger";
export type MarketType = "국내" | "해외" | "BTC" | "ETF";

export interface Stock {
  code: string;
  name: string;
  price: number;
  change: number;
  volume: string;
  rsi: number;
  signal: Exclude<SignalType, "all">;
  category: string;
  market: MarketType;
  high52w: number;
  low52w: number;
}

export interface PricePoint {
  time: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface InvestPulsePayload {
  stocks: Stock[];
  chartDataByCode: Record<string, PricePoint[]>;
  defaultChartData: PricePoint[];
}
