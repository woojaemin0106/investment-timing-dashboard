"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useInvestPulseData } from "@/lib/use-investpulse-data";
import { MarketType, SignalType } from "@/types";
import { mockIndices, mockExchangeRate } from "@/mocks/investpulse-data";
import styles from "./OverviewTab.module.scss";

import OverviewHeader from "./OverviewHeader";
import SummaryCardsSection from "./SummaryCardsSection";
import ActiveChartSection from "./ActiveChartSection";
import CryptoWidget from "./CryptoWidget";
import MarketTable from "./MarketTable";
import MarketTabView from "./MarketTabView";

const marketTabs: Array<"전체" | MarketType> = ["전체", "국내", "해외", "BTC", "ETF"];

const formatKRW = (value: number) => {
  if (value >= 1_000_000_000) return `₩${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `₩${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₩${(value / 1_000).toFixed(1)}K`;
  return `₩${value.toLocaleString()}`;
};

const formatChange = (value: number) => (value >= 0 ? `+${value}%` : `${value}%`);

type ChartRange = "1D" | "1W" | "1M" | "3M" | "1Y";
type ChartTarget = "USD/KRW" | "KOSPI" | "NASDAQ" | "S&P 500";
const chartRanges: ChartRange[] = ["1D", "1W", "1M", "3M", "1Y"];

export default function OverviewTab() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, loading, error } = useInvestPulseData();
  const [keyword, setKeyword] = useState("");
  const [chartRange, setChartRange] = useState<ChartRange>("1W");
  const [chartTarget, setChartTarget] = useState<ChartTarget>("USD/KRW");

  const signal = (searchParams?.get("signal") as SignalType) || "all";
  const marketParam = searchParams?.get("market");
  const market: "전체" | MarketType =
    marketParam === "국내" || marketParam === "해외" || marketParam === "BTC" || marketParam === "ETF" ? marketParam : "전체";
  const allStocks = useMemo(() => data?.stocks ?? [], [data?.stocks]);

  const domesticStocks = useMemo(() => allStocks.filter((s) => s.market === "국내"), [allStocks]);
  const foreignStocks = useMemo(() => allStocks.filter((s) => s.market === "해외"), [allStocks]);
  const btcStocks = useMemo(() => allStocks.filter((s) => s.market === "BTC"), [allStocks]);
  const etfStocks = useMemo(() => allStocks.filter((s) => s.market === "ETF"), [allStocks]);
  const btcStock = useMemo(() => allStocks.find((s) => s.code === "BTC-USD"), [allStocks]);
  const ethStock = useMemo(() => allStocks.find((s) => s.code === "ETH-USD"), [allStocks]);

  const rsiData = useMemo(() => {
    return allStocks
      .filter((s) => {
        if (market === "전체") return true;
        return s.market === market;
      })
      .map((s) => ({
        name: s.code,
        rsi: s.rsi,
        fill: s.rsi > 70 ? "#ff4d6a" : s.rsi < 30 ? "#00d68f" : "#F97316",
      }));
  }, [allStocks, market]);

  const handleTabClick = (tab: "전체" | MarketType) => {
    const params = new URLSearchParams(searchParams?.toString());

    if (tab === "전체") {
      params.delete("market");
    } else {
      params.set("market", tab);
    }

    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  };

  if (loading) return <section className={styles.state}>데이터를 불러오는 중...</section>;
  if (error) return <section className={styles.state}>오류: {error}</section>;

  // 탭별로 다른 테이블 표시할 종목 데이터
  const getTableStocks = () => {
    if (market === "국내") return domesticStocks;
    if (market === "해외") return foreignStocks;
    if (market === "BTC") return btcStocks;
    if (market === "ETF") return etfStocks;
    return []; // 전체 탭일 땐 이걸 직접 표출 안 함 (하단에서 명시)
  };

  const getChartData = () => {
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
  };

  const activeChart = getChartData();
  const tableStocks = getTableStocks();

  return (
    <section className={styles.wrapper}>
      <OverviewHeader
        keyword={keyword}
        setKeyword={setKeyword}
        marketTabs={marketTabs}
        market={market}
        handleTabClick={handleTabClick}
      />

      <SummaryCardsSection allStocks={allStocks} activeChart={activeChart} formatChange={formatChange} />

      {market === "전체" ? (
        <>
          <div className={styles.middleRow}>
            <ActiveChartSection
              activeChart={activeChart}
              chartRanges={chartRanges}
              chartRange={chartRange}
              setChartRange={setChartRange}
              chartTarget={chartTarget}
              setChartTarget={setChartTarget}
              formatChange={formatChange}
              formatKRW={formatKRW}
            />

            <CryptoWidget btcStock={btcStock} ethStock={ethStock} formatChange={formatChange} />
          </div>

          <div className={styles.bottomRow}>
            <MarketTable
              stocks={domesticStocks}
              title="국내 주식"
              currencyPrefix="₩"
              targetTab="국내"
              formatChange={formatChange}
            />
            <MarketTable
              stocks={foreignStocks}
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
                <span><i className={styles.dotDanger} /> 과매수 (70↑)</span>
                <span><i className={styles.dotOrange} /> 중립 (30~70)</span>
                <span><i className={styles.dotSuccess} /> 과매도 (30↓)</span>
              </div>
              <div className={styles.rsiBarList}>
                {rsiData.map((item) => (
                  <div key={item.name} className={styles.rsiBarRow}>
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
          market={market}
          tableStocks={tableStocks}
          keyword={keyword}
          signal={signal}
          rsiData={rsiData}
          formatChange={formatChange}
        />
      )}
    </section>
  );
}
