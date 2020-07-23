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
    console.log("id", ctx.params.id);
    try {
      var content = fs.readFileSync(
        path.resolve(__dirname, "../../../assets/files/Loan-Application.html"),
        "utf-8"
      );
      var contentVal = content.replace(/{FPO_NAME}/g, "Tanvi");
      // SHG_VILLAGE;
      // SHG_NAME;
      // VO_NAME;
      // SHG_ACC_NO;
      // SHG_BANK;
      // SHG_BANK_BRANCH;
      // SHG_BANK_IFSC;
      //{MEMBER_NAME}
      //MEMBER_HUSBAND_NAME
      // await fs.writeFileSync(
      //   path.resolve(__dirname, "../../../assets/files/Loan-Application1.html"),
      //   contentVal
      // );
      // console.log("content");
      // return ctx.send(contentVal);
      // fs.writeFile(
      //   __dirname,
      //   "../../../assets/files/Loan-Application1.html",
      //   "utf-8",
      //   contentVal,
      //   function (err, data) {
      //     if (err) {
      //       return console.log(err);
      //     }
      //     console.log(data);
      //   }
      // );
      // fs.writeFileSync(
      //   path.resolve(__dirname, "../../../assets/files/Loan-Application1.html"),
      //   contentVal,
      //   "utf-8"
      // );
      // const contentObt = fs.readFileSync(
      //   path.resolve(__dirname, "../../../assets/files/Loan-Application.html"),
      //   "utf-8"
      // );
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setContent(contentVal);
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
      console.log("enters this");
      // ctx.type = "application/pdf; charset=utf-8";
      // ctx.set("Content-Disposition: attachment; filename=Loan_application.pdf");
      // ctx.body = buffer;
      return ctx.send(buffer);
    } catch (error) {
      console.error(error);

      return ctx.badRequest(null, error.message);
    }
  },
};
