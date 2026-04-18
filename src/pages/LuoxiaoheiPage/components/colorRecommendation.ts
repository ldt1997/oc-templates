export type PaletteColor = {
  key: string;
  value: string;
  rgb: [number, number, number];
};

export type ColorPair = {
  id: string;
  left: PaletteColor;
  right: PaletteColor;
};

export function hexToRgbTuple(hex: string): [number, number, number] {
  const normalized = hex.trim().replace("#", "");
  const fullHex = normalized.length === 3
    ? normalized.split("").map((c) => `${c}${c}`).join("")
    : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(fullHex)) {
    return [0, 0, 0];
  }

  return [
    parseInt(fullHex.slice(0, 2), 16),
    parseInt(fullHex.slice(2, 4), 16),
    parseInt(fullHex.slice(4, 6), 16),
  ];
}

function rgbDistance(a: [number, number, number], b: [number, number, number]): number {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return dr * dr + dg * dg + db * db;
}

async function extractThemeColors(imageUrl: string, count = 3): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const sampleSize = 96;
      const canvas = document.createElement("canvas");
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("无法初始化颜色采样画布"));
        return;
      }

      ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
      const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize);
      const buckets = new Map<string, { count: number; sumR: number; sumG: number; sumB: number }>();

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a < 200) {
          continue;
        }

        const bucketKey = `${Math.floor(r / 32)}-${Math.floor(g / 32)}-${Math.floor(b / 32)}`;
        const bucket = buckets.get(bucketKey);
        if (bucket) {
          bucket.count += 1;
          bucket.sumR += r;
          bucket.sumG += g;
          bucket.sumB += b;
        } else {
          buckets.set(bucketKey, { count: 1, sumR: r, sumG: g, sumB: b });
        }
      }

      const sorted = [...buckets.values()]
        .sort((a, b) => b.count - a.count)
        .map((bucket) => {
          const avgR = Math.round(bucket.sumR / bucket.count);
          const avgG = Math.round(bucket.sumG / bucket.count);
          const avgB = Math.round(bucket.sumB / bucket.count);
          const hex = `#${avgR.toString(16).padStart(2, "0")}${avgG
            .toString(16)
            .padStart(2, "0")}${avgB.toString(16).padStart(2, "0")}`.toUpperCase();
          return {
            rgb: [avgR, avgG, avgB] as [number, number, number],
            hex,
          };
        });

      const picked: { hex: string; rgb: [number, number, number] }[] = [];
      for (const color of sorted) {
        const similar = picked.some((item) => rgbDistance(item.rgb, color.rgb) < 42 * 42);
        if (!similar) {
          picked.push(color);
        }
        if (picked.length >= count) {
          break;
        }
      }

      resolve(picked.map((item) => item.hex));
    };

    img.onerror = () => reject(new Error("图片颜色提取失败"));
    img.src = imageUrl;
  });
}

export async function buildColorPairsFromImage(
  imageUrl: string,
  palette: PaletteColor[],
  count = 3,
): Promise<ColorPair[]> {
  if (palette.length === 0) {
    return [];
  }

  const extracted = await extractThemeColors(imageUrl, count);
  if (extracted.length === 0) {
    return [];
  }

  const mapped = extracted.map((hex) => {
    const targetRgb = hexToRgbTuple(hex);
    return palette.reduce((best, current) => {
      const currentDistance = rgbDistance(current.rgb, targetRgb);
      const bestDistance = rgbDistance(best.rgb, targetRgb);
      return currentDistance < bestDistance ? current : best;
    });
  });

  const uniqueMapped = mapped.filter(
    (item, index, arr) => arr.findIndex((x) => x.value === item.value) === index,
  );

  const pairs: ColorPair[] = [];
  for (let i = 0; i < uniqueMapped.length; i += 1) {
    for (let j = i + 1; j < uniqueMapped.length; j += 1) {
      const left = uniqueMapped[i];
      const right = uniqueMapped[j];
      pairs.push({
        id: `${left.key}-${right.key}`,
        left,
        right,
      });
    }
  }

  return pairs;
}
