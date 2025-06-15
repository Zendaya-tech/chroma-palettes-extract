
import React from 'react';
import { Trash2 as TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      <div className="w-full text-center p-8 border-2 border-dashed rounded-xl mt-8 animate-fade-in">
        <h2 className="text-lg font-semibold text-muted-foreground">Aucune palette sauvegardée</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Sauvegardez votre palette actuelle pour la retrouver ici.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center mt-8 animate-fade-in">
      <h2 className="text-xl font-bold mb-4">Mes Palettes Sauvegardées</h2>
      <div className="w-full space-y-4">
        {palettes.map((p) => (
          <div key={p.id} className="bg-card p-4 rounded-xl shadow-lg border">
            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
              <h3 className="font-semibold">{p.name}</h3>
              <div className="flex gap-2 items-center">
                <Button variant="outline" size="sm" onClick={() => onExport(p)}>
                  Exporter
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onLoad(p.colors)}>
                  Charger
                </Button>
                <Button variant="destructive" size="icon" onClick={() => onDelete(p.id)} title="Supprimer la palette">
                  <TrashIcon size={16} />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.colors.map((hex, index) => (
                <div
                  key={`${hex}-${index}`}
                  className="h-8 rounded border flex-grow min-w-[50px]"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
