  import { chromium } from 'playwright';
  import fs from 'fs';
  import path from 'path';
  
  async function removeTooltip(page) {
    await page.evaluate(() => {
      function esconderTooltips() {
        const elementos = Array.from(document.querySelectorAll('*')).filter(el => {
          const temTooltipAttr = el.getAttribute('role') === 'tooltip';
          const classTooltip = el.className?.toString().toLowerCase().includes('tooltip');
          const idTooltip = el.id?.toLowerCase().includes('tooltip');
          const ariaTooltip = el.getAttribute('aria-label')?.toLowerCase().includes('tooltip');
  
          return temTooltipAttr || classTooltip || idTooltip || ariaTooltip;
        });
  
        for (const el of elementos) {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          el.style.opacity = '0';
        }
      }
  
      // 1️⃣ Remove os tooltips existentes imediatamente
      esconderTooltips();
  
      // 2️⃣ Observa e remove tooltips que surgirem depois
      const observer = new MutationObserver(() => {
        esconderTooltips();
      });
  
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    });
  }
  
  async function ocultarElementos(page) {
    await page.evaluate(() => {
      const statusBar = document.querySelector('pbi-status-bar');
      const logoBar = document.querySelector('logo-bar');
  
      if (statusBar) statusBar.style.display = 'none';
      if (logoBar) logoBar.style.display = 'none';
    });
  }
  
  async function desocultarElementos(page) {
    await page.evaluate(() => {
      const statusBar = document.querySelector('pbi-status-bar');
      const logoBar = document.querySelector('logo-bar');
  
      if (statusBar) statusBar.style.display = '';
      if (logoBar) logoBar.style.display = '';
    });
  }
  
  export default async function capturarPaginasPowerBI() {
    // URL do Power BI
    const url =
      'https://app.powerbi.com/view?r=eyJrIjoiZjdkZDRmOTQtNmUwMC00MmM5LWFjZmEtYjFiZjA0MjM0ZjJmIiwidCI6ImVkNjkzYWIxLTFhZGQtNDJhMy04NzY1LWJjMjkzYjU4ZmQyMiJ9';
  
    // Pasta para salvar os screenshots
    const pastaDestino = '../screenshots_powerbi';
  
    // Criar pasta se não existir
    if (!fs.existsSync(pastaDestino)) {
      fs.mkdirSync(pastaDestino, { recursive: true });
    }
  
    // Inicializar o browser
    const browser = await chromium.launch({
      headless: false, // Deixe false para ver o processo
      slowMo: 1000, // Adiciona delay entre ações
    });
  
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
  
    const page = await context.newPage();
  
    try {
      console.log('Acessando o Power BI...');
      await page.goto(url, { waitUntil: 'networkidle' });
  
      console.log('Aguardando 15 segundos para carregamento completo...');
      await page.waitForTimeout(15000);
  
      // Aguardar elementos do Power BI carregarem
      await page.waitForSelector(
        'i.glyphicon.glyph-small.pbi-glyph-chevronrightmedium.middleIcon.active',
        { timeout: 10000 }
      );
      await removeTooltip(page);
  
      let paginaAtual = 1;
      let temMaisPaginas = true;
  
      while (temMaisPaginas) {
        console.log(`Capturando página ${paginaAtual}...`);
  
        // Aguardar um pouco para garantir que a página carregou
        await page.waitForTimeout(3000);
        await ocultarElementos(page);
        // Tirar screenshot da página atual
        const nomeArquivo = `pagina_${paginaAtual
          .toString()
          .padStart(2, '0')}.png`;
        const caminhoArquivo = path.join(pastaDestino, nomeArquivo);
  
        await page.screenshot({
          path: caminhoArquivo,
          fullPage: false, // Screenshot apenas da área visível
          clip: { x: 0, y: 0, width: 1920, height: 1080 },
        });
  
        console.log(`Screenshot salvo: ${nomeArquivo}`);
        await desocultarElementos(page);
        // Tentar encontrar e clicar no botão "Próxima página"
        const botaoProximo = await page
          .locator(
            'i.glyphicon.glyph-small.pbi-glyph-chevronrightmedium.middleIcon.active'
          )
          .first();
  
        if (await botaoProximo.isVisible()) {
          // Verificar se o botão não está desabilitado
          const isDisabled = await botaoProximo.getAttribute('disabled');
          const ariaDisabled = await botaoProximo.getAttribute('aria-disabled');
  
          if (isDisabled === null && ariaDisabled !== 'true') {
            await botaoProximo.click();
            console.log('Navegando para próxima página...');
            await page.waitForTimeout(3000); // Aguardar carregamento da próxima página
            paginaAtual++;
          } else {
            console.log('Botão próxima página desabilitado - chegamos ao final');
            temMaisPaginas = false;
          }
        } else {
          // Tentar seletores alternativos para navegação
          const seletoresAlternativos = [
            '.pageNavigation button:last-child',
            '[data-testid="nextPage"]',
            '.right-arrow',
            '.nav-arrow.right',
          ];
  
          let encontrouBotao = false;
          for (const seletor of seletoresAlternativos) {
            const botao = page.locator(seletor);
            if (await botao.isVisible()) {
              const isDisabled = await botao.getAttribute('disabled');
              if (isDisabled === null) {
                await botao.click();
                console.log(
                  `Navegando para próxima página usando seletor: ${seletor}`
                );
                await page.waitForTimeout(3000);
                paginaAtual++;
                encontrouBotao = true;
                break;
              }
            }
          }
  
          if (!encontrouBotao) {
            console.log(
              'Não foi possível encontrar botão de navegação - assumindo página única'
            );
            temMaisPaginas = false;
          }
        }
  
        // Limite de segurança para evitar loop infinito
        if (paginaAtual > 50) {
          console.log('Limite de 50 páginas atingido - parando execução');
          break;
        }
      }
  
      console.log(
        `\nProcesso concluído! Total de ${paginaAtual} página(s) capturada(s).`
      );
      console.log(`Screenshots salvos na pasta: ${pastaDestino}`);
    } catch (error) {
      console.error('Erro durante a execução:', error);
    } finally {
      await browser.close();
    }
  }
  
  // Executar o script
  // capturarPaginasPowerBI().catch(console.error);
  
