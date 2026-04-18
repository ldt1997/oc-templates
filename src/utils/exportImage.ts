type ExportStyleOverride = Partial<
  Pick<
    CSSStyleDeclaration,
    | "width"
    | "height"
    | "maxWidth"
    | "aspectRatio"
    | "borderRadius"
    | "transform"
    | "fontSize"
  >
>;

export interface ExportElementAsPngOptions {
  fileName: string;
  width: number;
  height: number;
  backgroundColor?: string;
  pixelRatio?: number;
  styleOverride?: ExportStyleOverride;
}

const DEFAULT_STYLE_OVERRIDE: ExportStyleOverride = {
  maxWidth: "none",
  aspectRatio: "auto",
  borderRadius: "0",
  transform: "none",
};

const STYLE_KEYS: Array<keyof ExportStyleOverride> = [
  "width",
  "height",
  "maxWidth",
  "aspectRatio",
  "borderRadius",
  "transform",
  "fontSize",
];

let cachedFontEmbedCss: string | null = null;
let html2canvasModulePromise: Promise<typeof import("html2canvas")> | null = null;
let htmlToImageModulePromise: Promise<typeof import("html-to-image")> | null = null;

function loadHtml2canvasModule() {
  if (!html2canvasModulePromise) {
    html2canvasModulePromise = import("html2canvas");
  }

  return html2canvasModulePromise;
}

function loadHtmlToImageModule() {
  if (!htmlToImageModulePromise) {
    htmlToImageModulePromise = import("html-to-image");
  }

  return htmlToImageModulePromise;
}

function isMobileLikeDevice() {
  const ua = navigator.userAgent || "";
  const byUa = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(ua);
  const byViewport = window.matchMedia?.("(max-width: 960px)")?.matches ?? false;
  return byUa || byViewport;
}

function nextAnimationFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

async function waitForFontsReady(root: HTMLElement) {
  if (typeof document.fonts?.ready !== "undefined") {
    await document.fonts.ready;
  }

  if (typeof document.fonts?.load === "function") {
    try {
      await Promise.all([
        document.fonts.load("400 16px 'YuanGuSongTi-F'"),
        document.fonts.load("400 16px 'Monaco'"),
      ]);
    } catch {
      // Continue with already available fonts.
    }
  }

  if (!cachedFontEmbedCss) {
    try {
      const { getFontEmbedCSS } = await loadHtmlToImageModule();
      cachedFontEmbedCss = await getFontEmbedCSS(root);
    } catch {
      cachedFontEmbedCss = "";
    }
  }
}

async function waitForImagesReady(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map(async (img) => {
      if (img.complete && img.naturalWidth > 0) {
        return;
      }

      await new Promise<void>((resolve) => {
        const cleanup = () => {
          img.removeEventListener("load", onLoad);
          img.removeEventListener("error", onError);
        };

        const onLoad = async () => {
          cleanup();
          if (typeof img.decode === "function") {
            try {
              await img.decode();
            } catch {
              // Ignore decode failures and allow export to proceed.
            }
          }
          resolve();
        };

        const onError = () => {
          cleanup();
          resolve();
        };

        img.addEventListener("load", onLoad);
        img.addEventListener("error", onError);
      });
    }),
  );
}

export async function exportElementAsPng(
  element: HTMLElement,
  options: ExportElementAsPngOptions,
): Promise<void> {
  const {
    fileName,
    width,
    height,
    backgroundColor = "#ffffff",
    pixelRatio = 1,
    styleOverride,
  } = options;

  const resolvedStyle: ExportStyleOverride = {
    width: `${width}px`,
    height: `${height}px`,
    ...DEFAULT_STYLE_OVERRIDE,
    ...styleOverride,
  };

  const previousStyle: Partial<Record<keyof ExportStyleOverride, string>> = {};

  try {
    for (const key of STYLE_KEYS) {
      previousStyle[key] = element.style[key] ?? "";
      const nextValue = resolvedStyle[key];
      if (typeof nextValue === "string") {
        element.style[key] = nextValue;
      }
    }

    await waitForFontsReady(element);
    await waitForImagesReady(element);
    await nextAnimationFrame();
    await nextAnimationFrame();

    const isMobileExport = isMobileLikeDevice();

    const dataUrl = isMobileExport
      ? await (async () => {
          const html2canvas = (await loadHtml2canvasModule()).default;
          const canvas = await html2canvas(element, {
            backgroundColor,
            useCORS: true,
            allowTaint: true,
            width,
            height,
            scale: pixelRatio,
            logging: false,
          });
          return canvas.toDataURL("image/png");
        })()
      : await (async () => {
          const { toPng } = await loadHtmlToImageModule();
          return toPng(element, {
            cacheBust: true,
            pixelRatio,
            backgroundColor,
            width,
            height,
            fontEmbedCSS: cachedFontEmbedCss ?? undefined,
          });
        })();

    const link = document.createElement("a");
    link.download = fileName;
    link.href = dataUrl;
    link.click();
  } finally {
    for (const key of STYLE_KEYS) {
      element.style[key] = previousStyle[key] ?? "";
    }
  }
}
