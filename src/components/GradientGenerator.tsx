import React, { useState, useMemo } from "react";
import { Paintbrush2, Copy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface GradientGeneratorProps {
  palette: string[];
  onAddColor: (color: string) => void;
}

export default function GradientGenerator({ palette, onAddColor }: GradientGeneratorProps) {
  const [color1, setColor1] = useState(palette[0] || "#8B5CF6");
  const [color2, setColor2] = useState(palette[1] || "#EC4899");
  const [direction, setDirection] = useState("to right");
  const [steps, setSteps] = useState([5]);

  const gradient = useMemo(() => {
    return `linear-gradient(${direction}, ${color1}, ${color2})`;
  }, [color1, color2, direction]);

  const gradientSteps = useMemo(() => {
    const stepCount = steps[0];
    const colors = [];
    
    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };

    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    for (let i = 0; i < stepCount; i++) {
      const ratio = i / (stepCount - 1);
      const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * ratio);
      const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * ratio);
      const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * ratio);
      
      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      colors.push(hex);
    }
    
    return colors;
  }, [color1, color2, steps]);

  const directions = [
    { value: "to right", label: "Horizontal →" },
    { value: "to left", label: "Horizontal ←" },
    { value: "to bottom", label: "Vertical ↓" },
    { value: "to top", label: "Vertical ↑" },
    { value: "to bottom right", label: "Diagonal ↘" },
    { value: "to bottom left", label: "Diagonal ↙" },
    { value: "to top right", label: "Diagonal ↗" },
    { value: "to top left", label: "Diagonal ↖" },
  ];

  const handleCopyCSS = () => {
    const css = `background: ${gradient};`;
    navigator.clipboard.writeText(css);
    toast({ title: "CSS copié", description: css });
  };

  const handleCopyColors = () => {
    const colors = gradientSteps.join(", ");
    navigator.clipboard.writeText(colors);
    toast({ title: "Couleurs copiées", description: colors });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paintbrush2 className="w-5 h-5 text-primary" />
          Générateur de Dégradés
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Couleur 1</label>
            <Select value={color1} onValueChange={setColor1}>
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: color1 }}
                    />
                    {color1}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {palette.map((color) => (
                  <SelectItem key={color} value={color}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: color }}
                      />
                      {color}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Couleur 2</label>
            <Select value={color2} onValueChange={setColor2}>
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: color2 }}
                    />
                    {color2}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {palette.map((color) => (
                  <SelectItem key={color} value={color}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: color }}
                      />
                      {color}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Direction</label>
          <Select value={direction} onValueChange={setDirection}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {directions.map((dir) => (
                <SelectItem key={dir.value} value={dir.value}>
                  {dir.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Étapes: {steps[0]}</label>
          <Slider
            value={steps}
            onValueChange={setSteps}
            min={3}
            max={10}
            step={1}
            className="w-full"
          />
        </div>

        <div 
          className="w-full h-20 rounded-lg border animate-in fade-in-0 duration-300"
          style={{ background: gradient }}
        />

        <div className="flex gap-2">
          <Button onClick={handleCopyCSS} className="flex-1">
            <Copy className="w-4 h-4 mr-2" />
            Copier CSS
          </Button>
          <Button variant="secondary" onClick={handleCopyColors} className="flex-1">
            <Copy className="w-4 h-4 mr-2" />
            Copier couleurs
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Étapes du dégradé</label>
          <div className="flex flex-wrap gap-2">
            {gradientSteps.map((color, index) => (
              <div
                key={index}
                className="group relative flex flex-col items-center p-2 rounded border hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                onClick={() => onAddColor(color)}
              >
                <div 
                  className="w-8 h-8 rounded border mb-1"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-mono">{color}</span>
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}