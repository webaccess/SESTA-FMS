import React, { Component, useState } from "react";
import Layout from "../../hoc/Layout/Layout";
import * as serviceProvider from "../../api/Axios";
import axios from "axios";
import auth from "../../components/Auth/Auth";
import { withStyles } from "@material-ui/core/styles";
import style from "./Loanpurpose.module.css";
import IconButton from "@material-ui/core/IconButton";
import {
  AddCircleOutlined,
  RemoveCircleOutlined,
  ContactPhoneOutlined,
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
import Aux from "../../hoc/Auxiliary/Auxiliary.js";

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
      //task: "",
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
    };
  }

  async componentDidMount() {
    if (this.state.editPage[0]) {
      let stateId = "";
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
          });

          if (res.data.emidetails) {
            let getEmi = res.data.emidetails;
            this.state.users = getEmi.map((obj) => {
              return obj;
            });
          }

          if (res.data.loantasks) {
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
  }

  addClick() {
    this.setState((prevState) => ({
      users: [...prevState.users, { principal: "", interest: "" }],
    }));
  }

  addTaskClick() {
    this.setState((prevState) => ({
      task: [...prevState.task, { name: "" }],
    }));
  }

  createUI() {
    const { classes } = this.props;
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

  createTaskUI() {
    const { classes } = this.props;
    let actTypeFilter = this.state.actTypeFilter;

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
                //style={{
                //width: "48%",
                //  position: "relative",
                //  left: "30px",
                //  bottom: "25px",
                //}}
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

  handleUIChange(i, e) {
    const { name, value } = e.target;
    let users = [...this.state.users];
    users[i] = { ...users[i], [name]: value };
    this.setState({ users });
  }

  removeClick(i, e) {
    let users = [...this.state.users];
    users.splice(i, 1);
    this.setState({ users });
    console.log("this.state.users---", this.state.users);
  }

  handleTaskUIChange(event) {
    let taskData = this.state.task;
    let i;

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
    if (data.emidetails.length > 0) {
      for (let i in this.state.users) {
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
    } else {
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
    if (data.loantasks.length > 0) {
      for (let i in this.state.task) {
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
    } else {
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
    let addFPO = this.state.values.addFPO;
    let loanEmi = this.state.values.addEMI;
    let postLoan = {
      product_name: productName,
      duration: addDuration,
      specification: addSpecification,
      loan_amount: addAmount,
      fpo: addFPO,
      emi: loanEmi,
    };
    //if (Object.keys(this.state.errors).length > 0) return;q
    if (this.state.editPage[0]) {
      // let bankIds = "";
      serviceProvider
        .serviceProviderForPutRequest(
          process.env.REACT_APP_SERVER_URL + "loan-models",
          this.state.editPage[1],
          postLoan
        )
        .then((res) => {
          console.log(
            "---this.state.users.length in update",
            this.state.users.length
          );
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
          {
            product_name: productName,
            duration: addDuration,
            specification: addSpecification,
            loan_amount: addAmount,
            fpo: addFPO,
            emi: loanEmi,
          }
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
        <Card>
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
              <span style={{ "margin-left": "10px", "font-weight": "bolder" }}>
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
              <span style={{ "margin-left": "10px", "font-weight": "bolder" }}>
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
            <CardActions>
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
      </Layout>
    );
  }
}
export default withStyles(useStyles)(LoanpurposePage);
