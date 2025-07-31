import { test } from '@playwright/test';

test('capture mobile layout screenshots', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
  });
  
  const page = await context.newPage();
  await page.goto('http://localhost:8080');
  
  // Wait for images to load
  await page.waitForLoadState('networkidle');
  
  // Take initial viewport screenshot
  await page.screenshot({ 
    path: 'mobile-initial-view.png',
    fullPage: false 
  });
  
  console.log('✓ Captured initial mobile view');
  
  // Scroll to middle section
  await page.locator('.scroll-container').evaluate(el => el.scrollLeft = 400);
  await page.waitForTimeout(500);
  
  await page.screenshot({ 
    path: 'mobile-middle-view.png',
    fullPage: false 
  });
  
  console.log('✓ Captured middle section');
  
  // Scroll to end
  await page.locator('.scroll-container').evaluate(el => el.scrollLeft = 900);
  await page.waitForTimeout(500);
  
  await page.screenshot({ 
    path: 'mobile-end-view.png',
    fullPage: false 
  });
  
  console.log('✓ Captured end section');
  
  await context.close();
});