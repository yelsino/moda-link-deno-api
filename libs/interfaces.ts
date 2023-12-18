export interface Product {
  descripcion: string
  marca: string
  url: string
  precio: string
  imagen: string
  filter: string
  categoria: string 
  subCategoria: string
  likes: number
  genero: string
  urlAfiliado: string
  id: string

}

export interface Menu {
  category: string
  subCategories: Category[]
}

export interface Category {
  title: string
  url: string

}

export interface Element {
  querySelector:  (params:string)=>void
}