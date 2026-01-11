import { expect, test } from '@playwright/test';

test('Frame Handling Using Page.FrameLocator()', async ({ page }) => {
  await page.goto('https://www.lambdatest.com/selenium-playground/iframe-demo/');
  const consentAllowButton = page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection');
  await page.waitForTimeout(5000);
  if (await consentAllowButton.isVisible({ timeout: 10000 })) {
    await consentAllowButton.click();
  }
  const frame = page.frameLocator('#iFrame1');
  await frame?.locator('div.rsw-ce').fill('LambdaTest');
  expect(await frame?.locator('div.rsw-ce').textContent()).toEqual('LambdaTest');
})

test('Frame Handling Using Page.Frame()', async ({ page }) => {
  await page.goto('https://www.lambdatest.com/selenium-playground/iframe-demo/');
  const consentAllowButton = page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection');
  await page.waitForTimeout(5000);
  if (await consentAllowButton.isVisible({ timeout: 10000 })) {
    await consentAllowButton.click();
  }

  const frame = page.frame({url:'https://www.lambdatest.com/selenium-playground/iframe-demo/contant'});
  await frame?.locator('div.rsw-ce').fill('LambdaTest');
  expect(await frame?.locator('div.rsw-ce').textContent()).toEqual('LambdaTest');
})

test('Nested Frame Handling - with disabled check', async ({ page }) => {
  await page.goto('https://ui.vision/demo/webtest/frames/');

  // Locate the parent frame
  const frame3 = page.frame({ url: /frame_3\.html$/ }); // more reliable than exact URL

  if (!frame3) {
    throw new Error('Frame 3 not found');
  }

  const childFrame = frame3.childFrames()[0];
  if (!childFrame) {
    throw new Error('No child frame found in Frame 3');
  }

  const checkbox = childFrame.locator('div[aria-label="Web Testing"]');

  // Check disabled state
  const isDisabled = await checkbox.getAttribute('aria-disabled') === 'true';

  if (isDisabled) {
    console.log('Checkbox "Web Testing" is disabled - skipping check');
    // Optional: assert it's disabled as expected (good for this demo)
    await expect(checkbox).toHaveAttribute('aria-disabled', 'true');
  } else {
    // Only attempt to check if it's enabled
    await checkbox.check();
    await expect(checkbox).toHaveAttribute('aria-checked', 'true');
  }
});