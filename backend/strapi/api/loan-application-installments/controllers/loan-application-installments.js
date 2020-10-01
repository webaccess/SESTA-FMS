'use strict';
const {
  sanitizeEntity,
  convertRestQueryParams,
  buildQuery,
} = require("strapi-utils"); // removes private fields and its relations from model
const utils = require("../../../config/utils.js");
const _ = require("lodash");
/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {

  emiDueDetails: async (ctx) => {
    const { page, query, pageSize } = utils.getRequestParams(ctx.request.query);
    let filters = convertRestQueryParams(query, { limit: -1 });
    let sort;
    let loanInstallmentData = [];
    if (filters.sort) {
      sort = filters.sort;
      filters = _.omit(filters, ["sort"]);
    }
    try {
      return strapi
        .query("loan-application-installments")
        .model.query(
          buildQuery({
            model: strapi.models["loan-application-installments"],
            filters,
          })
        )
        .fetchAll({})
        .then(async (res) => {
          let data = res.toJSON();
          const loanData = await strapi.query("loan-application").find({});

          data.map(ldata => {
            if (ldata.actual_principal == null && ldata.actual_interest == null) {
              loanData.map(ld => {
                // calculate pending loan amount
                let pendingAmount =
                  ldata.expected_principal + ldata.expected_interest;
                ldata.pendingAmount = pendingAmount;

                // get Member name and EMI
                if (ld.id == ldata.loan_application.id) {
                  if (ld.contact) {
                    ldata.loan_application.memName = ld.contact.name;
                    ldata.emi = ld.loan_model.emi;
                    ldata.loan_application.contact = ld.contact;
                  }
                }
              })
              loanInstallmentData.push({
                id: ldata.id,
                pendingAmount: ldata.pendingAmount,
                emi: ldata.emi,
                loan_application: {
                  id: ldata.loan_application.id,
                  memName: ldata.loan_application.memName,
                  purpose: ldata.loan_application.purpose,
                  contact: {
                    name: ldata.loan_application.contact.name
                  }
                },
                payment_date: ldata.payment_date,
                creator_id: ldata.loan_application.creator_id,
              });
            }
          })

          // Sorting ascending or descending on one or multiple fields
          if (sort && sort.length) {
            loanInstallmentData = utils.sort(loanInstallmentData, sort);
          }
          const response = utils.paginate(loanInstallmentData, page, pageSize);
          return {
            result: response.result,
            ...response.pagination,
          };
        })
    } catch (error) {
      return ctx.badRequest(null, error.message);
    }
  },
};
