"use client";

import React, { createContext, useContext, ReactNode, useEffect, useState } from "react";

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (code: string) => void;
  isFavorite: (code: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);
const FAVORITES_STORAGE_KEY = "investpulse-favorites";
const DEFAULT_FAVORITES = ["005380", "035720", "TSLA", "AMZN", "AAPL", "ETH-USD"];

function readFavoritesFromStorage(): string[] {
  if (typeof window === "undefined") {
    return DEFAULT_FAVORITES;
  }

  const saved = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
  if (!saved) {
    return DEFAULT_FAVORITES;
  }

  try {
    const parsed = JSON.parse(saved) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    console.error("Failed to parse favorites from localStorage");
  }

  return DEFAULT_FAVORITES;
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(() => readFavoritesFromStorage());

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleStorage = () => {
      setFavorites(readFavoritesFromStorage());
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const toggleFavorite = (code: string) => {
    setFavorites((prev) => {
      const next = prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code];

      if (typeof window !== "undefined") {
        window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      }

      return next;
    });
  };

  const isFavorite = (code: string) => favorites.includes(code);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
