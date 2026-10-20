import { mkdirSync, writeFileSync } from "node:fs";

const PRIMARY_URL = "https://restcountries.com/v3.1/all?fields=name,cca3,flags,capital,population,region,languages,currencies";
const MIRROR_URL = "https://raw.githubusercontent.com/Qasimorakza/Rest-Countries-API/main/data.json";

async function fetchCountries() {
  try {
    const res = await fetch(PRIMARY_URL);
    const data = await res.json();
    if (Array.isArray(data)) return data;
  } catch {}

  // Fallback if REST Countries v3.1 is unreachable or deprecated
  const res = await fetch(MIRROR_URL);
  const raw: any[] = await res.json();
  return raw.map((c) => ({
    name: typeof c.name === "string" ? { common: c.name, official: c.name } : c.name,
    cca3: c.cca3 || c.alpha3Code,
    flags: c.flags || { png: `https://flagcdn.com/w320/${c.alpha2Code?.toLowerCase()}.png`, svg: c.flag },
    capital: Array.isArray(c.capital) ? c.capital : (c.capital ? [c.capital] : []),
    population: c.population ?? 0,
    region: c.region || "",
    languages: c.languages || {},
    currencies: c.currencies || {},
    area: c.area ?? 0,
    borders: Array.isArray(c.borders) ? c.borders : [],
    landlocked: Boolean(c.landlocked),
  }));
}

const countries = await fetchCountries();
mkdirSync("data", { recursive: true });
writeFileSync("data/countries.json", JSON.stringify(countries, null, 2));
console.log(`Saved ${countries.length} countries to data/countries.json`);
