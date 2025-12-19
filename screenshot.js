const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Set viewport to 1280x900
  await page.setViewport({ width: 1280, height: 900 });

  // Navigate to localhost:3000
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
  } catch (error) {
    console.error('Navigation error:', error.message);
    await browser.close();
    process.exit(1);
  }

  // Create screenshots directory if it doesn't exist
  const screenshotDir = '/Users/tanner-osterkamp/Medic-Bot/screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  // Take screenshot
  const screenshotPath = path.join(screenshotDir, 'elite-field-chat-input-fixed.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`Screenshot saved to: ${screenshotPath}`);

  // Inspect the chat input textarea element
  const textareaInfo = await page.evaluate(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const styles = window.getComputedStyle(textarea);
      return {
        exists: true,
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        className: textarea.className,
        id: textarea.id,
        placeholder: textarea.placeholder,
        width: styles.width,
        height: styles.height
      };
    }
    return { exists: false, message: 'No textarea found' };
  });

  console.log('\n=== Chat Input Textarea Analysis ===');
  console.log(JSON.stringify(textareaInfo, null, 2));

  await browser.close();
})();
