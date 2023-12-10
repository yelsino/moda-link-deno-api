import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import puppeter from "npm:puppeteer"
import path from "node:path"
import { loginWithFacebook } from "../libs/scraping.libs.ts";
import { getProducts, setItemsToCsv } from "../libs/scraping.libs.js";

const scraping = new Hono().basePath("/v1/scraping");

scraping.get("/products", async (c) => {

  const url = "https://www.newchic.com/es/affiliateCenter/productList.html?sort=1&page=1&tab=all-products";
  const browser = await puppeter.launch({
    headless: false,
    defaultViewport: null,
    executablePath: "/usr/bin/chromium-browser",
    slowMo: 100
  });

  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3");
  await page.goto(url);

  await loginWithFacebook({ email: "yelsino321@gmail.com", password: "@!yelsino321##", page: page });
  await new Promise(r => setTimeout(r, 10000));

  const products = await getProducts({ bucle: 120, page })
  await new Promise(r => setTimeout(r, 2000));
  await browser.close()
  // return c.json(datos);
  return c.json(products);


});

scraping.get("/shares", async (c) => {

  const url = "https://www.newchic.com/es/affiliateCenter/productList.html?sort=1&page=1&tab=all-products";
  const downloadPath = path.resolve('./download');
  const browser = await puppeter.launch({
    headless: false,
    defaultViewport: null,
    executablePath: "/usr/bin/chromium-browser",
    slowMo: 100
  });

  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3");

  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadPath
  })

  await page.goto(url);
  await loginWithFacebook({ email: "yelsino321@gmail.com", password: "@!yelsino321##", page: page });
  await new Promise(r => setTimeout(r, 8000));

  await setItemsToCsv({ bucle: 120, page })
  await new Promise(r => setTimeout(r, 5000));

  await browser.close()
  return c.text("csv-generated")
})

export default scraping;



