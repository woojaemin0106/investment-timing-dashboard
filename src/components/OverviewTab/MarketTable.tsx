import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Stock, MarketType } from "@/types";
import { useFavorites } from "@/contexts/FavoritesContext";
import { classifyStockSignal, getMarketHref, getSignalTone } from "@/shared/lib/market-display";
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

  const { isFavorite, toggleFavorite } = useFavorites();

  const switchToTab = () => {
    router.push(getMarketHref(targetTab));
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
            const signalTone = getSignalTone(classifyStockSignal(s));
            const badgeClass =
              signalTone.signal === "success"
                ? styles.badgeSuccess
                : signalTone.signal === "warning"
                  ? styles.badgeWarning
                  : styles.badgeDanger;
            return (
              <tr key={s.code} onClick={() => router.push(`/stock/${s.code}`)}>
                <td>
                  <div className={styles.stockCell}>
                    <span className={styles.stockSymbol}>{s.code.slice(0, 2)}</span>
                    <div>
                      <div className={styles.stockName} style={{ display: "flex", alignItems: "center" }}>
                        {s.name}
                        <Heart 
                          size={14} 
                          fill={isFavorite(s.code) ? "#7b8fa6" : "transparent"} 
                          color="#7b8fa6" 
                          style={{ marginLeft: 6, cursor: "pointer" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(s.code);
                          }}
                        />
                      </div>
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
                  <span className={`${styles.badge} ${badgeClass}`}>{signalTone.label}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
