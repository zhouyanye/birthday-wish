// 设备能力与动效偏好检测
const isCoarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR = Math.min(window.devicePixelRatio || 1, 2);
const isWeChat = /MicroMessenger/i.test(navigator.userAgent);

// 百度统计事件埋点（统计脚本未加载时静默跳过）
function trackEvent(action, label) {
    if (window._hmt) {
        window._hmt.push(['_trackEvent', '生日祝福', action, label || '']);
    }
}

// canvas 高清屏适配：位图放大 DPR 倍，绘制坐标仍使用 CSS 像素
function sizeHiDPI(targetCanvas, width, height) {
    targetCanvas.width = Math.round(width * DPR);
    targetCanvas.height = Math.round(height * DPR);
    targetCanvas.getContext('2d').setTransform(DPR, 0, 0, DPR, 0, 0);
}

// 获取 URL 参数中的名字
const urlParams = new URLSearchParams(window.location.search);
const rawName = (urlParams.get('name') || '').trim();
const name = rawName ? rawName.slice(0, 12) : "你"; // 默认“你”，限制长度避免撑破排版

// 体验模式：经典 2D / 3D 沉浸，记住上次选择
let preferredMode = '2d';
try {
    preferredMode = localStorage.getItem('bday-mode') === '3d' ? '3d' : '2d';
} catch (err) {
    preferredMode = '2d';
}

const modeParam = urlParams.get('mode');
if (modeParam === '3d' || modeParam === '2d') {
    preferredMode = modeParam;
    try {
        localStorage.setItem('bday-mode', preferredMode);
    } catch (err) {
        // localStorage 不可用时忽略
    }
}

// 动态更新网页标题与称呼
if (name !== "你") {
    document.title = `祝 ${name} 生日快乐！`;
    const startSub = document.getElementById('start-sub');
    if (startSub) startSub.textContent = `送给 ${name} 的生日惊喜`;
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = `祝 ${name} 生日快乐！`;
}

// 祝福语数组 (打字机效果用)
const messages = [
    `祝 ${name} 生日快乐！`,
    "愿你眼里有光，心中有爱",
    "所求皆如愿，所行化坦途",
    "岁岁常欢愉，年年皆胜意",
    "万物可爱，人间值得",
    "愿你遍历山河，觉得人间值得",
    "生活明朗，万物可爱",
    "Happy Birthday!",
    "愿你拥有星辰大海",
    "平安喜乐，万事胜意",
    "愿生活温暖顺心",
    "保持热爱，奔赴山海",
    "愿你活成自己喜欢的样子",
    "愿世间美好与你环环相扣",
    "祝你今天愉快，明天的愉快留给明天祝福",
    "愿你精致到老，眼里长着太阳，笑里全是坦荡",
    "愿你三冬暖，愿你春不寒",
    "愿你天黑有灯，下雨有伞",
    "愿你一路上，有良人相伴",
    "深情不及久伴，厚爱无需多言",
    "愿时光能缓，愿故人不散",
    "愿你不仅有软肋，更有盔甲",
    "愿你一生努力，一生被爱",
    "想要的都拥有，得不到的都释怀",
    "愿你出走半生，归来仍是少年",
    "愿这世界继续热闹，愿你依旧是你",
    "祝你岁月无波澜，敬我余生不悲欢",
    "愿你眼中有星辰，身边有微风",
    "May you contain all the joy the world has to offer.",
    "Wish you a very happy birthday!",
    "May your day be as beautiful as you are.",
    "Stay happy and keep smiling.",
    "愿快乐拥抱你，在这属于你的特别的一天",
    "生日快乐，我的朋友！",
    // TFBOYS & 王源相关祝福语
    "像王源一样，勇敢追梦，闪闪发光！",
    "愿你像TFBOYS一样，青春永驻，梦想成真",
    "十年之约，我们都在——生日快乐！",
    "愿你如王源般温柔坚定，向阳而生",
    "源来是你，生日快乐！",
    "愿你像王源一样，用音乐点亮世界",
    "TFBOYS十年，愿你的青春也如此精彩",
    "像王源一样，做自己喜欢的事，爱自己想爱的人",
    "愿你拥有王源般的才华与温柔",
    "青春不散场，梦想正启航——生日快乐！",
    "愿你像TFBOYS一样，永远少年，永远热泪盈眶",
    "王源说：坚持自己喜欢的事，就是幸福",
    "愿你如源哥般，温柔且有力量",
    "TFBOYS陪伴的青春，是最美的时光",
    "愿你像王源一样，在舞台上闪闪发光",
    // 轻松一点的祝福
    "愿你今天的蛋糕，比烦恼甜",
    "蜡烛一吹，好事成堆",
    "新的一岁，继续可爱",
    "愿你有酒有肉，有梦有友",
    "今天不许不开心",
    "愿所有美好都如期而至",
    "愿你所到之处，遍地阳光",
    "又长大一岁，快乐不打折",
    "Eat cake first, worry later.",
    "Another year of being awesome."
];

// 额外弹幕/气球祝福语库 (短小精悍)
const extraMessages = [
    "暴富", "开心", "美丽", "帅气", "健康", "自由", "好运", "脱单",
    "发财", "瘦身", "升职", "加薪", "欧气", "锦鲤", "平安", "喜乐",
    "无忧", "无虑", "吃不胖", "睡得香", "有人爱", "有钱花",
    "Lucky", "Happy", "Rich", "Love", "Smile", "Dream",
    "财源滚滚", "心想事成", "万事如意", "大吉大利", "一帆风顺",
    "前程似锦", "美梦成真", "福星高照", "笑口常开", "青春永驻",
    "身体健康", "百无禁忌", "诸邪回避", "顺风顺水", "步步高升",
    "Nice!", "Cool!", "Wow!", "Yeah!", "O.M.G", "Best Wishes",
    "天天开心", "好运连连", "惊喜不断", "幸福美满", "前途无量",
    "暴美", "暴帅", "上岸", "秒睡", "不加班", "零烦恼",
    "身体倍儿棒", "被爱包围", "元气满满", "好运加倍", "未来可期",
    "Stay cute", "Good vibes", "Best year",
   
];

// 输入框轮换的示例愿望
const wishPlaceholders = [
    "暴富", "健康", "脱单", "考研上岸", "拿到心仪 offer",
    "一场说走就走的旅行", "变美变帅", "睡得香", "有人爱，有钱花",
    "家人平安", "心想事成", "做自己喜欢的事"
];
let wishPlaceholderTimer = null;
let lastPlaceholderIndex = -1;

function nextWishPlaceholder() {
    const input = document.getElementById('pre-wish-input');
    if (!input || input.value.trim()) return;
    let index = Math.floor(Math.random() * wishPlaceholders.length);
    if (index === lastPlaceholderIndex) index = (index + 1) % wishPlaceholders.length;
    lastPlaceholderIndex = index;
    input.placeholder = `比如：${wishPlaceholders[index]}`;
}

function startWishPlaceholder() {
    clearInterval(wishPlaceholderTimer);
    nextWishPlaceholder();
    wishPlaceholderTimer = setInterval(nextWishPlaceholder, 3000);
}

function stopWishPlaceholder() {
    clearInterval(wishPlaceholderTimer);
    wishPlaceholderTimer = null;
}

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

// 分享时随机使用的文案
const shareTextSamples = [
    '写下愿望、吹灭蜡烛、拆开礼物，收下属于你的惊喜。',
    '有一份特别的生日礼物在等你，点开看看吧。',
    '许个愿，吹灭蜡烛，然后拆开属于你的礼物。',
    '这份祝福有点特别，需要你亲手打开。'
];

const shareCopyToasts = [
    '链接已复制，发给 TA 吧',
    '复制好啦，就等 TA 点开',
    '链接在手，惊喜马上到',
    '已复制，记得附上一句生日快乐'
];

// 打字机效果
let messageIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typeSpeed = 100;
const deleteSpeed = 50;
const pauseTime = 2000;
const typingElement = document.getElementById('typing-text');
let typingTimer = null;

function typeWriter() {
    const currentMessage = messages[messageIndex];
    
    if (isDeleting) {
        typingElement.textContent = currentMessage.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingElement.textContent = currentMessage.substring(0, charIndex + 1);
        charIndex++;
    }

    let typeDelay = isDeleting ? deleteSpeed : typeSpeed;

    if (!isDeleting && charIndex === currentMessage.length) {
        typeDelay = pauseTime;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        messageIndex = (messageIndex + 1) % messages.length;
        typeDelay = 500;
    }

    typingTimer = setTimeout(typeWriter, typeDelay);
}

