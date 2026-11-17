import * as THREE from './vendor/three/three.module.min.js';

const canvas = document.getElementById('scene');
const fallback = document.getElementById('fallback');

const WEBGL_SUPPORTED = (function () {
    try {
        const probe = document.createElement('canvas');
        const gl = probe.getContext('webgl2') || probe.getContext('webgl') || probe.getContext('experimental-webgl');
        if (!gl) return false;
        const lose = gl.getExtension('WEBGL_lose_context');
        if (lose) lose.loseContext();
        return true;
    } catch (err) {
        return false;
    }
})();


let renderer;
try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'low-power' });
} catch (err) {
    if (fallback) {
        fallback.style.display = 'flex';
        fallback.innerHTML = WEBGL_SUPPORTED
            ? '轻量星空启动失败，正在尝试高清版…'
            : '当前浏览器没有可用的 WebGL，银河视角无法运行。';
    }
    try {
        if (window.parent && window.parent !== window) window.parent.__v2Ready = true;
    } catch (probeErr) {
        // 跨文档不可写时忽略
    }
    throw err;
}

const isMobile = window.matchMedia('(max-width: 768px)').matches;
const FIELD_COUNT = isMobile ? 1600 : 4200;
const MILKYWAY_COUNT = isMobile ? 4200 : 14000;
const NEBULA_COUNT = isMobile ? 6 : 10;

window.__demoReady = true;

const pixelRatio = () => Math.min(window.devicePixelRatio || 1, 1.5);
renderer.setPixelRatio(pixelRatio());
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.setClearColor(0x01020a, 1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
canvas.style.touchAction = 'none';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 3000);
camera.rotation.order = 'YXZ';

// 所有天体都放进 universe，相机在球心「仰望」夜空
const universe = new THREE.Group();
scene.add(universe);

/* ---------- 银道坐标系 ---------- */
// Y = 银极（银河带法线），X = 银心方向，Z = 补全右手系
const GAL_Y = new THREE.Vector3(0.34, 0.84, 0.42).normalize();
const GAL_X = new THREE.Vector3().crossVectors(GAL_Y, new THREE.Vector3(0, 0, 1)).normalize();
const GAL_Z = new THREE.Vector3().crossVectors(GAL_X, GAL_Y).normalize();

const galUniforms = {
    uX: { value: GAL_X },
    uY: { value: GAL_Y },
    uZ: { value: GAL_Z }
};

function galDir(l, b) {
    const cb = Math.cos(b);
    return new THREE.Vector3()
        .addScaledVector(GAL_X, cb * Math.cos(l))
        .addScaledVector(GAL_Y, Math.sin(b))
        .addScaledVector(GAL_Z, cb * Math.sin(l));
}

function gauss() {
    return Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(Math.PI * 2 * Math.random());
}

// 在银河带上采样：靠近银心更密、更厚（核球）
function sampleBand() {
    for (;;) {
        const l = (Math.random() * 2 - 1) * Math.PI;
        const c = Math.exp(-(l * l) / (2 * 0.9 * 0.9));
        if (Math.random() > 0.2 + 0.8 * c) continue;
        const b = gauss() * (0.09 + 0.2 * c);
        return galDir(l, b);
    }
}

function randomSphereDirection() {
    const u = Math.random() * 2 - 1;
    const theta = Math.random() * Math.PI * 2;
    const ring = Math.sqrt(1 - u * u);
    return new THREE.Vector3(ring * Math.cos(theta), u, ring * Math.sin(theta));
}

