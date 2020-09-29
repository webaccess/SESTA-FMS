const _ = require("lodash");
const moment = require("moment");

function getRequestParams(params) {
  const page = params.page ? parseInt(params.page) : 1;
  const pageSize = params.pageSize ? parseInt(params.pageSize) : 10;
  const query = _.omit(params, ["page", "pageSize"]);
  return { page, query, pageSize };
}

const getNumberOfPages = (list, numberPerPage) => {
  return Math.ceil(list.length / numberPerPage);
};

/**
 *
 * @param {*} list // Resultset of query
 * @param {*} currentPage // Which page data to fetch
 * @param {*} numberPerPage // How many number of rows to return
 *
 * @returns {Object}
 */
function paginate(list, currentPage, numberPerPage) {
  const totalRecords = list ? list.length : 0;
  numberPerPage = numberPerPage === -1 ? totalRecords : numberPerPage;

  const start = (currentPage - 1) * numberPerPage;
  const end = start + numberPerPage;

  const totalPages = getNumberOfPages(list, numberPerPage);

  const result = list.slice(start, end);

  return {
    result,
    pagination: {
      page: currentPage,
      pageSize: numberPerPage,
      rowCount: totalRecords,
      pageCount: totalPages,
    },
  };
}

/** assign state, district, village and SHG names */
async function assignData(data) {
  //assign state, district & village name
  const addressPromise = await Promise.all(
    await data.result.map(async (val, index) => {
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
          Object.assign(data.result[index], {
            stateName: model[0].state.name,
          });
        }
        if (model[0].district) {
          Object.assign(data.result[index], {
            districtName: model[0].district.name,
          });
        }
        if (model[0].village) {
          Object.assign(data.result[index], {
            villageName: model[0].village.name,
          });
        }
      }
    });
  }

  //assign shg name
  const shgPromise = await Promise.all(
    await data.result.map(async (val, index) => {
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
        Object.assign(data.result[index], {
          shgName: model[0].name,
        });
      }
    });
  }

  // assign vos array in the organization object (as we added many-to-many relationship)
  const orgVoPromise = await Promise.all(
    await data.result.map(async (val, index) => {
      if (val.organization) {
        return await strapi
          .query("organization", "crm-plugin")
          .find({ id: val.organization.id, "contact.id": val.id });
      }
    })
  );
  if (orgVoPromise.length > 0) {
    orgVoPromise.map(async (model, index) => {
      if (model) {
        Object.assign(data.result[index]["organization"], {
          vos: model[0].vos,
        });
      }
    });
  }
  const result = data.result;
  return {
    result,
  };
}

/** sorting data */
function sort(data, sort) {
  let sortByFields = [],
    orderByFields = [];

  sort.forEach((s) => {
    sortByFields.push(s.field);
    orderByFields.push(s.order);
  });

  let result;
  if (sortByFields.length && orderByFields.length) {
    result = _.orderBy(data, sortByFields, orderByFields);
  } else {
    result = data;
  }
  return result;
}

async function assignUserRoleData(data) {
  //assign role name
  const userPromise = await Promise.all(
    await data.result.map(async (val, index) => {
      return await strapi
        .query("role", "users-permissions")
        .find({ id: val.user.role });
    })
  );
  if (userPromise.length > 0) {
    userPromise.map(async (model, index) => {
      if (model) {
        Object.assign(data.result[index], {
          roleName: model[0].name,
        });
      }
    });
  }
  const result = data.result;
  return {
    result,
  };
}

module.exports = {
  getRequestParams,
  paginate,
  assignData,
  sort,
  assignUserRoleData,
};
