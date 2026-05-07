"use client";

import { Settings, Bell, Search } from "lucide-react";
import { SignalType } from "@/types";
import styles from "./TimingAnalysis.module.scss";

type FilterType = "전체" | "매수 적기" | "주의 필요" | "과매수";
type MarketFilter = "국내" | "해외" | "BTC";

interface Props {
  activeFilter: FilterType;
  activeMarket: MarketFilter | null;
  onFilterChange: (f: FilterType) => void;
  onMarketChange: (m: MarketFilter | null) => void;
  signalCounts: Record<string, number>;
  keyword: string;
  setKeyword: (kw: string) => void;
}

const signalFilters: { label: FilterType; signal: SignalType; style?: string }[] = [
  { label: "전체", signal: "all" },
  { label: "매수 적기", signal: "success", style: "filterBuy" },
  { label: "주의 필요", signal: "warning", style: "filterWarn" },
  { label: "과매수", signal: "danger", style: "filterDanger" },
];

const marketFilters: MarketFilter[] = ["국내", "해외", "BTC"];

export default function TimingHeader({
  activeFilter,
  activeMarket,
  onFilterChange,
  onMarketChange,
  signalCounts,
  keyword,
  setKeyword,
}: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>타이밍 분석</h1>
          <span className={styles.liveBadge}>
            <i className={styles.liveDot} />
            실시간 분석 중
          </span>
        </div>
        <div className={styles.headerRight}>
          <label className={styles.searchBox}>
            <Search size={14} />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className={styles.searchInput}
              placeholder="종목명 또는 코드 검색..."
            />
          </label>
          <button type="button" className={styles.iconBtn}>
            <Bell size={16} />
          </button>
          <button type="button" className={styles.iconBtn}>
            <Settings size={16} />
          </button>
        </div>
      </div>

      <div className={styles.filterRow}>
        {signalFilters.map((f) => {
          const isActive = activeFilter === f.label && activeMarket === null;
          const activeStyle = f.style ? styles[f.style as keyof typeof styles] : styles.filterActive;
          const count = f.signal !== "all" ? signalCounts[f.signal] : undefined;
          return (
            <button
              key={f.label}
              type="button"
              className={`${styles.filterBtn} ${f.signal !== "all" ? styles.filterBtnWide : ""} ${isActive ? activeStyle : ""}`}
              onClick={() => {
                onFilterChange(f.label);
                onMarketChange(null);
              }}
            >
              {f.label}
              {count !== undefined && count > 0 && (
                <span className={styles.countBadge}>{count}</span>
              )}
            </button>
          );
        })}

        <span className={styles.filterSep} />

        {marketFilters.map((m) => {
          const isActive = activeMarket === m;
          return (
            <button
              key={m}
              type="button"
              className={`${styles.filterBtn} ${isActive ? styles.filterActive : ""}`}
              onClick={() => {
                onMarketChange(isActive ? null : m);
                if (!isActive) onFilterChange("전체");
              }}
            >
              {m}
            </button>
          );
        })}
      </div>
    </div>
  );
}
