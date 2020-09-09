"use strict";

/**
 * Cron config that gives you an opportunity
 * to run scheduled jobs.
 *
 * The cron format consists of:
 * [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK] [YEAR (optional)]
 *
 * See more details here: https://strapi.io/documentation/3.0.0-beta.x/concepts/configurations.html#cron-tasks
 */
const axios = require("axios");
const URL = process.env.SMS_URL;
const SMS_USERNAME = process.env.SMS_USERNAME;
const SMS_PASSWORD = process.env.SMS_PASSWORD;
const SMS_FROM = process.env.SMS_FROM;
module.exports = {
  /**
   * Simple example.
   * Every monday at 1am.
   */
  // '0 1 * * 1': () => {
  //
  // }

  // "*/1 * * * *": async () => {
  "0 10 * * *": async () => {
    const application = await strapi.services["loan-application"].find({});
    application.map((item) => {
      if (item.loan_app_installments) {
        item.loan_app_installments.map((inst) => {
          let today = new Date();
          let paymentDate = new Date(inst.payment_date);
          const diff =
            (today.getTime() - paymentDate.getTime()) / (1000 * 3600 * 24);

          let mobileNo = item.contact.phone;
          let content;
          let amount = inst.expected_principal + inst.expected_interest;
          console.log("diff", diff);
          if (Math.floor(diff) == -5 && inst.actual_principal == null) {
            if (item.contact.phone) {
              //individual sms
              content =
                "Dear " +
                item.contact.name +
                ",\nThe EMI installment of amount Rs. " +
                amount +
                " for loan application no. " +
                item.application_no +
                " is due. This is a reminder for EMI payment. Please ignore, if you have already made a payment.";
              console.log(
                "content",
                `${URL}?username=${SMS_USERNAME}&password=${SMS_PASSWORD}&to=${mobileNo}&from=${SMS_FROM}&text=${content}&dlr-mask=19&dlr-url`
              );

              let config = {
                method: "post",
                url: `${URL}?username=${SMS_USERNAME}&password=${SMS_PASSWORD}&to=${mobileNo}&from=${SMS_FROM}&text=${content}&dlr-mask=19&dlr-url`,
              };
              axios(config)
                .then(function (response) {
                  console.log(JSON.stringify(response.data));
                })
                .catch(function (error) {
                  console.log(error);
                });
            }
            //csp sms
            mobileNo = item.creator_id.phone;
            content =
              "Dear " +
              item.creator_id.name +
              ",\nThe EMI installment of amount Rs. " +
              amount +
              " for loan application no. " +
              item.application_no +
              " is due. This is a reminder for EMI payment. Please ignore, if you have already collected the payment.";
            if (mobileNo) {
              console.log("enters case 2");
              let config = {
                method: "post",
                url: `${URL}?username=${SMS_USERNAME}&password=${SMS_PASSWORD}&to=${mobileNo}&from=${SMS_FROM}&text=${content}&dlr-mask=19&dlr-url`,
              };
              axios(config)
                .then(function (response) {
                  console.log(JSON.stringify(response.data));
                })
                .catch(function (error) {
                  console.log(error);
                });
            }
          }
        });
      }
    });
  },
};
