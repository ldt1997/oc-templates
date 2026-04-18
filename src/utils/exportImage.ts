import { toPng } from "html-to-image";

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

    await waitForImagesReady(element);

    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio,
      backgroundColor,
      width,
      height,
    });

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
