import type { ComponentType, SVGProps } from "react";
import OpenAI from "@lobehub/icons/es/OpenAI";
import Claude from "@lobehub/icons/es/Claude";
import Gemini from "@lobehub/icons/es/Gemini";
import Grok from "@lobehub/icons/es/Grok";
import ChatGLM from "@lobehub/icons/es/ChatGLM";
import Anthropic from "@lobehub/icons/es/Anthropic";
import Cerebras from "@lobehub/icons/es/Cerebras";
import SiliconCloud from "@lobehub/icons/es/SiliconCloud";
import XAI from "@lobehub/icons/es/XAI";
import VertexAI from "@lobehub/icons/es/VertexAI";
import AiStudio from "@lobehub/icons/es/AiStudio";

type IconComp = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

const MODEL_ICON_MAP: [RegExp, IconComp][] = [
  [/^claude|^opus/i, Claude as unknown as IconComp],
  [/^gpt/i, OpenAI as unknown as IconComp],
  [/^gemini/i, Gemini as unknown as IconComp],
  [/^glm/i, ChatGLM as unknown as IconComp],
  [/^grok/i, Grok as unknown as IconComp],
];

const PROVIDER_ICON_MAP: Record<string, IconComp> = {
  openai: OpenAI as unknown as IconComp,
  anthropic: Anthropic as unknown as IconComp,
  "google-ai-studio": AiStudio as unknown as IconComp,
  "google-vertex": VertexAI as unknown as IconComp,
  xai: XAI as unknown as IconComp,
  cerebras: Cerebras as unknown as IconComp,
  siliconflow: SiliconCloud as unknown as IconComp,
};

export function getModelIconComponent(modelName: string): IconComp | null {
  for (const [re, Icon] of MODEL_ICON_MAP) {
    if (re.test(modelName)) return Icon;
  }
  return null;
}

export function getProviderIconComponent(providerId: string): IconComp | null {
  return PROVIDER_ICON_MAP[providerId] ?? null;
}

export function ModelIcon({
  modelName,
  size = 16,
  className,
}: {
  modelName: string;
  size?: number;
  className?: string;
}) {
  const Icon = getModelIconComponent(modelName);
  if (!Icon) return null;
  return <Icon width={size} height={size} className={className} />;
}

export function ProviderIcon({
  providerId,
  size = 16,
  className,
}: {
  providerId: string;
  size?: number;
  className?: string;
}) {
  const Icon = getProviderIconComponent(providerId);
  if (!Icon) return null;
  return <Icon width={size} height={size} className={className} />;
}
