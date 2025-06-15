
import React, { useState } from "react";
import RouletteChromatique from "@/components/RouletteChromatique";
import ExtractionCouleursImage from "@/components/ExtractionCouleursImage";
import PaletteRecente from "@/components/PaletteRecente";

const Index = () => {
  const [recent, setRecent] = useState<{ hex: string; rgb?: string }[]>([]);

  function handleColorPick(hex: string) {
    setRecent((cur) =>
      [ { hex }, ...cur.filter((c) => c.hex !== hex) ].slice(0, 8)
    );
  }

  function handleExtracted(palette: { hex: string; rgb?: string }[]) {
    setRecent((cur) => {
      // On ajoute les couleurs extraites, sans doublon.
      const newPal = palette.filter(
        (c) => !cur.find((r) => r.hex === c.hex)
      );
      return [ ...newPal, ...cur ].slice(0, 8);
    });
  }

  // Layout desktop: 2 colonnes, roulette gauche, extraction droite
  return (
    <div className="container mx-auto py-10 min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-10 text-left flex items-center gap-3">
        🎨 Générateur / Extracteur de palette couleur
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-6">
        <div className="bg-card rounded-xl p-8 shadow-lg flex flex-col items-center">
          <RouletteChromatique onColorPick={handleColorPick} />
        </div>
        <div className="bg-card rounded-xl p-8 shadow-lg flex flex-col items-center">
          <ExtractionCouleursImage onExtracted={handleExtracted} />
        </div>
      </div>
      <PaletteRecente couleurs={recent} />
    </div>
  );
};

export default Index;
