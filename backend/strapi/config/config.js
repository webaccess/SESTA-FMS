const knex = require("knex")({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    port: "5432",
    user: "postgres",
    password: "postgres",
    database: "loancheck",
    // host: "${process.env.DATABASE_HOST || '127.0.0.1'}",
    // port: "${process.env.DATABASE_PORT || 5432}",
    // user: "${process.env.DATABASE_USERNAME || ''}",
    // password: "${process.env.DATABASE_PASSWORD || ''}",
    // database: "${process.env.DATABASE_NAME || 'strapi'}"
  },
});

const bookshelf = require("bookshelf")(knex);

bookshelf.model("role", {
  requireFetch: false,
  tableName: "users-permissions_role",
  modules() {
    return this.hasMany("module", "modules", "id");
  },
});

bookshelf.model("module", {
  requireFetch: false,
  tableName: "modules",
  module() {
    return this.belongsTo("module", "module", "id");
  },
  modules() {
    return this.hasMany("module", "modules", "id");
  },
  roles() {
    return this.hasMany("role", "roles", "id");
  },
});

bookshelf.model("permission", {
  requireFetch: false,
  tableName: "users-permissions_permission",
  role() {
    return this.belongsTo("role", "role", "id");
  },
});

bookshelf.model("roleModule", {
  requireFetch: false,
  tableName: "modules_roles__roles_modules",
});

bookshelf.model("state", {
  requireFetch: false,
  tableName: "states",
  district() {
    return this.hasMany("district", "state", "id");
  },
});

bookshelf.model("district", {
  requireFetch: false,
  tableName: "districts",
  state() {
    return this.belongsTo("state", "state", "id");
  },
});

bookshelf.model("activitytype", {
  tableName: "activitytypes",
  requireFetch: false,
});

bookshelf.model("loan_model", {
  requireFetch: false,
  tableName: "loan_models",
  emidetail() {
    return this.hasMany("emidetail", "loan_model", "id");
  },
  loantask() {
    return this.hasMany("loantask", "loan_model", "id");
  },
});

bookshelf.model("emidetail", {
  tableName: "emidetails",
  requireFetch: false,
  loan_model() {
    return this.belongsTo("loan_model", "loan_model", "id");
  },
});

bookshelf.model("loantask", {
  tableName: "loantasks",
  requireFetch: false,
  activitytype() {
    return this.hasOne("activitytype", "loantask", "id");
  },
  loan_model() {
    return this.belongsTo("loan_model", "loan_model", "id");
  },
});

bookshelf.model("individual", {
  tableName: "individuals",
  requireFetch: false,
});

bookshelf.model("organization", {
  tableName: "organizations",
  requireFetch: false,
});

bookshelf.model("contact", {
  tableName: "contacts",
  requireFetch: false,
  individual() {
    return this.hasOne("individual", "contact", "id");
  },
});

bookshelf.model("user", {
  tableName: "users-permissions_user",
  requireFetch: false,
});

module.exports = bookshelf;
