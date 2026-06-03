const COCCOC_TEXT_SIGNATURES = [
  "coccoc",
  "coc_coc",
  "coc coc",
  "cốc cốc",
  "coc-coc",
  "coc_coc_browser",
];

const COCCOC_DOM_SELECTORS = [
  "savior-host",
  "en2vi-host",
  ".corom-element",
  "[id*='coccoc' i]",
  "[class*='coccoc' i]",
  "[id*='coc-coc' i]",
  "[class*='coc-coc' i]",
];

type UserAgentDataLike = {
  brands?: Array<{ brand?: string; version?: string }>;
  getHighEntropyValues?: (hints: string[]) => Promise<Record<string, unknown>>;
};

type CocCocWindowMarkers = Window & {
  coccoc?: unknown;
  CocCoc?: unknown;
  coccoc_addMessageListener?: unknown;
  coccoc_download?: unknown;
  chrome?: { coccoc?: unknown };
};

export function isCocCocBrowser(userAgent?: string) {
  return hasCocCocSignal(readStaticBrowserFingerprint(userAgent))
    || hasCocCocWindowMarker()
    || hasCocCocDomArtifact();
}

export async function detectCocCocBrowser(userAgent?: string) {
  if (isCocCocBrowser(userAgent)) {
    return true;
  }

  const highEntropyFingerprint = await readHighEntropyFingerprint();
  if (hasCocCocSignal(highEntropyFingerprint)) {
    return true;
  }

  await wait(350);
  return isCocCocBrowser(userAgent);
}

function readStaticBrowserFingerprint(userAgent?: string) {
  if (typeof navigator === "undefined") {
    return userAgent || "";
  }

  const ua = userAgent || navigator.userAgent || "";
  const userAgentData = (navigator as Navigator & { userAgentData?: UserAgentDataLike }).userAgentData;
  const brands = (userAgentData?.brands || [])
    .map((item) => `${item.brand || ""} ${item.version || ""}`)
    .join(" ");

  return `${ua} ${brands}`.toLowerCase();
}

async function readHighEntropyFingerprint() {
  if (typeof navigator === "undefined") {
    return "";
  }

  const userAgentData = (navigator as Navigator & { userAgentData?: UserAgentDataLike }).userAgentData;
  if (!userAgentData?.getHighEntropyValues) {
    return "";
  }

  try {
    const values = await userAgentData.getHighEntropyValues(["brands", "fullVersionList", "platform"]);
    return JSON.stringify(values).toLowerCase();
  } catch {
    return "";
  }
}

function hasCocCocWindowMarker() {
  if (typeof window === "undefined") {
    return false;
  }

  const marker = window as CocCocWindowMarkers;
  if (marker.coccoc || marker.CocCoc || marker.coccoc_addMessageListener || marker.coccoc_download || marker.chrome?.coccoc) {
    return true;
  }

  try {
    return Object.getOwnPropertyNames(window).some((name) => hasCocCocSignal(name));
  } catch {
    return false;
  }
}

function hasCocCocDomArtifact() {
  if (typeof document === "undefined") {
    return false;
  }

  return COCCOC_DOM_SELECTORS.some((selector) => {
    try {
      return Boolean(document.querySelector(selector));
    } catch {
      return false;
    }
  });
}

function hasCocCocSignal(value: string) {
  const normalized = value.toLowerCase();
  return COCCOC_TEXT_SIGNATURES.some((signature) => normalized.includes(signature));
}

function wait(ms: number) {
  return new Promise((resolve) => globalThis.setTimeout(resolve, ms));
}
