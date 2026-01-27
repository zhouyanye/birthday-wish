
// 简单的物理引擎彩带特效
class ConfettiParticle {
    constructor(x, y, colors) {
        this.x = x;
        this.y = y;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        // 随机速度和角度
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 15 + 10;
        this.vx = Math.cos(angle) * velocity;
        this.vy = Math.sin(angle) * velocity - 10; // 向上爆发
        this.gravity = 0.5;
        this.friction = 0.95;
        this.size = Math.random() * 8 + 4;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
        this.opacity = 1;
        this.decay = Math.random() * 0.02 + 0.01;
    }

    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        
        this.x += this.vx;
        this.y += this.vy;
        
        this.rotation += this.rotationSpeed;
        this.opacity -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        // 绘制矩形彩带
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
        ctx.restore();
    }
}

class ConfettiCannon {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        document.body.appendChild(this.canvas);
        
        this.particles = [];
        this.colors = [
            '#ff5e57', '#0be881', '#ffc048', '#575fcf', '#ef5777', '#F8EFBA', 
            '#d63031', '#0984e3', '#6c5ce7', '#00b894', '#e17055', '#fdcb6e'
        ];
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    burst(x, y, count = 100) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new ConfettiParticle(x, y, this.colors));
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            p.draw(this.ctx);
            
            if (p.opacity <= 0 || p.y > this.canvas.height + 100) {
                this.particles.splice(i, 1);
            }
        }
        
        requestAnimationFrame(this.animate);
    }
}

// 导出全局实例
window.confettiCannon = new ConfettiCannon();