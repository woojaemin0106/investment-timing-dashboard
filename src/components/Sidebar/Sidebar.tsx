"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  BarChart3, 
  LineChart, 
  LayoutGrid, 
  Globe, 
  Diamond, 
  LibrarySquare,
  Activity
} from "lucide-react";
import styles from "./Sidebar.module.scss";

// 사이드 바 관심종목 (인기종목) 하드코딩 데이터
const popularStocks = [
  { name: "삼성전자", code: "005930", price: "₩71,500", change: "+2.3%", up: true, color: "#00d68f" },
  { name: "Bitcoin", code: "BTC-USD", price: "$94,650", change: "+4.1%", up: true, color: "#f5a623" },
  { name: "Tesla", code: "TSLA", price: "$187", change: "-3.2%", up: false, color: "#ff4d6a" },
  { name: "Apple", code: "AAPL", price: "$203", change: "-0.9%", up: false, color: "#3b82f6" },
  { name: "Ethereum", code: "ETH-USD", price: "$3,240", change: "+1.2%", up: true, color: "#8b5cf6" },
  { name: "NVIDIA", code: "NVDA", price: "$875", change: "+2.1%", up: true, color: "#00d68f" },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const onLogoClick = () => {
    router.push("/");
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
      {/* 상단 시장 열림 상태 */}
      <div className={styles.marketStatus}>
        <span className={styles.statusDot}></span>
        <span>시장 열림</span>
        <span className={styles.statusDotSep}>·</span>
        <span className={styles.statusTime}>KST 15:33</span>
      </div>

      <div className={styles.scrollArea}>
        {/* 메인 섹션 */}
        <section className={styles.section}>
          <p className={styles.sectionTitle}>메인</p>
          <nav className={styles.menu}>
            <Link href="/" className={`${styles.menuItem} ${pathname === "/" ? styles.active : ""}`}>
              <BarChart3 size={16} />
              <span>전체 종목 현황</span>
            </Link>
            <Link href="/timing" className={styles.menuItem}>
              <LineChart size={16} />
              <span>타이밍 분석</span>
              <span className={styles.badge}>3</span>
            </Link>
          </nav>
        </section>

        <hr className={styles.divider} />

        {/* 마켓 섹션 */}
        <section className={styles.section}>
          <p className={styles.sectionTitle}>마켓</p>
          <nav className={styles.menu}>
            <Link href="/?market=국내" className={styles.menuItem}>
              <LayoutGrid size={16} className={styles.marketIcon} />
              <span>국내 주식</span>
            </Link>
            <Link href="/?market=해외" className={styles.menuItem}>
              <Globe size={16} className={styles.marketIcon} />
              <span>해외 주식</span>
            </Link>
            <Link href="/?market=BTC" className={styles.menuItem}>
              <Diamond size={16} className={styles.marketIcon} />
              <span>BTC</span>
            </Link>
            <Link href="/market/etf" className={styles.menuItem}>
              <LibrarySquare size={16} className={styles.marketIcon} />
              <span>ETF</span>
            </Link>
          </nav>
        </section>

        <hr className={styles.divider} />

        {/* 인기 종목 섹션 */}
        <section className={styles.section}>
          <p className={styles.sectionTitle}>인기종목</p>
          <div className={styles.popularList}>
            {popularStocks.map((stock) => (
              <div key={stock.code} className={styles.popularItem}>
                <div className={styles.popularLeft}>
                  <i className={styles.colorDot} style={{ background: stock.color }} />
                  <div className={styles.popularInfo}>
                    <span className={styles.popularName}>{stock.name}</span>
                    <span className={styles.popularCode}>{stock.code}</span>
                  </div>
                </div>
                <div className={styles.popularRight}>
                  <span className={styles.popularPrice}>{stock.price}</span>
                  <span className={`${styles.popularChange} ${stock.up ? styles.up : styles.down}`}>
                    {stock.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 실시간 분석 (기존 유지) */}
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
