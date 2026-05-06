"use client";

import { Heart } from "lucide-react";
import { Stock } from "@/types";
import { useFavorites } from "@/contexts/FavoritesContext";
import {
  classifyStockSignal,
  getSignalTone,
  getMarketPrefix,
} from "@/shared/lib/market-display";
import styles from "./TimingAnalysis.module.scss";

interface Props {
  stock: Stock;
  isSelected: boolean;
  onClick: () => void;
}

function generateComment(stock: Stock): string {
  const signal = classifyStockSignal(stock);
  if (signal === "success") {
    return `RSI 지표가 ${stock.rsi}로, MACD 골든크로스 발생. 단기 반등이 기대되는 구간입니다.`;
  }
  if (signal === "danger") {
    return `RSI ${stock.rsi}로 과매수 구간. 단기 조정 가능성을 염두에 두세요.`;
  }
  return `RSI ${stock.rsi}로 중립 구간. 시장 방향성 확인 후 진입을 권장합니다.`;
}

function getMaTags(stock: Stock): { label: string; style: string }[] {
  const signal = classifyStockSignal(stock);
  const tags: { label: string; style: string }[] = [];

  if (stock.rsi <= 35) {
    tags.push({ label: `MA ${stock.rsi}`, style: "tagSuccess" });
  } else if (stock.rsi >= 70) {
    tags.push({ label: `MA ${stock.rsi}`, style: "tagDanger" });
  } else {
    tags.push({ label: `MA ${stock.rsi}`, style: "" });
  }

  if (signal === "success") {
    tags.push({ label: "골든크로스", style: "tagSuccess" });
  } else if (signal === "danger") {
    tags.push({ label: "과매 구간", style: "tagDanger" });
  } else {
    tags.push({ label: "적정 구간", style: "tagWarning" });
  }

  return tags;
}

export default function StockSignalCard({ stock, isSelected, onClick }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const signal = classifyStockSignal(stock);
  const tone = getSignalTone(signal);
  const prefix = getMarketPrefix(stock.market);
  const tags = getMaTags(stock);
  const favorited = isFavorite(stock.code);

  const badgeClass =
    signal === "success"
      ? styles.badgeSuccess
      : signal === "danger"
        ? styles.badgeDanger
        : styles.badgeWarning;

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(stock.code);
  };

  return (
    <div
      className={`${styles.signalCard} ${isSelected ? styles.signalCardSelected : ""}`}
      onClick={onClick}
    >
      <div className={styles.cardTop}>
        <div className={styles.cardStockInfo}>
          <div className={styles.cardIcon}>
            {stock.market === "BTC" ? "₿" : stock.code.slice(0, 2)}
          </div>
          <div>
            <div className={styles.cardStockName}>{stock.name}</div>
            <div className={styles.cardStockMarket}>{stock.category}</div>
          </div>
        </div>
        <div className={styles.cardTopRight}>
          <Heart
            size={16}
            fill={favorited ? "#7b8fa6" : "transparent"}
            color="#7b8fa6"
            className={styles.heartIcon}
            onClick={handleFavorite}
          />
          <span className={`${styles.signalBadge} ${badgeClass}`}>
            {tone.label}
          </span>
        </div>
      </div>

      <div className={styles.cardPrice}>
        <span className={styles.priceValue}>
          {prefix}
          {stock.price.toLocaleString()}
        </span>
        <span
          className={`${styles.priceChange} ${stock.change >= 0 ? styles.up : styles.down}`}
        >
          {stock.change >= 0 ? "▲" : "▼"} {Math.abs(stock.change)}%
        </span>
      </div>

      <div className={styles.cardTags}>
        {tags.map((t) => (
          <span key={t.label} className={`${styles.tag} ${t.style ? styles[t.style as keyof typeof styles] : ""}`}>
            {t.label}
          </span>
        ))}
      </div>

      <div className={styles.cardRsiRow}>
        <span className={styles.cardRsiLabel}>RSI</span>
        <div className={styles.cardRsiTrack}>
          <div
            className={styles.cardRsiFill}
            style={{ width: `${stock.rsi}%`, background: tone.bar }}
          />
        </div>
        <span className={styles.cardRsiValue}>{stock.rsi}</span>
      </div>

      <p className={styles.cardComment}>{generateComment(stock)}</p>
    </div>
  );
}
