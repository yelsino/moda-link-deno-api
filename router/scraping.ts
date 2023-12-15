import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import puppeter from "npm:puppeteer";
import path from "node:path";
import { getShopCategories, loginWithFacebook } from "../libs/scraping.libs.ts";
import {
  getProductsShare,
  getProductsShop,
  setItemsToCsv,
} from "../libs/scraping.libs.js";
import { Menu, Product } from "../libs/interfaces.ts";

const scraping = new Hono().basePath("/v1/scraping");

scraping.get("/products", async (c) => {
  const url =
    "https://www.newchic.com/es/affiliateCenter/productList.html?sort=1&page=1&tab=all-products";
  const browser = await puppeter.launch({
    headless: false,
    defaultViewport: null,
    executablePath: "/usr/bin/chromium-browser",
    slowMo: 100,
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
  );
  await page.goto(url);

  await loginWithFacebook({
    email: "yelsino321@gmail.com",
    password: "@!yelsino321##",
    page: page,
  });
  await new Promise((r) => setTimeout(r, 10000));

  const products = await getProductsShare({ bucle: 120, page });
  await new Promise((r) => setTimeout(r, 2000));
  await browser.close();
  // return c.json(datos);
  return c.json(products);
});

scraping.post("/tool-afiliate", async (c) => {
  const url = "https://www.newchic.com/affiliateCenter/customerLinkTools.html";
  const browser = await puppeter.launch({
    headless: false,
    defaultViewport: null,
    executablePath: "/usr/bin/chromium-browser",
    slowMo: 50,
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
  );
  await page.goto(url);

  await loginWithFacebook({
    email: "yelsino321@gmail.com",
    password: "@!yelsino321##",
    page: page,
  });
  await new Promise((r) => setTimeout(r, 10000));

  const ubicacion = "./static/products";
  // deuda tecnica, pierdo 1 elemento por cada bucle
  for await (const file of Deno.readDir(ubicacion)) {
    if (file.name.includes("true")) continue;
    const filePath = `${ubicacion}/${file.name}`;
    const buffer = await Deno.readTextFile(filePath);
    const products = JSON.parse(buffer);

    const upProducts: Product[] = [];
    console.log("tamaño inicio: ", products.length); // 11
    for await (let product of products) {
      await page.waitForSelector(".custom-site-link-input-js");
      await page.$eval(".custom-site-link-input-js", (element, url) => {
        element.value = url;
      }, product.url);

      await page.click(".btn.btn-secondary.create-btn-js.create-link-btn-js");

      const errorDialogIcon = await page.$(".error-dialog-icon");
      const promoteShortLinkText = await page.$(".promote-short-link-text-js");

      if (errorDialogIcon) {
        product = Object.assign(product, { urlAfiliado: "false" });
        upProducts.push(product);
        console.log("error");
      } else if (promoteShortLinkText) {
        const text = await page.$eval(
          ".promote-short-link-text-js",
          (element) => element.innerText.trim(),
        );
        product = Object.assign(product, { urlAfiliado: text });
        upProducts.push(product);
        console.log("1");
      }

      await page.waitForSelector("button[data-dismiss].close");
      await page.click("button[data-dismiss].close");
      await new Promise((r) => setTimeout(r, 100));
    }

    const newFileName = `${ubicacion}/` + file.name.replace("false", "true");
    console.log("tamaño final: ", upProducts.length); // now 10

    const productsString = JSON.stringify(upProducts, null, 2);
    await Deno.writeTextFile(newFileName, productsString);
    await Deno.remove(filePath);

    await new Promise((r) => setTimeout(r, 2000));
  }

  await browser.close();
  return c.text("recorrido finalizado con exito");
});

scraping.get("/shares", async (c) => {
  const url =
    "https://www.newchic.com/es/affiliateCenter/productList.html?sort=1&page=1&tab=all-products";
  
  const browser = await puppeter.launch({
    headless: false,
    defaultViewport: null,
    executablePath: "/usr/bin/chromium-browser",
    slowMo: 100,
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
  );
  
  const downloadPath = path.resolve("./download");
  const client = await page.target().createCDPSession();
  await client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: downloadPath,
  });

  await page.goto(url);
  await loginWithFacebook({
    email: "yelsino321@gmail.com",
    password: "@!yelsino321##",
    page: page,
  });
  await new Promise((r) => setTimeout(r, 8000));

  await setItemsToCsv({ bucle: 120, page });
  await new Promise((r) => setTimeout(r, 5000));

  await browser.close();
  return c.text("csv-generated");
});

scraping.get("/store", async (c) => {
  const browser = await puppeter.launch({
    headless: false,
    defaultViewport: null,
    executablePath: "/usr/bin/chromium-browser",
    slowMo: 100,
  });

  try {
    const page = await browser.newPage();
    const useAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3";
    await page.setUserAgent(useAgent);
    const headerOption = { "Accept-Language": "es-PE,es;q=0.9" };
    await page.setExtraHTTPHeaders(headerOption);

    // DATA FOR MEN
    // await page.goto("https://www.newchic.com/?mg_id=2");
    // await new Promise((r) => setTimeout(r, 2000));

    // const categoriesMen = await getShopCategories(page);

    // const getValidCategoriesMen = removerCategorias(categoriesMen, [
    //   // "Nuevo en",
    //   // "Ropa",
    //   // "Calzados",
    //   // "Bolsos Y Accesorios",
    //   "Todo por menos de $9,99",
    //   "Venta",
    //   "Marca"
    // ])

    // const productsMen = await getProductsShop({ page, categories: getValidCategoriesMen, genero: "hombre" });

    // const productMenJson = JSON.stringify(productsMen, null, 2);
    // await Deno.writeTextFile("./static/data/products-shop-men.json", productMenJson);

    // DATA FOR WOMEN
    await page.goto("https://www.newchic.com/?mg_id=1");
    await new Promise((r) => setTimeout(r, 2000));

    const categoriesWomen = await getShopCategories(page);
    const getValidCategoriesWomen = removerCategorias(categoriesWomen, [
      "Venta",
      "Marcas",
      "Explorar",
    ]);
    const productsWomen = await getProductsShop({
      page,
      categories: getValidCategoriesWomen,
      genero: "mujer",
    });

    const productWomenJson = JSON.stringify(productsWomen, null, 2);
    await Deno.writeTextFile(
      "./static/data/products-shop-women.json",
      productWomenJson,
    );

    await browser.close();

    await browser.close();
    return c.text("FINALIZÓ CON EXITO");
  } catch (error) {
    console.log("browse closed", error);
    await new Promise((r) => setTimeout(r, 25000));
    await browser.close();
  }
});

scraping.post("/tool-csv", async (c) => {
  const url = "https://www.newchic.com/affiliateCenter/customerLinkTools.html";
  const browser = await puppeter.launch({
    headless: false,
    defaultViewport: null,
    executablePath: "/usr/bin/chromium-browser",
    slowMo: 100,
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
  );
  const downloadPath = path.resolve("./download/products-csv");
  const client = await page.target().createCDPSession();
  await client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: downloadPath,
  });

  await page.goto(url);

  await loginWithFacebook({
    email: "yelsino321@gmail.com",
    password: "@!yelsino321##",
    page: page,
  });
  await new Promise((r) => setTimeout(r, 10000));

  const ubicacion = "./static/products-csv"
  const getFiles = Deno.readDir(ubicacion);

  const files:Deno.DirEntry[] = [];
  for await (const file of getFiles) files.push(file);

  const sortedFiles = files.toSorted((a, b) => {
    const numberFileA = parseInt(a.name.match(/\d+/)?.[0] || '0', 10);
    const numberFileB = parseInt(b.name.match(/\d+/)?.[0] || '0', 10);
    
    return numberFileA  - numberFileB;
  });

  
  
  const getQuantityFiles = async () => {
    let quantityFiles = 0;
    const archivos = await Deno.readDir("./download/products-csv");
    for await (const file of archivos) if (file.isFile) quantityFiles++;
    return quantityFiles
  }

  for await (const file of sortedFiles) {
    const numberFile = parseInt(file.name.match(/\d+/)?.[0] || '0', 10);

    const filePath = `${ubicacion}/${file.name}`;
    const inputElement = await page.$(".batch-add-links-upload-file-input-js");
    await inputElement?.uploadFile(filePath);

    let quantityFiles = 0;
    // 6-2
    
    while (numberFile !== quantityFiles) {
      console.log(`${numberFile} - ${quantityFiles}`);
      await page.click(".batch-add-links-upload-file-submit-js");
      await new Promise((r) => setTimeout(r, 15000));
      quantityFiles = await getQuantityFiles();
    }
    await Deno.remove("./static/products-csv/" + file.name)
  }

  return c.text("completado");
});

export default scraping;

function removerCategorias(arr: Menu[], categoriasAEliminar: string[]) {
  return arr.filter((item) => !categoriasAEliminar.includes(item.category));
}
