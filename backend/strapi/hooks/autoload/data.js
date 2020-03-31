const roles = {
  /*"Public": {   //to be added on first time setup only
    content: {
      description: "Default role given to unauthenticated user.",
      type: "public"
    },
    controllers: [
      {
        name: "user",
        action: []
      },
      {
        name: "module",
        action: []
      },
      {
        name: "state",
        action: []
      },
      {
        name: "district",
        action: []
      },
      {
        name: "village",
        action: []
      },
      {
        name: "shg",
        action: []
      }
    ],
    grantAllPermissions: true
  },*/
  "FPO Admin": {
    content: {
      description: "FPO admin user",
      type: ""
    },
    controllers: [
      {
        name: "user",
        action: ["update"]
      },
      {
        name: "module",
        action: ["find", "count", "findone"]
      },
      {
        name: "state",
        action: ["find", "count", "findone", "create", "update", "delete"]
      },
      {
        name: "district",
        action: ["find", "count", "findone", "create", "update", "delete"]
      },
      {
        name: "village",
        action: ["find", "count", "findone", "create", "update", "delete"]
      },
      {
        name: "shg",
        action: ["find", "count", "findone", "create", "update", "delete"]
      }
    ],
    grantAllPermissions: false
  },
  "Sesta Admin": {
    content: {
      description: "Sesta admin user",
      type: ""
    },
    controllers: [
      {
        name: "user",
        action: ["update"]
      },
      {
        name: "module",
        action: ["find", "count", "findone"]
      },
      {
        name: "state",
        action: ["find", "count", "findone", "create", "update", "delete"]
      },
      {
        name: "district",
        action: ["find", "count", "findone", "create", "update", "delete"]
      },
      {
        name: "village",
        action: ["find", "count", "findone", "create", "update", "delete"]
      },
      {
        name: "shg",
        action: ["find", "count", "findone", "create", "update", "delete"]
      }
    ],
    grantAllPermissions: false
  },
  "CSP (Community Service Provider)": {
    content: {
      description: "Community service provider user",
      type: ""
    },
    controllers: [
      {
        name: "user",
        action: ["update"]
      },
      {
        name: "module",
        action: ["find", "count", "findone"]
      },
      {
        name: "state",
        action: []
      },
      {
        name: "district",
        action: []
      },
      {
        name: "village",
        action: []
      },
      {
        name: "shg",
        action: []
      }
    ],
    grantAllPermissions: false
  },
  Superadmin: {
    content: {
      description: "Superadmin user",
      type: ""
    },
    controllers: [
      {
        name: "user",
        action: ["update"]
      },
      {
        name: "module",
        action: ["find", "count", "findone"]
      },
      {
        name: "state",
        action: ["find", "count", "findone", "create", "update", "delete"]
      },
      {
        name: "district",
        action: ["find", "count", "findone", "create", "update", "delete"]
      },
      {
        name: "village",
        action: ["find", "count", "findone", "create", "update", "delete"]
      },
      {
        name: "shg",
        action: ["find", "count", "findone", "create", "update", "delete"]
      }
    ],
    grantAllPermissions: false
  }
};

const modules = {
  Dashboard: {
    is_active: true,
    icon_class: "dashboard",
    url: "/",
    slug: "home",
    displayNavigation: true,
    module: "", //slug
    roles: [
      "FPO Admin",
      "Sesta Admin",
      "CSP (Community Service Provider)",
      "Superadmin"
    ]
  },
  Villages: {
    is_active: true,
    icon_class: "people",
    url: "/villages",
    slug: "list_village",
    displayNavigation: true,
    module: "", //slug
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"]
  },
  "Add Village": {
    is_active: true,
    icon_class: "",
    url: "/villages/add",
    slug: "add_village",
    displayNavigation: false,
    module: "", //slug
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"]
  },
  "Edit Village": {
    is_active: true,
    icon_class: "",
    url: "/villages/edit/:id",
    slug: "edit_village",
    displayNavigation: false,
    module: "", //slug
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"]
  },
  SHGs: {
    is_active: true,
    icon_class: "people",
    url: "/shgs",
    slug: "list_shg",
    displayNavigation: true,
    module: "", //slug
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"]
  }
};

module.exports = Object.freeze({
  roles,
  modules
});
