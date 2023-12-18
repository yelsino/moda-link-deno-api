// import { serveStatic } from "https://deno.land/x/hono@v3.4.1/middleware.ts"
import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import products from "./router/products.ts";
import scraping from "./router/scraping.ts";
import files from "./router/files.ts";

const app = new Hono();

// app.get("/", serveStatic({ path: './index.html'}));

// active functions 
// await registrarProductos(false);
// await getExactCategory(false);
// await updateProducts();


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
app.route("/api", scraping);
app.route("/api", files);

app.notFound((c) => c.text("Custom 404 Message", 404));

app.onError((err, c) => {
  console.log(`error es: ${err.message}`);
  return c.text("Custom Error Message", 500);
});

Deno.serve(app.fetch);

