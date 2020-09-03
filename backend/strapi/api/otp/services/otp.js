"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */
const axios = require("axios");
const APIKEY = process.env.MSG91_API_KEY;
const URL = process.env.SMS_URL;
const SMS_USERNAME = process.env.SMS_USERNAME;
const SMS_PASSWORD = process.env.SMS_PASSWORD;
const SMS_FROM = process.env.SMS_FROM;
module.exports = {
  sendOTP: async (mobileNo, OTP) => {
    let config = {
      method: "post",
      url: `${URL}?username=${SMS_USERNAME}&password=${SMS_PASSWORD}&to=${mobileNo}&from=${SMS_FROM}&text=${OTP}&dlr-mask=19&dlr-url`,
    };

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });

    return;
  },
};