// 烟花效果
const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

sizeHiDPI(canvas, canvasWidth, canvasHeight);

window.addEventListener('resize', () => {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    sizeHiDPI(canvas, canvasWidth, canvasHeight);
});

function random(min, max) {
    return Math.random() * (max - min) + min;
}

class Firework {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = 3;
        this.angle = Math.atan2(targetY - y, targetX - x);
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.distanceToTarget = Math.sqrt(Math.pow(targetX - x, 2) + Math.pow(targetY - y, 2));
        this.distanceTraveled = 0;
        this.coordinates = [];
        this.coordinateCount = 3;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
    }

    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);

        this.x += this.vx;
        this.y += this.vy;
        this.distanceTraveled = Math.sqrt(Math.pow(this.x - this.coordinates[this.coordinates.length - 1][0], 2) + Math.pow(this.y - this.coordinates[this.coordinates.length - 1][1], 2)) + this.distanceTraveled;

        if (this.distanceTraveled >= this.distanceToTarget) {
            createExplosion(this.targetX, this.targetY);
            fireworks.splice(index, 1);
        }
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsl(${random(0, 360)}, 100%, 50%)`;
        ctx.stroke();
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.coordinates = [];
        this.coordinateCount = 5;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = random(0, Math.PI * 2);
        this.speed = random(1, 10);
        this.friction = 0.95;
        this.gravity = 1;
        this.hue = random(0, 360);
        this.brightness = random(50, 80);
        this.alpha = 1;
        this.decay = random(0.015, 0.03);
    }

    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        this.alpha -= this.decay;

        if (this.alpha <= this.decay) {
            particles.splice(index, 1);
        }
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
        ctx.stroke();
    }
}

let fireworks = [];
let particles = [];
let fireworkChance = 0.05; // 默认烟花生成概率
let fireworksRequestId; // 存储动画帧ID

function loop() {
    fireworksRequestId = requestAnimationFrame(loop);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.globalCompositeOperation = 'lighter';

    let i = fireworks.length;
    while (i--) {
        fireworks[i].draw();
        fireworks[i].update(i);
    }

    let j = particles.length;
    while (j--) {
        particles[j].draw();
        particles[j].update(j);
    }

    // 随机生成烟花
    if (Math.random() < fireworkChance) {
        // 针对移动端优化发射位置
        // 如果屏幕宽度小于768px（通常是手机），则让烟花炸点更高一些，避免被底部蛋糕遮挡
        const isMobile = canvasWidth < 768;
        const targetYMin = isMobile ? 0 : 0;
        const targetYMax = isMobile ? canvasHeight * 0.4 : canvasHeight / 2; // 手机端限制在屏幕上半部分炸开
        
        fireworks.push(new Firework(
            canvasWidth / 2, 
            canvasHeight, 
            random(0, canvasWidth), 
            random(targetYMin, targetYMax)
        ));
    }
}

function createExplosion(x, y) {
    const type = Math.random();
    // 移除普通烟花，增加高级烟花权重
    if (type < 0.4) {
        createHeartParticles(x, y);
    } else if (type < 0.7) {
        createRingParticles(x, y);
    } else {
        createCrossetteParticles(x, y); // 新增十字交叉烟花
    }
}

// 十字交叉烟花（Crossette）效果
function createCrossetteParticles(x, y) {
    const particleCount = 40;
    const hue = Math.random() * 360;
    
    for (let i = 0; i < particleCount; i++) {
        const p = new Particle(x, y);
        const angle = (Math.PI * 2 * i) / particleCount;
        p.angle = angle;
        p.speed = random(3, 5);
        p.hue = hue;
        p.friction = 0.96;
        p.decay = 0.01;
        // 增加拖尾长度
        p.coordinateCount = 8;
        
        // 分裂逻辑（简单的视觉模拟）
        if (i % 4 === 0) {
            p.brightness = 100; // 亮星
            p.size = 2; // 更大
        }
        
        particles.push(p);
    }
}

function createHeartParticles(x, y) {
    const particleCount = 80;
    const hue = Math.random() * 360;
    const scale = random(0.12, 0.2);
    
    for (let i = 0; i < particleCount; i++) {
        const t = (Math.PI * 2 * i) / particleCount;
        // 心形公式
        const dx = 16 * Math.pow(Math.sin(t), 3);
        const dy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        
        const p = new Particle(x, y);
        p.angle = Math.atan2(dy, dx);
        p.speed = Math.sqrt(dx*dx + dy*dy) * scale;
        p.hue = hue;
        p.friction = 0.94; 
        p.decay = 0.01 + Math.random() * 0.01;
        particles.push(p);
    }
}

function createRingParticles(x, y, hue) {
    const particleCount = 60;
    const ringHue = hue === undefined ? Math.random() * 360 : hue;
    const speed = random(3, 6);
    
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const p = new Particle(x, y);
        p.angle = angle;
        p.speed = speed;
        p.hue = ringHue;
        p.friction = 0.95;
        p.decay = 0.015;
        particles.push(p);
    }
}

// --- 增强流星与星空效果 ---
const starCanvas = document.getElementById('shooting-stars');
const starCtx = starCanvas.getContext('2d');
let starW = window.innerWidth;
let starH = window.innerHeight;
sizeHiDPI(starCanvas, starW, starH);

let shootingStars = [];
let staticStars = []; // 静态背景星星

// 静态星星类
class StaticStar {
    constructor() {
        this.x = Math.random() * starW;
        this.y = Math.random() * starH;
        this.size = Math.random() * 1.5;
        this.opacity = Math.random();
        this.flickerSpeed = 0.001 + Math.random() * 0.002;
        this.phase = Math.random() * Math.PI * 2;
    }

    draw() {
        // 每颗星用固定相位做正弦闪烁（周期 2~6 秒），避免每帧累加导致整体变亮/变暗
        this.opacity = 0.2 + (Math.sin(Date.now() * this.flickerSpeed + this.phase) + 1) * 0.4;

        starCtx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        starCtx.beginPath();
        starCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        starCtx.fill();
    }
}

// 初始化静态星星
// 增加星星数量，营造更密集的星空
for(let i=0; i<300; i++) {
    staticStars.push(new StaticStar());
}

class ShootingStar {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * starW;
        this.y = Math.random() * starH * 0.5;
        this.length = Math.random() * 80 + 50; // 更长
        this.speed = Math.random() * 15 + 10;   // 更快
        this.size = Math.random() * 2 + 1;      // 更大
        this.dirX = 1;
        this.dirY = 0.5; // 稍微平一点的角度
        this.opacity = 0;
        this.fade = 0.05; // 出现得更快
        this.active = false;
        
        // 增加出现的频率
        setTimeout(() => { this.active = true; }, Math.random() * 2000);
    }

    update() {
        if (!this.active) return;
        
        this.x += this.speed * this.dirX;
        this.y += this.speed * this.dirY;
        
        if (this.opacity < 1) {
            this.opacity += this.fade;
        }
        
        if (this.x > starW + this.length || this.y > starH + this.length) {
            this.active = false;
            this.reset();
        }
    }

    draw() {
        if (!this.active) return;
        
        // 增加发光效果
        starCtx.shadowBlur = 10;
        starCtx.shadowColor = "white";
        starCtx.strokeStyle = 'rgba(255, 255, 255, ' + this.opacity + ')';
        starCtx.lineWidth = this.size;
        starCtx.lineCap = 'round';
        starCtx.beginPath();
        starCtx.moveTo(this.x, this.y);
        starCtx.lineTo(this.x - this.length, this.y - this.length * 0.5);
        starCtx.stroke();
        starCtx.shadowBlur = 0;
    }
}

// 增加流星数量
for (let i = 0; i < 8; i++) {
    shootingStars.push(new ShootingStar());
}

let starsRequestId;

function animateStars() {
    starCtx.clearRect(0, 0, starW, starH);
    
    // 绘制静态星星
    staticStars.forEach(star => star.draw());

    // 绘制流星
    shootingStars.forEach(star => {
        star.update();
        star.draw();
    });
    starsRequestId = requestAnimationFrame(animateStars);
}

// 移除自动启动，改为在 setTheme 中控制
// animateStars();

window.addEventListener('resize', () => {
    starW = window.innerWidth;
    starH = window.innerHeight;
    sizeHiDPI(starCanvas, starW, starH);
});

// --- 气球效果 (白天模式) ---
const balloonCanvas = document.getElementById('balloons');
const balloonCtx = balloonCanvas.getContext('2d');
let balloonW = window.innerWidth;
let balloonH = window.innerHeight;
sizeHiDPI(balloonCanvas, balloonW, balloonH);

let balloons = [];
const balloonColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F43', '#54A0FF', '#5F27CD', 
    // TFBOYS主题色：王源-绿色(薄荷绿), 王俊凯-蓝色, 易烊千玺-红色
    '#98D8C8', '#5DADE2', '#E74C3C', '#58D68D', '#85C1E9', '#EC7063'];

class Balloon {
    constructor() {
        this.reset();
        // 初始随机位置分布在屏幕下方
        this.y = balloonH + Math.random() * 200; 
    }

    reset() {
        this.x = Math.random() * balloonW;
        this.y = balloonH + Math.random() * 100;
        this.speed = Math.random() * 2 + 1;
        this.size = Math.random() * 20 + 30; // 半径
        this.color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.05 + 0.02;
    }

    update() {
        this.y -= this.speed;
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 0.5;

        // 飘出顶部后重置
        if (this.y < -100) {
            this.reset();
        }
    }

    draw() {
        balloonCtx.fillStyle = this.color;
        balloonCtx.beginPath();
        // 气球主体 (椭圆)
        balloonCtx.ellipse(this.x, this.y, this.size * 0.8, this.size, 0, 0, Math.PI * 2);
        balloonCtx.fill();
        
        // 气球绳子
        balloonCtx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
        balloonCtx.lineWidth = 2;
        balloonCtx.beginPath();
        balloonCtx.moveTo(this.x, this.y + this.size);
        // 画一段贝塞尔曲线作为绳子
        balloonCtx.quadraticCurveTo(
            this.x + Math.sin(this.wobble * 2) * 10, 
            this.y + this.size + 30, 
            this.x, 
            this.y + this.size + 60
        );
        balloonCtx.stroke();
        
        // 高光
        balloonCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        balloonCtx.beginPath();
        balloonCtx.ellipse(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.15, this.size * 0.25, -0.5, 0, Math.PI * 2);
        balloonCtx.fill();
    }
}

// 初始化气球
for(let i = 0; i < 15; i++) {
    balloons.push(new Balloon());
}

let balloonsRequestId;

function animateBalloons() {
    balloonCtx.clearRect(0, 0, balloonW, balloonH);
    balloons.forEach(b => {
        b.update();
        b.draw();
    });
    balloonsRequestId = requestAnimationFrame(animateBalloons);
}

// 气球点击交互
balloonCanvas.addEventListener('click', (e) => {
    const rect = balloonCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    for (let i = 0; i < balloons.length; i++) {
        const b = balloons[i];
        // 简单的碰撞检测 (椭圆近似为圆)
        const dx = clickX - b.x;
        const dy = clickY - b.y;
        if (Math.sqrt(dx*dx + dy*dy) < b.size) {
            // 戳破气球
            popBalloon(b);
            // 重置该气球
            b.reset();
            b.y = balloonH + 100; // 让它从底部重新飘上来
            break; // 一次只戳破一个
        }
    }
});

function popBalloon(balloon) {
    // 创建爆炸效果文字
    const text = document.createElement('div');
    text.classList.add('pop-text');
    text.innerText = extraMessages[Math.floor(Math.random() * extraMessages.length)];
    text.style.left = balloon.x + 'px';
    text.style.top = balloon.y + 'px';
    text.style.color = balloon.color;
    document.body.appendChild(text);
    
    // 动画结束后移除
    setTimeout(() => {
        text.remove();
    }, 1000);
}

window.addEventListener('resize', () => {
    balloonW = window.innerWidth;
    balloonH = window.innerHeight;
    sizeHiDPI(balloonCanvas, balloonW, balloonH);
});


// --- 孔明灯效果 (黄昏模式) ---
const lanternCanvas = document.getElementById('lanterns');
const lanternCtx = lanternCanvas.getContext('2d');
let lanternW = window.innerWidth;
let lanternH = window.innerHeight;
sizeHiDPI(lanternCanvas, lanternW, lanternH);

let lanterns = [];

class Lantern {
    constructor() {
        this.reset();
        this.y = lanternH + Math.random() * 300; 
    }

    reset() {
        this.x = Math.random() * lanternW;
        this.y = lanternH + Math.random() * 100;
        this.speed = Math.random() * 0.5 + 0.2; // 飞得很慢
        this.size = Math.random() * 10 + 20; // 宽度
        this.height = this.size * 1.4;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.02 + 0.01;
        this.opacity = Math.random() * 0.5 + 0.5;
    }

    update() {
        this.y -= this.speed;
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 0.3;

        // 飘出顶部后重置
        if (this.y < -100) {
            this.reset();
        }
    }

    draw() {
        lanternCtx.globalAlpha = this.opacity;
        
        const w = this.size;
        const h = this.height;
        const x = this.x;
        const y = this.y;

        // --- 1. 绘制灯罩 (径向渐变模拟透光) ---
        // 调整渐变重心，使其更偏向下方的火源
        const gradient = lanternCtx.createRadialGradient(
            x, y + h * 0.6, 0, 
            x, y + h * 0.5, w * 0.8
        );
        gradient.addColorStop(0, '#FFF59D');   // 核心亮黄
        gradient.addColorStop(0.3, '#FFCC80'); // 中层暖橙
        gradient.addColorStop(0.8, '#FF7043'); // 外层红橙
        gradient.addColorStop(1, '#E64A19');   // 边缘深红
        
        lanternCtx.fillStyle = gradient;
        
        // --- 绘制更拟真的孔明灯形状 ---
        lanternCtx.beginPath();
        
        // 顶部：微微隆起的圆弧
        lanternCtx.moveTo(x - w * 0.35, y);
        lanternCtx.quadraticCurveTo(x, y - h * 0.1, x + w * 0.35, y);
        
        // 右侧：先向外鼓出，再向下收缩
        lanternCtx.bezierCurveTo(
            x + w * 0.6, y + h * 0.3, // 控制点1：向外鼓
            x + w * 0.5, y + h * 0.7, // 控制点2：保持宽度
            x + w * 0.25, y + h       // 终点：底部收口
        );
        
        // 底部：连接线
        lanternCtx.lineTo(x - w * 0.25, y + h);
        
        // 左侧：对称曲线
        lanternCtx.bezierCurveTo(
            x - w * 0.5, y + h * 0.7, 
            x - w * 0.6, y + h * 0.3, 
            x - w * 0.35, y
        );
        
        lanternCtx.fill();
        
        // --- 2. 结构线细节 ---
        lanternCtx.lineWidth = 1;
        lanternCtx.strokeStyle = 'rgba(100, 30, 20, 0.15)';
        
        // 纵向骨架线 (模拟纸灯笼的折痕)
        lanternCtx.beginPath();
        lanternCtx.moveTo(x, y - h * 0.05);
        lanternCtx.quadraticCurveTo(x + w * 0.1, y + h * 0.5, x, y + h);
        lanternCtx.stroke();
        
        // 底部燃烧圈 (深色金属环)
        lanternCtx.beginPath();
        lanternCtx.ellipse(x, y + h, w * 0.25, w * 0.08, 0, 0, Math.PI * 2);
        lanternCtx.fillStyle = 'rgba(62, 39, 35, 0.8)';
        lanternCtx.fill();
        
        // --- 3. 摇曳的火光 (动态光晕) ---
        const flicker = Math.sin(Date.now() / 150) * 0.15 + 1; 
        
        // 核心火苗
        lanternCtx.fillStyle = `rgba(255, 235, 59, ${0.8})`;
        lanternCtx.beginPath();
        lanternCtx.arc(x, y + h * 0.9, w * 0.1, 0, Math.PI * 2);
        lanternCtx.fill();
        
        // 外围光晕
        lanternCtx.fillStyle = `rgba(255, 167, 38, ${0.3 * flicker})`;
        lanternCtx.beginPath();
        lanternCtx.arc(x, y + h * 0.8, w * 0.4 * flicker, 0, Math.PI * 2);
        lanternCtx.fill();

        lanternCtx.globalAlpha = 1.0;
    }
}

// 初始化孔明灯
for(let i = 0; i < 20; i++) {
    lanterns.push(new Lantern());
}

let lanternsRequestId;

function animateLanterns() {
    lanternCtx.clearRect(0, 0, lanternW, lanternH);
    lanterns.forEach(l => {
        l.update();
        l.draw();
    });
    lanternsRequestId = requestAnimationFrame(animateLanterns);
}

window.addEventListener('resize', () => {
    lanternW = window.innerWidth;
    lanternH = window.innerHeight;
    sizeHiDPI(lanternCanvas, lanternW, lanternH);
});


// --- 动画管理与主题切换 ---

function stopAllAnimations() {
    if (fireworksRequestId) cancelAnimationFrame(fireworksRequestId);
    if (starsRequestId) cancelAnimationFrame(starsRequestId);
    if (balloonsRequestId) cancelAnimationFrame(balloonsRequestId);
    if (lanternsRequestId) cancelAnimationFrame(lanternsRequestId);
    
    // 清除画布残留
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    starCtx.clearRect(0, 0, starW, starH);
    balloonCtx.clearRect(0, 0, balloonW, balloonH);
    lanternCtx.clearRect(0, 0, lanternW, lanternH);
}

function setTheme(mode) {
    stopAllAnimations();
    
    // 移除所有模式类
    document.body.classList.remove('day-mode', 'sunset-mode');
    
    if (mode === 'day') {
        document.body.classList.add('day-mode');
        animateBalloons();
    } else if (mode === 'sunset') {
        document.body.classList.add('sunset-mode');
        animateLanterns();
    } else {
        // Night mode (default)
        mode = 'night';
        animateStars();
        loop(); 
    }
}

// 自动检测时间
function checkTimeAndSetTheme() {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 17) {
        setTheme('day');
    } else if (hour >= 17 && hour < 19) {
        setTheme('sunset');
    } else {
        setTheme('night');
    }
}

// 暴露给全局以便 HTML 按钮调用
window.setTheme = setTheme;

// --- 魔法光绘功能 ---
// 允许用户在屏幕上绘制会发光的线条，一段时间后自动消失
let isDrawing = false;
let lastDrawX = 0;
let lastDrawY = 0;
let drawHue = 0;

document.addEventListener('mousedown', (e) => {
    // 排除交互元素，避免冲突；触屏设备与「减少动态效果」用户跳过光绘
    if (isCoarsePointer || reduceMotion) return;
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.id === 'gift-box') return;
    isDrawing = true;
    lastDrawX = e.clientX;
    lastDrawY = e.clientY;
});

document.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    
    // 创建光绘粒子
    createLightStroke(e.clientX, e.clientY);
    lastDrawX = e.clientX;
    lastDrawY = e.clientY;
});

document.addEventListener('mouseup', () => {
    isDrawing = false;
});

// 触摸屏支持
document.addEventListener('touchstart', (e) => {
    if (reduceMotion) return;
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.id === 'gift-box') return;
    isDrawing = true;
    lastDrawX = e.touches[0].clientX;
    lastDrawY = e.touches[0].clientY;
});

document.addEventListener('touchmove', (e) => {
    if (!isDrawing) return;
    createLightStroke(e.touches[0].clientX, e.touches[0].clientY);
    lastDrawX = e.touches[0].clientX;
    lastDrawY = e.touches[0].clientY;
});

document.addEventListener('touchend', () => {
    isDrawing = false;
});

document.addEventListener('touchcancel', () => {
    isDrawing = false;
});

let strokeCount = 0;
const MAX_STROKES = 60;

function createLightStroke(x, y) {
    if (strokeCount >= MAX_STROKES) return;
    strokeCount++;

    const particle = document.createElement('div');
    particle.classList.add('light-stroke');
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.background = `hsl(${drawHue}, 100%, 70%)`;
    particle.style.boxShadow = `0 0 10px hsl(${drawHue}, 100%, 50%)`;
    
    document.body.appendChild(particle);
    
    // 颜色渐变
    drawHue = (drawHue + 5) % 360;
    
    // 2秒后消失
    setTimeout(() => {
        particle.style.opacity = 0;
        particle.style.transform = 'scale(0)';
        setTimeout(() => {
            particle.remove();
            strokeCount--;
        }, 500);
    }, 1500);
}

// --- 增强夜晚互动：点击发射烟花 ---
function enableInteractiveFireworks() {
    const canvas = document.getElementById('fireworks');
    canvas.addEventListener('click', (e) => {
        if (document.body.classList.contains('day-mode') || document.body.classList.contains('sunset-mode')) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 发射一枚烟花到点击位置
        fireworks.push(new Firework(canvasWidth / 2, canvasHeight, x, y));
    });
}

// 初始化交互
enableInteractiveFireworks();


// --- 弹幕功能 ---
let lastDanmakuTime = 0;
let danmakuTimer = null;
const danmakuLanes = [10, 20, 30, 40, 50, 60]; // 预定义轨道（百分比）

function startDanmaku() {
    if (danmakuTimer) return;

    const container = document.getElementById('danmaku-container');
    
    danmakuTimer = setInterval(() => {
        const now = Date.now();
        if (now - lastDanmakuTime < 800) return; // 最小间隔控制

        // 随机选择一个轨道
        const laneIndex = Math.floor(Math.random() * danmakuLanes.length);
        const top = danmakuLanes[laneIndex];
        
        // 简单的防重叠：如果该轨道最近刚生成过，则跳过本次生成（或尝试另一个轨道，这里简化处理）
        // 实际更复杂的防重叠需要记录每个轨道的最后生成时间，这里通过降低频率和固定轨道来缓解

        const item = document.createElement('div');
        item.classList.add('danmaku-item');
        item.innerText = extraMessages[Math.floor(Math.random() * extraMessages.length)];
        
        // 使用固定轨道
        item.style.top = top + '%'; 
        item.style.fontSize = random(1.2, 2.0) + 'rem'; // 字体大小差异减小，看起来更整齐
        item.style.color = `hsl(${random(0, 360)}, 100%, 85%)`; // 提高亮度
        item.style.animationDuration = random(8, 12) + 's'; // 速度放慢一点
        
        container.appendChild(item);
        lastDanmakuTime = now;
        
        // 动画结束后移除元素
        item.addEventListener('animationend', () => {
            item.remove();
        });
    }, 1000); // 基础间隔增加到1秒
}

// --- 狂欢模式 ---
function startCelebration() {
    // 隐藏打字机文字
    document.getElementById('typing-text').style.display = 'none';
    clearTimeout(typingTimer);

    // 蛋糕此时应该已经淡出，再兜底一次
    hideCake(0);
    restoreBgmVolume();
    
    // 增加烟花频率
    fireworkChance = 0.2;
    
    // 启动弹幕
    startDanmaku();

    // 显示结束后的操作：保存卡片 / 再看一次
    const endingControls = document.getElementById('ending-controls');
    if (endingControls) endingControls.classList.remove('hidden');

    // 统计：完整走完流程
    trackEvent('flow-complete', name);

    // 夜晚模式下提示还能放烟花
    if (!document.body.classList.contains('day-mode') && !document.body.classList.contains('sunset-mode')) {
        setTimeout(() => showToast('点一下屏幕，还能放烟花'), 3200);
    }
}

// --- 状态管理 ---
const AppState = {
    IDLE: 0,           // 初始状态
    WISHING: 1,        // 正在许愿
    READY_TO_BLOW: 2,  // 许愿完成，等待吹气
    BLOWING: 3,        // 正在吹气/检测到吹气
    CANDLE_OUT: 4,     // 蜡烛已灭
    GIFT_READY: 5,     // 礼物可拆
    CELEBRATING: 6     // 狂欢模式
};

let currentState = AppState.IDLE;

// --- 吹蜡烛功能 ---
let audioContext;
let analyser;
let microphone;
let audioDataArray = null;

// 麦克风检测参数
const MIC_INTERVAL = 90;
const MIC_CALIBRATION_MS = 1200;
const MIC_MIN_THRESHOLD = 52;
const MIC_HOLD_FRAMES = 4;

let micStatus = 'idle'; // idle | calibrating | ready | failed
let micThreshold = 70;
let micBaselineSum = 0;
let micBaselineCount = 0;
let micCalibrationStart = 0;
let micLoudFrames = 0;
let micTimer = null;

const blowTip = document.getElementById('blow-tip');
const DEFAULT_BLOW_TIP = blowTip ? blowTip.innerHTML : '';

function updateMicBar(average) {
    const levelBar = document.getElementById('mic-level');
    if (!levelBar) return;
    const reference = Math.max(60, micThreshold);
    const percent = Math.min(100, (average / reference) * 100);
    levelBar.style.width = percent + '%';
    levelBar.style.background = average > micThreshold ? '#FF5252' : '#4CAF50';
}

// 吹气阶段压低 BGM，避免外放时音乐被麦克风拾取，造成“蜡烛自己灭了”
function lowerBgmVolume() {
    const audio = document.getElementById('bgm');
    if (!audio || audio.paused) return;
    clearInterval(audioFadeTimer);
    audioFadeTimer = null;
    if (audio.dataset.preMicVolume === undefined) {
        audio.dataset.preMicVolume = String(audio.volume);
    }
    audio.volume = Math.min(audio.volume, 0.22);
}

function restoreBgmVolume() {
    const audio = document.getElementById('bgm');
    if (!audio || audio.dataset.preMicVolume === undefined) return;
    clearInterval(audioFadeTimer);
    audioFadeTimer = null;
    audio.volume = Number(audio.dataset.preMicVolume);
    delete audio.dataset.preMicVolume;
}

// 初始化音频
async function initAudio() {
    if (micStatus === 'calibrating' || micStatus === 'ready') return;

    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        // 关闭噪声抑制：它容易把持续的吹气声当成噪声消掉
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: false,
                autoGainControl: false
            }
        });

        // 用户可能已经手动吹灭或跳过了这一步，直接释放麦克风
        if (currentState !== AppState.READY_TO_BLOW) {
            stream.getTracks().forEach(track => track.stop());
            if (audioContext && audioContext.state !== 'closed') audioContext.close();
            micStatus = 'idle';
            return;
        }

        microphone = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.4;
        audioDataArray = new Uint8Array(analyser.frequencyBinCount);
        microphone.connect(analyser);

        // 先采样约 1.2 秒环境音（包含正在播放的 BGM），自适应出吹气阈值
        micStatus = 'calibrating';
        micBaselineSum = 0;
        micBaselineCount = 0;
        micLoudFrames = 0;
        micCalibrationStart = performance.now();
        if (blowTip) blowTip.innerHTML = '正在适应环境音量，请稍等…';

        document.getElementById('mic-visualizer').style.display = 'block';
        lowerBgmVolume();
        trackEvent('mic', 'granted');
        startMicLoop();

    } catch (err) {
        console.warn('无法获取麦克风权限或设备不支持，启用备用方案', err);
        micStatus = 'failed';
        const viz = document.getElementById('mic-visualizer');
        if (viz) viz.style.display = 'none';
        document.getElementById('manual-blow-btn').classList.remove('hidden');
        if (blowTip) blowTip.innerHTML = '麦克风暂时用不了，点下面的按钮吹灭蜡烛';
        trackEvent('mic', 'denied');
    }
}

function startMicLoop() {
    clearTimeout(micTimer);
    monitorAudio();
}

// 固定间隔采样：比逐帧分析省电，检测也更稳定
function monitorAudio() {
    clearTimeout(micTimer);

    if (!analyser || micStatus === 'failed') return;

    if (currentState !== AppState.READY_TO_BLOW) {
        if (currentState >= AppState.BLOWING) return;
        micTimer = setTimeout(monitorAudio, 250);
        return;
    }

    analyser.getByteFrequencyData(audioDataArray);

    let sum = 0;
    for (let i = 0; i < audioDataArray.length; i++) {
        sum += audioDataArray[i];
    }
    const average = sum / audioDataArray.length;

    updateMicBar(average);

    if (micStatus === 'calibrating') {
        micBaselineSum += average;
        micBaselineCount++;

        if (performance.now() - micCalibrationStart >= MIC_CALIBRATION_MS && micBaselineCount >= 5) {
            const baseline = micBaselineSum / micBaselineCount;
            // 阈值 = 环境基线 * 2.4，并限制区间，兼顾灵敏度和抗误触
            micThreshold = Math.min(165, Math.max(MIC_MIN_THRESHOLD, baseline * 2.4));
            micStatus = 'ready';
            if (blowTip) blowTip.innerHTML = DEFAULT_BLOW_TIP;
        }
    } else if (micStatus === 'ready') {
        if (average > micThreshold) {
            micLoudFrames++;
        } else {
            micLoudFrames = 0;
        }

        // 连续 4 次超阈值（约 300ms）才判定为吹气，避免咳嗽、鼓点误触发
        if (micLoudFrames >= MIC_HOLD_FRAMES) {
            blowOutCandle('mic');
            return;
        }
    }

    micTimer = setTimeout(monitorAudio, MIC_INTERVAL);
}

// 蛋糕在吹灭后短暂停留再淡出，避免一直占着画面
let cakeHideTimer = null;
function hideCake(delay = 0) {
    const cake = document.querySelector('.cake-container');
    if (!cake) return;
    clearTimeout(cakeHideTimer);
    cakeHideTimer = setTimeout(() => {
        cake.classList.add('fade-out');
        cakeHideTimer = setTimeout(() => cake.classList.add('hidden'), 1300);
    }, delay);
}

// 吹灭蜡烛
function blowOutCandle(source = 'mic') {
    if (currentState !== AppState.READY_TO_BLOW) return;
    currentState = AppState.BLOWING;

    trackEvent('blow-candle', source);
    restoreBgmVolume();
    clearTimeout(micTimer);
    micTimer = null;

    document.getElementById('blow-hint').classList.add('hidden');

    const candle = document.querySelector('.candle');
    const flame = document.getElementById('flame');
    const smoke = document.getElementById('smoke');

    flame.classList.add('out');
    smoke.style.opacity = 1;
    smoke.classList.add('puff');

    // 1.2 秒后拔出蜡烛
    setTimeout(() => {
        candle.classList.add('removed');
        currentState = AppState.CANDLE_OUT;
    }, 1200);

    // 0.9 秒后放出愿望彩蛋，让蜡烛动画先走
    setTimeout(() => {
        checkEasterEgg(window.currentWish || '');
    }, 900);

    // 2 秒后弹出许愿卡片
    setTimeout(() => {
        const feedback = document.getElementById('egg-feedback');
        const eggLabel = EGG_LABELS[window.currentEggType];
        if (feedback) {
            feedback.textContent = eggLabel
                ? `已触发「${eggLabel}」· 点击礼物盒查收惊喜`
                : '点击礼物盒查收惊喜';
        }

        document.getElementById('modal-step-1').classList.remove('hidden');
        document.getElementById('modal-step-2').classList.add('hidden');
        document.getElementById('wish-modal').classList.remove('hidden');
        currentState = AppState.GIFT_READY;
    }, 2000);

    // 蛋糕再停留一会儿就淡出，把舞台留给烟花
    hideCake(2600);
}

// --- 彩蛋触发词功能 ---
function showFloatingText(text) {
    const el = document.createElement('div');
    el.className = 'pop-text';
    el.textContent = text;
    el.style.left = '50%';
    el.style.top = '42%';
    el.style.color = '#ffd700';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

const EGG_LABELS = {
    love: '爱心烟花',
    money: '金币雨',
    tfboys: '应援色烟花',
    health: '平安喜乐',
    study: '金榜题名',
    travel: '去看世界',
    text: '专属文字烟花'
};

function getWishEggType(wish) {
    const text = (wish || '').toLowerCase();
    if (/爱|喜欢|love/.test(text)) return 'love';
    if (/富|钱|财|发财|暴富/.test(text)) return 'money';
    if (/王源|tfboys|源哥|小汤圆/.test(text)) return 'tfboys';
    if (/健康|平安|身体|喜乐|万事如意/.test(text)) return 'health';
    if (/考研|上岸|考试|学习|学业|offer|升职|加薪|工作|毕业|录取/.test(text)) return 'study';
    if (/旅行|远方|世界|山河|出发|自由/.test(text)) return 'travel';
    return 'text';
}

function checkEasterEgg(wish) {
    const type = getWishEggType(wish);
    window.currentEggType = type;

    // 白天/黄昏模式看不到烟花画布，改用彩带 + 祝福气泡
    const isNightMode = !document.body.classList.contains('day-mode') && !document.body.classList.contains('sunset-mode');
    if (!isNightMode) {
        window.confettiCannon.burst(window.innerWidth / 2, window.innerHeight * 0.62, 140);
        showFloatingText((wish || '生日快乐').slice(0, 6));
        return type;
    }

    switch (type) {
        case 'love':
            triggerLoveExplosion();
            break;
        case 'money':
            triggerMoneyRain();
            break;
        case 'tfboys':
            triggerTFBOYSEffect();
            break;
        case 'health':
            triggerHealthGlow();
            break;
        case 'study':
            triggerStudyRise();
            break;
        case 'travel':
            triggerTravelStars();
            break;
        default:
            setTimeout(() => {
                createTextFirework((wish || '生日快乐').substring(0, 4), window.innerWidth / 2, window.innerHeight * 0.3);
            }, 600);
    }

    return type;
}

// TFBOYS/王源专属特效
function triggerTFBOYSEffect() {
    // 发射TFBOYS主题色烟花（绿、蓝、红）
    const tfboysColors = [
        { h: 150, name: '王源绿' },      // 绿色 - 王源
        { h: 200, name: '俊凯蓝' },      // 蓝色 - 王俊凯
        { h: 0, name: '千玺红' }         // 红色 - 易烊千玺
    ];
    
    let count = 0;
    const interval = setInterval(() => {
        const color = tfboysColors[count % 3];
        // 在不同位置发射对应颜色的烟花
        const x = window.innerWidth * (0.2 + (count % 3) * 0.3);
        const y = window.innerHeight * 0.3;
        
        // 创建特殊颜色的粒子爆炸
        for (let i = 0; i < 60; i++) {
            const p = new Particle(x, y);
            p.angle = (Math.PI * 2 * i) / 60;
            p.speed = random(3, 6);
            p.hue = color.h;
            p.friction = 0.95;
            p.decay = 0.015;
            particles.push(p);
        }
        
        count++;
        if (count > 8) clearInterval(interval);
    }, 400);
    
    // 同时撒下四叶草形状的彩带（四叶草是TFBOYS粉丝的象征）
    setTimeout(() => {
        window.confettiCannon.colors = ['#98D8C8', '#5DADE2', '#E74C3C', '#58D68D', '#85C1E9', '#EC7063'];
        window.confettiCannon.burst(window.innerWidth / 2, window.innerHeight / 2, 400);
    }, 500);
}

function triggerLoveExplosion() {
    // 连续发射心形烟花
    let count = 0;
    const interval = setInterval(() => {
        createHeartParticles(window.innerWidth / 2, window.innerHeight * 0.7);
        count++;
        if (count > 5) clearInterval(interval);
    }, 300);
}

function triggerMoneyRain() {
    // 撒金币/元宝特效 (复用彩带系统，但替换颜色为金色)
    window.confettiCannon.colors = ['#FFD700', '#FFA500', '#DAA520'];
    window.confettiCannon.burst(window.innerWidth / 2, window.innerHeight / 2, 300);
    // 恢复默认颜色
    setTimeout(() => {
        window.confettiCannon.colors = [
            '#ff5e57', '#0be881', '#ffc048', '#575fcf', '#ef5777', '#F8EFBA', 
            '#d63031', '#0984e3', '#6c5ce7', '#00b894', '#e17055', '#fdcb6e'
        ];
    }, 2000);
}

// 平安喜乐：绿色治愈光环
function triggerHealthGlow() {
    let count = 0;
    const interval = setInterval(() => {
        createRingParticles(window.innerWidth / 2, window.innerHeight * 0.56, 145);
        count++;
        if (count > 4) clearInterval(interval);
    }, 320);
}

// 金榜题名：金色粒子向上飞升
function triggerStudyRise() {
    const centerX = window.innerWidth / 2;
    let count = 0;
    const interval = setInterval(() => {
        for (let i = 0; i < 36; i++) {
            const p = new Particle(centerX + random(-70, 70), window.innerHeight * 0.82);
            p.angle = -Math.PI / 2 + random(-0.55, 0.55);
            p.speed = random(4, 9);
            p.hue = random(40, 55);
            p.friction = 0.99;
            p.gravity = -0.03;
            p.decay = 0.011;
            p.brightness = 65;
            particles.push(p);
        }
        count++;
        if (count > 5) clearInterval(interval);
    }, 300);
}

// 去看世界：流星 + 蓝色彩带
function triggerTravelStars() {
    shootingStars.forEach((star, index) => {
        if (index < 6) {
            star.x = random(0, starW * 0.7);
            star.y = random(0, starH * 0.35);
            star.opacity = 1;
            star.active = true;
        }
    });

    window.confettiCannon.colors = ['#5DADE2', '#85C1E9', '#FFD700', '#ffffff'];
    window.confettiCannon.burst(window.innerWidth / 2, window.innerHeight * 0.35, 120);
    setTimeout(() => {
        window.confettiCannon.colors = [
            '#ff5e57', '#0be881', '#ffc048', '#575fcf', '#ef5777', '#F8EFBA',
            '#d63031', '#0984e3', '#6c5ce7', '#00b894', '#e17055', '#fdcb6e'
        ];
    }, 2000);
}

// --- 文字烟花功能 ---
// 将用户许下的愿望转化为烟花文字
class TextParticle extends Particle {
    constructor(x, y, color) {
        super(x, y);
        this.color = color;
        this.size = 2;
        this.friction = 0.92; // 阻力更大，保持文字形状更久
        this.gravity = 0.5;
        this.decay = 0.015;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`;
        ctx.fill();
    }
}

