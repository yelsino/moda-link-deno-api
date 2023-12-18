import { Product } from "./interfaces.ts";

export const kv = await Deno.openKv();

export async function saveProducts(products:Product[]) {

  const savePromise = products.map((product)=>{
    const primaryKey = ["product", product.id ?? ""]

    return kv
            .atomic()
            .check({key: primaryKey, versionstamp: null })
            .set(primaryKey, product)
            .commit();
  });

  await Promise.all(savePromise).then(()=>console.log("products ready!"))
  ;
}



export async function getEntityAllData<T>(prefix: string): Promise<T[]> {
  const data: T[] = [];
  for await (const res of kv.list<T>({ prefix: [prefix] }, { reverse: true })) {
    data.push(res.value);
  }

  return data;
}

export async function saveCategories(categories=[{ id: "", categoria: "" }]) {
  console.log("cantidad categories: ", categories.length);
  
  const savePromise = categories.map((category)=> {
    const primaryKey = ["category", category.id ?? ""];

    return kv
            .atomic()
            .check({key: primaryKey, versionstamp: null})
            .set(primaryKey, category)
            .commit()
  });

  await Promise
    .all(savePromise)
    .then(()=>console.log("save products ready!!"))
}

export const updateProducts = async () => {

  const products = await getEntityAllData<Product>("product");
  const categories = await getEntityAllData<{categoria:string,id:string}>("category");

  const updated = products.map((prod)=>{
    
    const category = categories.find((cat)=>cat.id === prod.id);

    return {
      ...prod,
      filter: category?.categoria ?? ""  
    }
  });

  // update each product
  for await (const product of updated) await updateProductById(product)
  console.log("update products list");
  
}

export async function updateProductById(product: Product) {
  const oldProduct = await getProductById(product.id ?? "");
  if (!oldProduct) return;
  await kv.atomic()
    .check(oldProduct)
    .set(["product", product.id ?? ""], product)
    .commit();
}

export async function getProductById(id: string) {
  const key = ["product", id];
  const product = await kv.get<Product>(key);
  return product;
}

