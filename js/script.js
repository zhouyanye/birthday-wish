// 获取 URL 参数中的名字
const urlParams = new URLSearchParams(window.location.search);
const name = urlParams.get('name') || "你"; // 默认为“你”

// 动态更新网页标题
if (name !== "你") {
    document.title = `祝 ${name} 生日快乐！`;
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
    "生日快乐，我的朋友！"
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
    "天天开心", "好运连连", "惊喜不断", "幸福美满", "前途无量"
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

canvas.width = canvasWidth;
canvas.height = canvasHeight;

window.addEventListener('resize', () => {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
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

function createStandardParticles(x, y) {
    // 此函数保留作为备用，或被高级效果替代
    // ...
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

function createRingParticles(x, y) {
    const particleCount = 60;
    const hue = Math.random() * 360;
    const speed = random(3, 6);
    
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const p = new Particle(x, y);
        p.angle = angle;
        p.speed = speed;
        p.hue = hue;
        p.friction = 0.95;
        p.decay = 0.015;
        particles.push(p);
    }
}

// --- 增强流星与星空效果 ---
const starCanvas = document.getElementById('shooting-stars');
const starCtx = starCanvas.getContext('2d');
starCanvas.width = window.innerWidth;
starCanvas.height = window.innerHeight;

let shootingStars = [];
let staticStars = []; // 静态背景星星

// 静态星星类
class StaticStar {
    constructor() {
        this.x = Math.random() * starCanvas.width;
        this.y = Math.random() * starCanvas.height;
        this.size = Math.random() * 1.5;
        this.opacity = Math.random();
        this.flickerSpeed = 0.02 + Math.random() * 0.05;
    }

    draw() {
        this.opacity += Math.sin(Date.now() * this.flickerSpeed) * 0.01;
        // 限制透明度范围
        if (this.opacity > 1) this.opacity = 1;
        if (this.opacity < 0.2) this.opacity = 0.2;

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
        this.x = Math.random() * starCanvas.width;
        this.y = Math.random() * starCanvas.height * 0.5;
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
        
        if (this.x > starCanvas.width + this.length || this.y > starCanvas.height + this.length) {
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
    starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    
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
    starCanvas.width = window.innerWidth;
    starCanvas.height = window.innerHeight;
});

// --- 气球效果 (白天模式) ---
const balloonCanvas = document.getElementById('balloons');
const balloonCtx = balloonCanvas.getContext('2d');
balloonCanvas.width = window.innerWidth;
balloonCanvas.height = window.innerHeight;

let balloons = [];
const balloonColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F43', '#54A0FF', '#5F27CD'];

class Balloon {
    constructor() {
        this.reset();
        // 初始随机位置分布在屏幕下方
        this.y = window.innerHeight + Math.random() * 200; 
    }

    reset() {
        this.x = Math.random() * balloonCanvas.width;
        this.y = balloonCanvas.height + Math.random() * 100;
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
    balloonCtx.clearRect(0, 0, balloonCanvas.width, balloonCanvas.height);
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
            b.y = window.innerHeight + 100; // 让它从底部重新飘上来
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
    balloonCanvas.width = window.innerWidth;
    balloonCanvas.height = window.innerHeight;
});


// --- 孔明灯效果 (黄昏模式) ---
const lanternCanvas = document.getElementById('lanterns');
const lanternCtx = lanternCanvas.getContext('2d');
lanternCanvas.width = window.innerWidth;
lanternCanvas.height = window.innerHeight;

let lanterns = [];

class Lantern {
    constructor() {
        this.reset();
        this.y = window.innerHeight + Math.random() * 300; 
    }

    reset() {
        this.x = Math.random() * lanternCanvas.width;
        this.y = lanternCanvas.height + Math.random() * 100;
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
    lanternCtx.clearRect(0, 0, lanternCanvas.width, lanternCanvas.height);
    lanterns.forEach(l => {
        l.update();
        l.draw();
    });
    lanternsRequestId = requestAnimationFrame(animateLanterns);
}

window.addEventListener('resize', () => {
    lanternCanvas.width = window.innerWidth;
    lanternCanvas.height = window.innerHeight;
});


// --- 动画管理与主题切换 ---

function stopAllAnimations() {
    if (fireworksRequestId) cancelAnimationFrame(fireworksRequestId);
    if (starsRequestId) cancelAnimationFrame(starsRequestId);
    if (balloonsRequestId) cancelAnimationFrame(balloonsRequestId);
    if (lanternsRequestId) cancelAnimationFrame(lanternsRequestId);
    
    // 清除画布残留
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    balloonCtx.clearRect(0, 0, balloonCanvas.width, balloonCanvas.height);
    lanternCtx.clearRect(0, 0, lanternCanvas.width, lanternCanvas.height);
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
    // 排除交互元素，避免冲突
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

function createLightStroke(x, y) {
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
        setTimeout(() => particle.remove(), 500);
    }, 1500);
}

// --- 增强夜晚互动：点击发射烟花 ---
function enableInteractiveFireworks() {
    const canvas = document.getElementById('fireworks');
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 发射一枚烟花到点击位置
        fireworks.push(new Firework(canvas.width / 2, canvas.height, x, y));
    });
}

// 初始化交互
enableInteractiveFireworks();


// --- 弹幕功能 ---
let lastDanmakuTime = 0;
const danmakuLanes = [10, 20, 30, 40, 50, 60]; // 预定义轨道（百分比）

function startDanmaku() {
    const container = document.getElementById('danmaku-container');
    
    setInterval(() => {
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
    
    // 增加烟花频率
    fireworkChance = 0.2;
    
    // 启动弹幕
    startDanmaku();
    
    console.log("Celebration Mode ON!");
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

// 初始化音频
async function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 尝试获取麦克风流
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // 获取成功，连接分析器
        microphone = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        microphone.connect(analyser);
        
        // 开始监测音量
        monitorAudio();
        
        // 显示麦克风可视化条
        document.getElementById('mic-visualizer').style.display = 'block';
        
    } catch (err) {
        console.warn('无法获取麦克风权限或设备不支持，启用备用方案', err);
        // 如果无法获取麦克风：
        // 1. 隐藏音量条
        const viz = document.getElementById('mic-visualizer');
        if(viz) viz.style.display = 'none';
        
        // 2. 确保手动按钮可见（虽然默认就是可见的）
        document.getElementById('manual-blow-btn').classList.remove('hidden');
    }
}

// 监测音量
function monitorAudio() {
    // 只有在“准备吹气”状态下才响应麦克风
    if (currentState !== AppState.READY_TO_BLOW) {
        requestAnimationFrame(monitorAudio);
        return;
    }

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // 计算平均音量
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
    }
    const average = sum / dataArray.length;

    // 更新可视化条
    const levelBar = document.getElementById('mic-level');
    if (levelBar) {
        // 将 0-255 的音量映射到 0-100%
        const percent = Math.min(100, (average / 60) * 100); 
        levelBar.style.width = percent + '%';
        // 颜色反馈：音量够大时变红
        levelBar.style.background = average > 40 ? '#FF5252' : '#4CAF50';
    }

    // 阈值检测
    if (average > 40) {
        blowOutCandle();
    } else {
        requestAnimationFrame(monitorAudio);
    }
}

// 吹灭蜡烛
function blowOutCandle() {
    if (currentState !== AppState.READY_TO_BLOW) return;
    currentState = AppState.BLOWING;
    
    // 隐藏提示
    document.getElementById('blow-hint').classList.add('hidden');
    
    // 蜡烛熄灭动画
    const candle = document.querySelector('.candle');
    const flame = document.getElementById('flame');
    const smoke = document.getElementById('smoke');
    
    flame.classList.add('out');
    smoke.style.opacity = 1;
    smoke.classList.add('puff');
    
    // 1.5秒后拔出蜡烛
    setTimeout(() => {
        candle.classList.add('removed');
        currentState = AppState.CANDLE_OUT;
    }, 1500);

    // 延迟显示许愿弹窗 (等待蜡烛消失)
    setTimeout(() => {
        // 重置弹窗状态
        // 直接显示步骤1（愿望已许下）
        document.getElementById('modal-step-1').classList.remove('hidden');
        document.getElementById('modal-step-2').classList.add('hidden');
        
        document.getElementById('wish-modal').classList.remove('hidden');
        currentState = AppState.GIFT_READY; // 此时才允许拆礼物
    }, 2500);
}

// 许愿输入逻辑 (已废弃，改为提前输入)
/*
document.getElementById('send-wish-btn').addEventListener('click', () => {
    ...
});
*/

// --- 彩蛋触发词功能 ---
function checkEasterEgg(wish) {
    if (wish.includes("爱") || wish.includes("Love") || wish.includes("喜欢")) {
        triggerLoveExplosion();
    } else if (wish.includes("富") || wish.includes("钱") || wish.includes("财")) {
        triggerMoneyRain();
    } else {
        // 如果没有触发特定彩蛋，则将愿望本身作为烟花发射
        // 延迟一点点，让普通烟花先炸
        setTimeout(() => {
            createTextFirework(wish.substring(0, 4), window.innerWidth / 2, window.innerHeight * 0.3);
        }, 1000);
    }
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
    const particlesList = [];
    
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
document.addEventListener('mousemove', (e) => {
    // 限制粒子生成频率，避免性能问题
    if (Math.random() > 0.3) return; 

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
    }, 1000);
});

// 许愿弹窗交互逻辑
document.getElementById('gift-box').addEventListener('click', () => {
    // 只有在礼物准备好（蜡烛吹灭且弹窗弹出）后才能点击
    if (currentState !== AppState.GIFT_READY) return;

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
});

// 3D 悬浮视差特效
const modal = document.querySelector('.modal-content');
document.addEventListener('mousemove', (e) => {
    // 只有当弹窗显示时才生效
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
    blowOutCandle();
});

// 启动逻辑
document.getElementById('start-btn').addEventListener('click', () => {
    currentState = AppState.WISHING; // 进入许愿状态
    document.getElementById('start-screen').style.opacity = 0;
    
    // 播放音乐
    const audio = document.getElementById('bgm');
    
    // 尝试播放音乐，如果失败（如浏览器限制自动播放），则在用户交互时再次尝试
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            document.getElementById('music-control').classList.remove('hidden');
            // 播放成功，移除 paused 类
            document.getElementById('music-control').classList.remove('paused');
        }).catch(error => {
            console.log("Audio play failed (browser restriction): ", error);
            // 播放失败，显示暂停状态的按钮，引导用户点击
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

    // 尝试初始化音频
    // 移除自动调用，避免权限问题导致逻辑卡死
    // initAudio(); 

    // 检查时间设置主题
    checkTimeAndSetTheme();

    setTimeout(() => {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('main-content').classList.remove('hidden');
        document.getElementById('time-control').classList.remove('hidden');
        // 移除相机按钮相关代码，因为已经删除了
        // document.getElementById('camera-btn').classList.remove('hidden');
        
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
    }, 1000);
});

// 新增逻辑：确认愿望后，才显示吹蜡烛提示
document.getElementById('confirm-wish-btn').addEventListener('click', () => {
    if (currentState !== AppState.WISHING) return;
    
    // 关键修改：在这里请求麦克风权限，因为这是明确的用户点击行为
    // 浏览器通常只允许在用户交互（click/touch）的回调中启动 AudioContext
    initAudio();

    const input = document.getElementById('pre-wish-input');
    const wish = input.value.trim() || "万事胜意";
    
    // 保存愿望供后续使用
    window.currentWish = wish;
    
    // 更新弹窗中的愿望显示
    document.getElementById('wish-display').innerText = wish;
    
    // 隐藏许愿框，显示吹蜡烛提示
    document.getElementById('wish-input-panel').classList.add('hidden');
    document.getElementById('blow-hint').classList.remove('hidden');
    
    currentState = AppState.READY_TO_BLOW; // 进入准备吹气状态
    
    // 触发彩蛋检测（提前检测，在吹灭时触发效果）
    checkEasterEgg(wish);
});

// 音乐控制逻辑
document.getElementById('music-control').addEventListener('click', function() {
    const audio = document.getElementById('bgm');
    if (audio.paused) {
        audio.play();
        this.classList.remove('paused');
    } else {
        audio.pause();
        this.classList.add('paused');
    }
});