// 在屏幕上创建文字烟花
function createTextFirework(text, x, y) {
    // 创建离屏 Canvas 来绘制文字并获取像素
    const offCanvas = document.createElement('canvas');
    const offCtx = offCanvas.getContext('2d');
    offCanvas.width = 400;
    offCanvas.height = 100;
    
    offCtx.font = "bold 60px 'Ma Shan Zheng'";
    offCtx.fillStyle = '#ffffff';
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText(text, offCanvas.width / 2, offCanvas.height / 2);
    
    const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
    const data = imgData.data;
    
    // 遍历像素点生成粒子
    const step = 4; // 采样步长，越小粒子越密
    
    for(let h = 0; h < offCanvas.height; h += step) {
        for(let w = 0; w < offCanvas.width; w += step) {
            const index = (h * offCanvas.width + w) * 4;
            if(data[index + 3] > 128) { // 如果该点有像素（非透明）
                // 计算在主画布上的位置 (居中于爆炸点)
                const targetX = x + (w - offCanvas.width / 2);
                const targetY = y + (h - offCanvas.height / 2);
                
                // 随机颜色
                const color = {
                    r: 255,
                    g: Math.floor(Math.random() * 200 + 55),
                    b: Math.floor(Math.random() * 100)
                };
                
                const p = new TextParticle(targetX, targetY, color);
                // 赋予一点点初始随机速度，让文字有点“炸开”的感觉，但不要散太快
                p.vx = (Math.random() - 0.5) * 2;
                p.vy = (Math.random() - 0.5) * 2;
                particles.push(p);
            }
        }
    }
}

