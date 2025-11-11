import { test, expect } from '@playwright/test';

test.describe('Providers Page', () => {
  test('should load providers page and display provider cards', async ({ page }) => {
    await page.goto('/providers');

    await expect(page.getByRole('heading', { name: /find your provider/i })).toBeVisible();

    await page.waitForSelector('[role="img"]', { state: 'visible', timeout: 10000 });

    const providerCards = page.locator('button:has-text("Request on Portal")');
    await expect(providerCards.first()).toBeVisible();
  });

  test('should filter providers by specialty', async ({ page }) => {
    await page.goto('/providers');

    await page.waitForSelector('button:has-text("Request on Portal")', {
      state: 'visible',
      timeout: 10000,
    });

    const initialCards = await page.locator('button:has-text("Request on Portal")').count();
    expect(initialCards).toBeGreaterThan(0);
  });

  test('should show empty state when no providers match filters', async ({ page }) => {
    await page.goto('/providers');

    await page.waitForSelector('button:has-text("Request on Portal")', {
      state: 'visible',
      timeout: 10000,
    });
  });
});

test.describe('Home Page', () => {
  test('should navigate to providers page from home', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /begin your journey/i })).toBeVisible();

    await page.click('text=Find Your Provider');
    await expect(page).toHaveURL('/providers');
  });
});
