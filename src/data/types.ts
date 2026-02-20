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
  input: number;
  output: number;
  inputLong: number | null;
  outputLong: number | null;
  hero: boolean;
  tag: string | null;
  abilities: Abilities;
}