// 鼠标拖尾特效
let lastTrailTime = 0;
let trailCount = 0;
const MAX_TRAILS = 50;

document.addEventListener('mousemove', (e) => {
    // 触屏设备与「减少动态效果」用户不生成拖尾
    if (isCoarsePointer || reduceMotion) return;

    const now = performance.now();
    // 时间节流 + 数量上限，避免高频 mousemove 生成过多 DOM
    if (now - lastTrailTime < 40 || trailCount >= MAX_TRAILS || Math.random() > 0.5) return;
    lastTrailTime = now;
    trailCount++;

    const particle = document.createElement('div');
    particle.classList.add('cursor-particle');
    particle.style.left = e.clientX + 'px';
    particle.style.top = e.clientY + 'px';
    
    // 随机颜色
    const colors = ['#ffd700', '#ff9a9e', '#a1c4fd', '#ffffff'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
        particle.remove();
        trailCount--;
    }, 1000);
});

// 许愿弹窗交互逻辑
function openGift() {
    // 只有在礼物准备好（蜡烛吹灭且弹窗弹出）后才能点击
    if (currentState !== AppState.GIFT_READY) return;

    trackEvent('gift-open', name);

    // 切换到第二步：展示惊喜
    document.getElementById('modal-step-1').classList.add('hidden');
    document.getElementById('modal-step-2').classList.remove('hidden');
    
    // 触发彩带礼炮
    const rect = document.getElementById('gift-box').getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    window.confettiCannon.burst(centerX, centerY, 200); 
    
    currentState = AppState.CELEBRATING;
    
    // 3秒后自动关闭弹窗并开启狂欢模式
    setTimeout(() => {
        const modal = document.getElementById('wish-modal');
        modal.style.opacity = 0; // 淡出效果
        setTimeout(() => {
            modal.classList.add('hidden');
            startCelebration(); // 开启狂欢
        }, 1000);
    }, 3000);
}

