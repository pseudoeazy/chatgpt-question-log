import puppeteer, { Browser, Page } from 'puppeteer';
import path from 'path';

describe('Chrome Extension E2E Tests', () => {
  let browser: Browser;
  let page: Page;
  const extensionPath = path.resolve(__dirname, '../dist'); // Adjust to your extension's output directory

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false, // Extensions cannot be tested in headless mode
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });

    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('Check if the extension popup opens', async () => {
    const extensionID = 'ddipnjlalocaeaijlokibgcniefdjifp'; // Replace with actual extension ID after manual installation
    const extensionURL = `chrome-extension://${extensionID}/popup.html`;

    await page.goto(extensionURL);
    await page.waitForSelector('body');

    const title = await page.title();
    console.log('Popup Title:', title);

    expect(title).toBe('Your Extension Title'); // Adjust this to match your actual popup title
  });

  test('Interact with the extension popup', async () => {
    await page.click('#your-button'); // Adjust the selector
    const resultText = await page.$eval('#output', (el) => el.textContent);

    expect(resultText).toContain('Expected Output');
  });
});
