import checkImageSize from './js/checkImageSize.js';
import printScreenPlaywright from './js/printScreen-playwright.js';
import delay from './js/delay.js';
import gitPush from './js/gitPush.js';

async function init() {
  try {
    await printScreenPlaywright();
    await delay(300);
    await checkImageSize();
    await delay(500);
    await gitPush();
  } catch (error) {}
}

init();
