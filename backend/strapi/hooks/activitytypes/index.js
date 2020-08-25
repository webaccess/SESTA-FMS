const fs = require("fs");
const path = require("path");
const bookshelf = require("../../config/config.js");
const activitytypeData = require("./activitytypes.json");
const loanModelData = require("./loanmodel.json");
const emiDetailsData = require("./emidetails.json");
const loanTasksData = require("./loantasks.json");
const userData = require("./user.json");
const { serialize } = require("v8");
const bcrypt = require("bcryptjs");
const request = require("request");
var Promise = require("bluebird");

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function hashPassword(user = {}) {
  return new Promise((resolve) => {
    bcrypt.hash(`${user.password}`, 10, (err, hash) => {
      console.log("passed pass, hash", user.password, hash);
      resolve(hash);
    });
  });
}
let values = { password: "password" };
if (values.password) {
  values.password = hashPassword(values);
}
console.log("After hashPassword", values.password, values);

module.exports = (strapi) => {
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
      (async () => {
        //addIndividual();
        //console.log("--After Individual\n");
        //addOrganization();
        //console.log("--After Organization\n");
        //addContact();
        //console.log("--After Contact\n");
        //addUser();
        //console.log("--After User\n");
        addActivitytypes();
        console.log("--After activitytypes\n");
        //addLoanModel();
        //console.log("--After loanmodels\n");
        //addEmiDetails();
        //console.log("--After emidetails\n");
        //addLoanTasks();
        //console.log("--After loantasks\n");
      })();

      //await bookshelf
      //  .model("user")
      //  .forge({
      //    username: "passtest",
      //    provider: "local",
      //    email: "ank@gmail.com",
      //    password:
      //      "$2a$10$Pg24BdHmzcje1fM/yRL6ceAxBlP5UX5Gf.Grw3Ki2r19rNB23fqeS",
      //    confirmed: true,
      //    blocked: false,
      //    role: 2,
      //    //contact: contactModel.id,
      //  })
      //  .save();

      let values = { password: "password" };
      let valuesP = "password";
      //values.password = await strapi.plugins[
      //  "users-permissions"
      //].services.user.hashPassword(values.password);

      values.password = bcrypt.hash(`${values.password}`, 10, (err, hash) => {
        return hash;
      });

      console.log("values,newPass4", values.password);

      valuesP = bcrypt.hash(values, 10, (err, hash) => {
        // Now we can store the password hash in db.
        return hash;
      });
      console.log("valuesP2", valuesP);

      async function addActivitytypes() {
        //let fpoUserPresent;
        //fpoUserPresent = await bookshelf
        //  .model("user")
        //  .where({ username: "fpouser" })
        //  .fetch();
        //const fpoUserId = fpoUserPresent.toJSON
        //  ? fpoUserPresent.toJSON()
        //  : fpoUserPresent;
        //console.log("fpoUserId", fpoUserId);
        await asyncForEach(
          activitytypeData.activitytypes,
          //org_fpo
          async (activitytype) => {
            const activitytypePresent = await bookshelf
              .model("activitytype")
              .where({ name: activitytype.name })
              .fetch();
            // save countries
            try {
              if (activitytypePresent) {
                console.log(`Skipping activitytype ${activitytype.name}...`);
              } else {
                //console.log("fpoUserId inside loop 3", fpoUserId);
                await bookshelf
                  .model("activitytype")
                  .forge({
                    name: activitytype.name,
                    is_active: activitytype.is_active,
                    remuneration: activitytype.remuneration,
                    notation: activitytype.notation,
                    autocreated: activitytype.autocreated,
                    //contact: fpoUserId.id,
                  })
                  .save()
                  .then(() => {
                    console.log(`Added activitytype ${activitytype.name}`);
                  });
              }
            } catch (error) {
              console.log(error);
            }
          }
        );
      }

      async function addLoanModel() {
        const fpoPresent = await bookshelf
          .model("contact")
          .where({
            name: "WAfpoadmin",
            contact_type: "organization",
          })
          .fetch();
        if (fpoPresent) {
          await asyncForEach(loanModelData.loan_model, async (loanmodel) => {
            const loanModelPresent = await bookshelf
              .model("loan_model")
              .where({ product_name: loanmodel.product_name })
              .fetch();
            try {
              if (loanModelPresent) {
                console.log(`Skipping loan model ${loanmodel.product_name}...`);
              } else {
                const fpoId = fpoPresent.toJSON
                  ? fpoPresent.toJSON()
                  : fpoPresent;
                await bookshelf
                  .model("loan_model")
                  .forge({
                    product_name: loanmodel.product_name,
                    specification: loanmodel.specification,
                    loan_amount: loanmodel.loan_amount,
                    duration: loanmodel.duration,
                    emi: loanmodel.emi,
                    fpo: fpoId.id,
                  })
                  .save()
                  .then(() => {
                    console.log(`Added loanmodel ${loanmodel.name}`);
                  });
              }
            } catch (error) {
              console.log(error);
            }
          });
        }
      }

      async function addEmiDetails() {
        await asyncForEach(loanModelData.loan_model, async (loanmodel) => {
          const { emidetails } = loanmodel;
          const loanModelPresent = await bookshelf
            .model("loan_model")
            .where({ product_name: loanmodel.product_name })
            .fetch();
          // save emidetails
          try {
            if (loanModelPresent) {
              await asyncForEach(emidetails, async (emidetail) => {
                const emiPresent = await bookshelf
                  .model("emidetail")
                  .where({
                    //loan_model: emidetail.id,
                    principal: emidetail.principal,
                    interest: emidetail.interest,
                  })
                  .fetch();
                if (emiPresent) {
                  console.log(
                    `Skipping emi details for loan model ${loanmodel.product_name}.....`
                  );
                } else {
                  const loanModel = loanModelPresent.toJSON
                    ? loanModelPresent.toJSON()
                    : loanModelPresent;

                  await emiDetailsData.emidetail

                    .filter(
                      (item) =>
                        item.loan_model === emidetail.loan_model &&
                        item.interest === emidetail.interest
                    )
                    .map((filteredloanModel) => {
                      bookshelf
                        .model("emidetail")
                        .forge({
                          principal: filteredloanModel.principal,
                          interest: filteredloanModel.interest,
                          loan_model: loanModel.id,
                        })
                        .save()
                        .then(() => {
                          console.log(
                            `Added Emidetails of ${loanModel.product_name}`
                          );
                        });
                    });
                }
              });
            }
          } catch (error) {
            console.log(error);
          }
        });
      }

      async function addLoanTasks() {
        await asyncForEach(loanModelData.loan_model, async (loanmodel) => {
          const { loantasks } = loanmodel;
          const loanModelPresent = await bookshelf
            .model("loan_model")
            .where({ product_name: loanmodel.product_name })
            .fetch();
          // save loantasks
          try {
            if (loanModelPresent) {
              await asyncForEach(loantasks, async (loantask) => {
                const actPresent = await bookshelf
                  .model("activitytype")
                  .where({
                    name: loantask,
                  })
                  .fetch();
                if (actPresent) {
                  const activityTypeId = actPresent.toJSON
                    ? actPresent.toJSON()
                    : actPresent;
                  const loanModel = loanModelPresent.toJSON
                    ? loanModelPresent.toJSON()
                    : loanModelPresent;

                  const loanTaskPresent = await bookshelf
                    .model("loantask")
                    .where({
                      loan_model: loanModel.id,
                      activitytype: activityTypeId.id,
                    })
                    .fetch();
                  if (loanTaskPresent) {
                    console.log(
                      `Skipping loan task details for loan model ${loanmodel.product_name}.....`
                    );
                  } else {
                    const activityTypeId = actPresent.toJSON
                      ? actPresent.toJSON()
                      : actPresent;
                    await loanTasksData.loantask
                      .filter(
                        (item) =>
                          item.loan_model === loanmodel.product_name &&
                          item.activitytype === loantask
                      )
                      .map((filteredloanTaskModel) => {
                        bookshelf
                          .model("loantask")
                          .forge({
                            loan_model: loanModel.id,
                            activitytype: activityTypeId.id,
                          })
                          .save()
                          .then(() => {
                            console.log(
                              `Added loan task details of ${loanModel.product_name}`
                            );
                          });
                      });
                  }
                }
              });
            }
          } catch (error) {
            console.log(error);
          }
        });
      }

      async function addIndividual() {
        await asyncForEach(userData.user, async (user) => {
          if (user.contact.contact_type === "individual") {
            const individualPresent = await bookshelf
              .model("individual")
              .where({
                first_name: user.contact.individual.first_name,
                last_name: user.contact.individual.last_name,
              })
              .fetch();
            try {
              if (individualPresent) {
                console.log(
                  `Skipping individual ${user.contact.individual.first_name} ---`
                );
              } else {
                console.log(
                  "userData ind--",
                  user.contact.individual,
                  user.contact.individual.first_name
                );
                await bookshelf
                  .model("individual")
                  .forge({
                    first_name: user.contact.individual.first_name,
                    last_name: user.contact.individual.last_name,
                  })
                  .save()
                  .then(() => {
                    console.log(
                      `Added individual ${user.contact.individual.first_name} ---`
                    );
                  });
              }
            } catch (error) {
              console.log(error);
            }
          }
        });
      }

      async function addOrganization() {
        await asyncForEach(userData.user, async (user) => {
          if (user.contact.contact_type === "organization") {
            const orgPresent = await bookshelf
              .model("organization")
              .where({
                name: user.contact.organization.name,
                sub_type: user.contact.organization.sub_type,
              })
              .fetch();
            try {
              if (orgPresent) {
                console.log(
                  `Skipping organization ${user.contact.organization.name} ---`
                );
              } else {
                console.log(
                  "userData org--",
                  user.contact.organization,
                  user.contact.organization.name
                );
                await bookshelf
                  .model("organization")
                  .forge({
                    name: user.contact.organization.name,
                    sub_type: user.contact.organization.sub_type,
                  })
                  .save()
                  .then(() => {
                    console.log(
                      `Added organization ${user.contact.organization.name} ---`
                    );
                  });
              }
            } catch (error) {
              console.log(error);
            }
          }
        });
      }

      async function addContact() {
        let contactTypePresent;
        let fpoPresent;
        let fpotId;
        await asyncForEach(userData.user, async (user) => {
          if (user.contact.contact_type === "organization") {
            contactTypePresent = await bookshelf
              .model("organization")
              .where({
                name: user.contact.organization.name,
                sub_type: user.contact.organization.sub_type,
              })
              .fetch();
          } else {
            contactTypePresent = await bookshelf
              .model("individual")
              .where({ first_name: user.contact.individual.first_name })
              .fetch();
          }
          try {
            console.log("contactTypePresent 3", contactTypePresent);
            if (contactTypePresent) {
              if (user.username === "fpouser") {
                console.log("In fpouser 3");
                fpoPresent = await bookshelf
                  .model("organization")
                  .where({
                    name: "WAfpoadmin",
                    sub_type: "FPO",
                  })
                  .fetch();
                fpotId = fpoPresent.toJSON ? fpoPresent.toJSON() : fpoPresent;
                console.log("fpotId 3", fpotId);
              }

              const contactPresent = await bookshelf
                .model("contact")
                .where({
                  name: user.contact.name,
                  contact_type: user.contact.contact_type,
                })
                .fetch();
              console.log("contactPresent", contactPresent);
              if (contactPresent) {
                console.log(`Skipping ${user.contact.name}...`);
              } else {
                const contactId = contactTypePresent.toJSON
                  ? contactTypePresent.toJSON()
                  : contactTypePresent;

                if (
                  user.contact.contact_type == "individual" &&
                  user.username !== "fpouser"
                ) {
                  console.log("-In superadmin loop 1");
                  await bookshelf
                    .model("contact")
                    .forge({
                      name: user.contact.name,
                      contact_type: user.contact.contact_type,
                      individual: contactId.id,
                    })
                    .save()
                    .then(() => {
                      console.log(`Added contact ${user.contact.name}`);
                    });
                } else if (user.contact.contact_type == "organization") {
                  console.log("-In fpo admin loop 1");
                  await bookshelf
                    .model("contact")
                    .forge({
                      name: user.contact.name,
                      contact_type: user.contact.contact_type,
                      organization: contactId.id,
                    })
                    .save()
                    .then(() => {
                      console.log(`Added contact ${user.contact.name}`);
                    });
                } else {
                  console.log("-In fpo user 2nd loop new");
                  console.log(
                    "fpotId.id 3",
                    fpoPresent,
                    fpotId.id,
                    contactId.id
                  );
                  await bookshelf
                    .model("contact")
                    .forge({
                      name: user.contact.name,
                      contact_type: user.contact.contact_type,
                      individual: contactId.id,
                      org_fpo: fpotId.id,
                    })
                    .save()
                    .then(() => {
                      console.log(`Added contact ${user.contact.name}`);
                    });
                }
              }
              //});
              //    const fpoAdminPresent = await bookshelf
              //.model("contact")
              //.where({
              //  name: "WAfpoadmin",
              //  contact_type: "organization",
              //})
              //if (fpoAdminPresent){
              //  fpotId = fpoAdminPresent.toJSON ? fpoAdminPresent.toJSON() : fpoAdminPresent;

              //}
            }
          } catch (error) {
            console.log(error);
          }
        });
      }

      async function addUser() {
        await asyncForEach(userData.user, async (user) => {
          const contactPresent = await bookshelf
            .model("contact")
            .where({
              name: user.contact.name,
              contact_type: user.contact.contact_type,
            })
            .fetch();

          try {
            if (contactPresent) {
              const userPresent = await bookshelf
                .model("user")
                .where({ username: user.username })
                .fetch();
              if (userPresent) {
                console.log(`Skipping user ${user.username}...`);
              } else {
                const contactModel = contactPresent.toJSON
                  ? contactPresent.toJSON()
                  : contactPresent;
                await bookshelf
                  .model("user")
                  .forge({
                    username: user.username,
                    email: user.email,
                    password: user.password,
                    confirmed: user.confirmed,
                    blocked: user.blocked,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    role: user.role,
                    contact: contactModel.id,
                  })
                  .save()
                  .then(() => {
                    console.log(`Added user ${user.username}..`);
                  });
              }
            }
          } catch (error) {
            console.log(error);
          }
        });
      }
    },
  };

  return hook;
};
