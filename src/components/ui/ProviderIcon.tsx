import type { ComponentType, SVGProps } from "react";
import {
  Atom,
  Box,
  Bot,
  BrainCircuit,
  Cpu,
  MoonStar,
  Orbit,
  Rocket,
  Sparkles,
  Waves,
} from "lucide-react";

type LobeIcon = ComponentType<{ size?: string | number; className?: string }>;

function TaalasIcon({ size = 16, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 2L4 6v12l8 4 8-4V6l-8-4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 22V10M4 6l8 4 8-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GoogleIcon({ size = 16, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M20 12.2c0-.7-.06-1.37-.18-2H12v3.75h4.47a3.84 3.84 0 0 1-1.66 2.52v2.1h2.68c1.57-1.45 2.51-3.58 2.51-6.37Z"
        fill="currentColor"
        opacity="0.95"
      />
      <path
        d="M12 20.25c2.25 0 4.14-.74 5.52-2.01l-2.68-2.1c-.74.5-1.7.8-2.84.8-2.18 0-4.03-1.47-4.7-3.45H4.54v2.16A8.25 8.25 0 0 0 12 20.25Z"
        fill="currentColor"
        opacity="0.75"
      />
      <path
        d="M7.3 13.49A4.95 4.95 0 0 1 7.03 12c0-.52.09-1.02.26-1.49V8.35H4.54A8.25 8.25 0 0 0 3.75 12c0 1.33.32 2.59.8 3.65l2.75-2.16Z"
        fill="currentColor"
        opacity="0.55"
      />
      <path
        d="M12 7.06c1.22 0 2.31.42 3.17 1.24l2.38-2.38A8.04 8.04 0 0 0 12 3.75 8.25 8.25 0 0 0 4.54 8.35L7.3 10.5c.66-1.99 2.51-3.44 4.7-3.44Z"
        fill="currentColor"
        opacity="0.35"
      />
    </svg>
  );
}

const MODEL_ICON_MAP: [RegExp, LobeIcon][] = [
  [/^claude|^opus/i, BrainCircuit],
  [/^gpt/i, Sparkles],
  [/^gemini/i, GoogleIcon as LobeIcon],
  [/^glm/i, Atom],
  [/^grok/i, Orbit],
  [/^kimi/i, MoonStar],
  [/^llama/i, Bot],
  [/^minimax|^m2(\.|$)/i, Bot],
  [/^mercury/i, Rocket],
  [/^qwen/i, Box],
];

const PROVIDER_ICON_MAP: Record<string, LobeIcon> = {
  alibaba: Box,
  openai: Sparkles,
  anthropic: BrainCircuit,
  "google-ai-studio": GoogleIcon as LobeIcon,
  "google-vertex": GoogleIcon as LobeIcon,
  inception: Rocket,
  minimax: Bot,
  moonshot: MoonStar,
  xai: Orbit,
  cerebras: Cpu,
  siliconflow: Waves,
  taalas: TaalasIcon as unknown as LobeIcon,
};

export function getModelIconComponent(modelName: string): LobeIcon | null {
  for (const [re, Icon] of MODEL_ICON_MAP) {
    if (re.test(modelName)) return Icon;
  }
  return null;
}

export function getProviderIconComponent(providerId: string): LobeIcon | null {
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
  return <Icon size={size} className={className} />;
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
  return <Icon size={size} className={className} />;
}
