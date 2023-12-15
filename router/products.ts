import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import * as dataProducts from '../static/data/products.json' with { type: "json" };
import * as dataShares from '../static/data/shares.json' with { type: "json"};
import * as dataAfiliate from '../static/data/data-afiliate.json' with { type: "json"};
import * as productsMen from '../static/data/products-shop-men.json' with { type: "json" };
import * as productsWomen from '../static/data/products-shop-women.json' with { type: "json"};
import { Product } from "../libs/interfaces.ts";

const products = new Hono().basePath("/v1");

products.get("/products-antiguo", async (c) => {
  try {
    // const dataDir = './static/data';
    const dataDir = './download/csv-convert-normal';
    // const dataDir = './download';

    const csvFiles: string[] = [];

    // Obtiene todos los archivos CSV en la carpeta especificada
    for await (const dirEntry of Deno.readDir(dataDir)) {
      if (dirEntry.isFile && dirEntry.name.endsWith('.csv')) {
        csvFiles.push(`${dataDir}/${dirEntry.name}`);
      }
    }

    // convertir los archivos CSV a JSON
    const csvData = csvToData(csvFiles);
    const jsonData = await Promise.all(csvData);
    const flattenedJson = jsonData.flat();

    return c.json(flattenedJson);
  } catch (error) {
    console.log(error);

    return c.text(`Error al convertir los archivos CSV a JSON. ${error}`);
  }
});

const csvToData = (csvFiles:string[]) => {
  const csvData = csvFiles.map(async (csvFile) => {
    const content = await Deno.readFile(csvFile);
    const decoder = new TextDecoder('utf-8');
    const rows = decoder.decode(content).split('\n');
    const headers = rows[0].split(',');

    const fileData = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].split(',');
      if (row.length === headers.length) {
        const obj: Record<string, string> = {};
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j].trim()] = row[j].trim();
        }
        fileData.push(obj);
      }
    }

    return fileData;
  });
  return csvData
}

products.get("/generate-data",  (c) => {
  const mergeData = dataShares.default.map((e) => {
    const findProduct = dataProducts.default.find((p) => p.descripcion === e["Product title"])
    const likes = findProduct ? findProduct.gustos : 0
    return { ...e, likes }
  })
  return c.json(mergeData)
});

products.get("/products", (c) => {
  const data_products = productsMen.default.concat(productsWomen.default);
  const data_afiliate = dataAfiliate.default;

    // Recorre cada elemento en data_afiliate
  const updateProducts = data_products.map((e)=>{
    const matchUrl = data_afiliate.find((a)=>a["Site/Product/Categroy Link"] === e.url);
  
    return {
      ...e,
      urlAfiliado: matchUrl ? matchUrl["Affiliate URL"] : ""
    }
  })

  function getUniques(arr: Product[], propiedad: keyof Product) {
    const unique: { [key: string]: boolean } = {};
    return arr.filter(item => {
      const value = item[propiedad];
      if (value !== undefined) {
        if (!unique[value]) {
          unique[value] = true;
          return true;
        }
        return false;
      }
      return false;
    });
  }
  
  const uniqueProductos = getUniques(updateProducts, 'descripcion');
  
  return c.json(uniqueProductos)
})



export default products;