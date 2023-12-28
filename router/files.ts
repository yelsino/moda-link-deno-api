import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import * as productsMen from '../static/data/products-shop-men.json' with { type: "json" };
import * as productsWomen from '../static/data/products-shop-women.json' with { type: "json"};
import * as all_resume_productos from "../static/data/data-deno-kv-resume.json" with { type: "json"}
import * as all_products from '../static/data/data-deno-kv.json' with { type: "json"};
import * as XLSX from 'https://deno.land/x/sheetjs@v0.18.3/xlsx.mjs'
const files = new Hono().basePath("/v1/files");


files.post("/divide-files", async (c) => {
  // get files 
  const products = productsMen.default.concat(productsWomen.default);
  const totalItems = products.length
  const itemsXjson = 1000;
  const numberFiles = Math.ceil(totalItems / itemsXjson);
  const saveDirection = "./static/products/";
  const nameFile = "chunck_product_false"

  for (let i = 0; i < numberFiles; i++) {
    const productsForFile = products.slice(i * itemsXjson, (i + 1) * itemsXjson);
    const path = saveDirection + `${nameFile}_${i + 1}.json`;
    const productsString = JSON.stringify(productsForFile, null, 2);
    await Deno.writeTextFile(path, productsString);
  }

  return c.text("DIVICION COMPLETA")
});



files.post("/generate-csv", async (c) => {
  const products = productsMen.default.concat(productsWomen.default);
  const itemsPerFile = 50;
  const totalProducts = products.length;
  const numberOfFiles = Math.ceil(totalProducts / itemsPerFile);
  const saveDirectory = "./static/products-csv/";
  const baseFileName = "links_chunk";

  for (let i = 0; i < numberOfFiles; i++) {
    const start = i * itemsPerFile;
    const end = Math.min((i + 1) * itemsPerFile, totalProducts);
    const productsForFile = products.slice(start, end);

    let csvContent = "Site/Product/Category Link,Link Name(Required only when creating code)\r\n";

    for (const product of productsForFile) {
      csvContent += `${product.url},\r\n`;
    }

    const filePath = `${saveDirectory}${baseFileName}_${i + 1}.csv`;
    await Deno.writeTextFile(filePath, csvContent);
    
  }

  return c.text("CSV files generated successfully");
});

files.post("/generate-xlsx", async (c) => {
  const products = all_resume_productos.default
  const itemsPerFile = 2000;
  const totalProducts = products.length;
  const numberOfFiles = Math.ceil(totalProducts / itemsPerFile);
  const saveDirectory = "./static/resumen-xlsx/";
  const baseFileName = "links_chunk";

  for (let i = 0; i < numberOfFiles; i++) {
    const start = i * itemsPerFile;
    const end = Math.min((i + 1) * itemsPerFile, totalProducts);
    const productsForFile = products.slice(start, end);

    let csvContent = "id,descripcion,filter\r\n";

    for (const product of productsForFile) {
      const descripcion = `"${product.descripcion.replace(/"/g, '""')}"`;
      csvContent += `${product.id},${descripcion},${product.filter} \r\n`;
    }

    const filePath = `${saveDirectory}${baseFileName}_${i + 1}.csv`;
    await Deno.writeTextFile(filePath, csvContent);
    
  }

  return c.text("CSV files generated successfully");
});


files.get("/rename-files", async (c) => {
  const direction = "./download/products-csv/"
  const files =  Deno.readDir(direction);
  
  for await (const file of files) {
    const oldPath = direction + file.name;
    const newPath = direction + file.name.replace(".csv", ".xlsx");
   
    
    Deno.rename(oldPath, newPath)
  }

  return c.text("completado")
})

files.get("/convert-files", async (c) => {
  const direction = "./download/products-csv-tool/";
  const ubication = "./download/csv-convert-normal/";
  const files = Deno.readDir(direction);

  for await (const file of files) {
    const oldPath = direction + file.name;
    const newPath = ubication + file.name.replace(".xlsx", ".csv");
    const workBook = XLSX.readFile(oldPath);
    XLSX.writeFile(workBook, newPath, { bookType: "csv" });
  }

  
  return c.text("dddd")
})

files.get("/resume-files", async (c) => {

  const ubication = './static/data/data-deno-kv-resume.json'
  const products = all_products.default;

  const resumeProducts = products.map((p)=>({id:p.id,descripcion:p.descripcion,filter:p.filter}));

  const productsString = JSON.stringify(resumeProducts, null, 2);
  await Deno.writeTextFile(ubication, productsString);

  return c.text("tarea completada")
})

export default files;
