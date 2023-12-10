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

export const getProducts = async ({ bucle, page }) => {
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
