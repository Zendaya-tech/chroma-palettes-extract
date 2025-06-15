import React, { useState, useRef } from "react";
import { Palette, RefreshCw, X as XIcon, Copy as CopyIcon, Plus as PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

// La constante d’offset pour la complémentaire en degrés
const COMPLEMENTARY_OFFSET = 180;
const RADIUS = 110;
const CENTER = RADIUS + 6;

function hslToHex(h: number, s: number, l: number) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color =
      l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export default function RouletteChromatique({
  onColorPick,
}: {
  onColorPick?: (color: string) => void;
}) {
  const [angle, setAngle] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  // Stocker la palette personnalisée de l’utilisateur
  const [palette, setPalette] = useState<string[]>([]);

  // Calcul des couleurs principales et complémentaires
  const current = hslToHex(angle, saturation, lightness);
  const complementaryAngle = (angle + COMPLEMENTARY_OFFSET) % 360;
  const complementary = hslToHex(complementaryAngle, saturation, lightness);

  const svgRef = useRef<SVGSVGElement>(null);

  function handleMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - CENTER;
    const y = e.clientY - rect.top - CENTER;

    let distance = Math.sqrt(x * x + y * y);
    distance = Math.min(distance, RADIUS);

    const newSaturation = (distance / RADIUS) * 100;
    setSaturation(newSaturation);

    let theta = Math.atan2(y, x);
    if (theta < 0) theta += 2 * Math.PI;
    const deg = (theta * 180) / Math.PI;
    setAngle(deg);
    onColorPick?.(hslToHex(deg, newSaturation, lightness));
  }

  function handleLightnessChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    setLightness(val);
    onColorPick?.(hslToHex(angle, saturation, val));
  }

  // Palette : ajouter une couleur si elle n’y est pas déjà (max 8 couleurs pour rester simple UI)
  function addColorToPalette(hex: string) {
    setPalette((pal) => {
      if (pal.includes(hex)) return pal;
      if (pal.length >= 8) {
        toast({
          title: "Palette pleine",
          description: "Vous pouvez ajouter jusqu'à 8 couleurs.",
          variant: "destructive"
        });
        return pal;
      }
      toast({
        title: "Couleur ajoutée",
        description: hex,
      });
      return [...pal, hex];
    });
  }
  function removeColorFromPalette(hex: string) {
    setPalette((pal) => pal.filter((c) => c !== hex));
  }
  function handleCopy(hex: string) {
    navigator.clipboard.writeText(hex);
    toast({
      title: "Copié !",
      description: hex,
    });
  }

  // SVG segments for chromatic wheel (48 gradients in a circle)
  const slices = Array.from({ length: 48 }).map((_, i) => {
    const start = (360 / 48) * i;
    const end = start + 360 / 48;
    return (
      <path
        key={i}
        d={describeArc(CENTER, CENTER, RADIUS, start, end)}
        fill={hslToHex(start, 100, lightness)}
      />
    );
  });

  function describeArc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M",
      x,
      y,
      "L",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "Z",
    ].join(" ");
  }

  function polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) {
    var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  const centerColor = hslToHex(0, 0, lightness);
  const cursorRadius = (saturation / 100) * RADIUS;

  return (
    <div className="flex flex-col items-center animate-fade-in w-full">
      <div className="mb-4 flex items-center gap-2">
        <Palette className="text-primary w-6 h-6" />
        <span className="font-semibold text-lg">
          Roulette chromatique
        </span>
      </div>
      <svg
        ref={svgRef}
        width={CENTER * 2}
        height={CENTER * 2}
        style={{ touchAction: "none", cursor: "crosshair" }}
        onPointerDown={handleMove}
        onPointerMove={(e) => {
          if ((e.buttons & 1) === 1) handleMove(e);
        }}
        className="shadow-xl border bg-card rounded-full"
      >
        <defs>
          <radialGradient id="saturation-gradient">
            <stop offset="0%" stopColor={centerColor} />
            <stop offset="100%" stopColor={centerColor} stopOpacity="0" />
          </radialGradient>
        </defs>
        <g>{slices}</g>
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="url(#saturation-gradient)" />
        {/* curseur */}
        <circle
          cx={
            CENTER +
            cursorRadius *
              Math.cos(((angle - 90) * Math.PI) / 180)
          }
          cy={
            CENTER +
            cursorRadius *
              Math.sin(((angle - 90) * Math.PI) / 180)
          }
          r={10}
          fill="none"
          stroke={lightness < 50 ? "#fff" : "#000"}
          strokeWidth={2}
        />
      </svg>

      <div className="flex w-full items-center mt-6 gap-4">
        <input
          type="range"
          min={0}
          max={100}
          value={lightness}
          onChange={handleLightnessChange}
          className="w-full"
          style={{ accentColor: current }}
        />
        <span
          className="rounded px-3 py-2 text-xs font-mono border ml-4 select-all hover-scale"
          style={{
            backgroundColor: current,
            color: lightness < 50 ? "#fff" : "#222",
            borderColor: "#bbb",
          }}
        >
          {current}
        </span>
      </div>

      <div className="flex flex-row gap-4 mt-6 w-full justify-center">
        <button
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold bg-accent text-accent-foreground shadow hover-scale"
          )}
          onClick={() => {
            addColorToPalette(current);
          }}
        >
          <PlusIcon size={16} className="text-primary" />
          Ajouter à la palette
        </button>
        <button
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold bg-primary text-primary-foreground shadow hover-scale"
          )}
          onClick={() => {
            handleCopy(current);
          }}
        >
          <CopyIcon size={16} />
          Copier {current}
        </button>
      </div>

      {/* Couleur complémentaire existante */}
      <div className="flex flex-col items-center gap-2 mt-5 mb-2 w-full">
        <span className="text-sm text-muted-foreground">Couleur complémentaire</span>
        <div className="flex gap-3 items-center">
          <div
            className="rounded px-3 py-2 text-xs font-mono border select-all hover-scale shadow"
            style={{
              backgroundColor: complementary,
              color: lightness < 50 ? "#fff" : "#222",
              borderColor: "#bbb",
              minWidth: 72,
              textAlign: "center",
              cursor: "pointer"
            }}
            title="Copier la couleur complémentaire"
            onClick={() => handleCopy(complementary)}
          >
            {complementary}
          </div>
          <button
            className={cn(
              "ml-2 rounded-full p-2 bg-muted hover:bg-accent border shadow transition"
            )}
            title="Mettre la couleur complémentaire sur la roue"
            onClick={() => {
              setAngle(complementaryAngle);
              onColorPick?.(complementary);
            }}
          >
            <RefreshCw size={16} />
          </button>
          <button
            className={cn(
              "ml-2 flex items-center gap-1 px-2 py-1 rounded bg-muted hover:bg-accent border transition text-xs"
            )}
            title="Ajouter la couleur complémentaire à la palette"
            onClick={() => addColorToPalette(complementary)}
          >
            <PlusIcon size={13} /> Ajouter
          </button>
        </div>
      </div>

      {palette.length > 0 && (
        <div className="w-full flex flex-col items-center mt-7 mb-1">
          <span className="font-medium text-md text-muted-foreground mb-2">Votre palette</span>
          <div className="flex flex-wrap gap-3 w-full justify-center">
            {palette.map((hex) => (
              <div
                key={hex}
                className="relative flex items-center bg-card border rounded shadow px-2 py-1 group min-w-[68px]"
              >
                <span
                  className="text-xs font-mono px-2 py-1 rounded"
                  style={{
                    background: hex,
                    color: hex.toLowerCase() === "#ffffff" ? "#333" : "#fff",
                    textShadow: "0 1px 4px rgba(0,0,0,0.15)",
                  }}
                >
                  {hex}
                </span>
                <button
                  className="ml-2 p-1 rounded hover:bg-muted"
                  title="Copier"
                  onClick={() => handleCopy(hex)}
                >
                  <CopyIcon size={13} />
                </button>
                <button
                  className="ml-1 p-1 rounded hover:bg-destructive -mr-2"
                  title="Retirer"
                  onClick={() => removeColorFromPalette(hex)}
                >
                  <XIcon size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
