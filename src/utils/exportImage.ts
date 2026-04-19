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
const MOBILE_EXPORT_TITLE_OFFSET_X_PX = 15;
const MOBILE_EXPORT_TITLE_OFFSET_Y_PX = -18;

let cachedFontEmbedCss: string | null = null;
let html2canvasModulePromise: Promise<typeof import("html2canvas")> | null =
  null;
let htmlToImageModulePromise: Promise<typeof import("html-to-image")> | null =
  null;

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
  const byViewport =
    window.matchMedia?.("(max-width: 960px)")?.matches ?? false;
  return byUa || byViewport;
}

function nextAnimationFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

async function waitForFontsReady() {
  if (typeof document.fonts?.ready !== "undefined") {
    await document.fonts.ready;
  }

  if (typeof document.fonts?.load === "function") {
    try {
      await Promise.all([
        document.fonts.load("400 16px 'YuanGuSongTi-F'"),
        document.fonts.load("400 16px 'SFMono-Regular'"),
        document.fonts.load("400 16px 'Menlo'"),
      ]);
    } catch {
      // Continue with already available fonts.
    }
  }
}

async function ensureFontEmbedCss(root: HTMLElement) {
  if (!cachedFontEmbedCss) {
    try {
      const { getFontEmbedCSS } = await loadHtmlToImageModule();
      cachedFontEmbedCss = await getFontEmbedCSS(root, {
        preferredFontFormat: "woff2",
      });
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

function createExportHost(width: number, height: number) {
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  Object.assign(host.style, {
    position: "fixed",
    top: "0",
    left: "-20000px",
    width: `${width}px`,
    height: `${height}px`,
    overflow: "hidden",
    opacity: "0",
    pointerEvents: "none",
    isolation: "isolate",
    contain: "layout size style paint",
  });
  return host;
}

function createExportClone(
  element: HTMLElement,
  resolvedStyle: ExportStyleOverride,
) {
  const clone = element.cloneNode(true) as HTMLElement;

  for (const key of STYLE_KEYS) {
    const nextValue = resolvedStyle[key];
    if (typeof nextValue === "string") {
      clone.style[key] = nextValue;
    }
  }

  clone.dataset.exportRoot = "true";
  return clone;
}

function applyExportFixes(root: HTMLElement, mobileLike: boolean) {
  if (!mobileLike) {
    return;
  }

  root.querySelectorAll<HTMLElement>(".luoxiaohei-title").forEach((title) => {
    title.style.transform = `translate(${MOBILE_EXPORT_TITLE_OFFSET_X_PX}px, ${MOBILE_EXPORT_TITLE_OFFSET_Y_PX}px)`;
  });
}

async function renderWithHtmlToImage(
  element: HTMLElement,
  options: Required<
    Pick<
      ExportElementAsPngOptions,
      "width" | "height" | "backgroundColor" | "pixelRatio"
    >
  >,
) {
  const { toPng } = await loadHtmlToImageModule();

  return toPng(element, {
    cacheBust: true,
    pixelRatio: options.pixelRatio,
    backgroundColor: options.backgroundColor,
    width: options.width,
    height: options.height,
    preferredFontFormat: "woff2",
    fontEmbedCSS: cachedFontEmbedCss ?? undefined,
    skipAutoScale: true,
  });
}

async function renderWithHtml2Canvas(
  element: HTMLElement,
  options: Required<
    Pick<
      ExportElementAsPngOptions,
      "width" | "height" | "backgroundColor" | "pixelRatio"
    >
  >,
) {
  const html2canvas = (await loadHtml2canvasModule()).default;
  const canvas = await html2canvas(element, {
    backgroundColor: options.backgroundColor,
    useCORS: true,
    allowTaint: true,
    width: options.width,
    height: options.height,
    windowWidth: options.width,
    windowHeight: options.height,
    scale: options.pixelRatio,
    logging: false,
  });

  return canvas.toDataURL("image/png");
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
  const exportOptions = {
    width,
    height,
    backgroundColor,
    pixelRatio,
  } as const;
  const preferHtml2Canvas = isMobileLikeDevice();
  const host = createExportHost(width, height);
  const exportClone = createExportClone(element, resolvedStyle);

  try {
    host.append(exportClone);
    document.body.append(host);
    applyExportFixes(exportClone, preferHtml2Canvas);

    await waitForFontsReady();
    await waitForImagesReady(exportClone);
    await nextAnimationFrame();
    await nextAnimationFrame();

    let dataUrl: string;
    if (preferHtml2Canvas) {
      try {
        dataUrl = await renderWithHtml2Canvas(exportClone, exportOptions);
      } catch {
        await ensureFontEmbedCss(exportClone);
        dataUrl = await renderWithHtmlToImage(exportClone, exportOptions);
      }
    } else {
      try {
        await ensureFontEmbedCss(exportClone);
        dataUrl = await renderWithHtmlToImage(exportClone, exportOptions);
      } catch {
        dataUrl = await renderWithHtml2Canvas(exportClone, exportOptions);
      }
    }

    const link = document.createElement("a");
    link.download = fileName;
    link.href = dataUrl;
    link.click();
  } finally {
    host.remove();
  }
}
