import { useRouter } from "next/navigation";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { mockIndices, mockExchangeRate, mockPortfolioHistory } from "@/mocks/investpulse-data";
import styles from "./OverviewTab.module.scss";

type ChartRange = "1D" | "1W" | "1M" | "3M" | "1Y";
type ChartTarget = "USD/KRW" | "KOSPI" | "NASDAQ" | "S&P 500";

type ActiveChartSectionProps = {
  activeChart: { title: string; value: number; change: number; prev: number; prefix: string };
  chartRanges: ChartRange[];
  chartRange: ChartRange;
  setChartRange: (r: ChartRange) => void;
  chartTarget: ChartTarget;
  setChartTarget: (t: ChartTarget) => void;
  formatChange: (val: number) => string;
  formatKRW: (val: number) => string;
};

export default function ActiveChartSection({
  activeChart,
  chartRanges,
  chartRange,
  setChartRange,
  chartTarget,
  setChartTarget,
  formatChange,
  formatKRW,
}: ActiveChartSectionProps) {
  const router = useRouter();

  const handleChartClick = () => {
    switch (chartTarget) {
      case "KOSPI":
        router.push("/stock/KODEX200"); // KOSPI 대표 ETF
        break;
      case "NASDAQ":
        router.push("/stock/QQQ"); // NASDAQ 대표 ETF
        break;
      case "S&P 500":
        router.push("/stock/SPY"); // S&P 500 대표 ETF
        break;
      case "USD/KRW":
        // 환율은 클릭 시 상세페이지 이동 없음
        break;
    }
  };

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div>
          <h3 className={styles.chartTitle}>{activeChart.title}</h3>
          <div className={styles.chartStats}>
            <span className={styles.chartBigValue}>
              {activeChart.prefix}{activeChart.value.toLocaleString()}
            </span>
            <span className={`${styles.chartChangeTag} ${activeChart.change >= 0 ? styles.up : styles.down}`}>
              {activeChart.change >= 0 ? "+" : ""}{activeChart.change}%
            </span>
            <span className={styles.chartMeta}>
              전일 {activeChart.prefix}{activeChart.prev.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
          </div>
        </div>
        <div className={styles.chartRanges}>
          {chartRanges.map((r) => (
            <button
              key={r}
              type="button"
              className={`${styles.rangeBtn} ${chartRange === r ? styles.rangeBtnActive : ""}`}
              onClick={() => setChartRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      
      <div 
        className={styles.chartArea} 
        style={{ cursor: chartTarget === "USD/KRW" ? "default" : "pointer" }} 
        onClick={chartTarget === "USD/KRW" ? undefined : handleChartClick}
      >
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={mockPortfolioHistory}>
            <defs>
              <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3048" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#4d6278", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#4d6278", fontSize: 11 }}
              tickFormatter={(v: number) => `₩${(v / 1000000).toFixed(1)}M`}
            />
            <Tooltip
              contentStyle={{
                background: "#1a2744",
                border: "1px solid #2a3a5a",
                borderRadius: 8,
                color: "#e4eaf2",
                fontSize: 12,
              }}
              formatter={(v) => [formatKRW(Number(v)), "지표"]}
            />
            <Area
              dataKey="value"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#portfolioGrad)"
              name="지표"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Mini stats row below chart */}
      <div className={styles.miniStatsRow}>
        <div 
          className={`${styles.miniStat} ${chartTarget === "KOSPI" ? styles.activeStat : ""}`} 
          onClick={() => setChartTarget("KOSPI")}
        >
          <span className={styles.miniStatLabel}>KOSPI</span>
          <span className={styles.miniStatValue}>{mockIndices.kospi.value.toLocaleString()}</span>
          <span className={`${styles.miniStatChange} ${mockIndices.kospi.change >= 0 ? styles.up : styles.down}`}>
            {mockIndices.kospi.change >= 0 ? "▲" : "▼"} {formatChange(mockIndices.kospi.change)}
          </span>
        </div>
        <div 
          className={`${styles.miniStat} ${chartTarget === "NASDAQ" ? styles.activeStat : ""}`} 
          onClick={() => setChartTarget("NASDAQ")}
        >
          <span className={styles.miniStatLabel}>NASDAQ</span>
          <span className={styles.miniStatValue}>{mockIndices.nasdaq.value.toLocaleString()}</span>
          <span className={`${styles.miniStatChange} ${mockIndices.nasdaq.change >= 0 ? styles.up : styles.down}`}>
            {mockIndices.nasdaq.change >= 0 ? "▲" : "▼"} {formatChange(mockIndices.nasdaq.change)}
          </span>
        </div>
        <div 
          className={`${styles.miniStat} ${chartTarget === "S&P 500" ? styles.activeStat : ""}`} 
          onClick={() => setChartTarget("S&P 500")}
        >
          <span className={styles.miniStatLabel}>S&P 500</span>
          <span className={styles.miniStatValue}>5,280.1</span>
          <span className={`${styles.miniStatChange} ${styles.up}`}>▲ +0.6%</span>
        </div>
        <div 
          className={`${styles.miniStat} ${chartTarget === "USD/KRW" ? styles.activeStat : ""}`} 
          onClick={() => setChartTarget("USD/KRW")}
        >
          <span className={styles.miniStatLabel}>달러/원</span>
          <span className={styles.miniStatValue}>{mockExchangeRate.usdkrw.toLocaleString()}</span>
          <span className={`${styles.miniStatChange} ${mockExchangeRate.usdChange >= 0 ? styles.up : styles.down}`}>
            {mockExchangeRate.usdChange >= 0 ? "▲" : "▼"} {formatChange(mockExchangeRate.usdChange)}
          </span>
        </div>
      </div>
    </div>
  );
}
