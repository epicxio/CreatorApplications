import { test, expect } from '@playwright/test';

/**
 * E2E: Course completion and certificate flow.
 * Completes all lessons in all modules, then asserts certificate section and get/download certificate.
 * Requires backend + frontend running. Set E2E_USER_EMAIL and E2E_USER_PASSWORD for login;
 * if unset, the test is skipped.
 */
test.describe('Certificate flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('login, enroll, complete all lessons, see certificate section and get certificate', async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL;
    const password = process.env.E2E_USER_PASSWORD;
    if (!email || !password) {
      test.skip();
      return;
    }

    await page.goto('/login');
    await page.getByLabel(/email|username/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in|login|log in/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 10000 });

    await page.goto('/courses');
    await expect(page).toHaveURL(/\/courses/);

    const courseLink = page.locator('a[href*="/courses/"]').first();
    await expect(courseLink).toBeVisible({ timeout: 5000 });
    const courseHref = await courseLink.getAttribute('href');
    const courseId = courseHref?.match(/\/courses\/([^/]+)/)?.[1];
    if (!courseId) {
      test.skip();
      return;
    }

    await courseLink.click();
    await expect(page).toHaveURL(new RegExp(`/courses/${courseId}`));

    const enrollButton = page.getByRole('button', { name: /enroll|start|continue learning/i });
    if (await enrollButton.isVisible()) {
      const text = await enrollButton.textContent();
      if (text && /enroll/i.test(text)) {
        await enrollButton.click();
        await expect(page.getByText(/enrolled|continue|start course/i)).toBeVisible({ timeout: 5000 });
      }
    }

    // Expand all curriculum accordions so every lesson row is visible
    const accordionSummaries = page.locator('.MuiAccordionSummary-button');
    const accordionCount = await accordionSummaries.count();
    for (let a = 0; a < accordionCount; a++) {
      const summary = accordionSummaries.nth(a);
      const expanded = await summary.getAttribute('aria-expanded');
      if (expanded === 'false') {
        await summary.click();
        await page.waitForTimeout(300);
      }
    }

    // Get total lesson count from "X of N lessons completed"
    const progressText = page.getByText(/\d+ of \d+ lessons completed/i).first();
    await expect(progressText).toBeVisible({ timeout: 5000 });
    const progressContent = await progressText.textContent();
    const totalMatch = progressContent?.match(/(\d+)\s+of\s+(\d+)\s+lessons/);
    const totalLessons = totalMatch ? parseInt(totalMatch[2], 10) : 0;

    if (totalLessons === 0) {
      test.skip();
      return;
    }

    // Complete every lesson: click lesson row -> mark complete -> back to course detail
    for (let i = 0; i < totalLessons; i++) {
      await page.goto(`/courses/${courseId}`);
      await expect(page).toHaveURL(new RegExp(`/courses/${courseId}`));
      await page.waitForTimeout(500);

      // Re-expand accordions in case they collapsed
      for (let a = 0; a < accordionCount; a++) {
        const summary = accordionSummaries.nth(a);
        const expanded = await summary.getAttribute('aria-expanded');
        if (expanded === 'false') {
          await summary.click();
          await page.waitForTimeout(200);
        }
      }

      // Lesson rows: ListItem with button inside AccordionDetails (curriculum only)
      const lessonRows = page.locator('.MuiAccordion-details .MuiListItem-button');
      await expect(lessonRows.first()).toBeVisible({ timeout: 3000 });
      const row = lessonRows.nth(i);
      await row.click();
      await expect(page).toHaveURL(new RegExp(`/courses/${courseId}/lesson/`), { timeout: 5000 });

      const markComplete = page.getByRole('button', { name: /mark as complete/i });
      if (await markComplete.isVisible()) {
        await markComplete.click();
        await expect(page.getByText(/completed|lesson completed/i)).toBeVisible({ timeout: 8000 });
      }

      await page.waitForTimeout(500);
    }

    // Back to course detail; progress should be 100% and certificate section visible
    await page.goto(`/courses/${courseId}`);
    await expect(page).toHaveURL(new RegExp(`/courses/${courseId}`));
    await expect(page.getByText(/100%/)).toBeVisible({ timeout: 5000 });

    const getCertButton = page.getByTestId('get-certificate');
    const downloadCertButton = page.getByTestId('download-certificate');
    const certSection = getCertButton.or(downloadCertButton);
    await expect(certSection).toBeVisible({ timeout: 5000 });

    if (await getCertButton.isVisible()) {
      await getCertButton.click();
      await expect(downloadCertButton).toBeVisible({ timeout: 15000 });
    }
    await expect(downloadCertButton).toBeVisible();
    await downloadCertButton.click();
  });
});
