import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";

import products from "./router/products.ts";

const app = new Hono();

app.get("/", async (c) => {
  const entries = [];
  for await (const entry of Deno.readDir("./static/data")) {
    entries.push(entry);
  }

  const list = entries.map((entry) => {
    return `<li>${entry.name}</li>`;
  }).join("");

  const baseURL = new URL(Deno.env.get("URL_BASE_DEPLOY") ?? "http://localhost:8080");
  // const url = await Deno.env.get("DENO_DEPLOYMENT_URL");
  return new Response(`<div>
  <h1>Lista de archivos</h1>
  <h2>${baseURL}</h2>
  <ul>${list}</ul>
  </div>`, {
    headers: {
      "content-type": "text/html",
    },
  });
});
app.route('/api', products);



app.notFound((c) => c.text('Custom 404 Message', 404));

app.onError((err, c)=>{
  console.log(`${err}`);
  return c.text("Custom Error Message", 500)
})


Deno.serve(app.fetch);

