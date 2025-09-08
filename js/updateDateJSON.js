import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Para compatibilidade com ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function updateDateJSON() {
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
    
  }
}