const giftBox = document.getElementById('gift-box');
giftBox.addEventListener('click', openGift);
giftBox.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openGift();
    }
});

// 3D 悬浮视差特效
const modal = document.querySelector('.modal-content');
document.addEventListener('mousemove', (e) => {
    // 只有当弹窗显示时才生效；触屏与「减少动态效果」用户跳过
    if (isCoarsePointer || reduceMotion) return;
    if (document.getElementById('wish-modal').classList.contains('hidden')) return;

    const rect = modal.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // 计算鼠标距离中心的偏移量
    const percentX = (e.clientX - centerX) / (window.innerWidth / 2);
    const percentY = (e.clientY - centerY) / (window.innerHeight / 2);
    
    // 最大旋转角度
    const maxRotate = 10;
    
    // X轴移动控制Y轴旋转，Y轴移动控制X轴旋转（注意正负）
    const rotateX = -percentY * maxRotate;
    const rotateY = percentX * maxRotate;
    
    modal.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});

// 鼠标离开时复位
document.addEventListener('mouseleave', () => {
    modal.style.transform = `perspective(1000px) rotateX(0) rotateY(0)`;
});

// 手动吹灭按钮
document.getElementById('manual-blow-btn').addEventListener('click', () => {
    blowOutCandle('manual');
});

