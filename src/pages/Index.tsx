
import React, { useState } from "react";
import RouletteChromatique from "@/components/RouletteChromatique";
import ExtractionCouleursImage from "@/components/ExtractionCouleursImage";
import MaPalette from "@/components/MaPalette";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [palette, setPalette] = useState<string[]>([]);

  function addColorToPalette(hex: string) {
    setPalette((pal) => {
      if (pal.includes(hex)) {
        toast({ title: "Déjà dans la palette", description: hex });
        return pal;
      }
      if (pal.length >= 12) {
        toast({
          title: "Palette pleine",
          description: "Vous pouvez ajouter jusqu'à 12 couleurs.",
          variant: "destructive",
        });
        return pal;
      }
      toast({ title: "Couleur ajoutée", description: hex });
      // On ajoute au début pour voir la couleur la plus récente en premier
      return [hex, ...pal];
    });
  }

  function removeColorFromPalette(hex: string) {
    setPalette((pal) => pal.filter((c) => c !== hex));
    toast({ title: "Couleur retirée", description: hex, variant: "default" });
  }

  function handleCopy(hex: string) {
    navigator.clipboard.writeText(hex);
    toast({
      title: "Copié !",
      description: hex,
    });
  }

  return (
    <div className="container mx-auto py-10 min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-10 text-left flex items-center gap-3">
        🎨 Générateur de Palette de Couleurs
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-6">
        <div className="bg-card rounded-xl p-8 shadow-lg flex flex-col items-center">
          <RouletteChromatique onAddColor={addColorToPalette} onCopyColor={handleCopy} />
        </div>
        <div className="bg-card rounded-xl p-8 shadow-lg flex flex-col items-center">
          <ExtractionCouleursImage onAddColor={addColorToPalette} onCopyColor={handleCopy} />
        </div>
      </div>
      <MaPalette palette={palette} onRemove={removeColorFromPalette} onCopy={handleCopy} />
    </div>
  );
};

export default Index;
