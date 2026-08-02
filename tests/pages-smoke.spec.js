// @ts-check
const { test, expect } = require('@playwright/test');

const PAGES = [
  'index.html',
  'about.html',
  'services.html',
  'realisations.html',
  'contact.html',
  'mentions-legales.html',
];

for (const pagePath of PAGES) {
  test(`${pagePath} charge sans erreur console ni ressource cassée`, async ({ page }) => {
    const consoleErrors = [];
    const failedRequests = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));
    page.on('response', (res) => {
      if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`);
    });

    const response = await page.goto(`/${pagePath}`);
    expect(response.status()).toBe(200);

    await page.waitForLoadState('networkidle');

    expect(consoleErrors, `Erreurs console sur ${pagePath}`).toEqual([]);
    expect(failedRequests, `Ressources en échec sur ${pagePath}`).toEqual([]);
  });
}
