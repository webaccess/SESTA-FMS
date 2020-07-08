"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

// module.exports = {
//   find: async (ctx) => {
//     console.log("--- bankdetail ctx.state.user --", ctx.state.user);
//   },
// };
const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  /**
   * Retrieve records.
   *
   * @return {Array}
   */

  async find(ctx) {
    console.log("--- ctx banckdetail--", ctx.params);
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.bankdetail.search(ctx.query);
    } else {
      entities = await strapi.services.bankdetail.find(ctx.query);
    }

    return entities.map((entity) =>
      sanitizeEntity(entity, { model: strapi.models.bankdetail })
    );
  },
};
