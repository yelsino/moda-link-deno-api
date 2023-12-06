import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";

const products = new Hono().basePath("/v1")

// products.get("/products", async (c) => {
//   try {
//     const dataDir = './static/data'; // Ruta al directorio que contiene los archivos JSON

//     const jsonFiles = [];

//     for await (const dirEntry of Deno.readDir(dataDir)) {
//       if (dirEntry.isFile && dirEntry.name.endsWith('.json')) {
//         const filePath = `${dataDir}/${dirEntry.name}`;
//         const jsonData = await Deno.readTextFile(filePath);
//         jsonFiles.push(JSON.parse(jsonData));
//       }
//     }

//     const flattenedJson = jsonFiles.flat();

//     return c.json(flattenedJson); // Devuelve los archivos JSON combinados como respuesta
//   } catch {
//     return c.text("Error al obtener los archivos JSON.");
//   }

// });


products.get("/products", async (c) => {
  try {
    const dataDir = './static/data'; // Ruta al directorio que contiene los archivos CSV

    const csvFiles: string[] = [];

    // Obtiene todos los archivos CSV en la carpeta especificada
    for await (const dirEntry of Deno.readDir(dataDir)) {
      if (dirEntry.isFile && dirEntry.name.endsWith('.csv')) {
        csvFiles.push(`${dataDir}/${dirEntry.name}`);
      }
    }

    const csvData = csvFiles.map(async (csvFile) => {
      const file = await Deno.open(csvFile);
      const decoder = new TextDecoder('utf-8');
      const content = decoder.decode(await Deno.readAll(file));
      Deno.close(file.rid);

      const rows = content.split('\n');
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

    return c.json(flattenedJson); // Devuelve el contenido de los archivos CSV como JSON
  } catch  {
    return c.text("Error al convertir los archivos CSV a JSON.");
  }

});


export default products