/* ---------- 共享 GLSL：噪声 + 暗尘带 ---------- */
const NOISE_GLSL = `
    uniform vec3 uX;
    uniform vec3 uY;
    uniform vec3 uZ;

    float hash(vec3 p) {
        p = fract(p * 0.3183099 + 0.1);
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }
    float noise(vec3 x) {
        vec3 i = floor(x);
        vec3 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
            mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
            mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
            f.z);
    }
    float fbm(vec3 p) {
        float a = 0.5;
        float s = 0.0;
        for (int i = 0; i < 3; i++) {
            s += a * noise(p);
            p = p * 2.03 + vec3(1.7, 9.2, 3.1);
            a *= 0.5;
        }
        return s;
    }
    vec3 toGal(vec3 d) {
        return vec3(dot(d, uX), dot(d, uY), dot(d, uZ));
    }
    // 带有扰动的银纬：让银河带边缘不再是笔直的
    float warpedLat(vec3 d) {
        float b = asin(clamp(toGal(d).y, -1.0, 1.0));
        return b + (fbm(d * 2.5) - 0.5) * 0.3;
    }
    // 暗尘带：沿银道面的不规则暗裂缝
    float dustAt(vec3 d) {
        float bw = warpedLat(d);
        float lane = exp(-pow((bw - 0.015) / 0.08, 2.0));
        float n = fbm(d * 7.0 + 3.1) * 0.7 + fbm(d * 21.0) * 0.3;
        return lane * smoothstep(0.44, 0.72, n);
    }
`;

/* ---------- 银河弥散光穹顶 ---------- */
const domeMaterial = new THREE.ShaderMaterial({
    uniforms: { ...galUniforms },
    vertexShader: `
        varying vec3 vDir;
        void main() {
            vDir = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec3 vDir;
        ${NOISE_GLSL}

        void main() {
            vec3 d = normalize(vDir);
            vec3 g = toGal(d);
            float l = atan(g.z, g.x);
            float b = asin(clamp(g.y, -1.0, 1.0));
            float bw = warpedLat(d);

            float cen = exp(-l * l / (2.0 * 0.6 * 0.6));        // 越靠近银心越大
            float width = mix(0.16, 0.34, cen);
            float band = exp(-bw * bw / (2.0 * width * width));
            float core = exp(-l * l / (2.0 * 0.3 * 0.3) - b * b / (2.0 * 0.2 * 0.2));

            float cloud = fbm(d * 8.0);
            float detail = fbm(d * 15.0);
            float lum = band * (0.3 + 0.9 * cen) + core * 1.1;
            lum *= 0.45 + 1.0 * cloud;
            lum *= 0.85 + 0.3 * detail;

            lum *= 1.0 - 0.88 * dustAt(d);                       // 暗尘遮挡

            vec3 warm = vec3(1.0, 0.76, 0.48);
            vec3 cool = vec3(0.52, 0.62, 1.0);
            vec3 col = mix(cool, warm, clamp(cen * 0.75 + core, 0.0, 1.0));
            // 外围零星粉紫色电离氢
            col += vec3(0.35, 0.08, 0.2) * smoothstep(0.62, 0.85, cloud) * band * (1.0 - cen);

            vec3 outc = col * lum * 0.5 + vec3(0.002, 0.004, 0.012);
            gl_FragColor = vec4(outc, 1.0);
        }
    `,
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false
});

const dome = new THREE.Mesh(new THREE.SphereGeometry(1000, 64, 48), domeMaterial);
dome.renderOrder = -10;
dome.frustumCulled = false;
universe.add(dome);

