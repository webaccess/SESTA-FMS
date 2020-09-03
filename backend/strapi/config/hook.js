module.exports = {
  timeout: 3000,
  load: {
    before: [],
    order: [
      "Define the hooks' load order by putting their names in this array in the right order",
    ],
    after: [],
  },
  settings: {
    autoload: {
      enabled: true,
    },
    migratedata: {
      enabled: true,
    },
  },
};
