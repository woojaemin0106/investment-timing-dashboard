import { PricePoint, Stock } from "@/types";

export const mockStocks: Stock[] = [
  {
    code: "005930",
    name: "삼성전자",
    price: 71500,
    change: 2.3,
    volume: "25.5M",
    rsi: 65,
    signal: "warning",
    category: "반도체",
    market: "국내",
    high52w: 79200,
    low52w: 61200,
  },
  {
    code: "000660",
    name: "SK하이닉스",
    price: 186200,
    change: 1.7,
    volume: "8.9M",
    rsi: 74,
    signal: "danger",
    category: "반도체",
    market: "국내",
    high52w: 192000,
    low52w: 118500,
  },
  {
    code: "373220",
    name: "LG에너지솔루션",
    price: 382500,
    change: 0.9,
    volume: "4.2M",
    rsi: 42,
    signal: "warning",
    category: "배터리",
    market: "국내",
    high52w: 520000,
    low52w: 356000,
  },
  {
    code: "005380",
    name: "현대차",
    price: 224000,
    change: -0.5,
    volume: "8.1M",
    rsi: 31,
    signal: "success",
    category: "자동차",
    market: "국내",
    high52w: 268000,
    low52w: 170000,
  },
  {
    code: "035720",
    name: "카카오",
    price: 52300,
    change: -1.1,
    volume: "11.3M",
    rsi: 27,
    signal: "success",
    category: "플랫폼",
    market: "국내",
    high52w: 69800,
    low52w: 42100,
  },
  {
    code: "AAPL",
    name: "Apple",
    price: 203.41,
    change: -0.9,
    volume: "52.1M",
    rsi: 49,
    signal: "warning",
    category: "IT",
    market: "해외",
    high52w: 220.2,
    low52w: 164.1,
  },
  {
    code: "TSLA",
    name: "Tesla",
    price: 187.63,
    change: -3.2,
    volume: "96.4M",
    rsi: 28,
    signal: "success",
    category: "전기차",
    market: "해외",
    high52w: 289.6,
    low52w: 138.8,
  },
  {
    code: "NVDA",
    name: "NVIDIA",
    price: 875.62,
    change: 2.1,
    volume: "88.7M",
    rsi: 78,
    signal: "danger",
    category: "반도체",
    market: "해외",
    high52w: 974.0,
    low52w: 393.0,
  },
  {
    code: "MSFT",
    name: "Microsoft",
    price: 412.68,
    change: 0.4,
    volume: "21.2M",
    rsi: 55,
    signal: "warning",
    category: "소프트웨어",
    market: "해외",
    high52w: 430.8,
    low52w: 366.5,
  },
  {
    code: "AMZN",
    name: "Amazon",
    price: 189.63,
    change: 1.8,
    volume: "44.5M",
    rsi: 38,
    signal: "success",
    category: "이커머스",
    market: "해외",
    high52w: 201.2,
    low52w: 144.1,
  },
  {
    code: "BTC-USD",
    name: "Bitcoin",
    price: 94650,
    change: 4.1,
    volume: "35.2B",
    rsi: 72,
    signal: "danger",
    category: "가상자산",
    market: "BTC",
    high52w: 98900,
    low52w: 38600,
  },
  {
    code: "ETH-USD",
    name: "Ethereum",
    price: 3240,
    change: 1.2,
    volume: "18.4B",
    rsi: 56,
    signal: "warning",
    category: "가상자산",
    market: "BTC",
    high52w: 4050,
    low52w: 1740,
  },
];

export const mockPortfolio = {
  totalValue: 28400000,
  totalChange: 5.2,
  holdingCount: 3,
  watchlistCount: 2,
  profit: 885000,
  highestValue: 28400000,
};

export const mockIndices = {
  kospi: { value: 2648.3, change: 0.8 },
  nasdaq: { value: 18340.1, change: 1.2 },
};

export const mockExchangeRate = {
  usdkrw: 1328.4,
  usdChange: -0.3,
  prevClose: 1332.4,
};

export const mockPortfolioHistory = (() => {
  const data = [];
  const baseValue = 27500000;
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const noise = (Math.random() - 0.4) * 300000;
    const trend = ((30 - i) / 30) * 900000;
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      value: Math.round(baseValue + trend + noise),
    });
  }
  return data;
})();

export const mockBtcHistory = (() => {
  const data = [];
  const base = 90000;
  for (let i = 20; i >= 0; i--) {
    const noise = (Math.random() - 0.3) * 3000;
    const trend = ((20 - i) / 20) * 5000;
    data.push({
      date: `${i}`,
      price: Math.round(base + trend + noise),
    });
  }
  return data;
})();

export const mockEthHistory = (() => {
  const data = [];
  const base = 3000;
  for (let i = 20; i >= 0; i--) {
    const noise = (Math.random() - 0.3) * 200;
    const trend = ((20 - i) / 20) * 300;
    data.push({
      date: `${i}`,
      price: Math.round(base + trend + noise),
    });
  }
  return data;
})();

export const mockChartDataByCode: Record<string, PricePoint[]> = {
  "005930": [
    { time: "09:00", price: 70100, open: 69900, high: 70300, low: 69600, close: 70100, volume: 930000 },
    { time: "10:00", price: 70600, open: 70100, high: 70800, low: 70000, close: 70600, volume: 1200000 },
    { time: "11:00", price: 71200, open: 70600, high: 71300, low: 70500, close: 71200, volume: 1490000 },
    { time: "12:00", price: 71500, open: 71200, high: 71700, low: 71100, close: 71500, volume: 1120000 },
  ],
};

export const mockDefaultChartData: PricePoint[] = [
  { time: "1", price: 100, open: 98, high: 102, low: 97, close: 100, volume: 1200 },
  { time: "2", price: 104, open: 100, high: 106, low: 99, close: 104, volume: 1800 },
  { time: "3", price: 101, open: 104, high: 105, low: 99, close: 101, volume: 1400 },
  { time: "4", price: 108, open: 101, high: 109, low: 100, close: 108, volume: 2000 },
  { time: "5", price: 106, open: 108, high: 109, low: 105, close: 106, volume: 1700 },
];
