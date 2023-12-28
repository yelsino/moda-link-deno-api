import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import * as dataDenokv from "../../static/data/data-en-deno-kv.json" with {
  type: "json",
};
import { saveProducts } from "../../libs/deno-kv.ts";
import { Product } from "../../libs/interfaces.ts";
import { orderData } from "../../libs/product.libs.ts";

const products = new Hono().basePath("/v1/products");

products.get("/", (c) => {
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


    let products = orderData(dataDenokv.default)
    // let products = await getEntityAllData<Product>("product");

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
    await saveProducts(dataDenokv.default, 'es');
    return c.text("data kv generated")

  } catch (error) {
    const message = `ha ocurrido un error: ${error}`
    console.log(message);
    return c.text(message)
  }
})





export default products;
