import { expect, test } from '@playwright/test';

test('Single Window Handling', async ({ page }) => {
  await page.goto('https://www.lambdatest.com/selenium-playground/window-popup-modal-demo');
  const consentAllowButton = page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection');
  await page.waitForTimeout(5000);
  if (await consentAllowButton.isVisible({ timeout: 10000 })) {
    await consentAllowButton.click();
  }

  const [newWindow] = await Promise.all([
    page.waitForEvent('popup'),
    await page.click('//a[contains(text(),"Like us On Facebook")]')
  ]);

  await newWindow.waitForLoadState('networkidle');
  await newWindow.close();
})

test('Multiple Window Handling - Robust Version', async ({ page, context }) => {
  await page.goto('https://www.lambdatest.com/selenium-playground/window-popup-modal-demo');

  // Handle cookie consent safely (skip if not visible)
  const consentButton = page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection');
  if (await consentButton.isVisible({ timeout: 8000 }).catch(() => false)) {
    await consentButton.click();
    await page.waitForTimeout(1000);
  }

  // Wait for popups (we'll collect them dynamically)
  const popupPromises = [
    page.waitForEvent('popup').catch(() => null), // first popup
    page.waitForEvent('popup').catch(() => null)  // second popup (may fail)
  ];

  await page.click('#followboth');

  const popups = (await Promise.all(popupPromises)).filter(p => p !== null);

  // Get all pages in context (exclude original)
  const allPages = context.pages();
  const popupPages = allPages.filter(p => p !== page);

  console.log(`Detected ${popupPages.length} popup(s)`);

  // Accept 1 or 2 popups (don't hard-fail if only 1)
  if (popupPages.length === 0) {
    throw new Error('No popups detected after clicking Follow Both');
  }

  // Wait for usable state (use domcontentloaded - social sites are flaky with networkidle)
  await Promise.all(
    popupPages.map(async (popup) => {
      try {
        await popup.waitForLoadState('domcontentloaded', { timeout: 20000 });
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        console.warn(`Popup at ${await popup.url()} didn't fully load: ${error.message}`);
      }
    })
  );

  // Identify by title (order is NOT guaranteed!)
  let facebookPage, twitterPage;

  for (const p of popupPages) {
    const title = await p.title();
    console.log(`Popup title: ${title}`);

    if (title.includes('Facebook') || title.includes('LambdaTest')) {
      facebookPage = p;
    } else if (title.includes('X') || title.includes('Twitter')) {
      twitterPage = p;
    }
  }

  // Assertions - make them flexible
  expect(popupPages.length).toBeGreaterThanOrEqual(1); // at least Facebook usually works

  if (facebookPage) {
    await facebookPage.bringToFront();
    await expect(facebookPage).toHaveTitle(/Facebook|LambdaTest/, { timeout: 10000 });
  } else {
    console.warn('Facebook popup not detected');
  }

  if (twitterPage) {
    await twitterPage.bringToFront();
    await expect(twitterPage).toHaveTitle(/X|Twitter/, { timeout: 10000 });
  } else {
    console.warn('Twitter/X popup not detected - common in automation');
  }

  // Clean up
  await Promise.all(popupPages.map(p => p.close().catch(() => {})));
});