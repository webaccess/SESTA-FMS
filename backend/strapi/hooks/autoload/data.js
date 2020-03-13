const roles = {
  Admin: {
    data: {
      description: ""
    }
  }
};

const modules = {
  tmod: {
    is_active: true,
    icon_class: "dashboard",
    url: "/",
    slug: "dsfds",
    displayNavigation: true,
    modules: [], // array of slugs
    module: "", //slug
    roles: ["Admin", "Authenticated"]
  }
};

module.exports = Object.freeze({
  roles,
  modules
});
