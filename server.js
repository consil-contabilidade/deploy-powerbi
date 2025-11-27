// server.js - VERSÃO CORRIGIDA

// const express = require('express');
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export default async function Server() {


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// CORREÇÃO 1: Nome da variável padronizado para 'destinoPath'
const destinoPath = path.join(__dirname, 'pasta_destino');

// Serve os arquivos estáticos (index.html, css, etc.)
app.use(express.static(path.join(__dirname)));

// Endpoint para obter a árvore de diretórios (ANO/MÊS/DIA)
app.get('/api/tree', (req, res) => {
  console.log("\nRecebida uma requisição em /api/tree");
  try {
    // CORREÇÃO 1: Usando a variável correta 'destinoPath'
    if (!fs.existsSync(destinoPath)) {
      console.error(`ERRO: A pasta de destino "${destinoPath}" não foi encontrada!`);
      return res.status(500).json({ error: `Diretório base não encontrado: ${destinoPath}` });
    }

    console.log(`Lendo diretórios a partir de: ${destinoPath}`);

    // CORREÇÃO 2: Lógica completa para ler a árvore de pastas
    const anos = fs.readdirSync(destinoPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory()) // Pega apenas as pastas (anos)
      .map(direntAno => {
        const ano = direntAno.name;
        const caminhoAno = path.join(destinoPath, ano);

        const meses = fs.readdirSync(caminhoAno, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory()) // Pega apenas as pastas (meses)
          .map(direntMes => {
            const mes = direntMes.name;
            const caminhoMes = path.join(caminhoAno, mes);

            const dias = fs.readdirSync(caminhoMes, { withFileTypes: true })
              .filter(dirent => dirent.isDirectory()) // Pega apenas as pastas (dias)
              .map(direntDia => direntDia.name); // Pega apenas o nome do dia

            return { mes, dias };
          });

        return { ano, meses };
      });

    console.log("Estrutura de pastas encontrada:", JSON.stringify(anos, null, 2));
    res.json(anos);

  } catch (error) {
    console.error("Erro detalhado ao ler a árvore de diretórios:", error);
    res.status(500).json({ error: 'Erro ao ler os arquivos.' });
  }
});

// Endpoint para obter as imagens de uma data específica
app.get('/api/images', (req, res) => {
  const { ano, mes, dia } = req.query;
  if (!ano || !mes || !dia) {
    return res.status(400).json({ error: 'Parâmetros ano, mes e dia são obrigatórios' });
  }

  // CORREÇÃO 1: Usando a variável correta 'destinoPath'
  const pastePath = path.join(destinoPath, ano, mes, dia);
  try {
    const images = fs.readdirSync(pastePath)
      .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map(file => path.join('pasta_destino', ano, mes, dia, file).replace(/\\/g, '/'));
    res.json(images);
  } catch (error) {
    res.status(404).json({ error: 'Erro ao ler as imagens do diretório' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

}
