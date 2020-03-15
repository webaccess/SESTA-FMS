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
    module: "tedfsf", //slug
    roles: ["Admin", "Authenticated"]
  }
};

module.exports = Object.freeze({
  roles,
  modules
});