// 模式切换按钮
const modeButtons = document.querySelectorAll('.mode-btn');

function applyModeUI() {
    modeButtons.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.mode === preferredMode);
    });
}

modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        preferredMode = btn.dataset.mode === '3d' ? '3d' : '2d';
        try {
            localStorage.setItem('bday-mode', preferredMode);
        } catch (err) {
            // localStorage 不可用时忽略
        }
        applyModeUI();

        if (preferredMode === '3d') {
            showToast('3D 模式会加载约 2MB 资源，建议在 Wi-Fi 下体验');
        }
    });
});

applyModeUI();

// 启动逻辑
document.getElementById('start-btn').addEventListener('click', () => {
    // 3D 沉浸模式：进入独立的 3D 场景页
    if (preferredMode === '3d') {
        const query = name !== '你' ? `?name=${encodeURIComponent(name)}` : '';
        location.href = `3d.html${query}`;
        return;
    }

    currentState = AppState.WISHING; // 进入许愿状态
    document.getElementById('start-screen').classList.add('fade-away');
    trackEvent('start', name);
    
    // 播放音乐（渐入，避免一开场声音太大）
    const audio = document.getElementById('bgm');
    audio.volume = 0;
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            document.getElementById('music-control').classList.remove('hidden');
            document.getElementById('music-control').classList.remove('paused');
            fadeInAudio(audio, 0.65, 2500);
        }).catch(error => {
            console.log("Audio play failed (browser restriction): ", error);
            audio.volume = 0.65;
            document.getElementById('music-control').classList.remove('hidden');
            document.getElementById('music-control').classList.add('paused');
            
            // 添加一次性点击事件来启动音乐
            const startMusicOnClick = () => {
                audio.play();
                document.getElementById('music-control').classList.remove('paused');
                document.removeEventListener('click', startMusicOnClick);
            };
            document.addEventListener('click', startMusicOnClick);
        });
    }

    // 检查时间设置主题
    checkTimeAndSetTheme();

    setTimeout(() => {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('main-content').classList.remove('hidden');
        document.getElementById('time-control').classList.remove('hidden');
        document.getElementById('share-control').classList.remove('hidden');
        
        // 关键修复：确保许愿框一定会显示
        const wishPanel = document.getElementById('wish-input-panel');
        if (wishPanel) {
            wishPanel.classList.remove('hidden');
            // 确保输入框可以聚焦
            document.getElementById('pre-wish-input').focus();
        }
        
        document.getElementById('blow-hint').classList.add('hidden');

        // 注意：动画循环已在 checkTimeAndSetTheme 中启动，这里不再重复调用 loop()
        typeWriter();
        startWishPlaceholder();

        // 首次进入的轻提示，只出现一次
        try {
            if (!localStorage.getItem('bday-tip-shown-v1')) {
                setTimeout(() => {
                    // 用户已经开始许愿/吹蜡烛时就不再打扰
                    if (currentState === AppState.WISHING) {
                        showToast('右上角能切换白天/星夜，也能把这份祝福分享给 TA');
                    }
                    localStorage.setItem('bday-tip-shown-v1', '1');
                }, 2800);
            }
        } catch (err) {
            // localStorage 不可用时跳过
        }
    }, 1000);
});

