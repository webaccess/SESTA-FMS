"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
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
