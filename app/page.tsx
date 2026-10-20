"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GlobeMethods } from "react-globe.gl";
import { createSolarSystem, type SolarSystemController } from "@/lib/solar-system";
import countriesData from "@/data/countries.json";
import nationalSymbols from "@/data/national-symbols.json";
import countriesExtra from "@/data/countries-extra.json";
import { CountryAvatar, type AvatarConfig } from "@/components/country-avatar";
import { FunFactBox } from "@/components/fun-fact-box";
import type { CountryRecord, LanguageItem, CurrencyItem } from "@/lib/fun-fact";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

interface NationalSymbolItem {
  name: string;
  image?: string;
}

interface CountrySymbols {
  animal?: NationalSymbolItem;
  bird?: NationalSymbolItem;
  dish?: NationalSymbolItem;
}

interface CountryProperties {
  ADM0_A3?: string;
  ISO_A3?: string;
  NAME?: string;
  ADMIN?: string;
}

interface CountryFeature {
  type?: string;
  geometry?: object;
  properties?: CountryProperties;
}

function formatLangs(langs: CountryRecord["languages"]): string {
  if (!langs) return "N/A";
  if (Array.isArray(langs)) {
    return langs
      .map((l) => (typeof l === "object" && l !== null ? l.name || "" : String(l)))
      .filter(Boolean)
      .join(", ");
  }
  if (typeof langs === "object") {
    return Object.values(langs)
      .map((l) => (typeof l === "object" && l !== null ? l.name || "" : String(l)))
      .filter(Boolean)
      .join(", ");
  }
  return String(langs);
}

function formatCurrs(curr: CountryRecord["currencies"]): string {
  if (!curr) return "N/A";
  if (Array.isArray(curr)) {
    return curr
      .map((c) => {
        if (typeof c === "object" && c !== null) {
          const label = c.name || c.code || "";
          return `${label}${c.symbol ? ` (${c.symbol})` : ""}`;
        }
        return String(c);
      })
      .filter(Boolean)
      .join(", ");
  }
  if (typeof curr === "object") {
    return Object.values(curr)
      .map((c) => {
        if (typeof c === "object" && c !== null) {
          const label = c.name || c.code || "";
          return `${label}${c.symbol ? ` (${c.symbol})` : ""}`;
        }
        return String(c);
      })
      .filter(Boolean)
      .join(", ");
  }
  return String(curr);
}

const typedCountries = countriesData as unknown as CountryRecord[];
const typedSymbols = nationalSymbols as unknown as Record<string, CountrySymbols>;

