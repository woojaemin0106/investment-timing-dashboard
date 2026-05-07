import { SignalType } from "@/types";

export const signalLabels: Record<SignalType, string> = {
  all: "전체",
  success: "과매도",
  warning: "중립",
  danger: "과매수",
};

export const getStocksApiUrl = () => {
  return process.env.NEXT_PUBLIC_STOCKS_API_URL || "/api/stocks";
};
