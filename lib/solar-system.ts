import * as THREE from "three";

export interface SolarSystemController {
  update: (delta: number) => void;
  destroy: () => void;
}

interface MoonConfig {
  name: string;
  symbol: string;
  radius: number;
  distance: number;
  speed: number;
  inclination: number;
  initialAngle: number;
  textureUrl: string;
  bumpUrl?: string;
  bumpScale?: number;
  roughness: number;
  colorHex: string;
}

interface PlanetConfig {
  name: string;
  symbol: string;
  radius: number;
  distance: number;
  speed: number;
  inclination: number;
  initialAngle: number;
  textureUrl: string;
  bumpUrl?: string;
  bumpScale?: number;
  roughness: number;
  metalness: number;
  axialTilt?: number;
  hasRings?: boolean;
  ringInnerRadius?: number;
  ringOuterRadius?: number;
  ringColorUrl?: string;
  ringPatternUrl?: string;
  colorHex: string;
  moons?: MoonConfig[];
}

// 1. Brilliant sparkle star texture with 4-point cross diffraction spikes
function createSparkleStarTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const cx = 64;
    const cy = 64;

    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 56);
    coreGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
    coreGrad.addColorStop(0.12, "rgba(255, 255, 255, 0.95)");
    coreGrad.addColorStop(0.3, "rgba(224, 242, 254, 0.55)");
    coreGrad.addColorStop(0.65, "rgba(186, 230, 253, 0.15)");
    coreGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = coreGrad;
    ctx.fillRect(0, 0, 128, 128);

    ctx.lineWidth = 1.8;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.beginPath();
    ctx.moveTo(cx, 6);
    ctx.lineTo(cx, 122);
    ctx.moveTo(6, cy);
    ctx.lineTo(122, cy);
    ctx.stroke();

    ctx.lineWidth = 3.5;
    ctx.strokeStyle = "rgba(224, 242, 254, 0.45)";
    ctx.beginPath();
    ctx.moveTo(cx, 22);
    ctx.lineTo(cx, 106);
    ctx.moveTo(22, cy);
    ctx.lineTo(106, cy);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 2. Soft round glowing point texture for deep starfield
function createSoftStarTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255, 255, 255, 1)");
    grad.addColorStop(0.25, "rgba(255, 255, 255, 0.9)");
    grad.addColorStop(0.55, "rgba(224, 242, 254, 0.35)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 3. Radiant Sun glow corona
function createGlowTexture(color1: string, color2: string, color3: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, "rgba(255, 255, 255, 1)");
    grad.addColorStop(0.18, color1);
    grad.addColorStop(0.48, color2);
    grad.addColorStop(0.75, color3);
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 4. Cosmic deep nebula dust cloud
function createNebulaTexture(color: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 256);
    grad.addColorStop(0, color);
    grad.addColorStop(0.4, color.replace(/[\d.]+\)$/, "0.15)"));
    grad.addColorStop(0.7, color.replace(/[\d.]+\)$/, "0.05)"));
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 5. Precise radial UV remapped RingGeometry for Saturn's rings
function createSaturnRingGeometry(
  innerRadius: number,
  outerRadius: number,
  thetaSegments = 96,
  phiSegments = 8
): THREE.RingGeometry {
  const geo = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments, phiSegments);
  const pos = geo.attributes.position;
  const uvs = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const r = Math.sqrt(x * x + y * y);
    const u = Math.max(0, Math.min(1, (r - innerRadius) / (outerRadius - innerRadius)));
    uvs.setXY(i, u, 0.5);
  }
  uvs.needsUpdate = true;
  return geo;
}

// 6. Text label billboard sprite
function createTextLabelSprite(text: string, colorHex: string): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.shadowColor = colorHex;
    ctx.shadowBlur = 12;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, 128, 32);

    ctx.fillStyle = colorHex;
    ctx.fillText(text, 128, 32);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(65, 16, 1);
  return sprite;
}

