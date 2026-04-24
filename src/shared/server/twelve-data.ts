import type { MarketRange, MarketSymbol, PricePoint } from "@/shared/types/market";

const TWELVE_DATA_BASE_URL = "https://api.twelvedata.com/time_series";

const RANGE_TO_OUTPUT_SIZE: Record<MarketRange, number> = {
  "1m": 22,
  "3m": 66,
  "6m": 132,
  "1y": 252,
};

interface TwelveDataValue {
  datetime?: string;
  open?: string;
  high?: string;
  low?: string;
  close?: string;
  volume?: string;
}

interface TwelveDataTimeSeriesResponse {
  status?: string;
  code?: number;
  message?: string;
  values?: TwelveDataValue[];
}

function toNumber(value: string | undefined): number | null {
  if (value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeDate(datetime: string): string {
  const [date] = datetime.split(" ");
  return date;
}

function isValidPricePoint(pricePoint: PricePoint): boolean {
  return (
    Number.isFinite(pricePoint.open) &&
    Number.isFinite(pricePoint.high) &&
    Number.isFinite(pricePoint.low) &&
    Number.isFinite(pricePoint.close) &&
    Number.isFinite(pricePoint.volume)
  );
}

export async function fetchTwelveDataHistory({
  symbol,
  range,
  apiKey,
}: {
  symbol: MarketSymbol;
  range: MarketRange;
  apiKey: string;
}): Promise<PricePoint[] | null> {
  const outputsize = RANGE_TO_OUTPUT_SIZE[range];
  const url = `${TWELVE_DATA_BASE_URL}?symbol=${symbol}&interval=1day&outputsize=${outputsize}&apikey=${apiKey}`;

  try {
    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as TwelveDataTimeSeriesResponse;
    if (payload.status === "error" || !Array.isArray(payload.values)) {
      return null;
    }

    const parsedPrices = payload.values
      .map((item) => {
        if (item.datetime === undefined) {
          return null;
        }

        const open = toNumber(item.open);
        const high = toNumber(item.high);
        const low = toNumber(item.low);
        const close = toNumber(item.close);
        const volume = toNumber(item.volume);

        if (open === null || high === null || low === null || close === null || volume === null) {
          return null;
        }

        const normalized: PricePoint = {
          date: normalizeDate(item.datetime),
          open,
          high,
          low,
          close,
          volume,
        };

        return isValidPricePoint(normalized) ? normalized : null;
      })
      .filter((item): item is PricePoint => item !== null)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (parsedPrices.length === 0) {
      return null;
    }

    return parsedPrices;
  } catch {
    return null;
  }
}
