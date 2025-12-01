import printScreenPlaywright from './js/printScreen-playwright.js';
import checkImageSize from './js/checkImageSize.js';
import delay from './js/delay.js';
import gitPush from './js/gitPush.js';
import updateDateJSON from './js/updateDateJSON.js'
import gerarPastas from './js/organizaHistorico.js';

async function init() {
  try {
    await printScreenPlaywright();
    await delay(300);
    await checkImageSize();
    await updateDateJSON();
    await gerarPastas();
    await delay(500);
    await delay(500);
    await gitPush();
  } catch (error) {
    console.log(error)
  }
}

init();
