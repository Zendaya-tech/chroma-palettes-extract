
import React from 'react';
import { Trash2 as TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type SavedPalette = {
  id: string;
  name: string;
  colors: string[];
};

interface SavedPalettesProps {
  palettes: SavedPalette[];
  onLoad: (colors: string[]) => void;
  onDelete: (id: string) => void;
  onExport: (palette: SavedPalette) => void;
}

export default function SavedPalettes({ palettes, onLoad, onDelete, onExport }: SavedPalettesProps) {
  if (palettes.length === 0) {
    return (
      <div className="w-full text-center p-8 border-2 border-dashed rounded-xl mt-12 animate-in fade-in-0 duration-500">
        <h2 className="text-lg font-semibold text-muted-foreground">Aucune palette sauvegardée</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Sauvegardez votre palette actuelle pour la retrouver ici.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center mt-12 animate-in fade-in-0 duration-500">
      <h2 className="text-2xl font-bold mb-6 tracking-tight">Mes Palettes Sauvegardées</h2>
      <div className="w-full max-w-4xl mx-auto space-y-4">
        <TooltipProvider>
          {palettes.map((p, index) => (
            <div 
              key={p.id} 
              className="bg-card p-4 rounded-xl border transition-all duration-300 hover:bg-accent/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10 animate-in fade-in-0 slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                <h3 className="font-semibold text-lg">{p.name}</h3>
                <div className="flex gap-2 items-center self-end sm:self-center">
                  <Button variant="outline" size="sm" onClick={() => onExport(p)} className="transition-all duration-200 hover:scale-105">
                    Exporter
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => onLoad(p.colors)} className="transition-all duration-200 hover:scale-105">
                    Charger
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(p.id)} title="Supprimer la palette" className="transition-all duration-200 hover:scale-105">
                    <TrashIcon size={16} />
                    <span className="hidden sm:inline sm:ml-2">Supprimer</span>
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {p.colors.map((hex, index) => (
                  <Tooltip key={`${hex}-${index}`} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div
                        className="h-8 rounded border flex-grow min-w-[50px] cursor-pointer transition-all duration-200 hover:scale-110 hover:z-10 relative"
                        style={{ backgroundColor: hex }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{hex}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}
