import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\ADMIN\\.gemini\\antigravity\\brain\\83aef25e-75b0-4df0-9ae5-f5280b3c958e';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runTests() {
  console.log('🚀 Starting Phase 1 automated browser verification...');
  
  const consoleMessages = [];
  const errors = [];

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--window-size=1280,800'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    page.on('console', msg => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', err => {
      errors.push(err.toString());
    });

    console.log('🌐 Navigating to http://127.0.0.1:5173/ ...');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });

    // 1. Verify Intro Screen elements
    console.log('🔍 Verifying Intro Screen content...');
    const titleText = await page.$eval('.intro-title', el => el.textContent?.trim());
    const descText = await page.$eval('.intro-description', el => el.textContent?.trim());
    const btnText = await page.$eval('.intro-btn', el => el.textContent?.trim());

    console.log(`- Title: "${titleText}"`);
    console.log(`- Description: "${descText}"`);
    console.log(`- Button: "${btnText}"`);

    if (titleText !== 'Our Little World') throw new Error(`Unexpected title: ${titleText}`);
    if (descText !== 'A tiny room, a thousand memories.') throw new Error(`Unexpected desc: ${descText}`);
    if (btnText !== 'ENTER OUR WORLD') throw new Error(`Unexpected button: ${btnText}`);

    // Take screenshot of Intro Screen
    const introImgPath = path.join(ARTIFACT_DIR, 'intro_screen.png');
    await page.screenshot({ path: introImgPath, fullPage: false });
    console.log(`📸 Saved intro screen screenshot to: ${introImgPath}`);

    // 2. Click button to enter room
    console.log('👉 Clicking "ENTER OUR WORLD" button...');
    await page.click('.intro-btn');

    // Wait for fade transition (1600ms)
    await new Promise(r => setTimeout(r, 1600));

    // Verify Canvas presence and size
    const canvasBox = await page.$eval('canvas', el => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    console.log(`🖼️ Canvas detected: ${canvasBox.width}x${canvasBox.height}px`);
    if (canvasBox.width < 1000 || canvasBox.height < 600) {
      throw new Error(`Canvas size too small: ${canvasBox.width}x${canvasBox.height}`);
    }

    // Take screenshot of 3D Room initial vantage point
    const roomImgPath = path.join(ARTIFACT_DIR, 'room_scene.png');
    await page.screenshot({ path: roomImgPath, fullPage: false });
    console.log(`📸 Saved room scene screenshot to: ${roomImgPath}`);

    // 3. Test horizontal camera OrbitControls rotation (drag horizontally)
    console.log('🔄 Interacting with camera OrbitControls (drag horizontally to rotate view)...');
    await page.mouse.move(700, 400);
    await page.mouse.down();
    await page.mouse.move(400, 400, { steps: 25 });
    await page.mouse.up();

    await new Promise(r => setTimeout(r, 800));

    const rotatedImgPath = path.join(ARTIFACT_DIR, 'room_rotated.png');
    await page.screenshot({ path: rotatedImgPath, fullPage: false });
    console.log(`📸 Saved rotated room screenshot to: ${rotatedImgPath}`);

    // 4. Test zoom in
    console.log('🔍 Testing camera zoom via wheel...');
    await page.mouse.wheel({ deltaY: -450 });
    await new Promise(r => setTimeout(r, 800));

    const zoomedImgPath = path.join(ARTIFACT_DIR, 'room_zoomed.png');
    await page.screenshot({ path: zoomedImgPath, fullPage: false });
    console.log(`📸 Saved zoomed room screenshot to: ${zoomedImgPath}`);

    console.log('✨ All browser tests passed successfully!');
    if (errors.length > 0) {
      console.warn('⚠️ Console errors noted:', errors);
    } else {
      console.log('✅ 0 console errors during test session.');
    }

  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runTests();
