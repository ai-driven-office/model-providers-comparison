declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function event(name: string, params?: Record<string, string | number>) {
  window.gtag?.("event", name, params);
}

export function trackTabSwitch(tab: string) {
  event("tab_switch", { tab_name: tab });
}

export function trackLangSwitch(lang: string) {
  event("lang_switch", { language: lang });
}

export function trackShare(method: string) {
  event("share", { method, content_type: "dashboard" });
}

export function trackOutboundLink(url: string) {
  event("click", {
    event_category: "outbound",
    event_label: url,
    transport_type: "beacon",
  });
}
