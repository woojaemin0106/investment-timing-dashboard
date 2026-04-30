import { DollarSign } from "lucide-react";
import { SignalType, Stock } from "@/types";
import { classifyStockSignal } from "@/shared/lib/market-display";
import type { OverviewChartTarget } from "@/shared/lib/chart-series";
import styles from "./OverviewTab.module.scss";

type SummaryCardsSectionProps = {
  allStocks: Stock[];
  activeChart: { title: string; value: number; change: number; prefix: string; prev: number };
  activeChartTarget: OverviewChartTarget;
  formatChange: (val: number) => string;
  activeSummaryIdx: number;
  onSignalChange: (signal: SignalType, idx: number) => void;
};

export default function SummaryCardsSection({
  allStocks,
  activeChart,
  activeChartTarget,
  formatChange,
  activeSummaryIdx,
  onSignalChange,
}: SummaryCardsSectionProps) {
  const targetName =
    activeChartTarget === "USD/KRW"
      ? "USD/KRW"
      : activeChart.title.split(" 추이")[0];

  const isUsdCard = targetName === "USD/KRW";
  const displayLabel = isUsdCard ? "달러 환율 (USD/KRW)" : targetName;

  return (
    <div className={styles.summaryRow}>
      <button
        type="button"
        className={`${styles.summaryCard} ${styles.summaryCardButton} ${activeSummaryIdx === 0 ? styles.summaryHighlight : ""}`}
        onClick={() => onSignalChange("all", 0)}
      >
        <div className={styles.summaryLabel}>
          {targetName === "USD/KRW" && <DollarSign size={13} />}
          {displayLabel}
        </div>
        <div className={styles.summaryValue}>
          {activeChart.prefix}{activeChart.value.toLocaleString(undefined, { maximumFractionDigits: targetName === "S&P 500" ? 1 : undefined })}
        </div>
        <div className={`${styles.summaryChange} ${styles.up}`}>
          {activeChart.change >= 0 ? "▲" : "▼"} {formatChange(activeChart.change)}
        </div>
      </button>
      <button
        type="button"
        className={`${styles.summaryCard} ${styles.summaryCardButton} ${activeSummaryIdx === 1 ? styles.summaryHighlight : ""}`}
        onClick={() => onSignalChange("all", 1)}
      >
        <div className={styles.summaryLabel}>총 분석 종목</div>
        <div className={styles.summaryValue}>{allStocks.length}</div>
        <div className={styles.summaryMeta}>종목 모니터링 중</div>
      </button>
      <button
        type="button"
        className={`${styles.summaryCard} ${styles.summaryCardButton} ${activeSummaryIdx === 2 ? styles.summaryHighlight : ""}`}
        onClick={() => onSignalChange("success", 2)}
        aria-pressed={activeSummaryIdx === 2}
      >
        <div className={styles.summaryLabel}>과매도 종목</div>
        <div className={`${styles.summaryValue} ${styles.up}`}>
          {allStocks.filter((s) => classifyStockSignal(s) === "success").length}
        </div>
        <div className={styles.summaryMeta}>저점 포착</div>
      </button>
      <button
        type="button"
        className={`${styles.summaryCard} ${styles.summaryCardButton} ${activeSummaryIdx === 3 ? styles.summaryHighlight : ""}`}
        onClick={() => onSignalChange("danger", 3)}
        aria-pressed={activeSummaryIdx === 3}
      >
        <div className={styles.summaryLabel}>과매수 종목</div>
        <div className={`${styles.summaryValue} ${styles.down}`}>
          {allStocks.filter((s) => classifyStockSignal(s) === "danger").length}
        </div>
        <div className={styles.summaryMeta}>단기 조정 주의</div>
      </button>
    </div>
  );
}
