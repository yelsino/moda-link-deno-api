import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import * as dataProducts from "../static/data/products.json" with {
  type: "json",
};
import * as dataShares from "../static/data/shares.json" with { type: "json" };
import { Product } from "../libs/interfaces.ts";
import { getEntityAllData, saveProducts } from "../libs/deno-kv.ts";
import * as dataDenokv from "../static/data/data-deno-kv.json" with {
  type: "json",
};

const products = new Hono().basePath("/v1/products");

products.get("/products-antiguo", async (c) => {
  try {
    // const dataDir = './static/data';
    const dataDir = "./download/csv-convert-normal";
    // const dataDir = './download';

    const csvFiles: string[] = [];

    // Obtiene todos los archivos CSV en la carpeta especificada
    for await (const dirEntry of Deno.readDir(dataDir)) {
      if (dirEntry.isFile && dirEntry.name.endsWith(".csv")) {
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

const csvToData = (csvFiles: string[]) => {
  const csvData = csvFiles.map(async (csvFile) => {
    const content = await Deno.readFile(csvFile);
    const decoder = new TextDecoder("utf-8");
    const rows = decoder.decode(content).split("\n");
    const headers = rows[0].split(",");

    const fileData = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].split(",");
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
  return csvData;
};

products.get("/generate-data", (c) => {
  const mergeData = dataShares.default.map((e) => {
    const findProduct = dataProducts.default.find((p) =>
      p.descripcion === e["Product title"]
    );
    const likes = findProduct ? findProduct.gustos : 0;
    return { ...e, likes };
  });
  return c.json(mergeData);
});

products.get("/", async (c) => {
  try {

    const {
      genero,
      marca,
      categoria,
      subCategoria,
      page,
      sizePage,
      filter
    } = c.req.query();

    let products = dataDenokv.default
    // let products = await getEntityAllData<Product>("product");
    console.log("prod: ", products.length);

    if (genero) {
      products = products.filter((product) => product.genero === genero);
    }

    if (marca) {
      products = products.filter((product) => product.marca === marca);
    }

    if (categoria) {
      products = products.filter((product) => product.categoria === categoria);
    }

    if (filter) {
      products = products.filter((product) => product.filter === filter);
    }

    if (subCategoria) {
      products = products.filter((product) =>
        product.subCategoria === subCategoria
      );
    }

    // Función para obtener la página solicitada
    const getPage = (data: Product[], pageNumber: number, pageSize: number) => {
      const startIndex = (pageNumber - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      return data.slice(startIndex, endIndex);
    };

    // Aplicar paginación si se especifica la página y el tamaño de página
    let paginatedProducts = products;
    if (page && sizePage) {
      const pageNumber = parseInt(page);
      const pageSize = parseInt(sizePage);
      paginatedProducts = getPage(products, pageNumber, pageSize);
    }

    return c.json(paginatedProducts);
  } catch (error) {
    const message = `ha ocurrido un error: ${error}`
    console.log(message);
    return c.text(message)
  }
});

products.post("/generate", async (c) => {
  try {
    await saveProducts(dataDenokv.default);
    return c.text("data kv generated")

  } catch (error) {
    const message = `ha ocurrido un error: ${error}`
    console.log(message);
    return c.text(message)
  }
})





export default products;
