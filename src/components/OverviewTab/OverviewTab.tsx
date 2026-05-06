"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useInvestPulseData } from "@/lib/use-investpulse-data";
import { MarketType, SignalType } from "@/types";
import { signalLabels } from "@/lib/investpulse-config";
import { mockIndices, mockExchangeRate } from "@/mocks/investpulse-data";
import {
  chartRangeOptions,
  generateOverviewChartSeries,
  type ChartRange,
  type OverviewChartTarget,
} from "@/shared/lib/chart-series";
import {
  classifyStockSignal,
  getMarketLabel,
  getSignalTone,
  isMarketType,
  isSignalType,
} from "@/shared/lib/market-display";
import styles from "./OverviewTab.module.scss";

import OverviewHeader from "./OverviewHeader";
import SummaryCardsSection from "./SummaryCardsSection";
import ActiveChartSection from "./ActiveChartSection";
import CryptoWidget from "./CryptoWidget";
import MarketTable from "./MarketTable";
import MarketTabView from "./MarketTabView";

const marketTabs: Array<"전체" | MarketType> = ["전체", "국내", "해외", "BTC", "ETF"];

const formatChange = (value: number) => (value >= 0 ? `+${value}%` : `${value}%`);

export default function OverviewTab() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, loading, error } = useInvestPulseData();
  const [keyword, setKeyword] = useState("");
  const [chartRange, setChartRange] = useState<ChartRange>("주");
  const [chartTarget, setChartTarget] = useState<OverviewChartTarget>("USD/KRW");
  const [activeSummaryIdx, setActiveSummaryIdx] = useState(0);

  const signalParam = searchParams?.get("signal");
  const signal: SignalType = isSignalType(signalParam) ? signalParam : "all";
  const marketParam = searchParams?.get("market");
  const market: "전체" | MarketType = isMarketType(marketParam) ? marketParam : "전체";
  const allStocks = useMemo(() => data?.stocks ?? [], [data?.stocks]);

  const domesticStocks = useMemo(() => allStocks.filter((s) => s.market === "국내"), [allStocks]);
  const foreignStocks = useMemo(() => allStocks.filter((s) => s.market === "해외"), [allStocks]);
  const btcStocks = useMemo(() => allStocks.filter((s) => s.market === "BTC"), [allStocks]);
  const etfStocks = useMemo(() => allStocks.filter((s) => s.market === "ETF"), [allStocks]);
  const btcStock = useMemo(() => allStocks.find((s) => s.code === "BTC-USD"), [allStocks]);
  const ethStock = useMemo(() => allStocks.find((s) => s.code === "ETH-USD"), [allStocks]);

  // Apply keyword filter to base domestic/foreign stocks
  const filteredDomesticStocks = useMemo(() => {
    if (!keyword.trim()) return domesticStocks;
    const kw = keyword.trim().toLowerCase();
    return domesticStocks.filter((s) => s.name.toLowerCase().includes(kw) || s.code.toLowerCase().includes(kw));
  }, [domesticStocks, keyword]);

  const filteredForeignStocks = useMemo(() => {
    if (!keyword.trim()) return foreignStocks;
    const kw = keyword.trim().toLowerCase();
    return foreignStocks.filter((s) => s.name.toLowerCase().includes(kw) || s.code.toLowerCase().includes(kw));
  }, [foreignStocks, keyword]);

  const marketStocks = useMemo(() => {
    if (market === "국내") return domesticStocks;
    if (market === "해외") return foreignStocks;
    if (market === "BTC") return btcStocks;
    if (market === "ETF") return etfStocks;
    return allStocks;
  }, [allStocks, btcStocks, domesticStocks, etfStocks, foreignStocks, market]);

  const visibleStocks = useMemo(() => {
    let result = signal === "all"
      ? marketStocks
      : allStocks.filter((stock) => classifyStockSignal(stock) === signal);

    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(kw) ||
          s.code.toLowerCase().includes(kw)
      );
    }
    return result;
  }, [allStocks, marketStocks, signal, keyword]);

  const rsiData = useMemo(() => {
    return visibleStocks.map((s) => ({
      name: s.code,
      rsi: s.rsi,
      fill: getSignalTone(classifyStockSignal(s)).bar,
    }));
  }, [visibleStocks]);

  const activeChart = useMemo(() => {
    switch (chartTarget) {
      case "KOSPI":
        return {
          title: "KOSPI 추이 · 실시간",
          value: mockIndices.kospi.value,
          change: mockIndices.kospi.change,
          prev: mockIndices.kospi.value * 0.992,
          prefix: "",
        };
      case "NASDAQ":
        return {
          title: "NASDAQ 추이 · 실시간",
          value: mockIndices.nasdaq.value,
          change: mockIndices.nasdaq.change,
          prev: mockIndices.nasdaq.value * 0.988,
          prefix: "",
        };
      case "S&P 500":
        return {
          title: "S&P 500 추이 · 실시간",
          value: 5280.1,
          change: 0.6,
          prev: 5280.1 * 0.994,
          prefix: "",
        };
      case "USD/KRW":
      default:
        return {
          title: "USD/KRW 환율 추이 · 실시간",
          value: mockExchangeRate.usdkrw,
          change: mockExchangeRate.usdChange,
          prev: mockExchangeRate.prevClose,
          prefix: "₩",
        };
    }
  }, [chartTarget]);

  const chartData = useMemo(
    () => generateOverviewChartSeries(activeChart.value, chartTarget, chartRange, Math.sign(activeChart.change) || 1),
    [activeChart.change, activeChart.value, chartRange, chartTarget],
  );

  const handleSignalChange = (nextSignal: SignalType, idx: number) => {
    setActiveSummaryIdx(idx);
    if (nextSignal === "all") {
      router.push("/");
      return;
    }

    const params = new URLSearchParams(searchParams?.toString());
    params.delete("market");
    params.set("signal", nextSignal);

    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  };

  const shouldShowSignalTable = signal !== "all" || market !== "전체";
  const tableMarket = signal !== "all" ? "전체" : market;

  const fullTableTitle =
    signal !== "all"
      ? `${signalLabels[signal]} 종목`
      : getMarketLabel(tableMarket);

  const fullTableSubtitle = signal !== "all" ? "전체 시장" : "시장 기준";

  const handleTabClick = (tab: "전체" | MarketType) => {
    const params = new URLSearchParams(searchParams?.toString());

    if (tab === "전체") {
      setActiveSummaryIdx(0);
      params.delete("market");
      params.delete("signal");
    } else {
      setActiveSummaryIdx(0);
      params.set("market", tab);
      params.delete("signal");
    }

    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  };

  if (loading) return <section className={styles.state}>데이터를 불러오는 중...</section>;
  if (error) return <section className={styles.state}>오류: {error}</section>;

  return (
    <section className={styles.wrapper}>
      <OverviewHeader
        keyword={keyword}
        setKeyword={setKeyword}
        marketTabs={marketTabs}
        market={market}
        handleTabClick={handleTabClick}
      />

      <SummaryCardsSection
        allStocks={allStocks}
        activeChart={activeChart}
        activeChartTarget={chartTarget}
        formatChange={formatChange}
        activeSummaryIdx={activeSummaryIdx}
        onSignalChange={handleSignalChange}
      />

      {!shouldShowSignalTable ? (
        <>
          <div className={styles.middleRow}>
            <ActiveChartSection
              activeChart={activeChart}
              chartRanges={chartRangeOptions}
              chartRange={chartRange}
              setChartRange={setChartRange}
              chartTarget={chartTarget}
              setChartTarget={setChartTarget}
              formatChange={formatChange}
              chartData={chartData}
            />

            <CryptoWidget btcStock={btcStock} ethStock={ethStock} formatChange={formatChange} />
          </div>

          <div className={styles.bottomRow}>
            <MarketTable
              stocks={filteredDomesticStocks}
              title="국내 주식"
              currencyPrefix="₩"
              targetTab="국내"
              formatChange={formatChange}
            />
            <MarketTable
              stocks={filteredForeignStocks}
              title="해외 주식"
              currencyPrefix="$"
              targetTab="해외"
              formatChange={formatChange}
            />


            {/* RSI Panel */}
            <div className={styles.rsiPanel}>
              <div className={styles.tablePanelHeader}>
                <h3>RSI 현황 <small>시장 기준</small></h3>
              </div>
              <div className={styles.rsiLegend}>
                <span><i className={styles.dotSuccess} /> 과매도 (30↓)</span>
                <span><i className={styles.dotOrange} /> 중립 (30~70)</span>
                <span><i className={styles.dotDanger} /> 과매수 (70↑)</span>
              </div>
              <div className={styles.rsiBarList}>
                {rsiData.map((item) => (
                  <div 
                    key={item.name} 
                    className={styles.rsiBarRow}
                    style={{ cursor: "pointer" }}
                    onClick={() => router.push(`/stock/${item.name}`)}
                  >
                    <span className={styles.rsiBarLabel}>{item.name}</span>
                    <div className={styles.rsiBarTrack}>
                      <div
                        className={styles.rsiBarFill}
                        style={{ width: `${item.rsi}%`, background: item.fill }}
                      />
                    </div>
                    <span className={styles.rsiBarValue}>{item.rsi}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <MarketTabView
          market={tableMarket}
          signal={signal}
          tableStocks={visibleStocks}
          keyword={keyword}
          rsiData={rsiData}
          formatChange={formatChange}
          title={fullTableTitle}
          subtitle={fullTableSubtitle}
        />
      )}
    </section>
  );
}
