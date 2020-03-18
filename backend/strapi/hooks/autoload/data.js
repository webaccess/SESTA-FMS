const roles = {
  Admin: {
    data: {
      description: ""
    }
  },
  Admin2: {
    data: {
      description: ""
    }
  }
};

const modules = {
  tmod22: {
    is_active: true,
    icon_class: "dashboard",
    url: "/",
    slug: "mod222",
    displayNavigation: true,
    module: "tedfsf", //slug
    roles: ["Admin", "Admin2", "Authenticated"]
  }
};

module.exports = Object.freeze({
  roles,
  modules
});
