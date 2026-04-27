"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { signalLabels } from "@/lib/investpulse-config";
import { useInvestPulseData } from "@/lib/use-investpulse-data";
import { MarketType, SignalType } from "@/types";
import styles from "./OverviewTab.module.scss";

const marketTabs: Array<"전체" | MarketType> = ["전체", "국내", "해외", "BTC"];

export default function OverviewTab() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, loading, error } = useInvestPulseData();
  const [market, setMarket] = useState<"전체" | MarketType>("전체");
  const [keyword, setKeyword] = useState("");
  const signal = (searchParams?.get("signal") as SignalType) || "all";
  const formatPrice = (value: number) => `₩${Math.round(value).toLocaleString()}`;

  const filtered = useMemo(() => {
    return (data?.stocks ?? []).filter((stock) => {
      const matchesSignal = signal === "all" ? true : stock.signal === signal;
      const matchesMarket = market === "전체" ? true : stock.market === market;
      const matchesKeyword =
        keyword.length === 0 ||
        stock.name.toLowerCase().includes(keyword.toLowerCase()) ||
        stock.code.toLowerCase().includes(keyword.toLowerCase());
      return matchesSignal && matchesMarket && matchesKeyword;
    });
  }, [data?.stocks, keyword, market, signal]);

  if (loading) {
    return <section className={styles.state}>데이터를 불러오는 중...</section>;
  }

  if (error) {
    return <section className={styles.state}>오류: {error}</section>;
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h1>전체 종목</h1>
          <p>{filtered.length}개의 종목이 검색되었습니다</p>
        </div>
        <label className={styles.searchBox}>
          <Search size={14} />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className={styles.search}
            placeholder="종목명 또는 코드 검색..."
          />
        </label>
      </div>

      <div className={styles.controls}>
        <div className={styles.tabs}>
          {marketTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`${styles.tab} ${tab === market ? styles.active : ""}`}
              onClick={() => setMarket(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <p className={styles.filterMeta}>신호 필터: {signalLabels[signal]}</p>
      </div>

      <div className={styles.tableCard}>
        <table>
          <thead>
            <tr>
              <th>종목코드</th>
              <th>종목명</th>
              <th>업종</th>
              <th>현재가</th>
              <th>등락률</th>
              <th>거래량</th>
              <th>RSI</th>
              <th>투자신호</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((stock) => (
              <tr key={stock.code} onClick={() => router.push(`/stock/${stock.code}`)}>
                <td className={styles.code}>{stock.code}</td>
                <td>
                  <strong>{stock.name}</strong>
                </td>
                <td>
                  <span className={styles.category}>{stock.category}</span>
                </td>
                <td className={styles.price}>{formatPrice(stock.price)}</td>
                <td className={stock.change >= 0 ? styles.up : styles.down}>
                  {stock.change >= 0 ? "+" : ""}
                  {stock.change}%
                </td>
                <td>{stock.volume}</td>
                <td>
                  <span className={styles.rsi}>{stock.rsi}</span>
                </td>
                <td>
                  <span className={`${styles.signalBadge} ${styles[stock.signal]}`}>
                    {stock.signal === "success" ? "🟢 매수 적기" : stock.signal === "warning" ? "🟡 중립" : "🔴 과매수"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
