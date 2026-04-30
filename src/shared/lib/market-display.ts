import { signalLabels } from "@/lib/investpulse-config";
import type { MarketType, SignalType, Stock } from "@/types";

export type ClassifiedSignal = Exclude<SignalType, "all">;
export type MarketSelection = "전체" | MarketType;

export const RSI_OVERSOLD_THRESHOLD = 30;
export const RSI_OVERBOUGHT_THRESHOLD = 70;

const marketTypes: readonly MarketType[] = ["국내", "해외", "BTC", "ETF"];
const classifiedSignals: readonly ClassifiedSignal[] = ["success", "warning", "danger"];

export const marketLabels: Record<MarketType, string> = {
  국내: "국내 주식",
  해외: "해외 주식",
  BTC: "BTC",
  ETF: "ETF",
};

export const signalToneColors: Record<ClassifiedSignal, { dot: string; bar: string }> = {
  success: { dot: "#10b981", bar: "#00d68f" },
  warning: { dot: "#f5a623", bar: "#F97316" },
  danger: { dot: "#ff4d6a", bar: "#ff4d6a" },
};

export const signalDescriptions: Record<ClassifiedSignal, string> = {
  success: "RSI가 낮은 수준으로 저점 구간에 진입했습니다. 장기 투자에 적합한 시기입니다.",
  warning: "현재 중립 구간입니다. 시장 상황을 지켜보며 신중한 접근이 필요합니다.",
  danger: "RSI가 높은 수준으로 과매수 구간입니다. 단기 조정 가능성을 염두에 두세요.",
};

function normalizeNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function isMarketType(value: unknown): value is MarketType {
  return typeof value === "string" && marketTypes.includes(value as MarketType);
}

export function isSignalType(value: unknown): value is SignalType {
  return value === "all" || classifiedSignals.includes(value as ClassifiedSignal);
}

export function classifyRsi(rsi?: number | string | null): ClassifiedSignal {
  const normalized = normalizeNumber(rsi);

  if (normalized === null) {
    return "warning";
  }

  if (normalized <= RSI_OVERSOLD_THRESHOLD) {
    return "success";
  }

  if (normalized >= RSI_OVERBOUGHT_THRESHOLD) {
    return "danger";
  }

  return "warning";
}

export function classifyStockSignal(stock: Pick<Stock, "rsi" | "signal"> | { rsi?: number | string | null; signal?: unknown }): ClassifiedSignal {
  if (normalizeNumber(stock.rsi) !== null) {
    return classifyRsi(stock.rsi);
  }

  return isSignalType(stock.signal) && stock.signal !== "all" ? stock.signal : "warning";
}

export function getSignalLabel(signal: ClassifiedSignal): string {
  return signalLabels[signal];
}

export function getSignalTone(signal: ClassifiedSignal) {
  return {
    signal,
    label: getSignalLabel(signal),
    description: signalDescriptions[signal],
    ...signalToneColors[signal],
  };
}

export function getMarketLabel(market: MarketSelection): string {
  return market === "전체" ? "전체 종목 현황" : marketLabels[market];
}

export function getMarketHref(market: MarketType, signal?: ClassifiedSignal | null): string {
  const params = new URLSearchParams();
  params.set("market", market);
  if (signal) {
    params.set("signal", signal);
  }
  return `/?${params.toString()}`;
}

export function getStockMarketHref(stock: Pick<Stock, "market">, signal?: ClassifiedSignal | null): string {
  return getMarketHref(stock.market, signal);
}

export function getMarketPrefix(market: MarketType): "₩" | "$" {
  return market === "국내" ? "₩" : "$";
}
