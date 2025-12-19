import puppeteer from 'puppeteer';

async function analyzeNetwork() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    const cssRequests = [];
    const jsRequests = [];

    // Monitor network requests
    page.on('response', async (response) => {
      const url = response.url();
      const contentType = response.headers()['content-type'] || '';

      if (contentType.includes('text/css') || url.endsWith('.css')) {
        cssRequests.push({
          url,
          status: response.status(),
          contentType,
          ok: response.ok()
        });
      }

      if (contentType.includes('javascript') || url.endsWith('.js')) {
        jsRequests.push({
          url,
          status: response.status(),
          contentType,
          ok: response.ok()
        });
      }
    });

    const url = 'http://localhost:3000/';
    console.log(`\nNavigating to ${url}...\n`);

    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('='.repeat(80));
    console.log('NETWORK REQUEST ANALYSIS');
    console.log('='.repeat(80));

    console.log(`\nCSS Files (${cssRequests.length} total):`);
    console.log('-'.repeat(80));
    if (cssRequests.length === 0) {
      console.log('No CSS files loaded!');
    } else {
      cssRequests.forEach((req, index) => {
        console.log(`[${index + 1}] ${req.ok ? 'OK' : 'FAILED'} (${req.status})`);
        console.log(`    URL: ${req.url}`);
      });
    }

    console.log(`\n\nChecking for Elite Field CSS:`);
    console.log('-'.repeat(80));
    const eliteFieldCSS = cssRequests.find(req => req.url.includes('elite-field-system.css'));
    if (eliteFieldCSS) {
      console.log('Status: FOUND');
      console.log('URL:', eliteFieldCSS.url);
      console.log('HTTP Status:', eliteFieldCSS.status);
      console.log('Loaded Successfully:', eliteFieldCSS.ok);
    } else {
      console.log('Status: NOT FOUND');
      console.log('The elite-field-system.css file was not requested!');
      console.log('\nThis could mean:');
      console.log('1. The CSS import is missing from layout.tsx');
      console.log('2. The CSS file path is incorrect');
      console.log('3. Next.js is not processing the CSS import');
    }

    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('Error analyzing network:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

analyzeNetwork().catch(console.error);
