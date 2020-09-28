"use strict";
/* jshint node:true */

/**
 * Activity Type
 *
 * API: Activitytype
 *
 * @description: Activity type stores details about basic types of activities that are stored in activity content type.
 */

const { buildQuery, convertRestQueryParams } = require("strapi-utils"); // removes private fields and its relations from model
const utils = require("../../../config/utils.js");
const _ = require("lodash");

module.exports = {
  getActivityTypes: async (ctx) => {
    const { page, query, pageSize } = utils.getRequestParams(ctx.request.query);
    let filters = convertRestQueryParams(query, { limit: -1 });
    let sort;
    if (filters.sort) {
      sort = filters.sort;
      filters = _.omit(filters, ["sort"]);
    }

    return strapi
      .query("activitytype", "crm-plugin")
      .model.query(
        buildQuery({
          model: strapi.plugins["crm-plugin"].models["activitytype"],
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
