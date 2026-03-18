// ================= MOTOR DE CELEBRAÇÃO v2.0 =================
// Efeitos: Confetes, Balões, Fogos de Artifício, Holofotes

const celebrationCanvas = document.getElementById('aniversarioCanvas');
const ctx = celebrationCanvas.getContext('2d');

let animationId    = null;
let particles      = [];   // confetes/fitas
let balloons       = [];   // balões
let fireworks      = [];   // foguetes + explosões
let spotlights     = [];   // holofotes
let fwTimer        = 0;    // contador para lançar fogos

// ─── Resize ────────────────────────────────────────────────────────────────

function resizeCanvas() {
    celebrationCanvas.width  = window.innerWidth;
    celebrationCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ─── Paleta de cores ────────────────────────────────────────────────────────

const COLORS = [
    '#f39c12', '#e74c3c', '#3498db', '#2ecc71',
    '#9b59b6', '#f1c40f', '#e91e8c', '#00bcd4',
    '#ff5722', '#8bc34a'
];

function rndColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. CONFETES / FITAS
// ═══════════════════════════════════════════════════════════════════════════

class Particle {
    constructor(fromTop) {
        this.color       = rndColor();
        this.isRibbon    = Math.random() > 0.45; // mistura quadradinhos e fitas
        this.reset(fromTop ?? false);
    }

    reset(fromTop) {
        this.x        = Math.random() * celebrationCanvas.width;
        this.y        = fromTop
                            ? Math.random() * -celebrationCanvas.height
                            : -(10 + Math.random() * 40);
        this.size     = Math.random() * 9 + 4;
        this.speedY   = Math.random() * 2.5 + 1;
        this.speedX   = (Math.random() - 0.5) * 1.4;
        this.rotation = Math.random() * 360;
        this.rotSpeed = (Math.random() - 0.5) * 3;
        this.waveOff  = Math.random() * Math.PI * 2;
        this.alpha    = 0.75 + Math.random() * 0.25;
    }

    update() {
        this.waveOff += 0.04;
        this.y        += this.speedY;
        this.x        += this.speedX + Math.sin(this.waveOff) * 0.5;
        this.rotation += this.rotSpeed;

        if (this.y > celebrationCanvas.height + 20) {
            this.color    = rndColor();
            this.isRibbon = Math.random() > 0.45;
            this.reset(false);
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;

        if (this.isRibbon) {
            // fita longa
            ctx.fillRect(-this.size * 0.3, -this.size * 0.7, this.size * 0.6, this.size * 1.4);
            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            ctx.fillRect(-this.size * 0.3, -this.size * 0.7, this.size * 0.2, this.size * 1.4);
        } else {
            // quadradinho
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.65);
        }

        ctx.restore();
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. BALÕES
// ═══════════════════════════════════════════════════════════════════════════

class Balloon {
    constructor(fromBottom) {
        this.color  = rndColor();
        this.radius = 18 + Math.random() * 14;
        this.reset(fromBottom ?? false);
    }

    reset(fromBottom) {
        this.x    = Math.random() * celebrationCanvas.width;
        this.y    = fromBottom
                        ? celebrationCanvas.height + this.radius * 3 + Math.random() * 200
                        : celebrationCanvas.height + this.radius * 3;
        this.vy   = -(0.5 + Math.random() * 0.8);
        this.vx   = (Math.random() - 0.5) * 0.4;
        this.waveOff = Math.random() * Math.PI * 2;
    }

    update() {
        this.waveOff += 0.018;
        this.y       += this.vy;
        this.x       += this.vx + Math.sin(this.waveOff) * 0.4;

        if (this.y < -(this.radius * 4)) {
            this.color  = rndColor();
            this.radius = 18 + Math.random() * 14;
            this.reset(false);
        }
    }

    draw() {
        const r = this.radius;

        ctx.save();
        ctx.translate(this.x, this.y);

        // corpo do balão
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 1.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.88;
        ctx.fill();

        // brilho
        ctx.beginPath();
        ctx.ellipse(-r * 0.22, -r * 0.3, r * 0.2, r * 0.14, -0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fill();

        // nó inferior
        ctx.beginPath();
        ctx.arc(0, r * 1.22, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 1;
        ctx.fill();

        // barbante
        ctx.beginPath();
        ctx.moveTo(0, r * 1.25);
        ctx.bezierCurveTo(
            8,  r * 1.25 + 20,
           -6,  r * 1.25 + 42,
            3,  r * 1.25 + 60
        );
        ctx.strokeStyle = this.color;
        ctx.lineWidth   = 1;
        ctx.globalAlpha = 0.5;
        ctx.stroke();

        ctx.restore();
        ctx.globalAlpha = 1;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. FOGOS DE ARTIFÍCIO
// ═══════════════════════════════════════════════════════════════════════════

class Firework {
    constructor() {
        this.color    = rndColor();
        this.x        = celebrationCanvas.width  * 0.1 + Math.random() * celebrationCanvas.width  * 0.8;
        this.y        = celebrationCanvas.height;
        this.targetX  = celebrationCanvas.width  * 0.1 + Math.random() * celebrationCanvas.width  * 0.8;
        this.targetY  = 50 + Math.random() * celebrationCanvas.height * 0.45;

        const spd  = 7 + Math.random() * 5;
        const ang  = Math.atan2(this.targetY - this.y, this.targetX - this.x);
        this.vx    = Math.cos(ang) * spd;
        this.vy    = Math.sin(ang) * spd;

        this.trail    = [];
        this.exploded = false;
        this.sparks   = [];
        this.dead     = false;
    }

    burst() {
        const n = 60 + Math.floor(Math.random() * 50);
        for (let i = 0; i < n; i++) {
            const ang   = (i / n) * Math.PI * 2;
            const speed = 1.5 + Math.random() * 3.5;
            this.sparks.push({
                x  : this.x,
                y  : this.y,
                vx : Math.cos(ang) * speed,
                vy : Math.sin(ang) * speed,
                al : 1,
                sz : 1.5 + Math.random() * 1.5,
                col: Math.random() > 0.3 ? this.color : '#ffffff'
            });
        }
    }

    update() {
        if (!this.exploded) {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 10) this.trail.shift();
            this.x += this.vx;
            this.y += this.vy;

            if (Math.hypot(this.targetX - this.x, this.targetY - this.y) < 12) {
                this.exploded = true;
                this.burst();
            }
        } else {
            let alive = 0;
            for (const s of this.sparks) {
                s.x  += s.vx;
                s.y  += s.vy;
                s.vy += 0.06;     // gravidade leve
                s.vx *= 0.985;
                s.al -= 0.016;
                if (s.al > 0) alive++;
            }
            if (alive === 0) this.dead = true;
        }
    }

    draw() {
        if (!this.exploded) {
            // rastro
            for (let i = 0; i < this.trail.length; i++) {
                ctx.globalAlpha = (i / this.trail.length) * 0.6;
                ctx.beginPath();
                ctx.arc(this.trail[i].x, this.trail[i].y, 2, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            // cabeça
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        } else {
            for (const s of this.sparks) {
                if (s.al <= 0) continue;
                ctx.globalAlpha = s.al;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.sz, 0, Math.PI * 2);
                ctx.fillStyle = s.col;
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. HOLOFOTES
// ═══════════════════════════════════════════════════════════════════════════

class Spotlight {
    constructor(color, x, speed) {
        this.color = color;
        this.x     = x;
        this.speed = speed;
        this.angle = Math.random() * Math.PI;
    }

    update() {
        this.angle += this.speed;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, celebrationCanvas.height + 50);  // ← bug corrigido

        const oscillation = Math.sin(this.angle) * 0.55;
        ctx.rotate(oscillation);

        const h = celebrationCanvas.height;
        const gradient = ctx.createRadialGradient(0, -h / 2, 0, 0, 0, h * 1.3);
        gradient.addColorStop(0,   this.color.replace('1)', '0.35)'));
        gradient.addColorStop(0.5, this.color.replace('1)', '0.08)'));
        gradient.addColorStop(1,   'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-220, -h * 1.6);
        ctx.lineTo( 220, -h * 1.6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

function initCelebration() {
    particles  = [];
    balloons   = [];
    fireworks  = [];
    spotlights = [];
    fwTimer    = 0;

    // 140 confetes/fitas já espalhados na tela
    for (let i = 0; i < 140; i++) {
        particles.push(new Particle(true));
    }

    // 14 balões distribuídos
    for (let i = 0; i < 14; i++) {
        balloons.push(new Balloon(true));
    }

    // holofotes (bug de this.height corrigido aqui na classe)
    const w = celebrationCanvas.width;
    // spotlights.push(new Spotlight('rgba(52,152,219,1)',   w * 0.15, 0.018)); // azul
    // spotlights.push(new Spotlight('rgba(231,76,60,1)',    w * 0.40, 0.025)); // vermelho
    // spotlights.push(new Spotlight('rgba(46,204,113,1)',   w * 0.65, 0.020)); // verde
    // spotlights.push(new Spotlight('rgba(155,89,182,1)',   w * 0.85, 0.022)); // roxo
}

// ═══════════════════════════════════════════════════════════════════════════
// LOOP DE ANIMAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

function animateCelebration() {
    ctx.clearRect(0, 0, celebrationCanvas.width, celebrationCanvas.height);

    // ── Holofotes (lighter = aditivo, fica lindo sobre a imagem) ──────────
    ctx.globalCompositeOperation = 'lighter';
    for (const s of spotlights) { s.update(); s.draw(); }

    // ── Fogos ─────────────────────────────────────────────────────────────
    ctx.globalCompositeOperation = 'lighter';
    fwTimer++;
    if (fwTimer > 70) {
        fireworks.push(new Firework());
        fwTimer = 0;
    }
    fireworks = fireworks.filter(f => !f.dead);
    for (const f of fireworks) { f.update(); f.draw(); }

    // ── Confetes e balões (source-over normal) ────────────────────────────
    ctx.globalCompositeOperation = 'source-over';

    for (const p of particles) { p.update(); p.draw(); }
    for (const b of balloons)  { b.update(); b.draw(); }

    ctx.globalAlpha = 1;
    animationId = requestAnimationFrame(animateCelebration);
}

// ═══════════════════════════════════════════════════════════════════════════
// API PÚBLICA (chamada pelo script.js principal)
// ═══════════════════════════════════════════════════════════════════════════

window.startCelebrationEffect = function () {
    if (!celebrationCanvas.classList.contains('active')) {
        celebrationCanvas.classList.add('active');
        resizeCanvas();
        initCelebration();
        animateCelebration();
    }
};

window.stopCelebrationEffect = function () {
    if (celebrationCanvas.classList.contains('active')) {
        celebrationCanvas.classList.remove('active');
        cancelAnimationFrame(animationId);
        animationId = null;
        ctx.clearRect(0, 0, celebrationCanvas.width, celebrationCanvas.height);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// OBSERVADOR DE SLIDE (ativa/desativa conforme o src da imagem)
// ═══════════════════════════════════════════════════════════════════════════

function checkAndTriggerCelebration(imageSrc) {
    if (!imageSrc) { window.stopCelebrationEffect(); return; }

    const filename = imageSrc.split('/').pop().split('?')[0];

    if (/(aniversarioMes|aniversarioEmpresa)\.[a-zA-Z0-9]+$/i.test(filename)) {
        window.startCelebrationEffect();
    } else {
        window.stopCelebrationEffect();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const slideEl = document.getElementById('slide');
    if (!slideEl) return;

    checkAndTriggerCelebration(slideEl.getAttribute('src'));

    const observer = new MutationObserver(mutations => {
        for (const m of mutations) {
            if (m.type === 'attributes' && m.attributeName === 'src') {
                checkAndTriggerCelebration(slideEl.getAttribute('src'));
            }
        }
    });

    observer.observe(slideEl, { attributes: true });
});