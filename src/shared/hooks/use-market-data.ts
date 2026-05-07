"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import {
  fetchMarketHistory,
  fetchMarketTiming,
  type MarketQueryParams,
} from "@/shared/api/market-client";
import { DEFAULT_RANGE, DEFAULT_SYMBOL } from "@/shared/lib/market-query";
import type { MarketHistoryResponse, MarketTimingResponse } from "@/shared/types/market";

function normalizeParams(params: MarketQueryParams): Required<MarketQueryParams> {
  return {
    symbol: params.symbol ?? DEFAULT_SYMBOL,
    range: params.range ?? DEFAULT_RANGE,
  };
}

export function useMarketHistoryQuery(
  params: MarketQueryParams = {},
  options?: Omit<UseQueryOptions<MarketHistoryResponse, Error>, "queryKey" | "queryFn">,
) {
  const normalized = normalizeParams(params);

  return useQuery({
    queryKey: ["market", "history", normalized.symbol, normalized.range],
    queryFn: () => fetchMarketHistory(normalized),
    ...options,
  });
}

export function useMarketTimingQuery(
  params: MarketQueryParams = {},
  options?: Omit<UseQueryOptions<MarketTimingResponse, Error>, "queryKey" | "queryFn">,
) {
  const normalized = normalizeParams(params);

  return useQuery({
    queryKey: ["market", "timing", normalized.symbol, normalized.range],
    queryFn: () => fetchMarketTiming(normalized),
    ...options,
  });
}
