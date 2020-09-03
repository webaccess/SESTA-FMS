"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
var crypto = require("crypto");
const bookshelf = require("../../../config/bookshelf");
module.exports = {
  async requestOTP(ctx) {
    const num = ctx.request.body.contact_number;
    const OTP = Math.floor(100000 + Math.random() * 900000);
    await strapi.services.otp.sendOTP(num, OTP);
    return await strapi
      .query("otp")
      .model.forge({ contact_number: num, otp: OTP })
      .save()
      .then(() => {
        return {
          result: { status: "Ok" },
        };
      });
  },

  async validateOTP(ctx) {
    const { otp, contact_number } = ctx.request.body;
    let today = new Date();

    const otpModel = await strapi
      .query("otp")
      .model.query((qb) => {
        qb.where({
          contact_number: parseInt(contact_number),
          otp: parseInt(otp),
          is_verified: null,
        });
        qb.orWhere({
          contact_number: parseInt(contact_number),
          otp: parseInt(otp),
          is_verified: false,
        });
      })
      .fetch()
      .then((model) => model);

    console.log("loh", otpModel);

    const result = otpModel.toJSON ? otpModel.toJSON() : otpModel;
    let createdAt = new Date(result.created_at);
    console.log("creat", createdAt);
    console.log("today", today);
    const diff = (today.getTime() - createdAt.getTime()) / 60000;
    console.log("diff", diff);
    if (diff > 60.0) {
      return ctx.response.badRequest("OTP has expired");
    } else {
      await bookshelf
        .transaction(async (t) => {
          await otpModel.save(
            { is_verified: true },
            { patch: true, transacting: t }
          );
          console.log("cclog");
          const resetPasswordToken = crypto.randomBytes(64).toString("hex");
          console.log("cclog2");
          const contact = await strapi
            .query("contact", "crm-plugin")
            .findOne({ phone: contact_number });

          console.log("cc", contact);

          if (!contact) {
            return Promise.reject("Contact does not exist");
          }
          console.log("cclog3");
          await strapi
            .query("user", "users-permissions")
            .model.where({ id: contact.user.id })
            .save(
              { resetPasswordToken: resetPasswordToken },
              { patch: true, transacting: t }
            );
          console.log("cclog4");
          return new Promise((resolve) => resolve(resetPasswordToken));
        })
        .then((success) => {
          return ctx.send({
            result: success,
          });
        })
        .catch((error) => {
          return ctx.response.badRequest(error);
        });
    }
  },
};
