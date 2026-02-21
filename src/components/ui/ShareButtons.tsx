import { useState, useCallback, useRef, useEffect } from "react";
import { Share2, Check, Link2 } from "lucide-react";
import type { Lang } from "../../data/i18n";

interface ShareLabels {
  shareX: string;
  shareCopy: string;
  shareNative: string;
  shareCopied: string;
}

interface Props {
  shareText: string;
  shareUrl: string;
  shareTitle: string;
  labels: ShareLabels;
  lang: Lang;
  reduceMotion: boolean;
  onShare?: () => void;
}

function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function ShareButtons({
  shareText,
  shareUrl,
  shareTitle,
  labels,
  lang,
  reduceMotion,
  onShare,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCanNativeShare(typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const doNativeShare = useCallback(async () => {
    try {
      await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      onShare?.();
    } catch {
      /* user cancelled */
    }
  }, [shareTitle, shareText, shareUrl, onShare]);

  const doXShare = useCallback(() => {
    const params = new URLSearchParams({
      text: shareText,
      url: shareUrl,
    });
    window.open(
      `https://x.com/intent/tweet?${params.toString()}`,
      "_blank",
      "noopener,noreferrer,width=550,height=420",
    );
    onShare?.();
    setOpen(false);
  }, [shareText, shareUrl, onShare]);

  const doCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      onShare?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  }, [shareText, shareUrl, onShare]);

  const btnBase =
    "flex items-center gap-2 w-full px-3 py-2 rounded-lg border-none cursor-pointer text-left text-[12px] font-medium transition-all duration-150";

  return (
    <div className="relative" ref={popRef}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center justify-center w-8 h-8 rounded-lg border cursor-pointer transition-all duration-200"
        style={{
          background: open
            ? "rgba(51,112,254,0.15)"
            : "rgba(51,112,254,0.06)",
          borderColor: open
            ? "rgba(51,112,254,0.3)"
            : "rgba(51,112,254,0.12)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(51,112,254,0.15)";
          e.currentTarget.style.borderColor = "rgba(51,112,254,0.25)";
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.background = "rgba(51,112,254,0.06)";
            e.currentTarget.style.borderColor = "rgba(51,112,254,0.12)";
          }
        }}
        title={labels.shareNative}
      >
        <Share2 className="w-3.5 h-3.5 text-gray-400 transition-colors duration-200 group-hover:text-white" />
      </button>

      {/* Popover */}
      {open && (
        <div
          className="absolute right-0 top-10 z-50 min-w-[200px] rounded-xl border p-1.5 shadow-2xl"
          style={{
            background: "rgba(12,20,30,0.95)",
            borderColor: "rgba(51,112,254,0.15)",
            backdropFilter: "blur(16px)",
            animation: reduceMotion ? "none" : "sharePopIn 0.15s ease-out",
          }}
        >
          {/* X / Twitter */}
          <button
            onClick={doXShare}
            className={btnBase}
            style={{ background: "transparent", color: "#ccc" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(29,155,240,0.12)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#ccc";
            }}
          >
            <XIcon className="w-3.5 h-3.5" />
            {labels.shareX}
          </button>

          {/* Native Share — shown when browser supports navigator.share */}
          {canNativeShare && (
            <button
              onClick={() => {
                doNativeShare();
                setOpen(false);
              }}
              className={btnBase}
              style={{ background: "transparent", color: "#ccc" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(51,112,254,0.12)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#ccc";
              }}
            >
              <Share2 className="w-3.5 h-3.5" />
              {labels.shareNative}
            </button>
          )}

          {/* Divider */}
          <div
            className="h-px mx-2 my-1"
            style={{ background: "rgba(51,112,254,0.1)" }}
          />

          {/* Copy Link */}
          <button
            onClick={doCopy}
            className={btnBase}
            style={{
              background: copied ? "rgba(34,197,94,0.1)" : "transparent",
              color: copied ? "#22c55e" : "#ccc",
            }}
            onMouseEnter={(e) => {
              if (!copied) {
                e.currentTarget.style.background = "rgba(51,112,254,0.12)";
                e.currentTarget.style.color = "#fff";
              }
            }}
            onMouseLeave={(e) => {
              if (!copied) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#ccc";
              }
            }}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Link2 className="w-3.5 h-3.5" />
            )}
            {copied ? labels.shareCopied : labels.shareCopy}
          </button>
        </div>
      )}

      <style>{`
        @keyframes sharePopIn {
          from { opacity: 0; transform: translateY(-4px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

interface ShareCtaProps {
  shareText: string;
  shareUrl: string;
  labels: {
    shareCtaTitle: string;
    shareCtaBody: string;
    shareX: string;
    shareCopy: string;
    shareCopied: string;
  };
  lang: Lang;
  reduceMotion: boolean;
  onShare?: () => void;
}

export function ShareCta({
  shareText,
  shareUrl,
  labels,
  lang,
  reduceMotion,
  onShare,
}: ShareCtaProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator.share === "function");
  }, []);

  const doNativeShare = useCallback(async () => {
    try {
      await navigator.share({ title: labels.shareCtaTitle, text: shareText, url: shareUrl });
      onShare?.();
    } catch {
      /* user cancelled */
    }
  }, [labels.shareCtaTitle, shareText, shareUrl, onShare]);

  const doXShare = useCallback(() => {
    const params = new URLSearchParams({
      text: shareText,
      url: shareUrl,
    });
    window.open(
      `https://x.com/intent/tweet?${params.toString()}`,
      "_blank",
      "noopener,noreferrer,width=550,height=420",
    );
    onShare?.();
  }, [shareText, shareUrl, onShare]);

  const doCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      onShare?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  }, [shareText, shareUrl, onShare]);

  const isJa = lang === "ja";

  return (
    <div
      className="mt-6 rounded-xl border relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(29,155,240,0.04) 0%, rgba(51,112,254,0.06) 50%, rgba(138,60,184,0.04) 100%)",
        borderColor: "rgba(51,112,254,0.12)",
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(29,155,240,0.4), rgba(51,112,254,0.3), transparent)",
        }}
      />
      <div className="px-6 py-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(51,112,254,0.15), rgba(138,60,184,0.1))",
            border: "1px solid rgba(51,112,254,0.2)",
          }}
        >
          <Share2 className="w-5 h-5 text-gray-300" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3
            className="text-sm font-bold text-white m-0 mb-1"
            style={{
              fontFamily: isJa
                ? "'Noto Sans JP', sans-serif"
                : "'Inter', sans-serif",
            }}
          >
            {labels.shareCtaTitle}
          </h3>
          <p
            className="text-xs text-gray-400 m-0 leading-relaxed max-w-lg"
            style={{
              fontFamily: isJa
                ? "'Noto Sans JP', sans-serif"
                : "'Inter', sans-serif",
            }}
          >
            {labels.shareCtaBody}
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {/* Native share — OS share sheet */}
          {canNativeShare && (
            <button
              onClick={doNativeShare}
              className="group flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm font-semibold no-underline transition-all duration-200"
              style={{
                fontFamily: isJa
                  ? "'Noto Sans JP', sans-serif"
                  : "'Inter', sans-serif",
                fontSize: 12,
                background: "rgba(51,112,254,0.1)",
                borderColor: "rgba(51,112,254,0.25)",
                color: "#7BAAFF",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(51,112,254,0.2)";
                e.currentTarget.style.borderColor = "rgba(51,112,254,0.4)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(51,112,254,0.1)";
                e.currentTarget.style.borderColor = "rgba(51,112,254,0.25)";
                e.currentTarget.style.color = "#7BAAFF";
              }}
            >
              <Share2 className="w-3 h-3" />
              {isJa ? "共有" : "Share"}
            </button>
          )}

          {/* X button */}
          <button
            onClick={doXShare}
            className="group flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm font-semibold no-underline transition-all duration-200"
            style={{
              fontFamily: isJa
                ? "'Noto Sans JP', sans-serif"
                : "'Inter', sans-serif",
              fontSize: 12,
              background: "rgba(255,255,255,0.05)",
              borderColor: "rgba(255,255,255,0.12)",
              color: "#ccc",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
              e.currentTarget.style.color = "#ccc";
            }}
          >
            <XIcon className="w-3.5 h-3.5" />
            {labels.shareX}
          </button>

          {/* Copy link button */}
          <button
            onClick={doCopy}
            className="group flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm font-semibold no-underline transition-all duration-200"
            style={{
              fontFamily: isJa
                ? "'Noto Sans JP', sans-serif"
                : "'Inter', sans-serif",
              fontSize: 12,
              background: copied
                ? "rgba(34,197,94,0.12)"
                : "rgba(51,112,254,0.1)",
              borderColor: copied
                ? "rgba(34,197,94,0.3)"
                : "rgba(51,112,254,0.25)",
              color: copied ? "#22c55e" : "#7BAAFF",
            }}
            onMouseEnter={(e) => {
              if (!copied) {
                e.currentTarget.style.background = "rgba(51,112,254,0.2)";
                e.currentTarget.style.borderColor = "rgba(51,112,254,0.4)";
                e.currentTarget.style.color = "#fff";
              }
            }}
            onMouseLeave={(e) => {
              if (!copied) {
                e.currentTarget.style.background = "rgba(51,112,254,0.1)";
                e.currentTarget.style.borderColor = "rgba(51,112,254,0.25)";
                e.currentTarget.style.color = "#7BAAFF";
              }
            }}
          >
            {copied ? (
              <Check className="w-3 h-3" />
            ) : (
              <Link2 className="w-3 h-3" />
            )}
            {copied ? labels.shareCopied : labels.shareCopy}
          </button>
        </div>
      </div>
    </div>
  );
}
