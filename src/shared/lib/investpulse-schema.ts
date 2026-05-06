import { z } from "zod";

import type { InvestPulsePayload } from "@/types";
import { parseFiniteNumber } from "@/shared/lib/number-utils";

const finiteNumberSchema = z.union([z.number(), z.string()]).transform((value, ctx) => {
  const parsed = parseFiniteNumber(value);

  if (parsed === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Expected a finite number.",
    });
    return z.NEVER;
  }

  return parsed;
});

const stockMarketSchema = z.enum(["국내", "해외", "BTC", "ETF"]);
const stockSignalSchema = z.enum(["success", "warning", "danger"]);

const stockSchema = z.object({
  code: z.string().trim().min(1),
  name: z.string().trim().min(1),
  price: finiteNumberSchema,
  change: finiteNumberSchema,
  volume: z.union([z.string(), z.number()]).catch("-").transform((value) => String(value)),
  rsi: finiteNumberSchema,
  signal: stockSignalSchema.catch("warning"),
  category: z.string().trim().min(1).catch("미분류"),
  market: stockMarketSchema,
  high52w: finiteNumberSchema,
  low52w: finiteNumberSchema,
});

const pricePointSchema = z.object({
  time: z.string().trim().min(1),
  price: finiteNumberSchema,
  open: finiteNumberSchema,
  high: finiteNumberSchema,
  low: finiteNumberSchema,
  close: finiteNumberSchema,
  volume: finiteNumberSchema,
});

function parseStockList(value: unknown): InvestPulsePayload["stocks"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const result = stockSchema.safeParse(item);
    return result.success ? [result.data] : [];
  });
}

function parsePricePointList(value: unknown): InvestPulsePayload["defaultChartData"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const result = pricePointSchema.safeParse(item);
    return result.success ? [result.data] : [];
  });
}

function parseChartDataByCode(value: unknown): InvestPulsePayload["chartDataByCode"] {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const entries = Object.entries(value as Record<string, unknown>).map(([code, points]) => [
    code,
    parsePricePointList(points),
  ]);

  return Object.fromEntries(entries);
}

export function parseInvestPulsePayload(value: unknown): InvestPulsePayload | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const payload = value as Record<string, unknown>;

  return {
    stocks: parseStockList(payload.stocks),
    chartDataByCode: parseChartDataByCode(payload.chartDataByCode),
    defaultChartData: parsePricePointList(payload.defaultChartData),
  };
}
