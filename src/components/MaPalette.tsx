
import React from "react";
import { X as XIcon, Copy as CopyIcon } from "lucide-react";
import { getContrastColor } from "@/lib/colorUtils";

interface MaPaletteProps {
  palette: string[];
  onRemove: (hex: string) => void;
  onCopy: (hex: string) => void;
}

export default function MaPalette({ palette, onRemove, onCopy }: MaPaletteProps) {
  if (palette.length === 0) {
    return (
      <div className="w-full text-center p-8 border-2 border-dashed rounded-xl mt-8 animate-fade-in">
        <h2 className="text-lg font-semibold text-muted-foreground">Votre palette est vide</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Ajoutez des couleurs depuis la roulette ou l'extracteur d'image.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center mt-8 animate-fade-in">
      <h2 className="text-xl font-bold mb-4">Ma Palette</h2>
      <div className="flex flex-wrap gap-4 w-full justify-center bg-card p-6 rounded-xl shadow-lg">
        {palette.map((hex) => (
          <div
            key={hex}
            className="relative flex items-center bg-background border rounded-lg shadow-sm px-2 py-1 group min-w-[68px]"
          >
            <span
              className="text-xs font-mono px-2 py-1 rounded"
              style={{
                background: hex,
                color: getContrastColor(hex),
                textShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              {hex}
            </span>
            <button
              className="ml-2 p-1 rounded hover:bg-muted"
              title="Copier"
              onClick={() => onCopy(hex)}
            >
              <CopyIcon size={13} />
            </button>
            <button
              className="ml-1 p-1 rounded hover:bg-destructive/90 hover:text-destructive-foreground"
              title="Retirer"
              onClick={() => onRemove(hex)}
            >
              <XIcon size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
