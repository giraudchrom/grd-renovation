// @ts-check
const { test, expect } = require('@playwright/test');

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

test.describe('Formulaire de contact', () => {
  test('soumission valide affiche le message de succès (Web3Forms mocké)', async ({ page }) => {
    let web3formsCalled = false;

    await page.route(WEB3FORMS_ENDPOINT, async (route) => {
      web3formsCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/contact.html');

    await page.locator('#contactName').fill('Jean Dupont');
    await page.locator('#contactPhone').fill('06 12 34 56 78');
    await page.locator('#contactEmail').fill('jean.dupont@exemple.fr');
    await page.locator('#contactMessage').fill('Devis pour une réfection de toiture.');

    await page.locator('#contactForm [type="submit"]').click();

    await expect(page.locator('#formSuccess')).toBeVisible();
    await expect(page.locator('#contactForm')).toBeHidden();
    expect(web3formsCalled).toBe(true);
  });

  test('soumission vide affiche les erreurs de validation sans appeler Web3Forms', async ({ page }) => {
    let web3formsCalled = false;
    await page.route(WEB3FORMS_ENDPOINT, async (route) => {
      web3formsCalled = true;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    });

    await page.goto('/contact.html');

    await page.locator('#contactForm [type="submit"]').click();

    await expect(page.locator('#nameError')).toBeVisible();
    await expect(page.locator('#nameError')).toHaveText('Veuillez entrer votre nom.');
    await expect(page.locator('#phoneError')).toBeVisible();
    await expect(page.locator('#emailError')).toBeVisible();
    await expect(page.locator('#formSuccess')).toBeHidden();
    expect(web3formsCalled).toBe(false);
  });
});
