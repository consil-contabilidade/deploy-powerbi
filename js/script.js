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

document.addEventListener('DOMContentLoaded', () => {
  const filtroAno = document.getElementById('filtro-ano');
  const filtroMes = document.getElementById('filtro-mes');
  const filtroDia = document.getElementById('filtro-dia');
  const btnCarregar = document.getElementById('btn-loadingimg');

  let dataTree = []; // Para armazenar a estrutura de pastas

  // Função para carregar a árvore de diretórios da API
  async function carregarFiltros() {
    try {
      const response = await fetch('/api/tree');
      dataTree = await response.json();

      // Limpa e popula o seletor de ano
      filtroAno.innerHTML = '<option value="">Selecione...</option>';
      dataTree.forEach(item => {
        const option = document.createElement('option');
        option.value = item.ano;
        option.textContent = item.ano;
        filtroAno.appendChild(option);
      });
    } catch (error) {
      console.error('Falha ao carregar os filtros:', error);
    }
  }

  // Evento quando um ano é selecionado
  filtroAno.addEventListener('change', () => {
    const anoSelecionado = filtroAno.value;
    filtroMes.innerHTML = '<option value="">Selecione...</option>';
    filtroDia.innerHTML = '<option value="">Selecione...</option>';
    filtroMes.disabled = true;
    filtroDia.disabled = true;
    btnCarregar.disabled = true;

    if (anoSelecionado) {
      const anoData = dataTree.find(item => item.ano === anoSelecionado);
      anoData.meses.forEach(item => {
        const option = document.createElement('option');
        option.value = item.mes;
        option.textContent = item.mes;
        filtroMes.appendChild(option);
      });
      filtroMes.disabled = false;
    }
  });

  // Evento quando um mês é selecionado
  filtroMes.addEventListener('change', () => {
    const anoSelecionado = filtroAno.value;
    const mesSelecionado = filtroMes.value;
    filtroDia.innerHTML = '<option value="">Selecione...</option>';
    filtroDia.disabled = true;
    btnCarregar.disabled = true;

    if (mesSelecionado) {
      const anoData = dataTree.find(item => item.ano === anoSelecionado);
      const mesData = anoData.meses.find(item => item.mes === mesSelecionado);
      mesData.dias.forEach(dia => {
        const option = document.createElement('option');
        option.value = dia;
        option.textContent = dia;
        filtroDia.appendChild(option);
      });
      filtroDia.disabled = false;
    }
  });

  // Evento quando um dia é selecionado
  filtroDia.addEventListener('change', () => {
    btnCarregar.disabled = !filtroDia.value;
  });

  // Evento do botão para carregar as imagens
  btnCarregar.addEventListener('click', async () => {
    const ano = filtroAno.value;
    const mes = filtroMes.value;
    const dia = filtroDia.value;

    if (!ano || !mes || !dia) return;

    try {
      const response = await fetch(`/api/images?ano=${ano}&mes=${mes}&dia=${dia}`);
      const novasImagens = await response.json();

      if (novasImagens.length > 0) {
        console.log('Novas imagens para o slideshow:', novasImagens);
        alert(`Carregadas ${novasImagens.length} imagens! Integre esta lista ao seu slideshow.`);
        
        // Exemplo de como atualizar a primeira imagem
        const slideElement = document.getElementById('slide');
        if(slideElement) {
          slideElement.src = novasImagens[0];
        }

      } else {
        alert('Nenhuma imagem encontrada para a data selecionada.');
      }
    } catch (error) {
      console.error('Falha ao carregar imagens:', error);
    }
  });

  // Carrega os filtros assim que a página é aberta
  carregarFiltros();
});
