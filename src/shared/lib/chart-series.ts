export const chartRangeOptions = ["분", "일", "주", "월", "년"] as const;
export type ChartRange = (typeof chartRangeOptions)[number];

export const overviewChartTargets = ["KOSPI", "NASDAQ", "S&P 500", "USD/KRW"] as const;
export type OverviewChartTarget = (typeof overviewChartTargets)[number];

export interface StockChartPoint {
  date: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  ma5: number;
  ma20: number;
}

export interface OverviewChartPoint {
  date: string;
  value: number;
}

type RangeConfig = {
  points: number;
  shift: (date: Date, offset: number) => void;
  formatLabel: (date: Date) => string;
  volatility: number;
  drift: number;
  wave: number;
};

const RANGE_CONFIG: Record<ChartRange, RangeConfig> = {
  분: {
    points: 60,
    shift: (date, offset) => {
      date.setMinutes(date.getMinutes() - offset);
    },
    formatLabel: (date) => `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
    volatility: 0.006,
    drift: 0.015,
    wave: 6,
  },
  일: {
    points: 30,
    shift: (date, offset) => {
      date.setDate(date.getDate() - offset);
    },
    formatLabel: (date) => `${date.getMonth() + 1}/${date.getDate()}`,
    volatility: 0.015,
    drift: 0.04,
    wave: 8,
  },
  주: {
    points: 52,
    shift: (date, offset) => {
      date.setDate(date.getDate() - offset * 7);
    },
    formatLabel: (date) => `${date.getMonth() + 1}/${date.getDate()}`,
    volatility: 0.022,
    drift: 0.08,
    wave: 11,
  },
  월: {
    points: 12,
    shift: (date, offset) => {
      date.setMonth(date.getMonth() - offset);
    },
    formatLabel: (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
    volatility: 0.035,
    drift: 0.12,
    wave: 5,
  },
  년: {
    points: 5,
    shift: (date, offset) => {
      date.setFullYear(date.getFullYear() - offset);
    },
    formatLabel: (date) => `${date.getFullYear()}`,
    volatility: 0.05,
    drift: 0.2,
    wave: 3,
  },
};

const OVERVIEW_TARGET_PROFILE: Record<
  OverviewChartTarget,
  {
    volatilityMultiplier: number;
    driftMultiplier: number;
    waveMultiplier: number;
  }
> = {
  KOSPI: {
    volatilityMultiplier: 1,
    driftMultiplier: 0.9,
    waveMultiplier: 1.05,
  },
  NASDAQ: {
    volatilityMultiplier: 1.1,
    driftMultiplier: 1.05,
    waveMultiplier: 0.95,
  },
  "S&P 500": {
    volatilityMultiplier: 0.95,
    driftMultiplier: 0.9,
    waveMultiplier: 1.1,
  },
  "USD/KRW": {
    volatilityMultiplier: 0.7,
    driftMultiplier: 0.7,
    waveMultiplier: 1.2,
  },
};

function hashString(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createSeededRandom(seed: number): () => number {
  let state = seed % 2147483647;

  if (state <= 0) {
    state += 2147483646;
  }

  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function round(value: number): number {
  return Number(value.toFixed(2));
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, current) => sum + current, 0) / values.length;
}

function buildHistorySeries(
  baseValue: number,
  range: ChartRange,
  seedKey: string,
  trendDirection: number,
  overrides: Partial<Pick<RangeConfig, "volatility" | "drift" | "wave">> = {},
): StockChartPoint[] {
  const config = RANGE_CONFIG[range];
  const profile = {
    volatility: overrides.volatility ?? config.volatility,
    drift: overrides.drift ?? config.drift,
    wave: overrides.wave ?? config.wave,
  };
  const total = config.points;
  const seed = hashString(`${seedKey}:${range}`);
  const random = createSeededRandom(seed);
  const rawCloses: number[] = [];
  const normalizedDirection = trendDirection === 0 ? 1 : trendDirection;

  for (let index = 0; index < total; index += 1) {
    const progress = total === 1 ? 1 : index / (total - 1);
    const centeredProgress = progress - 0.5;
    const drift = centeredProgress * profile.drift * normalizedDirection;
    const cycle = Math.sin((index + seed) / profile.wave) * profile.volatility * 0.35;
    const noise = (random() - 0.5) * profile.volatility * 0.18;
    rawCloses.push(Math.max(0.01, 1 + drift + cycle + noise));
  }

  const lastClose = rawCloses.at(-1) ?? 1;
  const scale = baseValue / lastClose;
  const closes = rawCloses.map((value) => round(value * scale));

  const points = closes.map((close, index) => {
    const date = new Date();
    config.shift(date, total - 1 - index);

    const openNoise = (random() - 0.5) * profile.volatility * 0.08;
    const spread = Math.max(close * profile.volatility * 0.45, baseValue * profile.volatility * 0.12);
    const open = round(Math.max(0.01, close * (1 - profile.volatility * 0.03 + openNoise)));
    const high = round(Math.max(open, close) + spread);
    const low = round(Math.max(0.01, Math.min(open, close) - spread));

    return {
      date: config.formatLabel(date),
      price: close,
      open,
      high,
      low,
      close,
    };
  });

  const closeSeries = points.map((point) => point.close);

  return points.map((point, index) => ({
    ...point,
    ma5: round(average(closeSeries.slice(Math.max(0, index - 4), index + 1))),
    ma20: round(average(closeSeries.slice(Math.max(0, index - 19), index + 1))),
  }));
}

export function generatePriceHistory(
  baseValue: number,
  range: ChartRange,
  seedKey: string,
  trendDirection: number = 1,
): StockChartPoint[] {
  return buildHistorySeries(baseValue, range, seedKey, trendDirection);
}

export function generateOverviewChartSeries(
  baseValue: number,
  target: OverviewChartTarget,
  range: ChartRange,
  trendDirection: number = 1,
): OverviewChartPoint[] {
  const targetProfile = OVERVIEW_TARGET_PROFILE[target];
  const series = buildHistorySeries(baseValue, range, target, trendDirection, {
    volatility: RANGE_CONFIG[range].volatility * targetProfile.volatilityMultiplier,
    drift: RANGE_CONFIG[range].drift * targetProfile.driftMultiplier,
    wave: RANGE_CONFIG[range].wave * targetProfile.waveMultiplier,
  });

  return series.map(({ date, close }) => ({
    date,
    value: close,
  }));
}
