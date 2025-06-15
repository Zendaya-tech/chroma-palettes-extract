
import React, { useState, useRef } from "react";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [lightness, setLightness] = useState(50);

  const [current, setCurrent] = useState(
    hslToHex(angle, 100, lightness)
  );
  const svgRef = useRef<SVGSVGElement>(null);

  function handleMove(e: React.MouseEvent) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x =
      (e.clientX || (e as any).touches?.[0].clientX) - rect.left - CENTER;
    const y =
      (e.clientY || (e as any).touches?.[0].clientY) - rect.top - CENTER;
    let theta = Math.atan2(y, x);
    if (theta < 0) theta += 2 * Math.PI;
    const deg = (theta * 180) / Math.PI;
    setAngle(deg);
    const hex = hslToHex(deg, 100, lightness);
    setCurrent(hex);
    onColorPick?.(hex);
  }

  function handleLightnessChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    setLightness(val);
    const hex = hslToHex(angle, 100, val);
    setCurrent(hex);
    onColorPick?.(hex);
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

  return (
    <div className="flex flex-col items-center animate-fade-in">
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
          if ((e.buttons & 1) === 1) handleMove(e as any);
        }}
        className="shadow-xl border bg-card rounded-full"
      >
        <g>{slices}</g>
        {/* curseur */}
        <circle
          cx={
            CENTER +
            RADIUS *
              Math.cos(((angle - 90) * Math.PI) / 180)
          }
          cy={
            CENTER +
            RADIUS *
              Math.sin(((angle - 90) * Math.PI) / 180)
          }
          r={10}
          fill="#fff"
          stroke="#000"
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
      <button
        className={cn(
          "mt-4 px-4 py-2 rounded-md text-sm font-semibold bg-primary text-primary-foreground shadow hover-scale"
        )}
        onClick={() => {
          navigator.clipboard.writeText(current);
        }}
      >
        Copier {current}
      </button>
    </div>
  );
}
