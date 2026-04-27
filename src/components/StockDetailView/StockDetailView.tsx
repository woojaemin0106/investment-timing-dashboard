"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Stock } from "@/types";
import { useInvestPulseData } from "@/lib/use-investpulse-data";
import styles from "./StockDetailView.module.scss";

type TimeFrame = "분" | "시" | "일" | "주" | "월";
type ChartType = "캔들" | "라인" | "영역";

const timeFrameOptions: TimeFrame[] = ["분", "시", "일", "주", "월"];
const chartTypeOptions: ChartType[] = ["캔들", "라인", "영역"];

interface Props {
  code: string;
  stock?: Stock;
}

interface HistoricalPoint {
  date: string;
  price: number;
  open: number;
  close: number;
  high: number;
  low: number;
  ma5: number;
  ma20: number;
}

const CHART_GRID_COLOR = "#1e3048";
const CHART_AXIS_TICK = { fill: "#4d6278", fontSize: 11 };
const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: "#1a2744",
    border: "1px solid #2a3a5a",
    borderRadius: 8,
    color: "#e4eaf2",
    fontSize: 12,
  },
};

const generateHistoricalData = (currentPrice: number, timeFrame: TimeFrame): HistoricalPoint[] => {
  const dataPoints: Record<TimeFrame, number> = {
    분: 60,
    시: 24,
    일: 30,
    주: 52,
    월: 12,
  };

  const count = dataPoints[timeFrame];
  const data: HistoricalPoint[] = [];

  for (let i = 0; i < count; i += 1) {
    const date = new Date();
    let dateStr = "";

    switch (timeFrame) {
      case "분":
        date.setMinutes(date.getMinutes() - (count - 1 - i));
        dateStr = `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
        break;
      case "시":
        date.setHours(date.getHours() - (count - 1 - i));
        dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}시`;
        break;
      case "일":
        date.setDate(date.getDate() - (count - 1 - i));
        dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
        break;
      case "주":
        date.setDate(date.getDate() - (count - 1 - i) * 7);
        dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
        break;
      case "월":
        date.setMonth(date.getMonth() - (count - 1 - i));
        dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
      default:
        dateStr = "";
    }

    const volatility = timeFrame === "분" ? 0.005 : timeFrame === "시" ? 0.01 : 0.03;
    const price = currentPrice * (1 + (Math.random() - 0.5) * volatility);

    data.push({
      date: dateStr,
      price: Math.round(price),
      open: Math.round(price * 0.99),
      close: Math.round(price * 1.01),
      high: Math.round(price * 1.02),
      low: Math.round(price * 0.98),
      ma5: Math.round(price * 1.005),
      ma20: Math.round(price * 0.995),
    });
  }

  return data;
};

