import { MessageCircle, ExternalLink } from "lucide-react";
import type { Lang } from "../../data/i18n";

const SANS_JA = "'Zen Kaku Gothic New', sans-serif";
const SANS_EN = "'Inter', system-ui, sans-serif";
const MONO = "'Space Mono', monospace";

const TWEET_URL = "https://x.com/gunta85/status/2024736151379333481";

interface Props {
  lang: Lang;
  labels: {
    testimonialsTitle: string;
    testimonialsSub: string;
  };
}

function XLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const testimonials = [
  {
    text: "モデルの価格差が一目で比較できるのは非常に助かります。毎回ゼロから調べ直す手間がなくなりました。",
    textEn: "Being able to compare model pricing at a glance is incredibly helpful. No more researching from scratch every time.",
  },
  {
    text: "各モデルの特性がひと目でわかるので、チームでのモデル選定がスムーズになりました。",
    textEn: "Understanding each model's characteristics instantly has made our team's model selection process much smoother.",
  },
  {
    text: "「どのAIモデルを使うべきか」という判断に、信頼できるデータがまとまっているのはありがたいです。",
    textEn: "Having reliable data consolidated for the 'which AI model should we use' decision is invaluable.",
  },
  {
    text: "画像生成モデルにも対応予定とのこと。このページだけ見ておけばよい状態になるのを期待しています。",
    textEn: "Looking forward to image generation model coverage as well. This is becoming the single page to bookmark.",
  },
];

function QuoteCard({
  text,
  index,
  lang,
}: {
  text: string;
  index: number;
  lang: Lang;
}) {
  return (
    <div
      className="group relative rounded-lg px-4 py-3.5 transition-all duration-300"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        e.currentTarget.style.borderColor = "rgba(92,141,254,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.02)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
      }}
    >
      <div className="absolute top-3.5 right-3.5 opacity-[0.06] group-hover:opacity-[0.1] transition-opacity duration-300">
        <XLogo className="w-3.5 h-3.5" />
      </div>

      <p
        className="text-[13px] m-0 leading-relaxed"
        style={{ fontFamily: lang === "ja" ? SANS_JA : SANS_EN, color: "rgba(255,255,255,0.5)", mixBlendMode: "plus-lighter" }}
      >
        {text}
      </p>
    </div>
  );
}

export default function Testimonials({ lang, labels }: Props) {
  const isJa = lang === "ja";

  return (
    <section className="mt-10 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <MessageCircle className="w-4 h-4" style={{ color: "#5C8DFE" }} />
        <h2
          className="text-base font-bold m-0"
          style={{ fontFamily: isJa ? SANS_JA : "'Inter', sans-serif", color: "rgba(255,255,255,0.7)", mixBlendMode: "plus-lighter" }}
        >
          {labels.testimonialsTitle}
        </h2>
      </div>
      <p
        className="text-xs m-0 mb-5 pl-6"
        style={{ fontFamily: isJa ? SANS_JA : "'Inter', sans-serif", color: "rgba(255,255,255,0.25)", mixBlendMode: "plus-lighter" }}
      >
        {labels.testimonialsSub}
      </p>

      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(92,141,254,0.02) 0%, rgba(138,60,184,0.015) 100%)",
          border: "1px solid rgba(92,141,254,0.06)",
        }}
      >
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {testimonials.map((t, i) => (
              <QuoteCard
                key={i}
                text={isJa ? t.text : t.textEn}
                index={i}
                lang={lang}
              />
            ))}
          </div>
        </div>

        <div
          className="flex items-center justify-center px-4 py-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          <a
            href={TWEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 no-underline transition-opacity duration-200 hover:opacity-80"
          >
            <XLogo className="w-3 h-3" style={{ color: "rgba(255,255,255,0.3)" }} />
            <span
              className="text-[11px]"
              style={{ fontFamily: isJa ? SANS_JA : MONO, color: "rgba(255,255,255,0.3)", mixBlendMode: "plus-lighter" }}
            >
              {isJa ? "元ポストを見る" : "See the original post"}
            </span>
            <ExternalLink className="w-2.5 h-2.5" style={{ color: "rgba(255,255,255,0.2)" }} />
          </a>
        </div>
      </div>
    </section>
  );
}
