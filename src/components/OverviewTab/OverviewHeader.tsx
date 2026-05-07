import { Bell, Settings } from "lucide-react";
import { MarketType } from "@/types";
import GlobalSearch from "@/components/Search/GlobalSearch";
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
      <div className={styles.headerLeft}>
        <h1 className={styles.pageTitle}>마켓 오버뷰</h1>
        <span className={styles.liveBadge}>
          <i className={styles.liveDot} />
          실시간 분석 중
        </span>
      </div>
      <div className={styles.headerRight}>
        <GlobalSearch keyword={keyword} setKeyword={setKeyword} />
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
