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
      <div className="w-full text-center p-8 border-2 border-dashed rounded-xl mt-8 animate-in fade-in-0 duration-500">
        <h2 className="text-lg font-semibold text-muted-foreground">Votre palette est vide</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Ajoutez des couleurs depuis la roulette ou l'extracteur d'image.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center mt-8 animate-in fade-in-0 duration-500">
      <h2 className="text-2xl font-bold mb-4 tracking-tight">Ma Palette Actuelle</h2>
      <div className="w-full bg-card p-6 rounded-xl border">
        <div className="flex flex-wrap gap-3 justify-center">
          {palette.map((hex) => (
            <div
              key={hex}
              className="relative flex items-center bg-background border rounded-md group transition-all duration-200 hover:-translate-y-0.5"
            >
              <span
                className="text-sm font-mono px-3 py-1.5 rounded-l-md"
                style={{
                  background: hex,
                  color: getContrastColor(hex),
                  textShadow: "0 1px 1px rgba(0,0,0,0.1)",
                }}
              >
                {hex}
              </span>
              <div className="flex items-center px-1">
                <button
                  className="p-1.5 rounded hover:bg-muted"
                  title="Copier"
                  onClick={() => onCopy(hex)}
                >
                  <CopyIcon size={14} />
                </button>
                <button
                  className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  title="Retirer"
                  onClick={() => onRemove(hex)}
                >
                  <XIcon size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
