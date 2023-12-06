import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";

const products = new Hono().basePath("/v1");

products.get("/products", async (c) => {
  try {
    const dataDir = './static/data';

    const csvFiles: string[] = [];

    // Obtiene todos los archivos CSV en la carpeta especificada
    for await (const dirEntry of Deno.readDir(dataDir)) {
      if (dirEntry.isFile && dirEntry.name.endsWith('.csv')) {
        csvFiles.push(`${dataDir}/${dirEntry.name}`);
      }
    }

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

    const jsonData = await Promise.all(csvData);

    const flattenedJson = jsonData.flat();

    return c.json(flattenedJson);
  } catch (error) {
    console.log(error);
    
    return c.text(`Error al convertir los archivos CSV a JSON. ${error}`);
  }
});



export default products;