import {test, expect} from '@playwright/test';
import {testParameters} from "../config";
import {tester} from "../testData/testData";

test.beforeEach(async ({page}) => {
    await page.goto(testParameters.baseUrl);
});
test('Show Contact page', async ({page}) => {
    for (let i of await page.getByLabel('Kontakt').all()) {
        await i.click();
        await expect(page).toHaveURL(/.*kontakt*/);
    }
});
test.describe('Check the text in the article', () => {
    test('Link to Novinky', async ({page}) => {
        await page.locator('#navMenu').getByLabel('Novinky').click();
        await expect(page).toHaveURL(`${testParameters.baseUrl}/novinky`);
    });
    test('Link to article', async ({page}) => {
        await page.goto(`${testParameters.baseUrl}/novinky`);
        await page.getByRole('link', {name: 'Jsme partnerem automatizační platformy Integromat'}).click();
        await expect(page).toHaveURL(`${testParameters.baseUrl}/-/jsme-partnerem-automatizacni-platformy-integromat`);
    });
    test('Find text', async ({page}) => {
        await page.goto(`${testParameters.baseUrl}/-/jsme-partnerem-automatizacni-platformy-integromat`);
        await expect(page.locator('article')).toHaveText(/.*Filozofie platformy/);
    });
});
test.describe('Check the text in hover', () => {
    test('Link to Novinky', async ({page}) => {
        await page.locator('#navMenu').getByLabel('Reference').click();
        await expect(page).toHaveURL(`${testParameters.baseUrl}/reference`);
    });
    test('Find text in hover', async ({page}) => {
        await page.goto(`${testParameters.baseUrl}/reference`);
        const cardContainingTitle = await page
            .getByRole('button')
            .filter({has: page.getByText('Home Credit')});
        await cardContainingTitle.hover();
        const textHover = await cardContainingTitle.getByText('Globální intranet');
        await expect(cardContainingTitle).toHaveText(/.*Globální intranet/);
        await expect(textHover).toBeVisible();
    });
});
test.describe('Form filling and submitting test', () => {
    test('Link to form', async ({page}) => {
        await page.locator('#navMenu').getByLabel('Kariéra').click();
        await page.getByRole('link', {name: 'Tester'}).click();
        await expect(page).toHaveURL(`${testParameters.baseUrl}/-/kariera/tester`);
    });

    test('Validation check', async ({page}) => {
        await page.goto(`${testParameters.baseUrl}/-/kariera/tester`);
        const emailTest = page.getByLabel('E-mail*');
        const telephoneTest = page.getByLabel('Telefon*');
        const style = "background-color: rgb(255, 179, 179);";
        await page.locator('#careerForm div').filter({hasText: 'Životopis*'}).locator('label').setInputFiles('./MyCV/1.pdf');
        await page.getByLabel('', {exact: true}).check();
        await page.locator('#careerBtn').click();
        await expect(emailTest).toHaveAttribute("style", style);
        await expect(telephoneTest).toHaveAttribute("style", style);
    });
    test('Submitting form', async ({page}) => {
        await page.goto(`${testParameters.baseUrl}/-/kariera/tester`);
        await page.getByRole('button', {name: 'OK'}).click();
        await page.getByLabel('Vaše jméno*').fill(tester.name);
        await page.getByLabel('Telefon*').fill(tester.telephone);
        await page.getByLabel('E-mail*').fill(tester.email);
        await page.getByLabel('Poznámka').fill(tester.note);
        await page.locator('#careerForm div').filter({hasText: 'Životopis*'}).locator('label').setInputFiles('./MyCV/Toropitsyn_CV_FE_Developer_cz.pdf');
        await page.locator('#careerForm div').filter({hasText: 'Ostatní přílohy'}).locator('label').setInputFiles('./MyCV/Toropitsyn_CV_FE_Developer_en.pdf');
        await page.getByLabel('', {exact: true}).check();
        const responsePromise = page.waitForResponse((response) => response.url().includes("/onlio-sendmail"));
        await page.locator('#careerBtn').click();
        const response = await responsePromise;
        const responseBody = await response.json();
        await console.log(responseBody);
        await expect(response.status()).toBe(200);
    });
});