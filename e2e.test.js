// require('expect-puppeteer');
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const webSiteUrl = process.env.StaticWebSiteUrl;
const testArtifactsBucket = process.env.TestArtifactsBucket;
const time = new Date().toISOString();

describe('e2e', () => {

    let browser;
    let page;

    jest.setTimeout(20000);

    beforeAll(async () => {
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        page = await browser.newPage();
        await page.goto(webSiteUrl);
    });

    afterAll(async() => {
        if (browser !== null) {
            await browser.close();
        }
    })

    test('ページ内に`Face Replacer`が表示される', async () => {
        await expect(page).toMatch('Face Replacer');
    });

    test('ページがAjaxでAPIを呼び出して画像が表示される', async () => {
        // ページがロードされると自動でAjaxを呼び出す
        await page.waitForTimeout(5000);

        const imgs = await page.$$("div#processed_images img");
        // see: s3_put.test.js
        expect(imgs.length).toBe(1);
        const src = await page.evaluate(elem => elem.src, imgs[0]);
        expect(src).toMatch(/.*male1.jpg/)

        // スクリーンショットを取る
        const buffer = await page.screenshot();

        // スクリーンショットをS3にコピー
        const params = {
            Bucket: testArtifactsBucket,
            Key: `${time}/screenshot.png`,
            Body: buffer,
        };
        const result = await s3.putObject(params).promise();
    });
});