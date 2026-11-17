import * as THREE from './vendor/three/three.module.js';

const canvas = document.getElementById('scene');
const fallback = document.getElementById('fallback');
const hint = document.getElementById('scene-hint');
const title = document.getElementById('scene-title');
const replay = document.getElementById('replay');

const params = new URLSearchParams(window.location.search);
const name = (params.get('name') || '').trim().slice(0, 8) || '你';
if (title) title.textContent = name === '你' ? '生日快乐' : `祝 ${name} 生日快乐`;
if (replay) replay.addEventListener('click', () => location.reload());

let renderer;
try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (err) {
    fallback.style.display = 'flex';
    throw err;
}

const isMobile = window.matchMedia('(max-width: 768px)').matches;
window.__demoReady = true;

renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.setClearColor(0x01020a, 1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);

const sky = new THREE.Group();
const world = new THREE.Group();
scene.add(sky);
scene.add(world);

const BAND_NORMAL = new THREE.Vector3(0.34, 0.84, 0.42).normalize();
const tmpColor = new THREE.Color();

function randomSphereDirection() {
    const u = Math.random() * 2 - 1;
    const theta = Math.random() * Math.PI * 2;
    const ring = Math.sqrt(1 - u * u);
    return new THREE.Vector3(ring * Math.cos(theta), u, ring * Math.sin(theta));
}

function randomBandDirection(spread) {
    for (let i = 0; i < 40; i++) {
        const dir = randomSphereDirection();
        if (Math.abs(dir.dot(BAND_NORMAL)) < spread) return dir;
    }
    return new THREE.Vector3(0, 1, 0);
}

// ---------- 星空 ----------
const starUniforms = { uTime: { value: 0 } };

