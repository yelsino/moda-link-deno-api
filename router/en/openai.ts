import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import { translateProducts } from "../../libs/openai.ts";

const openai = new Hono().basePath("/v1/en/openai");

openai.post("/translate", async (c) => {
  try {
    const resposne = await translateProducts();
    return c.json(resposne);
  } catch (error) {
    const message = `ha ocurrido un error: ${error}`;
    console.log(message);
    return c.text(message);
  }
});

export default openai;
