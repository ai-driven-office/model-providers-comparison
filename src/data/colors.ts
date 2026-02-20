import type { Provider } from "./types";

export type ColorMap = Record<string, string>;

export function buildColorMap(providers: Provider[]): ColorMap {
  return Object.fromEntries(providers.map((p) => [p.name, p.color]));
}

export function getColor(provider: string, colorMap: ColorMap): string {
  return colorMap[provider] ?? "#888";
}
