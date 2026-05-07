"use client";

import { ReactNode } from "react";
import { FavoritesProvider } from "@/contexts/FavoritesContext";

export function Providers({ children }: { children: ReactNode }) {
  return <FavoritesProvider>{children}</FavoritesProvider>;
}
