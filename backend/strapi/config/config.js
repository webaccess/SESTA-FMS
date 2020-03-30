const knex = require("knex")({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    port: "5432",
    user: "postgres",
    password: "root",
    database: "sesta"
    // host: "${process.env.DATABASE_HOST || '127.0.0.1'}",
    // port: "${process.env.DATABASE_PORT || 5432}",
    // user: "${process.env.DATABASE_USERNAME || ''}",
    // password: "${process.env.DATABASE_PASSWORD || ''}",
    // database: "${process.env.DATABASE_NAME || 'strapi'}"
  }
});

const bookshelf = require("bookshelf")(knex);

bookshelf.model("role", {
  requireFetch: false,
  tableName: "users-permissions_role",
  modules() {
    return this.hasMany("module", "modules", "id");
  }
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
  }
});

bookshelf.model("permission", {
  requireFetch: false,
  tableName: "users-permissions_permission",
  role() {
    return this.belongsTo("role", "role", "id");
  }
});

bookshelf.model("roleModule", {
  requireFetch: false,
  tableName: "modules_roles__roles_modules"
});

module.exports = bookshelf;
