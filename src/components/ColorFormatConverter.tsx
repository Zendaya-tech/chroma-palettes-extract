import React, { useState } from "react";
import { Palette, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function getContrastRatio(rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }): number {
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
}

export default function ColorFormatConverter({ onAddColor }: { onAddColor: (color: string) => void }) {
  const [color, setColor] = useState("#8B5CF6");

  const handleCopy = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `Format ${format} copié`, description: text });
  };

  const rgb = hexToRgb(color);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
  
  const whiteRgb = { r: 255, g: 255, b: 255 };
  const blackRgb = { r: 0, g: 0, b: 0 };
  const whiteContrast = rgb ? getContrastRatio(rgb, whiteRgb) : 1;
  const blackContrast = rgb ? getContrastRatio(rgb, blackRgb) : 1;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Convertisseur de Couleurs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="color-input">Couleur</Label>
          <div className="flex gap-2">
            <Input
              id="color-input"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-16 h-10 p-1 rounded"
            />
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#8B5CF6"
              className="flex-1"
            />
            <Button size="sm" onClick={() => onAddColor(color)}>
              Ajouter
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rgb && (
            <>
              <div className="space-y-2">
                <Label className="text-sm font-medium">RGB</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-sm">
                    rgb({rgb.r}, {rgb.g}, {rgb.b})
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleCopy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, "RGB")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {hsl && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">HSL</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-muted rounded text-sm">
                      hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleCopy(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, "HSL")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Accessibilité (Contraste)</Label>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span>Texte blanc</span>
              <span className={`font-mono ${whiteContrast >= 4.5 ? 'text-green-600' : 'text-red-600'}`}>
                {whiteContrast.toFixed(2)}:1
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span>Texte noir</span>
              <span className={`font-mono ${blackContrast >= 4.5 ? 'text-green-600' : 'text-red-600'}`}>
                {blackContrast.toFixed(2)}:1
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            WCAG recommande un ratio de 4.5:1 minimum pour le texte normal
          </p>
        </div>
      </CardContent>
    </Card>
  );
}