import { DEFAULT_RANGE, DEFAULT_SYMBOL } from "@/shared/lib/market-query";
import type {
  MarketHistoryResponse,
  MarketRange,
  MarketSymbol,
  MarketTimingResponse,
} from "@/shared/types/market";

export interface MarketQueryParams {
  symbol?: MarketSymbol;
  range?: MarketRange;
}

interface ApiErrorPayload {
  error?: string;
}

async function requestMarketApi<T>(path: string, params: MarketQueryParams = {}): Promise<T> {
  const searchParams = new URLSearchParams({
    symbol: params.symbol ?? DEFAULT_SYMBOL,
    range: params.range ?? DEFAULT_RANGE,
  });
  const response = await fetch(`${path}?${searchParams.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as ApiErrorPayload;
    throw new Error(payload.error ?? "Failed to fetch market API.");
  }

  return (await response.json()) as T;
}

export function fetchMarketHistory(
  params: MarketQueryParams = {},
): Promise<MarketHistoryResponse> {
  return requestMarketApi<MarketHistoryResponse>("/api/market/history", params);
}

export function fetchMarketTiming(params: MarketQueryParams = {}): Promise<MarketTimingResponse> {
  return requestMarketApi<MarketTimingResponse>("/api/market/timing", params);
}
