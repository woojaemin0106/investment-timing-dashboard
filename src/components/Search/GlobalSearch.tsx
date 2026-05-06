"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useInvestPulseData } from "@/lib/use-investpulse-data";
import styles from "./GlobalSearch.module.scss";

interface Props {
  keyword: string;
  setKeyword: (kw: string) => void;
  placeholder?: string;
}

export default function GlobalSearch({ keyword, setKeyword, placeholder = "종목명 또는 코드 검색..." }: Props) {
  const router = useRouter();
  const { data } = useInvestPulseData();
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo(() => {
    const allStocks = data?.stocks ?? [];
    if (!keyword.trim()) return [];
    const kw = keyword.toLowerCase();
    return allStocks.filter(
      (s) => s.name.toLowerCase().includes(kw) || s.code.toLowerCase().includes(kw)
    ).slice(0, 8); // 최대 8개까지만 표시
  }, [data, keyword]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    setIsFocused(false);
    setKeyword("");
    router.push(`/stock/${code}`);
  };

  const showDropdown = isFocused && keyword.trim().length > 0;

  return (
    <div className={styles.searchContainer} ref={containerRef}>
      <div className={styles.inputWrapper}>
        <Search size={14} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder={placeholder}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />
        {keyword && (
          <button 
            type="button" 
            className={styles.clearBtn} 
            onClick={() => {
              setKeyword("");
              setIsFocused(true); // 계속 검색할 수 있도록 포커스 유지 느낌
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className={styles.dropdown}>
          {searchResults.length > 0 ? (
            <div className={styles.resultList}>
              <div className={styles.listHeader}>종목</div>
              {searchResults.map((stock) => {
                const prefix = stock.market === "국내" ? "₩" : "$";
                const isUp = stock.change >= 0;
                
                return (
                  <button
                    key={stock.code}
                    type="button"
                    className={styles.resultItem}
                    onClick={() => handleSelect(stock.code)}
                  >
                    <div className={styles.stockInfo}>
                      <div className={styles.logoCircle}>
                        {stock.name.charAt(0)}
                      </div>
                      <div className={styles.nameCode}>
                        <span className={styles.name}>
                          {/* 검색어 하이라이트 처리는 단순화를 위해 생략하거나 나중에 추가 가능 */}
                          {stock.name}
                        </span>
                        <span className={styles.code}>{stock.code}</span>
                      </div>
                    </div>
                    <div className={styles.priceInfo}>
                      <span className={styles.price}>
                        {prefix}{stock.price.toLocaleString()}
                      </span>
                      <span className={`${styles.change} ${isUp ? styles.up : styles.down}`}>
                        {isUp ? "+" : ""}{stock.change.toFixed(2)}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyResult}>
              &quot;{keyword}&quot; 검색 결과가 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
