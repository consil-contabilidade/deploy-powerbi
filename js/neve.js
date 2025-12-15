const canvas = document.getElementById('snowCanvas');
const ctx = canvas.getContext('2d');

// Configuração inicial
let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

const snowflakes = [];
const maxSnowflakes = 100; // Quantidade de flocos

// Cria um floco
function createSnowflake() {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 3 + 1, // Tamanho
    speed: Math.random() * 2 + 1, // Velocidade queda
    wind: Math.random() * 0.5 - 0.25, // Vento lateral
  };
}

// Inicializa o array de flocos
for (let i = 0; i < maxSnowflakes; i++) {
  snowflakes.push(createSnowflake());
}

function drawSnow() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();

  snowflakes.forEach((flake, index) => {
    // Desenha
    ctx.moveTo(flake.x, flake.y);
    ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);

    // Atualiza posição
    flake.y += flake.speed;
    flake.x += flake.wind;

    // Se sair da tela, reseta para o topo
    if (flake.y > height) {
      snowflakes[index] = createSnowflake();
      snowflakes[index].y = 0; // Começa lá em cima
    }
  });

  ctx.fill();
  requestAnimationFrame(drawSnow);
}

// Ajusta se redimensionar a tela
window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
});

// Inicia
drawSnow();
