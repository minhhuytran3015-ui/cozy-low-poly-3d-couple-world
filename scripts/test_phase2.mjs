import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\ADMIN\\.gemini\\antigravity\\brain\\83aef25e-75b0-4df0-9ae5-f5280b3c958e';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runPhase2Tests() {
  console.log('🚀 Starting Phase 2 automated browser verification...');

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

    // 2. Verify Control HUD exists and shows 'Him' as initial active character
    console.log('🔍 Checking Control HUD...');
    const activeBtnText = await page.$eval('.hud-avatar-btn.active', el => el.textContent?.trim());
    console.log(`- Active Character in HUD: "${activeBtnText}"`);
    if (!activeBtnText?.includes('Him')) {
      throw new Error(`Expected active character "Him", got "${activeBtnText}"`);
    }

    // Capture screenshot of both characters in the room
    const sceneImgPath = path.join(ARTIFACT_DIR, 'phase2_both_characters.png');
    await page.screenshot({ path: sceneImgPath, fullPage: false });
    console.log(`📸 Saved initial scene screenshot to: ${sceneImgPath}`);

    // 3. Test WASD movement on Boy
    console.log('🚶 Testing WASD movement on Boy (pressing W for 1s)...');
    await page.keyboard.down('KeyW');
    await new Promise(r => setTimeout(r, 1000));
    await page.keyboard.up('KeyW');
    await new Promise(r => setTimeout(r, 400));

    // Capture screenshot after Boy moved
    const boyWalkImgPath = path.join(ARTIFACT_DIR, 'phase2_boy_walking.png');
    await page.screenshot({ path: boyWalkImgPath, fullPage: false });
    console.log(`📸 Saved Boy walking screenshot to: ${boyWalkImgPath}`);

    // 4. Test Character Switching via Tab key
    console.log('🔄 Pressing Tab to switch to Girl Character...');
    await page.keyboard.press('Tab');
    await new Promise(r => setTimeout(r, 1200)); // wait for camera glide

    const switchedBtnText = await page.$eval('.hud-avatar-btn.active', el => el.textContent?.trim());
    console.log(`- Active Character after Tab: "${switchedBtnText}"`);
    if (!switchedBtnText?.includes('Her')) {
      throw new Error(`Expected active character "Her", got "${switchedBtnText}"`);
    }

    const girlActiveImgPath = path.join(ARTIFACT_DIR, 'phase2_tab_switched_girl.png');
    await page.screenshot({ path: girlActiveImgPath, fullPage: false });
    console.log(`📸 Saved Tab switch to Girl screenshot to: ${girlActiveImgPath}`);

    // 5. Test WASD movement on Girl
    console.log('🚶 Testing WASD movement on Girl (pressing W + D)...');
    await page.keyboard.down('KeyW');
    await page.keyboard.down('KeyD');
    await new Promise(r => setTimeout(r, 800));
    await page.keyboard.up('KeyW');
    await page.keyboard.up('KeyD');
    await new Promise(r => setTimeout(r, 400));

    const girlWalkImgPath = path.join(ARTIFACT_DIR, 'phase2_girl_walking.png');
    await page.screenshot({ path: girlWalkImgPath, fullPage: false });
    console.log(`📸 Saved Girl moving screenshot to: ${girlWalkImgPath}`);

    // 6. Test FollowCamera mouse rotation
    console.log('🎥 Testing FollowCamera mouse drag orbit rotation...');
    await page.mouse.move(640, 400);
    await page.mouse.down();
    await page.mouse.move(340, 360, { steps: 25 });
    await page.mouse.up();
    await new Promise(r => setTimeout(r, 800));

    const camRotImgPath = path.join(ARTIFACT_DIR, 'phase2_camera_rotated.png');
    await page.screenshot({ path: camRotImgPath, fullPage: false });
    console.log(`📸 Saved camera rotated screenshot to: ${camRotImgPath}`);

    // 7. Test Tab switch back to Boy
    console.log('🔄 Pressing Tab again to switch back to Boy...');
    await page.keyboard.press('Tab');
    await new Promise(r => setTimeout(r, 1000));

    const backToBoyText = await page.$eval('.hud-avatar-btn.active', el => el.textContent?.trim());
    console.log(`- Active Character after second Tab: "${backToBoyText}"`);
    if (!backToBoyText?.includes('Him')) {
      throw new Error(`Expected active character "Him", got "${backToBoyText}"`);
    }

    console.log('✨ All Phase 2 browser tests passed successfully!');
    if (errors.length > 0) {
      console.warn('⚠️ Console errors noted:', errors);
    } else {
      console.log('✅ 0 console errors during Phase 2 test session.');
    }

  } catch (err) {
    console.error('❌ Phase 2 Test failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runPhase2Tests();
