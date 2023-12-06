import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";

import products from "./router/products.ts";

const app = new Hono();

app.get("/", (c) => c.text("Welcome to dinosaur API!!"));
app.route('/api', products);



app.notFound((c) => c.text('Custom 404 Message', 404));

app.onError((err, c)=>{
  console.log(`${err}`);
  return c.text("Custom Error Message", 500)
})


Deno.serve(app.fetch);

