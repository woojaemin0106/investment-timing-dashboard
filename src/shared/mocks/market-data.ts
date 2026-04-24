import dayjs from "dayjs";

import type {
  MarketHistoryResponse,
  MarketRange,
  MarketSymbol,
  PricePoint,
} from "@/shared/types/market";

export const SUPPORTED_SYMBOLS: readonly MarketSymbol[] = [
  "AAPL",
  "TSLA",
  "NVDA",
  "SPY",
];

export const SUPPORTED_RANGES: readonly MarketRange[] = ["1m", "3m", "6m", "1y"];

const RANGE_LENGTH: Record<MarketRange, number> = {
  "1m": 22,
  "3m": 66,
  "6m": 132,
  "1y": 252,
};

const SYMBOL_PROFILE: Record<
  MarketSymbol,
  { basePrice: number; drift: number; volatility: number; baseVolume: number }
> = {
  AAPL: { basePrice: 190, drift: 0.05, volatility: 3.2, baseVolume: 64_000_000 },
  TSLA: { basePrice: 220, drift: 0.09, volatility: 6.8, baseVolume: 92_000_000 },
  NVDA: { basePrice: 980, drift: 0.22, volatility: 18, baseVolume: 48_000_000 },
  SPY: { basePrice: 520, drift: 0.04, volatility: 4.1, baseVolume: 82_000_000 },
};

const SEED_BY_SYMBOL: Record<MarketSymbol, number> = {
  AAPL: 101,
  TSLA: 202,
  NVDA: 303,
  SPY: 404,
};

function roundPrice(value: number): number {
  return Number(value.toFixed(2));
}

function roundVolume(value: number): number {
  return Math.round(value);
}

function getTradingDates(total: number): string[] {
  const result: string[] = [];
  let cursor = dayjs().subtract(1, "day");

  while (result.length < total) {
    const day = cursor.day();
    if (day !== 0 && day !== 6) {
      result.push(cursor.format("YYYY-MM-DD"));
    }

    cursor = cursor.subtract(1, "day");
  }

  return result.reverse();
}

function createYearPrices(symbol: MarketSymbol): PricePoint[] {
  const points = RANGE_LENGTH["1y"];
  const dates = getTradingDates(points);
  const profile = SYMBOL_PROFILE[symbol];
  const seed = SEED_BY_SYMBOL[symbol];
  const prices: PricePoint[] = [];

  for (let i = 0; i < points; i += 1) {
    const prevClose = i === 0 ? profile.basePrice : prices[i - 1].close;
    const trend = profile.drift * i;
    const cycle = Math.sin((i + seed) / 7) * profile.volatility;
    const shock = Math.cos((i + seed) / 17) * profile.volatility * 0.55;
    const close = Math.max(1, profile.basePrice + trend + cycle + shock);
    const openNoise = Math.sin((i + seed) / 5) * 0.0045;
    const open = Math.max(1, prevClose * (1 + openNoise));
    const intradayRange =
      Math.max(close * 0.006, Math.abs(Math.sin((i + seed) / 4)) * profile.volatility * 0.7);
    const high = Math.max(open, close) + intradayRange;
    const low = Math.max(0.01, Math.min(open, close) - intradayRange);
    const volumeNoise = 1 + Math.abs(Math.cos((i + seed) / 6)) * 0.45;
    const volume = profile.baseVolume * volumeNoise;

    prices.push({
      date: dates[i],
      open: roundPrice(open),
      high: roundPrice(high),
      low: roundPrice(low),
      close: roundPrice(close),
      volume: roundVolume(volume),
    });
  }

  return prices;
}

const YEARLY_MOCK_DATA: Record<MarketSymbol, PricePoint[]> = {
  AAPL: createYearPrices("AAPL"),
  TSLA: createYearPrices("TSLA"),
  NVDA: createYearPrices("NVDA"),
  SPY: createYearPrices("SPY"),
};

export function getMockPrices(symbol: MarketSymbol, range: MarketRange): PricePoint[] {
  const total = RANGE_LENGTH[range];
  const allPrices = YEARLY_MOCK_DATA[symbol];

  return allPrices.slice(-total).map((price) => ({ ...price }));
}

export function getMockMarketHistory(
  symbol: MarketSymbol,
  range: MarketRange,
): MarketHistoryResponse {
  return {
    symbol,
    range,
    prices: getMockPrices(symbol, range),
  };
}
