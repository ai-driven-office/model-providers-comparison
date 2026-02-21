import { useState, useEffect, useRef, type ReactNode } from "react";
import {
  ArrowLeft,
  Sparkles,
  Eye,
  GitPullRequest,
  Users,
  Gauge,
  Globe,
  HeartHandshake,
  ChevronDown,
} from "lucide-react";
import { useLang, type Lang } from "../data/i18n";
import { sfxLang } from "../data/sfx";
import { MeshGradient } from "@paper-design/shaders-react";

const content = {
  en: {
    badge: "About",
    backLabel: "← Back to Dashboard",
    title: "Why we built this",
    subtitle: "The principles behind AI Model Comparison",

    openingLine:
      "Choosing the right AI model should be based on evidence, not intuition.",

    problemTitle: "The challenge",
    problemBody:
      "The AI model landscape evolves weekly. New models launch, pricing structures change, throughput numbers are revised, and benchmark rankings shift. For teams making production decisions — where model choice directly impacts user experience, operating costs, and delivery timelines — reliable, up-to-date comparison data is essential.",
    problemQuote:
      "Which model delivers the highest throughput today? What is the true total cost? How do capabilities compare across coding, reasoning, and creative tasks?",
    problemAfter:
      "Straightforward questions, but surprisingly difficult to answer. Performance data is scattered across vendor pages, pricing is presented inconsistently, and most comparisons go stale within weeks of publication.",
    problemBias:
      "There is also a structural imbalance in how model capabilities are communicated. When a lab announces a new model, the benchmarks they choose to highlight naturally emphasize the areas where it leads. This is understandable — every organization presents its strengths. But the cumulative effect is that practitioners see a landscape composed of selective wins. The trade-offs, the categories where a model falls short, are left to be discovered through trial and error — often after a commitment has already been made.",

    beliefTitle: "Our principles",
    beliefs: [
      {
        icon: "eye",
        title: "Transparency over marketing",
        body: "Vendor-published benchmarks serve a marketing purpose. Independent, standardized comparisons serve an engineering purpose. We track real throughput, real pricing, and normalized capability scores — and we update them as the landscape changes.",
      },
      {
        icon: "gauge",
        title: "Speed as a first-class metric",
        body: "Throughput shapes the developer experience. The difference between 100 tokens per second and 1,000 is not incremental — it changes how people work with AI. We measure it because it determines what's possible in practice.",
      },
      {
        icon: "globe",
        title: "Open by default",
        body: "Every data point lives in a public YAML file. Every chart is reproducible from source. The entire dataset is downloadable as Markdown. If something is inaccurate, anyone can correct it with a pull request.",
      },
      {
        icon: "users",
        title: "Contributions welcome",
        body: "This project is maintained by the AI Driven Office team. We do the bulk of the research and updates ourselves, but we welcome corrections and additions from anyone. If you spot an inaccuracy or a missing model, a pull request is the fastest path to a fix.",
      },
    ],

    originTitle: "Origin",
    originBody:
      "This project started inside CyberAgent's AI Driven Office (AIドリブン推進室), a team responsible for accelerating AI adoption across the CyberAgent Group. CyberAgent operates a diverse portfolio of businesses — internet advertising, media, entertainment, and beyond — with numerous subsidiaries and business units, each exploring AI for their own use cases. When we needed a reliable, up-to-date reference for evaluating model providers, the most practical way to reach every team across the group was simply to publish it openly.",
    originBody2:
      "What began as an internal spreadsheet became a shared dashboard, and then an open-source project. Publishing it turned out to serve both purposes at once: it gives every team within CyberAgent immediate access to the latest data, and it extends the same resource to the broader developer community. Whether you are a startup founder, a solo developer, or an enterprise architect — you benefit from the same reference we built for our own organization.",

    howTitle: "Methodology",
    howIntro:
      "We aim to be transparent not just about the data, but about how we arrive at it. Below is our current methodology — including its limitations.",
    howItems: [
      {
        label: "Throughput & pricing",
        detail: "Throughput and pricing data are primarily sourced from OpenRouter, which aggregates models across multiple infrastructure providers. For each model, we report the fastest available endpoint. This is not always the model creator's own service — a model built by one lab may run fastest on Cerebras, AWS Bedrock, Google Cloud, or Azure, depending on the provider's hardware and optimization. We track whoever delivers the best real-world throughput, because that is what matters in practice.",
      },
      {
        label: "Ability scores",
        detail: "This is the most interpretive part of the dashboard, and we want to be candid about the process. We collect benchmark results from multiple sources: the scores that labs publish alongside model announcements, third-party evaluations, and independent community benchmarks. We then normalize these to a 0–100 scale for comparability. A key challenge is that labs naturally emphasize the benchmarks where their model leads and tend to omit the areas where it falls short. To compensate, we cross-reference across sources and fill in gaps where possible. The result is a composite picture — directionally useful, but not perfectly precise.",
      },
      {
        label: "Recommendations",
        detail: "Algorithmically generated picks evaluated on three axes: absolute quality, cost-efficiency (score per dollar), and speed (score weighted by throughput). These are derived from the ability scores above, so they carry the same caveats.",
      },
    ],
    howLimitations:
      "To be direct about the limitations: ability scores are approximate, the methodology is not yet fully repeatable, and different benchmarks measure different things. A model that scores well on academic evaluations may behave differently on real-world tasks. We present these numbers as a starting point for evaluation, not a final verdict.",
    roadmapTitle: "Where this is heading",
    roadmapBody:
      "We plan to improve the methodology incrementally, with several priorities. First, incorporating ELO-based rankings from competitive evaluation platforms, which capture relative model strength more reliably than static benchmarks. Second, giving greater weight to independent researcher assessments, which tend to reflect practical performance more accurately than lab-published figures. Third, building a more repeatable evaluation pipeline so scores can be updated systematically rather than manually. We are intentionally cautious here — labs have an incentive to optimize for popular benchmarks, and over-tuning for benchmark performance can produce scores that diverge from real-world results. As the methodology evolves, we will document changes openly.",

    contributeTitle: "Contribute",
    contributeBody:
      "Spotted an inaccuracy, a missing model, or an outdated benchmark? Every correction strengthens the resource for the entire community.",
    contributeButton: "Open an Issue or PR",

    footerLine: "An open-source project by AI Driven Office",
    copyright: "©CyberAgent, Inc. · AI Driven Office (AIドリブン推進室)",
  },
  ja: {
    badge: "このサイトについて",
    backLabel: "← ダッシュボードに戻る",
    title: "このサイトを作った理由",
    subtitle: "AIモデル比較に込めた考え方",

    openingLine:
      "AIモデルの選定は、勘ではなくデータに基づくべきだと考えています。",

    problemTitle: "背景にある課題",
    problemBody:
      "AIモデルの状況は週単位で変化します。新しいモデルが登場し、料金体系が変わり、スループットが更新され、ベンチマークのランキングが入れ替わる。本番環境でモデルを選定する際には、ユーザー体験・運用コスト・開発スケジュールに直結する判断が求められます。そのためには、信頼性が高く、最新の比較データが不可欠です。",
    problemQuote: "現時点で最も高速なモデルはどれか。実際の総コストはいくらか。コーディング・推論・クリエイティブといった用途別に、能力はどう異なるのか。",
    problemAfter:
      "いずれも基本的な問いですが、正確に答えることは容易ではありません。性能データはベンダーごとに散在し、価格の表記方法は統一されておらず、公開された比較情報の多くは数週間で陳腐化してしまいます。",
    problemBias:
      "さらに、モデルの能力がどのように伝えられるかという構造的な偏りがあります。新しいモデルが発表される際、強調されるベンチマークはそのモデルが優位性を持つ領域に集中します。各社が強みを前面に出すことは自然なことです。しかしその結果、実務者が目にするのは各モデルの「勝っている部分」だけを集めた景色になります。不得意な領域やトレードオフは、多くの場合、導入を決めた後に初めて明らかになります。",

    beliefTitle: "私たちの原則",
    beliefs: [
      {
        icon: "eye",
        title: "マーケティングではなく透明性を",
        body: "ベンダーが公表するベンチマークにはマーケティングの側面があります。独立した標準化された比較は、エンジニアリングのためのインフラです。実測値に基づくスループット、実際の価格、正規化された能力スコアを継続的に追跡・更新しています。",
      },
      {
        icon: "gauge",
        title: "速度は重要な指標である",
        body: "スループットは開発者体験を左右します。100 tps と 1,000 tps の違いは段階的なものではなく、AIとの協業のあり方そのものを変えます。実務上の可能性を決定づける指標だからこそ、計測する意味があります。",
      },
      {
        icon: "globe",
        title: "オープンであることを前提に",
        body: "すべてのデータは公開YAMLファイルに格納されています。チャートはソースから再現可能で、データセット全体をMarkdown形式でダウンロードできます。不正確な情報があれば、誰でもプルリクエストで修正できます。",
      },
      {
        icon: "users",
        title: "コントリビューション歓迎",
        body: "本プロジェクトはAIドリブン推進室のチームが主体的に運営し、調査・更新の大部分を自ら行っています。データの誤りや未掲載のモデルにお気づきの際は、プルリクエストをお送りいただければ迅速に反映いたします。",
      },
    ],

    originTitle: "プロジェクトの始まり",
    originBody:
      "このプロジェクトは、CyberAgentのAIドリブン推進室から生まれました。CyberAgentグループはインターネット広告、メディア、エンターテインメントをはじめとする多様な事業を展開しており、数多くの子会社・事業部がそれぞれのユースケースでAI活用を推進しています。モデルプロバイダーを評価するための信頼性の高いリファレンスが必要になったとき、グループ内のすべてのチームに確実に届ける最もシンプルな方法は、公開することでした。",
    originBody2:
      "社内用のスプレッドシートがダッシュボードになり、やがてオープンソースプロジェクトへと発展しました。公開したことで、グループ内のどのチームも常に最新のデータにアクセスできると同時に、社外の開発者コミュニティにも同じリソースを提供できるようになりました。スタートアップの創業者でも、個人開発者でも、エンタープライズアーキテクトでも、私たちが自社グループのために構築したリファレンスを同じように活用いただけます。",

    howTitle: "計測方法",
    howIntro:
      "データだけでなく、その算出方法についても透明であることを目指しています。以下に現在の方法論と、その限界を記載します。",
    howItems: [
      {
        label: "スループットと価格",
        detail: "スループットおよび価格データは、複数のインフラプロバイダーにまたがるモデルを集約しているOpenRouterを主な情報源としています。各モデルについて、最も高速なエンドポイントの数値を掲載しています。最速のエンドポイントはモデル開発元のサービスとは限りません。あるラボが開発したモデルが、Cerebras、AWS Bedrock、Google Cloud、Azureなど、別のプロバイダーのハードウェア上で最も高いスループットを出すことは珍しくありません。実務で重要なのは実際に利用可能な最速の数値であるため、提供元を問わず最も速い結果を追跡しています。",
      },
      {
        label: "能力スコア",
        detail: "ダッシュボードの中で最も解釈の余地が大きい部分であり、その算出過程について率直に説明します。各ラボがモデル発表時に公開するベンチマーク結果、サードパーティによる評価、独立したコミュニティベンチマークなど、複数のソースからスコアを収集しています。これらを0〜100のスケールに正規化し、横断的に比較できるようにしています。ここでの大きな課題は、各ラボが自社モデルの優位な領域のベンチマークを強調し、不得意な領域を省略する傾向があることです。これを補うため、独立した情報源との照合を行い、可能な限り欠落部分を補完しています。結果として得られるのは、方向性として有用な複合的な全体像ですが、完全に正確なものではありません。",
      },
      {
        label: "おすすめ",
        detail: "品質（絶対スコア）、コスト効率（スコア÷価格）、速度（スコア×スループット）の3軸でアルゴリズムにより算出しています。上記の能力スコアをもとにしているため、同様の注意点が当てはまります。",
      },
    ],
    howLimitations:
      "限界について率直に述べます。能力スコアは概算値であり、方法論はまだ完全に再現可能な段階には至っていません。ベンチマークごとに測定対象は異なり、学術的な評価で高スコアを獲得したモデルが、実際のタスクでは異なる挙動を示すこともあります。これらの数値は評価の出発点としてご活用ください。最終的な判断材料として提示するものではありません。",
    roadmapTitle: "今後の方向性",
    roadmapBody:
      "方法論は段階的に改善していく計画です。まず、競争的評価プラットフォームによるELOベースのランキングを取り入れること。静的なベンチマークよりも、モデル間の相対的な実力を正確に捉えることができます。次に、独立した研究者による評価の比重を高めること。ラボ公式の数値よりも、実務的な性能をより正確に反映する傾向があります。そして、スコアを手動ではなく体系的に更新できる、再現可能な評価パイプラインの構築です。なお、改善にあたっては意図的に慎重なアプローチを取ります。ラボには人気のあるベンチマークに最適化するインセンティブがあり、ベンチマークへの過度な最適化は実際の性能と乖離したスコアを生み出す可能性があるためです。方法論に変更を加えた際は、その内容を公開して記録します。",

    contributeTitle: "ご協力のお願い",
    contributeBody:
      "データの誤り、未掲載のモデル、古くなったベンチマークにお気づきの際は、ぜひお知らせください。一つひとつの修正が、コミュニティ全体の判断材料をより確かなものにします。",
    contributeButton: "Issue / PR を送る",

    footerLine: "AIドリブン推進室によるオープンソースプロジェクト",
    copyright: "©CyberAgent, Inc. · AIドリブン推進室（AI Driven Office）",
  },
} as const;

