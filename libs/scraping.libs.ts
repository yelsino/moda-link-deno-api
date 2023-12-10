import  { Page } from "npm:puppeteer"

interface LoginFaceebok {
  email: string;
  password: string;
  page: Page;
}
export const loginWithFacebook = async ({email, password, page}:LoginFaceebok) => {
  await page.click(".facebook-login-js");
  page.waitForSelector
  const newPagePromise = new Promise(x => page.once('popup', x));
  const newPage:any = await newPagePromise;
  await new Promise(r => setTimeout(r, 1000));
  const inputEmail = await newPage.waitForSelector("#email");
  const inputPassword = await newPage.waitForSelector("#pass");
  await inputEmail?.type(email);
  await inputPassword?.type(password);
  newPage.click("#loginbutton");
}