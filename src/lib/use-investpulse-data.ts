"use client";

import { useEffect, useState } from "react";
import { InvestPulsePayload } from "@/types";
import { getStocksApiUrl } from "@/lib/investpulse-config";
import { parseInvestPulsePayload } from "@/shared/lib/investpulse-schema";

interface UseInvestPulseDataResult {
  data: InvestPulsePayload | null;
  loading: boolean;
  error: string | null;
}

export const useInvestPulseData = (): UseInvestPulseDataResult => {
  const [data, setData] = useState<InvestPulsePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(getStocksApiUrl(), { cache: "no-store" });
        if (!response.ok) {
          throw new Error("데이터를 불러오지 못했습니다.");
        }
        const rawPayload = await response.json().catch(() => null);
        const payload = parseInvestPulsePayload(rawPayload);
        if (!payload) {
          throw new Error("API 응답 형식이 올바르지 않습니다.");
        }
        if (isMounted) {
          setData(payload);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError instanceof Error ? fetchError.message : "알 수 없는 오류가 발생했습니다.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
};