const beliefIcons: Record<string, ReactNode> = {
  eye: <Eye className="w-5 h-5" />,
  gauge: <Gauge className="w-5 h-5" />,
  globe: <Globe className="w-5 h-5" />,
  users: <Users className="w-5 h-5" />,
};

function AidLogo({ className = "" }: { className?: string }) {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  return (
    <img
      src={`${base}rbg_Logomark_white.png`}
      alt="AI := Driven"
      className={className}
    />
  );
}

function useReduceMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("aid-reduce-motion");
    if (stored !== null) {
      setReduced(stored === "true");
    } else {
      setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }
  }, []);
  return reduced;
}

function useInView(rootMargin = "200px") {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { rootMargin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin]);
  return { ref, inView };
}

export default function WhyPage() {
  const [lang, setLang] = useLang("ja");
  const l = content[lang];
  const isJa = lang === "ja";
  const reduceMotion = useReduceMotion();
  const heroGlow = useInView("200px");
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");

  return (
    <div className="max-w-[720px] mx-auto relative isolate">
      {/* Ambient glow */}
      <div
        ref={heroGlow.ref}
        className="absolute inset-x-0 -top-8 h-[500px] -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 15%, rgba(51,112,254,0.10) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 70% 5%, rgba(255,4,19,0.06) 0%, transparent 60%)",
          maskImage: "linear-gradient(to bottom, black 20%, transparent 85%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 20%, transparent 85%)",
        }}
      >
        {!reduceMotion && heroGlow.inView && (
          <MeshGradient
            colors={["#3370FE", "#8A3CB8", "#E0247A", "#FF0413"]}
            speed={0.15}
            distortion={0.5}
            swirl={0.1}
            grainOverlay={0.06}
            style={{
              width: "100%",
              height: "100%",
              opacity: 0.14,
              maskImage: "linear-gradient(to bottom, black 20%, transparent 85%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 20%, transparent 85%)",
            }}
          />
        )}
      </div>

      {/* Top Bar */}
      <div className="flex items-center justify-between mb-12">
        <a
          href={base}
          className="flex items-center gap-3 no-underline group"
          style={{ color: "#5C8DFE" }}
        >
          <AidLogo className="h-7 w-auto opacity-70 group-hover:opacity-100 transition-opacity" />
          <span
            className="text-xs transition-colors"
            style={{
              fontFamily: isJa ? "'Noto Sans JP', sans-serif" : "'Space Mono', monospace",
              letterSpacing: isJa ? 0.5 : 1,
            }}
          >
            {l.backLabel}
          </span>
        </a>

        {/* Lang switcher */}
        <div
          className="flex items-center gap-0.5 rounded-lg p-[3px] border"
          style={{
            background: "rgba(51,112,254,0.06)",
            borderColor: "rgba(51,112,254,0.12)",
          }}
        >
          {(
            [
              { code: "en" as Lang, label: "EN" },
              { code: "ja" as Lang, label: "日本語" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.code}
              onClick={() => {
                setLang(opt.code);
                if (!reduceMotion) sfxLang();
              }}
              className="px-3.5 py-1 rounded-md border-none cursor-pointer transition-all duration-200"
              style={{
                fontFamily:
                  opt.code === "ja" ? "'Noto Sans JP', sans-serif" : "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: opt.code === "ja" ? 0 : 1,
                background:
                  lang === opt.code
                    ? "linear-gradient(135deg, rgba(51,112,254,0.2), rgba(255,4,19,0.15))"
                    : "transparent",
                color: lang === opt.code ? "#fff" : "#555",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Badge */}
      <div className="mb-6">
        <span
          className="inline-block text-[10px] px-3 py-1 rounded-full"
          style={{
            fontFamily: isJa ? "'Noto Sans JP', sans-serif" : "'Space Mono', monospace",
            letterSpacing: isJa ? 1 : 3,
            textTransform: isJa ? "none" : "uppercase",
            background: "linear-gradient(135deg, rgba(51,112,254,0.12), rgba(255,4,19,0.08))",
            border: "1px solid rgba(51,112,254,0.15)",
            color: "#7BAAFF",
          }}
        >
          {l.badge}
        </span>
      </div>

      {/* Title */}
      <h1
        className="text-5xl font-black m-0 mb-3 leading-tight"
        style={{
          fontFamily: isJa ? "'Noto Sans JP', sans-serif" : "'Inter', sans-serif",
          letterSpacing: isJa ? 2 : -2,
          background: "linear-gradient(135deg, #fff 40%, #5C8DFE)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {l.title}
      </h1>
      <p
        className="text-gray-500 text-base m-0 mb-16"
        style={{
          fontFamily: isJa ? "'Noto Sans JP', sans-serif" : "'Inter', sans-serif",
        }}
      >
        {l.subtitle}
      </p>

      {/* Opening line — the hook */}
      <p
        className="text-2xl font-bold m-0 mb-16 leading-relaxed"
        style={{
          fontFamily: isJa ? "'Noto Sans JP', sans-serif" : "'Inter', sans-serif",
          color: "#e2e8f0",
          letterSpacing: isJa ? 1 : -0.5,
        }}
      >
        {l.openingLine}
      </p>

      {/* ── The Problem ── */}
      <section className="mb-16">
        <SectionLabel text={l.problemTitle} />
        <p className="text-[15px] leading-relaxed text-gray-400 m-0 mb-6" style={bodyFont(isJa)}>
          {l.problemBody}
        </p>
        <blockquote
          className="m-0 pl-5 py-3 mb-6"
          style={{
            borderLeft: "2px solid rgba(51,112,254,0.3)",
            fontStyle: "italic",
            color: "#94a3b8",
            fontFamily: isJa ? "'Noto Sans JP', sans-serif" : "'Inter', sans-serif",
            fontSize: 15,
            lineHeight: 1.7,
          }}
        >
          {l.problemQuote}
        </blockquote>
        <p className="text-[15px] leading-relaxed text-gray-400 m-0 mb-6" style={bodyFont(isJa)}>
          {l.problemAfter}
        </p>
        <p className="text-[15px] leading-relaxed text-gray-400 m-0" style={bodyFont(isJa)}>
          {l.problemBias}
        </p>
      </section>

      {/* ── What We Believe ── */}
      <section className="mb-16">
        <SectionLabel text={l.beliefTitle} />
        <div className="grid gap-5">
          {l.beliefs.map((b, i) => (
            <div
              key={i}
              className="rounded-xl p-5 relative overflow-hidden"
              style={{
                background: "rgba(51,112,254,0.03)",
                border: "1px solid rgba(51,112,254,0.08)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5"
                  style={{
                    background: "linear-gradient(135deg, rgba(51,112,254,0.12), rgba(138,60,184,0.08))",
                    color: "#5C8DFE",
                  }}
                >
                  {beliefIcons[b.icon]}
                </div>
                <div>
                  <h3
                    className="text-sm font-bold text-gray-200 m-0 mb-1.5"
                    style={bodyFont(isJa)}
                  >
                    {b.title}
                  </h3>
                  <p
                    className="text-[13px] leading-relaxed text-gray-500 m-0"
                    style={bodyFont(isJa)}
                  >
                    {b.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Origin Story ── */}
      <section className="mb-16">
        <SectionLabel text={l.originTitle} />
        <p className="text-[15px] leading-relaxed text-gray-400 m-0 mb-5" style={bodyFont(isJa)}>
          {l.originBody}
        </p>
        <p className="text-[15px] leading-relaxed text-gray-400 m-0" style={bodyFont(isJa)}>
          {l.originBody2}
        </p>
      </section>

      {/* ── Methodology ── */}
      <section className="mb-16">
        <SectionLabel text={l.howTitle} />
        <p className="text-[15px] leading-relaxed text-gray-400 m-0 mb-8" style={bodyFont(isJa)}>
          {l.howIntro}
        </p>
        <div className="space-y-4 mb-8">
          {l.howItems.map((item, i) => (
            <HowItem key={i} label={item.label} detail={item.detail} isJa={isJa} index={i} />
          ))}
        </div>
        <div
          className="rounded-lg px-5 py-4 mb-0"
          style={{
            background: "rgba(255,170,50,0.04)",
            borderLeft: "2px solid rgba(255,170,50,0.25)",
          }}
        >
          <p className="text-[13px] leading-relaxed text-gray-500 m-0" style={bodyFont(isJa)}>
            {l.howLimitations}
          </p>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section className="mb-16">
        <SectionLabel text={l.roadmapTitle} />
        <p className="text-[15px] leading-relaxed text-gray-400 m-0" style={bodyFont(isJa)}>
          {l.roadmapBody}
        </p>
      </section>

      {/* ── Contribute CTA ── */}
      <section
        className="rounded-2xl p-8 mb-16 text-center relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(51,112,254,0.06) 0%, rgba(138,60,184,0.04) 50%, rgba(255,4,19,0.05) 100%)",
          border: "1px solid rgba(51,112,254,0.12)",
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, #3370FE, #8A3CB8, #E0247A, #FF0413, transparent)",
          }}
        />
        <HeartHandshake
          className="w-8 h-8 mx-auto mb-4"
          style={{ color: "#5C8DFE" }}
        />
        <h3
          className="text-lg font-bold text-white m-0 mb-2"
          style={bodyFont(isJa)}
        >
          {l.contributeTitle}
        </h3>
        <p
          className="text-sm text-gray-400 m-0 mb-6 max-w-md mx-auto"
          style={bodyFont(isJa)}
        >
          {l.contributeBody}
        </p>
        <a
          href="https://github.com/ai-driven-office/model-providers-comparison/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-semibold no-underline transition-all duration-200"
          style={{
            fontFamily: isJa ? "'Noto Sans JP', sans-serif" : "'Inter', sans-serif",
            fontSize: 13,
            background: "rgba(51,112,254,0.12)",
            borderColor: "rgba(51,112,254,0.25)",
            color: "#7BAAFF",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(51,112,254,0.22)";
            e.currentTarget.style.borderColor = "rgba(51,112,254,0.4)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(51,112,254,0.12)";
            e.currentTarget.style.borderColor = "rgba(51,112,254,0.25)";
            e.currentTarget.style.color = "#7BAAFF";
          }}
        >
          <GitPullRequest className="w-4 h-4" />
          {l.contributeButton}
        </a>
      </section>

      {/* Footer */}
      <footer className="pt-6 pb-4 relative" style={{ borderTop: "1px solid rgba(51,112,254,0.08)" }}>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-48"
          style={{
            background:
              "linear-gradient(90deg, transparent, #3370FE, #8A3CB8, #E0247A, #FF0413, transparent)",
          }}
        />
        <div className="flex flex-col items-center gap-3">
          <AidLogo className="h-6 w-auto opacity-40" />
          <div
            className="text-[11px] text-gray-600"
            style={{
              fontFamily: isJa ? "'Noto Sans JP', sans-serif" : "'Space Mono', monospace",
            }}
          >
            {l.footerLine}
          </div>
          <div
            className="text-[10px] text-gray-700"
            style={{
              fontFamily: isJa ? "'Noto Sans JP', sans-serif" : "'Inter', sans-serif",
            }}
          >
            {l.copyright}
          </div>
        </div>
      </footer>
    </div>
  );
}

function bodyFont(isJa: boolean): React.CSSProperties {
  return {
    fontFamily: isJa ? "'Noto Sans JP', sans-serif" : "'Inter', sans-serif",
  };
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className="w-1 h-5 rounded-full"
        style={{
          background: "linear-gradient(180deg, #3370FE, #E0247A)",
        }}
      />
      <h2
        className="text-xs font-bold m-0 tracking-widest uppercase"
        style={{
          fontFamily: "'Space Mono', monospace",
          color: "#5C8DFE",
          letterSpacing: 3,
        }}
      >
        {text}
      </h2>
    </div>
  );
}

function HowItem({
  label,
  detail,
  isJa,
  index,
}: {
  label: string;
  detail: string;
  isJa: boolean;
  index: number;
}) {
  const accentColors = ["#3370FE", "#8A3CB8", "#E0247A", "#FF0413"];
  const color = accentColors[index % accentColors.length];

  return (
    <div
      className="flex items-start gap-4 rounded-lg px-5 py-4"
      style={{
        background: "rgba(255,255,255,0.015)",
        borderLeft: `2px solid ${color}40`,
      }}
    >
      <div
        className="shrink-0 text-[11px] font-bold mt-0.5 w-5 h-5 rounded flex items-center justify-center"
        style={{
          fontFamily: "'Space Mono', monospace",
          background: `${color}18`,
          color,
        }}
      >
        {index + 1}
      </div>
      <div>
        <div
          className="text-sm font-bold text-gray-300 mb-1"
          style={bodyFont(isJa)}
        >
          {label}
        </div>
        <div
          className="text-[13px] leading-relaxed text-gray-500"
          style={bodyFont(isJa)}
        >
          {detail}
        </div>
      </div>
    </div>
  );
}
