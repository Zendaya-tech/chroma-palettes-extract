
import React from "react";

export default function PaletteRecente({
  couleurs,
  onCopy,
}: {
  couleurs: { hex: string; rgb?: string }[];
  onCopy?: (hex: string) => void;
}) {
  if (!couleurs?.length) return null;

  return (
    <div className="mt-8 animate-fade-in">
      <div className="font-semibold text-md mb-3">Palette récente</div>
      <div className="flex gap-3 flex-wrap">
        {couleurs.map((clr, i) => (
          <button
            key={i}
            className="rounded-xl shadow border flex flex-col items-center px-3 py-2 min-w-[60px] hover-scale"
            style={{ background: clr.hex }}
            title={"Copier " + clr.hex}
            onClick={() => {
              navigator.clipboard.writeText(clr.hex);
              onCopy?.(clr.hex);
            }}
          >
            <span
              className="block text-xs font-mono mb-1"
              style={{
                color: clr.hex.toLowerCase() === "#ffffff" ? "#333" : "#fff",
                textShadow: "0 1px 4px rgba(0,0,0,0.4)",
              }}
            >
              {clr.hex}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
