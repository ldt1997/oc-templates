import { useEffect, useState, type RefObject } from "react";

export function useCanvasBaseFontSize(canvasRef: RefObject<HTMLDivElement | null>) {
  const [canvasBaseFontSize, setCanvasBaseFontSize] = useState(10);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) {
      return;
    }

    function updateBaseFontSize(width: number) {
      const nextSize = Math.max(width / 108, 1);
      setCanvasBaseFontSize((current) =>
        Math.abs(current - nextSize) > 0.02 ? nextSize : current,
      );
    }

    updateBaseFontSize(canvasElement.getBoundingClientRect().width);

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      updateBaseFontSize(entry.contentRect.width);
    });

    observer.observe(canvasElement);
    return () => {
      observer.disconnect();
    };
  }, [canvasRef]);

  return canvasBaseFontSize;
}
