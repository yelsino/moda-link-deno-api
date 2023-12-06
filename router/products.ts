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
      const file = await Deno.open(csvFile);  // Open the file handle
      const decoder = new TextDecoder('utf-8');
      
      // Use Deno.read to read chunks from the file handle
      const buffer = new Uint8Array(1024);  // You can adjust the buffer size as needed
      let content: Uint8Array = new Uint8Array(0);
      let bytesRead;
      
      while ((bytesRead = await Deno.read(file.rid, buffer)) !== null) {
        content = new Uint8Array([...content, ...buffer.slice(0, bytesRead)]);
      }
      
      Deno.close(file.rid);  // Close the file handle

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