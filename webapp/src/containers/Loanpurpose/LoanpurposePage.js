import React, { Component, useState } from "react";
import Layout from "../../hoc/Layout/Layout";
import * as serviceProvider from "../../api/Axios";
import auth from "../../components/Auth/Auth";
import { withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import {
  AddCircleOutlined,
  RemoveCircleOutlined,
  PhotoSizeSelectLargeOutlined,
} from "@material-ui/icons";
import Button from "../../components/UI/Button/Button";
import Autotext from "../../components/Autotext/Autotext.js";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Input from "../../components/UI/Input/Input";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Grid,
} from "@material-ui/core";
import { map } from "lodash";
import validateInput from "../../components/Validation/ValidateInput/ValidateInput";
import {
  EDIT_LOANPURPOSE_BREADCRUMBS,
  ADD_LOANPURPOSE_BREADCRUMBS,
} from "./config";
import { Link } from "react-router-dom";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import Spinner from "../../components/Spinner/Spinner";

const useStyles = (theme) => ({
  Icon: {
    fontSize: "20px",
    color: "black",
    "&:hover": {
      color: "black",
    },
    "&:active": {
      color: "black",
    },
  },
  labelHeader: {
    fontSize: "17px",
  },
});

class LoanpurposePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addPrincipal: [],
      emidetails: {},
      taskdetails: {},
      values: {},
      addPurpose: "",
      users: [{ principal: "", interest: "" }],
      task: [{ activitytype: "" }],
      getFPO: [],
      actTypeFilter: [],
      validations: {
        addPurpose: {
          required: { value: "true", message: "Loan purpose is required" },
        },
        addDuration: {
          required: { value: "true", message: "Duration field is required" },
        },
        addSpecification: {
          required: {
            value: "true",
            message: "Specification field is required",
          },
        },
        addAmount: {
          required: {
            value: "true",
            message: "Total Amount field is required",
          },
        },
        addFPO: {
          required: {
            value: "true",
            message: "FPO field is required",
          },
        },
        addEMI: {
          required: {
            value: "true",
            message: "EMI field is required",
          },
        },
        task: {
          required: {
            value: "true",
            message: "Task name field is required",
          },
        },
      },
      errors: {
        addPurpose: [],
        addDuration: [],
        addSpecification: [],
        addAmount: [],
        addFPO: [],
        addEMI: [],
        task: [],
        addVillage: [],
      },
      formSubmitted: "",
      stateSelected: false,
      editPage: [
        this.props.match.params.id !== undefined ? true : false,
        this.props.match.params.id,
      ],
      loggedInUserRole: auth.getUserInfo().role.name,
      assignedFPO: "",
      isLoader: "",
    };
  }

  async componentDidMount() {
    if (this.state.editPage[0]) {
      this.setState({ isLoader: true });
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "loan-models/" +
            this.state.editPage[1],
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + "",
            },
          }
        )
        .then((res) => {
          this.setState({
            values: {
              addPurpose: res.data.product_name,
              addDuration: res.data.duration,
              addSpecification: res.data.specification,
              addAmount: res.data.loan_amount,
              addFPO: res.data.fpo.id,
              addEMI: res.data.emi,
            },
            isLoader: false,
          });

          if (res.data.emidetails) {
            this.setState({ isLoader: false });
            let getEmi = res.data.emidetails;
            this.state.users = getEmi.map((obj) => {
              return obj;
            });
          }

          if (res.data.loantasks) {
            this.setState({ isLoader: false });
            let getTask = res.data.loantasks;
            this.state.task = getTask.map((obj) => {
              return obj;
            });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/contact/?contact_type=organization&organization.sub_type=FPO&&_sort=name:ASC"
      )
      .then((res) => {
        this.setState({ getFPO: res.data });
      })
      .catch((error) => {});

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/activitytypes/?_sort=name:ASC"
      )
      .then((res) => {
        this.setState({ actTypeFilter: res.data });
      })
      .catch((error) => {
        console.log(error);
      });

    /** get FPO assigned to logged in FPO admn user */
    if (this.state.loggedInUserRole === "FPO Admin") {
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/individuals/" +
            auth.getUserInfo().contact.individual
        )
        .then((indRes) => {
          this.setState({ assignedFPO: indRes.data.fpo.id });
        })
        .catch((error) => {});
    }
  }

  //adds input fields corresponding to no of clicks
  addClick() {
    this.setState((prevState) => ({
      users: [...prevState.users, { principal: "", interest: "" }],
    }));
  }

  //adds input fields corresponding to no of clicks
  addTaskClick() {
    this.setState((prevState) => ({
      task: [...prevState.task, { name: "" }],
    }));
  }

  // displays EMI installment part
  createUI() {
    const { classes } = this.props;
    // displays no of input field pairs as per the EMI entries present
    return this.state.users.map((el, i) => (
      <div key={i} class="emiTxtbox">
        <Grid container spacing={2}>
          <Grid item md={6} xs={12}>
            <span
              style={{
                "font-weight": "bolder",
                "font-size": "large",
                display: "inline-block",
                width: "25px",
                "vertical-align": "middle",
              }}
            >
              {i + 1}
            </span>

            <span
              style={{
                display: "inline-block",
                width: "calc(100% - 25px)",
                "vertical-align": "middle",
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Input
                    style={{ "margin-left": "2%" }}
                    label="Principal"
                    type="number"
                    name="principal"
                    value={el.principal}
                    onChange={this.handleUIChange.bind(this, i)}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Input
                    style={{ "margin-left": "5%" }}
                    label="Interest"
                    type="number"
                    name="interest"
                    value={el.interest}
                    onChange={this.handleUIChange.bind(this, i)}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </span>
          </Grid>

          <Grid item md={6} xs={12}>
            {this.state.users.length !== 1 && (
              <IconButton
                aria-label="remove"
                onClick={this.removeClick.bind(this, i)}
                style={{ "margin-left": "3%" }}
              >
                <RemoveCircleOutlined className={classes.Icon} />
                <span className={classes.labelHeader}>Remove</span>
              </IconButton>
            )}
          </Grid>
        </Grid>
      </div>
    ));
  }

  // displays loan tasks part
  createTaskUI() {
    const { classes } = this.props;
    let actTypeFilter = this.state.actTypeFilter;
    // displays no of input fields  as per the loan tasks present
    return this.state.task.map((el, i) => (
      <div key={i}>
        <Grid container spacing={2}>
          <Grid item md={6} xs={12}>
            <span
              style={{
                "font-weight": "bolder",
                "font-size": "large",
                display: "inline-block",
                width: "30px",
                "vertical-align": "middle",
              }}
            >
              {i + 1}
            </span>
            <span
              style={{
                display: "inline-block",
                width: "calc(100% - 30px)",
                "vertical-align": "middle",
              }}
            >
              <Autocomplete
                id="name"
                value={el.activitytype}
                options={actTypeFilter}
                variant="outlined"
                getOptionLabel={(option) => option.name}
                placeholder="Select Activity type"
                onChange={(event, value, i) => {
                  this.handleTaskUIChange({
                    target: { name: "activitytype", value: value },
                  });
                }}
                renderInput={(params) => (
                  <Input
                    {...params}
                    //fullWidth
                    label="Select Activity type"
                    name="name"
                    variant="outlined"
                  />
                )}
              />
            </span>
          </Grid>
          <Grid item md={6} xs={12}>
            {this.state.task.length !== 1 && (
              <IconButton
                aria-label="remove"
                onClick={this.removeTaskClick.bind(this, i)}
                style={{ "margin-left": "3%" }}
              >
                <RemoveCircleOutlined className={classes.Icon} />
                <span className={classes.labelHeader}>Remove</span>
              </IconButton>
            )}
          </Grid>
        </Grid>
      </div>
    ));
  }
  // handles the change of EMI installments
  handleUIChange(i, e) {
    const { name, value } = e.target;
    let users = [...this.state.users];
    users[i] = { ...users[i], [name]: value };
    this.setState({ users });
  }

  // removing input field on click along with the data present in it
  removeClick(i, e) {
    let users = [...this.state.users];
    users.splice(i, 1);
    this.setState({ users });
  }

  // handles the change of loan tasks
  handleTaskUIChange(event) {
    let taskData = this.state.task;
    let i;

    // passing index to be stored against each entry
    if (taskData) {
      i = taskData.length - 1;
    } else {
      i = 0;
    }

    const { name, value, j } = event.target;
    let task = [...this.state.task];
    task[i] = { ...task[i], [name]: value };
    i++;
    this.setState({ task });
  }

  // removing input field on click along with the data present in it
  removeTaskClick(i) {
    let task = [...this.state.task];
    task.splice(i, 1);
    this.setState({ task });
  }

  handleChange = ({ target }) => {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value },
    });
  };

  handleFpoChange(event, value) {
    if (value !== null) {
      this.setState({
        values: { ...this.state.values, addFPO: value.id },
      });
    } else {
      this.setState({
        values: {
          ...this.state.values,
          addFPO: "",
        },
      });
    }
  }

  validate = () => {
    const values = this.state.values;
    const validations = this.state.validations;
    map(validations, (validation, key) => {
      let value = values[key] ? values[key] : "";
      const errors = validateInput(value, validation);
      let errorset = this.state.errors;
      if (errors.length > 0) errorset[key] = errors;
      else delete errorset[key];
      this.setState({ errors: errorset });
    });
  };

  hasError = (field) => {
    if (this.state.errors[field] !== undefined) {
      return Object.keys(this.state.errors).length > 0 &&
        this.state.errors[field].length > 0
        ? true
        : false;
    }
  };

  saveEmiDetails = async (data, Id) => {
    // checking if EMI details for resp. loan model already exist
    if (data.emidetails.length > 0) {
      for (let i in this.state.users) {
        // creating new EMI entry for existing loan model
        if (this.state.users[i] && !data.emidetails[i]) {
          serviceProvider
            .serviceProviderForPostRequest(
              process.env.REACT_APP_SERVER_URL + "emidetails/",
              {
                principal: this.state.users[i].principal,
                interest: this.state.users[i].interest,
                loan_model: Id,
              }
            )
            .then((res) => {})
            .catch((error) => {
              console.log(error);
            });
        } else {
          // updating  EMI entry of exisiting loan model
          serviceProvider
            .serviceProviderForPutRequest(
              process.env.REACT_APP_SERVER_URL + "emidetails",
              data.emidetails[i].id,
              {
                principal: this.state.users[i].principal,
                interest: this.state.users[i].interest,
                loan_model: Id,
              }
            )
            .then((res) => {})
            .catch((error) => {
              console.log(error);
            });
        }
      }
      // deleting an EMI entry of exisiting loan model
      if (data.emidetails.length > this.state.users.length) {
        for (let i in data.emidetails) {
          if (!this.state.users[i] && data.emidetails[i]) {
            serviceProvider
              .serviceProviderForDeleteRequest(
                process.env.REACT_APP_SERVER_URL + "emidetails",
                data.emidetails[i].id
              )
              .then((res) => {})
              .catch((error) => {
                console.log(error);
              });
          }
        }
      }
    } // creating new EMI entry for newly added loan model
    else {
      for (let i in this.state.users) {
        serviceProvider
          .serviceProviderForPostRequest(
            process.env.REACT_APP_SERVER_URL + "emidetails/",
            {
              principal: this.state.users[i].principal,
              interest: this.state.users[i].interest,
              loan_model: Id,
            }
          )
          .then((res) => {})
          .catch((error) => {
            console.log(error);
          });
      }
    }
  };

  saveTaskDetails = async (data, Id) => {
    // checking if loan tasks for resp. loan model already exist
    if (data.loantasks.length > 0) {
      for (let i in this.state.task) {
        // creating new loan task  for exisiting. loan model
        if (this.state.task[i] && !data.loantasks[i]) {
          serviceProvider
            .serviceProviderForPostRequest(
              process.env.REACT_APP_SERVER_URL + "loantasks/",
              {
                activitytype: this.state.task[i].activitytype,
                loan_model: Id,
              }
            )
            .then((res) => {})
            .catch((error) => {
              console.log(error);
            });
        } else {
          // updating loan task of exisiting loan model
          serviceProvider
            .serviceProviderForPutRequest(
              process.env.REACT_APP_SERVER_URL + "loantasks",
              data.loantasks[i].id,
              {
                activitytype: this.state.task[i].activitytype,
                loan_model: Id,
              }
            )
            .then((res) => {})
            .catch((error) => {
              console.log(error);
            });
        }
      }
      // deleting loan task of exisiting loan model
      if (data.loantasks.length > this.state.task.length) {
        for (let i in data.loantasks) {
          if (!this.state.task[i] && data.loantasks[i]) {
            serviceProvider
              .serviceProviderForDeleteRequest(
                process.env.REACT_APP_SERVER_URL + "loantasks",
                data.loantasks[i].id
              )
              .then((res) => {})
              .catch((error) => {
                console.log(error);
              });
          }
        }
      }
    } // creating loan task for newly added loan model
    else {
      for (let i in this.state.task) {
        serviceProvider
          .serviceProviderForPostRequest(
            process.env.REACT_APP_SERVER_URL + "loantasks/",
            {
              activitytype: this.state.task[i].activitytype,
              loan_model: Id,
            }
          )
          .then((res) => {})
          .catch((error) => {
            console.log(error);
          });
      }
    }
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.validate();
    this.setState({ formSubmitted: "" });

    let productName = this.state.values.addPurpose;
    let addDuration = this.state.values.addDuration;
    let addSpecification = this.state.values.addSpecification;
    let addAmount = this.state.values.addAmount;
    let loanEmi = this.state.values.addEMI;
    let postLoan = {
      product_name: productName,
      duration: addDuration,
      specification: addSpecification,
      loan_amount: addAmount,
      emi: loanEmi,
    };
    /** save fpo selected from the drop down if roles are sesta admin & superadmin
     * save FPO belongs to logged in user if role is FPO admin
     */
    if (
      this.state.loggedInUserRole === "Sesta Admin" ||
      this.state.loggedInUserRole === "Superadmin"
    ) {
      Object.assign(postLoan, {
        fpo: this.state.values.addFPO,
      });
    } else {
      Object.assign(postLoan, {
        fpo: this.state.assignedFPO,
      });
    }

    if (this.state.editPage[0]) {
      serviceProvider
        .serviceProviderForPutRequest(
          process.env.REACT_APP_SERVER_URL + "loan-models",
          this.state.editPage[1],
          postLoan
        )
        .then((res) => {
          if (this.state.users) {
            this.saveEmiDetails(res.data, res.data.id);
          }
          if (this.state.task) {
            this.saveTaskDetails(res.data, res.data.id);
          }
          this.setState({ formSubmitted: true });

          // bankIds = res.data.id;
          this.props.history.push({
            pathname: "/loanpurposes",
            editData: true,
          });
        })
        .catch((error) => {
          this.setState({ formSubmitted: false });
          console.log(error);
        });
    } else {
      serviceProvider
        .serviceProviderForPostRequest(
          process.env.REACT_APP_SERVER_URL + "loan-models/",
          postLoan
        )
        .then((res) => {
          let bankId = res.data.id;
          this.setState({ bankDeatilsId: bankId });

          if (this.state.users.length) {
            this.saveEmiDetails(res.data, res.data.id);
          }
          if (this.state.task) {
            this.saveTaskDetails(res.data, res.data.id);
          }
          this.props.history.push({ pathname: "/loanpurposes", addData: true });
          this.setState({ formSubmitted: true });
        })
        .catch((error) => {
          this.setState({ formSubmitted: false });
        });
    }
  };

  cancelForm = () => {
    this.setState({
      values: {},
      formSubmitted: "",
    });
  };

  render() {
    const { classes } = this.props;
    let fpoFilters = this.state.getFPO;
    let addFPO = this.state.values.addFPO;
    let isCancel = this.state.isCancel;
    return (
      <Layout
        breadcrumbs={
          this.state.editPage[0]
            ? EDIT_LOANPURPOSE_BREADCRUMBS
            : ADD_LOANPURPOSE_BREADCRUMBS
        }
      >
        {!this.state.isLoader ? (
          <Card style={{ maxWidth: "45rem" }}>
            <form
              autoComplete="off"
              noValidate
              onSubmit={this.handleSubmit}
              method="post"
            >
              <CardHeader
                title={
                  this.state.editPage[0]
                    ? "Edit Loan Purpose"
                    : "Add Loan Purpose "
                }
                subheader={
                  this.state.editPage[0]
                    ? "You can edit loan purpose data here!"
                    : "You can add new loan purpose data here!"
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item md={12} xs={12}>
                    {this.state.formSubmitted === true ? (
                      <Snackbar severity="success">
                        Loan Purpose added successfully.
                      </Snackbar>
                    ) : null}
                    {this.state.formSubmitted === false ? (
                      <Snackbar severity="error" Showbutton={false}>
                        Network Error - Please try again!
                      </Snackbar>
                    ) : null}
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <Input
                      fullWidth
                      label="Product Name*"
                      name="addPurpose"
                      error={this.hasError("addPurpose")}
                      helperText={
                        this.hasError("addPurpose")
                          ? this.state.errors.addPurpose[0]
                          : null
                      }
                      value={this.state.values.addPurpose || ""}
                      onChange={this.handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <Input
                      fullWidth
                      label="Duration*"
                      type="number"
                      name="addDuration"
                      error={this.hasError("addDuration")}
                      helperText={
                        this.hasError("addDuration")
                          ? this.state.errors.addDuration[0]
                          : null
                      }
                      value={this.state.values.addDuration || ""}
                      onChange={this.handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <Input
                      fullWidth
                      label="Area/Size/Specifications*"
                      name="addSpecification"
                      error={this.hasError("addSpecification")}
                      helperText={
                        this.hasError("addSpecification")
                          ? this.state.errors.addSpecification[0]
                          : null
                      }
                      value={this.state.values.addSpecification || ""}
                      onChange={this.handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <Input
                      fullWidth
                      label="Total Amount*"
                      type="number"
                      name="addAmount"
                      error={this.hasError("addAmount")}
                      helperText={
                        this.hasError("addAmount")
                          ? this.state.errors.addAmount[0]
                          : null
                      }
                      value={this.state.values.addAmount || ""}
                      onChange={this.handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  {this.state.loggedInUserRole === "Sesta Admin" ||
                  this.state.loggedInUserRole === "Superadmin" ? (
                    <Grid item md={6} xs={12}>
                      <Autotext
                        id="combo-box-demo"
                        options={fpoFilters}
                        variant="outlined"
                        label="FPO"
                        getOptionLabel={(option) => option.name}
                        onChange={(event, value) => {
                          this.handleFpoChange(event, value);
                        }}
                        value={
                          addFPO
                            ? this.state.isCancel === true
                              ? null
                              : fpoFilters[
                                  fpoFilters.findIndex(function (item, i) {
                                    return item.id === addFPO;
                                  })
                                ] || null
                            : null
                        }
                        error={this.hasError("addFPO")}
                        helperText={
                          this.hasError("addFPO")
                            ? this.state.errors.addFPO[0]
                            : null
                        }
                        renderInput={(params) => (
                          <Input
                            fullWidth
                            label="FPO"
                            name="addFPO"
                            variant="outlined"
                          />
                        )}
                      />
                    </Grid>
                  ) : null}
                  <Grid item md={6} xs={12}>
                    <Input
                      fullWidth
                      label="EMI"
                      type="number"
                      name="addEMI"
                      error={this.hasError("addEMI")}
                      helperText={
                        this.hasError("addEMI")
                          ? this.state.errors.addEMI[0]
                          : null
                      }
                      value={this.state.values.addEMI || ""}
                      onChange={this.handleChange}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
                <br></br>
                <Divider className="style.border " style={{ height: "2px" }} />
                <br />
                <span
                  style={{ "margin-left": "10px", "font-weight": "bolder" }}
                >
                  EMI Installments
                </span>
                <br />
                <br />
                {this.createUI()}
                <IconButton
                  aria-label="add"
                  onClick={this.addClick.bind(this)}
                  style={{ position: "relative", left: "15px" }}
                >
                  <AddCircleOutlined className={classes.Icon} />
                  <span className={classes.labelHeader}>Add EMI</span>
                </IconButton>
                <Divider className="style.border " style={{ height: "2px" }} />
                <br />
                <span
                  style={{ "margin-left": "10px", "font-weight": "bolder" }}
                >
                  Tasks
                </span>
                <br />
                <br />
                {this.createTaskUI()}
                <IconButton
                  style={{ position: "relative", left: "15px" }}
                  aria-label="add"
                  onClick={this.addTaskClick.bind(this)}
                >
                  <AddCircleOutlined className={classes.Icon} />
                  <span className={classes.labelHeader}>Add Task</span>
                </IconButton>
              </CardContent>
              <CardActions style={{ padding: "15px" }}>
                <Button type="submit">Save</Button>
                <Button
                  color="secondary"
                  clicked={this.cancelForm}
                  component={Link}
                  to="/loanpurposes"
                >
                  cancel
                </Button>
              </CardActions>
            </form>
          </Card>
        ) : (
          <Spinner />
        )}
      </Layout>
    );
  }
}
export default withStyles(useStyles)(LoanpurposePage);
