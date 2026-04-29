import { DollarSign } from "lucide-react";
import { Stock } from "@/types";
import styles from "./OverviewTab.module.scss";

type SummaryCardsSectionProps = {
  allStocks: Stock[];
  activeChart: { title: string; value: number; change: number; prefix: string; prev: number };
  formatChange: (val: number) => string;
};

export default function SummaryCardsSection({ allStocks, activeChart, formatChange }: SummaryCardsSectionProps) {
  // Extract just the target name from the title
  let targetName = activeChart.title.split(" 추이")[0];
  if (targetName === "USD/KRW 환율") {
    targetName = "USD/KRW";
  }

  return (
    <div className={styles.summaryRow}>
      <article className={`${styles.summaryCard} ${styles.summaryHighlight}`}>
        <div className={styles.summaryLabel}>
          {targetName === "USD/KRW" && <DollarSign size={13} />}
          {targetName === "USD/KRW" ? "달러 환율 (USD/KRW)" : targetName}
        </div>
        <div className={styles.summaryValue}>
          {activeChart.prefix}{activeChart.value.toLocaleString(undefined, { maximumFractionDigits: targetName === "S&P 500" ? 1 : undefined })}
        </div>
        <div className={`${styles.summaryChange} ${activeChart.change >= 0 ? styles.up : styles.down}`}>
          {activeChart.change >= 0 ? "▲" : "▼"} {formatChange(activeChart.change)}
        </div>
      </article>
      <article className={styles.summaryCard}>
        <div className={styles.summaryLabel}>총 분석 종목</div>
        <div className={styles.summaryValue}>{allStocks.length}</div>
        <div className={styles.summaryMeta}>종목 모니터링 중</div>
      </article>
      <article className={styles.summaryCard}>
        <div className={styles.summaryLabel}>매수 신호 종목</div>
        <div className={`${styles.summaryValue} ${styles.up}`}>
          {allStocks.filter((s) => s.signal === "success").length}
        </div>
        <div className={styles.summaryMeta}>적기 포착</div>
      </article>
      <article className={styles.summaryCard}>
        <div className={styles.summaryLabel}>과매수 경고 종목</div>
        <div className={`${styles.summaryValue} ${styles.down}`}>
          {allStocks.filter((s) => s.signal === "danger").length}
        </div>
        <div className={styles.summaryMeta}>단기 조정 주의</div>
      </article>
    </div>
  );
}
