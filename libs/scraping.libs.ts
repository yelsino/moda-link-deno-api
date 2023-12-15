import { Page } from "npm:puppeteer"
import { Menu } from "./interfaces.ts";

interface LoginFaceebok {
  email: string;
  password: string;
  page: Page;
}
export const loginWithFacebook = async ({ email, password, page }: LoginFaceebok) => {
  await page.click(".facebook-login-js");
  page.waitForSelector
  const newPagePromise = new Promise(x => page.once('popup', x));
  const newPage: any = await newPagePromise;
  await new Promise(r => setTimeout(r, 1000));
  const inputEmail = await newPage.waitForSelector("#email");
  const inputPassword = await newPage.waitForSelector("#pass");
  await inputEmail?.type(email);
  await inputPassword?.type(password);
  newPage.click("#loginbutton");
}


export const getShopCategories = async (page:Page):Promise<Menu[]> => {
  const menuItems = await page.$$('.header-nav-item-js');

  const getCategories = Promise.all(
    menuItems.map(async (item) => {
      const category = await page.evaluate((element) => {
        const anchor = element.querySelector('.header-nav-link-js');
        return anchor ? anchor.textContent.trim() : '';
      }, item);

      const subCategoryElements = await item.$$('.header-nav__menu-link');
          
      const subCategories = await Promise.all(subCategoryElements.map(async (sub) => {
        const title = await sub.evaluate(el => el.textContent.trim());
        const falseUrl = await sub.evaluate(el => el.getAttribute("href"));
        const validUrl =  "https://es.newchic.com" + falseUrl;

        return {
          title: String(title),
          url: validUrl
        };
      }));

      return {
        category: String(category),
        subCategories,
      };
    })
  );
    console.log("categorias obtenidas");
    
  return getCategories;
};

export const createLinkAfiliate = async (page:Page,text:string) => {

  

  // copiar texto en portapapeles


  
  
}