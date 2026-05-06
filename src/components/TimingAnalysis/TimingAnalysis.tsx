"use client";

import { useMemo, useState } from "react";
import { useInvestPulseData } from "@/lib/use-investpulse-data";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Stock } from "@/types";
import { classifyStockSignal } from "@/shared/lib/market-display";
import TimingHeader from "./TimingHeader";
import StockSignalCard from "./StockSignalCard";
import DetailChart from "./DetailChart";
import SignalScorePanel from "./SignalScorePanel";
import styles from "./TimingAnalysis.module.scss";

type FilterType = "전체" | "매수 적기" | "주의 필요" | "과매수";
type MarketFilter = "국내" | "해외" | "BTC";

function filterToSignal(f: FilterType): string | null {
  switch (f) {
    case "매수 적기":
      return "success";
    case "주의 필요":
      return "warning";
    case "과매수":
      return "danger";
    default:
      return null;
  }
}

export default function TimingAnalysis() {
  const { data, loading, error } = useInvestPulseData();
  const { favorites } = useFavorites();
  const [activeFilter, setActiveFilter] = useState<FilterType>("전체");
  const [activeMarket, setActiveMarket] = useState<MarketFilter | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");

  const allStocks = useMemo(() => data?.stocks ?? [], [data?.stocks]);

  // 좋아요 누른 종목만 필터링
  const favoriteStocks = useMemo(
    () => allStocks.filter((s) => favorites.includes(s.code)),
    [allStocks, favorites]
  );

  const signalCounts = useMemo(() => {
    const counts: Record<string, number> = { success: 0, warning: 0, danger: 0 };
    for (const s of favoriteStocks) {
      const sig = classifyStockSignal(s);
      counts[sig] = (counts[sig] || 0) + 1;
    }
    return counts;
  }, [favoriteStocks]);

  const filteredStocks = useMemo(() => {
    let result = favoriteStocks;

    // Market filter
    if (activeMarket) {
      result = result.filter((s) => s.market === activeMarket);
    }

    // Signal filter
    const signalKey = filterToSignal(activeFilter);
    if (signalKey) {
      result = result.filter((s) => classifyStockSignal(s) === signalKey);
    }

    // Keyword search
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(kw) ||
          s.code.toLowerCase().includes(kw)
      );
    }

    return result;
  }, [favoriteStocks, activeFilter, activeMarket, keyword]);

  // Top 6 stocks for the card grid
  const gridStocks = useMemo(() => filteredStocks.slice(0, 6), [filteredStocks]);

  // Selected stock for detail chart
  const selectedStock: Stock | null = useMemo(() => {
    if (selectedCode) {
      return favoriteStocks.find((s) => s.code === selectedCode) ?? null;
    }
    return gridStocks[0] ?? null;
  }, [selectedCode, favoriteStocks, gridStocks]);

  if (loading) {
    return (
      <section className={styles.wrapper}>
        <p style={{ color: "#7b8fa6", padding: "14px 4px" }}>데이터를 불러오는 중...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.wrapper}>
        <p style={{ color: "#7b8fa6", padding: "14px 4px" }}>오류: {error}</p>
      </section>
    );
  }

  return (
    <section className={styles.wrapper}>
      <TimingHeader
        activeFilter={activeFilter}
        activeMarket={activeMarket}
        onFilterChange={setActiveFilter}
        onMarketChange={setActiveMarket}
        signalCounts={signalCounts}
        keyword={keyword}
        setKeyword={setKeyword}
      />

      <div className={styles.mainContent}>
        <div className={styles.leftColumn}>
          {/* 종목 신호 카드 그리드 — 관심종목만 표시 */}
          {gridStocks.length === 0 ? (
            <div className={styles.detailCard} style={{ padding: "40px 20px", textAlign: "center" }}>
              <p style={{ color: "#7b8fa6", fontSize: 14 }}>
                {keyword.trim()
                  ? `"${keyword}" 검색 결과가 없습니다.`
                  : "관심종목이 없습니다. 종목 상세 페이지에서 ♥ 버튼을 눌러 추가하세요."}
              </p>
            </div>
          ) : (
            <div className={styles.cardsGrid}>
              {gridStocks.map((stock) => (
                <StockSignalCard
                  key={stock.code}
                  stock={stock}
                  isSelected={selectedStock?.code === stock.code}
                  onClick={() => setSelectedCode(stock.code)}
                />
              ))}
            </div>
          )}

          {/* 상세 분석 차트 */}
          {selectedStock && <DetailChart stock={selectedStock} />}
        </div>

        <div className={styles.rightColumn}>
          <SignalScorePanel stocks={filteredStocks} />
        </div>
      </div>
    </section>
  );
}
