import OpenAI from "npm:openai@4.23.0";
import {  getEntityAllData,  saveCategories, saveProducts } from "./deno-kv.ts";
import { Product } from "./interfaces.ts";
import * as dataDenokv from "../static/data/data-deno-kv.json" with {
  type: "json",
};
import { orderData } from "./product.libs.ts";

const openai = new OpenAI({
  apiKey: "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"
});


export const getExactCategory = async (active:boolean) => {

  if(!active) return "getExactCategory cancelated"

  const products = await getEntityAllData<Product>("product");
  const chunkSize = 50;

  let categories = [{ id: "", categoria: "" }];

  for (let i = 0; i < products.length; i += chunkSize) {
    const chunk = products.slice(i, i + chunkSize);
    const resumeProducts = chunk.map((p) => ({ id: p.id, descripcion: p.descripcion }));


    const message = JSON.stringify(resumeProducts);
    const textoFormateado = message.replace(/\s+/g, ' ').replace(/"(\w+)"\s*:\s*"/g, "'$1': '").replace(/"\s*,\s*"/g, "', '");


    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "user",
          content: textoFormateado,
        },
      ],
      functions: [
        {
          name: "getCategories",
          description: "analiza cada objeto para obtener un categoria correspondiente al objeto analizado ejemplo de respuesta -> {id:89,categoria:'camiseta'}, está prohivido inventar atributos",
          parameters: {
            type: "object",
            properties: {
              productos: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      description: "Devuelve el id correspondiente al objeto analizado ejemplo, {'id':'999'} -> '999'",
                    },
                    categoria: {
                      type: "string",
                      description: "Categoria del producto, ejemplo, 'descripcion':'Camisas japonesas con estampado de peces Gato' -> 'camiseta'",
                      enum: ["accesorios", "camiseta", "pantalon", "gorros", "zapatos"],
                      
                    },
                  },
                  required: ["id","categoria"],
                },
              },
            },
          },
        },
      ],
    });
    const chunkResponse = completion.choices[0].message.function_call?.arguments;
    const formatChunkResponse = JSON.parse(chunkResponse ?? "");
    categories = categories.concat(formatChunkResponse.productos)
    console.log(`chunk ${i+1} is ready!!!`);
    
  }
  
  await saveCategories(categories);
  console.log("getExactCategory is ready!!!");
  
};

export const translateProducts = async () => {

  // const getProductsKV = await getEntityAllData<Product>("product");
  const getProductsKV = orderData(dataDenokv.default)
  
  const chunkSize = 100;

  let products = [{ id: '', descripcion: '', filter: '' }];

  for (let i = 0; i < getProductsKV.length; i += chunkSize) {
    const chunk = getProductsKV.slice(i, i + chunkSize);
    const resumeProducts = chunk.map((p) => ({ id: p.id, descripcion: p.descripcion, filter: p.filter }));

    const message = JSON.stringify(resumeProducts);
    const textoFormateado = message.replace(/\s+/g, ' ').replace(/"(\w+)"\s*:\s*"/g, "'$1': '").replace(/"\s*,\s*"/g, "', '");
    
    const completion = await openai.chat.completions.create({
      // model: "gpt-4-1106-preview",
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "user",
          content: textoFormateado,
        },
      ],
      functions: [
        {
          name: "translateProducts",
          description: "traduce el texto al idioma ingles, aqui tienes un ejemplo de mensaje -> '[{'id': '35','descripcion':'Casual Sólido Harén Pantalones','filter': 'pantalon'},{'id':'36','descripcion':'Camisetas estampadas estilo japonés Gato','filter': 'camiseta'}]' -> y este seria el resultado a traducir -> '[{'id': '35','descripcion': 'Casual Solid Harem Pants','filter': 'pant'},{'id': '36','descripcion':'Japanese Style Cat Printed T-shirts ','filter': 't-shirt'}]'",
          parameters: {
            type: "object",
            properties: {
              productos: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      description: "traducir a ingles",
                    },
                    descripcion: {
                      type: "string",
                      description: "traducir la propiedad 'descripcion' de cada objeto de español a ingles. {'descripcion':'Camisetas de punto con rayas en bloque'} este objeto se traduciria al idioma ingles de esta manera -> {'descripcion':'Block Stripe Knit T-shirts'}; como vez se ha traducir el objeto de español a ingles",
                    },
                    filter: {
                      type: "string",
                      description: "traducir a ingles la clave 'filter' del objeto analizado, y retornarlo en ingles -> ejemplo: 'camiseta' --> 't-shirt' ",
                      enum: ["accessories", "t-shirt", "pants", "caps", "shoes"],
                    },
                  },
                  required: ["id","descripcion","filter"],
                },
              },
            },
          },
        },
      ],
    });
    const chunkResponse = completion.choices[0].message.function_call?.arguments;
    const formatChunkResponse = JSON.parse(chunkResponse ?? "");
   
    
    products = products.concat(formatChunkResponse.productos);
    console.log(`chunk ${i+1}, size: ${formatChunkResponse.productos.length} is ready!!!`);
    
  }
 
  console.log("translateProducts is ready!!!");

 return products
}



