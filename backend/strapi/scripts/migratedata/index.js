const bookshelf = require("../../config/config.js");
const activitytypeData = require("./activitytypes.json");
const loanModelData = require("./loanmodel.json");
const emiDetailsData = require("./emidetails.json");
const loanTasksData = require("./loantasks.json");
const userData = require("./user.json");

// genric method to iterate over data
async function asyncForEach(array, callback) {
  if (array) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
}

// calls to all functions to store data
(async () => {
  await addIndividual();
  console.log("\n");
  await addOrganization();
  console.log("\n");
  await addContact();
  console.log("\n");
  await addUser();
  console.log("\n");
  await addActivitytypes();
  console.log("\n");
  await addLoanModel();
  console.log("\n");
  await addEmiDetails();
  console.log("\n");
  await addLoanTasks();
  console.log("\n");
  process.exit(0);
})();

// add activity types
async function addActivitytypes() {
  await asyncForEach(activitytypeData.activitytypes, async (activitytype) => {
    const activitytypePresent = await bookshelf
      .model("activitytype")
      .where({ name: activitytype.name })
      .fetch();
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
            notation: activitytype.notation,
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
  });
}

// add loan models
async function addLoanModel() {
  const fpoPresent = await bookshelf
    .model("contact")
    .where({
      name: "WAFPO",
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
          const fpoId = fpoPresent.toJSON ? fpoPresent.toJSON() : fpoPresent;
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
              console.log(`Added loanmodel ${loanmodel.product_name}`);
            });
        }
      } catch (error) {
        console.log(error);
      }
    });
  }
}

//add emi details
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
        const loanModel = loanModelPresent.toJSON
          ? loanModelPresent.toJSON()
          : loanModelPresent;
        await asyncForEach(emidetails, async (emidetail) => {
          const emiPresent = await bookshelf
            .model("emidetail")
            .where({
              principal: emidetail.principal,
              interest: emidetail.interest,
              loan_model: loanModel.id,
            })
            .fetch();
          if (emiPresent) {
            console.log(
              `Skipping emi details for loan model ${loanmodel.product_name}.....`
            );
          } else {
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

// add loan tasks
async function addLoanTasks() {
  await asyncForEach(loanModelData.loan_model, async (loanmodel) => {
    //if (loanmodel.product_name === "Horticulture" || "Goatery") {
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
    //}
  });
}

// add individuals
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

// add organizations
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

// add contacts
async function addContact() {
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
        .where({
          first_name: user.contact.individual.first_name,
          last_name: user.contact.individual.last_name,
        })
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

          if (
            user.contact.contact_type == "individual" &&
            user.username !== "1111111111"
          ) {
            await bookshelf
              .model("contact")
              .forge({
                name: user.contact.name,
                contact_type: user.contact.contact_type,
                phone: user.contact.phone,
                individual: contactId.id,
              })
              .save()
              .then((res) => {
                res.toJSON();
                console.log(`Added contact ${user.contact.name}`);
                linkcontactToInd(res.id, contactId.id);
              });
          } else if (user.contact.contact_type == "organization") {
            await bookshelf
              .model("contact")
              .forge({
                name: user.contact.name,
                contact_type: user.contact.contact_type,
                phone: user.contact.phone,
                organization: contactId.id,
              })
              .save()
              .then((res) => {
                res.toJSON();
                console.log(`Added contact ${user.contact.name}`);
                linkFpo(res);
                linkcontactToOrg(res.id, contactId.id);
              });
          } else {
            await bookshelf
              .model("contact")
              .forge({
                name: user.contact.name,
                contact_type: user.contact.contact_type,
                phone: user.contact.phone,
                individual: contactId.id,
                //org_fpo: fpotId.id,
              })
              .save()
              .then((res) => {
                res.toJSON();
                console.log(`Added contact ${user.contact.name}`);
                linkcontactToInd(res.id, contactId.id);
              });
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
}

// links FPO to individual to create FPO user
async function linkFpo(obj) {
  await bookshelf
    .model("individual")
    .where({
      first_name: "WA",
      last_name: "FPO admin",
    })
    .save({ fpo: obj.id }, { patch: true })
    .then(() => {
      console.log("Linked FPO admin to FPO user...");
    });
}

// links contact to individual
async function linkcontactToInd(contactId, indId) {
  if (indId) {
    await bookshelf
      .model("individual")
      .where({
        id: indId,
      })
      .save({ contact: contactId }, { patch: true })
      .then(() => {
        console.log("Linked contact to individual user...");
      });
  }
}

// links contact to organization
async function linkcontactToOrg(contactId, orgId) {
  if (orgId) {
    await bookshelf
      .model("organization")
      .where({
        id: orgId,
      })
      .save({ contact: contactId }, { patch: true })
      .then(() => {
        console.log("Linked contact to organization...");
      });
  }
}

// links user to contact
async function linkUsertoContact(userId, contactId) {
  if (contactId) {
    await bookshelf
      .model("contact")
      .where({
        id: contactId,
      })
      .save({ user: userId }, { patch: true })
      .then(() => {
        console.log("Linked user to contact...");
      });
  }
}

// add users
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
          // getting role id to assign to user
          const rolePresent = await bookshelf
            .model("role")
            .where({ name: user.last_name })
            .fetch();

          if (rolePresent) {
            const roleId = rolePresent.toJSON
              ? rolePresent.toJSON()
              : rolePresent;
            const contactModel = contactPresent.toJSON
              ? contactPresent.toJSON()
              : contactPresent;

            await bookshelf
              .model("user")
              .forge({
                username: user.username,
                provider: user.provider,
                email: user.email,
                password: user.password,
                confirmed: user.confirmed,
                blocked: user.blocked,
                first_name: user.first_name,
                last_name: user.last_name,
                role: roleId.id,
                contact: contactModel.id,
              })
              .save()
              .then((res) => {
                res.toJSON();
                console.log(`Added user ${user.username}..`);
                linkUsertoContact(res.id, contactModel.id);
              });
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
}
