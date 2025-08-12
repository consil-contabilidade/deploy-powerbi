import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function checkImageSize() {
  const folder = path.join(__dirname, '../screenshots_powerbi');
  const outputFile = path.join(__dirname, '../json/images.json');
  const minSize = 100 * 1024; // 100 KB

  try {
    const files = fs
      .readdirSync(folder)
      .filter(file => {
        const filePath = path.join(folder, file);
        const stats = fs.statSync(filePath);
        const ext = path.extname(file).toLowerCase();
        return (
          stats.size > minSize &&
          ['.png', '.jpg', '.jpeg', '.gif'].includes(ext)
        );
      })
      .map(file => `screenshots_powerbi/${file}`);

    fs.writeFileSync(outputFile, JSON.stringify(files, null, 2), 'utf-8');
    console.log(
      `✅ Lista de imagens gerada em ${outputFile} com ${files.length} arquivos.`
    );
  } catch (err) {
    console.error('❌ Erro ao gerar lista de imagens:', err);
  }
}