export default function StockDetailView({ code, stock: initialStock }: Props) {
  const router = useRouter();
  const { data, loading, error } = useInvestPulseData();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("일");
  const [chartType, setChartType] = useState<ChartType>("영역");
  const formatPrice = (value: number) => `₩${Math.round(value).toLocaleString()}`;
  const stock = useMemo(
    () => initialStock ?? data?.stocks.find((item) => item.code === code),
    [code, data?.stocks, initialStock],
  );
  const historicalData = useMemo(() => generateHistoricalData(stock?.price ?? 100000, timeFrame), [stock?.price, timeFrame]);

  if (!stock && loading) {
    return <p className={styles.state}>데이터를 불러오는 중...</p>;
  }

  if (!stock && error) {
    return <p className={styles.state}>오류: {error}</p>;
  }

  if (!stock) {
    return <p className={styles.state}>종목을 찾을 수 없습니다.</p>;
  }

  const signalConfig =
    stock.signal === "success"
      ? {
          className: styles.success,
          icon: "🟢",
          title: "매수 적기",
          description: "RSI가 낮은 수준으로 저점 구간에 진입했습니다. 장기 투자에 적합한 시기입니다.",
        }
      : stock.signal === "warning"
        ? {
            className: styles.warning,
            icon: "🟡",
            title: "주의 관찰",
            description: "현재 중립 구간입니다. 시장 상황을 지켜보며 신중한 접근이 필요합니다.",
          }
        : {
            className: styles.danger,
            icon: "🔴",
            title: "과매수 구간",
            description: "RSI가 높은 수준으로 과매수 구간입니다. 단기 조정 가능성을 염두에 두세요.",
          };

  const stats = [
    { label: "거래량", value: stock.volume, highlight: "" },
    {
      label: "RSI",
      value: String(stock.rsi),
      highlight: stock.rsi > 70 ? "valueDanger" : stock.rsi < 30 ? "valueSuccess" : "valueNeutral",
    },
    { label: "52주 최고", value: formatPrice(stock.price * 1.25), highlight: "" },
    { label: "52주 최저", value: formatPrice(stock.price * 0.75), highlight: "" },
  ];

  const technicalIndicators = [
    {
      name: "RSI (14)",
      value: String(stock.rsi),
      status: stock.rsi > 70 ? "과매수" : stock.rsi < 30 ? "과매도" : "중립",
    },
    { name: "MACD", value: "+145", status: "상승" },
    { name: "Stochastic", value: "68.5", status: "중립" },
    { name: "Bollinger Band", value: "중간 밴드", status: "중립" },
  ];

  return (
    <section className={styles.detailPage}>
      <button type="button" onClick={() => router.back()} className={styles.backButton}>
        <ArrowLeft size={16} />
        홈으로 돌아가기
      </button>

      <header className={styles.stockHeader}>
        <div className={styles.titleSection}>
          <h2>{stock.name}</h2>
          <span className={styles.code}>{stock.code}</span>
          <p>
            <span className={styles.category}>
              {stock.category} · {stock.market}
            </span>
          </p>
        </div>
        <div className={styles.priceSection}>
          <div className={styles.currentPrice}>{formatPrice(stock.price)}</div>
          <div className={stock.change > 0 ? styles.changeUp : styles.changeDown}>
            {stock.change >= 0 ? "+" : ""}
            {stock.change}%
          </div>
        </div>
      </header>

      <div className={`${styles.signalBox} ${signalConfig.className}`}>
        <div className={styles.signalIcon}>{signalConfig.icon}</div>
        <div className={styles.signalContent}>
          <h4>{signalConfig.title}</h4>
          <p>{signalConfig.description}</p>
        </div>
      </div>

      <section className={styles.statsGrid}>
        {stats.map((stat) => (
          <article key={stat.label} className={styles.statCard}>
            <div className={styles.label}>{stat.label}</div>
            <div className={`${styles.value} ${stat.highlight ? styles[stat.highlight] : ""}`}>{stat.value}</div>
          </article>
        ))}
      </section>

      <section className={styles.chartSection}>
        <div className={styles.chartHeader}>
          <h3>가격 추이</h3>
          <div className={styles.chartControls}>
            <div className={styles.tabs}>
              {timeFrameOptions.map((frame) => (
                <button
                  key={frame}
                  type="button"
                  onClick={() => setTimeFrame(frame)}
                  className={timeFrame === frame ? styles.active : ""}
                >
                  {frame}
                </button>
              ))}
            </div>
            <div className={styles.tabs}>
              {chartTypeOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setChartType(type)}
                  className={chartType === type ? styles.active : ""}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.chartArea}>
          <ResponsiveContainer width="100%" height={380}>
            {chartType === "영역" && (
              <AreaChart data={historicalData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={CHART_AXIS_TICK} />
                <YAxis axisLine={false} tickLine={false} tick={CHART_AXIS_TICK} />
                <Tooltip {...CHART_TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ color: "#7b8fa6", fontSize: 12 }} />
                <Area dataKey="price" stroke="#10b981" fill="url(#colorPrice)" name="현재가" />
                <Line dataKey="ma5" stroke="#3b82f6" name="5일 이동평균" dot={false} />
                <Line dataKey="ma20" stroke="#f59e0b" name="20일 이동평균" dot={false} />
              </AreaChart>
            )}

            {chartType === "라인" && (
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={CHART_AXIS_TICK} />
                <YAxis axisLine={false} tickLine={false} tick={CHART_AXIS_TICK} />
                <Tooltip {...CHART_TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ color: "#7b8fa6", fontSize: 12 }} />
                <Line dataKey="price" stroke="#10b981" strokeWidth={2.5} name="현재가" dot={false} />
                <Line dataKey="ma5" stroke="#3b82f6" name="5일 이동평균" dot={false} />
                <Line dataKey="ma20" stroke="#f59e0b" name="20일 이동평균" dot={false} />
              </LineChart>
            )}

            {chartType === "캔들" && (
              <ComposedChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={CHART_AXIS_TICK} />
                <YAxis axisLine={false} tickLine={false} tick={CHART_AXIS_TICK} />
                <Tooltip {...CHART_TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ color: "#7b8fa6", fontSize: 12 }} />
                <Bar dataKey="close" fill="#10b981" name="종가" />
                <Line dataKey="ma5" stroke="#3b82f6" name="5일 이동평균" dot={false} />
                <Line dataKey="ma20" stroke="#f59e0b" name="20일 이동평균" dot={false} />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      </section>

      <section className={styles.technicalIndicators}>
        <h3>기술적 지표</h3>
        <div className={styles.indicatorsGrid}>
          {technicalIndicators.map((indicator) => (
            <article key={indicator.name} className={styles.indicatorCard}>
              <div className={styles.indicatorInfo}>
                <div className={styles.label}>{indicator.name}</div>
                <div className={styles.value}>{indicator.value}</div>
              </div>
              <div
                className={`${styles.status} ${
                  indicator.status === "과매수" || indicator.status === "과매도"
                    ? styles.statusDanger
                    : indicator.status === "상승"
                      ? styles.statusSuccess
                      : styles.statusNeutral
                }`}
              >
                {indicator.status}
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
