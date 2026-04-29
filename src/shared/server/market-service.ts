import type {
  MarketHistoryResponse,
  MarketRange,
  MarketSummary,
  MarketSymbol,
  MarketTimingResponse,
  PricePoint,
  MarketDataSource,
} from "@/shared/types/market";
import { getMockPrices } from "@/shared/mocks/market-data";
import {
  applyMovingAverages,
  calculateChangeRate,
  calculatePercentile,
  calculateRsi,
  calculateVolatility,
  createSummaryText,
  detectAnomalies,
  getInvestmentSignal,
} from "@/shared/lib/market-analysis";
import { fetchTwelveDataHistory } from "@/shared/server/twelve-data";

interface LoadedPriceSeries {
  prices: PricePoint[];
  source: MarketDataSource;
}

async function loadPriceSeries(symbol: MarketSymbol, range: MarketRange): Promise<LoadedPriceSeries> {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    return {
      prices: getMockPrices(symbol, range),
      source: "mock",
    };
  }

  const livePrices = await fetchTwelveDataHistory({ symbol, range, apiKey });
  if (livePrices === null || livePrices.length === 0) {
    return {
      prices: getMockPrices(symbol, range),
      source: "mock",
    };
  }

  return {
    prices: livePrices,
    source: "live",
  };
}

export async function getMarketHistory(
  symbol: MarketSymbol,
  range: MarketRange,
): Promise<MarketHistoryResponse> {
  const { prices, source } = await loadPriceSeries(symbol, range);
  const analyzedPrices = applyMovingAverages(prices);

  return {
    symbol,
    range,
    source,
    prices: analyzedPrices,
  };
}

export async function getMarketTiming(
  symbol: MarketSymbol,
  range: MarketRange,
): Promise<MarketTimingResponse> {
  const history = await getMarketHistory(symbol, range);
  const { prices } = history;
  const current = prices.at(-1);
  const previous = prices.length > 1 ? prices[prices.length - 2] : undefined;
  const currentPrice = current?.close ?? 0;
  const previousClose = previous?.close;
  const percentile = calculatePercentile(prices, currentPrice);
  const rsi = calculateRsi(prices);
  const volatility = calculateVolatility(prices);
  const changeRate = calculateChangeRate(currentPrice, previousClose);
  const signal = getInvestmentSignal({ rsi, percentile, volatility });

  const summaryBase: MarketSummary = {
    symbol,
    currentPrice,
    previousClose,
    changeRate,
    percentile,
    rsi,
    volatility,
    signal,
    summary: "",
  };

  const summary: MarketSummary = {
    ...summaryBase,
    summary: createSummaryText(summaryBase),
  };

  return {
    source: history.source,
    summary,
    prices,
    anomalies: detectAnomalies(prices),
  };
}
