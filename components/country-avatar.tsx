"use client";

import React, { useEffect, useMemo, useState } from "react";
import { PixelAvatar } from "./pixel-avatar";

export interface AvatarSequence {
  row: number;
  startCol?: number;
  frames: number;
  fps: number;
  pingPong?: boolean;
}

export interface AvatarConfig {
  src: string;
  label: string;
  variant?: "red" | "tan" | string;
  cellWidth?: number;
  cellHeight?: number;
  cols: number;
  rows: number;
  targetHeight?: number;
  scale?: number;
  prop?: "petals" | string;
  walkRow?: number;
  walkStartCol?: number;
  creditsUrl?: string;
  creditsLabel?: string;
  sequence: AvatarSequence[];
}

export interface CountryAvatarProps {
  config: AvatarConfig;
  playKey: number;
}

function PetalsOverlay({ reducedMotion }: { reducedMotion: boolean }) {
  const petals = useMemo(
    () => [
      { left: "8%", size: 3, delay: "0s", duration: "4.2s", driftX: 35, rot: "180deg", bg: "#fbcfe8" },
      { left: "22%", size: 4, delay: "1.1s", duration: "3.8s", driftX: 42, rot: "240deg", bg: "#f472b6" },
      { left: "38%", size: 3, delay: "0.5s", duration: "4.5s", driftX: 30, rot: "320deg", bg: "#f9a8d4" },
      { left: "52%", size: 4, delay: "2.3s", duration: "4.0s", driftX: 48, rot: "190deg", bg: "#fbcfe8" },
      { left: "68%", size: 3, delay: "1.7s", duration: "4.7s", driftX: 36, rot: "270deg", bg: "#f472b6" },
      { left: "82%", size: 4, delay: "0.8s", duration: "3.9s", driftX: 44, rot: "310deg", bg: "#fb7185" },
      { left: "14%", size: 3, delay: "2.9s", duration: "4.3s", driftX: 32, rot: "160deg", bg: "#f9a8d4" },
      { left: "30%", size: 4, delay: "1.9s", duration: "4.6s", driftX: 40, rot: "290deg", bg: "#fbcfe8" },
      { left: "46%", size: 3, delay: "3.4s", duration: "3.7s", driftX: 38, rot: "220deg", bg: "#f472b6" },
      { left: "62%", size: 4, delay: "2.6s", duration: "4.4s", driftX: 46, rot: "340deg", bg: "#fb7185" },
      { left: "76%", size: 3, delay: "0.2s", duration: "4.1s", driftX: 34, rot: "200deg", bg: "#fbcfe8" },
      { left: "90%", size: 4, delay: "1.5s", duration: "4.8s", driftX: 42, rot: "260deg", bg: "#f9a8d4" },
    ],
    []
  );

  if (reducedMotion) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {petals.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-[1px] opacity-0"
          style={{
            left: p.left,
            top: "-10px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.bg,
            animation: `petal-fall ${p.duration} linear infinite`,
            animationDelay: p.delay,
            ["--drift-x" as string]: `${p.driftX}px`,
            ["--rot" as string]: p.rot,
          }}
        />
      ))}
    </div>
  );
}

export function CountryAvatar({ config, playKey }: CountryAvatarProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mq.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
  }, []);

  const cellWidth = config.cellWidth ?? 64;
  const cellHeight = config.cellHeight ?? 64;
  const targetHeight = config.targetHeight ?? 144;

  // One-line color variant switch: "red" (offset 0) or "tan" (offset 8 for NPC_Ronin)
  const variantOffset = config.variant === "tan" ? 8 : 0;

  const activeSeq = config.sequence[0] ?? {
    row: 2,
    startCol: 0,
    frames: 7,
    fps: 5,
    pingPong: true,
  };

  const effectiveStartCol = (activeSeq.startCol ?? 0) + variantOffset;

  return (
    <div
      key={playKey}
      className="relative flex flex-col items-center justify-end w-full pt-4 pb-1 select-none overflow-hidden bg-transparent"
    >
      {/* Drifting petals prop (behind avatar) */}
      {config.prop === "petals" && <PetalsOverlay reducedMotion={reducedMotion} />}

      {/* Performing Sprite (direct looping motion, no jump) */}
      <div className="relative z-10">
        {reducedMotion ? (
          // Reduced motion: static resting frame
          <PixelAvatar
            src={config.src}
            row={activeSeq.row}
            startCol={effectiveStartCol}
            frames={activeSeq.frames}
            cols={config.cols}
            rows={config.rows}
            cellWidth={cellWidth}
            cellHeight={cellHeight}
            targetHeight={targetHeight}
            scale={config.scale}
            frame={0}
          />
        ) : (
          // Looping animation sequence (Tai Chi for China, Walking for Japan)
          <PixelAvatar
            src={config.src}
            row={activeSeq.row}
            startCol={effectiveStartCol}
            frames={activeSeq.frames}
            cols={config.cols}
            rows={config.rows}
            cellWidth={cellWidth}
            cellHeight={cellHeight}
            targetHeight={targetHeight}
            scale={config.scale}
            fps={activeSeq.fps}
            pingPong={activeSeq.pingPong ?? false}
          />
        )}
      </div>

      {/* Ground Ellipse Shadow */}
      <div className="relative -mt-3 z-10 flex items-center justify-center pointer-events-none">
        <div className="h-3.5 w-16 rounded-[50%] bg-black/50 blur-[1.5px] opacity-60" />
      </div>

      {/* Caption Label */}
      {config.label && (
        <p className="mt-3 text-center text-xs font-semibold tracking-wide text-zinc-100 z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
          {config.label}
        </p>
      )}
    </div>
  );
}
