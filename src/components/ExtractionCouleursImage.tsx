
import React, { useRef, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { extractImagePalette } from "@/lib/colorUtils";
import { cn } from "@/lib/utils";

interface Couleur {
  hex: string;
  rgb: string;
}

export default function ExtractionCouleursImage({
  onExtracted,
}: {
  onExtracted?: (palette: Couleur[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [palette, setPalette] = useState<Couleur[]>([]);
  const [imgUrl, setImgUrl] = useState<string>();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("loading");
    try {
      const url = URL.createObjectURL(file);
      setImgUrl(url);
      const pal = await extractImagePalette(file, 6);
      setPalette(pal);
      onExtracted?.(pal);
      setStatus("done");
    } catch (e) {
      setStatus("error");
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex items-center gap-2">
        <ImageIcon className="text-primary w-6 h-6" />
        <span className="font-semibold text-lg">Extraire les couleurs d’une image</span>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        className="bg-secondary px-4 py-2 rounded font-semibold hover-scale shadow mb-3"
        onClick={() => fileInputRef.current?.click()}
      >
        Importer une image
      </button>
      {status === "loading" && (
        <div className="text-xs text-muted-foreground mt-2 animate-pulse">Analyse de l’image…</div>
      )}
      {imgUrl && (
        <div className="mt-4 flex flex-col items-center">
          <img src={imgUrl} alt="Aperçu" className="max-h-32 rounded shadow mb-2 border" />
          <div className="flex gap-2 mt-2">
            {palette.map((clr, idx) => (
              <button
                className={cn(
                  "flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition shadow border rounded-lg p-2 min-w-[64px]"
                )}
                style={{ backgroundColor: clr.hex }}
                key={idx}
                onClick={() => {
                  navigator.clipboard.writeText(clr.hex);
                }}
                title={"Copier " + clr.hex}
              >
                <div
                  className="w-6 h-6 rounded-full border mb-1"
                  style={{
                    background: clr.hex,
                    borderColor: "#fff",
                  }}
                />
                <span
                  className="text-xs font-mono"
                  style={{
                    color: chromaContrast(clr.hex) < 3.5 ? "#fff" : "#333",
                  }}
                >
                  {clr.hex}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      {status === "error" && (
        <div className="text-red-500 text-xs mt-2">Erreur lors de l’extraction de la palette.</div>
      )}
    </div>
  );
}
function chromaContrast(hex: string) {
  // YIQ contrast
  hex = hex.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 / 128;
}
