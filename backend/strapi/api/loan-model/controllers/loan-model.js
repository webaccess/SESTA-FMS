"use strict";
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
  async getLoanModels(ctx) {
    const { page, query, pageSize } = utils.getRequestParams(ctx.request.query);
    let filters = convertRestQueryParams(query, { limit: -1 });
    let sort;
    if (filters.sort) {
      sort = filters.sort;
      filters = _.omit(filters, ["sort"]);
    }
    try {
      return strapi
        .query("loan-model")
        .model.query(
          buildQuery({
            model: strapi.models["loan-model"],
            filters,
            //rest: ["fpo", "loantasks.activitytype", "emidetails"],
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
  async find(ctx) {
    const filters = ctx.request.query;
    const data = await strapi
      .query("loan-model")
      .find(filters, ["fpo", "loantasks.activitytype", "emidetails"]);
    //.find(filters, ["fpo", "loantasks.activitytype"]);
    return data;
  },
  async findOne(ctx) {
    const filters = ctx.request.query;
    const { id } = ctx.params; // get id from context object
    const data = await strapi
      .query("loan-model")
      .findOne({ id }, ["fpo", "loantasks.activitytype", "emidetails"]);
    //.find(filters, ["fpo", "loantasks.activitytype"]);
    return data;
  },
};
