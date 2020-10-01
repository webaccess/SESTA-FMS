"use strict";

const {
  sanitizeEntity,
  convertRestQueryParams,
  buildQuery,
} = require("strapi-utils"); // removes private fields and its relations from model
const vm = require("vm");
const utils = require("../../../config/utils.js");
const _ = require("lodash");
const Moment = require('moment')

module.exports = {
  /** get activities - CSP user */
  getActivities: async (ctx) => {
    const { page, query, pageSize } = utils.getRequestParams(ctx.request.query);
    let filters = convertRestQueryParams(query, { limit: -1 });
    let sort;
    if (filters.sort) {
      sort = filters.sort;
      filters = _.omit(filters, ["sort"]);
    }
    return strapi
      .query("activity", "crm-plugin")
      .model.query(
        buildQuery({
          model: strapi.plugins["crm-plugin"].models["activity"],
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
  },

  /** get recent activities - CSP dashboard */
  getRecentActivities: async (ctx) => {
    const { page, query, pageSize } = utils.getRequestParams(ctx.request.query);
    let filters = convertRestQueryParams(query, { limit: -1 });
    let sort;
    if (filters.sort) {
      sort = filters.sort;
      filters = _.omit(filters, ["sort"]);
    }
    return strapi
      .query("activity", "crm-plugin")
      .model.query(
        buildQuery({
          model: strapi.plugins["crm-plugin"].models["activity"],
          filters,
        })
      )
      .fetchAll({})
      .then(async (res) => {
        let data = res.toJSON();
        const actTypeData = await strapi.query("activitytype", "crm-plugin").find({});

        // Today's date
        let today = new Date();
        today = today.getFullYear() + "-" + (today.getMonth() + 1);

        // CSV format for activity data
        let activityName, date, remuneration;
        let csvActivityData = [];
        let activtiesArr = [];
        actTypeData.map((type) => {
          let activityTypeName, activityTypeCount = 0;

          data.map((activity) => {
            // Pie chart calculation for current month
            let stdate = new Date(activity.end_datetime);
            stdate = stdate.getFullYear() + "-" + (stdate.getMonth() + 1);
            if (stdate == today) {
              if (activity.activitytype.name == type.name) {
                activityTypeName = activity.activitytype.name;
                activityTypeCount = activityTypeCount + 1;
              }
            }
          });
          if (activityTypeName) {
            activtiesArr.push({
              activityName: activityTypeName,
              activityCount: activityTypeCount,
            });
          }
        });
        // Pie chart array for label, values and colors to display
        let activityname = [];
        let activityvalue = [];
        activtiesArr.map((act) => {
          activityname.push(act.activityName);
          activityvalue.push(act.activityCount);
        });

        let viewMoreRemunTotal = 0;
        let dashRemuneration = 0;
        data.map((activity) => {
          /** 1 */
          activityName = activity.title;
          date = Moment(activity.start_datetime).format("DD MMM YYYY");
          remuneration = activity.activitytype.remuneration;
          csvActivityData.push({
            "Activity Name": activityName,
            Date: date,
            Remuneration: remuneration,
          });

          /** 2 */
          // Calculate Remuneration for current month
          let stdate = new Date(activity.start_datetime);
          stdate = stdate.getFullYear() + "-" + (stdate.getMonth() + 1);
          if (stdate == today) {
            let remun = activity.activitytype.remuneration;
            let unit = activity.unit;
            let cal = remun * unit;
            dashRemuneration = dashRemuneration + cal;
          }

          // Total remuneration calculation
          viewMoreRemunTotal = viewMoreRemunTotal + activity.activitytype.remuneration;
        });
        viewMoreRemunTotal = "₹" + viewMoreRemunTotal.toLocaleString();
        if (csvActivityData.length <= 0) {
          csvActivityData = "There are no records to display";
        }

        let pieChartCal = {
          activityname: activityname,
          activityvalue: activityvalue
        }

        // Sorting ascending or descending on one or multiple fields
        if (sort && sort.length) {
          data = utils.sort(data, sort);
        }
        const response = utils.paginate(data, page, pageSize);
        return {
          result: response.result,
          pieChartCal: pieChartCal,
          dashRemuneration: dashRemuneration,
          csvActivityData: csvActivityData,
          viewMoreRemunTotal: viewMoreRemunTotal,
          ...response.pagination,
        };
      })
  }
};