export function createSolarSystem(scene: THREE.Scene): SolarSystemController {
  const group = new THREE.Group();
  scene.add(group);

  const disposables: { dispose: () => void }[] = [];
  const textureLoader = new THREE.TextureLoader();

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const loadTex = (url: string, isColor = true): THREE.Texture => {
    const fullUrl =
      url.startsWith("http") || (basePath && url.startsWith(basePath))
        ? url
        : `${basePath}${url}`;
    const tex = textureLoader.load(fullUrl);
    if (isColor) tex.colorSpace = THREE.SRGBColorSpace;
    disposables.push(tex);
    return tex;
  };

  // ==========================================
  // 1. BRIGHT 3D STARS (Spanning Deep Cosmic Field)
  // ==========================================
  const brightCount = 450;
  const brightPositions = new Float32Array(brightCount * 3);
  const brightColors = new Float32Array(brightCount * 3);

  const brightPalette = [
    new THREE.Color(1.0, 1.0, 1.0), // Diamond White
    new THREE.Color(0.55, 0.9, 1.0), // Sirius Cyan
    new THREE.Color(1.0, 0.92, 0.4), // Golden Amber
    new THREE.Color(1.0, 0.65, 0.4), // Betelgeuse Orange
  ];

  for (let i = 0; i < brightCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const radius = 1400 + Math.random() * 4500;

    brightPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    brightPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    brightPositions[i * 3 + 2] = radius * Math.cos(phi);

    const col = brightPalette[i % brightPalette.length];
    brightColors[i * 3] = col.r;
    brightColors[i * 3 + 1] = col.g;
    brightColors[i * 3 + 2] = col.b;
  }

  const brightGeo = new THREE.BufferGeometry();
  brightGeo.setAttribute("position", new THREE.BufferAttribute(brightPositions, 3));
  brightGeo.setAttribute("color", new THREE.BufferAttribute(brightColors, 3));
  disposables.push(brightGeo);

  const sparkleTex = createSparkleStarTexture();
  disposables.push(sparkleTex);

  const brightMat = new THREE.PointsMaterial({
    size: 26,
    vertexColors: true,
    map: sparkleTex,
    transparent: true,
    opacity: 1.0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  disposables.push(brightMat);

  const brightStars = new THREE.Points(brightGeo, brightMat);
  group.add(brightStars);

  // --- Layer B: 4,000 Dense Deep Starfield Stars ---
  const fieldCount = 4000;
  const fieldPositions = new Float32Array(fieldCount * 3);
  const fieldColors = new Float32Array(fieldCount * 3);

  for (let i = 0; i < fieldCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const radius = 1200 + Math.random() * 5200;

    fieldPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    fieldPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    fieldPositions[i * 3 + 2] = radius * Math.cos(phi);

    const rand = Math.random();
    let col: THREE.Color;
    if (rand < 0.5) col = brightPalette[0];
    else if (rand < 0.75) col = brightPalette[1];
    else col = brightPalette[2];

    fieldColors[i * 3] = col.r;
    fieldColors[i * 3 + 1] = col.g;
    fieldColors[i * 3 + 2] = col.b;
  }

  const fieldGeo = new THREE.BufferGeometry();
  fieldGeo.setAttribute("position", new THREE.BufferAttribute(fieldPositions, 3));
  fieldGeo.setAttribute("color", new THREE.BufferAttribute(fieldColors, 3));
  disposables.push(fieldGeo);

  const softStarTex = createSoftStarTexture();
  disposables.push(softStarTex);

  const fieldMat = new THREE.PointsMaterial({
    size: 10,
    vertexColors: true,
    map: softStarTex,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  disposables.push(fieldMat);

  const fieldStars = new THREE.Points(fieldGeo, fieldMat);
  group.add(fieldStars);

  // ==========================================
  // 2. DEEP COSMIC NEBULAE
  // ==========================================
  const nebulaConfigs = [
    { color: "rgba(14, 165, 233, 0.14)", pos: [-2400, 800, -2200], scale: 1800 },
    { color: "rgba(168, 85, 247, 0.12)", pos: [2200, -700, -2000], scale: 1700 },
    { color: "rgba(236, 72, 153, 0.10)", pos: [-1800, -900, 2400], scale: 1900 },
    { color: "rgba(56, 189, 248, 0.12)", pos: [2000, 1100, 1800], scale: 1700 },
  ];

  for (const neb of nebulaConfigs) {
    const tex = createNebulaTexture(neb.color);
    disposables.push(tex);
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    disposables.push(mat);
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(neb.pos[0], neb.pos[1], neb.pos[2]);
    sprite.scale.set(neb.scale, neb.scale, 1);
    group.add(sprite);
  }

  // ==========================================
  // 3. THE RADIANT SUN (Deep Space Illuminator)
  // ==========================================
  const sunPos = new THREE.Vector3(-4200, 1600, -4500);

  const sunTex = loadTex("/textures/planets/sunmap.jpg");
  const sunGeo = new THREE.SphereGeometry(450, 48, 48);
  const sunMat = new THREE.MeshBasicMaterial({ map: sunTex });
  disposables.push(sunGeo, sunMat);

  const sunMesh = new THREE.Mesh(sunGeo, sunMat);
  sunMesh.position.copy(sunPos);
  group.add(sunMesh);

  const sunGlowTex = createGlowTexture(
    "rgba(254, 240, 138, 0.95)",
    "rgba(245, 158, 11, 0.45)",
    "rgba(234, 88, 12, 0.15)"
  );
  disposables.push(sunGlowTex);

  const sunCoronaMat = new THREE.SpriteMaterial({
    map: sunGlowTex,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  disposables.push(sunCoronaMat);

  const sunCorona1 = new THREE.Sprite(sunCoronaMat);
  sunCorona1.position.copy(sunPos);
  sunCorona1.scale.set(1800, 1800, 1);
  group.add(sunCorona1);

  const sunCorona2 = new THREE.Sprite(sunCoronaMat);
  sunCorona2.position.copy(sunPos);
  sunCorona2.scale.set(3600, 3600, 1);
  group.add(sunCorona2);

  // Sun direction light illuminating planets with realistic terminator shadows
  const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.6);
  sunLight.position.copy(sunPos);
  sunLight.target.position.set(0, 0, 0);
  group.add(sunLight);
  group.add(sunLight.target);

  const sunPointLight = new THREE.PointLight(0xffedd5, 1.8, 15000, 0.5);
  sunPointLight.position.copy(sunPos);
  group.add(sunPointLight);

  // Soft cosmic ambient light so night sides have subtle visibility
  const ambientLight = new THREE.AmbientLight(0x475569, 0.45);
  group.add(ambientLight);
  disposables.push(ambientLight);

  const sunLabel = createTextLabelSprite("☼ Sun", "#fde047");
  sunLabel.position.set(sunPos.x, sunPos.y + 530, sunPos.z);
  group.add(sunLabel);

  // ==========================================
  // 4. PHOTOREALISTIC PLANETS & MOONS (Spacious Layout)
  // ==========================================
  interface ActiveMoon {
    mesh: THREE.Mesh;
    config: MoonConfig;
    angle: number;
    label?: THREE.Sprite;
  }

  interface ActivePlanet {
    group: THREE.Group;
    bodyMesh: THREE.Mesh;
    config: PlanetConfig;
    angle: number;
    label: THREE.Sprite;
    moons: ActiveMoon[];
  }

  const activePlanets: ActivePlanet[] = [];

  const planets: PlanetConfig[] = [
    {
      name: "Moon",
      symbol: "☽",
      radius: 25, // Earth is 100
      distance: 380, // Comfortable breathing room outside Earth's near camera zone
      speed: 0.32,
      inclination: 0.11,
      initialAngle: 0.4,
      textureUrl: "/textures/planets/moonmap1k.jpg",
      bumpUrl: "/textures/planets/moonbump1k.jpg",
      bumpScale: 0.05,
      roughness: 0.95,
      metalness: 0.02,
      colorHex: "#e2e8f0",
    },
    {
      name: "Venus",
      symbol: "♀",
      radius: 78,
      distance: 780,
      speed: 0.2,
      inclination: -0.07,
      initialAngle: 2.3,
      textureUrl: "/textures/planets/venusmap.jpg",
      bumpUrl: "/textures/planets/venusbump.jpg",
      bumpScale: 0.025,
      roughness: 0.72,
      metalness: 0.05,
      axialTilt: 3.1,
      colorHex: "#fef08a",
    },
    {
      name: "Mars",
      symbol: "♂",
      radius: 52,
      distance: 1320,
      speed: 0.15,
      inclination: 0.12,
      initialAngle: 4.5,
      textureUrl: "/textures/planets/marsmap1k.jpg",
      bumpUrl: "/textures/planets/marsbump1k.jpg",
      bumpScale: 0.06,
      roughness: 0.88,
      metalness: 0.04,
      axialTilt: 0.44,
      colorHex: "#fb923c",
    },
    {
      name: "Jupiter",
      symbol: "♃",
      radius: 185,
      distance: 2250,
      speed: 0.08,
      inclination: -0.05,
      initialAngle: 1.0,
      textureUrl: "/textures/planets/jupitermap.jpg",
      roughness: 0.65,
      metalness: 0.02,
      axialTilt: 0.05,
      colorHex: "#f59e0b",
      moons: [
        {
          name: "Europa",
          symbol: "☾",
          radius: 14,
          distance: 280,
          speed: 0.45,
          inclination: 0.08,
          initialAngle: 1.5,
          textureUrl: "/textures/planets/moonmap1k.jpg",
          bumpUrl: "/textures/planets/moonbump1k.jpg",
          bumpScale: 0.03,
          roughness: 0.9,
          colorHex: "#cbd5e1",
        },
      ],
    },
    {
      name: "Saturn",
      symbol: "♄",
      radius: 150,
      distance: 3400,
      speed: 0.05,
      inclination: 0.09,
      initialAngle: 3.6,
      textureUrl: "/textures/planets/saturnmap.jpg",
      roughness: 0.65,
      metalness: 0.02,
      axialTilt: 0.47,
      hasRings: true,
      ringInnerRadius: 180,
      ringOuterRadius: 340,
      ringColorUrl: "/textures/planets/saturnringcolor.jpg",
      ringPatternUrl: "/textures/planets/saturnringpattern.gif",
      colorHex: "#facc15",
    },
  ];

  for (const p of planets) {
    // A) White Planetary Orbit Line
    const segments = 160;
    const pathPositions = new Float32Array((segments + 1) * 3);
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = Math.cos(theta) * p.distance;
      const z = Math.sin(theta) * p.distance;
      const y = Math.sin(theta) * Math.sin(p.inclination) * p.distance * 0.5;
      pathPositions[i * 3] = x;
      pathPositions[i * 3 + 1] = y;
      pathPositions[i * 3 + 2] = z;
    }

    const orbitGeo = new THREE.BufferGeometry();
    orbitGeo.setAttribute("position", new THREE.BufferAttribute(pathPositions, 3));
    disposables.push(orbitGeo);

    const orbitMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: p.name === "Moon" ? 0.35 : 0.18,
    });
    disposables.push(orbitMat);

    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    group.add(orbitLine);

    // B) Planet Group & Photorealistic Sphere
    const planetGroup = new THREE.Group();
    group.add(planetGroup);

    const planetGeo = new THREE.SphereGeometry(p.radius, 64, 64);
    const planetMap = loadTex(p.textureUrl, true);
    const bumpMap = p.bumpUrl ? loadTex(p.bumpUrl, false) : undefined;

    const planetMat = new THREE.MeshStandardMaterial({
      map: planetMap,
      bumpMap: bumpMap,
      bumpScale: p.bumpScale ?? 0.03,
      roughness: p.roughness,
      metalness: p.metalness,
    });
    disposables.push(planetGeo, planetMat);

    const bodyMesh = new THREE.Mesh(planetGeo, planetMat);
    if (p.axialTilt) {
      bodyMesh.rotation.z = p.axialTilt;
    }
    planetGroup.add(bodyMesh);

    // C) Photorealistic Saturn Rings with Radial Cassini Division
    if (p.hasRings && p.ringInnerRadius && p.ringOuterRadius && p.ringColorUrl) {
      const ringGeo = createSaturnRingGeometry(p.ringInnerRadius, p.ringOuterRadius, 128, 8);
      const ringColorTex = loadTex(p.ringColorUrl, true);
      const ringPatternTex = p.ringPatternUrl ? loadTex(p.ringPatternUrl, false) : undefined;

      const ringMat = new THREE.MeshStandardMaterial({
        map: ringColorTex,
        alphaMap: ringPatternTex,
        transparent: true,
        roughness: 0.6,
        metalness: 0.1,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      disposables.push(ringGeo, ringMat);

      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      bodyMesh.add(ringMesh);
    }

    // D) Label Billboard Sprite
    const label = createTextLabelSprite(`${p.symbol} ${p.name}`, p.colorHex);
    disposables.push(label.material);
    group.add(label);

    // E) Moons (e.g. Europa for Jupiter)
    const activeMoons: ActiveMoon[] = [];
    if (p.moons) {
      for (const m of p.moons) {
        // Moon orbit ring around its host planet
        const mSegs = 96;
        const mPath = new Float32Array((mSegs + 1) * 3);
        for (let i = 0; i <= mSegs; i++) {
          const theta = (i / mSegs) * Math.PI * 2;
          mPath[i * 3] = Math.cos(theta) * m.distance;
          mPath[i * 3 + 1] = Math.sin(theta) * Math.sin(m.inclination) * m.distance * 0.3;
          mPath[i * 3 + 2] = Math.sin(theta) * m.distance;
        }
        const mOrbitGeo = new THREE.BufferGeometry();
        mOrbitGeo.setAttribute("position", new THREE.BufferAttribute(mPath, 3));
        const mOrbitMat = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.25,
        });
        disposables.push(mOrbitGeo, mOrbitMat);
        const mOrbitLine = new THREE.Line(mOrbitGeo, mOrbitMat);
        planetGroup.add(mOrbitLine);

        // Moon sphere
        const mGeo = new THREE.SphereGeometry(m.radius, 32, 32);
        const mMap = loadTex(m.textureUrl, true);
        const mBump = m.bumpUrl ? loadTex(m.bumpUrl, false) : undefined;
        const mMat = new THREE.MeshStandardMaterial({
          map: mMap,
          bumpMap: mBump,
          bumpScale: m.bumpScale ?? 0.02,
          roughness: m.roughness,
          metalness: 0.02,
        });
        disposables.push(mGeo, mMat);

        const mMesh = new THREE.Mesh(mGeo, mMat);
        planetGroup.add(mMesh);

        const mLabel = createTextLabelSprite(`${m.symbol} ${m.name}`, m.colorHex);
        disposables.push(mLabel.material);
        group.add(mLabel);

        activeMoons.push({
          mesh: mMesh,
          config: m,
          angle: m.initialAngle,
          label: mLabel,
        });
      }
    }

    activePlanets.push({
      group: planetGroup,
      bodyMesh,
      config: p,
      angle: p.initialAngle,
      label,
      moons: activeMoons,
    });
  }

  // ==========================================
  // 5. ANIMATED SHOOTING STAR (Meteor Streak)
  // ==========================================
  const meteorPoints = new Float32Array([0, 0, 0, -140, -70, -110]);
  const meteorGeo = new THREE.BufferGeometry();
  meteorGeo.setAttribute("position", new THREE.BufferAttribute(meteorPoints, 3));
  disposables.push(meteorGeo);

  const meteorMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
  });
  disposables.push(meteorMat);

  const meteor = new THREE.Line(meteorGeo, meteorMat);
  group.add(meteor);

  let meteorActive = false;
  let meteorTimer = 3.0;
  let meteorProgress = 0;
  const meteorStart = new THREE.Vector3();
  const meteorVelocity = new THREE.Vector3();

  // ==========================================
  // 6. ANIMATION UPDATE LOOP
  // ==========================================
  let totalTime = 0;

  const update = (delta: number) => {
    totalTime += delta;

    // A) Rotate Starfields slowly
    brightStars.rotation.y += delta * 0.002;
    fieldStars.rotation.y += delta * 0.003;

    // Twinkling brightness modulation
    brightMat.opacity = 0.85 + Math.sin(totalTime * 3.0) * 0.15;

    // B) Pulsate Sun Corona
    const pulse = 1 + Math.sin(totalTime * 2.0) * 0.05;
    sunCorona1.scale.set(1800 * pulse, 1800 * pulse, 1);
    sunCorona2.scale.set(3600 * (1.02 - pulse * 0.02), 3600 * (1.02 - pulse * 0.02), 1);

    // C) Move Planets along Orbits
    for (const p of activePlanets) {
      p.angle += delta * p.config.speed * 0.16;
      const x = Math.cos(p.angle) * p.config.distance;
      const z = Math.sin(p.angle) * p.config.distance;
      const y = Math.sin(p.angle) * Math.sin(p.config.inclination) * p.config.distance * 0.5;

      p.group.position.set(x, y, z);
      p.bodyMesh.rotation.y += delta * 0.35;

      p.label.position.set(x, y + p.config.radius * 1.35 + 24, z);

      // Update Moons orbiting this planet
      for (const m of p.moons) {
        m.angle += delta * m.config.speed * 0.5;
        const mx = Math.cos(m.angle) * m.config.distance;
        const mz = Math.sin(m.angle) * m.config.distance;
        const my = Math.sin(m.angle) * Math.sin(m.config.inclination) * m.config.distance * 0.3;

        m.mesh.position.set(mx, my, mz);
        m.mesh.rotation.y += delta * 0.5;

        if (m.label) {
          m.label.position.set(x + mx, y + my + m.config.radius * 1.3 + 14, z + mz);
        }
      }
    }

    // D) Shooting Star / Meteor animation
    meteorTimer -= delta;
    if (meteorTimer <= 0 && !meteorActive) {
      meteorActive = true;
      meteorProgress = 0;
      meteorTimer = 4.0 + Math.random() * 5.0;

      meteorStart.set(
        (Math.random() - 0.5) * 3200,
        900 + Math.random() * 700,
        -1400 - Math.random() * 1400
      );
      meteorVelocity.set(
        -600 - Math.random() * 300,
        -400 - Math.random() * 200,
        350 + Math.random() * 200
      );
      meteor.position.copy(meteorStart);
      meteorMat.opacity = 1.0;
    }

    if (meteorActive) {
      meteorProgress += delta * 1.4;
      meteor.position.addScaledVector(meteorVelocity, delta);
      meteorMat.opacity = Math.max(0, 1.0 * (1 - meteorProgress));
      if (meteorProgress >= 1) {
        meteorActive = false;
        meteorMat.opacity = 0;
      }
    }
  };

  const destroy = () => {
    scene.remove(group);
    for (const item of disposables) {
      try {
        item.dispose();
      } catch {}
    }
  };

  return { update, destroy };
}
