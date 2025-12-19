import puppeteer from 'puppeteer';

async function analyzeEliteField() {
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

    // Detailed CSS class analysis
    const analysis = await page.evaluate(() => {
      const results = {
        appContainer: null,
        sidebar: null,
        quickbar: null,
        toolbar: null,
        statusbar: null,
        content: null,
        cssVariables: {},
        appliedClasses: [],
        errors: []
      };

      try {
        // Check for app container
        const appContainer = document.querySelector('.elite-app-container');
        if (appContainer) {
          const styles = window.getComputedStyle(appContainer);
          results.appContainer = {
            exists: true,
            display: styles.display,
            gridTemplateAreas: styles.gridTemplateAreas,
            gridTemplateRows: styles.gridTemplateRows,
            gridTemplateColumns: styles.gridTemplateColumns,
            className: appContainer.className
          };
        } else {
          results.errors.push('elite-app-container not found');
        }

        // Check for sidebar
        const sidebar = document.querySelector('.elite-sidebar');
        if (sidebar) {
          const styles = window.getComputedStyle(sidebar);
          results.sidebar = {
            exists: true,
            backgroundColor: styles.backgroundColor,
            gridArea: styles.gridArea,
            borderRight: styles.borderRight,
            display: styles.display,
            className: sidebar.className,
            hasContent: sidebar.innerHTML.length > 0
          };
        } else {
          results.errors.push('elite-sidebar not found');
        }

        // Check for quickbar
        const quickbar = document.querySelector('.elite-quickbar');
        if (quickbar) {
          const styles = window.getComputedStyle(quickbar);
          results.quickbar = {
            exists: true,
            backgroundColor: styles.backgroundColor,
            gridArea: styles.gridArea,
            borderLeft: styles.borderLeft,
            display: styles.display,
            className: quickbar.className,
            hasContent: quickbar.innerHTML.length > 0
          };
        } else {
          results.errors.push('elite-quickbar not found');
        }

        // Check for toolbar
        const toolbar = document.querySelector('.elite-toolbar');
        if (toolbar) {
          const styles = window.getComputedStyle(toolbar);
          results.toolbar = {
            exists: true,
            backgroundColor: styles.backgroundColor,
            gridArea: styles.gridArea,
            borderBottom: styles.borderBottom,
            className: toolbar.className
          };
        } else {
          results.errors.push('elite-toolbar not found');
        }

        // Check for statusbar
        const statusbar = document.querySelector('.elite-statusbar');
        if (statusbar) {
          const styles = window.getComputedStyle(statusbar);
          results.statusbar = {
            exists: true,
            backgroundColor: styles.backgroundColor,
            gridArea: styles.gridArea,
            borderTop: styles.borderTop,
            className: statusbar.className
          };
        } else {
          results.errors.push('elite-statusbar not found');
        }

        // Check for content area
        const content = document.querySelector('.elite-content');
        if (content) {
          const styles = window.getComputedStyle(content);
          results.content = {
            exists: true,
            backgroundColor: styles.backgroundColor,
            gridArea: styles.gridArea,
            className: content.className
          };
        }

        // Get CSS custom properties
        const rootStyles = window.getComputedStyle(document.documentElement);
        results.cssVariables = {
          sidebarBg: rootStyles.getPropertyValue('--elite-sidebar-bg').trim(),
          toolbarBg: rootStyles.getPropertyValue('--elite-toolbar-bg').trim(),
          contentBg: rootStyles.getPropertyValue('--elite-content-bg').trim(),
          primary: rootStyles.getPropertyValue('--elite-primary').trim()
        };

        // Get all elements with elite- classes
        const eliteElements = document.querySelectorAll('[class*="elite-"]');
        results.appliedClasses = Array.from(new Set(
          Array.from(eliteElements).flatMap(el =>
            Array.from(el.classList).filter(cls => cls.startsWith('elite-'))
          )
        )).sort();

      } catch (error) {
        results.errors.push(error.message);
      }

      return results;
    });

    console.log('='.repeat(80));
    console.log('ELITE FIELD CSS ARCHITECTURE ANALYSIS');
    console.log('='.repeat(80));

    console.log('\n1. CSS CUSTOM PROPERTIES (Design Tokens)');
    console.log('-'.repeat(80));
    console.log('Sidebar Background:', analysis.cssVariables.sidebarBg || 'NOT SET');
    console.log('Toolbar Background:', analysis.cssVariables.toolbarBg || 'NOT SET');
    console.log('Content Background:', analysis.cssVariables.contentBg || 'NOT SET');
    console.log('Primary Color:', analysis.cssVariables.primary || 'NOT SET');

    console.log('\n2. APP CONTAINER');
    console.log('-'.repeat(80));
    if (analysis.appContainer) {
      console.log('Status: FOUND');
      console.log('Class:', analysis.appContainer.className);
      console.log('Display:', analysis.appContainer.display);
      console.log('Grid Template Areas:', analysis.appContainer.gridTemplateAreas);
      console.log('Grid Template Rows:', analysis.appContainer.gridTemplateRows);
      console.log('Grid Template Columns:', analysis.appContainer.gridTemplateColumns);
    } else {
      console.log('Status: NOT FOUND');
    }

    console.log('\n3. LEFT SIDEBAR');
    console.log('-'.repeat(80));
    if (analysis.sidebar) {
      console.log('Status: FOUND');
      console.log('Class:', analysis.sidebar.className);
      console.log('Background Color:', analysis.sidebar.backgroundColor);
      console.log('Grid Area:', analysis.sidebar.gridArea);
      console.log('Border Right:', analysis.sidebar.borderRight);
      console.log('Display:', analysis.sidebar.display);
      console.log('Has Content:', analysis.sidebar.hasContent);
    } else {
      console.log('Status: NOT FOUND');
    }

    console.log('\n4. RIGHT QUICKBAR');
    console.log('-'.repeat(80));
    if (analysis.quickbar) {
      console.log('Status: FOUND');
      console.log('Class:', analysis.quickbar.className);
      console.log('Background Color:', analysis.quickbar.backgroundColor);
      console.log('Grid Area:', analysis.quickbar.gridArea);
      console.log('Border Left:', analysis.quickbar.borderLeft);
      console.log('Display:', analysis.quickbar.display);
      console.log('Has Content:', analysis.quickbar.hasContent);
    } else {
      console.log('Status: NOT FOUND');
    }

    console.log('\n5. TOP TOOLBAR');
    console.log('-'.repeat(80));
    if (analysis.toolbar) {
      console.log('Status: FOUND');
      console.log('Class:', analysis.toolbar.className);
      console.log('Background Color:', analysis.toolbar.backgroundColor);
      console.log('Grid Area:', analysis.toolbar.gridArea);
      console.log('Border Bottom:', analysis.toolbar.borderBottom);
    } else {
      console.log('Status: NOT FOUND');
    }

    console.log('\n6. BOTTOM STATUSBAR');
    console.log('-'.repeat(80));
    if (analysis.statusbar) {
      console.log('Status: FOUND');
      console.log('Class:', analysis.statusbar.className);
      console.log('Background Color:', analysis.statusbar.backgroundColor);
      console.log('Grid Area:', analysis.statusbar.gridArea);
      console.log('Border Top:', analysis.statusbar.borderTop);
    } else {
      console.log('Status: NOT FOUND');
    }

    console.log('\n7. CONTENT AREA');
    console.log('-'.repeat(80));
    if (analysis.content) {
      console.log('Status: FOUND');
      console.log('Class:', analysis.content.className);
      console.log('Background Color:', analysis.content.backgroundColor);
      console.log('Grid Area:', analysis.content.gridArea);
    } else {
      console.log('Status: NOT FOUND');
    }

    console.log('\n8. ALL APPLIED ELITE CLASSES');
    console.log('-'.repeat(80));
    console.log(analysis.appliedClasses.join(', '));

    console.log('\n9. ERRORS');
    console.log('-'.repeat(80));
    if (analysis.errors.length > 0) {
      analysis.errors.forEach(error => console.log('- ' + error));
    } else {
      console.log('No errors detected');
    }

    console.log('\n' + '='.repeat(80));
    console.log('Analysis complete!');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('Error analyzing page:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

analyzeEliteField().catch(console.error);
