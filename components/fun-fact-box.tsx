"use client";

import React, { useEffect, useState } from "react";
import { type CountryRecord, getCountryCommonName, getFunFact } from "@/lib/fun-fact";

export interface FunFactBoxProps {
  country: CountryRecord | null;
}

export function FunFactBox({ country }: FunFactBoxProps) {
  const [displayedCountry, setDisplayedCountry] = useState<CountryRecord | null>(country);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const currentCode = displayedCountry?.cca3 || (displayedCountry ? "unknown" : null);
    const nextCode = country?.cca3 || (country ? "unknown" : null);

    if (currentCode === nextCode) {
      setDisplayedCountry(country);
      return;
    }

    // Step 1: Fade and slide out current content (~120ms)
    setIsExiting(true);
    const timer = setTimeout(() => {
      // Step 2: Swap content and fade and slide in (~130ms, total ~250ms)
      setDisplayedCountry(country);
      setIsExiting(false);
    }, 120);

    return () => clearTimeout(timer);
  }, [country, displayedCountry]);

  const commonName = displayedCountry ? getCountryCommonName(displayedCountry) : "";
  const flagSrc = displayedCountry?.flags?.svg || displayedCountry?.flags?.png;
  const factText = displayedCountry ? getFunFact(displayedCountry) : "";

  return (
    <aside
      aria-label="Country fun fact"
      className="fixed top-16 left-5 z-20 pointer-events-none w-full max-w-[260px] sm:max-w-[320px] select-none"
    >
      <div className="rounded-xl border border-white/10 bg-zinc-950/80 p-3.5 shadow-2xl backdrop-blur-md text-white transition-colors duration-200">
        <div
          className={`transition-all duration-[125ms] ease-in-out motion-reduce:transform-none ${
            isExiting ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0"
          }`}
        >
          {displayedCountry ? (
            <>
              {/* Country Flag & Name */}
              <div className="flex items-center gap-2 mb-1.5">
                {flagSrc && (
                  <img
                    src={flagSrc}
                    alt=""
                    aria-hidden="true"
                    className="w-5 h-3.5 object-cover rounded-[2px] shadow-sm flex-shrink-0 border border-white/10"
                  />
                )}
                <span className="text-xs font-semibold text-zinc-100 truncate">
                  {commonName}
                </span>
              </div>

              {/* Label */}
              <div className="text-[10px] font-semibold tracking-wider uppercase text-cyan-400 mb-1">
                Fun Fact
              </div>

              {/* Fact text */}
              <p
                aria-live="polite"
                className="text-xs leading-relaxed text-zinc-300 font-normal"
              >
                {factText}
              </p>
            </>
          ) : (
            <>
              {/* Idle State */}
              <div className="text-[10px] font-semibold tracking-wider uppercase text-zinc-500 mb-1">
                Fun Fact
              </div>
              <p
                aria-live="polite"
                className="text-xs leading-relaxed text-zinc-400/90 italic"
              >
                Click a country to discover a fun fact
              </p>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
