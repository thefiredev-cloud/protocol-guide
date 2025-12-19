import puppeteer from 'puppeteer';

async function checkCSSLoading() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    const url = 'http://localhost:3000/';
    console.log(`\nNavigating to ${url}...\n`);

    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    const cssInfo = await page.evaluate(() => {
      const results = {
        stylesheets: [],
        eliteFieldSystemCSS: null,
        totalStylesheets: 0
      };

      // Get all stylesheets
      const sheets = Array.from(document.styleSheets);
      results.totalStylesheets = sheets.length;

      sheets.forEach((sheet, index) => {
        try {
          const href = sheet.href || 'inline';
          const rulesCount = sheet.cssRules ? sheet.cssRules.length : 0;

          results.stylesheets.push({
            index,
            href,
            rulesCount,
            disabled: sheet.disabled
          });

          // Check if this is the elite-field-system.css
          if (href.includes('elite-field-system.css')) {
            results.eliteFieldSystemCSS = {
              href,
              rulesCount,
              disabled: sheet.disabled,
              loaded: true
            };
          }
        } catch (error) {
          results.stylesheets.push({
            index,
            error: 'CORS or access error: ' + error.message
          });
        }
      });

      return results;
    });

    console.log('='.repeat(80));
    console.log('CSS LOADING ANALYSIS');
    console.log('='.repeat(80));
    console.log(`\nTotal stylesheets loaded: ${cssInfo.totalStylesheets}\n`);

    console.log('All Stylesheets:');
    console.log('-'.repeat(80));
    cssInfo.stylesheets.forEach(sheet => {
      if (sheet.error) {
        console.log(`[${sheet.index}] ERROR: ${sheet.error}`);
      } else {
        console.log(`[${sheet.index}] ${sheet.href}`);
        console.log(`      Rules: ${sheet.rulesCount}, Disabled: ${sheet.disabled}`);
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('Elite Field System CSS:');
    console.log('-'.repeat(80));
    if (cssInfo.eliteFieldSystemCSS) {
      console.log('Status: LOADED');
      console.log('URL:', cssInfo.eliteFieldSystemCSS.href);
      console.log('Rules:', cssInfo.eliteFieldSystemCSS.rulesCount);
      console.log('Disabled:', cssInfo.eliteFieldSystemCSS.disabled);
    } else {
      console.log('Status: NOT FOUND');
      console.log('The elite-field-system.css file is not being loaded!');
    }
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('Error checking CSS:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

checkCSSLoading().catch(console.error);
