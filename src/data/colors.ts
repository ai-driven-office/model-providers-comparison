export const colorMap: Record<string, string> = {
  "Cerebras (Direct)": "#00E5A0",
  xAI: "#FF6B6B",
  "Google Vertex": "#4285F4",
  "Google AI Studio": "#34A853",
  Anthropic: "#D4A574",
  SiliconFlow: "#A78BFA",
  OpenAI: "#10B981",
};

export function getColor(provider: string): string {
  return colorMap[provider] ?? "#888";
}
