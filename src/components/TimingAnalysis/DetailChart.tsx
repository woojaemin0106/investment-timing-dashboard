"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { Stock } from "@/types";
import {
  generatePriceHistory,
  type ChartRange,
  type StockChartPoint,
} from "@/shared/lib/chart-series";
import { useMarketTimingQuery } from "@/shared/hooks/use-market-data";
import { classifyStockSignal, getSignalTone } from "@/shared/lib/market-display";
import type {
  AnomalyPoint,
  MarketDataSource,
  MarketSymbol,
  PricePoint as MarketPricePoint,
} from "@/shared/types/market";
import styles from "./TimingAnalysis.module.scss";

const CHART_GRID_COLOR = "#1e3048";
const CHART_AXIS_TICK = { fill: "#4d6278", fontSize: 11 };
const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: "#1a2744",
    border: "1px solid #2a3a5a",
    borderRadius: 8,
    color: "#e4eaf2",
    fontSize: 12,
  },
};

type IndicatorTab = "RSI" | "MACD" | "볼린저" | "스토캐스틱";
const indicatorTabs: IndicatorTab[] = ["RSI", "MACD", "볼린저", "스토캐스틱"];
const MARKET_API_SYMBOLS = ["AAPL", "TSLA", "NVDA", "SPY"] as const satisfies readonly MarketSymbol[];

interface Props {
  stock: Stock;
}

function getMarketSymbol(code: string): MarketSymbol | null {
  const normalized = code.trim().toUpperCase();
  return MARKET_API_SYMBOLS.includes(normalized as MarketSymbol)
    ? (normalized as MarketSymbol)
    : null;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, current) => sum + current, 0) / values.length;
}

function round(value: number): number {
  return Number(value.toFixed(2));
}

function toChartPoint(prices: MarketPricePoint[]): StockChartPoint[] {
  return prices.map((point, index) => {
    const ma5 = average(prices.slice(Math.max(0, index - 4), index + 1).map((p) => p.close));
    const ma20 =
      point.ma20 ??
      average(prices.slice(Math.max(0, index - 19), index + 1).map((p) => p.close));

    return {
      date: point.date.slice(5),
      price: round(point.close),
      open: round(point.open),
      high: round(point.high),
      low: round(point.low),
      close: round(point.close),
      ma5: round(ma5),
      ma20: round(ma20),
    };
  });
}

function getSourceLabel(source: MarketDataSource | undefined, isFetching: boolean): string {
  if (isFetching) return "API 확인 중";
  if (source === "live") return "Live API";
  if (source === "mock") return "Mock fallback";
  return "기존 데이터";
}

function getAnomalyLabel(type: AnomalyPoint["type"]): string {
  switch (type) {
    case "surge":
      return "급등";
    case "drop":
      return "급락";
    case "volatility":
      return "변동성";
  }
}

function getAnomalyTone(type: AnomalyPoint["type"]): string {
  switch (type) {
    case "surge":
      return "#00d68f";
    case "drop":
      return "#ff4d6a";
    case "volatility":
      return "#F97316";
  }
}

function formatAnomalyValue(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

// Generate RSI series data from price history
function generateRsiSeries(priceHistory: { date: string; close: number }[]) {
  const rsiData: { date: string; rsi: number; overbought: number; oversold: number }[] = [];
  const period = 14;
  for (let i = 0; i < priceHistory.length; i++) {
    if (i < period) {
      rsiData.push({ date: priceHistory[i].date, rsi: 50, overbought: 70, oversold: 30 });
      continue;
    }
    let gains = 0;
    let losses = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const diff = priceHistory[j].close - priceHistory[j - 1].close;
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);
    rsiData.push({ date: priceHistory[i].date, rsi: Math.round(rsi * 10) / 10, overbought: 70, oversold: 30 });
  }
  return rsiData;
}

// Generate MACD series data
function generateMacdSeries(priceHistory: { date: string; close: number }[]) {
  const closes = priceHistory.map((p) => p.close);
  const ema = (data: number[], period: number) => {
    const result: number[] = [];
    const multiplier = 2 / (period + 1);
    result[0] = data[0];
    for (let i = 1; i < data.length; i++) {
      result[i] = (data[i] - result[i - 1]) * multiplier + result[i - 1];
    }
    return result;
  };
  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signalLine = ema(macdLine, 9);
  return priceHistory.map((p, i) => ({
    date: p.date,
    macd: Math.round(macdLine[i] * 100) / 100,
    signal: Math.round(signalLine[i] * 100) / 100,
    histogram: Math.round((macdLine[i] - signalLine[i]) * 100) / 100,
  }));
}

