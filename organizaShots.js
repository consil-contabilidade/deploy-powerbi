import fs from 'fs';
import path from 'path';

// CONFIGURAÇÃO DE CAMINHO DOS ARQUIVOS
const pastaOrigem = path.resolve('./json/images.json');
const pastaDestino = path.resolve('./pasta_destino')

// FUNÇÃO PRA CRIAR E ORGANIZAR AS PASTAS
export default async function gerarPastas() {
    try {
        // etapa de verificação se existe pasta de origem e de destino, criando caso nao exista!!
        if (!fs.existsSync(pastaDestino)) {
            console.log(`Não foi encontrada a pasta de destino "${pastaDestino}". Criando...`);
            fs.mkdirSync(pastaDestino, { recursive: true });
        }

        // Estruturação das Pastas
        // Pega dados de (DD/MM/AAAA)
        const atual = new Date();
        const year = atual.getFullYear().toString();
        const month = String(atual.getMonth() + 1).padStart(2, '0');
        const day = String(atual.getDate()).padStart(2, '0');

        //caminho de destino final
        const pastaFinal = path.join(pastaDestino, year, month, day);

        if (!fs.existsSync(pastaFinal)) {
            fs.mkdirSync(pastaFinal, { recursive: true });
            console.log(`Estrutura criada em: "${pastaFinal}"`);
        } else {
            console.log(`A estrutura já existe em: "${pastaFinal}"`);
        }

        // Leitura e Movimentação dos Arquivos
        if (!fs.existsSync(pastaOrigem)) {
            console.error(`Erro: Arquivo JSON não encontrado em "${pastaOrigem}"`); // passa a verificação de existencia do arquivo json
            return;
        }
        const dados = fs.readFileSync(pastaOrigem, 'utf-8');

        const listaArquivos = JSON.parse(dados); // espera que o json seja um array de strings com os caminhos dos arquivos

        if (listaArquivos.length === 0) {
            console.log('Nenhum arquivo para mover.'); // reorna o log caso nao tenha nada dentro do array
            return;
        }
        console.log(`\nCopiando ${listaArquivos.length} arquivos para "${pastaFinal}"...\n`);

        for (const arquivo of listaArquivos) {           //monta o caminho dos Arquivos por completo
            const caminhoOrigem = path.resolve(arquivo);
            const nomeArquivo = path.basename(caminhoOrigem);
            const Destino = path.join(pastaFinal, nomeArquivo);

            if (fs.existsSync(caminhoOrigem)) {
                fs.copyFileSync(caminhoOrigem, Destino); // copia o arquivo pra pasta de destino final
                console.log(`Arquivo copiado: "${nomeArquivo}"`);
            } else {
                console.warn(`Arquivo não encontrado: "${nomeArquivo}"`);
            }
        }

        console.log('\nProcesso concluído!');

    } catch (error) {
        // Adicionado um catch específico para erros de parse do JSON
        if (error instanceof SyntaxError) {
            console.error(`Erro de sintaxe no arquivo JSON: "${pastaOrigem}". Verifique se ele está formatado corretamente.`, error);
        } else {
            console.error('Ocorreu um erro durante a organização:', error);
        }
    }
}

// gerarPastas();