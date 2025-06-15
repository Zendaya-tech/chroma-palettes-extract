
import React, { useRef, useState } from "react";
import { Image as ImageIcon, PlusIcon, CopyIcon } from "lucide-react";
import { extractImagePalette, getContrastColor } from "@/lib/colorUtils";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { loadImage, removeBackground } from "@/lib/imageUtils";

interface Couleur {
  hex: string;
  rgb: string;
}

export default function ExtractionCouleursImage({
  onAddColor,
  onCopyColor,
}: {
  onAddColor: (palette: string) => void;
  onCopyColor: (palette: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [palette, setPalette] = useState<Couleur[]>([]);
  const [imgUrl, setImgUrl] = useState<string>();
  type Status = "idle" | "loading" | "removing-bg" | "done" | "error";
  const [status, setStatus] = useState<Status>("idle");
  const [colorCount, setColorCount] = useState(6);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [removeBg, setRemoveBg] = useState(false);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);

  const runExtraction = async (imageBlob: Blob, count: number) => {
    setStatus("loading");
    try {
      const pal = await extractImagePalette(imageBlob, count);
      setPalette(pal);
      setStatus("done");
    } catch (e) {
      setStatus("error");
      console.error(e);
      toast({ title: "Erreur d'extraction", description: "Impossible d'analyser l'image.", variant: "destructive" });
    }
  };

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCurrentFile(file);
    setProcessedBlob(null);
    setImgUrl(URL.createObjectURL(file));

    if (removeBg) {
      setStatus("removing-bg");
      try {
        const imageElement = await loadImage(file);
        const blobWithoutBg = await removeBackground(imageElement);
        setProcessedBlob(blobWithoutBg);
        setImgUrl(URL.createObjectURL(blobWithoutBg));
        await runExtraction(blobWithoutBg, colorCount);
      } catch (e) {
        setStatus("error");
        console.error(e);
        toast({ title: "Erreur", description: "La suppression de l'arrière-plan a échoué.", variant: "destructive" });
      }
    } else {
      await runExtraction(file, colorCount);
    }
  }

  const handleColorCountChange = async (value: number[]) => {
    const newCount = value[0];
    setColorCount(newCount);
    if (currentFile) {
      const blobToProcess = removeBg && processedBlob ? processedBlob : currentFile;
      await runExtraction(blobToProcess, newCount);
    }
  };
  
  const handleRemoveBgChange = async (checked: boolean) => {
    setRemoveBg(checked);
    if (currentFile) {
      if (checked) {
        setStatus("removing-bg");
        try {
          const imageElement = await loadImage(currentFile);
          const blobWithoutBg = await removeBackground(imageElement);
          setProcessedBlob(blobWithoutBg);
          setImgUrl(URL.createObjectURL(blobWithoutBg));
          await runExtraction(blobWithoutBg, colorCount);
        } catch (e) {
          setStatus("error");
          console.error(e);
          toast({ title: "Erreur", description: "La suppression de l'arrière-plan a échoué.", variant: "destructive" });
        }
      } else {
        setProcessedBlob(null);
        setImgUrl(URL.createObjectURL(currentFile));
        await runExtraction(currentFile, colorCount);
      }
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center gap-2">
        <ImageIcon className="text-primary w-6 h-6" />
        <h3 className="font-semibold text-lg">Extraire les couleurs d’une image</h3>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex flex-col items-start w-full gap-4 mb-3">
        <Button
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon />
          Importer une image
        </Button>
        
        <div className="flex items-center space-x-2">
          <Switch id="remove-bg" checked={removeBg} onCheckedChange={handleRemoveBgChange} />
          <Label htmlFor="remove-bg">Supprimer l'arrière-plan (Beta)</Label>
        </div>

        <div className="w-full">
          <label htmlFor="color-count" className="text-sm font-medium text-muted-foreground">
            Nombre de couleurs : {colorCount}
          </label>
          <Slider
            id="color-count"
            min={2}
            max={16}
            step={1}
            value={[colorCount]}
            onValueChange={handleColorCountChange}
            className="mt-2"
          />
        </div>
      </div>
      {status === "removing-bg" && (
        <div className="text-xs text-muted-foreground mt-2 animate-pulse">Suppression de l'arrière-plan en cours...</div>
      )}
      {status === "loading" && (
        <div className="text-xs text-muted-foreground mt-2 animate-pulse">Analyse de l’image…</div>
      )}
      {imgUrl && (
        <div className="mt-4 flex flex-col items-center">
          <img src={imgUrl} alt="Aperçu" className="max-h-32 rounded shadow mb-2 border" />
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {palette.map((clr, idx) => (
              <div
                key={idx}
                className={cn(
                  "relative flex flex-col items-center justify-center shadow border rounded-lg p-2 min-w-[72px] group"
                )}
                style={{ backgroundColor: clr.hex }}
              >
                <div
                  className="w-8 h-8 rounded-full border mb-1"
                  style={{
                    background: clr.hex,
                    borderColor: "rgba(255,255,255,0.5)",
                  }}
                />
                <span
                  className="text-xs font-mono"
                  style={{
                    color: getContrastColor(clr.hex),
                    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                  }}
                >
                  {clr.hex}
                </span>
                <div className="absolute top-0 right-0 bottom-0 left-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    title="Ajouter à la palette"
                    onClick={() => onAddColor(clr.hex)}
                  >
                    <PlusIcon size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    title={"Copier " + clr.hex}
                    onClick={() => onCopyColor(clr.hex)}
                  >
                    <CopyIcon size={14} />
                  </Button>
                </div>
              </div>
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
