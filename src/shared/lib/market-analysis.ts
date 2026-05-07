import type { AnomalyPoint, MarketSummary, PricePoint } from "@/shared/types/market";

const HIGH_VOLATILITY_THRESHOLD = 2.8;
const SURGE_THRESHOLD = 5;
const DROP_THRESHOLD = -5;
const INTRADAY_VOLATILITY_THRESHOLD = 7.5;

function roundToTwo(value: number): number {
  return Number(value.toFixed(2));
}

export function calculateMovingAverage(
  prices: PricePoint[],
  period: number,
): Array<number | undefined> {
  const result: Array<number | undefined> = Array.from({ length: prices.length }, () => undefined);

  if (period <= 0 || prices.length === 0) {
    return result;
  }

  let rollingSum = 0;

  for (let i = 0; i < prices.length; i += 1) {
    rollingSum += prices[i].close;

    if (i >= period) {
      rollingSum -= prices[i - period].close;
    }

    if (i >= period - 1) {
      result[i] = roundToTwo(rollingSum / period);
    }
  }

  return result;
}

export function applyMovingAverages(prices: PricePoint[]): PricePoint[] {
  const ma20Values = calculateMovingAverage(prices, 20);
  const ma60Values = calculateMovingAverage(prices, 60);

  return prices.map((price, index) => ({
    ...price,
    ma20: ma20Values[index],
    ma60: ma60Values[index],
  }));
}

export function calculatePercentile(prices: PricePoint[], currentPrice: number): number {
  if (prices.length === 0) {
    return 0;
  }

  const belowOrEqual = prices.filter((price) => price.close <= currentPrice).length;
  return roundToTwo((belowOrEqual / prices.length) * 100);
}

export function calculateVolatility(prices: PricePoint[]): number {
  if (prices.length < 2) {
    return 0;
  }

  const returns: number[] = [];

  for (let i = 1; i < prices.length; i += 1) {
    const prevClose = prices[i - 1].close;
    if (prevClose <= 0) {
      continue;
    }

    const dailyReturn = ((prices[i].close - prevClose) / prevClose) * 100;
    returns.push(dailyReturn);
  }

  if (returns.length === 0) {
    return 0;
  }

  const mean = returns.reduce((acc, value) => acc + value, 0) / returns.length;
  const variance =
    returns.reduce((acc, value) => acc + (value - mean) ** 2, 0) / returns.length;

  return roundToTwo(Math.sqrt(variance));
}

export function calculateChangeRate(currentPrice: number, previousClose?: number): number {
  if (previousClose === undefined || previousClose <= 0) {
    return 0;
  }

  return roundToTwo(((currentPrice - previousClose) / previousClose) * 100);
}

export function calculateRsi(prices: PricePoint[], period = 14): number {
  if (period <= 0 || prices.length < period + 1) {
    return 50;
  }

  let totalGain = 0;
  let totalLoss = 0;

  for (let i = 1; i <= period; i += 1) {
    const change = prices[i].close - prices[i - 1].close;
    if (change >= 0) {
      totalGain += change;
    } else {
      totalLoss += Math.abs(change);
    }
  }

  let averageGain = totalGain / period;
  let averageLoss = totalLoss / period;

  for (let i = period + 1; i < prices.length; i += 1) {
    const change = prices[i].close - prices[i - 1].close;
    const gain = Math.max(change, 0);
    const loss = Math.max(-change, 0);

    averageGain = (averageGain * (period - 1) + gain) / period;
    averageLoss = (averageLoss * (period - 1) + loss) / period;
  }

  if (averageLoss === 0) {
    return 100;
  }

  const relativeStrength = averageGain / averageLoss;
  return roundToTwo(100 - 100 / (1 + relativeStrength));
}

export function detectAnomalies(prices: PricePoint[]): AnomalyPoint[] {
  if (prices.length < 2) {
    return [];
  }

  const anomalies: AnomalyPoint[] = [];

  for (let i = 1; i < prices.length; i += 1) {
    const current = prices[i];
    const previous = prices[i - 1];

    if (previous.close > 0) {
      const changeRate = ((current.close - previous.close) / previous.close) * 100;

      if (changeRate >= SURGE_THRESHOLD) {
        anomalies.push({
          date: current.date,
          type: "surge",
          value: roundToTwo(changeRate),
          description: `Close surged ${roundToTwo(changeRate)}% vs previous day`,
        });
      } else if (changeRate <= DROP_THRESHOLD) {
        anomalies.push({
          date: current.date,
          type: "drop",
          value: roundToTwo(Math.abs(changeRate)),
          description: `Close dropped ${roundToTwo(Math.abs(changeRate))}% vs previous day`,
        });
      }
    }

    const basePrice = current.open > 0 ? current.open : current.close;
    if (basePrice > 0) {
      const intradayVolatility = ((current.high - current.low) / basePrice) * 100;
      if (intradayVolatility >= INTRADAY_VOLATILITY_THRESHOLD) {
        anomalies.push({
          date: current.date,
          type: "volatility",
          value: roundToTwo(intradayVolatility),
          description: `Intraday range expanded to ${roundToTwo(intradayVolatility)}%`,
        });
      }
    }
  }

  return anomalies.slice(-20);
}

type SignalInput = Pick<MarketSummary, "rsi" | "percentile" | "volatility">;

export function getInvestmentSignal({ rsi, percentile }: SignalInput): MarketSummary["signal"] {
  if (percentile >= 75 || rsi >= 70) {
    return "hot";
  }

  if (percentile <= 30 || rsi <= 30) {
    return "cold";
  }

  return "neutral";
}

export function createSummaryText(summary: MarketSummary): string {
  const signalSummary: Record<MarketSummary["signal"], string> = {
    hot: "Momentum looks overheated, so avoid aggressive chasing entries.",
    neutral: "Market is in a neutral band and supports gradual scaling decisions.",
    cold: "Valuation appears relatively cold, making staged entry review reasonable.",
  };

  const volatilityWarning =
    summary.volatility >= HIGH_VOLATILITY_THRESHOLD
      ? " Volatility is elevated, so strict risk controls are recommended."
      : "";

  return `${signalSummary[summary.signal]}${volatilityWarning}`;
}
