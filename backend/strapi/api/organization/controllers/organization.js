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
    //for contact
    let contact = await strapi.services.contact.find({
      id: org[0].contact.id,
    });
    org[0].contact = contact[0];

    //for vo
    if (org[0].vo) {
      let vo = await strapi.services.contact.find({
        id: org[0].vo.id,
      });
      org[0].vo = vo[0];
    }

    //if fpo then add
    if (org[0].fpo) {
      let fpo = await strapi.services.contact.find({
        id: org[0].fpo.id,
      });
      org[0].fpo = fpo[0];
    }

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
      ctx.params,
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
    let org = await strapi.services.organization.update(
      { id: contact.organization.id },
      orgDetails
    );
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
