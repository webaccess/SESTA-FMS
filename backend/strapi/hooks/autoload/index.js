const fs = require("fs");
const path = require("path");
const _data = require("./data.js");
const bookshelf = require("../../config/config.js");
var Promise = require("bluebird");
const apiFolder = "./api/";

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
    .query(function(qb) {
      qb.where("role_id", "in", roles).andWhere("module_id", "=", module);
    })
    .fetchAll()
    .then(res => res.toJSON());
}

function addPermissionsToGivenRole(role, id) {
  /**
   * Creating permissions WRT to controllers and mapping to created role
   */
  Object.keys(role.permissions || {}).forEach(type => {
    Object.keys(role.permissions[type].controllers).forEach(controller => {
      console.log(`Adding permission for ${controller} for role ${role.name}`);
      Object.keys(role.permissions[type].controllers[controller]).forEach(
        action => {
          bookshelf
            .model("permission")
            .forge({
              role: id,
              type: controller === "user" ? "users-permissions" : type,
              controller: controller,
              action: action.toLowerCase(),
              ...role.permissions[type].controllers[controller][action]
            })
            .save();
        }
      );
    });
    console.log("\n");
  });
}

function addRoleModule(role, moduleItem) {
  bookshelf
    .model("roleModule")
    .forge({
      role_id: role.id,
      module_id: moduleItem.id
    })
    .save()
    .then(rr => {
      console.log("module " + moduleItem.name + " added!!!");
    })
    .catch(error => {
      console.log(error);
    });
}

