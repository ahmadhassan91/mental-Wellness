import { test, expect } from '@playwright/test';

test.describe('Admin Page', () => {
  test('should show login form when not authenticated', async ({ page }) => {
    await page.goto('/admin');

    await expect(page.getByRole('heading', { name: /admin login/i })).toBeVisible();
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/admin');

    await page.fill('input[placeholder="Enter username"]', 'wrong');
    await page.fill('input[placeholder="Enter password"]', 'wrong');
    await page.click('button:has-text("Login")');

    await page.waitForTimeout(1000);

    await expect(page.getByRole('heading', { name: /admin login/i })).toBeVisible();
  });
});
