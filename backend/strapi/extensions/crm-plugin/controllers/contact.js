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
      if (orgPromise.length > 0) {
        orgPromise.map(async (model, index) => {
          if (model) {
            Object.assign(contact[index]["organization"], {
              vos: model[0].vos,
            });
          }
        });
      }

      //assign state, district & village name
      const addressPromise = await Promise.all(
        await contact.map(async (val, index) => {
          if (val.addresses) {
            return await strapi
              .query("address", "crm-plugin")
              .find({ id: val.addresses.id, "contact.id": val.id });
          }
        })
      );
      if (addressPromise.length > 0) {
        addressPromise.map(async (model, index) => {
          if (model) {
            if (model[0].state) {
              Object.assign(contact[index], {
                stateName: model[0].state.name,
              });
            }
            if (model[0].district) {
              Object.assign(contact[index], {
                districtName: model[0].district.name,
              });
            }
            if (model[0].village) {
              Object.assign(contact[index], {
                villageName: model[0].village.name,
              });
            }
          }
        });
      }

      //assign shg name
      const shgPromise = await Promise.all(
        await contact.map(async (val, index) => {
          if (val.individual) {
            if (val.individual.shg !== "" || val.individual.shg !== null) {
              return await strapi
                .query("contact", "crm-plugin")
                .find({ id: val.individual.shg });
            }
          }
        })
      );
      if (shgPromise.length > 0) {
        shgPromise.map(async (model, index) => {
          if (model) {
            Object.assign(contact[index], {
              shgName: model[0].name,
            });
          }
        });
      }

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
      await new Promise(async (resolve, reject) => {
        if (entity.organization) {
          const orgs = await strapi
            .query("organization", "crm-plugin")
            .find({ id: entity.organization.id, "contact.id": entity.id });
          if (orgs.length > 0) {
            orgs.map(async (model, index) => {
              Object.assign(entity.organization, {
                vos: model.vos,
              });
            });
          }
        }

        //assign state, district & village name
        if (entity.addresses) {
          const addresses = await strapi
            .query("address", "crm-plugin")
            .find({ id: entity.addresses.id, "contact.id": entity.id });
          if (addresses.length > 0) {
            addresses.map(async (model, index) => {
              if (model) {
                if (model.state) {
                  Object.assign(entity, {
                    stateName: model.state.name,
                  });
                }
                if (model.district) {
                  Object.assign(entity, {
                    districtName: model.district.name,
                  });
                }
                if (model.village) {
                  Object.assign(entity, {
                    villageName: model.village.name,
                  });
                }
              }
            });
          }
        }

        //assign shg name for members
        if (entity.individual) {
          if (entity.individual.shg !== "" || entity.individual.shg !== null) {
            const shgs = await strapi
              .query("contact", "crm-plugin")
              .find({ id: entity.individual.shg });
            if (shgs.length > 0) {
              shgs.map(async (model, index) => {
                Object.assign(entity, {
                  shgName: model.name,
                });
              });
            }
          }
        }

        return resolve(entity);
      });

      // returns contact obj
      return sanitizeEntity(entity, {
        model: strapi.plugins["crm-plugin"].models["contact"],
      });
    } catch (error) {
      return ctx.badRequest(null, error.message);
    }
  },
};
