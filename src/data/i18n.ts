import { useState, useEffect, useCallback } from "react";

export type Lang = "en" | "ja";

const LANG_KEY = "aid-lang";

function detectBrowserLang(): Lang {
  const nav = navigator.language?.toLowerCase() ?? "";
  return nav.startsWith("ja") ? "ja" : "en";
}

export function useLang(fallback: Lang = "ja"): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return fallback;
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === "en" || stored === "ja") return stored;
    return detectBrowserLang();
  });

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
    document.documentElement.lang = l;
  }, []);

  return [lang, setLang];
}

export const USD_JPY_RATE = 150;

export function formatPrice(value: number | null | undefined, lang: Lang): string {
  if (value == null) return "—";
  if (lang === "ja") {
    const yen = Math.round(value * USD_JPY_RATE);
    return `${yen.toLocaleString()}円`;
  }
  return `$${value}`;
}

export function formatPriceAxis(value: number, lang: Lang): string {
  if (lang === "ja") {
    const yen = Math.round(value * USD_JPY_RATE);
    return `¥${yen.toLocaleString()}`;
  }
  return `$${value}`;
}
