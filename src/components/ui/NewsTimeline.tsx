import { Newspaper, ExternalLink, Cpu } from "lucide-react";
import type { NewsPost, Provider } from "../../data/types";
import type { Lang } from "../../data/i18n";

const MONO = "'Space Mono', monospace";
const SANS_EN = "'Inter', system-ui, sans-serif";
const SANS_JA = "'Zen Kaku Gothic New', sans-serif";

interface Props {
  posts: NewsPost[];
  providers: Provider[];
  lang: Lang;
  labels: {
    newsTitle: string;
    newsSub: string;
    fasterThan: string;
    tryFree: string;
    useCases: string;
    speedComparisons: string;
  };
}

function ComparisonBar({
  model,
  tps,
  factor,
  maxFactor,
  lang,
  fasterThan,
}: {
  model: string;
  tps: number;
  factor: number;
  maxFactor: number;
  lang: Lang;
  fasterThan: string;
}) {
  // Log scale for bar widths so the 17x bar is still visible
  const logMax = Math.log(maxFactor);
  const logVal = Math.log(factor);
  const pct = Math.max(8, (logVal / logMax) * 100);

  return (
    <div className="flex items-center gap-2 py-1">
      <div
        className="w-[130px] shrink-0 text-[11px] truncate"
        style={{ fontFamily: lang === "ja" ? SANS_JA : SANS_EN, color: "rgba(255,255,255,0.4)", mixBlendMode: "plus-lighter" }}
      >
        {model}
      </div>
      <div className="flex-1 h-[14px] rounded-full relative" style={{ background: "rgba(255,255,255,0.03)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background:
              factor > 100
                ? "linear-gradient(90deg, rgba(255,106,0,0.5), rgba(255,106,0,0.8))"
                : "linear-gradient(90deg, rgba(255,106,0,0.3), rgba(255,106,0,0.5))",
          }}
        />
      </div>
      <div
        className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold"
        style={{
          fontFamily: MONO,
          background: factor > 100 ? "rgba(255,106,0,0.12)" : "rgba(255,106,0,0.06)",
          color: factor > 100 ? "#FF6A00" : "#CC8844",
          border: `1px solid ${factor > 100 ? "rgba(255,106,0,0.25)" : "rgba(255,106,0,0.12)"}`,
        }}
      >
        {factor}x
      </div>
    </div>
  );
}

