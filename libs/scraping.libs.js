export const setItemsToCsv = async ({ bucle, page }) => {
  for (let index = 0; index < bucle; index++) {
    const direcction = `https://www.newchic.com/es/affiliateCenter/productList.html?sort=1&page=${
      index + 1
    }&tab=all-products`;

    await page.goto(direcction);
    await new Promise((r) => setTimeout(r, 1000));
    // seleccionar items
    await page.evaluate(() => {
      // lista de productos
      const elements = document.querySelectorAll(
        ".share-product-list-js .share-product-li-js"
      );

      const data = [...elements].map((element) => {
        const addButton = element.querySelector(".collection-add-js");
        if (addButton) {
          addButton.click(); // Hacer clic en el botón "Añadir"
        }
      });

      return data;
    });

    if ((index + 1) % 8 === 0) {
      await page.click(".share-product-export-js");
    }
  }
};

export const getProductsShare = async ({ bucle, page }) => {
  let datos = [];
  for (let index = 0; index < bucle; index++) {
    const direcction = `https://www.newchic.com/es/affiliateCenter/productList.html?sort=1&page=${
      index + 1
    }&tab=all-products`;
    await page.goto(direcction);
    await new Promise((r) => setTimeout(r, 500));
    const result = await page.evaluate(() => {
      const elements = document.querySelectorAll(
        ".share-product-list-js .share-product-li-js"
      );

      const data = [...elements].map((element) => {
        // Obtener la descripción del producto
        let descripcion = "";
        let image = "";
        let productURL = "";
        let likes = 0;
        let price = "";
        let profit = "";

        const getDescription = element.querySelector(".share-product__name p");
        if (getDescription) descripcion = getDescription.innerText;

        const getImage = element.querySelector("img");
        if (getImage) image = getImage.getAttribute("src");

        const getProductURL = element.querySelector(".share-product__link");
        if (getProductURL) productURL = getProductURL.getAttribute("href");

        const getLikes = element.querySelector(".mb-lg-15.flex > span.lg-fit");
        if (getLikes) {
          const textLikes = getLikes.textContent.trim();
          console.log(textLikes);
          const likesRegex = /\d+/;
          const extractedLikes = textLikes.match(likesRegex);

          if (extractedLikes) {
            likes = extractedLikes[0]; // Obtener el primer conjunto de dígitos encontrado
          }
        }

        const getPrice = element.querySelector(".font-bold[oriprice]");
        if (getPrice) price = getPrice.textContent;

        const getProfit = element
          .querySelector(".price[oriprice]")
          .textContent.trim();
        if (getPrice) profit = getProfit.textContent;

        return {
          descripcion: descripcion,
          url: productURL,
          imagen: image,
          gustos: likes,
          precio: price,
          ganancia: profit,
        };
      });

      return data;
    });

    datos = [...datos, ...result];
    // datos = datos.concat(result)
  }

  return datos;
};





export const getProductsShop = async ({
  page,
  categories = [],
  genero = "",
}) => {
  await page.goto(
    "https://es.newchic.com/style/casual-stylemen-t-000003807.html?mg_id=2&from=nav"
  );
  await new Promise((e) => setTimeout(e, 3000));
  let productsMen = [];
  for (const category of categories) {

     for (const sub of category.subCategories) {
      // console.log("sub url:", sub.url);
       await page.goto(sub.url);

       const numberPages = await page.$$eval('.pagination > li[data-spm-masonry].page-item', (elements)=>elements.map(e => e.textContent.trim()));

       const formatNumbers = numberPages.map(numero => Number(numero));
       const getMaxNumber = formatNumbers.length > 0 ? Math.max(...formatNumbers) : 1;

       for (let index = 1; index <= getMaxNumber; index++) {
         await page.goto(`${sub.url}&page=${index}`);

         await new Promise((r)=>setTimeout(r, 1000));
         const products = await page.evaluate(() => {
           const products = Array.from(document.querySelectorAll('.product-item-js'));
           return products.map((product) => {
             let descripcion = "";
             let marca = "";
             let precio = "";
             let imagen = "";
             let url = "";
             let likes = 0;

             const getDescription = product.querySelector('.product-item-name-js');
             if(getDescription)
               descripcion = getDescription.textContent.trim();

             const getMarca = product.querySelector('a.product-item-brand');
             if(getMarca)
               marca = getMarca.textContent.trim();

             const getPrecio = product.querySelector('span.product-price-js')
             if(getPrecio)
               precio = getPrecio.textContent.trim();

             const getImagen = product.querySelector('img.product-item-pic-js')
             if(getImagen)
               imagen = getImagen.getAttribute('src');

             const getUrl = product.querySelector('.product-item__pic > a.product-item-link-js');
             if(getUrl)
               url = getUrl.getAttribute('href');

            const getLikes = product.querySelector('.product-item__wish-num-js');
              if(getLikes){
                likes = Number(getLikes.textContent.trim());
              }

             return { descripcion, marca, precio, imagen, url, likes, urlAfiliado: "" }
           });
         }
         );

         const addAtribute =  products.map((e)=>({...e,subCategoria:sub.title}))
         productsMen = productsMen.concat(addAtribute)

       }

     }

     productsMen = productsMen.map((e)=>({
      ...e,
      categoria:category.category,
      genero: genero
    }))
  }
  return productsMen;
};


export const createLinkAfiliate = async (page,text) => {

  // seleccionar input


  // copiar texto en portapapeles
  await page.evaluate((text)=>{
    navigator.clipboard.writeText(text);
  })

  // pegar texto en input
  
}