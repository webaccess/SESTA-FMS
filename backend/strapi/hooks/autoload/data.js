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
      },
      {
        name: "village-organization",
        action: []
      }
    ],
    grantAllPermissions: false
  },*/

  "SHG Member": {
    content: {
      description: "SHG Member user",
      type: "",
    },
    controllers: [
      // {
      //   name: "user",
      //   action: ["update"],
      // },
      {
        name: "module",
        action: ["find", "count", "findone"],
      },
      // {
      //   name: "bankdetail",
      //   action: ["find", "count", "findone", "create", "update", "delete"],
      // },
      // {
      //   name: "shareinformation",
      //   action: ["find", "count", "findone", "create", "update", "delete"],
      // },
    ],
    grantAllPermissions: false,
  },
  "FPO Admin": {
    content: {
      description: "FPO admin user",
      type: "",
    },
    controllers: [
      {
        name: "user",
        action: ["update"],
      },
      {
        name: "module",
        action: ["find", "count", "findone"],
      },
      {
        name: "bankdetail",
        action: ["find", "count", "findone", "create", "update", "delete"],
      },
      {
        name: "shareinformation",
        action: ["find", "count", "findone", "create", "update", "delete"],
      },
      {
        name: "loan-model",
        action: ["find", "count", "findone", "create", "update", "delete"],
      },
      {
        name: "loan-application",
        action: ["find", "count", "findone", "create", "update", "delete"],
      },
      {
        name: "loan-application-tasks",
        action: ["find", "count", "findone", "create", "update", "delete"],
      },
      {
        name: "loan-application-installments",
        action: ["find", "count", "findone", "create", "update", "delete"],
      },
    ],
    grantAllPermissions: false,
  },
  "Sesta Admin": {
    content: {
      description: "Sesta admin user",
      type: "",
    },
    controllers: [
      {
        name: "user",
        action: ["update", "create"],
      },
      {
        name: "module",
        action: ["find", "count", "findone"],
      },
      {
        name: "bankdetail",
        action: ["find", "count", "findone", "create", "update", "delete"],
      },
      {
        name: "shareinformation",
        action: ["find", "count", "findone", "create", "update", "delete"],
      },
      {
        name: "loan-model",
        action: ["find", "count", "findone", "create", "update", "delete"],
      },
      {
        name: "loan-application",
        action: ["find", "count", "findone", "create", "update", "delete"],
      },
      {
        name: "loan-application-tasks",
        action: ["find", "count", "findone", "create", "update", "delete"],
      },
      {
        name: "loan-application-installments",
        action: ["find", "count", "findone", "create", "update", "delete"],
      },
    ],
    grantAllPermissions: false,
  },
  "CSP (Community Service Provider)": {
    content: {
      description: "Community service provider user",
      type: "",
    },
    controllers: [
      {
        name: "user",
        action: ["update"],
      },
      {
        name: "module",
        action: ["find", "count", "findone"],
      },
      {
        name: "bankdetail",
        action: [],
      },
      {
        name: "shareinformation",
        action: [],
      },
      {
        name: "loan-model",
        action: [],
      },
      {
        name: "loan-application",
        action: [],
      },
      {
        name: "loan-application-tasks",
        action: [],
      },
      {
        name: "loan-application-installments",
        action: [],
      },
    ],
    grantAllPermissions: false,
  },
  Superadmin: {
    content: {
      description: "Superadmin user",
      type: "",
    },
    controllers: [
      {
        name: "user",
        action: ["update"],
      },
      {
        name: "module",
        action: ["find", "count", "findone"],
      },
      {
        name: "bankdetail",
        action: ["find", "count", "findone", "create", "update", "delete"],
      },
      {
        name: "shareinformation",
        action: ["find", "count", "findone", "create", "update", "delete"],
      },
      {
        name: "loan-model",
        action: ["find", "count", "findone", "create", "update", "delete"],
      },
      {
        name: "loan-application",
        action: ["find", "count", "findone", "create", "update", "delete"],
      },
      {
        name: "loan-application-tasks",
        action: ["find", "count", "findone", "create", "update", "delete"],
      },
      {
        name: "loan-application-installments",
        action: ["find", "count", "findone", "create", "update", "delete"],
      },
    ],
    grantAllPermissions: false,
  },
};