function NewsCard({
  post,
  providerLabel,
  lang,
  labels,
}: {
  post: NewsPost;
  providerLabel: string;
  lang: Lang;
  labels: Props["labels"];
}) {
  const isJa = lang === "ja";
  const sans = isJa ? SANS_JA : SANS_EN;
  const title = isJa ? post.title.ja : post.title.en;
  const body = isJa ? post.body.ja : post.body.en;
  const maxFactor = Math.max(...post.comparisons.map((c) => c.factor), 1);

  const dateStr = (() => {
    const d = new Date(post.date + "T00:00:00");
    if (isJa) {
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    }
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).toUpperCase();
  })();

  return (
    <div className="relative pl-7">
      {/* Timeline dot + line */}
      <div
        className="absolute left-0 top-[6px] w-3 h-3 rounded-full border-2"
        style={{
          borderColor: post.featured ? "#FF6A00" : "#5C8DFE",
          background: post.featured ? "rgba(255,106,0,0.3)" : "rgba(92,141,254,0.2)",
          boxShadow: post.featured
            ? "0 0 10px rgba(255,106,0,0.3)"
            : "0 0 8px rgba(92,141,254,0.2)",
        }}
      />
      <div
        className="absolute left-[5px] top-[22px] w-px bottom-0"
        style={{
          background: "linear-gradient(180deg, rgba(92,141,254,0.2), transparent)",
        }}
      />

      {/* Date + Tags */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span
          className="text-[11px] font-bold tracking-wider"
          style={{
            fontFamily: MONO,
            color: "#5C8DFE",
            letterSpacing: 2,
          }}
        >
          {dateStr}
        </span>
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wide"
            style={{
              fontFamily: MONO,
              background: "rgba(92,141,254,0.08)",
              color: "#5C8DFE",
              border: "1px solid rgba(92,141,254,0.12)",
              textTransform: "uppercase",
            }}
          >
            {tag.replace(/-/g, " ")}
          </span>
        ))}
        {post.featured && (
          <span
            className="text-[10px]"
            style={{ color: "#FF6A00" }}
            title="Featured"
          >
            ★
          </span>
        )}
      </div>

      {/* Card */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(92,141,254,0.03) 0%, rgba(255,106,0,0.02) 100%)",
          border: "1px solid rgba(92,141,254,0.08)",
        }}
      >
        <div className="px-5 py-4">
          {/* Title */}
          <h3
            className="text-[16px] font-bold text-white m-0 mb-3 leading-snug"
            style={{ fontFamily: sans }}
          >
            {title}
          </h3>

          {/* Body */}
          <p
            className="text-[13px] m-0 mb-4 leading-relaxed"
            style={{ fontFamily: sans, color: "rgba(255,255,255,0.4)", mixBlendMode: "plus-lighter" }}
          >
            {body}
          </p>

          {/* Speed Comparisons */}
          {post.comparisons.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Cpu className="w-3.5 h-3.5 text-orange-400/70" />
                <span
                  className="text-[11px] font-bold tracking-wider"
                  style={{
                    fontFamily: MONO,
                    textTransform: isJa ? "none" : "uppercase",
                    letterSpacing: isJa ? 1 : 2,
                    color: "rgba(255,255,255,0.35)",
                    mixBlendMode: "plus-lighter",
                  }}
                >
                  {labels.speedComparisons}
                </span>
              </div>
              <div
                className="rounded-lg px-3 py-2"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
              >
                {post.comparisons.map((c) => (
                  <ComparisonBar
                    key={c.model}
                    model={c.model}
                    tps={c.tps}
                    factor={c.factor}
                    maxFactor={maxFactor}
                    lang={lang}
                    fasterThan={labels.fasterThan}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Specs */}
          {post.specs.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.specs.map((spec, i) => (
                <div
                  key={i}
                  className="px-2.5 py-1 rounded-md text-[11px]"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span style={{ fontFamily: sans, color: "rgba(255,255,255,0.35)", mixBlendMode: "plus-lighter" }}>
                    {isJa ? spec.label.ja : spec.label.en}:
                  </span>{" "}
                  <span className="font-semibold" style={{ fontFamily: MONO, color: "rgba(255,255,255,0.5)", mixBlendMode: "plus-lighter" }}>
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Footer: provider link + CTA */}
          {post.link && (
            <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "rgba(255,255,255,0.35)", mixBlendMode: "plus-lighter" }}>
                <Newspaper className="w-3 h-3" />
                <span style={{ fontFamily: sans }}>{providerLabel}</span>
              </div>
              <a
                href={post.link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold no-underline transition-opacity hover:opacity-80"
                style={{
                  fontFamily: isJa ? SANS_JA : MONO,
                  background: "rgba(255,106,0,0.12)",
                  color: "#FF6A00",
                  border: "1px solid rgba(255,106,0,0.3)",
                }}
              >
                {isJa ? post.link.label.ja : post.link.label.en}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NewsTimeline({ posts, providers, lang, labels }: Props) {
  const isJa = lang === "ja";
  const sorted = [...posts].sort((a, b) => b.timestamp - a.timestamp);
  const providerMap = new Map(providers.map((provider) => [provider.id, provider.name]));

  return (
    <section id="news" className="mt-10 mb-6 scroll-mt-6">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-1">
        <Newspaper className="w-4 h-4" style={{ color: "#5C8DFE" }} />
        <h2
          className="text-base font-bold m-0"
          style={{
            fontFamily: isJa ? SANS_JA : "'Inter', sans-serif",
            color: "rgba(255,255,255,0.7)",
            mixBlendMode: "plus-lighter",
          }}
        >
          {labels.newsTitle}
        </h2>
      </div>
      <p
        className="text-xs m-0 mb-5 pl-6"
        style={{ fontFamily: isJa ? SANS_JA : "'Inter', sans-serif", color: "rgba(255,255,255,0.25)", mixBlendMode: "plus-lighter" }}
      >
        {labels.newsSub}
      </p>

      {/* Timeline */}
      <div className="space-y-8">
        {sorted.map((post, i) => (
          <NewsCard
            key={`${post.date}-${i}`}
            post={post}
            providerLabel={post.providers.map((id) => providerMap.get(id)).find(Boolean) ?? "Source"}
            lang={lang}
            labels={labels}
          />
        ))}
      </div>
    </section>
  );
}
