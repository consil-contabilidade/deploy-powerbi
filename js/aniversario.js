// ================= MOTOR DE CELEBRAÇÃO (Confetes e Luzes) =================

const celebrationCanvas = document.getElementById('aniversarioCanvas');
const ctx = celebrationCanvas.getContext('2d');
let animationId;
let particles = [];
let spotlights = [];

// Ajusta o tamanho do canvas para a tela
function resizeCanvas() {
    celebrationCanvas.width = window.innerWidth;
    celebrationCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Confete
class Particle {
    constructor() {
        this.x = Math.random() * celebrationCanvas.width;
        this.y = Math.random() * celebrationCanvas.height - celebrationCanvas.height;
        this.size = Math.random() * 10 + 5;
        this.speedY = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        
        // Cores festivas
        const colors = ['#f39c12', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f1c40f'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 2 - 1;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        // Reseta se cair abaixo da tela
        if (this.y > celebrationCanvas.height) {
            this.y = -10;
            this.x = Math.random() * celebrationCanvas.width;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.fillStyle = this.color;
        // Desenha um pequeno quadrado ou retângulo
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
        ctx.restore();
    }
}

// --- Classe Luzes (Spotlights) ---
class Spotlight {
    constructor(color, x, speed) {
        this.color = color;
        this.x = x;
        this.y = celebrationCanvas.height;
        this.angle = Math.random() * Math.PI; // Ângulo inicial
        this.speed = speed;
    }

    update() {
        this.angle += this.speed;
    }

    draw() {
        ctx.save();
        // O ponto de origem da luz é a parte inferior
        ctx.translate(this.x, this.height + 50); 
        // Oscila o ângulo
        const oscillation = Math.sin(this.angle) * 0.5; 
        ctx.rotate(oscillation);

        // Cria um gradiente radial que parece um feixe de luz
        const gradient = ctx.createRadialGradient(0, -celebrationCanvas.height/2, 0, 0, 0, celebrationCanvas.height * 1.2);
        gradient.addColorStop(0, this.color.replace('1)', '0.4)')); // Cor central transparente
        gradient.addColorStop(0.5, this.color.replace('1)', '0.1)')); // Meio desbotado
        gradient.addColorStop(1, 'rgba(0,0,0,0)'); // Final transparente

        ctx.fillStyle = gradient;
        // Desenha um grande triângulo/cone de luz
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-200, -celebrationCanvas.height * 1.5);
        ctx.lineTo(200, -celebrationCanvas.height * 1.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

function initCelebration() {
    particles = [];
    spotlights = [];
    // Cria 150 confetes
    for (let i = 0; i < 150; i++) {
        particles.push(new Particle());
    }
    // Cria algumas luzes de balada
    spotlights.push(new Spotlight('rgba(52, 152, 219, 1)', celebrationCanvas.width * 0.2, 0.02)); // Azul
    spotlights.push(new Spotlight('rgba(231, 76, 60, 1)', celebrationCanvas.width * 0.5, 0.03));  // Vermelho
    spotlights.push(new Spotlight('rgba(46, 204, 113, 1)', celebrationCanvas.width * 0.8, 0.025)); // Verde
}

function animateCelebration() {
    ctx.clearRect(0, 0, celebrationCanvas.width, celebrationCanvas.height);
    
    // Modo de composição para as luzes ficarem bonitas sobre a imagem
    ctx.globalCompositeOperation = 'lighter';
    spotlights.forEach(spot => {
        spot.update();
        spot.draw();
    });
    
    // Volta ao normal para os confetes
    ctx.globalCompositeOperation = 'source-over';
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    animationId = requestAnimationFrame(animateCelebration);
}

// ================= FUNÇÕES GLOBAIS PARA O SCRIPT PRINCIPAL =================

// Inicia a festa
window.startCelebrationEffect = function() {
    if (!celebrationCanvas.classList.contains('active')) {
        celebrationCanvas.classList.add('active');
        resizeCanvas();
        initCelebration();
        animateCelebration();
    }
};

// Para a festa
window.stopCelebrationEffect = function() {
    if (celebrationCanvas.classList.contains('active')) {
        celebrationCanvas.classList.remove('active');
        cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, celebrationCanvas.width, celebrationCanvas.height);
    }
};

window.startCelebrationEffect();