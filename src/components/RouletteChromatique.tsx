import React, { useState, useRef } from "react";
import { Palette, Copy as CopyIcon, Plus as PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getContrastColor } from "@/lib/colorUtils";

// La constante d’offset pour la complémentaire en degrés
const COMPLEMENTARY_OFFSET = 180;
const RADIUS = 110;
const CENTER = RADIUS + 6;

function hslToHex(h: number, s: number, l: number) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

type Harmony = "complementary" | "analogous" | "triadic" | "split-complementary";

const harmonySchemes: Record<Harmony, { name: string; offsets: number[] }> = {
  complementary: { name: "Complémentaire", offsets: [180] },
  analogous: { name: "Analogue", offsets: [-30, 30] },
  triadic: { name: "Triadique", offsets: [120, 240] },
  "split-complementary": { name: "Compl. Adjacente", offsets: [150, 210] },
};

export default function RouletteChromatique({
  onAddColor,
  onCopyColor,
}: {
  onAddColor: (color: string) => void;
  onCopyColor: (color: string) => void;
}) {
  const [angle, setAngle] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [harmony, setHarmony] = useState<Harmony>("complementary");

  // Calcul des couleurs
  const current = hslToHex(angle, saturation, lightness);
  const harmonyColors = harmonySchemes[harmony].offsets.map((offset) => {
    const harmonyAngle = (angle + offset + 360) % 360;
    return hslToHex(harmonyAngle, saturation, lightness);
  });

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
    const correctedAngle = (deg + 90) % 360;

    setAngle(correctedAngle);
  }

  function handleLightnessChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    setLightness(val);
  }

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
        <span className="font-semibold text-lg">Roulette chromatique</span>
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
          cx={CENTER + cursorRadius * Math.cos(((angle - 90) * Math.PI) / 180)}
          cy={CENTER + cursorRadius * Math.sin(((angle - 90) * Math.PI) / 180)}
          r={10}
          fill="none"
          stroke={getContrastColor(current)}
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
            color: getContrastColor(current),
            borderColor: "#bbb",
          }}
        >
          {current}
        </span>
      </div>

      <div className="flex flex-row gap-4 mt-6 w-full justify-center">
        <Button
          onClick={() => {
            onAddColor(current);
          }}
        >
          <PlusIcon />
          Ajouter à la palette
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            onCopyColor(current);
          }}
        >
          <CopyIcon />
          Copier {current}
        </Button>
      </div>

      {/* Section des harmonies */}
      <div className="w-full border-t pt-6 mt-6">
        <div className="w-full flex flex-col items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Choisir une harmonie</span>
          <div className="flex gap-2 flex-wrap justify-center">
            {(Object.keys(harmonySchemes) as Harmony[]).map((key) => (
              <Button
                key={key}
                variant={harmony === key ? "default" : "outline"}
                size="sm"
                onClick={() => setHarmony(key)}
              >
                {harmonySchemes[key].name}
              </Button>
            ))}
          </div>
        </div>

        {/* Affichage des couleurs de l'harmonie */}
        <div className="flex flex-wrap gap-3 items-center justify-center mt-4">
          {harmonyColors.map((hex) => (
            <div
              key={hex}
              className="flex items-center gap-2 p-1.5 border rounded-md bg-background shadow-sm"
            >
              <div
                className="rounded px-3 py-2 text-xs font-mono select-all cursor-pointer"
                style={{
                  backgroundColor: hex,
                  color: getContrastColor(hex),
                }}
                title={`Copier la couleur ${hex}`}
                onClick={() => onCopyColor(hex)}
              >
                {hex}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                title="Ajouter à la palette"
                onClick={() => onAddColor(hex)}
              >
                <PlusIcon size={14} />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const COMPLEMENTARY_OFFSET = 180;
const RADIUS = 110;
const CENTER = RADIUS + 6;

function hslToHex(h: number, s: number, l: number) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

type Harmony = "complementary" | "analogous" | "triadic" | "split-complementary";

const harmonySchemes: Record<Harmony, { name: string; offsets: number[] }> = {
  complementary: { name: "Complémentaire", offsets: [180] },
  analogous: { name: "Analogue", offsets: [-30, 30] },
  triadic: { name: "Triadique", offsets: [120, 240] },
  "split-complementary": { name: "Compl. Adjacente", offsets: [150, 210] },
};
