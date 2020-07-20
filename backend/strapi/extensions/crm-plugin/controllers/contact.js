"use strict";

/**
 * Contact
 *
 * API: Contact
 *
 * ctx: Context object contains request parameters
 *
 * @description: Contact stores contact details like address, email, phone, etc of an individual or an organization or of a user in the system.
 */
const { sanitizeEntity } = require("strapi-utils"); // removes private fields and its relations from model
const vm = require("vm");
module.exports = {
  /**
   * Method: find
   * Parameters:
   *    - Request object
   *      - Filters / Column attributes (Optional)
   * @description: This method returns all the contact details by default or specific contact details based on the filters passed to the method.
   */
  find: async (ctx) => {
    try {
      // ctx.query._q: filter parameters in context object
      let contact;
      if (ctx.query._q) {
        // checks if any filter parameter is present
        contact = await strapi.query("contact", "crm-plugin").search(ctx.query);
      } else {
        // returns all data if no filter parameter is passed
        contact = await strapi.query("contact", "crm-plugin").find(ctx.query);
      }

      // assign vos array in the organization object (as we added many-to-many relationship)
      const orgPromise = await Promise.all(
        await contact.map(async (val, index) => {
          if (val.organization) {
            return await strapi
              .query("organization", "crm-plugin")
              .find({ id: val.organization.id, "contact.id": val.id });
          }
        })
      );
      orgPromise.map(async (model, index) => {
        Object.assign(contact[index]["organization"], {
          vos: model[0].vos,
        });
      });

      // returns contact obj
      return contact.map((entity) =>
        sanitizeEntity(entity, {
          model: strapi.plugins["crm-plugin"].models["contact"],
        })
      );
    } catch (error) {
      return ctx.badRequest(null, error.message);
    }
  },

  /**
   * Method: findOne
   * Parameters:
   *    - Request object
   *      - id - identifier of contact table
   * @description: This method returns specific contact details based on the id passed.
   */
  findOne: async (ctx) => {
    const { id } = ctx.params; // get id from context object
    try {
      const entity = await strapi
        .query("contact", "crm-plugin")
        .findOne({ id });

      // assign vos array in the organization object (as we added many-to-many relationship)
      if (entity.organization) {
        await new Promise(async (resolve, reject) => {
          const orgs = await strapi
            .query("organization", "crm-plugin")
            .find({ id: entity.organization.id, "contact.id": entity.id });
          orgs.map(async (model, index) => {
            Object.assign(entity.organization, {
              vos: model.vos,
            });
          });
          return resolve(entity);
        });
      }

      // returns contact obj
      return sanitizeEntity(entity, {
        model: strapi.plugins["crm-plugin"].models["contact"],
      });
    } catch (error) {
      return ctx.badRequest(null, error.message);
    }
  },
};