/* ---------- 星点材质：闪烁 + 大星十字光芒 + 暗尘遮挡 ---------- */
const starMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uPx: { value: pixelRatio() },
        ...galUniforms
    },
    vertexShader: `
        uniform float uTime;
        uniform float uPx;
        attribute vec3 aColor;
        attribute float aSize;
        attribute float aAlpha;
        attribute float aPhase;
        attribute float aBand;
        varying vec3 vColor;
        varying float vAlpha;
        varying float vSize;
        ${NOISE_GLSL}

        void main() {
            vColor = aColor;
            vSize = aSize;
            float twinkle = 0.78 + 0.22 * sin(uTime * (0.6 + aPhase) * 2.0 + aPhase * 6.2831);
            float dust = aBand > 0.5 ? dustAt(normalize(position)) : 0.0;
            vAlpha = aAlpha * twinkle * (1.0 - 0.85 * dust);

            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = min(aSize * uPx * (330.0 / max(1.0, -mvPosition.z)), 64.0);
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
            float glow = smoothstep(0.5, 0.0, d);
            glow = pow(glow, 1.7);

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

const tmpColor = new THREE.Color();

function starColor() {
    const roll = Math.random();
    let hue = 0.6, saturation = 0.16, lightness = 0.82;
    if (roll < 0.06) { hue = 0.08; saturation = 0.5; lightness = 0.86; }
    else if (roll < 0.13) { hue = 0.55; saturation = 0.62; lightness = 0.95; }
    else if (roll < 0.16) { hue = 0.015; saturation = 0.6; lightness = 0.8; }
    return tmpColor.setHSL(hue, saturation, lightness);
}

function buildStarLayer(count, sampler, isBand, radiusMin, radiusMax, sizeRange, alphaRange) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);
    const phases = new Float32Array(count);
    const bands = new Float32Array(count).fill(isBand ? 1 : 0);

    for (let i = 0; i < count; i++) {
        const dir = sampler();
        const radius = radiusMin + Math.random() * (radiusMax - radiusMin);
        positions[i * 3] = dir.x * radius;
        positions[i * 3 + 1] = dir.y * radius;
        positions[i * 3 + 2] = dir.z * radius;

        const c = starColor();
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;

        const brightness = Math.pow(Math.random(), 2.4);
        sizes[i] = sizeRange[0] + brightness * (sizeRange[1] - sizeRange[0]);
        alphas[i] = alphaRange[0] + Math.random() * (alphaRange[1] - alphaRange[0]);
        phases[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('aBand', new THREE.BufferAttribute(bands, 1));

    const points = new THREE.Points(geometry, starMaterial);
    points.frustumCulled = false;
    universe.add(points);
}

// 银河带内的大量细密暗星（带密度梯度，并被暗尘遮挡）
buildStarLayer(MILKYWAY_COUNT, sampleBand, true, 150, 300, [0.35, 1.5], [0.15, 0.45]);
// 全天均匀星场
buildStarLayer(FIELD_COUNT, randomSphereDirection, false, 170, 330, [0.6, 4.4], [0.2, 0.95]);

/* ---------- 星云 ---------- */
function makeCloudTexture(rgb) {
    const size = 256;
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.width = size;
    cloudCanvas.height = size;
    const ctx = cloudCanvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);

    for (let i = 0; i < 20; i++) {
        const x = size / 2 + (Math.random() - 0.5) * size * 0.55;
        const y = size / 2 + (Math.random() - 0.5) * size * 0.55;
        const radius = size * (0.06 + Math.random() * 0.2);
        const alpha = 0.05 + Math.random() * 0.16;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`);
        gradient.addColorStop(1, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(cloudCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

const nebulaPalettes = [
    [96, 118, 255],
    [180, 140, 255],
    [255, 152, 200],
    [104, 210, 220],
    [255, 206, 150]
];
const nebulaTextures = nebulaPalettes.map((rgb) => makeCloudTexture(rgb));

for (let i = 0; i < NEBULA_COUNT; i++) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: nebulaTextures[i % nebulaTextures.length],
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.1 + Math.random() * 0.14,
        rotation: Math.random() * Math.PI * 2
    }));
    sprite.position.copy(sampleBand().multiplyScalar(190 + Math.random() * 150));
    sprite.scale.setScalar(40 + Math.random() * 110);
    universe.add(sprite);
}

/* ---------- 流星：只在当前视野附近出现 ---------- */
const METEOR_TRAIL = 18;
const meteorPositions = new Float32Array(METEOR_TRAIL * 3);
const meteorGeometry = new THREE.BufferGeometry();
meteorGeometry.setAttribute('position', new THREE.BufferAttribute(meteorPositions, 3));

