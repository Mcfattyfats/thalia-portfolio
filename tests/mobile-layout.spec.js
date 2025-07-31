import { test, expect } from '@playwright/test';

test.describe('Mobile Layout Optimization', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:8080');
  });

  test('should have correct mobile styles applied', async ({ page }) => {
    // Check content wrapper width
    const contentWrapper = page.locator('.content-wrapper');
    await expect(contentWrapper).toHaveCSS('width', '1125px'); // 300vw on 375px viewport

    // Check main title position
    const mainTitle = page.locator('.main-title');
    await expect(mainTitle).toHaveCSS('left', '75px'); // 20vw on 375px viewport
    
    // Check image 1 mobile styles
    const image1 = page.locator('.image-1');
    await expect(image1).toHaveCSS('width', '140px');
    await expect(image1).toHaveCSS('height', '180px');
    await expect(image1).toHaveCSS('left', '18.75px'); // 5vw on 375px viewport
    
    // Check image 2 mobile styles
    const image2 = page.locator('.image-2');
    await expect(image2).toHaveCSS('width', '150px');
    await expect(image2).toHaveCSS('height', '200px');
    await expect(image2).toHaveCSS('left', '187.5px'); // 50vw on 375px viewport
    
    // Check image 8 mobile styles
    const image8 = page.locator('.image-8');
    await expect(image8).toHaveCSS('width', '140px');
    await expect(image8).toHaveCSS('height', '180px');
    await expect(image8).toHaveCSS('left', '825px'); // 220vw on 375px viewport
  });

  test('should have proper image positioning on mobile', async ({ page }) => {
    // Check that images don't have transform scale applied
    const imageContainer = page.locator('.image-container').first();
    const transform = await imageContainer.evaluate(el => 
      window.getComputedStyle(el).transform
    );
    // matrix(1, 0, 0, 1, 0, 0) is equivalent to 'none' - identity matrix
    expect(transform).toMatch(/^(none|matrix\(1,\s*0,\s*0,\s*1,\s*0,\s*0\))$/);
    
    // Verify specific image positions
    const imagePositions = [
      { selector: '.image-1', bottom: '15%' },
      { selector: '.image-2', top: '10%' },
      { selector: '.image-3', top: '25%' },
      { selector: '.image-4', top: '40%' },
      { selector: '.image-5', bottom: '20%' },
      { selector: '.image-6', top: '15%' },
      { selector: '.image-7', bottom: '10%' },
      { selector: '.image-8', bottom: '25%' }
    ];
    
    for (const { selector, top, bottom } of imagePositions) {
      const element = page.locator(selector);
      if (top) {
        const topValue = await element.evaluate(el => 
          window.getComputedStyle(el).top
        );
        expect(parseFloat(topValue)).toBeCloseTo(667 * parseFloat(top) / 100, 1);
      }
      if (bottom) {
        const bottomValue = await element.evaluate(el => 
          window.getComputedStyle(el).bottom
        );
        expect(parseFloat(bottomValue)).toBeCloseTo(667 * parseFloat(bottom) / 100, 1);
      }
    }
  });

  test('should display images in mobile viewport', async ({ page }, testInfo) => {
    // Take screenshot of initial mobile view
    await page.screenshot({ 
      path: 'tests/screenshots/mobile-initial-view.png',
      fullPage: false 
    });
    
    // Check that at least some images are visible in initial viewport
    const visibleImages = await page.locator('.image-container').evaluateAll(images => 
      images.filter(img => {
        const rect = img.getBoundingClientRect();
        return rect.left < 375 && rect.right > 0;
      }).length
    );
    
    expect(visibleImages).toBeGreaterThan(0);
    console.log(`${visibleImages} images visible in initial mobile viewport`);
    
    // Scroll to see more images
    await page.locator('.scroll-container').evaluate(el => el.scrollLeft = 500);
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'tests/screenshots/mobile-scrolled-view.png',
      fullPage: false 
    });
  });
});