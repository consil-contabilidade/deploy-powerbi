import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Para compatibilidade com ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function updateDate() {
  const isNode = typeof window === 'undefined' && typeof document === 'undefined';
  
  if (isNode) {
    // Executando no Node.js - Salvar data atual no JSON
    try {
      const agora = new Date();
      
      // Formatar data para o formato brasileiro
      const dia = agora.getDate().toString().padStart(2, '0');
      const mes = (agora.getMonth() + 1).toString().padStart(2, '0');
      const ano = agora.getFullYear();
      const horas = agora.getHours().toString().padStart(2, '0');
      const minutos = agora.getMinutes().toString().padStart(2, '0');
      
      const dataAtual = {
        timestamp: agora.toISOString(),
        dataFormatada: `${dia}/${mes}/${ano}`,
        horaFormatada: `${horas}:${minutos}`,
        dataCompleta: `Última atualização: ${dia}/${mes}/${ano} às ${horas}:${minutos}`
      };
      
      // Caminho para o arquivo JSON (relativo ao init.js)
      const jsonPath = join(process.cwd(), 'json', 'ultimaAtualizacao.json');
      
      // Criar diretório se não existir
      const jsonDir = join(process.cwd(), 'json');
      if (!existsSync(jsonDir)) {
        import('fs').then(({ mkdirSync }) => {
          mkdirSync(jsonDir, { recursive: true });
        });
      }
      
      // Salvar no arquivo JSON
      writeFileSync(jsonPath, JSON.stringify(dataAtual, null, 2), 'utf8');
      
      console.log(`✅ Data atualizada salva: ${dataAtual.dataCompleta}`);
      
    } catch (error) {
      console.error('❌ Erro ao salvar data no JSON:', error);
    }
    
  } else {
    // Executando no navegador - Ler do JSON e atualizar DOM
    const horarioData = document.querySelector('.horarioData');
    
    if (horarioData) {
      try {
        // Buscar dados do JSON
        const response = await fetch('./json/ultimaAtualizacao.json');
        
        if (response.ok) {
          const dados = await response.json();
          horarioData.textContent = dados.dataCompleta;
          console.log('📅 Data carregada do JSON:', dados.dataCompleta);
        } else {
          throw new Error('Arquivo JSON não encontrado');
        }
        
      } catch (error) {
        console.warn('⚠️ Erro ao carregar JSON, usando data atual:', error);
        
        // Fallback para data atual se JSON não existir
        const agora = new Date();
        const dia = agora.getDate().toString().padStart(2, '0');
        const mes = (agora.getMonth() + 1).toString().padStart(2, '0');
        const ano = agora.getFullYear();
        const horas = agora.getHours().toString().padStart(2, '0');
        const minutos = agora.getMinutes().toString().padStart(2, '0');
        
        const dataHoraFormatada = `Atualizado em: ${dia}/${mes}/${ano} às ${horas}:${minutos}`;
        horarioData.textContent = dataHoraFormatada;
      }
    }
  }
}

// Auto-executar apenas no navegador
if (typeof window !== 'undefined') {
  // Aguardar o DOM carregar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateDate);
  } else {
    updateDate();
  }
}