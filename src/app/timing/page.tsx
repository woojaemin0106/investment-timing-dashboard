import { Suspense } from "react";
import TimingAnalysis from "@/components/TimingAnalysis/TimingAnalysis";

export default function TimingPage() {
  return (
    <Suspense fallback={<div>데이터를 불러오는 중...</div>}>
      <TimingAnalysis />
    </Suspense>
  );
}
