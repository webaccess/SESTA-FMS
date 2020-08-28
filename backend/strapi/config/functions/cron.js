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

module.exports = {
  /**
   * Simple example.
   * Every monday at 1am.
   */
  // '0 1 * * 1': () => {
  //
  // }

  "*/1 * * * *": async () => {
    console.log("1 minute later");
    const application = await strapi.services["loan-application"].find({});
    console.log("application", application);
    application.map((item) => {
      if (item.loan_app_installments) {
        item.loan_app_installments.map((inst) => {
          console.log("inst", inst);
        });
      }
    });
  },
};
