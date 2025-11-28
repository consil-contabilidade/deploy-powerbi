import fs from 'fs';
import path from 'path';

const pastaJsonOrigem = path.resolve('./json/images.json');
const pastaDestinoFinal = path.resolve('./screenshots_powerbi');
const caminhoJsonSaida = path.resolve('./json/historico.json');

export default async function gerarPastas() {
  try {
    if (!fs.existsSync(pastaDestinoFinal)) {
      fs.mkdirSync(pastaDestinoFinal, { recursive: true });
    }

    const atual = new Date();
    const year = atual.getFullYear().toString();
    const month = String(atual.getMonth() + 1).padStart(2, '0');
    const day = String(atual.getDate()).padStart(2, '0');

    const pastaDoDia = path.join(pastaDestinoFinal, year, month, day);

    if (!fs.existsSync(pastaDoDia)) {
      fs.mkdirSync(pastaDoDia, { recursive: true });
    }

    if (!fs.existsSync(pastaJsonOrigem)) {
      console.error(
        `Erro: Arquivo de origem JSON não encontrado em "${pastaJsonOrigem}"`
      );
      return;
    }
    const dados = fs.readFileSync(pastaJsonOrigem, 'utf-8');
    const listaArquivos = JSON.parse(dados);

    if (listaArquivos.length === 0) {
      console.log('Nenhum arquivo listado no JSON de origem para copiar.');
    } else {
      for (const arquivo of listaArquivos) {
        const caminhoOrigem = path.resolve(arquivo);
        const nomeArquivo = path.basename(caminhoOrigem);
        const caminhoDestino = path.join(pastaDoDia, nomeArquivo);

        if (fs.existsSync(caminhoOrigem)) {
          fs.copyFileSync(caminhoOrigem, caminhoDestino);
          console.log(`  -> Copiado: "${nomeArquivo}"`);
        }
      }
    }

    const arvoreDeArquivos = fs
      .readdirSync(pastaDestinoFinal, { withFileTypes: true })
      .filter(direntAno => direntAno.isDirectory())
      .map(direntAno => {
        const ano = direntAno.name;
        const caminhoAno = path.join(pastaDestinoFinal, ano);

        const meses = fs
          .readdirSync(caminhoAno, { withFileTypes: true })
          .filter(direntMes => direntMes.isDirectory())
          .map(direntMes => {
            const mes = direntMes.name;
            const caminhoMes = path.join(caminhoAno, mes);

            const dias = fs
              .readdirSync(caminhoMes, { withFileTypes: true })
              .filter(direntDia => direntDia.isDirectory())
              .map(direntDia => {
                const dia = direntDia.name;
                const caminhoDia = path.join(caminhoMes, dia);

                const imagens = fs
                  .readdirSync(caminhoDia)
                  .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
                  .map(file => `pasta_destino/${ano}/${mes}/${dia}/${file}`);
                return { dia, imagens };
              });

            return { mes, dias };
          });

        return { ano, meses };
      });

    const jsonString = JSON.stringify(arvoreDeArquivos, null, 2);

    fs.writeFileSync(caminhoJsonSaida, jsonString);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(
        `Erro de sintaxe no arquivo JSON: "${pastaJsonOrigem}".`,
        error
      );
    } else {
      console.error('Ocorreu um erro inesperado durante a execução:', error);
    }
  }
}
