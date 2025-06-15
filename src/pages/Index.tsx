
import React, { useState, useRef } from "react";
import RouletteChromatique from "@/components/RouletteChromatique";
import ExtractionCouleursImage from "@/components/ExtractionCouleursImage";
import MaPalette from "@/components/MaPalette";
import { toast } from "@/hooks/use-toast";
import SavedPalettes, { SavedPalette } from "@/components/SavedPalettes";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save as SaveIcon, Import as ImportIcon } from "lucide-react";

const Index = () => {
  const [palette, setPalette] = useState<string[]>([]);
  const [savedPalettes, setSavedPalettes] = useLocalStorage<SavedPalette[]>("saved-palettes", []);
  
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [newPaletteName, setNewPaletteName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handleSavePalette() {
    if (!newPaletteName.trim()) {
      toast({ title: "Nom requis", description: "Veuillez donner un nom à votre palette.", variant: "destructive" });
      return;
    }
    if (palette.length === 0) {
      toast({ title: "Palette vide", description: "Ajoutez des couleurs avant de sauvegarder.", variant: "destructive" });
      setIsSaveDialogOpen(false);
      return;
    }
    const newPalette: SavedPalette = {
      id: Date.now().toString(),
      name: newPaletteName.trim(),
      colors: palette,
    };
    setSavedPalettes([...savedPalettes, newPalette]);
    setNewPaletteName("");
    setIsSaveDialogOpen(false);
    toast({ title: "Palette sauvegardée", description: `La palette "${newPalette.name}" a été enregistrée.` });
  }

  function handleLoadPalette(colors: string[]) {
    setPalette(colors);
    toast({ title: "Palette chargée", description: "La palette a été chargée dans l'éditeur." });
  }

  function handleDeletePalette(id: string) {
    setSavedPalettes(savedPalettes.filter((p) => p.id !== id));
    toast({ title: "Palette supprimée", variant: 'default' });
  }

  function handleExportPalette(paletteToExport: SavedPalette) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(paletteToExport.colors, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${paletteToExport.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast({ title: "Palette exportée", description: `Fichier ${paletteToExport.name}.json téléchargé.` });
  }

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  function handleImportPalette(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File is not a text file");
        const colors = JSON.parse(text);

        if (!Array.isArray(colors) || !colors.every(c => typeof c === 'string' && /^#([0-9a-f]{3}){1,2}$/i.test(c))) {
          toast({
            title: "Format de fichier invalide",
            description: "Le fichier doit être un JSON contenant un tableau de couleurs hexadécimales.",
            variant: "destructive",
          });
          return;
        }
        
        const paletteName = file.name.replace(/\.json$/, '');
        const newPalette: SavedPalette = {
          id: Date.now().toString(),
          name: paletteName,
          colors: colors,
        };
        setSavedPalettes(prev => [...prev, newPalette]);
        toast({ title: "Palette importée", description: `La palette "${paletteName}" a été ajoutée.` });

      } catch (error) {
        toast({
          title: "Erreur d'importation",
          description: "Le fichier est invalide ou corrompu.",
          variant: "destructive",
        });
        console.error("Import error:", error);
      } finally {
        if(event.target) event.target.value = '';
      }
    };
    reader.readAsText(file);
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
      
      <div className="flex gap-4 mt-4 justify-center">
        <Button onClick={() => palette.length > 0 ? setIsSaveDialogOpen(true) : toast({ title: "Palette vide", description: "Ajoutez des couleurs avant de sauvegarder.", variant: "destructive" })}>
            <SaveIcon className="mr-2 h-4 w-4" /> Sauvegarder la palette
        </Button>
        <Button variant="outline" onClick={handleImportClick}>
            <ImportIcon className="mr-2 h-4 w-4" /> Importer une palette
        </Button>
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportPalette}
            className="hidden"
            accept="application/json"
        />
      </div>

      <SavedPalettes palettes={savedPalettes} onLoad={handleLoadPalette} onDelete={handleDeletePalette} onExport={handleExportPalette} />

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sauvegarder la palette</DialogTitle>
            <DialogDescription>
              Donnez un nom à votre palette actuelle pour la sauvegarder.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                id="name"
                value={newPaletteName}
                onChange={(e) => setNewPaletteName(e.target.value)}
                className="col-span-3"
                placeholder="Ex: Coucher de soleil"
                onKeyDown={(e) => e.key === 'Enter' && handleSavePalette()}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Annuler</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSavePalette}>Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
