let images = [];
let currentIndex = 0;
let intervalTime = 60000; // 1 minuto
let autoPlay = true;
let interval;

const slide = document.getElementById('slide');
const controls = document.getElementById('controls');

const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const pauseBtn = document.getElementById('pause');

async function loadImages() {
  try {
    const response = await fetch('../json/images.json');
    images = await response.json();
    if (images.length > 0) {
      showSlide(currentIndex);
      startAutoPlay();
    } else {
      console.warn('Nenhuma imagem encontrada.');
    }
  } catch (err) {
    console.error('Erro ao carregar imagens:', err);
  }
}

function showSlide(index) {
  slide.style.opacity = 0;
  setTimeout(() => {
    slide.src = images[index];
    slide.onload = () => {
      slide.style.opacity = 1;
    };
  }, 500);
}

function nextSlide() {
  currentIndex = (currentIndex + 1) % images.length;
  showSlide(currentIndex);
}

function prevSlide() {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  showSlide(currentIndex);
}

function startAutoPlay() {
  interval = setInterval(nextSlide, intervalTime);
}

function stopAutoPlay() {
  clearInterval(interval);
}

pauseBtn.addEventListener('click', () => {
  autoPlay = !autoPlay;
  if (autoPlay) {
    pauseBtn.textContent = '⏸';
    startAutoPlay();
  } else {
    pauseBtn.textContent = '▶';
    stopAutoPlay();
  }
});

nextBtn.addEventListener('click', () => {
  nextSlide();
  if (autoPlay) {
    stopAutoPlay();
    startAutoPlay();
  }
});

prevBtn.addEventListener('click', () => {
  prevSlide();
  if (autoPlay) {
    stopAutoPlay();
    startAutoPlay();
  }
});

document.body.addEventListener('mousemove', e => {
  if (
    window.innerHeight - e.clientY < 80 &&
    window.innerWidth - e.clientX < 200
  ) {
    controls.classList.remove('hidden');
  }
});

document.body.addEventListener('touchstart', () => {
  controls.classList.toggle('hidden');
});

loadImages();

document.addEventListener("DOMContentLoaded", function () {
  const fullscreenBtn = document.getElementById("fullscreen-btn");

  fullscreenBtn.addEventListener("click", function () {
    // Se já estiver em fullscreen → sair
    if (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    ) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } 
    // Se não estiver em fullscreen → entrar
    else {
      const elem = document.documentElement;

      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      } else if (elem.webkitEnterFullscreen) { 
        elem.webkitEnterFullscreen(); // TVs Samsung (vídeos)
      }
    }
  });

  // Mudar ícone dinamicamente
  document.addEventListener("fullscreenchange", toggleButtonIcon);
  document.addEventListener("webkitfullscreenchange", toggleButtonIcon);
  document.addEventListener("mozfullscreenchange", toggleButtonIcon);
  document.addEventListener("MSFullscreenChange", toggleButtonIcon);

  function toggleButtonIcon() {
    if (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    ) {
      fullscreenBtn.textContent = "⤢"; // Ícone sair fullscreen
    } else {
      fullscreenBtn.textContent = "⛶"; // Ícone entrar fullscreen
    }
  }
});
