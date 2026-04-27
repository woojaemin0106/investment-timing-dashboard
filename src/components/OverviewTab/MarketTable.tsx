import { useRouter } from "next/navigation";
import { Stock, MarketType } from "@/types";
import styles from "./OverviewTab.module.scss";

type MarketTableProps = {
  stocks: Stock[];
  title: string;
  currencyPrefix: string;
  targetTab: MarketType;
  formatChange: (val: number) => string;
};

export default function MarketTable({
  stocks,
  title,
  currencyPrefix,
  targetTab,
  formatChange,
}: MarketTableProps) {
  const router = useRouter();

  const signalBadge = (sig: string) => {
    if (sig === "success") return { cls: styles.badgeSuccess, text: "매수" };
    if (sig === "warning") return { cls: styles.badgeWarning, text: "중립" };
    return { cls: styles.badgeDanger, text: "과매수" };
  };

  const switchToTab = () => {
    router.push(`/?market=${targetTab}`);
  };

  return (
    <div className={styles.tablePanel}>
      <div className={styles.tablePanelHeader}>
        <h3>{title}</h3>
        <button type="button" className={styles.viewAllBtn} onClick={switchToTab}>
          전체 보기 →
        </button>
      </div>
      <table className={styles.stockTable}>
        <thead>
          <tr>
            <th>종목</th>
            <th>현재가</th>
            <th>등락률</th>
            <th>거래량</th>
            <th>RSI</th>
            <th>신호</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((s) => {
            const badge = signalBadge(s.signal);
            return (
              <tr key={s.code} onClick={() => router.push(`/stock/${s.code}`)}>
                <td>
                  <div className={styles.stockCell}>
                    <span className={styles.stockSymbol}>{s.code.slice(0, 2)}</span>
                    <div>
                      <div className={styles.stockName}>{s.name}</div>
                      <div className={styles.stockCategory}>{s.category}</div>
                    </div>
                  </div>
                </td>
                <td className={styles.price}>
                  {currencyPrefix}
                  {s.price.toLocaleString()}
                </td>
                <td className={s.change >= 0 ? styles.up : styles.down}>
                  {formatChange(s.change)}
                </td>
                <td>{s.volume}</td>
                <td>{s.rsi}</td>
                <td>
                  <span className={`${styles.badge} ${badge.cls}`}>{badge.text}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
