import { useRouter } from "next/navigation";
import { Stock, MarketType, SignalType } from "@/types";
import { signalLabels } from "@/lib/investpulse-config";
import styles from "./OverviewTab.module.scss";

type MarketTabViewProps = {
  market: MarketType;
  tableStocks: Stock[];
  keyword: string;
  signal: SignalType;
  rsiData: { name: string; rsi: number; fill: string }[];
  formatChange: (val: number) => string;
};

export default function MarketTabView({
  market,
  tableStocks,
  keyword,
  signal,
  rsiData,
  formatChange,
}: MarketTabViewProps) {
  const router = useRouter();

  const signalBadge = (sig: string) => {
    if (sig === "success") return { cls: styles.badgeSuccess, text: "매수" };
    if (sig === "warning") return { cls: styles.badgeWarning, text: "중립" };
    return { cls: styles.badgeDanger, text: "과매수" };
  };

  const filteredStocks = (tableStocks ?? []).filter((stock) => {
    const matchesKeyword =
      keyword.length === 0 ||
      stock.name.toLowerCase().includes(keyword.toLowerCase()) ||
      stock.code.toLowerCase().includes(keyword.toLowerCase());
    return matchesKeyword;
  });

  return (
    <div className={styles.fullTableSection}>
      <div className={styles.fullTablePanel}>
        <div className={styles.tablePanelHeader}>
          <h3>
            {market === "국내" ? "국내 주식" : market === "해외" ? "해외 주식" : "가상자산 (BTC)"}
            <small>{tableStocks?.length ?? 0}개 종목</small>
          </h3>
          <p className={styles.filterMeta}>신호 필터: {signalLabels[signal]}</p>
        </div>
        <table className={styles.fullStockTable}>
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
            {filteredStocks.map((stock) => {
              const badge = signalBadge(stock.signal);
              const prefix = stock.market === "국내" ? "₩" : "$";
              return (
                <tr key={stock.code} onClick={() => router.push(`/stock/${stock.code}`)}>
                  <td className={styles.codeCell}>{stock.code}</td>
                  <td>
                    <strong>{stock.name}</strong>
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
                    <span className={`${styles.signalBadgeFull} ${badge.cls}`}>
                      {stock.signal === "success"
                        ? "🟢 매수 적기"
                        : stock.signal === "warning"
                        ? "🟡 중립"
                        : "🔴 과매수"}
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
            RSI 현황 <small>{market}</small>
          </h3>
        </div>
        <div className={styles.rsiLegend}>
          <span><i className={styles.dotDanger} /> 과매수 (70↑)</span>
          <span><i className={styles.dotOrange} /> 중립 (30~70)</span>
          <span><i className={styles.dotSuccess} /> 과매도 (30↓)</span>
        </div>
        <div className={styles.rsiBarList}>
          {rsiData.map((item) => (
            <div key={item.name} className={styles.rsiBarRow}>
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
