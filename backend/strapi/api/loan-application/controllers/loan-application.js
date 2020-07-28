"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const fs = require("fs");
var path = require("path");
const puppeteer = require("puppeteer");
const moment = require("moment");
const { sanitizeEntity } = require("strapi-utils"); // removes private fields and its relations from model

module.exports = {
  printPDF: async (ctx) => {
    console.log("id", ctx.params.id);
    let idVal = ctx.params.id;
    try {
      console.log("services", strapi.services);
      const application = await strapi.controllers["loan-application"].findOne(
        ctx
      );
      // await strapi.services["loan-application"].findOne({
      //   id: idVal,
      // });
      console.log("application", application);
      var content = fs.readFileSync(
        path.resolve(__dirname, "../../../assets/files/Loan-Application.html"),
        "utf-8"
      );

      let shg_name = application.shg.name ? application.shg.name : "";
      // let shg_name = application.shg.name ? application.shg.name : "";
      let shg_bank = application.shg.bankdetail
        ? application.shg.bankdetail.bank_name
        : "";
      let shg_branch = application.shg.bankdetail
        ? application.shg.bankdetail.branch
        : "";
      let shg_ifsc = application.shg.bankdetail
        ? application.shg.bankdetail.ifsc_code
        : "";
      let shg_acc = application.shg.bankdetail
        ? application.shg.bankdetail.account_no
        : "";
      let shg_acc_name = application.shg.bankdetail
        ? application.shg.bankdetail.account_name
        : "";

      let mem_name = application.contact.name ? application.contact.name : "";

      let partner_name = application.individual.partner_name
        ? application.individual.partner_name
        : "";

      let loan_purpose = application.loan_model.product_name
        ? application.loan_model.product_name
        : "";
      let app_no = application.application_no ? application.application_no : "";
      let app_date = "";
      if (application.application_date) {
        var app_date_val = moment(application.application_date);
        app_date = moment(application.application_date).format("D MMMM YYYY");
      }
      let loant_amt = application.loan_model.loan_amount
        .toFixed(2)
        .replace(/(\d)(?=(\d{2})+\d\.)/g, "$1,");

      let fpo_name = application.fpo.organization.name
        ? application.fpo.organization.name
        : "";
      let vo_name = "__________";
      if (application.shg.organization.vos) {
        if (application.shg.organization.vos.length > 0)
          vo_name = application.shg.organization.vos[0].name;
      }
      let shg_village = "__________";
      if (application.shg.villages) {
        if (application.shg.villages.length > 0)
          shg_village = application.shg.villages[0].name;
      }
      let fpo_addr = "";
      let address_1 = application.fpo.address_1
        ? application.fpo.address_1
        : "";
      let address_2 = application.fpo.address_2
        ? "," + application.fpo.address_2
        : "";
      let city = application.fpo.city ? "," + application.fpo.city : "";
      let district_name = application.fpo.district.name
        ? "," + application.fpo.district.name
        : "";
      let state_name = application.fpo.state.name
        ? "," + application.fpo.state.name
        : "";
      let pincode = application.fpo.pincode
        ? "," + application.fpo.pincode
        : "";
      fpo_addr =
        address_1 + address_2 + city + district_name + state_name + pincode;
      var contentVal = content.replace(/{FPO_NAME}/g, fpo_name);
      contentVal = contentVal.replace(/{FPO_ADDR}/g, fpo_addr);
      contentVal = contentVal.replace(/{APP_NO}/g, app_no);
      contentVal = contentVal.replace(/{APP_DATE}/g, app_date);
      contentVal = contentVal.replace(/{SHG_NAME}/g, shg_name);
      contentVal = contentVal.replace(/{SHG_VILLAGE}/g, shg_village);
      contentVal = contentVal.replace(/{SHG_BANK}/g, shg_bank);
      contentVal = contentVal.replace(/{SHG_BANK_BRANCH}/g, shg_branch);
      contentVal = contentVal.replace(/{SHG_ACC_NO}/g, shg_acc);
      contentVal = contentVal.replace(/{SHG_BANK_IFSC}/g, shg_ifsc);
      contentVal = contentVal.replace(/{SHG_ACC_NAME}/g, shg_acc_name);
      contentVal = contentVal.replace(/{MEMBER_NAME}/g, mem_name);
      contentVal = contentVal.replace(/{MEMBER_HUSBAND_NAME}/g, partner_name);
      contentVal = contentVal.replace(/{LOAN_PURPOSE}/g, loan_purpose);
      contentVal = contentVal.replace(/{LOAN_AMOUNT}/g, loant_amt);
      contentVal = contentVal.replace(/{VO_NAME}/g, vo_name);
      // LOAN_PURPOSE
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
          right: "50px",
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
  findOne: async (ctx) => {
    const { id } = ctx.params;

    var entity = await strapi.services["loan-application"].findOne({ id });
    // if (entity.contact["individual"]) {
    // console.log("val", entity.contact.individual);
    entity["individual"] = entity.contact.individual;

    let ind = await strapi.query("individual", "crm-plugin").findOne({
      id: entity.contact.individual,
    });
    // console.log("vv", ind.shg);
    // console.log("ind", ind);
    entity["individual"] = ind;
    if (entity["individual"].shg) {
      let shg = await strapi.query("contact", "crm-plugin").findOne({
        id: entity["individual"].shg.id,
      });
      entity["shg"] = shg;
      console.log("shg", shg);
      if (entity["shg"]["organization"]["bankdetail"]) {
        entity["shg"]["bankdetail"] = await strapi.query("bankdetail").findOne({
          id: entity["shg"]["organization"]["bankdetail"],
        });
      }
      if (entity.loan_model.fpo) {
        entity.fpo = await strapi.query("contact", "crm-plugin").findOne({
          id: entity.loan_model.fpo,
        });
      }
    }
    // }
    return sanitizeEntity(entity, { model: strapi.models["loan-application"] });
  },
};
