"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { sanitizeEntity } = require("strapi-utils");
module.exports = {
  async find(ctx) {
    let org;
    console.log("query", ctx.query);
    if (ctx.query._q) {
      console.log("case1");
      org = await strapi.services.organization.search(ctx.query);
    } else {
      console.log("case2");
      org = await strapi.services.organization.find(ctx.query);
    }

    org.map(async (organization) => {
      //for contact
      let contact = await strapi.services.contact.find({
        id: organization.contact.id,
      });
      organization.contact = contact[0];

      //for vo
      if (organization.vo) {
        let vo = await strapi.services.contact.find({
          id: organization.vo.id,
        });
        organization.vo = vo[0];
      }

      //if fpo then add
      if (organization.fpo) {
        let fpo = await strapi.services.contact.find({
          id: organization.fpo.id,
        });
        organization.fpo = fpo[0];
      }
    });

    console.log("ctx.query", org);
    return org.map((entity) =>
      sanitizeEntity(entity, { model: strapi.models.organization })
    );
  },

  async create(ctx) {
    // create contact
    let contact = await strapi.services.contact.create(ctx.request.body);

    let orgOtherDetails = {};
    //create bank detail
    if (ctx.request.body["account_name"]) {
      let bankDetail = await strapi.services.bankdetail.create(
        ctx.request.body
      );
      orgOtherDetails = { contact: contact.id, bankdetail: bankDetail.id };
    } else orgOtherDetails = { contact: contact.id };

    //create org
    let orgDetails = Object.assign(orgOtherDetails, ctx.request.body);
    let org = await strapi.services.organization.create(orgDetails);

    console.log("data", ctx.request.body);
    console.log("org", org);
    return sanitizeEntity(org, { model: strapi.models.organization });
  },

  async update(ctx) {
    console.log("params", ctx.params);
    console.log("body", ctx.request.body);
    // update contact
    let contact = await strapi.services.contact.update(
      { organization: ctx.params.id },
      ctx.request.body
    );
    console.log("contact", contact);

    let orgOtherDetails = {};
    //update bank detail
    let bankDetail;
    if (ctx.request.body["account_name"]) {
      if (contact.organization.bankdetail != null) {
        bankDetail = await strapi.services.bankdetail.update(
          { organization: contact.organization.id },
          ctx.request.body
        );
      } else {
        bankDetail = await strapi.services.bankdetail.create(ctx.request.body);
      }

      orgOtherDetails = { contact: contact.id, bankdetail: bankDetail.id };
    } else {
      if (
        !ctx.request.body.hasBankDetails &&
        contact.organization.bankdetail != null
      )
        bankDetail = await strapi.services.bankdetail.delete({
          id: contact.organization.bankdetail,
        });
      orgOtherDetails = { contact: contact.id };
    }
    //update org
    let orgDetails = Object.assign(orgOtherDetails, ctx.request.body);
    let org = await strapi.services.organization.update(ctx.params, orgDetails);
    return sanitizeEntity(org, { model: strapi.models.organization });
  },

  async delete(ctx) {
    const contact = await strapi.services.contact.delete({
      organization: ctx.params.id,
    });
    const bankdetail = await strapi.services.bankdetail.delete({
      organization: ctx.params.id,
    });
    const org = await strapi.services.organization.delete(ctx.params);
    console.log("org", org);
    return sanitizeEntity(org, { model: strapi.models.organization });
  },
};
