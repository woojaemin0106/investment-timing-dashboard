"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, BarChart3, LineChart } from "lucide-react";
import styles from "./Sidebar.module.scss";
import { SignalType } from "@/types";

const signalItems: { label: string; signal: Exclude<SignalType, "all">; emoji: string }[] = [
  { label: "매수 적기", signal: "success", emoji: "🟢" },
  { label: "주의 관찰", signal: "warning", emoji: "🟡" },
  { label: "과매수", signal: "danger", emoji: "🔴" },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const onLogoClick = () => {
    router.push("/");
  };

  const onSignalClick = (signal: Exclude<SignalType, "all">) => {
    router.push(`/?signal=${signal}`);
  };

  return (
    <aside className={styles.sidebar}>
      <button type="button" className={styles.logo} onClick={onLogoClick}>
        <span className={styles.logoIcon}>
          <LineChart size={16} />
        </span>
        <span className={styles.logoText}>
          InvestPulse
          <small>투자 타이밍 분석</small>
        </span>
      </button>

      <nav className={styles.menu}>
        <Link href="/" className={`${styles.menuItem} ${pathname === "/" ? styles.active : ""}`}>
          <BarChart3 size={16} />
          <span>전체 종목 현황</span>
        </Link>
      </nav>

      <section className={styles.signalSection}>
        <p className={styles.sectionTitle}>투자 신호</p>
        {signalItems.map((item) => (
          <button
            key={item.signal}
            type="button"
            className={styles.signalButton}
            onClick={() => onSignalClick(item.signal)}
          >
            <span>{item.emoji}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </section>

      <section className={styles.analysisCard}>
        <span className={styles.analysisIcon}>
          <Activity size={14} />
        </span>
        <div>
          <p>실시간 분석</p>
          <small>모니터링 중</small>
        </div>
      </section>
    </aside>
  );
}