const meteorMaterial = new THREE.PointsMaterial({
    color: 0xdff0ff,
    size: 2.2,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

const meteor = new THREE.Points(meteorGeometry, meteorMaterial);
meteor.frustumCulled = false;
scene.add(meteor);

const meteorState = {
    active: false,
    life: 0,
    wait: 2.5 + Math.random() * 4,
    head: new THREE.Vector3(),
    direction: new THREE.Vector3(),
    speed: 0
};
const tmpForward = new THREE.Vector3();

function spawnMeteor() {
    camera.getWorldDirection(tmpForward);
    const jitter = randomSphereDirection().multiplyScalar(0.55);
    const start = tmpForward.clone().add(jitter).normalize().multiplyScalar(240);
    const tangent = new THREE.Vector3().crossVectors(start, randomSphereDirection()).normalize();

    meteorState.active = true;
    meteorState.life = 1.15;
    meteorState.head.copy(start);
    meteorState.direction.copy(tangent);
    meteorState.speed = 95 + Math.random() * 75;
}

function updateMeteor(dt) {
    if (!meteorState.active) {
        meteorState.wait -= dt;
        if (meteorState.wait <= 0) spawnMeteor();
        return;
    }

    meteorState.life -= dt;
    meteorState.head.addScaledVector(meteorState.direction, meteorState.speed * dt);

    for (let i = 0; i < METEOR_TRAIL; i++) {
        const k = i / (METEOR_TRAIL - 1);
        meteorPositions[i * 3] = meteorState.head.x - meteorState.direction.x * 34 * k;
        meteorPositions[i * 3 + 1] = meteorState.head.y - meteorState.direction.y * 34 * k;
        meteorPositions[i * 3 + 2] = meteorState.head.z - meteorState.direction.z * 34 * k;
    }

    meteorGeometry.attributes.position.needsUpdate = true;
    meteorMaterial.opacity = Math.max(0, meteorState.life / 1.15) * 0.9;

    if (meteorState.life <= 0) {
        meteorState.active = false;
        meteorMaterial.opacity = 0;
        meteorState.wait = 2.2 + Math.random() * 4.5;
    }
}

/* ---------- 相机：站在地面仰望，拖动环顾，滚轮改变视场角 ---------- */
// 初始朝向银心附近
let yaw = Math.atan2(-GAL_X.x, -GAL_X.z);
let pitch = Math.max(0.1, Math.min(1.2, Math.asin(GAL_X.y) + 0.25));
let targetYaw = yaw;
let targetPitch = pitch;
let fov = 70;
let targetFov = 70;

let dragging = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const k = 0.0045 * (fov / 70);   // 放大时转动更细腻
    targetYaw += (e.clientX - lastX) * k;
    targetPitch = Math.max(-1.45, Math.min(1.45, targetPitch + (e.clientY - lastY) * k));
    lastX = e.clientX;
    lastY = e.clientY;
});

window.addEventListener('pointerup', () => { dragging = false; });

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    targetFov = Math.max(28, Math.min(95, targetFov + e.deltaY * 0.03));
}, { passive: false });

const clock = new THREE.Clock();
let elapsed = 0;
let firstRender = true;

function animate() {
    requestAnimationFrame(animate);

    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt;

    if (!dragging) targetYaw += dt * 0.01;

    yaw += (targetYaw - yaw) * 0.08;
    pitch += (targetPitch - pitch) * 0.08;
    fov += (targetFov - fov) * 0.08;

    camera.rotation.set(pitch, -yaw, 0);
    if (Math.abs(camera.fov - fov) > 0.01) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
    }

    universe.rotation.y += dt * 0.004;
    starMaterial.uniforms.uTime.value = elapsed;

    updateMeteor(dt);
    renderer.render(scene, camera);

    if (firstRender) {
        firstRender = false;
        try {
            if (window.parent && window.parent !== window) window.parent.__v2Ready = true;
        } catch (err) {
            // 跨文档不可写时忽略
        }
    }
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(pixelRatio());
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    starMaterial.uniforms.uPx.value = pixelRatio();
});