module.exports = strapi => {
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
      let controllerActionWithoutUser = fs
        .readdirSync(apiFolder, { withFileTypes: true })
        .filter(api => api.isDirectory())
        .reduce((acc, folder) => {
          const { name } = folder;
          const raw = fs.readFileSync(`./api/${name}/config/routes.json`);
          const route = JSON.parse(raw);
          const actionObj = route.routes.reduce((result, r) => {
            const action = r.handler.split(".")[1].toLowerCase();
            result[action] = { enabled: false };
            return result;
          }, {});
          acc[name] = actionObj;
          return acc;
        }, {});
      const allControllerActions = Object.assign(controllerActionWithoutUser, {
        user: {
          find: { enabled: false },
          count: { enabled: false },
          findone: { enabled: false },
          create: { enabled: false },
          update: { enabled: false },
          destroy: { enabled: false },
          me: { enabled: false }
        }
      });

      const roles = _data.roles;

      var _allModules = await allModules();

      const _roleRequestData = Object.keys(roles).map(r => {
        const { controllers, grantAllPermissions, content } = roles[r];
        const updatedController = controllers.reduce((result, controller) => {
          const { name, action } = controller;
          if (grantAllPermissions) {
            const controllerWithAction = allControllerActions[name];
            const updatedActions = Object.keys(controllerWithAction).reduce(
              (acc, a) => {
                acc[a] = { enabled: true };
                return acc;
              },
              {}
            );
            result[name] = updatedActions;
            return result;
          } else {
            const controllerWithAction = allControllerActions[name];
            let updatedActions;
            if (action.length) {
              const regex = new RegExp(action.join("|"), "i");
              updatedActions = Object.keys(controllerWithAction).reduce(
                (acc, a) => {
                  acc[a] = { enabled: regex.test(a) };
                  return acc;
                },
                {}
              );
            } else {
              updatedActions = Object.keys(controllerWithAction).reduce(
                (acc, a) => {
                  acc[a] = { enabled: false };
                  return acc;
                },
                {}
              );
            }
            result[name] = updatedActions;
            return result;
          }
        }, {});
        return {
          name: r,
          description: content.description ? content.description : r,
          type: content.type ? content.type : r,
          permissions: {
            application: {
              controllers: updatedController
            }
          }
        };
      });

      var promise = new Promise(function(resolve, reject) {
        _roleRequestData.forEach(role => {
          bookshelf
            .model("role")
            .fetchAll()
            .then(model => {
              const response = model.toJSON();
              const isRolePresent = response.find(r => r.name === role.name);

              if (!isRolePresent) {
                // Creating role
                bookshelf
                  .model("role")
                  .forge({
                    name: role.name,
                    description: role.description,
                    type: role.type
                  })
                  .save()
                  .then(async function rRoles(r) {
                    const _role = r.toJSON();
                    console.log("role " + _role.name + " added!!!");
                    addPermissionsToGivenRole(role, _role.id);
                    resolve();
                  })
                  .catch(error => {
                    reject(error);
                  });
              } else {
                bookshelf
                  .model("permission")
                  .where({ role: isRolePresent.id })
                  .destroy()
                  .then(async function rRole() {
                    console.log(
                      `Deleting existing permissions for role ${isRolePresent.name}\nAdding new permissions\n`
                    );
                    addPermissionsToGivenRole(role, isRolePresent.id);
                    resolve();
                  })
                  .catch(error => {
                    reject(error);
                  });
              }
            })
            .catch(failed => {
              reject({ failed });
            });
        });
      });

      const modules = _data.modules;

      promise.then(async function() {
        var _allRoles = await allRoles();
        Object.keys(modules).forEach(module => {
          bookshelf
            .model("module")
            .fetchAll()
            .then(async function getAllModules(model) {
              const response = model.toJSON();
              const isModulePresent = response.find(
                r => r.slug === modules[module]["slug"]
              );

              const _roles = _allRoles.filter(
                r => modules[module]["roles"].indexOf(r.name) > -1
              );
              const _module = _allModules.find(
                m => modules[module]["module"] === m.name
              );
              var roleModules = [];
              if (!isModulePresent) {
                // Creating module
                bookshelf
                  .model("module")
                  .forge({
                    name: module,
                    is_active: modules[module]["is_active"],
                    slug: modules[module]["slug"],
                    icon_class: modules[module]["icon_class"],
                    url: modules[module]["url"],
                    displayNavigation: modules[module]["displayNavigation"],
                    module: _module ? _module.id : null,
                    order: modules[module]["order"]
                  })
                  .save()
                  .then(m => {
                    const moduleItem = m.toJSON();
                    _roles.map(role => {
                      //linking roles to modules
                      addRoleModule(role, moduleItem);
                    });
                  })
                  .catch(error => {
                    console.log(error);
                  });
              } else {
                const roleMods = await bookshelf
                  .model("roleModule")
                  .query({ where: { module_id: isModulePresent.id } })
                  .fetchAll()
                  .then(res => res.toJSON());
                // updating module
                bookshelf
                  .model("module")
                  .query({
                    where: {
                      slug: modules[module]["slug"]
                    }
                  })
                  .save(
                    {
                      name: module,
                      is_active: modules[module]["is_active"],
                      icon_class: modules[module]["icon_class"],
                      url: modules[module]["url"],
                      displayNavigation: modules[module]["displayNavigation"],
                      module: _module ? _module.id : null,
                      order: modules[module]["order"]
                    },
                    { patch: true }
                  )
                  .then(m => {
                    const moduleItem = m.toJSON();
                    if (roleMods.length > 0) {
                      roleMods.map(role => {
                        bookshelf
                          .model("roleModule")
                          .where({
                            role_id: role.id,
                            module_id: isModulePresent.id
                          })
                          .destroy()
                          .then(async function rRoleMod() {
                            console.log(
                              `Deleting existing roles for module ${isModulePresent.name}\nAdding new roles\n`
                            );
                            addRoleModule(role, moduleItem);
                          })
                          .catch(error => {
                            console.log("error", error);
                          });
                      });
                    } else {
                      _roles.map(role => {
                        //linking roles to modules
                        addRoleModule(role, moduleItem);
                      });
                    }
                  })
                  .catch(error => {
                    console.log(error);
                  });
              }
            })
            .catch(failed => {
              console.log("failed", failed);
            });
        });
      });
    }
  };

  return hook;
};
