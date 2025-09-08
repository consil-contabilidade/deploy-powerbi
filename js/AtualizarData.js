async function atualizarData() {
  try {
    // Buscar dados do JSON
    const response = await fetch('./json/ultimaAtualizacao.json');
    const horarioData = document.querySelector('.horarioData');
    if (response.ok) {
      const dados = await response.json();
      horarioData.textContent = dados.dataCompleta;
      console.log('📅 Data carregada do JSON:', dados.dataCompleta);
    } 
}catch (e) {
  console.log(e)
}
}
atualizarData();