// Generate Bollinger Bands data
function generateBollingerSeries(priceHistory: { date: string; close: number }[]) {
  const period = 20;
  return priceHistory.map((p, i) => {
    if (i < period - 1) {
      return { date: p.date, price: p.close, upper: p.close * 1.02, middle: p.close, lower: p.close * 0.98 };
    }
    const slice = priceHistory.slice(i - period + 1, i + 1).map((s) => s.close);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const stdDev = Math.sqrt(slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period);
    return {
      date: p.date,
      price: Math.round(p.close),
      upper: Math.round(mean + 2 * stdDev),
      middle: Math.round(mean),
      lower: Math.round(mean - 2 * stdDev),
    };
  });
}

// Generate Stochastic data
function generateStochasticSeries(priceHistory: { date: string; close: number; high: number; low: number }[]) {
  const period = 14;
  return priceHistory.map((p, i) => {
    if (i < period - 1) {
      return { date: p.date, k: 50, d: 50, overbought: 80, oversold: 20 };
    }
    const slice = priceHistory.slice(i - period + 1, i + 1);
    const lowestLow = Math.min(...slice.map((s) => s.low));
    const highestHigh = Math.max(...slice.map((s) => s.high));
    const k = highestHigh === lowestLow ? 50 : ((p.close - lowestLow) / (highestHigh - lowestLow)) * 100;
    return { date: p.date, k: Math.round(k * 10) / 10, d: 0, overbought: 80, oversold: 20 };
  }).map((item, i, arr) => {
    // Calculate %D as 3-period SMA of %K
    if (i < 2) return { ...item, d: item.k };
    const d = (arr[i].k + arr[i - 1].k + arr[i - 2].k) / 3;
    return { ...item, d: Math.round(d * 10) / 10 };
  });
}

