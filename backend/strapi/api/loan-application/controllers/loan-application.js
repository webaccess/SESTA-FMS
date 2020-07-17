"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const fs = require("fs");
var path = require("path");
const puppeteer = require("puppeteer");
module.exports = {
  printPDF: async (ctx) => {
    try {
      const content = fs.readFileSync(
        path.resolve(__dirname, "../../../assets/files/Loan-Application.html"),
        "utf-8"
      );
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setContent(content);
      const buffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          left: "0px",
          top: "0px",
          right: "0px",
          bottom: "0px",
        },
      });
      await browser.close();
      return ctx.send(buffer);
    } catch (error) {
      console.error(error);
      return ctx.badRequest(null, error.message);
    }
  },
};
