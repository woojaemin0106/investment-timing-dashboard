import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Stock, MarketType, SignalType } from "@/types";
import { signalLabels } from "@/lib/investpulse-config";
import { useFavorites } from "@/contexts/FavoritesContext";
import { classifyStockSignal, getMarketLabel, getMarketPrefix, getSignalTone } from "@/shared/lib/market-display";
import styles from "./OverviewTab.module.scss";

type MarketTabViewProps = {
  market: "전체" | MarketType;
  tableStocks: Stock[];
  keyword: string;
  signal: SignalType;
  rsiData: { name: string; rsi: number; fill: string }[];
  formatChange: (val: number) => string;
  title: string;
  subtitle: string;
};

export default function MarketTabView({
  market,
  tableStocks,
  keyword,
  signal,
  rsiData,
  formatChange,
  title,
  subtitle,
}: MarketTabViewProps) {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();

  const filteredStocks = (tableStocks ?? []).filter((stock) => {
    const matchesKeyword =
      keyword.length === 0 ||
      stock.name.toLowerCase().includes(keyword.toLowerCase()) ||
      stock.code.toLowerCase().includes(keyword.toLowerCase());
    return matchesKeyword;
  });

  const marketLabel = getMarketLabel(market);

  return (
    <div className={styles.fullTableSection}>
      <div className={styles.fullTablePanel}>
        <div className={styles.tablePanelHeader}>
          <h3>
            {title || marketLabel}
            <small>{subtitle}</small>
          </h3>
          <p className={styles.filterMeta}>
            신호 필터: {signalLabels[signal]} · {filteredStocks.length}개 종목
          </p>
        </div>
        <table className={styles.fullStockTable}>
          <thead>
            <tr>
              <th>시장</th>
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
            {filteredStocks.map((stock, index) => {
              const signalTone = getSignalTone(classifyStockSignal(stock));
              const prefix = getMarketPrefix(stock.market);
              const badgeClass =
                signalTone.signal === "success"
                  ? styles.badgeSuccess
                  : signalTone.signal === "warning"
                    ? styles.badgeWarning
                    : styles.badgeDanger;
              return (
                <tr key={stock.code} onClick={() => router.push(`/stock/${stock.code}`)}>
                  <td>
                    <span className={styles.marketTag}>{stock.market}</span>
                  </td>
                  <td className={styles.codeCell}>{stock.code}</td>
                  <td>
                    <div className={styles.nameCell}>
                      <span className={styles.rank}>{index + 1}</span>
                      <Heart 
                        size={14} 
                        fill={isFavorite(stock.code) ? "#7b8fa6" : "transparent"} 
                        color="#7b8fa6" 
                        className={styles.heartIcon}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(stock.code);
                        }}
                      />
                      <strong>{stock.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span className={styles.categoryTag}>{stock.category}</span>
                  </td>
                  <td className={styles.price}>
                    {prefix}
                    {stock.price.toLocaleString()}
                  </td>
                  <td className={stock.change >= 0 ? styles.up : styles.down}>
                    {formatChange(stock.change)}
                  </td>
                  <td>{stock.volume}</td>
                  <td>
                    <span className={styles.rsiTag}>{stock.rsi}</span>
                  </td>
                  <td>
                    <span className={`${styles.signalBadgeFull} ${badgeClass}`}>
                      {signalTone.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* RSI Panel for filtered view */}
      <div className={styles.rsiPanelSide}>
        <div className={styles.tablePanelHeader}>
          <h3>
            RSI 현황 <small>시장 기준</small>
          </h3>
        </div>
        <div className={styles.rsiLegend}>
          <span><i className={styles.dotSuccess} /> 과매도 (30↓)</span>
          <span><i className={styles.dotOrange} /> 중립 (30~70)</span>
          <span><i className={styles.dotDanger} /> 과매수 (70↑)</span>
        </div>
        <div className={styles.rsiBarList}>
          {rsiData.map((item) => (
            <div 
              key={item.name} 
              className={styles.rsiBarRow}
              style={{ cursor: "pointer" }}
              onClick={() => router.push(`/stock/${item.name}`)}
            >
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
  );
}