// 新增逻辑：确认愿望后，才显示吹蜡烛提示
document.getElementById('confirm-wish-btn').addEventListener('click', () => {
    if (currentState !== AppState.WISHING) return;
    
    // 关键修改：在这里请求麦克风权限，因为这是明确的用户点击行为
    // 浏览器通常只允许在用户交互（click/touch）的回调中启动 AudioContext
    initAudio();

    const input = document.getElementById('pre-wish-input');
    const rawWish = input.value.trim();
    const wish = rawWish || "万事胜意";

    stopWishPlaceholder();
    input.blur();

    if (!rawWish) {
        showToast('没写也没关系，先替你许个「万事胜意」');
    }

    trackEvent('wish-submit', rawWish ? 'custom' : 'default');
    
    // 保存愿望供后续使用
    window.currentWish = wish;
    
    // 更新弹窗中的愿望显示
    document.getElementById('wish-display').innerText = wish;
    
    // 隐藏许愿框，显示吹蜡烛提示
    document.getElementById('wish-input-panel').classList.add('hidden');
    document.getElementById('blow-hint').classList.remove('hidden');
    
    currentState = AppState.READY_TO_BLOW; // 进入准备吹气状态

    // 彩蛋改到蜡烛吹灭后触发，和烟花、弹窗反馈一起出现
});

// 输入框里按回车也能提交愿望
document.getElementById('pre-wish-input').addEventListener('keydown', (e) => {
    if (e.isComposing || e.keyCode === 229) return;
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('confirm-wish-btn').click();
    }
});

// 音乐控制逻辑
const musicControl = document.getElementById('music-control');

function toggleMusic() {
    const audio = document.getElementById('bgm');
    if (audio.paused) {
        audio.play();
        musicControl.classList.remove('paused');
    } else {
        audio.pause();
        musicControl.classList.add('paused');
    }
}

musicControl.addEventListener('click', toggleMusic);
musicControl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMusic();
    }
});

// --- 分享与复制链接 ---
let toastTimer = null;

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

let audioFadeTimer = null;

function fadeInAudio(audio, targetVolume, duration) {
    clearInterval(audioFadeTimer);
    const stepTime = 50;
    const step = targetVolume / (duration / stepTime);
    audioFadeTimer = setInterval(() => {
        if (audio.paused) {
            clearInterval(audioFadeTimer);
            audioFadeTimer = null;
            return;
        }
        audio.volume = Math.min(targetVolume, audio.volume + step);
        if (audio.volume >= targetVolume) {
            clearInterval(audioFadeTimer);
            audioFadeTimer = null;
        }
    }, stepTime);
}

function buildShareUrl() {
    const url = new URL(window.location.href);
    url.hash = '';
    url.searchParams.delete('mode');
    // GitHub Pages 子路径部署：统一成以 / 结尾的目录地址，分享出去更干净
    url.pathname = url.pathname.replace(/index\.html$/, '');
    if (!url.pathname.endsWith('/')) url.pathname += '/';
    if (name !== '你') {
        url.searchParams.set('name', name);
    } else {
        url.searchParams.delete('name');
    }
    return url.toString();
}

async function copyText(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch (err) {
        // 继续走兜底方案
    }

    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.top = '-1000px';
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, text.length);
        const ok = document.execCommand('copy');
        textarea.remove();
        return ok;
    } catch (err) {
        return false;
    }
}