const starMaterial = new THREE.ShaderMaterial({
    uniforms: starUniforms,
    vertexShader: `
        uniform float uTime;
        attribute vec3 aColor;
        attribute float aSize;
        attribute float aAlpha;
        attribute float aPhase;
        varying vec3 vColor;
        varying float vAlpha;
        varying float vSize;

        void main() {
            vColor = aColor;
            vSize = aSize;
            float twinkle = 0.78 + 0.22 * sin(uTime * (0.6 + aPhase) * 2.0 + aPhase * 6.2831);
            vAlpha = aAlpha * twinkle;

            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * (330.0 / max(1.0, -mvPosition.z));
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        varying float vSize;

        void main() {
            vec2 uv = gl_PointCoord - vec2(0.5);
            float d = length(uv);
            float glow = pow(smoothstep(0.5, 0.0, d), 1.7);

            float spike = 0.0;
            if (vSize > 2.3) {
                float sx = smoothstep(0.055, 0.0, abs(uv.y)) * smoothstep(0.5, 0.04, abs(uv.x));
                float sy = smoothstep(0.055, 0.0, abs(uv.x)) * smoothstep(0.5, 0.04, abs(uv.y));
                spike = (sx + sy) * 0.4;
            }

            float alpha = vAlpha * (glow + spike);
            if (alpha <= 0.003) discard;
            gl_FragColor = vec4(vColor, alpha);
        }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

function addStarLayer(count, bandSpread, radiusMin, radiusMax, sizeMin, sizeMax, alphaMin, alphaMax) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        const dir = bandSpread > 0 ? randomBandDirection(bandSpread) : randomSphereDirection();
        const radius = radiusMin + Math.random() * (radiusMax - radiusMin);

        positions[i * 3] = dir.x * radius;
        positions[i * 3 + 1] = dir.y * radius;
        positions[i * 3 + 2] = dir.z * radius;

        const roll = Math.random();
        let hue = 0.6;
        let saturation = 0.16;
        let lightness = 0.82;

        if (roll < 0.06) {
            hue = 0.08;
            saturation = 0.5;
            lightness = 0.86;
        } else if (roll < 0.13) {
            hue = 0.55;
            saturation = 0.62;
            lightness = 0.95;
        } else if (roll < 0.16) {
            hue = 0.015;
            saturation = 0.6;
            lightness = 0.8;
        }

        tmpColor.setHSL(hue, saturation, lightness);
        colors[i * 3] = tmpColor.r;
        colors[i * 3 + 1] = tmpColor.g;
        colors[i * 3 + 2] = tmpColor.b;

        const brightness = Math.pow(Math.random(), 2.4);
        sizes[i] = sizeMin + brightness * (sizeMax - sizeMin);
        alphas[i] = alphaMin + Math.random() * (alphaMax - alphaMin);
        phases[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    const points = new THREE.Points(geometry, starMaterial);
    points.frustumCulled = false;
    sky.add(points);
}

addStarLayer(isMobile ? 800 : 2000, 0, 160, 320, 0.6, 4.2, 0.2, 0.9);
addStarLayer(isMobile ? 700 : 1800, 0.16, 150, 300, 0.5, 1.9, 0.18, 0.55);

// ---------- 蛋糕 ----------
const cake = new THREE.Group();
world.add(cake);

const cakeMaterials = new Set();

scene.add(new THREE.HemisphereLight(0xfff2d8, 0x1a1b33, 1.7));

const keyLight = new THREE.DirectionalLight(0xffe4bc, 3.2);
keyLight.position.set(16, 30, 20);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x6f8bff, 1.5);
rimLight.position.set(-20, 14, -18);
scene.add(rimLight);

const candleLight = new THREE.PointLight(0xffa53d, 65, 46, 2);
candleLight.position.set(0, 18.2, 0);
scene.add(candleLight);

const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(13.4, 12.2, 1, 64),
    new THREE.MeshStandardMaterial({ color: 0xd9def2, roughness: 0.34, metalness: 0.1 })
);
plate.position.y = 0.55;
cake.add(plate);

const layerSpecs = [
    { radius: 10, height: 4.2, y: 3.2, color: 0xffab40 },
    { radius: 8, height: 3.6, y: 7, color: 0xffd54f },
    { radius: 6, height: 3.2, y: 10.4, color: 0xfff0b3 }
];

layerSpecs.forEach((spec) => {
    const layer = new THREE.Mesh(
        new THREE.CylinderGeometry(spec.radius, spec.radius, spec.height, 48),
        new THREE.MeshStandardMaterial({ color: spec.color, roughness: 0.55, metalness: 0.04 })
    );
    layer.position.y = spec.y;
    cake.add(layer);
});

const icing = new THREE.Mesh(
    new THREE.CylinderGeometry(10.2, 10.2, 0.5, 48),
    new THREE.MeshStandardMaterial({ color: 0xfff6e8, roughness: 0.4 })
);
icing.position.y = 5.4;
cake.add(icing);

const berryMaterial = new THREE.MeshStandardMaterial({ color: 0xff3b4f, roughness: 0.32 });
for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const berry = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 12), berryMaterial);
    berry.position.set(Math.cos(angle) * 7.4, 5.9, Math.sin(angle) * 7.4);
    cake.add(berry);
}

const candle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 4.6, 20),
    new THREE.MeshStandardMaterial({ color: 0xd95050, roughness: 0.45 })
);
candle.position.y = 14.3;
cake.add(candle);

const wick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 0.7, 8),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
);
wick.position.y = 16.85;
cake.add(wick);

const flame = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xffc85a })
);
flame.scale.set(0.75, 1.7, 0.75);
flame.position.y = 18.2;
cake.add(flame);

function makeGlowTexture() {
    const size = 256;
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = size;
    glowCanvas.height = size;
    const ctx = glowCanvas.getContext('2d');

    const gradient = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255, 232, 168, 1)');
    gradient.addColorStop(0.35, 'rgba(255, 172, 64, 0.55)');
    gradient.addColorStop(1, 'rgba(255, 140, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(glowCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

const glowTexture = makeGlowTexture();

const flameGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture,
    color: 0xffb347,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0.9
}));
flameGlow.position.copy(flame.position);
flameGlow.scale.set(7, 7, 1);
cake.add(flameGlow);

cake.traverse((obj) => {
    if (obj.material) cakeMaterials.add(obj.material);
});
cakeMaterials.forEach((material) => {
    material.transparent = true;
});

// ---------- 3D 文字粒子 ----------
const textGroup = new THREE.Group();
textGroup.position.set(0, 12.5, 0);
textGroup.visible = false;
world.add(textGroup);

const TEXT_MAX = 3600;
const textPositions = new Float32Array(TEXT_MAX * 3);
const textTargets = new Float32Array(TEXT_MAX * 3);
const textColors = new Float32Array(TEXT_MAX * 3);
const textSizes = new Float32Array(TEXT_MAX);
const textAlphas = new Float32Array(TEXT_MAX);
const textDelays = new Float32Array(TEXT_MAX);
let textActive = 0;

const textGeometry = new THREE.BufferGeometry();
textGeometry.setAttribute('position', new THREE.BufferAttribute(textPositions, 3));
textGeometry.setAttribute('aColor', new THREE.BufferAttribute(textColors, 3));
textGeometry.setAttribute('aSize', new THREE.BufferAttribute(textSizes, 1));
textGeometry.setAttribute('aAlpha', new THREE.BufferAttribute(textAlphas, 1));
textGeometry.setAttribute('aDelay', new THREE.BufferAttribute(textDelays, 1));

const textMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uOpacity: { value: 0 },
        uReveal: { value: 0 }
    },
    vertexShader: `
        uniform float uOpacity;
        uniform float uReveal;
        attribute vec3 aColor;
        attribute float aSize;
        attribute float aAlpha;
        attribute float aDelay;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
            vColor = aColor;
            vAlpha = aAlpha * uOpacity * smoothstep(aDelay, aDelay + 0.18, uReveal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * (300.0 / max(1.0, -mvPosition.z));
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            float glow = pow(smoothstep(0.5, 0.0, d), 1.8);
            if (glow <= 0.004 || vAlpha <= 0.002) discard;
            gl_FragColor = vec4(vColor, vAlpha * glow);
        }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

const textPoints = new THREE.Points(textGeometry, textMaterial);
textPoints.frustumCulled = false;
textGroup.add(textPoints);

const sampleCanvas = document.createElement('canvas');
const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
const SAMPLE_WIDTH = 900;
const SAMPLE_HEIGHT = 300;
const TEXT_SCALE = 0.062;

const textGold = new THREE.Color('#ffd76b');
const textPink = new THREE.Color('#ff7fb0');

function buildText(text) {
    sampleCanvas.width = SAMPLE_WIDTH;
    sampleCanvas.height = SAMPLE_HEIGHT;
    sampleCtx.clearRect(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT);
    sampleCtx.fillStyle = '#ffffff';
    sampleCtx.textAlign = 'center';
    sampleCtx.textBaseline = 'middle';

    const fontFamily = `'Noto Serif SC', 'Microsoft YaHei', sans-serif`;
    let fontSize = 150;
    sampleCtx.font = `bold ${fontSize}px ${fontFamily}`;

    const measured = sampleCtx.measureText(text).width;
    if (measured > SAMPLE_WIDTH - 60) {
        fontSize = Math.max(40, Math.floor(fontSize * (SAMPLE_WIDTH - 60) / measured));
        sampleCtx.font = `bold ${fontSize}px ${fontFamily}`;
    }

    sampleCtx.fillText(text, SAMPLE_WIDTH / 2, SAMPLE_HEIGHT / 2);

    const data = sampleCtx.getImageData(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT).data;
    const points = [];
    const step = 6;

    for (let y = 0; y < SAMPLE_HEIGHT; y += step) {
        for (let x = 0; x < SAMPLE_WIDTH; x += step) {
            if (data[(y * SAMPLE_WIDTH + x) * 4 + 3] > 120) {
                points.push({
                    x: (x - SAMPLE_WIDTH / 2) * TEXT_SCALE,
                    y: -(y - SAMPLE_HEIGHT / 2) * TEXT_SCALE,
                    z: (Math.random() - 0.5) * 4
                });
            }
        }
    }

    textActive = Math.min(points.length, TEXT_MAX);
    const tempColor = new THREE.Color();

    for (let i = 0; i < TEXT_MAX; i++) {
        const i3 = i * 3;

        if (i < textActive) {
            const point = points[i];
            textTargets[i3] = point.x;
            textTargets[i3 + 1] = point.y;
            textTargets[i3 + 2] = point.z;

            const mix = THREE.MathUtils.clamp((point.y + 9) / 18, 0, 1);
            tempColor.copy(textGold).lerp(textPink, mix);
            textColors[i3] = tempColor.r;
            textColors[i3 + 1] = tempColor.g;
            textColors[i3 + 2] = tempColor.b;

            const angle = Math.random() * Math.PI * 2;
            const elevation = (Math.random() - 0.5) * Math.PI;
            const radius = 12 + Math.random() * 24;
            textPositions[i3] = point.x + Math.cos(angle) * Math.cos(elevation) * radius;
            textPositions[i3 + 1] = point.y + Math.sin(elevation) * radius * 0.75;
            textPositions[i3 + 2] = point.z + Math.sin(angle) * Math.cos(elevation) * radius;

            textDelays[i] = THREE.MathUtils.clamp((point.x + 28) / 56, 0, 1);
            textSizes[i] = 1.5 + Math.random() * 1.8;
            textAlphas[i] = 1;
        } else {
            textAlphas[i] = 0;
        }
    }

    textGeometry.attributes.position.needsUpdate = true;
    textGeometry.attributes.aColor.needsUpdate = true;
    textGeometry.attributes.aSize.needsUpdate = true;
    textGeometry.attributes.aAlpha.needsUpdate = true;
    textGeometry.attributes.aDelay.needsUpdate = true;
}

buildText('生日快乐');

// ---------- 烟花粒子 ----------
const BURST_MAX = isMobile ? 1800 : 3400;
const burstPositions = new Float32Array(BURST_MAX * 3);
const burstColors = new Float32Array(BURST_MAX * 3);
const burstSizes = new Float32Array(BURST_MAX);
const burstAlphas = new Float32Array(BURST_MAX);
const burstVelocities = new Float32Array(BURST_MAX * 3);
const burstLife = new Float32Array(BURST_MAX);
const burstLifeMax = new Float32Array(BURST_MAX);
let burstCursor = 0;

const burstGeometry = new THREE.BufferGeometry();
burstGeometry.setAttribute('position', new THREE.BufferAttribute(burstPositions, 3));
burstGeometry.setAttribute('aColor', new THREE.BufferAttribute(burstColors, 3));
burstGeometry.setAttribute('aSize', new THREE.BufferAttribute(burstSizes, 1));
burstGeometry.setAttribute('aAlpha', new THREE.BufferAttribute(burstAlphas, 1));

const burstMaterial = new THREE.ShaderMaterial({
    vertexShader: `
        attribute vec3 aColor;
        attribute float aSize;
        attribute float aAlpha;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
            vColor = aColor;
            vAlpha = aAlpha;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * (300.0 / max(1.0, -mvPosition.z));
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            float glow = pow(smoothstep(0.5, 0.0, d), 1.8);
            if (glow <= 0.004 || vAlpha <= 0.002) discard;
            gl_FragColor = vec4(vColor, vAlpha * glow);
        }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

const burstPoints = new THREE.Points(burstGeometry, burstMaterial);
burstPoints.frustumCulled = false;
world.add(burstPoints);

const burstColor = new THREE.Color();

function emitBurstParticles(x, y, z, hue, count, speedMin, speedMax, sizeScale) {
    for (let i = 0; i < count; i++) {
        const index = burstCursor;
        burstCursor = (burstCursor + 1) % BURST_MAX;
        const i3 = index * 3;

        const u = Math.random() * 2 - 1;
        const theta = Math.random() * Math.PI * 2;
        const ring = Math.sqrt(1 - u * u);
        const speed = speedMin + Math.random() * (speedMax - speedMin);

        burstPositions[i3] = x;
        burstPositions[i3 + 1] = y;
        burstPositions[i3 + 2] = z;

        burstVelocities[i3] = ring * Math.cos(theta) * speed;
        burstVelocities[i3 + 1] = u * speed + 4;
        burstVelocities[i3 + 2] = ring * Math.sin(theta) * speed;

        const particleHue = (((hue + Math.random() * 45 - 22) % 360) + 360) % 360 / 360;
        burstColor.setHSL(particleHue, 1, 0.62);
        burstColors[i3] = burstColor.r;
        burstColors[i3 + 1] = burstColor.g;
        burstColors[i3 + 2] = burstColor.b;

        burstSizes[index] = (1.4 + Math.random() * 2.4) * sizeScale;
        burstAlphas[index] = 1;
        burstLifeMax[index] = 70 + Math.random() * 55;
        burstLife[index] = burstLifeMax[index];
    }

    burstGeometry.attributes.position.needsUpdate = true;
    burstGeometry.attributes.aColor.needsUpdate = true;
    burstGeometry.attributes.aSize.needsUpdate = true;
}

// 爆炸中心闪光
const flashPool = [];
let flashCursor = 0;

for (let i = 0; i < 6; i++) {
    const flash = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }));
    flash.scale.setScalar(2);
    flash.userData.life = 0;
    world.add(flash);
    flashPool.push(flash);
}

function spawnFlash(x, y, z, hue) {
    const flash = flashPool[flashCursor];
    flashCursor = (flashCursor + 1) % flashPool.length;
    flash.position.set(x, y, z);
    flash.material.color.setHSL(hue / 360, 1, 0.75);
    flash.material.opacity = 0.8;
    flash.scale.setScalar(2.5);
    flash.userData.life = 0.42;
    flash.userData.maxLife = 0.42;
}

function spawnBurst(x, y, z, hue) {
    emitBurstParticles(x, y, z, hue, isMobile ? 150 : 260, 6, 21, 1);
    spawnFlash(x, y, z, hue);

    // 延迟一点炸开第二层余晖
    setTimeout(() => {
        emitBurstParticles(x, y, z, hue, isMobile ? 28 : 56, 1.5, 5.5, 0.7);
    }, 130);
}

// 金色飘落光点
const sparkleCount = isMobile ? 90 : 160;
const sparklePositions = new Float32Array(sparkleCount * 3);
const sparkleSpeeds = new Float32Array(sparkleCount);

for (let i = 0; i < sparkleCount; i++) {
    sparklePositions[i * 3] = (Math.random() - 0.5) * 48;
    sparklePositions[i * 3 + 1] = Math.random() * 32;
    sparklePositions[i * 3 + 2] = (Math.random() - 0.5) * 32;
    sparkleSpeeds[i] = 0.5 + Math.random() * 1.4;
}

const sparkleGeometry = new THREE.BufferGeometry();
sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));

const sparkleMaterial = new THREE.PointsMaterial({
    map: glowTexture,
    color: 0xffd48a,
    size: 1.1,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
sparkles.frustumCulled = false;
world.add(sparkles);

// ---------- 烟雾 ----------
const smokeSprites = [];

function spawnSmoke() {
    for (let i = 0; i < 10; i++) {
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: glowTexture,
            color: 0x9aa0b5,
            transparent: true,
            opacity: 0.24,
            depthWrite: false
        }));

        sprite.position.set(
            (Math.random() - 0.5) * 0.6,
            18.1 + Math.random() * 0.4,
            (Math.random() - 0.5) * 0.6
        );
        sprite.scale.setScalar(1.2 + Math.random() * 0.8);
        sprite.userData.life = 1.6 + Math.random() * 0.6;
        sprite.userData.maxLife = sprite.userData.life;
        sprite.userData.speed = 1.6 + Math.random() * 1.4;
        cake.add(sprite);
        smokeSprites.push(sprite);
    }
}

// ---------- 相机适配 ----------
let baseCameraZ = 0;
const CONTENT_RADIUS = 20;
const CONTENT_CENTER_Y = 9.5;

function fitCamera() {
    const verticalFov = camera.fov * Math.PI / 180;
    const distanceV = CONTENT_RADIUS / Math.tan(verticalFov / 2);
    const distanceH = CONTENT_RADIUS / (Math.tan(verticalFov / 2) * camera.aspect);
    const distance = Math.max(distanceV, distanceH) * 1.12;

    baseCameraZ = distance;
    camera.position.set(0, CONTENT_CENTER_Y + 2, distance);
    camera.lookAt(0, CONTENT_CENTER_Y, 0);

    const textScale = Math.min(1, Math.max(0.42, camera.aspect * 0.9));
    textGroup.scale.setScalar(textScale);
}

fitCamera();

const cameraCakePos = new THREE.Vector3();
const cameraGalaxyPos = new THREE.Vector3();
const cameraLookCake = new THREE.Vector3(0, CONTENT_CENTER_Y, 0);
const cameraLookGalaxy = new THREE.Vector3(0, 0, 0);
const cameraLookTarget = new THREE.Vector3();

// ---------- 交互 ----------
let stage = 0;
let blown = false;
let cakeFading = false;
let cakeFade = 0;
let textOpacity = 0;
let textReveal = 0;
let dragRotY = 0;
let dragging = false;
let moved = 0;
let lastX = 0;
let lastY = 0;
let nextFirework = 0;

const viewToggle = document.getElementById('view-toggle');
let viewMode = 'cake';
let cameraBlend = 0;
let targetCameraBlend = 0;
let galaxyTheta = 0.9;
let galaxyPhi = 1.2;
let galaxyRadius = 300;
let targetGalaxyTheta = galaxyTheta;
let targetGalaxyPhi = galaxyPhi;
let targetGalaxyRadius = galaxyRadius;

function blowOut() {
    if (stage !== 0) return;

    stage = 1;
    blown = true;

    flame.visible = false;
    flameGlow.visible = false;
    candleLight.intensity = 2;
    spawnSmoke();

    if (hint) hint.textContent = '蜡烛灭了，愿望正在升起…';

    setTimeout(() => {
        if (stage !== 1) return;
        stage = 2;
        cakeFading = true;
        textGroup.visible = true;
        textOpacity = 0.02;

        if (hint) hint.textContent = '点一下屏幕，还能继续放烟花';
        spawnBurst(0, 15, 0, 42);
        nextFirework = elapsed + 1.2;
    }, 900);
}

function handleTap() {
    if (viewMode === 'galaxy') return;

    if (stage === 0) {
        blowOut();
        return;
    }

    if (stage === 2) {
        spawnBurst(
            (Math.random() - 0.5) * 34,
            12 + Math.random() * 16,
            (Math.random() - 0.5) * 22,
            Math.random() * 360
        );
    }
}

canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    moved = 0;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    moved += Math.abs(dx) + Math.abs(dy);

    if (viewMode === 'galaxy') {
        targetGalaxyTheta -= dx * 0.0045;
        targetGalaxyPhi = Math.max(0.2, Math.min(Math.PI - 0.2, targetGalaxyPhi - dy * 0.0045));
    } else {
        dragRotY = Math.max(-0.35, Math.min(0.35, dragRotY + dx * 0.004));
    }
});

function openGalaxy() {
    location.href = `galaxy.html${location.search}`;
}

if (viewToggle) {

    viewToggle.addEventListener('click', () => {
        openGalaxy();
    });
    viewToggle.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openGalaxy();
        }
    });
}

canvas.addEventListener('wheel', (event) => {
    if (viewMode !== 'galaxy') return;
    event.preventDefault();
    targetGalaxyRadius = Math.max(140, Math.min(480, targetGalaxyRadius + event.deltaY * 0.25));
}, { passive: false });

window.addEventListener('pointerup', () => {
    if (dragging && moved < 8) handleTap();
    dragging = false;
});

// ---------- 动画 ----------
const clock = new THREE.Clock();
let elapsed = 0;

function animate() {
    requestAnimationFrame(animate);

    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt;

    starUniforms.uTime.value = elapsed;
    sky.rotation.y += dt * 0.004;

    if (!blown) {
        const flicker = Math.sin(elapsed * 9.5) * 0.5 + Math.sin(elapsed * 23) * 0.25;
        flame.scale.x = 0.75 + flicker * 0.05;
        flame.scale.y = 1.7 + flicker * 0.12;
        flameGlow.scale.setScalar(6.6 + flicker * 0.6);
        candleLight.intensity = 65 + flicker * 18;
        candleLight.position.x = Math.sin(elapsed * 7) * 0.14;
    }

    if (cakeFading) {
        cakeFade = Math.min(1, cakeFade + dt / 1.5);
        const opacity = 1 - cakeFade;
        cakeMaterials.forEach((material) => {
            material.opacity = opacity;
        });
        cake.position.y = -cakeFade * 5;
        cake.scale.setScalar(1 - cakeFade * 0.1);
        if (cakeFade >= 1) {
            cake.visible = false;
            cakeFading = false;
        }
    }

    if (stage >= 2) {
        textOpacity = Math.min(1, textOpacity + dt * 1.5);
        textReveal = Math.min(1.35, textReveal + dt * 1.1);
        textMaterial.uniforms.uOpacity.value = textOpacity;
        textMaterial.uniforms.uReveal.value = textReveal;

        for (let i = 0; i < textActive; i++) {
            const i3 = i * 3;
            const wobble = Math.sin(elapsed * 2 + i * 0.7) * 0.5;
            textPositions[i3] += (textTargets[i3] - textPositions[i3]) * 0.05;
            textPositions[i3 + 1] += (textTargets[i3 + 1] - textPositions[i3 + 1]) * 0.05 + wobble * dt;
            textPositions[i3 + 2] += (textTargets[i3 + 2] - textPositions[i3 + 2]) * 0.05;
        }
        textGeometry.attributes.position.needsUpdate = true;

        if (elapsed > nextFirework) {
            spawnBurst(
                (Math.random() - 0.5) * 34,
                13 + Math.random() * 15,
                (Math.random() - 0.5) * 22,
                Math.random() * 360
            );
            nextFirework = elapsed + 1.4 + Math.random() * 0.9;
        }
    }

    for (let i = 0; i < BURST_MAX; i++) {
        if (burstLife[i] <= 0) continue;
        const i3 = i * 3;

        burstLife[i] -= dt * 60;
        const ratio = Math.max(0, burstLife[i] / burstLifeMax[i]);

        burstVelocities[i3] *= 0.986;
        burstVelocities[i3 + 1] = burstVelocities[i3 + 1] * 0.986 - 7 * dt;
        burstVelocities[i3 + 2] *= 0.986;

        burstPositions[i3] += burstVelocities[i3] * dt;
        burstPositions[i3 + 1] += burstVelocities[i3 + 1] * dt;
        burstPositions[i3 + 2] += burstVelocities[i3 + 2] * dt;

        burstAlphas[i] = ratio * ratio;
    }

    burstGeometry.attributes.position.needsUpdate = true;
    burstGeometry.attributes.aAlpha.needsUpdate = true;

    for (let i = smokeSprites.length - 1; i >= 0; i--) {
        const sprite = smokeSprites[i];
        sprite.userData.life -= dt;

        const ratio = Math.max(0, sprite.userData.life / sprite.userData.maxLife);
        sprite.position.y += sprite.userData.speed * dt;
        sprite.position.x += Math.sin(elapsed * 2 + i) * 0.2 * dt;
        sprite.scale.multiplyScalar(1 + dt * 0.35);
        sprite.material.opacity = ratio * 0.24;

        if (sprite.userData.life <= 0) {
            cake.remove(sprite);
            sprite.material.dispose();
            smokeSprites.splice(i, 1);
        }
    }

    world.rotation.y = Math.sin(elapsed * 0.16) * 0.1 + dragRotY;

    // 文字跟随场景一起转（总角度约 26° 以内），只保留轻微上下漂浮
    textGroup.position.y = 12.5 + Math.sin(elapsed * 0.8) * 0.22;

    for (const flash of flashPool) {
        if (flash.userData.life <= 0) continue;
        flash.userData.life -= dt;
        const ratio = Math.max(0, flash.userData.life / flash.userData.maxLife);
        flash.material.opacity = ratio * 0.95;
        flash.scale.setScalar(2.5 + (1 - ratio) * 14);
    }

    for (let i = 0; i < sparkleCount; i++) {
        const i3 = i * 3;
        sparklePositions[i3 + 1] -= sparkleSpeeds[i] * dt;
        if (sparklePositions[i3 + 1] < -4) {
            sparklePositions[i3 + 1] = 28 + Math.random() * 8;
            sparklePositions[i3] = (Math.random() - 0.5) * 48;
            sparklePositions[i3 + 2] = (Math.random() - 0.5) * 32;
        }
    }
    sparkleGeometry.attributes.position.needsUpdate = true;

    cameraBlend += (targetCameraBlend - cameraBlend) * Math.min(1, dt * 2.6);
    galaxyTheta += (targetGalaxyTheta - galaxyTheta) * 0.08;
    galaxyPhi += (targetGalaxyPhi - galaxyPhi) * 0.08;
    galaxyRadius += (targetGalaxyRadius - galaxyRadius) * 0.08;

    cameraCakePos.set(0, CONTENT_CENTER_Y + 2, baseCameraZ * (1 - 0.06 * textOpacity));
    cameraGalaxyPos.setFromSphericalCoords(galaxyRadius, galaxyPhi, galaxyTheta);
    camera.position.lerpVectors(cameraCakePos, cameraGalaxyPos, cameraBlend);

    cameraLookTarget.lerpVectors(cameraLookCake, cameraLookGalaxy, cameraBlend);
    camera.lookAt(cameraLookTarget);

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    fitCamera();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
});