export default function DetailChart({ stock }: Props) {
  const [activeTab, setActiveTab] = useState<IndicatorTab>("RSI");
  const signal = classifyStockSignal(stock);
  const tone = getSignalTone(signal);
  const marketSymbol = useMemo(() => getMarketSymbol(stock.code), [stock.code]);

  const marketTimingQuery = useMarketTimingQuery(
    { symbol: marketSymbol ?? "AAPL", range: "1y" },
    {
      enabled: marketSymbol !== null,
      retry: 1,
      staleTime: 60_000,
    }
  );

  const fallbackChartData = useMemo(
    () =>
      generatePriceHistory(
        stock.price,
        "일" as ChartRange,
        stock.code,
        Math.sign(stock.change) || 1
      ),
    [stock.code, stock.price, stock.change]
  );

  const marketChartData = useMemo(() => {
    const prices = marketTimingQuery.data?.prices ?? [];
    return prices.length > 0 ? toChartPoint(prices) : null;
  }, [marketTimingQuery.data?.prices]);

  const chartData = marketChartData ?? fallbackChartData;
  const marketSummary = marketTimingQuery.data?.summary;
  const displayRsi = marketSummary?.rsi ?? stock.rsi;
  const displayChange = marketSummary?.changeRate ?? stock.change;
  const displayPrice = marketSummary?.currentPrice ?? stock.price;
  const sourceLabel = !marketSymbol
    ? "기존 데이터"
    : marketTimingQuery.isError
      ? "API fallback"
      : getSourceLabel(marketTimingQuery.data?.source, marketTimingQuery.isFetching);
  const sourceTone = marketTimingQuery.isError
    ? "fallback"
    : marketTimingQuery.data?.source ?? "fallback";
  const anomalies = marketTimingQuery.data?.anomalies ?? [];

  const rsiData = useMemo(() => generateRsiSeries(chartData), [chartData]);
  const macdData = useMemo(() => generateMacdSeries(chartData), [chartData]);
  const bollingerData = useMemo(() => generateBollingerSeries(chartData), [chartData]);
  const stochasticData = useMemo(() => generateStochasticSeries(chartData), [chartData]);

  // Generate stats based on active tab
  const stats = useMemo(() => {
    const rsiLabel =
      signal === "success" ? "과매도" : signal === "danger" ? "과매수" : "중립";
    const maLabel = displayRsi >= 50 ? "MA20↑" : "MA20↓";
    const trendLabel = displayChange >= 0 ? "상승" : "하단";

    switch (activeTab) {
      case "RSI":
        return [
          { label: "RSI (14)", value: displayRsi.toFixed(1), color: tone.bar, sub: `${rsiLabel} 신호` },
          { label: "골든크로스", value: displayChange >= 0 ? "+0.42" : "-0.18", color: "", sub: "클로스율" },
          { label: "추세 방향", value: trendLabel, color: displayChange >= 0 ? "#00d68f" : "#ff4d6a", sub: displayChange >= 0 ? "상승 추세 유지" : "하락 추세 주의" },
          { label: "이동평균", value: maLabel, color: "", sub: displayRsi >= 50 ? "20일선 상향 돌파" : "20일선 하향 돌파" },
        ];
      case "MACD":
        return [
          { label: "MACD", value: macdData.at(-1)?.macd.toFixed(1) ?? "0", color: (macdData.at(-1)?.macd ?? 0) >= 0 ? "#00d68f" : "#ff4d6a", sub: "MACD 라인" },
          { label: "시그널", value: macdData.at(-1)?.signal.toFixed(1) ?? "0", color: "#f59e0b", sub: "시그널 라인" },
          { label: "히스토그램", value: macdData.at(-1)?.histogram.toFixed(2) ?? "0", color: (macdData.at(-1)?.histogram ?? 0) >= 0 ? "#00d68f" : "#ff4d6a", sub: (macdData.at(-1)?.histogram ?? 0) >= 0 ? "매수 우위" : "매도 우위" },
          { label: "추세", value: (macdData.at(-1)?.macd ?? 0) > (macdData.at(-1)?.signal ?? 0) ? "상승" : "하락", color: (macdData.at(-1)?.macd ?? 0) > (macdData.at(-1)?.signal ?? 0) ? "#00d68f" : "#ff4d6a", sub: "MACD 크로스" },
        ];
      case "볼린저":
        return [
          { label: "상단 밴드", value: bollingerData.at(-1)?.upper.toLocaleString() ?? "", color: "#ff4d6a", sub: "저항선" },
          { label: "중간 밴드", value: bollingerData.at(-1)?.middle.toLocaleString() ?? "", color: "#3b82f6", sub: "20일 이평선" },
          { label: "하단 밴드", value: bollingerData.at(-1)?.lower.toLocaleString() ?? "", color: "#00d68f", sub: "지지선" },
          { label: "밴드 위치", value: displayPrice > (bollingerData.at(-1)?.middle ?? 0) ? "상단" : "하단", color: displayPrice > (bollingerData.at(-1)?.middle ?? 0) ? "#ff4d6a" : "#00d68f", sub: displayPrice > (bollingerData.at(-1)?.middle ?? 0) ? "과매수 주의" : "매수 기회" },
        ];
      case "스토캐스틱":
        return [
          { label: "%K", value: stochasticData.at(-1)?.k.toFixed(1) ?? "50", color: "#3b82f6", sub: "패스트 라인" },
          { label: "%D", value: stochasticData.at(-1)?.d.toFixed(1) ?? "50", color: "#f59e0b", sub: "슬로우 라인" },
          { label: "신호", value: (stochasticData.at(-1)?.k ?? 50) > 80 ? "과매수" : (stochasticData.at(-1)?.k ?? 50) < 20 ? "과매도" : "중립", color: (stochasticData.at(-1)?.k ?? 50) > 80 ? "#ff4d6a" : (stochasticData.at(-1)?.k ?? 50) < 20 ? "#00d68f" : "#F97316", sub: "스토캐스틱 신호" },
          { label: "크로스", value: (stochasticData.at(-1)?.k ?? 0) > (stochasticData.at(-1)?.d ?? 0) ? "골든" : "데드", color: (stochasticData.at(-1)?.k ?? 0) > (stochasticData.at(-1)?.d ?? 0) ? "#00d68f" : "#ff4d6a", sub: "%K/%D 크로스" },
        ];
    }
  }, [activeTab, displayChange, displayPrice, displayRsi, signal, tone, macdData, bollingerData, stochasticData]);

  const renderChart = () => {
    switch (activeTab) {
      case "RSI":
        return (
          <LineChart data={rsiData}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} vertical={false} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={CHART_AXIS_TICK} />
            <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={CHART_AXIS_TICK} />
            <Tooltip {...CHART_TOOLTIP_STYLE} />
            <ReferenceLine y={70} stroke="#ff4d6a" strokeDasharray="3 3" strokeOpacity={0.6} />
            <ReferenceLine y={30} stroke="#00d68f" strokeDasharray="3 3" strokeOpacity={0.6} />
            <Line dataKey="rsi" stroke={tone.bar} strokeWidth={2} dot={false} name="RSI" />
          </LineChart>
        );
      case "MACD":
        return (
          <ComposedChart data={macdData}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} vertical={false} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={CHART_AXIS_TICK} />
            <YAxis axisLine={false} tickLine={false} tick={CHART_AXIS_TICK} />
            <Tooltip {...CHART_TOOLTIP_STYLE} />
            <ReferenceLine y={0} stroke="#4d6278" strokeDasharray="3 3" />
            <Bar dataKey="histogram" name="히스토그램" fill="#10b981" />
            <Line dataKey="macd" stroke="#3b82f6" strokeWidth={2} dot={false} name="MACD" />
            <Line dataKey="signal" stroke="#f59e0b" strokeWidth={2} dot={false} name="시그널" />
          </ComposedChart>
        );
      case "볼린저":
        return (
          <AreaChart data={bollingerData}>
            <defs>
              <linearGradient id="bollingerGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} vertical={false} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={CHART_AXIS_TICK} />
            <YAxis axisLine={false} tickLine={false} tick={CHART_AXIS_TICK} domain={["dataMin - 100", "dataMax + 100"]} />
            <Tooltip {...CHART_TOOLTIP_STYLE} />
            <Area dataKey="upper" stroke="#ff4d6a" fill="transparent" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="상단 밴드" />
            <Area dataKey="middle" stroke="#3b82f6" fill="url(#bollingerGrad)" strokeWidth={1.5} dot={false} name="중간 밴드" />
            <Area dataKey="lower" stroke="#00d68f" fill="transparent" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="하단 밴드" />
            <Line dataKey="price" stroke="#e4eaf2" strokeWidth={2} dot={false} name="현재가" />
          </AreaChart>
        );
      case "스토캐스틱":
        return (
          <LineChart data={stochasticData}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} vertical={false} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={CHART_AXIS_TICK} />
            <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={CHART_AXIS_TICK} />
            <Tooltip {...CHART_TOOLTIP_STYLE} />
            <ReferenceLine y={80} stroke="#ff4d6a" strokeDasharray="3 3" strokeOpacity={0.6} />
            <ReferenceLine y={20} stroke="#00d68f" strokeDasharray="3 3" strokeOpacity={0.6} />
            <Line dataKey="k" stroke="#3b82f6" strokeWidth={2} dot={false} name="%K" />
            <Line dataKey="d" stroke="#f59e0b" strokeWidth={2} dot={false} name="%D" />
          </LineChart>
        );
    }
  };

  return (
    <div className={styles.detailCard}>
      <div className={styles.detailHeader}>
        <div className={styles.detailTitle}>
          <BarChart3 size={18} />
          <h3>
            {stock.name} — 상세 분석
          </h3>
          <span>{stock.code}</span>
          <span>·</span>
          <span>{activeTab}</span>
          <span
            className={`${styles.dataSourceBadge} ${
              sourceTone === "live"
                ? styles.sourceLive
                : sourceTone === "mock"
                  ? styles.sourceMock
                  : styles.sourceFallback
            }`}
          >
            {sourceLabel}
          </span>
        </div>
        <div className={styles.detailTabs}>
          {indicatorTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`${styles.detailTab} ${activeTab === tab ? styles.detailTabActive : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      <div className={styles.detailStats}>
        {stats.map((s) => (
          <div key={s.label} className={styles.detailStat}>
            <span className={styles.detailStatLabel}>{s.label}</span>
            <span className={styles.detailStatValue} style={s.color ? { color: s.color } : undefined}>
              {s.value}
            </span>
            <span className={styles.detailStatSub}>{s.sub}</span>
          </div>
        ))}
      </div>

      {marketSymbol && (
        <div className={styles.anomalySection}>
          <div className={styles.anomalyHeader}>
            <span>이상 신호</span>
            <span>{marketTimingQuery.isLoading ? "확인 중" : `${anomalies.length}건`}</span>
          </div>

          {marketTimingQuery.isLoading ? (
            <p className={styles.anomalyEmpty}>이상 신호를 확인하는 중입니다.</p>
          ) : anomalies.length === 0 ? (
            <p className={styles.anomalyEmpty}>최근 감지된 이상 신호가 없습니다.</p>
          ) : (
            <div className={styles.anomalyList}>
              {anomalies.slice(0, 4).map((anomaly) => (
                <div key={`${anomaly.date}-${anomaly.type}`} className={styles.anomalyItem}>
                  <i
                    className={styles.anomalyDot}
                    style={{ background: getAnomalyTone(anomaly.type) }}
                  />
                  <div className={styles.anomalyContent}>
                    <div className={styles.anomalyTitle}>
                      <span>{getAnomalyLabel(anomaly.type)}</span>
                      <strong>{formatAnomalyValue(anomaly.value)}</strong>
                    </div>
                    <p>{anomaly.description}</p>
                  </div>
                  <span className={styles.anomalyDate}>{anomaly.date.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
