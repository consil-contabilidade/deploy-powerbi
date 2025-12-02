document.addEventListener('DOMContentLoaded', () => {

  let images = [];
  let currentIndex = 0;
  let intervalTime = 60000;
  const REFRESH_TIME = 15 * 60 * 1000;
  const IDLE_CURSOR_TIME = 3000;
  let autoPlay = true;
  let interval;
  let dataHistorico = [];
  let refreshTimer;
  let cursorTimer;
  let isPaused = false;

  const slideElement = document.getElementById('slide');
  const controls = document.getElementById('controls');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const pauseBtn = document.getElementById('pause');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const filtroAno = document.getElementById('filtro-ano');
  const filtroMes = document.getElementById('filtro-mes');
  const filtroDia = document.getElementById('filtro-dia');
  const btnCarregar = document.getElementById('btn-loadingimg');

  function showSlide(index) {
    if (!images || images.length === 0) {
      slideElement.style.opacity = 0;
      return;
    }
    slideElement.style.opacity = 0;
    setTimeout(() => {
      slideElement.src = images[index];
      slideElement.onload = () => {
        slideElement.style.opacity = 1;
      };
    }, 500);
  }

  function nextSlide() {
    if (images.length === 0) return;
    currentIndex = (currentIndex + 1) % images.length;
    showSlide(currentIndex);
  }

  function prevSlide() {
    if (images.length === 0) return;
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showSlide(currentIndex);
  }

  function stopAutoPlay() {
    clearInterval(interval);
  }

  function startAutoPlay() {
    stopAutoPlay();
    if (autoPlay && images.length > 1) {
      interval = setInterval(nextSlide, intervalTime);
    }
  }

  function iniciarSlideshow(novasImagens) {
    if (!novasImagens || novasImagens.length === 0) {
      images = [];
      showSlide(-1);
      stopAutoPlay();
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'Não foi encontrado nenhuma imagem!',
        text: `${novasImagens.length} imagens não foram carregadas no slideshow.`,
        showConfirmButton: false,
        timer: 2000,
        toast: true,
        background: '#333',
        color: '#fff',
      });
      return;
    }
    images = novasImagens;
    currentIndex = 0;
    showSlide(currentIndex);
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Imagens carregadas!',
      text: `${novasImagens.length} imagens foram carregadas no slideshow.`,
      showConfirmButton: false, // Não mostrar o botão "OK"
      timer: 2000,
      toast: true,
      background: '#333',
      color: '#fff',
    });
    startAutoPlay();
  }

  // LÓGICA DO CURSOR (ESCONDER) ---
  function hideCursor() {
    body.style.cursor = 'none';
  }
  
  function showCursor() {
    body.style.cursor = 'default';
    clearTimeout(cursorTimer);
    cursorTimer = setTimeout(hideCursor, IDLE_CURSOR_TIME);
  }

  function encontrarDadosMaisRecentes(historico) {
    if (!historico || historico.length === 0) return null;
    const ultimoAnoObj = historico[historico.length - 1];
    if (!ultimoAnoObj.meses || ultimoAnoObj.meses.length === 0) return null;
    const ultimoMesObj = ultimoAnoObj.meses[ultimoAnoObj.meses.length - 1];
    if (!ultimoMesObj.dias || ultimoMesObj.dias.length === 0) return null;
    const ultimoDiaObj = ultimoMesObj.dias[ultimoMesObj.dias.length - 1];
    return {
      ano: ultimoAnoObj.ano,
      mes: ultimoMesObj.mes,
      dia: ultimoDiaObj.dia,
      imagens: ultimoDiaObj.imagens,
    };
  }

  async function carregarDados() {
    try {
      const response = await fetch('json/historico.json');
      if (!response.ok) {
        throw new Error(
          `Não foi possível carregar history.json. Status: ${response.status}`
        );
      }
      dataHistorico = await response.json();

      filtroAno.innerHTML = '<option value="">Selecione...</option>';
      dataHistorico.forEach(item => {
        const option = document.createElement('option');
        option.value = item.ano;
        option.textContent = item.ano;
        filtroAno.appendChild(option);
      });

      const dataMaisRecente = encontrarDadosMaisRecentes(dataHistorico);
      if (dataMaisRecente) {
        iniciarSlideshow(dataMaisRecente.imagens);
        filtroAno.value = dataMaisRecente.ano;
        filtroAno.dispatchEvent(new Event('change'));
        filtroMes.value = dataMaisRecente.mes;
        filtroMes.dispatchEvent(new Event('change'));
        filtroDia.value = dataMaisRecente.dia;
        filtroDia.dispatchEvent(new Event('change'));
      }
    } catch (error) {
      console.error('Falha ao carregar dados de filtro:', error);
    }
  }

  btnCarregar.addEventListener('click', () => {
    const ano = filtroAno.value;
    const mes = filtroMes.value;
    const dia = filtroDia.value;
    if (!ano || !mes || !dia) return;

    const anoData = dataHistorico.find(item => item.ano === ano);
    const mesData = anoData
      ? anoData.meses.find(item => item.mes === mes)
      : null;
    const diaData = mesData
      ? mesData.dias.find(item => item.dia === dia)
      : null;
    const novasImagens = diaData ? diaData.imagens : [];

    iniciarSlideshow(novasImagens);

    if (novasImagens.length === 0) {
      alert('Nenhuma imagem encontrada para a data selecionada.');
    }
  });

  filtroAno.addEventListener('change', () => {
    const anoSelecionado = filtroAno.value;
    filtroMes.innerHTML = '<option value="">Selecione...</option>';
    filtroDia.innerHTML = '<option value="">Selecione...</option>';
    filtroMes.disabled = true;
    filtroDia.disabled = true;
    btnCarregar.disabled = true;

    if (anoSelecionado) {
      const anoData = dataHistorico.find(item => item.ano === anoSelecionado);
      if (anoData && anoData.meses) {
        anoData.meses.forEach(item => {
          const option = document.createElement('option');
          option.value = item.mes;
          option.textContent = item.mes;
          filtroMes.appendChild(option);
        });
        filtroMes.disabled = false;
      }
    }
  });

  filtroMes.addEventListener('change', () => {
    const anoSelecionado = filtroAno.value;
    const mesSelecionado = filtroMes.value;
    filtroDia.innerHTML = '<option value="">Selecione...</option>';
    filtroDia.disabled = true;
    btnCarregar.disabled = true;

    if (mesSelecionado) {
      const anoData = dataHistorico.find(item => item.ano === anoSelecionado);
      const mesData = anoData
        ? anoData.meses.find(item => item.mes === mesSelecionado)
        : null;
      if (mesData && mesData.dias) {
        mesData.dias.forEach(item => {
          const option = document.createElement('option');
          option.value = item.dia;
          option.textContent = item.dia;
          filtroDia.appendChild(option);
        });
        filtroDia.disabled = false;
      }
    }
  });

  filtroDia.addEventListener('change', () => {
    btnCarregar.disabled = !filtroDia.value;
  });

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

  fullscreenBtn.addEventListener('click', function () {
    if (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    ) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    } else {
      const elem = document.documentElement;
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
      else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
      else if (elem.webkitEnterFullscreen) elem.webkitEnterFullscreen();
    }
  });

  function toggleButtonIcon() {
    if (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    ) {
      fullscreenBtn.textContent = '⤢';
    } else {
      fullscreenBtn.textContent = '⛶';
    }
  }

  document.addEventListener('fullscreenchange', toggleButtonIcon);
  document.addEventListener('webkitfullscreenchange', toggleButtonIcon);
  document.addEventListener('mozfullscreenchange', toggleButtonIcon);
  document.addEventListener('MSFullscreenChange', toggleButtonIcon);

  carregarDados();
});
