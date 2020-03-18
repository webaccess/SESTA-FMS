const fs = require("fs");
const path = require("path");
const _data = require("./data.js");
const bookshelf = require("../../config/config.js");
// const minimist = require("minimist");
// const args = minimist(process.argv.slice(2));
// console.log("args", args);
// const _skip = args["roles"].length > 0;
// const skip = new RegExp(args["roles"].join("|"), "i");

// console.log("skip---" + (args["_"].indexOf("roles") > -1));
async function allRoles() {
  return await bookshelf
    .model("role")
    .fetchAll()
    .then(res => res.toJSON());
}

async function allModules() {
  return await bookshelf
    .model("module")
    .fetchAll()
    .then(res => res.toJSON());
}

async function getRoleModules(roles, module) {
  return await bookshelf
    .model("roleModule")
    .query(function (qb) {
      qb.where("role_id", "in", roles).andWhere("module_id", "=", module);
    })
    .fetchAll()
    .then(res => res.toJSON());
}

module.exports = strapi => {
  // console.log(strapi);
  const hook = {
    /**
     * Default options
     */

    defaults: {
      // config object
    },

    /**
     * Initialize the hook
     */

    async initialize() {
      const roles = _data.roles;
      var _allRoles = await allRoles();
      var _allModules = await allModules();
      console.log("allroles", _allRoles);
      Object.keys(roles).forEach(async function getRoles(role) {
        console.log("role", role);
        // console.log(bookshelf);
        await bookshelf
          .model("role")
          .fetchAll()
          .then(async function saveRole(model) {
            const response = model.toJSON();
            const isRolePresent = response.find(r => r.name === role);
            if (!isRolePresent) {
              // Creating role
              await bookshelf
                .model("role")
                .forge({
                  name: role,
                  description: roles[role]["data"]["description"],
                  type: role
                })
                .save()
                .then(async function rRoles(r) {
                  const _role = r.toJSON();
                  console.log("role " + _role.name + " added!!!")
                  // addPermissionsToGivenRole(role, _role.id);
                })
                .catch(error => {
                  console.log(error);
                });
            }
            const modules = _data.modules;

            Object.keys(modules).forEach(module => {
              bookshelf
                .model("module")
                .fetchAll()
                .then(async function getAllModules(model) {
                  console.log("in---", module);
                  const response = model.toJSON();
                  console.log("res=+", response);
                  const isModulePresent = response.find(r => r.slug === modules[module]["slug"]);
                  if (!isModulePresent) {
                    console.log("fdsfsdf===");
                    const _roles = _allRoles.filter(
                      r => modules[module]["roles"].indexOf(r.name) > -1
                    );
                    // const _modules = _allModules.filter(
                    //   m => modules[module]["modules"].indexOf(m.name) > -1
                    // );
                    const _module = _allModules.find(
                      m => modules[module]["module"] === m.name
                    );
                    // var _modules_arr = _modules.map(value => value.id);
                    // var _roles_arr = _roles.map(value => value.id);
                    var roleModules = [];
                    // if (_module) {
                    //   roleModules = await getRoleModules(_roles_arr, _module.id);
                    //   console.log("rolmmm===", roleModules);
                    // }

                    // console.log("_modules", _modules_arr);
                    console.log("_module", _module);
                    console.log("_roles", _roles);

                    // Creating module
                    var moduleInsert = bookshelf
                      .model("module")
                      .forge({
                        name: module,
                        is_active: modules[module]["is_active"],
                        slug: modules[module]["slug"],
                        icon_class: modules[module]["icon_class"],
                        url: modules[module]["url"],
                        displayNavigation: modules[module]["displayNavigation"],
                        // roles: _roles_arr,
                        module: _module ? _module.id : null
                      })
                      .save()
                      .then(m => {
                        const moduleItem = m.toJSON();
                        _roles.map(role => {
                          bookshelf
                            .model("roleModule")
                            .forge({
                              role_id: role.id,
                              module_id: moduleItem.id
                            })
                            .save().then(rr => {
                              console.log("module " + moduleItem.name + " added!!!")
                            })
                            .catch(error => {
                              console.log(error);
                            });
                        });
                      })
                      .catch(error => {
                        console.log(error);
                      });

                    // console.log("moduleInsert==", moduleInsert);


                    // if(roleModules.length<=0){

                    // }
                  }
                })
                .catch(failed => {
                  console.log({ failed });
                });
            });

          })
          .catch(failed => {
            console.log({ failed });
          });
      });



      // await someAsyncCode()
      // this().defaults['your_config'] to access to your configs.
    }
  };

  return hook;
};
