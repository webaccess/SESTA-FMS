"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const fs = require("fs");
var path = require("path");
const puppeteer = require("puppeteer");
const moment = require("moment");
const utils = require("../../../config/utils.js");
const {
  sanitizeEntity,
  convertRestQueryParams,
  buildQuery,
} = require("strapi-utils"); // removes private fields and its relations from model
const _ = require("lodash");

module.exports = {
  printPDF: async (ctx) => {
    let idVal = ctx.params.id;
    try {
      const application = await strapi.controllers[
        "loan-application"
      ].pdfGenFindOne(ctx);
      var content = fs.readFileSync(
        path.resolve(__dirname, "../../../assets/files/Loan-Application.html"),
        "utf-8"
      );

      let shg_name = application.shg.name ? application.shg.name : "";
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
      if (application.shg_village) {
        //if (application.shg_village.length > 0)
        shg_village = application.shg_village.name;
      }
      let fpo_addr = "";
      let address_1 = application.fpo_add.address_line_1
        ? application.fpo_add.address_line_1
        : "";
      let address_2 = application.fpo_add.address_line_2
        ? "," + application.fpo_add.address_line_2
        : "";
      let city = application.fpo_add.city ? "," + application.fpo_add.city : "";
      let district_name = application.fpo_add.district
        ? "," + application.fpo_district.name
        : "";
      let state_name = application.fpo_add.state
        ? "," + application.fpo_state.name
        : "";
      let pincode = application.fpo_add.pincode
        ? "," + application.fpo_add.pincode
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
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setContent(contentVal);
      const buffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          left: "0px",
          top: "50px",
          right: "50px",
          bottom: "70px",
        },
      });
      await browser.close();
      return ctx.send(buffer);
    } catch (error) {
      console.error(error);

      return ctx.badRequest(null, error.message);
    }
  },

  pdfGenFindOne: async (ctx) => {
    const { id } = ctx.params;

    var entity = await strapi.services["loan-application"].findOne({ id });

    entity["individual"] = entity.contact.individual;

    let ind = await strapi.query("individual", "crm-plugin").findOne({
      id: entity.contact.individual,
    });

    entity["individual"] = ind;
    if (entity["individual"].shg) {
      let shg = await strapi.query("contact", "crm-plugin").findOne({
        id: entity["individual"].shg.id,
      });
      entity["shg"] = shg;

      if (entity["shg"]["organization"]["bankdetail"]) {
        entity["shg"]["bankdetail"] = await strapi.query("bankdetail").findOne({
          id: entity["shg"]["organization"]["bankdetail"],
        });
      }

      // if (entity["shg"]["organization"]) {
      entity["shg"]["organization"] = await strapi
        .query("organization", "crm-plugin")
        .findOne({
          id: entity["shg"]["organization"]["id"],
        });

      if (entity.shg.addresses.length > 0) {
        entity.shg_village = await strapi
          .query("village", "crm-plugin")
          .findOne({
            id: entity.shg.addresses[0].village,
          });
      }
      if (entity.loan_model.fpo) {
        entity.fpo = await strapi.query("contact", "crm-plugin").findOne({
          id: entity.loan_model.fpo,
        });
      }
      if (entity.fpo.addresses.length > 0) {
        entity.fpo_add = entity.fpo.addresses[0];
        entity.fpo_state = await strapi.query("state", "crm-plugin").findOne({
          id: entity.fpo_add.state,
        });
        entity.fpo_district = await strapi
          .query("district", "crm-plugin")
          .findOne({
            id: entity.fpo_add.district,
          });
      }
    }
    // }
    return sanitizeEntity(entity, { model: strapi.models["loan-application"] });
  },

  getLoansCount: async (ctx) => {
    const { query } = utils.getRequestParams(ctx.request.query);
    let filters = convertRestQueryParams(query, { limit: -1 });
    const statusQuery = [
      { field: "status", operator: "in", value: ["Approved", "InProgress"] },
    ];

    if (filters.where && filters.where.length > 0) {
      filters.where = [...filters.where, ...statusQuery];
    } else {
      filters.where = [...statusQuery];
    }
    try {
      if (ctx.query.status === "UnderReview") {
        return await strapi.query("loan-application").count({
          status: "UnderReview",
        });
      } else {
        return strapi
          .query("loan-application")
          .model.query(
            buildQuery({
              model: strapi.models["loan-application"],
              filters,
            })
          )
          .fetchAll({})
          .then(async (res) => {
            let loans = res.toJSON();
            return loans.length;
          });
      }
    } catch (error) {
      return ctx.badRequest(null, error.message);
    }
  },

  getLoanDetails: async (ctx) => {
    try {
      let loanDistributedAmounts = [];
      let loanDistributedVal = 0;
      let actualPrincipalPaid = 0;
      let actualInterestPaid = 0;
      let actualFinePaid = 0;
      let outstandingAmount = 0;
      let loansDetails = [];
      let purposeList = [];
      let purposes = [];
      let purposesValues = [];
      const { query } = utils.getRequestParams(ctx.request.query);
      let filters = convertRestQueryParams(query, { limit: -1 });
      const statusQuery = [
        { field: "status", operator: "in", value: ["Approved", "InProgress"] },
      ];

      if (filters.where && filters.where.length > 0) {
        filters.where = [...filters.where, ...statusQuery];
      } else {
        filters.where = [...statusQuery];
      }
      if (ctx.query.status) {
        return strapi
          .query("loan-application")
          .model.query(
            buildQuery({
              model: strapi.models["loan-application"],
              filters,
            })
          )
          .fetchAll({})
          .then(async (res) => {
            let loans = res.toJSON();
            loans.map((e, i) => {
              let emiPaid = 0;
              /** loan amount distributed*/
              loanDistributedVal += e.loan_model.loan_amount;
              e.loan_app_installments.map((emi, index) => {
                if (emi.actual_principal) {
                  actualPrincipalPaid += emi.actual_principal;
                }
                if (emi.actual_interest) {
                  actualInterestPaid += emi.actual_interest;
                }
                if (emi.fine) {
                  actualFinePaid += emi.fine;
                }
                let totalPaid = emi.actual_principal + emi.actual_interest;
                emiPaid += totalPaid;
              });
              /** Loans table */
              outstandingAmount = e.loan_model.loan_amount - emiPaid;
              loansDetails.push({
                memberName: e.contact.name,
                loanAmount: e.loan_model.loan_amount,
                outstandingAmount: outstandingAmount,
                loanDate: e.application_date,
              });
            });
            loanDistributedAmounts.push(
              loanDistributedVal,
              actualPrincipalPaid + actualInterestPaid + actualFinePaid
            );
            // sort loanDetails with latest date first
            loansDetails.sort(
              (a, b) =>
                new Date(...b.loanDate.split("/").reverse()) -
                new Date(...a.loanDate.split("/").reverse())
            );
            const data = {
              loanDistributedAmounts: loanDistributedAmounts,
              totalLoanDistributed:
                loanDistributedAmounts[0] + loanDistributedAmounts[1],
              loansTableData: loansDetails.slice(0, 5),
              loansAllDetails: loansDetails,
            };
            return data;
          });
      } else {
        return strapi
          .query("loan-application")
          .model.query(
            buildQuery({
              model: strapi.models["loan-application"],
              filters,
            })
          )
          .fetchAll({})
          .then(async (res) => {
            let loans = res.toJSON();
            loans.map((loan, i) => {
              purposeList.push(loan.loan_model.product_name);
            });

            var map = purposeList.reduce(function (prev, cur) {
              prev[cur] = (prev[cur] || 0) + 1;
              return prev;
            }, {});
            Object.keys(map).map((key, i) => {
              purposes.push(key.toUpperCase());
              purposesValues.push(map[key]);
            });
            const purposeData = {
              purposes: purposes,
              purposesValues: purposesValues,
            };
            return purposeData;
          });
      }
    } catch (error) {
      return ctx.badRequest(null, error.message);
    }
  },

  getLoanReportDetails: async (ctx) => {
    const { page, query, pageSize } = utils.getRequestParams(ctx.request.query);
    let filters = convertRestQueryParams(query, { limit: -1 });

    try {
      let loanDistributedVal = 0;
      let actualPrincipalPaid = 0;
      let actualInterestPaid = 0;
      const query = [
        { field: "status", operator: "in", value: ["Approved", "InProgress"] },
      ];

      if (filters.where && filters.where.length > 0) {
        filters.where = [...filters.where, ...query];
      } else {
        filters.where = [...query];
      }

      return strapi
        .query("loan-application")
        .model.query(
          buildQuery({
            model: strapi.models["loan-application"],
            filters,
          })
        )
        .fetchAll({})
        .then(async (res) => {
          let loans = res.toJSON();
          loans.map((e, i) => {
            /** loan amount distributed*/
            loanDistributedVal += e.loan_model.loan_amount;
            e.loan_app_installments.map((emi, index) => {
              if (emi.actual_principal) {
                actualPrincipalPaid += emi.actual_principal;
              }
              if (emi.actual_interest) {
                actualInterestPaid += emi.actual_interest;
              }
            });
          });

          const data = [
            {
              data: {
                loanDistributedAmount: loanDistributedVal,
                repaymentAmount: actualPrincipalPaid,
                interestAmount: actualInterestPaid,
              },
            },
            { loanDistributedAmount: loanDistributedVal },
            { repaymentAmount: actualPrincipalPaid },
            { interestAmount: actualInterestPaid },
          ];
          return data;
        });
    } catch (error) {
      return ctx.badRequest(null, error.message);
    }
  },

  getLoanApplicationModels: async (ctx) => {
    const { page, query, pageSize } = utils.getRequestParams(ctx.request.query);
    let filters = convertRestQueryParams(query, { limit: -1 });
    let sort;
    if (filters.sort) {
      sort = filters.sort;
      filters = _.omit(filters, ["sort"]);
    }
    if (ctx.query.id) {
      const individual = await strapi.query("individual", "crm-plugin").find({
        shg_null: false,
        "shg.id": ctx.query.id,
      });
      let shgIds = [];
      if (individual.length > 0) {
        individual.map((ind) => {
          if (ind.contact !== null) {
            shgIds.push(ind.contact.id);
          }
        });
        const shgQuery = [
          { field: "contact.id", operator: "in", value: shgIds },
        ];

        if (filters.where && filters.where.length > 0) {
          filters.where = [...filters.where, ...shgQuery];
        } else {
          filters.where = [...shgQuery];
        }
        if (ctx.query.creator_id) {
          filters.where.splice(1, 1);
        } else {
          filters.where.shift();
        }
      }
    }
    console.log("--filters--", filters);
    try {
      return strapi
        .query("loan-application")
        .model.query(
          buildQuery({
            model: strapi.models["loan-application"],
            filters,
          })
        )
        .fetchAll({})
        .then(async (res) => {
          let data = res.toJSON();

          // Sorting ascending or descending on one or multiple fields
          if (sort && sort.length) {
            data = utils.sort(data, sort);
          }
          const response = utils.paginate(data, page, pageSize);

          return {
            result: response.result,
            ...response.pagination,
          };
        });
    } catch (error) {
      return ctx.badRequest(null, error.message);
    }
  },
};
