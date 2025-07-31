const { test, expect } = require('@playwright/test');

test.describe('Scroll Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should scroll smoothly with mouse wheel', async ({ page }) => {
    const scrollContainer = page.locator('.scroll-container');
    
    // Get initial scroll position
    const initialScroll = await scrollContainer.evaluate(el => el.scrollLeft);
    
    // Perform multiple wheel scrolls
    const scrollPositions = [];
    const startTime = Date.now();
    
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(50); // Small delay between scrolls
      const scrollPos = await scrollContainer.evaluate(el => el.scrollLeft);
      scrollPositions.push(scrollPos);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Check that scrolling happened
    expect(scrollPositions[scrollPositions.length - 1]).toBeGreaterThan(initialScroll);
    
    // Check for smooth progression (no sudden jumps)
    for (let i = 1; i < scrollPositions.length; i++) {
      const diff = scrollPositions[i] - scrollPositions[i-1];
      // Allow for some variation but ensure no extreme jumps
      expect(diff).toBeLessThan(500);
    }
    
    console.log(`Scroll test completed in ${duration}ms`);
    console.log(`Total scroll distance: ${scrollPositions[scrollPositions.length - 1] - initialScroll}px`);
  });

  test('should have momentum scrolling', async ({ page }) => {
    const scrollContainer = page.locator('.scroll-container');
    
    // Perform a quick scroll
    await page.mouse.wheel(0, 500);
    
    // Track scroll positions over time
    const positions = [];
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(50);
      const pos = await scrollContainer.evaluate(el => el.scrollLeft);
      positions.push(pos);
    }
    
    // Check that scroll continues after wheel event (momentum)
    const hasMovement = positions.some((pos, i) => i > 0 && pos !== positions[i-1]);
    expect(hasMovement).toBeTruthy();
    
    // Check that scroll gradually slows down
    const velocities = [];
    for (let i = 1; i < positions.length; i++) {
      velocities.push(positions[i] - positions[i-1]);
    }
    
    // Find where velocity starts decreasing (after initial acceleration)
    let decreasingFrom = -1;
    for (let i = 2; i < velocities.length; i++) {
      if (Math.abs(velocities[i]) < Math.abs(velocities[i-1])) {
        decreasingFrom = i;
        break;
      }
    }
    
    expect(decreasingFrom).toBeGreaterThan(-1);
  });

  test('should handle keyboard navigation', async ({ page }) => {
    const scrollContainer = page.locator('.scroll-container');
    
    // Test arrow key navigation
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    const afterRight = await scrollContainer.evaluate(el => el.scrollLeft);
    expect(afterRight).toBeGreaterThan(0);
    
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(300);
    const afterLeft = await scrollContainer.evaluate(el => el.scrollLeft);
    expect(afterLeft).toBeLessThan(afterRight);
    
    // Test Home/End keys
    await page.keyboard.press('End');
    await page.waitForTimeout(500);
    const atEnd = await scrollContainer.evaluate(el => el.scrollLeft);
    const maxScroll = await scrollContainer.evaluate(el => el.scrollWidth - el.clientWidth);
    expect(Math.abs(atEnd - maxScroll)).toBeLessThan(10);
    
    await page.keyboard.press('Home');
    await page.waitForTimeout(500);
    const atHome = await scrollContainer.evaluate(el => el.scrollLeft);
    expect(atHome).toBeLessThan(10);
  });

  test('should measure scroll performance metrics', async ({ page }) => {
    // Inject performance monitoring
    await page.evaluate(() => {
      window.scrollMetrics = {
        frames: 0,
        startTime: 0,
        endTime: 0,
        positions: []
      };
      
      let rafId;
      const measureFrame = (timestamp) => {
        if (!window.scrollMetrics.startTime) {
          window.scrollMetrics.startTime = timestamp;
        }
        
        window.scrollMetrics.frames++;
        window.scrollMetrics.endTime = timestamp;
        
        const scrollPos = document.querySelector('.scroll-container').scrollLeft;
        window.scrollMetrics.positions.push({ time: timestamp, position: scrollPos });
        
        if (timestamp - window.scrollMetrics.startTime < 2000) { // Measure for 2 seconds
          rafId = requestAnimationFrame(measureFrame);
        }
      };
      
      requestAnimationFrame(measureFrame);
      
      // Trigger scroll
      setTimeout(() => {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            window.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
          }, i * 100);
        }
      }, 100);
    });
    
    // Wait for measurement to complete
    await page.waitForTimeout(2500);
    
    // Get metrics
    const metrics = await page.evaluate(() => window.scrollMetrics);
    
    const duration = metrics.endTime - metrics.startTime;
    const fps = (metrics.frames / duration) * 1000;
    
    console.log(`Performance metrics:`);
    console.log(`- Average FPS: ${fps.toFixed(2)}`);
    console.log(`- Total frames: ${metrics.frames}`);
    console.log(`- Duration: ${duration.toFixed(2)}ms`);
    
    // Expect smooth performance (at least 30 FPS)
    expect(fps).toBeGreaterThan(30);
  });
});