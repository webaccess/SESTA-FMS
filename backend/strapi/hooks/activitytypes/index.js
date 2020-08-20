const fs = require("fs");
const path = require("path");
const bookshelf = require("../../config/config.js");
const activitytypeData = require("./activitytypes.json");
const loanModelData = require("./loanmodel.json");
const emiDetailsData = require("./emidetails.json");
const loanTasksData = require("./loantasks.json");
const userData = require("./user.json");

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

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
        addActivitytypes();
        console.log("--After activitytypes\n");
        addLoanModel();
        console.log("--After loanmodels\n");
        addEmiDetails();
        console.log("--After emidetails\n");
        addLoanTasks();
        console.log("--After loantasks\n");
        addIndividual();
        console.log("--After Individual\n");
        addOrganization();
        console.log("--After Organization\n");
        addContact();
        console.log("--After Contact\n");
        addUser();
        console.log("--After User\n");
      })();

      async function addActivitytypes() {
        await asyncForEach(
          activitytypeData.activitytypes,
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
                await bookshelf
                  .model("activitytype")
                  .forge({
                    name: activitytype.name,
                    is_active: activitytype.is_active,
                    remuneration: activitytype.remuneration,
                    autocreated: activitytype.autocreated,
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
                console.log(`Skipping individual ---`);
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
                    console.log(`Added individual ---`);
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
                console.log(`Skipping organization ---`);
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
                    console.log(`Added organization ---`);
                  });
              }
            } catch (error) {
              console.log(error);
            }
          }
        });
      }

      async function addContact() {
        let contactType;
        let contactTypePresent;
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
            if (contactTypePresent) {
              const contactPresent = await bookshelf
                .model("contact")
                .where({
                  name: user.contact.name,
                  contact_type: user.contact.contact_type,
                })
                .fetch();

              if (contactPresent) {
                console.log(`Skipping ${user.contact.name}...`);
              } else {
                const contactId = contactTypePresent.toJSON
                  ? contactTypePresent.toJSON()
                  : contactTypePresent;

                if (user.contact.contact_type == "individual") {
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
                } else {
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
                }
              }
              //});
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
                console.log(`Skipping user ...`);
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
                    console.log(`Added user ..`);
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