async function sharePage() {
    const url = buildShareUrl();
    const shareData = {
        title: name !== '你' ? `祝 ${name} 生日快乐！` : '生日快乐！有一份特别的礼物',
        text: pickRandom(shareTextSamples),
        url: url
    };

    trackEvent('share');

    if (navigator.share && !isWeChat) {
        try {
            await navigator.share(shareData);
            return;
        } catch (err) {
            if (err && err.name === 'AbortError') return;
            // 分享面板不可用时退回复制链接
        }
    }

    const copied = await copyText(url);
    if (copied && isWeChat) {
        showToast('链接已复制，也可以点右上角「···」直接发送');
    } else {
        showToast(copied ? pickRandom(shareCopyToasts) : '复制失败，请长按地址栏复制');
    }
}

const shareControl = document.getElementById('share-control');
if (shareControl) {
    shareControl.addEventListener('click', sharePage);
    shareControl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            sharePage();
        }
    });
}

// --- 祝福卡片生成 ---
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fill();
}

function drawCardCake(ctx, cx, topY) {
    ctx.save();

    // 盘子
    ctx.fillStyle = 'rgba(225, 230, 250, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx, topY + 250, 230, 32, 0, 0, Math.PI * 2);
    ctx.fill();

    // 三层蛋糕
    const layers = [
        { width: 190, y: topY + 150, height: 66, color: '#ffb74d' },
        { width: 150, y: topY + 96, height: 60, color: '#ffd54f' },
        { width: 108, y: topY + 48, height: 54, color: '#fff3b0' }
    ];
    layers.forEach((layer) => {
        ctx.fillStyle = layer.color;
        drawRoundedRect(ctx, cx - layer.width / 2, layer.y, layer.width, layer.height, 16);
    });

    // 蜡烛
    ctx.fillStyle = '#e07b39';
    ctx.fillRect(cx - 8, topY - 22, 16, 72);

    // 火焰
    const flame = ctx.createRadialGradient(cx, topY - 36, 2, cx, topY - 36, 34);
    flame.addColorStop(0, '#fff9c4');
    flame.addColorStop(0.45, '#ffc107');
    flame.addColorStop(1, 'rgba(255, 120, 0, 0)');
    ctx.fillStyle = flame;
    ctx.beginPath();
    ctx.ellipse(cx, topY - 36, 26, 42, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    const chars = Array.from(text);
    const lines = [];
    let line = '';

    for (const ch of chars) {
        const next = line + ch;
        if (line && ctx.measureText(next).width > maxWidth) {
            lines.push(line);
            line = ch;
            if (lines.length >= maxLines) break;
        } else {
            line = next;
        }
    }
    if (lines.length < maxLines && line) lines.push(line);

    lines.forEach((content, index) => ctx.fillText(content, x, y + index * lineHeight));
}

async function createWishCardCanvas() {
    if (document.fonts && document.fonts.load) {
        try {
            // 字体加载最多等 800ms，避免网络不通时卡片一直生成不出来
            const fontLoading = Promise.all([
                document.fonts.load("bold 145px 'Ma Shan Zheng'"),
                document.fonts.load("500 46px 'Noto Serif SC'")
            ]).catch(() => {});
            await Promise.race([
                fontLoading,
                new Promise((resolve) => setTimeout(resolve, 800))
            ]);
        } catch (err) {
            // 字体加载失败时自动回退系统字体
        }
    }

    const width = 1080;
    const height = 1440;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const background = ctx.createLinearGradient(0, 0, 0, height);
    background.addColorStop(0, '#05060f');
    background.addColorStop(0.55, '#10122b');
    background.addColorStop(1, '#1b1833');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(width / 2, height * 0.26, 30, width / 2, height * 0.26, width * 0.8);
    glow.addColorStop(0, 'rgba(255, 200, 90, 0.18)');
    glow.addColorStop(1, 'rgba(255, 200, 90, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 180; i++) {
        ctx.globalAlpha = 0.15 + Math.random() * 0.55;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2 + 0.6, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#ffd86b';
    ctx.font = "500 30px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.fillText('H A P P Y   B I R T H D A Y', width / 2, 118);

    ctx.save();
    ctx.shadowColor = 'rgba(255, 200, 80, 0.55)';
    ctx.shadowBlur = 28;
    ctx.fillStyle = '#ffd86b';
    ctx.font = "bold 145px 'Ma Shan Zheng', 'STKaiti', 'KaiTi', serif";
    ctx.fillText('生日快乐', width / 2, 296);
    ctx.restore();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.font = "500 52px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.fillText(name !== '你' ? `祝 ${name}` : '祝 你', width / 2, 430);

    ctx.strokeStyle = 'rgba(255, 216, 107, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 170, 500);
    ctx.lineTo(width / 2 + 170, 500);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = "500 46px 'Noto Serif SC', 'Microsoft YaHei', serif";
    const wishText = window.currentWish ? `愿望：${window.currentWish}` : '愿你所愿，皆能实现';
    wrapCanvasText(ctx, wishText, width / 2, 588, width - 220, 66, 2);

    drawCardCake(ctx, width / 2, 800);

    const now = new Date();
    const dateText = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.font = "400 34px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.fillText(dateText, width / 2, 1220);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
    ctx.font = "400 28px 'Noto Serif SC', 'Microsoft YaHei', serif";
    ctx.fillText('zhouyanye.github.io/birthday-wish', width / 2, 1282);

    return canvas;
}

function hideCardPreview() {
    const preview = document.getElementById('card-preview');
    if (preview) preview.classList.add('hidden');
}

async function openWishCard() {
    const preview = document.getElementById('card-preview');
    const image = document.getElementById('card-image');
    const download = document.getElementById('card-download');
    const hint = document.getElementById('card-hint');
    if (!preview || !image) return;

    const canvas = await createWishCardCanvas();
    const dataUrl = canvas.toDataURL('image/png');
    image.src = dataUrl;

    if (download) {
        const safeName = (name === '你' ? '你' : name).replace(/[\\/:*?"<>|]/g, '_');
        download.href = dataUrl;
        download.download = `生日祝福-${safeName}.png`;
        download.style.display = (isCoarsePointer || isWeChat) ? 'none' : '';
    }

    if (hint) {
        hint.textContent = (isCoarsePointer || isWeChat)
            ? '长按图片保存，或直接发给 TA'
            : '点「下载图片」保存，也可以直接发送给 TA';
    }

    preview.classList.remove('hidden');
}

const saveCardBtn = document.getElementById('save-card-btn');
if (saveCardBtn) saveCardBtn.addEventListener('click', openWishCard);

const replayBtn = document.getElementById('replay-btn');
if (replayBtn) {
    replayBtn.addEventListener('click', () => location.reload());
}

const cardPreviewEl = document.getElementById('card-preview');
if (cardPreviewEl) {
    cardPreviewEl.addEventListener('click', (e) => {
        if (e.target === cardPreviewEl) hideCardPreview();
    });
}

const cardCloseBtn = document.getElementById('card-close');
if (cardCloseBtn) cardCloseBtn.addEventListener('click', hideCardPreview);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideCardPreview();
});

// --- 桌面快捷键：M 音乐 / S 分享 / 1·2·3 切主题 ---
document.addEventListener('keydown', (e) => {
    if (e.isComposing || currentState === AppState.IDLE) return;
    // 不要抢占 Ctrl+S / Cmd+S 这类浏览器快捷键
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;

    const previewHidden = document.getElementById('card-preview').classList.contains('hidden');
    if (!previewHidden) return;

    if (e.key === 'm' || e.key === 'M') {
        if (!musicControl.classList.contains('hidden')) {
            e.preventDefault();
            toggleMusic();
        }
    } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        sharePage();
    } else if (e.key === '1') {
        setTheme('day');
    } else if (e.key === '2') {
        setTheme('sunset');
    } else if (e.key === '3') {
        setTheme('night');
    }
});

// --- 切到后台时暂停音乐，回来再继续 ---
document.addEventListener('visibilitychange', () => {
    const audio = document.getElementById('bgm');
    if (!audio) return;

    if (document.hidden) {
        if (!audio.paused) {
            audio.dataset.autoPaused = '1';
            audio.pause();
        }
    } else if (audio.dataset.autoPaused === '1') {
        delete audio.dataset.autoPaused;
        audio.play().catch(() => {
            musicControl.classList.add('paused');
        });
    }
});