const modules = {
  Dashboard: {
    is_active: true,
    icon_class: "dashboard",
    url: "/",
    slug: "home",
    displayNavigation: true,
    module: "", //slug
    order: 1,
    roles: [
      "FPO Admin",
      "Sesta Admin",
      "CSP (Community Service Provider)",
      "Superadmin",
    ],
  },
  Villages: {
    is_active: true,
    icon_class: "people",
    url: "/villages",
    slug: "list_village",
    displayNavigation: true,
    module: "", //slug
    order: 4,
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"],
  },
  "Add Village": {
    is_active: true,
    icon_class: "",
    url: "/villages/add",
    slug: "add_village",
    displayNavigation: false,
    module: "", //slug
    order: 5,
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"],
  },
  "Edit Village": {
    is_active: true,
    icon_class: "",
    url: "/villages/edit/:id",
    slug: "edit_village",
    displayNavigation: false,
    module: "", //slug
    order: 5,
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"],
  },
  SHGs: {
    is_active: true,
    icon_class: "people",
    url: "/shgs",
    slug: "list_shg",
    displayNavigation: true,
    module: "", //slug
    order: 6,
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"],
  },
  "Village Organizations": {
    is_active: true,
    icon_class: "people",
    url: "/village-organizations",
    slug: "list_village_organizations",
    displayNavigation: true,
    module: "", //slug
    order: 2,
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"],
  },
  "Add Village Organization": {
    is_active: true,
    icon_class: "",
    url: "/village-organizations/add",
    slug: "add_village_organizations",
    displayNavigation: false,
    module: "", //slug
    order: 3,
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"],
  },
  "Edit Village Organization": {
    is_active: true,
    icon_class: "",
    url: "/village-organizations/edit/:id",
    slug: "edit_village_organizations",
    displayNavigation: false,
    module: "", //slug
    order: 3,
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"],
  },
  States: {
    is_active: true,
    icon_class: "people",
    url: "/states",
    slug: "list_state",
    displayNavigation: true,
    module: "", //slug
    order: 7,
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"],
  },
  "Add State": {
    is_active: true,
    icon_class: "",
    url: "/states/add",
    slug: "add_state",
    displayNavigation: false,
    module: "", //slug
    order: 8,
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"],
  },
  "Edit State": {
    is_active: true,
    icon_class: "",
    url: "/states/edit/:id",
    slug: "edit_state",
    displayNavigation: false,
    module: "", //slug
    order: 8,
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"],
  },
  Pgs: {
    is_active: true,
    icon_class: "people",
    url: "/Pgs",
    slug: "list_pg",
    displayNavigation: true,
    module: "", //slug
    order: 9,

    roles: ["FPO Admin", "Sesta Admin", "Superadmin"],
  },
  "Add Pg": {
    is_active: true,
    icon_class: "",
    url: "/Pgs/add",
    slug: "add_pg",
    displayNavigation: false,
    module: "", //slug
    order: 10,
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"],
  },
  "Edit Pg": {
    is_active: true,
    icon_class: "",
    url: "/Pgs/edit/:id",
    slug: "edit_pg",
    displayNavigation: false,
    module: "", //slug
    order: 10,
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"],
  },
  Fpos: {
    is_active: true,
    icon_class: "people",
    url: "/fpos",
    slug: "list_fpo",
    displayNavigation: true,
    module: "", //slug
    order: 11,
    roles: [
      "Sesta Admin",
      "Superadmin",
      // "FPO Admin",
    ],
  },
  "Add Fpo": {
    is_active: true,
    icon_class: "",
    url: "/fpos/add",
    slug: "add_fpo",
    displayNavigation: false,
    module: "", //slug
    order: 12,
    roles: [
      "Sesta Admin",
      "Superadmin",
      // "FPO Admin",
    ],
  },
  "Edit Fpo": {
    is_active: true,
    icon_class: "",
    url: "/fpos/edit/:id",
    slug: "edit_fpo",
    displayNavigation: false,
    module: "", //slug
    order: 12,
    roles: [
      "Sesta Admin",
      "Superadmin",
      // "FPO Admin",
    ],
  },
  Countries: {
    is_active: true,
    icon_class: "people",
    url: "/countries",
    slug: "list_country",
    displayNavigation: true,
    module: "", //slug
    order: 13,
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"],
  },
  "Add Country": {
    is_active: true,
    icon_class: "",
    url: "/countries/add",
    slug: "add_country",
    displayNavigation: false,
    module: "", //slug
    order: 14,
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"],
  },
  "Edit Country": {
    is_active: true,
    icon_class: "",
    url: "/countries/edit/:id",
    slug: "edit_country",
    displayNavigation: false,
    module: "", //slug
    order: 14,
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"],
  },
  Activities: {
    is_active: true,
    icon_class: "assignmentTurnedIn",
    url: "/activities",
    slug: "list_activity",
    displayNavigation: true,
    module: "", //slug
    order: 15,
    roles: [
      // "FPO Admin",
      // "Sesta Admin",
      "Superadmin",
      "CSP (Community Service Provider)",
    ],
  },
  "Add Activity": {
    is_active: true,
    icon_class: "",
    url: "/activities/add",
    slug: "add_activity",
    displayNavigation: false,
    module: "", //slug
    order: 16,
    roles: [
      // "FPO Admin",
      // "Sesta Admin",
      "Superadmin",
      "CSP (Community Service Provider)",
    ],
  },
  "Edit Activity": {
    is_active: true,
    icon_class: "",
    url: "/activities/edit/:id",
    slug: "edit_activity",
    displayNavigation: false,
    module: "", //slug
    order: 16,
    roles: [
      // "FPO Admin",
      // "Sesta Admin",
      "Superadmin",
      "CSP (Community Service Provider)",
    ],
  },
  Members: {
    is_active: true,
    icon_class: "people",
    url: "/members",
    slug: "list_members",
    displayNavigation: true,
    module: "", //slug
    order: 17,
    roles: [
      "FPO Admin",
      "Sesta Admin",
      "Superadmin",
      "CSP (Community Service Provider)",
    ],
  },
  "Add Member": {
    is_active: true,
    icon_class: "",
    url: "/members/add",
    slug: "add_member",
    displayNavigation: false,
    module: "", //slug
    order: 18,
    roles: [
      "FPO Admin",
      "Sesta Admin",
      "Superadmin",
      "CSP (Community Service Provider)",
    ],
  },
  "Edit Member": {
    is_active: true,
    icon_class: "",
    url: "/members/edit/:id",
    slug: "edit_member",
    displayNavigation: false,
    module: "", //slug
    order: 18,
    roles: [
      "FPO Admin",
      "Sesta Admin",
      "Superadmin",
      "CSP (Community Service Provider)",
    ],
  },
  Loans: {
    is_active: true,
    icon_class: "money",
    url: "/loans",
    slug: "list_loan",
    displayNavigation: true,
    module: "", //slug
    order: 19,
    roles: [
      "FPO Admin",
      "Sesta Admin",
      "Superadmin",
      "CSP (Community Service Provider)",
    ],
  },
  "Apply Loan": {
    is_active: true,
    icon_class: "",
    url: "/loans/apply/:id",
    slug: "apply_loan",
    displayNavigation: false,
    module: "", //slug
    order: 20,
    roles: [
      "FPO Admin",
      "Sesta Admin",
      "Superadmin",
      "CSP (Community Service Provider)",
    ],
  },
  "Update Loan Tasks": {
    is_active: true,
    icon_class: "",
    url: "/loans/update/:id",
    slug: "update_loan_task",
    displayNavigation: false,
    module: "", //slug
    order: 20,
    roles: [
      "FPO Admin",
      "Sesta Admin",
      "Superadmin",
      "CSP (Community Service Provider)",
    ],
  },
  "Edit Loan Task": {
    is_active: true,
    icon_class: "",
    url: "/loan/task/edit/:id",
    slug: "edit_loan_task",
    displayNavigation: false,
    module: "", //slug
    order: 20,
    roles: [
      "FPO Admin",
      "Sesta Admin",
      "Superadmin",
      "CSP (Community Service Provider)",
    ],
  },
  "Loan Approval": {
    is_active: true,
    icon_class: "",
    url: "/loans/approve/:id",
    slug: "approve_loan",
    displayNavigation: false,
    module: "", //slug
    order: 20,
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"],
  },
  "Loan Purpose": {
    is_active: true,
    icon_class: "people",
    url: "/loanpurposes",
    slug: "list_loanpurpose",
    displayNavigation: true,
    module: "", //slug
    order: 21,
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"],
  },
  "Add Loan Purpose": {
    is_active: true,
    icon_class: "",
    url: "/loanpurpose/add",
    slug: "add_loanpurpose",
    displayNavigation: false,
    module: "", //slug
    order: 22,
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"],
  },
  "Edit Loan Purpose": {
    is_active: true,
    icon_class: "",
    url: "/loanpurpose/edit/:id",
    slug: "edit_loanpurpose",
    displayNavigation: false,
    module: "", //slug
    order: 22,
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"],
  },
  "Activity Types": {
    is_active: true,
    icon_class: "people",
    url: "/activitytypes",
    slug: "list_activitytype",
    displayNavigation: true,
    module: "", //slug
    order: 23,
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"],
  },
  "Add Activity Type": {
    is_active: true,
    icon_class: "",
    url: "/activitytypes/add",
    slug: "add_activitytype",
    displayNavigation: false,
    module: "", //slug
    order: 24,
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"],
  },
  "Edit Activity Type": {
    is_active: true,
    icon_class: "",
    url: "/activitytypes/edit/:id",
    slug: "edit_activitytype",
    displayNavigation: false,
    module: "", //slug
    order: 24,
    roles: ["FPO Admin", "Sesta Admin", "Superadmin"],
  },
};

module.exports = Object.freeze({
  roles,
  modules,
});
