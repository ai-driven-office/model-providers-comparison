export interface Provider {
  id: string;
  name: string;
  color: string;
  url: string;
}

export interface Abilities {
  planning: number;
  coding: number;
  image: number;
  research: number;
  creative: number;
}

export interface Model {
  name: string;
  provider: string; // display name (resolved from collection)
  providerId: string; // collection id for lookups
  tps: number;
  input: number | null;
  output: number | null;
  inputLong: number | null;
  outputLong: number | null;
  hero: boolean;
  tag: string | null;
  link: string | null;
  abilities: Abilities;
}

export interface BilingualText {
  en: string;
  ja: string;
}

export interface NewsComparison {
  model: string;
  tps: number;
  factor: number;
}

export interface NewsSpec {
  label: BilingualText;
  value: string;
}

export interface NewsPost {
  title: BilingualText;
  body: BilingualText;
  date: string;
  timestamp: number;
  tags: string[];
  featured: boolean;
  link: { url: string; label: BilingualText } | null;
  models: string[];
  providers: string[];
  comparisons: NewsComparison[];
  specs: NewsSpec[];
}
