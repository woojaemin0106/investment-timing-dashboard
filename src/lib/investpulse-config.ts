import { SignalType } from "@/types";

export const signalLabels: Record<SignalType, string> = {
  all: "전체",
  success: "매수 적기",
  warning: "주의 관찰",
  danger: "과매수",
};

export const getStocksApiUrl = () => {
  return process.env.NEXT_PUBLIC_STOCKS_API_URL || "/api/stocks";
};
