import { Suspense } from "react";
import OverviewTab from "@/components/OverviewTab/OverviewTab";

export default function Home() {
  return (
    <Suspense fallback={<div>데이터를 불러오는 중...</div>}>
      <OverviewTab />
    </Suspense>
  );
}
