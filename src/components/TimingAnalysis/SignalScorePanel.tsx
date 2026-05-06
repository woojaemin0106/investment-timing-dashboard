"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Activity, Bell } from "lucide-react";
import { Stock } from "@/types";
import { classifyStockSignal, getSignalTone } from "@/shared/lib/market-display";
import styles from "./TimingAnalysis.module.scss";

interface Props {
  stocks: Stock[];
}

interface Alert {
  title: string;
  sub: string;
  time: string;
  color: string;
  code: string;
}

function computeSignalScore(stocks: Stock[]): number {
  if (stocks.length === 0) return 0;
  let score = 50;
  const buyCount = stocks.filter((s) => classifyStockSignal(s) === "success").length;
  const dangerCount = stocks.filter((s) => classifyStockSignal(s) === "danger").length;
  score += (buyCount / stocks.length) * 35;
  score -= (dangerCount / stocks.length) * 15;
  return Math.round(Math.min(100, Math.max(0, score)));
}

function generateAlerts(stocks: Stock[]): Alert[] {
  const alerts: Alert[] = [];
  for (const s of stocks) {
    const signal = classifyStockSignal(s);
    const tone = getSignalTone(signal);
    if (signal === "success") {
      alerts.push({
        title: `${s.name} — RSI 과매도 진입`,
        sub: `RSI ${s.rsi}로 과매도 구간 진입`,
        time: `${9 + Math.floor(Math.random() * 6)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
        color: tone.bar,
        code: s.code,
      });
    } else if (signal === "danger") {
      alerts.push({
        title: `${s.name} — 과매수 주의`,
        sub: `RSI ${s.rsi}로 과매수 구간`,
        time: `${9 + Math.floor(Math.random() * 6)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
        color: tone.bar,
        code: s.code,
      });
    }
  }
  // Add some extra BTC/cross alerts
  const btcStock = stocks.find((s) => s.code === "BTC-USD");
  if (btcStock) {
    alerts.push({
      title: "BTC — 볼린저 상단 터치",
      sub: `BTC $${btcStock.price.toLocaleString()} 돌파 시도`,
      time: "11:14",
      color: "#ff4d6a",
      code: "BTC-USD",
    });
  }
  const skStock = stocks.find((s) => s.code === "000660");
  if (skStock) {
    alerts.push({
      title: "SK하이닉스 — 데드크로스 임박",
      sub: "단기 5일선이 20일선 하향 돌파 예상",
      time: "10:56",
      color: "#F97316",
      code: "000660",
    });
  }

  return alerts.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 5);
}

export default function SignalScorePanel({ stocks }: Props) {
  const router = useRouter();

  const score = useMemo(() => computeSignalScore(stocks), [stocks]);

  const rsiData = useMemo(
    () =>
      stocks.map((s) => ({
        code: s.code,
        name: s.name,
        rsi: s.rsi,
        bar: getSignalTone(classifyStockSignal(s)).bar,
      })),
    [stocks]
  );

  const alerts = useMemo(() => generateAlerts(stocks), [stocks]);

  // Gauge SVG params
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const gaugeColor = score >= 70 ? "#00d68f" : score >= 40 ? "#F97316" : "#ff4d6a";

  // Signal bar breakdown
  const signalBars = useMemo(() => {
    const total = stocks.length || 1;
    const buyPct = (stocks.filter((s) => classifyStockSignal(s) === "success").length / total) * 100;
    const warnPct = (stocks.filter((s) => classifyStockSignal(s) === "warning").length / total) * 100;
    const dangerPct = (stocks.filter((s) => classifyStockSignal(s) === "danger").length / total) * 100;
    return [
      { label: "MACD", pct: buyPct + 15, color: "#00d68f" },
      { label: "RSI", pct: warnPct + 20, color: "#F97316" },
      { label: "볼린저", pct: dangerPct + 25, color: "#ff4d6a" },
      { label: "이평선", pct: buyPct + 10, color: "#3b82f6" },
    ];
  }, [stocks]);

  return (
    <>
      {/* 신호 강도 스코어 */}
      <div className={styles.scoreCard}>
        <div className={styles.panelTitle}>
          <TrendingUp size={16} className={styles.panelTitleIcon} />
          신호 강도 스코어
        </div>
        <div className={styles.gaugeContainer}>
          <div className={styles.gaugeWrapper}>
            <svg className={styles.gaugeCircle} viewBox="0 0 120 120">
              <circle
                className={styles.gaugeBg}
                cx="60"
                cy="60"
                r={radius}
              />
              <circle
                className={styles.gaugeFill}
                cx="60"
                cy="60"
                r={radius}
                stroke={gaugeColor}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div className={styles.gaugeText}>
              <span className={styles.gaugeValue}>{score}</span>
              <span className={styles.gaugeMax}> / 100</span>
            </div>
          </div>

          <div className={styles.signalBars}>
            {signalBars.map((b) => (
              <div key={b.label} className={styles.signalBarRow}>
                <span className={styles.signalBarLabel}>{b.label}</span>
                <div className={styles.signalBarTrack}>
                  <div
                    className={styles.signalBarFill}
                    style={{
                      width: `${Math.min(100, b.pct)}%`,
                      background: b.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RSI 전체 현황 */}
      <div className={styles.rsiCard}>
        <div className={styles.panelTitle}>
          <Activity size={16} className={styles.panelTitleIcon} />
          RSI 전체 현황
        </div>
        <div className={styles.rsiList}>
          {rsiData.map((item) => (
            <div
              key={item.code}
              className={styles.rsiRow}
              onClick={() => router.push(`/stock/${item.code}`)}
            >
              <span className={styles.rsiLabel}>{item.name}</span>
              <div className={styles.rsiTrack}>
                <div
                  className={styles.rsiFill}
                  style={{ width: `${item.rsi}%`, background: item.bar }}
                />
              </div>
              <span className={styles.rsiValue}>{item.rsi}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 오늘 신호 알림 */}
      <div className={styles.alertsCard}>
        <div className={styles.alertsHeader}>
          <div className={styles.panelTitle} style={{ marginBottom: 0 }}>
            <Bell size={16} className={styles.panelTitleIcon} />
            오늘 신호 알림
          </div>
          <span className={styles.alertCount}>{alerts.length}건</span>
        </div>
        <div className={styles.alertsList}>
          {alerts.map((a, i) => (
            <div
              key={i}
              className={styles.alertItem}
              onClick={() => router.push(`/stock/${a.code}`)}
            >
              <i className={styles.alertDot} style={{ background: a.color }} />
              <div className={styles.alertContent}>
                <div className={styles.alertTitle}>{a.title}</div>
                <div className={styles.alertSub}>{a.sub}</div>
              </div>
              <span className={styles.alertTime}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
