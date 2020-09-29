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
const {
  sanitizeEntity,
  convertRestQueryParams,
  buildQuery,
} = require("strapi-utils"); // removes private fields and its relations from model
const vm = require("vm");
const utils = require("../../../config/utils.js");
const _ = require("lodash");

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

  /** get SHGs of all VOs associated with logged in FPO user */
  getShg: async (ctx) => {
    const { page, query, pageSize } = utils.getRequestParams(ctx.request.query);
    let filters = convertRestQueryParams(query, { limit: -1 });
    let sort;
    if (filters.sort) {
      sort = filters.sort;
      filters = _.omit(filters, ["sort"]);
    }
    try {
      if (ctx.query.id) {
        const orgPromise = await strapi.query("contact", "crm-plugin").find({
          contact_type: "organization",
          "organization.sub_type": "VO",
          "organization.fpo": ctx.query.id,
        });
        if (orgPromise.length > 0) {
          const voIds = orgPromise.map((r) => r.id);
          const voIdsQuery = [
            { field: "organization.vos.id", operator: "in", value: voIds },
          ];
          if (filters.where && filters.where.length > 0) {
            filters.where = [...filters.where, ...voIdsQuery];
          } else {
            filters.where = [...voIdsQuery];
          }
          filters.where.shift();

          return strapi
            .query("contact", "crm-plugin")
            .model.query(
              buildQuery({
                model: strapi.plugins["crm-plugin"].models["contact"],
                filters,
              })
            )
            .fetchAll()
            .then(async (res) => {
              let data = res.toJSON();
              // Sorting ascending or descending on one or multiple fields
              if (sort && sort.length) {
                data = utils.sort(data, sort);
              }
              const response = utils.paginate(data, page, pageSize);
              const response1 = await utils.assignData(response);

              return {
                result: response1.result,
                ...response.pagination,
              };
            });
        }
      } else {
        // for sesta, super and FPO admins
        return strapi
          .query("contact", "crm-plugin")
          .model.query(
            buildQuery({
              model: strapi.plugins["crm-plugin"].models["contact"],
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
            const response1 = await utils.assignData(response);

            return {
              result: response1.result,
              ...response.pagination,
            };
          });
      }
    } catch (error) {
      return ctx.badRequest(null, error.message);
    }
  },

  /** get Member count */
  getMemberCount: async (ctx) => {
    try {
      return await strapi.query("contact", "crm-plugin").count({
        contact_type: "individual",
        user_null: true,
      });
    } catch (error) {
      return ctx.badRequest(null, error.message);
    }
  },

  /** get VO count */
  getVoCount: async (ctx) => {
    try {
      if (ctx.query.id) {
        return await strapi.query("contact", "crm-plugin").count({
          contact_type: "organization",
          "organization.sub_type": "VO",
          "organization.fpo": ctx.query.id,
        });
      } else {
        return await strapi.query("contact", "crm-plugin").count({
          contact_type: "organization",
          "organization.sub_type": "VO",
        });
      }
    } catch (error) {
      return ctx.badRequest(null, error.message);
    }
  },

  /** get SHG count */
  getShgCount: async (ctx) => {
    try {
      if (ctx.query.id) {
        let contact;
        if (ctx.query._q) {
          // checks if any filter parameter is present
          contact = await strapi
            .query("contact", "crm-plugin")
            .search(ctx.query);
        } else {
          // returns all data if no filter parameter is passed
          contact = await strapi.query("contact", "crm-plugin").find(ctx.query);
        }

        const orgPromise = await Promise.all(
          await contact.map(async (val, index) => {
            return await strapi.query("contact", "crm-plugin").find({
              contact_type: "organization",
              "organization.sub_type": "VO",
              "organization.fpo": ctx.query.id,
            });
          })
        );
        if (orgPromise.length > 0) {
          let voList = [];
          orgPromise.map(async (model, index) => {
            model.map(async (e, i) => {
              voList.push(e.id);
            });
          });
          return await strapi.query("contact", "crm-plugin").count({
            contact_type: "organization",
            "organization.sub_type": "SHG",
            "organization.vos.id_in": voList,
          });
        }
      } else {
        return await strapi.query("contact", "crm-plugin").count({
          contact_type: "organization",
          "organization.sub_type": "SHG",
        });
      }
    } catch (error) {
      return ctx.badRequest(null, error.message);
    }
  },

  /** get Members as per logged in user's role */
  getMembers: async (ctx) => {
    const { page, query, pageSize } = utils.getRequestParams(ctx.request.query);
    let filters = convertRestQueryParams(query, { limit: -1 });
    let sort;
    if (filters.sort) {
      sort = filters.sort;
      filters = _.omit(filters, ["sort"]);
    }

    // for CSP user
    if (ctx.query.id) {
      const contactPromise = await strapi.query("contact", "crm-plugin").find({
        id: ctx.query.id,
      });
      const shgIds = contactPromise[0].org_vos.map((r) => r.contact);
      const shgIdsQuery = [
        { field: "individual.shg", operator: "in", value: shgIds },
      ];
      if (filters.where && filters.where.length > 0) {
        filters.where = [...filters.where, ...shgIdsQuery];
      } else {
        filters.where = [...shgIdsQuery];
      }
      filters.where.shift();
      return strapi
        .query("contact", "crm-plugin")
        .model.query(
          buildQuery({
            model: strapi.plugins["crm-plugin"].models["contact"],
            filters,
          })
        )
        .fetchAll()
        .then(async (res) => {
          let data = res.toJSON();
          // Sorting ascending or descending on one or multiple fields
          if (sort && sort.length) {
            data = utils.sort(data, sort);
          }
          const response = utils.paginate(data, page, pageSize);
          const response1 = await utils.assignData(response);

          return {
            result: response1.result,
            ...response.pagination,
          };
        });
    } else {
      // for sesta, super and FPO admins
      return strapi
        .query("contact", "crm-plugin")
        .model.query(
          buildQuery({
            model: strapi.plugins["crm-plugin"].models["contact"],
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
          const response1 = await utils.assignData(response);

          return {
            result: response1.result,
            ...response.pagination,
          };
        });
    }
  },

  /** get VO as per logged in user role with pagination and filtering  */
  getVo: async (ctx) => {
    const { page, query, pageSize } = utils.getRequestParams(ctx.request.query);
    let filters = convertRestQueryParams(query, { limit: -1 });
    let sort;
    if (filters.sort) {
      sort = filters.sort;
      filters = _.omit(filters, ["sort"]);
    }
    if (ctx.query.id) {
      const fpoIdQuery = [
        { field: "organization.fpo", operator: "eq", value: ctx.query.id },
      ];
      if (filters.where && filters.where.length > 0) {
        filters.where = [...filters.where, ...fpoIdQuery];
      } else {
        filters.where = [...fpoIdQuery];
      }
      filters.where.shift();
      return strapi
        .query("contact", "crm-plugin")
        .model.query(
          buildQuery({
            model: strapi.plugins["crm-plugin"].models["contact"],
            filters,
          })
        )
        .fetchAll()
        .then(async (res) => {
          let data = res.toJSON();
          // Sorting ascending or descending on one or multiple fields
          if (sort && sort.length) {
            data = utils.sort(data, sort);
          }
          const response = utils.paginate(data, page, pageSize);
          const response1 = await utils.assignData(response);

          return {
            result: response1.result,
            ...response.pagination,
          };
        });
    } else {
      // for sesta, super admins
      return strapi
        .query("contact", "crm-plugin")
        .model.query(
          buildQuery({
            model: strapi.plugins["crm-plugin"].models["contact"],
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
    }
  },

  /** get all users as per logged in user role */
  getAllUsers: async (ctx) => {
    const { page, query, pageSize } = utils.getRequestParams(ctx.request.query);
    let filters = convertRestQueryParams(query, { limit: -1 });
    let sort;
    if (filters.sort) {
      sort = filters.sort;
      filters = _.omit(filters, ["sort"]);
    }
    if (ctx.query.id) {
      // For FPO admin
      const query = [
        { field: "creator_id.id", operator: "eq", value: ctx.query.id },
      ];
      if (filters.where && filters.where.length > 0) {
        filters.where = [...filters.where, ...query];
      } else {
        filters.where = [...query];
      }
      filters.where.shift();
    }
    // if user role filter is selected
    if ("user.role" in query) {
      const roles = await strapi
        .query("role", "users-permissions")
        .findOne({ name: query["user.role"] }, []);
      let newArray = [];
      filters.where.map((e) => {
        if (e.field !== "user.role") {
          newArray.push(e);
        }
      });
      filters.where = newArray;
      const roleQuery = [
        { field: "user.role", operator: "eq", value: roles.id },
      ];
      if (filters.where && filters.where.length > 0) {
        filters.where = [...filters.where, ...roleQuery];
      } else {
        filters.where = [...roleQuery];
      }
    }
    // for sesta, super admin
    return strapi
      .query("contact", "crm-plugin")
      .model.query(
        buildQuery({
          model: strapi.plugins["crm-plugin"].models["contact"],
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
        const response1 = await utils.assignUserRoleData(response);
        return {
          result: response1.result,
          ...response.pagination,
        };
      });
  },
};
