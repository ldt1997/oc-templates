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
