// import { serveStatic } from "https://deno.land/x/hono@v3.4.1/middleware.ts"
import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import products from "./router/products.ts";
import productsEnglish from "./router/en/products.ts";
import scraping from "./router/scraping.ts";
import files from "./router/files.ts";
import openai from "./router/en/openai.ts";

const app = new Hono();


// (async()=>{
//   // links_chunk_1.json
//   const filePath = "./static/resumen-xlsx/converted/";
//   let resumens:any[] = [];
//   for await (const entry of Deno.readDir(filePath)) {
//     const fileName = entry.name;
//     const file = await Deno.readTextFile(filePath + fileName);

//     const cleanedFile = file.replace(/"(\s*[^"]+\s*)":/g, (match, p1) => `"${p1.trim()}":`);
//     const resumen = JSON.parse(cleanedFile);

//     // const resumen = JSON.parse(file);
//     console.log("size: ", resumen.length);
//     resumens = resumens.concat(resumen);
//   }
//   // console.log(resumens);
  
//   const resumenString = JSON.stringify(resumens, null, 2);
//   await Deno.writeTextFile( "./static/resumen-xlsx/resumen.json", resumenString);

//   // obtener productos
//   const datakvPath = "./static/data/data-deno-kv.json";
//   const file = await Deno.readTextFile(datakvPath);
//   const products = JSON.parse(file);

//   // mapear productos
//   const translateData = products.map((p)=>{
//     const resumen = resumens.find((r:any)=>String(r.id) === String(p.id));
   
//     return {
//       ...p,
//       descripcion: resumen?.description.trim() ?? "",
//       filter: resumen?.filter.trim() ?? ""
//     }
//   });

//   const productsString = JSON.stringify(translateData, null , 2)
//   await Deno.writeTextFile( "./static/data/data-en-deno-kv.json", productsString);
//   console.log("SE HA COMPLEADO!!")
// })()


app.get("/", async (c) => {
  const entries = [];
  for await (const entry of Deno.readDir("./static/data")) {
    entries.push(entry);
  }

  const list = entries.map((entry) => {
    return `<li>${entry.name}</li>`;
  }).join("");

  const baseURL = new URL(
    Deno.env.get("URL_BASE_DEPLOY") ?? "http://localhost:8000",
  );


  return c.html(`
    <div>
      <h1>Lista de archivos</h1>
      <h2>${baseURL}</h2>
      <ul>${list}</ul>
      <div>
        <ul>
          <a href="${baseURL}api/v1/products">ver data: ${baseURL}/api/v1/products</a>
        </ul>
      </div>
    </div>
  `);
});

app.route("/api", products);
app.route("/api/en", productsEnglish);
app.route("/api", scraping);
app.route("/api", files);
app.route("/api", openai);

app.notFound((c) => c.text("Custom 404 Message", 404));

app.onError((err, c) => {
  console.log(`error es: ${err.message}`);
  return c.text("Custom Error Message", 500);
});

Deno.serve(app.fetch);

