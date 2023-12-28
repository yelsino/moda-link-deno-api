import * as productsMen from '../static/data/products-shop-men.json' with { type: "json" };
import * as productsWomen from '../static/data/products-shop-women.json' with { type: "json"};
import * as dataAfiliate from '../static/data/data-afiliate.json' with { type: "json"};
import { Product } from "./interfaces.ts";
import { getEntityAllData, saveProducts } from "./deno-kv.ts";

export const generateProducts = ():Product[] => {

  const dataProducts = productsMen.default.concat(productsWomen.default);
  const updateProducts = dataProducts.map((e,index)=>{
    const matchUrl = dataAfiliate.default.find((a)=>a["Site/Product/Categroy Link"] === e.url);
    return {
      ...e,
      urlAfiliado: matchUrl ? matchUrl["Affiliate URL"] : "",
    }
  })

  const uniqueProductos = getUniques(updateProducts, 'descripcion');
  const  orderProducts = orderData(uniqueProductos);
  const asingID = orderProducts.map((p,i)=>({...p,id:String(i+1)}))
  return asingID
}


export const  getUniques = (arr: Product[], propiedad: keyof Product) => {
  const unique: { [key: string]: boolean } = {};
  return arr.filter(item => {
    const value = item[propiedad];
    if (value !== undefined) {
      if (!unique[value]) {
        unique[value] = true;
        return true;
      }
      return false;
    }
    return false;
  });
};

export const orderData = (products:Product[]) => {
  const  orderData = products.sort((a: Product, b: Product)=>{
    const likesA = Number(a.likes);
    const likesB = Number(b.likes);
  
    return likesB - likesA;
  });

  return orderData
}

export const registrarProductos = async (active:boolean) => {
  if(!active) return "registrarProductos cancelated"
  const products = generateProducts();
  await saveProducts(products,'es');
  
}



