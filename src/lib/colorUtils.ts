/**
 * Utilitaire pour extraire une palette de couleurs principale d'une image (client-side).
 * Similaire à ColorThief/tinycolor, mais ultra-simple pour la démo.
 */

export async function extractImagePalette(
  file: Blob,
  colorCount = 6
): Promise<{ hex: string; rgb: string }[]> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas not supported");
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        // Extract unique colors, then group close ones (poor-man's quantization)
        const buckets: Record<string, number> = {};
        for (let i = 0; i < data.length; i += 4 * 8) { // basse résolution
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const key = [Math.round(r/16), Math.round(g/16), Math.round(b/16)].join(",");
          buckets[key] = (buckets[key] || 0) + 1;
        }

        // Prendre les N groupes les plus fréquents
        const keys = Object.entries(buckets)
          .sort((a, b) => b[1] - a[1])
          .slice(0, colorCount)
          .map(e => e[0]);

        const palette = keys.map(k => {
          const [r, g, b] = k.split(",").map(x => parseInt(x) * 16);
          return {
            hex: rgbToHex(r, g, b),
            rgb: `rgb(${r},${g},${b})`
          };
        });
        resolve(palette);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("")
  );
}

export function getContrastColor(hex: string): string {
  if (!hex) return "#000000";
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Formule de la luminance relative (YIQ)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}
