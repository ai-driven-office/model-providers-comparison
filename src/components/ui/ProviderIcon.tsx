import type { ReactElement, SVGProps } from "react";

/**
 * Lightweight provider/model icons using inline SVG paths.
 * Replaces @lobehub/icons which has ESM compatibility issues with Astro SSR.
 */

type IconComp = (
  props: SVGProps<SVGSVGElement> & { size?: number },
) => ReactElement | null;

/* ─── Minimal inline SVG icon components ─── */

function OpenAIIcon({ size = 16, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.998 5.998 0 0 0-3.998 2.9 6.042 6.042 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  );
}

function ClaudeIcon({ size = 16, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.091 5.636L12.001 18.364L7.909 5.636H4.636L10.227 22.364H13.773L19.364 5.636H16.091Z" />
    </svg>
  );
}

function GeminiIcon({ size = 16, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 24A14.304 14.304 0 0 0 12 0a14.304 14.304 0 0 0 0 24zm0-3.885A10.42 10.42 0 0 1 1.582 12 10.42 10.42 0 0 1 12 3.885 10.42 10.42 0 0 1 22.418 12 10.42 10.42 0 0 1 12 20.115z" />
    </svg>
  );
}

function GrokIcon({ size = 16, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4 4h6l6 8-6 8H4l6-8L4 4zm10 0h6v16h-6l6-8-6-8z" />
    </svg>
  );
}

function GLMIcon({ size = 16, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

/* ─── Mappings ─── */

const MODEL_ICON_MAP: [RegExp, IconComp][] = [
  [/^claude|^opus/i, ClaudeIcon],
  [/^gpt/i, OpenAIIcon],
  [/^gemini/i, GeminiIcon],
  [/^glm/i, GLMIcon],
  [/^grok/i, GrokIcon],
];

const PROVIDER_ICON_MAP: Record<string, IconComp> = {
  openai: OpenAIIcon,
  anthropic: ClaudeIcon,
  "google-ai-studio": GeminiIcon,
  "google-vertex": GeminiIcon,
  xai: GrokIcon,
  cerebras: OpenAIIcon,
  siliconflow: GLMIcon,
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
