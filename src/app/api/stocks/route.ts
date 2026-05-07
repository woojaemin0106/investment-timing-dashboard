import { NextResponse } from "next/server";
import {
  mockChartDataByCode,
  mockDefaultChartData,
  mockStocks,
} from "@/mocks/investpulse-data";

export async function GET() {
  return NextResponse.json({
    stocks: mockStocks,
    chartDataByCode: mockChartDataByCode,
    defaultChartData: mockDefaultChartData,
  });
}
