import { NextResponse } from "next/server";

import { parseMarketQuery } from "@/shared/lib/market-query";
import { getMarketTiming } from "@/shared/server/market-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryResult = parseMarketQuery(searchParams);

  if (!queryResult.success) {
    return NextResponse.json(
      {
        error: {
          message: queryResult.error.message,
          code: queryResult.error.code,
          field: queryResult.error.field,
          supported: queryResult.error.supported,
        },
      },
      { status: 400 },
    );
  }

  try {
    const { symbol, range } = queryResult.data;
    const response = await getMarketTiming(symbol, range);
    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      {
        error: {
          message: "Failed to load market timing data.",
          code: "MARKET_TIMING_LOAD_FAILED",
        },
      },
      { status: 500 },
    );
  }
}
