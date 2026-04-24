import { NextResponse } from "next/server";

import { parseMarketQuery } from "@/shared/lib/market-query";
import { getMarketHistory } from "@/shared/server/market-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryResult = parseMarketQuery(searchParams);

  if (!queryResult.success) {
    return NextResponse.json(
      {
        error: queryResult.error.message,
        field: queryResult.error.field,
        supported: queryResult.error.supported,
      },
      { status: 400 },
    );
  }

  try {
    const { symbol, range } = queryResult.data;
    const response = await getMarketHistory(symbol, range);
    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      {
        error: "Failed to load market history.",
      },
      { status: 500 },
    );
  }
}
