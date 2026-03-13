import { formatPrice, type Lang } from "../../data/i18n";
import type { Model } from "../../data/types";

export type DashboardTab =
  | "throughput"
  | "pricing"
  | "scatter"
  | "abilities"
  | "recommendations";

export const DASHBOARD_STATE_EVENT = "aid:dashboard-state";

export function getDashboardShareText({
  activeTab,
  heroModel,
  priceHero,
  copy,
  lang,
}: {
  activeTab: DashboardTab;
  heroModel?: Model;
  priceHero?: Model;
  copy: Record<string, string>;
  lang: Lang;
}) {
  if (activeTab === "throughput" && heroModel) {
    return (copy.shareSpeedText ?? "")
      .replace("{model}", heroModel.name)
      .replace("{tps}", heroModel.tps.toLocaleString());
  }

  if (activeTab === "pricing" && priceHero) {
    return (copy.sharePriceText ?? "")
      .replace("{model}", priceHero.name)
      .replace("{price}", formatPrice(priceHero.output, lang));
  }

  return copy.shareDefaultText ?? "";
}
