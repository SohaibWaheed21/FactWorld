import { writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";

interface SymbolInfo {
  name: string;
  image: string | null;
}

interface CountrySymbols {
  animal?: SymbolInfo;
  bird?: SymbolInfo;
  dish?: SymbolInfo;
}

const USER_AGENT = "CountryGlobeApp/1.0 (https://github.com/DietrichGebert/ponytail)";

async function fetchWikitext(page: string): Promise<string> {
  const res = await fetch(
    `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(page)}&prop=wikitext&format=json`,
    { headers: { "User-Agent": USER_AGENT } }
  );
  if (!res.ok) return "";
  const data = await res.json();
  return data.parse?.wikitext?.["*"] || "";
}

async function fetchWikiImage(title: string): Promise<string | null> {
  if (!title) return null;
  const clean = title.replace(/_/g, " ").trim();
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(clean)}`,
      { headers: { "User-Agent": USER_AGENT } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.thumbnail?.source || null;
  } catch {
    return null;
  }
}

function parseDishes(wikitext: string): Map<string, string> {
  const dishes = new Map<string, string>();
  for (const rawLine of wikitext.split("\n")) {
    const line = rawLine.trim();
    if (!line.startsWith("*")) continue;

    // Matches: * [[Country]]: [[Dish]] or * [[cuisine of Country]]: [[Dish]]
    const m = line.match(/^\*+\s*\[\[(?:cuisine of\s+)?([^\]|]+)(?:\|[^\]]+)?\]\]:\s*(.+)/i);
    if (m) {
      const country = m[1].trim().toLowerCase();
      const dishMatch = m[2].match(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/);
      if (dishMatch) {
        dishes.set(country, dishMatch[2] || dishMatch[1]);
      }
    }
  }
  return dishes;
}

function parseAnimals(wikitext: string): Map<string, string> {
  const animals = new Map<string, string>();
  const rows = wikitext.split("|-");
  for (const r of rows) {
    const cMatch =
      r.match(/\{\{flag\|([^}|]+)\}\}/i) ||
      r.match(/\{\{([A-Z]{3})\}\}/) ||
      r.match(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/);
    if (!cMatch) continue;
    const country = cMatch[1].trim().toLowerCase();

    const parts = r.split("||");
    if (parts.length >= 2) {
      const aMatch = parts[1].match(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/);
      if (aMatch && !animals.has(country)) {
        animals.set(country, aMatch[2] || aMatch[1]);
      }
    }
  }
  return animals;
}

function parseBirds(wikitext: string): Map<string, string> {
  const birds = new Map<string, string>();
  const rows = wikitext.split("|-");
  for (const r of rows) {
    const cMatch =
      r.match(/\{\{flag\|([^}|]+)\}\}/i) ||
      r.match(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/);
    if (!cMatch) continue;
    const country = cMatch[1].trim().toLowerCase();

    const parts = r.split("||");
    if (parts.length >= 2) {
      const bMatch = parts[1].match(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/);
      if (bMatch && !birds.has(country)) {
        birds.set(country, bMatch[2] || bMatch[1]);
      }
    }
  }
  return birds;
}

async function main() {
  console.log("Fetching Wikipedia symbol articles...");
  const [animalText, birdText, dishText] = await Promise.all([
    fetchWikitext("List_of_national_animals"),
    fetchWikitext("List_of_national_birds"),
    fetchWikitext("National_dish"),
  ]);

  const animals = parseAnimals(animalText);
  const birds = parseBirds(birdText);
  const dishes = parseDishes(dishText);

  // Read countries dataset to get all cca3 codes
  const countriesFile = existsSync("data/countries.json") ? "data/countries.json" : "../data/countries.json";
  const countries = JSON.parse(readFileSync(countriesFile, "utf8"));

  // Collect unique symbol titles for image fetching
  const symbolMap: Record<string, CountrySymbols> = {};
  const imageTitles = new Set<string>();

  const POPULAR_OVERRIDES: Record<string, { animal?: string; bird?: string; dish?: string }> = {
    USA: { animal: "American bison", bird: "Bald eagle", dish: "Apple pie" },
    GBR: { animal: "Lion", bird: "European robin", dish: "Fish and chips" },
    DEU: { animal: "Federal eagle", bird: "White stork", dish: "Sauerbraten" },
    FRA: { animal: "Gallic rooster", bird: "Gallic rooster", dish: "Pot-au-feu" },
    ITA: { animal: "Italian wolf", bird: "Italian sparrow", dish: "Pizza" },
    ESP: { animal: "Bull", bird: "Spanish imperial eagle", dish: "Paella" },
    BRA: { animal: "Jaguar", bird: "Rufous-bellied thrush", dish: "Feijoada" },
    MEX: { animal: "Golden eagle", bird: "Crested caracara", dish: "Mole poblano" },
    RUS: { animal: "Eurasian brown bear", bird: "Tundra swan", dish: "Pelmeni" },
    TUR: { animal: "Grey wolf", bird: "Redwing", dish: "Kebab" },
    KOR: { animal: "Siberian tiger", bird: "Korean magpie", dish: "Kimchi" },
    EGY: { animal: "Steppe eagle", bird: "Steppe eagle", dish: "Koshary" },
    ZAF: { animal: "Springbok", bird: "Blue crane", dish: "Bobotie" },
    ARG: { animal: "Rufous hornero", bird: "Rufous hornero", dish: "Asado" },
    PAK: { animal: "Markhor", bird: "Chukar partridge", dish: "Biryani" },
    BGD: { animal: "Bengal tiger", bird: "Oriental magpie-robin", dish: "Hilsa fish curry" },
  };

  for (const c of countries) {
    const code: string = c.cca3;
    const commonName: string = (c.name?.common || "").toLowerCase();
    const officialName: string = (c.name?.official || "").toLowerCase();
    const override = POPULAR_OVERRIDES[code];

    const animal = override?.animal || animals.get(code.toLowerCase()) || animals.get(commonName) || animals.get(officialName);
    const bird = override?.bird || birds.get(code.toLowerCase()) || birds.get(commonName) || birds.get(officialName);
    const dish = override?.dish || dishes.get(code.toLowerCase()) || dishes.get(commonName) || dishes.get(officialName);

    if (animal) imageTitles.add(animal);
    if (bird) imageTitles.add(bird);
    if (dish) imageTitles.add(dish);

    if (animal || bird || dish) {
      symbolMap[code] = {
        ...(animal ? { animal: { name: animal, image: null } } : {}),
        ...(bird ? { bird: { name: bird, image: null } } : {}),
        ...(dish ? { dish: { name: dish, image: null } } : {}),
      };
    }
  }

  console.log(`Matched symbols for ${Object.keys(symbolMap).length} countries. Fetching ${imageTitles.size} images...`);

  // Fetch images in concurrent batches of 15
  const titles = Array.from(imageTitles);
  const imageCache = new Map<string, string | null>();
  const BATCH_SIZE = 15;

  for (let i = 0; i < titles.length; i += BATCH_SIZE) {
    const batch = titles.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (title) => ({
        title,
        img: await fetchWikiImage(title),
      }))
    );
    for (const { title, img } of results) {
      imageCache.set(title, img);
    }
    process.stdout.write(`\rFetched images: ${Math.min(i + BATCH_SIZE, titles.length)}/${titles.length}`);
  }
  console.log("\nImages fetched successfully.");

  // Inject image URLs into the output map
  for (const code of Object.keys(symbolMap)) {
    const s = symbolMap[code];
    if (s.animal) s.animal.image = imageCache.get(s.animal.name) || null;
    if (s.bird) s.bird.image = imageCache.get(s.bird.name) || null;
    if (s.dish) s.dish.image = imageCache.get(s.dish.name) || null;
  }

  mkdirSync("data", { recursive: true });
  writeFileSync("data/national-symbols.json", JSON.stringify(symbolMap, null, 2));
  console.log(`Saved symbols to data/national-symbols.json (${Object.keys(symbolMap).length} countries)`);
}

main().catch(console.error);
