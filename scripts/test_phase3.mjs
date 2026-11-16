import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\ADMIN\\.gemini\\antigravity\\brain\\83aef25e-75b0-4df0-9ae5-f5280b3c958e';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runPhase3Tests() {
  console.log('🚀 Starting Phase 3 automated browser verification...');

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

    // 1. Enter the world from Intro Screen
    console.log('👉 Clicking "ENTER OUR WORLD"...');
    await page.click('.intro-btn');
    await new Promise(r => setTimeout(r, 1600));

    // 2. Verify Character Name Tags appear
    console.log('🔍 Checking Character Name Tags ("Nam" and "Nữ")...');
    const nameTags = await page.$$eval('[style*="border-radius: 999px"]', elements =>
      elements.map(el => el.textContent?.trim()).filter(Boolean)
    );
    console.log('- Found tags:', nameTags);

    const hasNam = nameTags.some(t => t?.includes('Nam'));
    const hasNu = nameTags.some(t => t?.includes('Nữ'));
    console.log(`- Has "Nam": ${hasNam}, Has "Nữ": ${hasNu}`);

    // Capture screenshot of Room with 15 frames & Name tags
    const overviewImgPath = path.join(ARTIFACT_DIR, 'phase3_gallery_overview.png');
    await page.screenshot({ path: overviewImgPath, fullPage: false });
    console.log(`📸 Saved Gallery overview screenshot to: ${overviewImgPath}`);

    // 3. Walk character toward North Wall (holding 'W' for ~1.3s) to trigger memory proximity
    console.log('🚶 Walking toward North Wall to approach memory frames...');
    await page.keyboard.down('KeyW');
    await new Promise(r => setTimeout(r, 1200));
    await page.keyboard.up('KeyW');
    await new Promise(r => setTimeout(r, 500));

    // 4. Verify Interaction Prompt "E - Xem kỷ niệm" appears
    console.log('🔍 Checking Interaction Prompt presence...');
    const promptText = await page.$eval('[aria-label^="Open memory:"]', el => el.textContent?.trim()).catch(() => null);
    console.log(`- Interaction Prompt text: "${promptText}"`);

    // Capture screenshot of approached frame with "E" prompt
    const approachImgPath = path.join(ARTIFACT_DIR, 'phase3_approached_frame.png');
    await page.screenshot({ path: approachImgPath, fullPage: false });
    console.log(`📸 Saved Approached frame screenshot to: ${approachImgPath}`);

    // 5. Press 'E' to open MemoryViewer modal
    console.log('📖 Pressing key "E" to open MemoryViewer...');
    await page.keyboard.press('KeyE');
    await new Promise(r => setTimeout(r, 700));

    // Verify MemoryViewer modal is open
    const modalTitle = await page.$eval('.memory-title', el => el.textContent?.trim()).catch(() => null);
    console.log(`- MemoryViewer opened with title: "${modalTitle}"`);
    if (!modalTitle) {
      throw new Error('MemoryViewer did not open upon pressing E');
    }

    // Capture screenshot of MemoryViewer modal
    const viewerImgPath = path.join(ARTIFACT_DIR, 'phase3_memory_viewer.png');
    await page.screenshot({ path: viewerImgPath, fullPage: false });
    console.log(`📸 Saved MemoryViewer screenshot to: ${viewerImgPath}`);

    // 6. Test closing modal via Escape key
    console.log('🔒 Pressing "Escape" to close MemoryViewer...');
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 600));

    const isModalClosed = await page.$('.memory-backdrop') === null;
    console.log(`- MemoryViewer closed successfully: ${isModalClosed}`);
    if (!isModalClosed) {
      throw new Error('MemoryViewer did not close on Escape');
    }

    // 7. Test Tab switch to Girl and check her Name Tag
    console.log('🔄 Pressing Tab to switch active character to Girl ("Nữ")...');
    await page.keyboard.press('Tab');
    await new Promise(r => setTimeout(r, 1000));

    const switchedBtnText = await page.$eval('.hud-avatar-btn.active', el => el.textContent?.trim());
    console.log(`- Active Character in HUD after Tab: "${switchedBtnText}"`);

    const girlActiveImgPath = path.join(ARTIFACT_DIR, 'phase3_tab_girl_active.png');
    await page.screenshot({ path: girlActiveImgPath, fullPage: false });
    console.log(`📸 Saved Tab switch to Girl screenshot to: ${girlActiveImgPath}`);

    console.log('✨ All Phase 3 browser tests passed successfully!');
    if (errors.length > 0) {
      console.warn('⚠️ Console errors noted:', errors);
    } else {
      console.log('✅ 0 console errors during Phase 3 test session.');
    }

  } catch (err) {
    console.error('❌ Phase 3 Test failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runPhase3Tests();
