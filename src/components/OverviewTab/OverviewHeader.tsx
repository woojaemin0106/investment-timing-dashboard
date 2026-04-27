import { Search, Bell, Settings } from "lucide-react";
import { MarketType } from "@/types";
import styles from "./OverviewTab.module.scss";

type OverviewHeaderProps = {
  keyword: string;
  setKeyword: (kw: string) => void;
  marketTabs: Array<"전체" | MarketType>;
  market: "전체" | MarketType;
  handleTabClick: (tab: "전체" | MarketType) => void;
};

export default function OverviewHeader({ 
  keyword, 
  setKeyword, 
  marketTabs, 
  market, 
  handleTabClick 
}: OverviewHeaderProps) {
  return (
    <div className={styles.header}>
      <h1 className={styles.pageTitle}>마켓 오버뷰</h1>
      <div className={styles.headerRight}>
        <label className={styles.searchBox}>
          <Search size={14} />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className={styles.search}
            placeholder="종목명 또는 코드 검색..."
          />
        </label>
        <div className={styles.tabs}>
          {marketTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`${styles.tab} ${tab === market ? styles.tabActive : ""}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <button type="button" className={styles.iconBtn}><Bell size={16} /></button>
        <button type="button" className={styles.iconBtn}><Settings size={16} /></button>
      </div>
    </div>
  );
}
