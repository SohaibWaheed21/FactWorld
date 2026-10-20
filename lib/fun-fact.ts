import countriesData from "@/data/countries.json";
import countriesExtra from "@/data/countries-extra.json";

export interface LanguageItem {
  name?: string;
  code?: string;
  iso639_1?: string;
  iso639_2?: string;
  nativeName?: string;
}

export interface CurrencyItem {
  code?: string;
  name?: string;
  symbol?: string;
}

export interface CountryRecord {
  name: {
    common: string;
    official?: string;
  } | string;
  cca3?: string;
  flags?: {
    png?: string;
    svg?: string;
  };
  capital?: string[] | string;
  population?: number;
  region?: string;
  languages?: LanguageItem[] | Record<string, string | LanguageItem> | string;
  currencies?: CurrencyItem[] | Record<string, CurrencyItem | string> | string;
  area?: number;
  borders?: string[];
  landlocked?: boolean;
}

interface ExtraCountryData {
  funFact?: string;
  [key: string]: unknown;
}

const typedCountries = countriesData as unknown as CountryRecord[];
const typedExtra = countriesExtra as unknown as Record<string, ExtraCountryData>;

// Precompute population ranks once (1-indexed)
const populationRanks = new Map<string, number>();
[...typedCountries]
  .filter((c) => typeof c.population === "number" && c.population > 0 && c.cca3)
  .sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
  .forEach((c, idx) => {
    if (c.cca3) populationRanks.set(c.cca3, idx + 1);
  });

// Precompute area ranks once (1-indexed)
const areaRanks = new Map<string, number>();
[...typedCountries]
  .filter((c) => typeof c.area === "number" && c.area > 0 && c.cca3)
  .sort((a, b) => (b.area ?? 0) - (a.area ?? 0))
  .forEach((c, idx) => {
    if (c.cca3) areaRanks.set(c.cca3, idx + 1);
  });

function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getCountryCommonName(country: CountryRecord): string {
  if (typeof country.name === "object" && country.name?.common) {
    return country.name.common;
  }
  if (typeof country.name === "string") {
    return country.name;
  }
  return country.cca3 || "This country";
}

/**
 * Returns a truthful, deterministic fun fact for the given country.
 * Prioritizes custom funFact in countries-extra.json, then falls back to verified REST Countries data.
 */
export function getFunFact(country: CountryRecord | null): string {
  if (!country) return "";

  const code = country.cca3 || "";
  const name = getCountryCommonName(country);

  // 1. Check custom funFact in countries-extra.json
  if (code && typedExtra[code]?.funFact && typeof typedExtra[code].funFact === "string") {
    const custom = typedExtra[code].funFact.trim();
    if (custom.length > 0) return custom;
  }

  // 2. Build candidates from existing verified fields
  const candidates: string[] = [];

  // A. Population rank
  const popRank = code ? populationRanks.get(code) : undefined;
  if (popRank && typeof country.population === "number" && country.population > 0) {
    let popStr: string;
    if (country.population >= 1e9) {
      popStr = `about ${(country.population / 1e9).toFixed(1)} billion people`;
    } else if (country.population >= 1e6) {
      popStr = `about ${Math.round(country.population / 1e6).toLocaleString()} million people`;
    } else {
      popStr = `about ${country.population.toLocaleString()} people`;
    }
    candidates.push(
      `${name} is the ${getOrdinal(popRank)} most populous country in the world, with ${popStr}.`
    );
  }

  // B. Area rank
  const areaRank = code ? areaRanks.get(code) : undefined;
  if (areaRank && typeof country.area === "number" && country.area > 0) {
    candidates.push(`${name} is the ${getOrdinal(areaRank)} largest country by area.`);
  }

  // C. Border count or island nation
  if (Array.isArray(country.borders)) {
    if (country.borders.length === 0) {
      candidates.push(`${name} is an island nation with no land borders.`);
    } else {
      const count = country.borders.length;
      candidates.push(
        `${name} shares land borders with ${count} ${count === 1 ? "neighboring country" : "neighboring countries"}.`
      );
    }
  }

  // D. Number of official languages when more than one
  let langCount = 0;
  if (Array.isArray(country.languages)) {
    langCount = country.languages.length;
  } else if (country.languages && typeof country.languages === "object") {
    langCount = Object.keys(country.languages).length;
  }
  if (langCount > 1) {
    candidates.push(`${name} has ${langCount} official languages.`);
  }

  // E. Landlocked status, when true
  if (country.landlocked === true) {
    candidates.push(`${name} is a landlocked nation with no direct access to the sea.`);
  }

  if (candidates.length === 0) {
    return country.region ? `${name} is located in ${country.region}.` : `${name} is on the globe.`;
  }

  // Deterministic pick based on country code/name hash
  const seed = code || name;
  const index = hashString(seed) % candidates.length;
  return candidates[index];
}
