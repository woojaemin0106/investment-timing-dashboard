import { expect, test } from "@playwright/test";

import type { MarketHistoryResponse, MarketTimingResponse } from "@/shared/types/market";

interface MarketApiErrorResponse {
  error: {
    message: string;
    code: string;
    field?: string;
    supported?: string[];
  };
}

test("returns market history with analyzed price fields", async ({ request }) => {
  const response = await request.get("/api/market/history?symbol=AAPL&range=1y");
  expect(response.ok()).toBe(true);

  const payload = (await response.json()) as MarketHistoryResponse;
  expect(payload.symbol).toBe("AAPL");
  expect(payload.range).toBe("1y");
  expect(["live", "mock"]).toContain(payload.source);
  expect(payload.prices.length).toBeGreaterThanOrEqual(120);
  expect(payload.prices.at(-1)?.ma20).toEqual(expect.any(Number));
  expect(payload.prices.at(-1)?.ma60).toEqual(expect.any(Number));
});

test("returns timing summary and anomalies contract", async ({ request }) => {
  const response = await request.get("/api/market/timing?symbol=TSLA&range=6m");
  expect(response.ok()).toBe(true);

  const payload = (await response.json()) as MarketTimingResponse;
  expect(["live", "mock"]).toContain(payload.source);
  expect(payload.summary.symbol).toBe("TSLA");
  expect(["cold", "neutral", "hot"]).toContain(payload.summary.signal);
  expect(payload.summary.summary.length).toBeGreaterThan(0);
  expect(Array.isArray(payload.prices)).toBe(true);
  expect(Array.isArray(payload.anomalies)).toBe(true);
});

test("rejects unsupported market symbols with a stable error shape", async ({ request }) => {
  const response = await request.get("/api/market/history?symbol=INVALID&range=1y");
  expect(response.status()).toBe(400);

  const payload = (await response.json()) as MarketApiErrorResponse;
  expect(payload.error.code).toBe("UNSUPPORTED_SYMBOL");
  expect(payload.error.field).toBe("symbol");
  expect(payload.error.supported).toContain("AAPL");
});
