import OpenAI from "npm:openai@4.23.0";
import {  getEntityAllData,  saveCategories } from "./deno-kv.ts";
import { Product } from "./interfaces.ts";
const openai = new OpenAI({
  apiKey: "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"
});


export const getExactCategory = async (active:boolean) => {

  if(!active) return "getExactCategory cancelated"

  const products = await getEntityAllData<Product>("product")
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



