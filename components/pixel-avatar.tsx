"use client";

import React, { useEffect, useState } from "react";

export interface PixelAvatarProps {
  src: string;
  row: number;
  startCol?: number;
  frames: number;
  cols: number;
  rows: number;
  cellWidth?: number;
  cellHeight?: number;
  targetHeight?: number;
  scale?: number;
  fps?: number;
  pingPong?: boolean;
  frame?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface CustomCSSProperties extends React.CSSProperties {
  [key: `--${string}`]: string | number | undefined;
}

export function PixelAvatar({
  src,
  row,
  startCol = 0,
  frames,
  cols,
  rows,
  cellWidth = 64,
  cellHeight = 64,
  targetHeight = 144,
  scale,
  fps = 6,
  pingPong = false,
  frame,
  className = "",
  style = {},
}: PixelAvatarProps) {
  // Integer scale calculation keeping pixels crisp
  const computedScale =
    scale !== undefined
      ? scale
      : Math.max(1, Math.floor((targetHeight ?? 144) / cellHeight));

  const renderedWidth = cellWidth * computedScale;
  const renderedHeight = cellHeight * computedScale;
  const isFrozen = frame !== undefined;
  const endPosition = -frames * renderedWidth;

  // React state frame stepper guarantees continuous frame cycling in all browsers
  const [activeFrame, setActiveFrame] = useState(frame ?? 0);

  useEffect(() => {
    if (isFrozen) {
      setActiveFrame(frame ?? 0);
      return;
    }

    let current = 0;
    let direction = 1;
    const intervalMs = Math.max(40, Math.round(1000 / (fps || 6)));

    const timer = setInterval(() => {
      if (pingPong) {
        current += direction;
        if (current >= frames - 1) {
          current = frames - 1;
          direction = -1;
        } else if (current <= 0) {
          current = 0;
          direction = 1;
        }
      } else {
        current = (current + 1) % frames;
      }
      setActiveFrame(current);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isFrozen, frame, frames, fps, pingPong]);

  // Exact background position formula:
  // x = -(startCol + frame) * cellWidth * scale
  // y = -row * cellHeight * scale
  const posX = -(startCol + activeFrame) * renderedWidth;
  const posY = -row * renderedHeight;

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const resolvedSrc =
    src.startsWith("/") && basePath && !src.startsWith(basePath)
      ? `${basePath}${src}`
      : src;

  const dynamicStyle: CustomCSSProperties = {
    width: `${renderedWidth}px`,
    height: `${renderedHeight}px`,
    backgroundColor: "transparent",
    backgroundImage: `url(${resolvedSrc})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${cols * renderedWidth}px ${rows * renderedHeight}px`,
    backgroundPosition: `${posX}px ${posY}px`,
    imageRendering: "pixelated",
    "--end": `${endPosition}px`,
    ...style,
  };

  return <div className={`inline-block ${className}`} style={dynamicStyle} />;
}
