import { useRouter } from "next/navigation";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Stock } from "@/types";
import { mockBtcHistory, mockEthHistory } from "@/mocks/investpulse-data";
import { classifyRsi, getSignalTone } from "@/shared/lib/market-display";
import styles from "./OverviewTab.module.scss";

type CryptoWidgetProps = {
  btcStock?: Stock;
  ethStock?: Stock;
  formatChange: (val: number) => string;
};

export default function CryptoWidget({ btcStock, ethStock, formatChange }: CryptoWidgetProps) {
  const router = useRouter();
  const btcSignal = btcStock ? getSignalTone(classifyRsi(btcStock.rsi)) : null;
  const ethSignal = ethStock ? getSignalTone(classifyRsi(ethStock.rsi)) : null;

  return (
    <div className={styles.cryptoCol}>
      {btcStock && (
        <div className={styles.cryptoCard} onClick={() => router.push(`/stock/${btcStock.code}`)}>
          <div className={styles.cryptoHeader}>
            <div className={styles.cryptoIcon}>₿</div>
            <div className={styles.cryptoInfo}>
              <span className={styles.cryptoName}>{btcStock.name}</span>
              <span className={styles.cryptoCode}>{btcStock.code} · 가상자산</span>
            </div>
            <div className={styles.cryptoPrice}>
              <span className={styles.cryptoPriceValue}>${btcStock.price.toLocaleString()}</span>
              <span className={`${styles.cryptoChange} ${btcStock.change >= 0 ? styles.up : styles.down}`}>
                ▲ {formatChange(btcStock.change)} 24h
              </span>
            </div>
          </div>
          <div className={styles.cryptoChart}>
            <ResponsiveContainer width="100%" height={60}>
              <AreaChart data={mockBtcHistory}>
                <defs>
                  <linearGradient id="btcGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area dataKey="price" stroke="#f59e0b" strokeWidth={2} fill="url(#btcGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.cryptoFooter}>
            <span>거래량 <b>${btcStock.volume}</b></span>
            <span>RSI(14) <b style={{ color: btcSignal?.bar }}>{btcStock.rsi}</b></span>
            <span>24시 최고 <b>${(btcStock.price * 1.01).toLocaleString()}</b></span>
            <span>RSI 상태 <b style={{ color: btcSignal?.dot }}>{btcSignal?.label}</b></span>
          </div>
        </div>
      )}

      {ethStock && (
        <div className={styles.cryptoCard} onClick={() => router.push(`/stock/${ethStock.code}`)}>
          <div className={styles.cryptoHeader}>
            <div className={`${styles.cryptoIcon} ${styles.ethIcon}`}>Ξ</div>
            <div className={styles.cryptoInfo}>
              <span className={styles.cryptoName}>{ethStock.name}</span>
              <span className={styles.cryptoCode}>{ethStock.code} · 가상자산</span>
            </div>
            <div className={styles.cryptoPrice}>
              <span className={styles.cryptoPriceValue}>${ethStock.price.toLocaleString()}</span>
              <span className={`${styles.cryptoChange} ${ethStock.change >= 0 ? styles.up : styles.down}`}>
                ▲ {formatChange(ethStock.change)} 24h
              </span>
            </div>
          </div>
          <div className={styles.cryptoChart}>
            <ResponsiveContainer width="100%" height={60}>
              <AreaChart data={mockEthHistory}>
                <defs>
                  <linearGradient id="ethGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area dataKey="price" stroke="#8b5cf6" strokeWidth={2} fill="url(#ethGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.cryptoFooter}>
            <span>거래량 <b>${ethStock.volume}</b></span>
            <span>RSI(14) <b style={{ color: ethSignal?.bar }}>{ethStock.rsi}</b></span>
            <span>24시 최고 <b>${(ethStock.price * 1.01).toLocaleString()}</b></span>
            <span>RSI 상태 <b style={{ color: ethSignal?.dot }}>{ethSignal?.label}</b></span>
          </div>
        </div>
      )}
    </div>
  );
}