export default function GlobePage() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<CountryFeature | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryRecord | null>(null);

  const countryMap = useMemo(() => {
    const map = new Map<string, CountryRecord>();
    for (const c of typedCountries) {
      if (c.cca3) map.set(c.cca3, c);
      const common = typeof c.name === "object" ? c.name.common : c.name;
      if (typeof common === "string") map.set(common.toLowerCase(), c);
    }
    return map;
  }, []);

  const symbols = useMemo<CountrySymbols | null>(() => {
    if (!selectedCountry?.cca3) return null;
    return typedSymbols[selectedCountry.cca3] || null;
  }, [selectedCountry]);

  const [playKey, setPlayKey] = useState(0);

  const extraMap = countriesExtra as unknown as Record<string, { avatar?: AvatarConfig }>;
  const avatarConfig = useMemo(() => {
    if (!selectedCountry?.cca3) return null;
    return extraMap[selectedCountry.cca3]?.avatar || null;
  }, [selectedCountry, extraMap]);

  const solarSystemRef = useRef<SolarSystemController | null>(null);

  useEffect(() => {
    let rafId: number;
    let lastTime = performance.now();

    const animate = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (solarSystemRef.current) {
        solarSystemRef.current.update(delta);
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      if (solarSystemRef.current) {
        solarSystemRef.current.destroy();
        solarSystemRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const controls = globeRef.current?.controls();
    if (controls) {
      if (typeof window !== "undefined" && (window as any).__globeKeepAutoRotate) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.35;
      } else {
        controls.autoRotate = !hoveredCountry && !selectedCountry;
      }
    }
  }, [hoveredCountry, selectedCountry]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/ne_110m_admin_0_countries.geojson`)
      .then((res) => res.json())
      .then((data: { features?: CountryFeature[] }) => setCountries(data.features || []))
      .catch((err: unknown) => console.error("Failed to load GeoJSON:", err));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedCountry(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__globeDevHelper = {
        pointOfView: (coords: { lat: number; lng: number; altitude: number }, ms = 1000) => {
          globeRef.current?.pointOfView(coords, ms);
        },
        getScreenCoords: (lat: number, lng: number, alt = 0) => {
          return globeRef.current?.getScreenCoords?.(lat, lng, alt);
        },
        selectCountry: (code: string, coords?: { lat: number; lng: number }) => {
          const matched = countryMap.get(code);
          const feat = countries.find(
            (c) => c.properties?.ADM0_A3 === code || c.properties?.ISO_A3 === code
          );
          if (feat) setHoveredCountry(feat);
          if (matched) {
            setSelectedCountry(matched);
            setPlayKey((k) => k + 1);
          }
          if (coords) {
            globeRef.current?.pointOfView({ lat: coords.lat, lng: coords.lng, altitude: 1.8 }, 1000);
          }
        },
        setHovered: (code: string | null) => {
          if (!code) {
            setHoveredCountry(null);
            return;
          }
          const feat = countries.find(
            (c) => c.properties?.ADM0_A3 === code || c.properties?.ISO_A3 === code
          );
          if (feat) setHoveredCountry(feat);
        },
        clearSelection: () => {
          setSelectedCountry(null);
          setHoveredCountry(null);
        },
        setAutoRotate: (enabled: boolean, speed = 0.35) => {
          (window as any).__globeKeepAutoRotate = enabled;
          const controls = globeRef.current?.controls();
          if (controls) {
            controls.autoRotate = enabled;
            controls.autoRotateSpeed = speed;
          }
        },
      };
    }
  }, [countryMap, countries]);

  return (
    <main
      className={`relative h-screen w-screen overflow-hidden bg-black font-sans select-none ${
        hoveredCountry ? "globe-cursor-active" : "globe-cursor"
      }`}
    >
      {/* Subtle Cosmic HUD Indicator */}
      <div className="pointer-events-none absolute top-5 left-5 z-20 flex items-center gap-2.5 rounded-full border border-white/10 bg-zinc-950/70 px-3.5 py-1.5 shadow-lg backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
        </span>
        <span className="text-[11px] font-semibold tracking-widest uppercase text-zinc-300">
          Solar System View
        </span>
      </div>

      {/* Top-Left Fun Fact Card */}
      <FunFactBox country={selectedCountry} />

      <Globe
        ref={globeRef}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        showAtmosphere={false}
        atmosphereAltitude={0}
        onGlobeReady={() => {
          const controls = globeRef.current?.controls();
          if (controls) {
            controls.enableRotate = true;
            controls.rotateSpeed = 1.55;
            controls.enableDamping = true;
            controls.dampingFactor = 0.06;
            controls.zoomSpeed = 0.8;
            controls.minPolarAngle = Math.PI * 0.15;
            controls.maxPolarAngle = Math.PI * 0.85;
            controls.autoRotate = true;
            controls.autoRotateSpeed = 2.1;
          }
          const renderer = globeRef.current?.renderer();
          if (renderer && typeof window !== "undefined") {
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
          }

          const camera = globeRef.current?.camera();
          if (camera && "far" in camera && "updateProjectionMatrix" in camera) {
            const persCamera = camera as unknown as { far: number; updateProjectionMatrix: () => void };
            persCamera.far = 25000;
            persCamera.updateProjectionMatrix();
          }

          const scene = globeRef.current?.scene();
          if (scene && !solarSystemRef.current) {
            solarSystemRef.current = createSolarSystem(scene);
          }
        }}
        polygonsData={countries}
        polygonGeoJsonGeometry={(d: object) => (d as CountryFeature).geometry as never}
        polygonCapColor={(d: object) =>
          d === hoveredCountry ? "rgba(56, 189, 248, 0.65)" : "rgba(30, 41, 59, 0.7)"
        }
        polygonSideColor={() => "rgba(15, 23, 42, 0.5)"}
        polygonStrokeColor={() => "#475569"}
        polygonAltitude={(d: object) => (d === hoveredCountry ? 0.025 : 0.005)}
        polygonsTransitionDuration={0}
        onPolygonHover={(polygon: object | null) => {
          const feat = (polygon as CountryFeature | null) ?? null;
          if (feat !== hoveredCountry) setHoveredCountry(feat);
        }}
        onPolygonClick={(polygon: object, _event: MouseEvent, coords: { lat: number; lng: number; altitude: number }) => {
          setPlayKey((k) => k + 1);
          const d = polygon as CountryFeature;
          const code = d.properties?.ADM0_A3 || d.properties?.ISO_A3;
          console.log("Country ADM0_A3:", code);

          globeRef.current?.pointOfView({ lat: coords.lat, lng: coords.lng, altitude: 1.8 }, 1000);

          const matched =
            (code ? countryMap.get(code) : undefined) ||
            (d.properties?.NAME ? countryMap.get(d.properties.NAME.toLowerCase()) : undefined) ||
            (d.properties?.ADMIN ? countryMap.get(d.properties.ADMIN.toLowerCase()) : undefined);

          setSelectedCountry(
            matched || {
              name: { common: d.properties?.NAME || d.properties?.ADMIN || code || "Unknown" },
              cca3: code,
            }
          );
        }}
        polygonLabel={(polygon: object) => {
          const d = polygon as CountryFeature;
          return `
            <div style="background: rgba(15, 23, 42, 0.9); color: #f8fafc; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-family: ui-sans-serif, system-ui, sans-serif; border: 1px solid rgba(56, 189, 248, 0.3);">
              <strong style="color: #38bdf8">${d.properties?.NAME || d.properties?.ADMIN || "Country"}</strong> (${d.properties?.ADM0_A3 || "N/A"})
            </div>
          `;
        }}
      />

      {selectedCountry && (
        <aside className="absolute top-5 right-5 z-20 w-88 max-h-[calc(100vh-2.5rem)] max-w-[calc(100vw-2.5rem)] overflow-y-auto rounded-xl border border-white/10 bg-zinc-950/90 p-5 text-white shadow-2xl backdrop-blur-md transition-all cursor-default [&_*]:cursor-auto">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold leading-tight">
                {typeof selectedCountry.name === "object"
                  ? selectedCountry.name.common
                  : selectedCountry.name}
              </h2>
              {typeof selectedCountry.name === "object" &&
                selectedCountry.name.official &&
                selectedCountry.name.official !== selectedCountry.name.common && (
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {selectedCountry.name.official}
                  </p>
                )}
            </div>
            <button
              onClick={() => setSelectedCountry(null)}
              className="cursor-pointer rounded-lg p-1 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close details"
            >
              ✕
            </button>
          </div>

          {selectedCountry.flags?.svg || selectedCountry.flags?.png ? (
            <div className="relative mt-3 flex h-28 w-full items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-zinc-900/50 p-2.5">
              <img
                src={selectedCountry.flags.svg || selectedCountry.flags.png}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-35 blur-md saturate-150"
              />
              <img
                src={selectedCountry.flags.svg || selectedCountry.flags.png}
                alt={
                  typeof selectedCountry.name === "object"
                    ? `${selectedCountry.name.common} flag`
                    : "Flag"
                }
                className="relative z-10 max-h-full max-w-[90%] rounded object-contain shadow-lg ring-1 ring-white/15"
              />
            </div>
          ) : null}

          <div className="mt-4 space-y-2 text-xs text-zinc-300">
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-zinc-500">Code (CCA3)</span>
              <span className="font-mono font-medium text-zinc-200">
                {selectedCountry.cca3 || "N/A"}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-zinc-500">Capital</span>
              <span className="text-right text-zinc-200">
                {Array.isArray(selectedCountry.capital)
                  ? selectedCountry.capital.join(", ")
                  : selectedCountry.capital || "N/A"}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-zinc-500">Region</span>
              <span className="text-zinc-200">{selectedCountry.region || "N/A"}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-zinc-500">Population</span>
              <span className="text-zinc-200">
                {typeof selectedCountry.population === "number"
                  ? selectedCountry.population.toLocaleString()
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-zinc-500">Languages</span>
              <span
                className="max-w-[60%] truncate text-right text-zinc-200"
                title={formatLangs(selectedCountry.languages)}
              >
                {formatLangs(selectedCountry.languages)}
              </span>
            </div>
            <div className="flex justify-between pb-0.5">
              <span className="text-zinc-500">Currencies</span>
              <span
                className="max-w-[60%] truncate text-right text-zinc-200"
                title={formatCurrs(selectedCountry.currencies)}
              >
                {formatCurrs(selectedCountry.currencies)}
              </span>
            </div>
          </div>

          {symbols && (symbols.animal || symbols.bird || symbols.dish) && (
            <div className="mt-4 border-t border-white/10 pt-3">
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                National Symbols
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {symbols.animal && (
                  <div className="flex flex-col items-center rounded-lg border border-white/5 bg-white/[0.03] p-1.5 text-center">
                    <div className="relative mb-1 flex h-14 w-full items-center justify-center overflow-hidden rounded-md bg-black/40">
                      {symbols.animal.image ? (
                        <img
                          src={symbols.animal.image}
                          alt={symbols.animal.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-xl">🐾</span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-zinc-500">Animal</span>
                    <span
                      className="line-clamp-2 mt-0.5 text-[11px] font-medium leading-tight text-zinc-200"
                      title={symbols.animal.name}
                    >
                      {symbols.animal.name}
                    </span>
                  </div>
                )}

                {symbols.bird && (
                  <div className="flex flex-col items-center rounded-lg border border-white/5 bg-white/[0.03] p-1.5 text-center">
                    <div className="relative mb-1 flex h-14 w-full items-center justify-center overflow-hidden rounded-md bg-black/40">
                      {symbols.bird.image ? (
                        <img
                          src={symbols.bird.image}
                          alt={symbols.bird.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-xl">🦅</span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-zinc-500">Bird</span>
                    <span
                      className="line-clamp-2 mt-0.5 text-[11px] font-medium leading-tight text-zinc-200"
                      title={symbols.bird.name}
                    >
                      {symbols.bird.name}
                    </span>
                  </div>
                )}

                {symbols.dish && (
                  <div className="flex flex-col items-center rounded-lg border border-white/5 bg-white/[0.03] p-1.5 text-center">
                    <div className="relative mb-1 flex h-14 w-full items-center justify-center overflow-hidden rounded-md bg-black/40">
                      {symbols.dish.image ? (
                        <img
                          src={symbols.dish.image}
                          alt={symbols.dish.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-xl">🍲</span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-zinc-500">Dish</span>
                    <span
                      className="line-clamp-2 mt-0.5 text-[11px] font-medium leading-tight text-zinc-200 capitalize"
                      title={symbols.dish.name}
                    >
                      {symbols.dish.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      )}

      {/* Left-side Floating Avatar (Transparent, no card background) */}
      {avatarConfig && (
        <aside className="fixed bottom-8 left-8 z-30 w-72 max-w-[calc(100vw-4rem)] flex flex-col items-center pointer-events-none [&_*]:pointer-events-auto select-none">
          <CountryAvatar config={avatarConfig} playKey={playKey} />

          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-300">
            <a
              href={
                avatarConfig.creditsUrl
                  ? ((process.env.NEXT_PUBLIC_BASE_PATH || "") + avatarConfig.creditsUrl)
                  : ((process.env.NEXT_PUBLIC_BASE_PATH || "") + "/credits")
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors cursor-pointer drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
            >
              {avatarConfig.creditsLabel || "Credits"}
            </a>
          </div>
        </aside>
      )}
    </main>
  );
}

