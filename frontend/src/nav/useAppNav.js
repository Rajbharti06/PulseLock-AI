import { useContext } from "react";
import { AppNavContext } from "./appNavContext";

export function useAppNav() {
  const ctx = useContext(AppNavContext);
  if (!ctx) return { go: () => {}, page: null, titles: {} };
  return ctx;
}
