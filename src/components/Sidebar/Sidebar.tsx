"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useInvestPulseData } from "@/lib/use-investpulse-data";
import { classifyStockSignal, getMarketHref, getMarketPrefix, getSignalTone } from "@/shared/lib/market-display";
import { 
  BarChart3, 
  LineChart, 
  LayoutGrid, 
  Globe, 
  Diamond, 
  LibrarySquare,
  Activity,
  Heart
} from "lucide-react";
import styles from "./Sidebar.module.scss";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data } = useInvestPulseData();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const [currentTime, setCurrentTime] = useState(() => new Date());

  const onLogoClick = () => {
    router.push("/");
  };

  const marketParam = searchParams?.get("market");

  const isHomeActive = pathname === "/" && !marketParam;
  const isMarketActive = (market: "국내" | "해외" | "BTC" | "ETF") => pathname === "/" && marketParam === market;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // 간단한 시장 영업시간 판별 (09:00 ~ 15:30 KST)
  const isMarketOpen = (() => {
    const formatter = new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });
    const parts = formatter.formatToParts(currentTime);
    const hour = parseInt(parts.find(p => p.type === "hour")?.value || "0", 10);
    const minute = parseInt(parts.find(p => p.type === "minute")?.value || "0", 10);
    const totalMinutes = hour * 60 + minute;
    return totalMinutes >= 9 * 60 && totalMinutes <= 15 * 60 + 30;
  })();

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
        <span>{isMarketOpen ? "시장 열림" : "시장 마감"}</span>
        <span className={styles.statusDotSep}>·</span>
        <span className={styles.statusTime}>KST {timeString}</span>
      </div>

      <div className={styles.scrollArea}>
        {/* 메인 섹션 */}
        <section className={styles.section}>
          <p className={styles.sectionTitle}>메인</p>
          <nav className={styles.menu}>
            <Link href="/" className={`${styles.menuItem} ${isHomeActive ? styles.active : ""}`}>
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
            <Link href={getMarketHref("국내")} className={`${styles.menuItem} ${isMarketActive("국내") ? styles.active : ""}`}>
              <LayoutGrid size={16} className={styles.marketIcon} />
              <span>국내 주식</span>
            </Link>
            <Link href={getMarketHref("해외")} className={`${styles.menuItem} ${isMarketActive("해외") ? styles.active : ""}`}>
              <Globe size={16} className={styles.marketIcon} />
              <span>해외 주식</span>
            </Link>
            <Link href={getMarketHref("BTC")} className={`${styles.menuItem} ${isMarketActive("BTC") ? styles.active : ""}`}>
              <Diamond size={16} className={styles.marketIcon} />
              <span>BTC</span>
            </Link>
            <Link href={getMarketHref("ETF")} className={`${styles.menuItem} ${isMarketActive("ETF") ? styles.active : ""}`}>
              <LibrarySquare size={16} className={styles.marketIcon} />
              <span>ETF</span>
            </Link>
          </nav>
        </section>

        <hr className={styles.divider} />

        {/* 관심 종목 섹션 */}
        <section className={styles.section}>
          <p className={styles.sectionTitle}>관심종목</p>
          <div className={styles.popularList}>
            {favorites.length === 0 && (
              <p style={{ fontSize: 12, color: "#7b8fa6", padding: "8px 12px" }}>
                관심종목이 없습니다.
              </p>
            )}
            {favorites.map((code) => {
              const stock = data?.stocks.find((s) => s.code === code);
              if (!stock) return null;
              
              const signalTone = getSignalTone(classifyStockSignal(stock));
              const prefix = getMarketPrefix(stock.market);

              return (
                <div key={stock.code} className={styles.popularItem} style={{ cursor: "pointer" }} onClick={() => router.push(`/stock/${stock.code}`)}>
                  <div className={styles.popularLeft}>
                    <Heart 
                      size={14} 
                      fill={isFavorite(stock.code) ? "#7b8fa6" : "transparent"} 
                      color="#7b8fa6" 
                      className={styles.heartIcon}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(stock.code);
                      }}
                      />
                    <i className={styles.colorDot} style={{ background: signalTone.dot }} />
                    <div className={styles.popularInfo}>
                      <span className={styles.popularName}>{stock.name}</span>
                      <span className={styles.popularCode}>{stock.code}</span>
                    </div>
                  </div>
                  <div className={styles.popularRight}>
                    <span className={styles.popularPrice}>{prefix}{stock.price.toLocaleString()}</span>
                    <span className={`${styles.popularChange} ${stock.change >= 0 ? styles.up : styles.down}`}>
                      {stock.change >= 0 ? "+" : ""}{stock.change}%
                    </span>
                  </div>
                </div>
              );
            })}
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
