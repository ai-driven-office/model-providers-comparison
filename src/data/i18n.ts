export type Lang = "en" | "ja";

export const USD_JPY_RATE = 150;

export function formatPrice(value: number, lang: Lang): string {
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
