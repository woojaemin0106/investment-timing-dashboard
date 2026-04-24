import { z } from "zod";

import { SUPPORTED_RANGES, SUPPORTED_SYMBOLS } from "@/shared/mocks/market-data";
import type { MarketRange, MarketSymbol } from "@/shared/types/market";

export const DEFAULT_SYMBOL: MarketSymbol = "AAPL";
export const DEFAULT_RANGE: MarketRange = "1y";

const baseQuerySchema = z.object({
  symbol: z.string().optional(),
  range: z.string().optional(),
});

const symbolSet = new Set<string>(SUPPORTED_SYMBOLS);
const rangeSet = new Set<string>(SUPPORTED_RANGES);

interface MarketQueryError {
  field: "symbol" | "range" | "query";
  message: string;
  supported?: readonly string[];
}

type QueryParseResult =
  | {
      success: true;
      data: {
        symbol: MarketSymbol;
        range: MarketRange;
      };
    }
  | {
      success: false;
      error: MarketQueryError;
    };

export function parseMarketQuery(searchParams: URLSearchParams): QueryParseResult {
  const parsed = baseQuerySchema.safeParse({
    symbol: searchParams.get("symbol") ?? undefined,
    range: searchParams.get("range") ?? undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: {
        field: "query",
        message: "Invalid query format.",
      },
    };
  }

  const symbolCandidate = (parsed.data.symbol ?? DEFAULT_SYMBOL).trim().toUpperCase();
  const rangeCandidate = (parsed.data.range ?? DEFAULT_RANGE).trim().toLowerCase();

  if (!symbolSet.has(symbolCandidate)) {
    return {
      success: false,
      error: {
        field: "symbol",
        message: `Unsupported symbol: ${symbolCandidate}`,
        supported: SUPPORTED_SYMBOLS,
      },
    };
  }

  if (!rangeSet.has(rangeCandidate)) {
    return {
      success: false,
      error: {
        field: "range",
        message: `Unsupported range: ${rangeCandidate}`,
        supported: SUPPORTED_RANGES,
      },
    };
  }

  return {
    success: true,
    data: {
      symbol: symbolCandidate as MarketSymbol,
      range: rangeCandidate as MarketRange,
    },
  };
}
