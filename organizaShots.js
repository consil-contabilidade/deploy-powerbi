import fs from 'fs';
import path from 'path';

// --- CONFIGURAÇÃO DE CAMINHOS ---
const pastaJsonOrigem = path.resolve('./json/images.json');
const pastaDestinoFinal = path.resolve('./pasta_destino');
const caminhoJsonSaida = path.resolve('./json/tree.json');

// FUNÇÃO PRINCIPAL
export default async function gerarPastas() {
    try {
        // ETAPA 1: COPIAR ARQUIVOS PARA AS PASTAS
        console.log('Etapa 1: Organização de Arquivos');

        if (!fs.existsSync(pastaDestinoFinal)) {
            console.log(`Pasta de destino "${pastaDestinoFinal}" não encontrada. Criando...`);
            fs.mkdirSync(pastaDestinoFinal, { recursive: true });
        }

        const atual = new Date();
        const year = atual.getFullYear().toString();
        const month = String(atual.getMonth() + 1).padStart(2, '0');
        const day = String(atual.getDate()).padStart(2, '0');

        const pastaDoDia = path.join(pastaDestinoFinal, year, month, day);

        if (!fs.existsSync(pastaDoDia)) {
            fs.mkdirSync(pastaDoDia, { recursive: true });
            console.log(`Estrutura criada em: "${pastaDoDia}"`);
        }

        if (!fs.existsSync(pastaJsonOrigem)) {
            console.error(`Erro: Arquivo de origem JSON não encontrado em "${pastaJsonOrigem}"`);
            return;
        }
        const dados = fs.readFileSync(pastaJsonOrigem, 'utf-8');
        const listaArquivos = JSON.parse(dados);

        if (listaArquivos.length === 0) {
            console.log('Nenhum arquivo listado no JSON de origem para copiar.');
        } else {
            console.log(`\nCopiando ${listaArquivos.length} arquivos para "${pastaDoDia}"...`);
            for (const arquivo of listaArquivos) {
                const caminhoOrigem = path.resolve(arquivo);
                const nomeArquivo = path.basename(caminhoOrigem);
                const caminhoDestino = path.join(pastaDoDia, nomeArquivo);

                if (fs.existsSync(caminhoOrigem)) {
                    fs.copyFileSync(caminhoOrigem, caminhoDestino);
                    console.log(`  -> Copiado: "${nomeArquivo}"`);
                } else {
                    console.warn(`  -> AVISO: Arquivo não encontrado na origem: "${caminhoOrigem}"`);
                }
            }
        }

        // ETAPA 2: Atualização do arquivo tree.json
        console.log('Etapa 2: Atualização do arquivo tree.json');

        if (!fs.existsSync(pastaDestinoFinal)) {
            console.log('Pasta de destino não existe. Não é possível gerar o JSON.');
            return;
        }

        // Ler a estrutura de diretórios e transformá-la em um objeto.
        const arvoreDeArquivos = fs.readdirSync(pastaDestinoFinal, { withFileTypes: true })
            .filter(direntAno => direntAno.isDirectory()) // Pega apenas as pastas de ano
            .map(direntAno => {
                const ano = direntAno.name;
                const caminhoAno = path.join(pastaDestinoFinal, ano);

                const meses = fs.readdirSync(caminhoAno, { withFileTypes: true })
                    .filter(direntMes => direntMes.isDirectory()) // Pega apenas as pastas de mês
                    .map(direntMes => {
                        const mes = direntMes.name;
                        const caminhoMes = path.join(caminhoAno, mes);

                        const dias = fs.readdirSync(caminhoMes, { withFileTypes: true })
                            .filter(direntDia => direntDia.isDirectory()) // Pega apenas as pastas de dia
                            .map(direntDia => {
                                const dia = direntDia.name;
                                const caminhoDia = path.join(caminhoMes, dia);

                                // Lê as imagens dentro da pasta do dia
                                const imagens = fs.readdirSync(caminhoDia)
                                    .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
                                    .map(file => `pasta_destino/${ano}/${mes}/${dia}/${file}`); // Cria o caminho relativo para a URL

                                return { dia, imagens };
                            });

                        return { mes, dias };
                    });

                return { ano, meses };
            });

        // Converte o objeto JavaScript para uma string em formato JSON, com indentação para facilitar a leitura
        const jsonString = JSON.stringify(arvoreDeArquivos, null, 2);

        // Salva a string JSON no arquivo tree.json
        fs.writeFileSync(caminhoJsonSaida, jsonString);

        console.log(`✅ Arquivo history.json atualizado com sucesso!`);

    } catch (error) {
        if (error instanceof SyntaxError) {
            console.error(`Erro de sintaxe no arquivo JSON: "${pastaJsonOrigem}".`, error);
        } else {
            console.error('Ocorreu um erro inesperado durante a execução:', error);
        }
    }
}

gerarPastas();
