"use strict";

const {
  sanitizeEntity,
  convertRestQueryParams,
  buildQuery,
} = require("strapi-utils"); // removes private fields and its relations from model
const vm = require("vm");
const utils = require("../../../config/utils.js");
const _ = require("lodash");

module.exports = {
  /** get activities - CSP user */
  getActivities: async (ctx) => {
    const { page, query, pageSize } = utils.getRequestParams(ctx.request.query);
    let filters = convertRestQueryParams(query, { limit: -1 });
    let sort;
    if (filters.sort) {
      sort = filters.sort;
      filters = _.omit(filters, ["sort"]);
    }
    return strapi
      .query("activity", "crm-plugin")
      .model.query(
        buildQuery({
          model: strapi.plugins["crm-plugin"].models["activity"],
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
  },
};
