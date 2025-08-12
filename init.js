import printScreenPlaywright from './js/printScreen-playwright.js';
import checkImageSize from './js/checkImageSize.js';
import delay from './js/delay.js';
import gitPush from './js/gitPush.js';

async function init() {
  try {
    console.log('iniciou');
    await printScreenPlaywright();
    console.log('rodou o printscreen');
    await delay(300);
    console.log('esperou 300ms');
    await checkImageSize();
    console.log('Alterou o json');
    await delay(500);
    await gitPush();
    console.log('Fez o push');

  } catch (error) {
    console.log(error)
  }
}

init();
