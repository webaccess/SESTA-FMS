import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import axios from "axios";
import auth from "../../components/Auth/Auth";
import Button from "../../components/UI/Button/Button";
import Autotext from "../../components/Autotext/Autotext.js";
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
import { Link } from "react-router-dom";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Aux from "../../hoc/Auxiliary/Auxiliary.js";

class LoanpurposePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      emidetails: {},
      loantasks: {},
      addPurpose: "",
      addDuration: [],
      getState: [],
      checkedB: false,
      checkedTasks: false,
      getDistrict: [],
      getVillage: [],
      getFPO: [],
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
        // addFPO: {
        //   required: {
        //     value: "true",
        //     message: "FPO field is required",
        //   },
        // },
        addEMI: {
          required: {
            value: "true",
            message: "EMI field is required",
          },
        },
        // addTask: {
        //   required: {
        //     value: "true",
        //     message: "EMI field is required",
        //   },
        // },
      },
      errors: {
        addVillage: [],
        addFPO: [],
        firstName: [],
      },
      bankErrors: {},
      taskErrors: {},
      serverErrors: {},
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
      this.setState({ checkedB: true });
      this.setState({ checkedTasks: true });
      await axios
        .get(
          process.env.REACT_APP_SERVER_URL +
            "loanmodels/" +
            this.state.editPage[1],
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + "",
            },
          }
        )
        .then((res) => {
          console.log("---result---", res);
          console.log("results", res.data.product_name);

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
            this.setState({
              emidetails: {
                id: res.data.emidetails.id,
                addPrincipal: res.data.emidetails[0].principal,
                addInterest: res.data.emidetails[0].interest,
              },
            });
          } else {
            this.setState({
              checkedB: false,
              checkedTasks: false,
            });
          }
          console.log("----loan tasks---", res.data.loantasks[0].name);
          if (res.data.loantasks) {
            this.setState({
              loantasks: {
                addTask: res.data.loantasks[0].name,
              },
            });
          } else {
            this.setState({
              checkedB: false,
              checkedTasks: false,
            });
          }

          stateId = res.data[0].state.id;
        })
        .catch((error) => {
          console.log(error);
        });
    }

    await axios
      .get(process.env.REACT_APP_SERVER_URL + "loanmodels/", {
        headers: {
          Authorization: "Bearer " + auth.getToken() + "",
        },
      })
      .then((res) => {
        console.log("---result---", res);
      });

    await axios
      .get(
        process.env.REACT_APP_SERVER_URL +
          JSON.parse(process.env.REACT_APP_CONTACT_TYPE)["Organization"][0] +
          "s?sub_type=FPO&_sort=name:ASC",
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + "",
          },
        }
      )
      .then((res) => {
        this.setState({ getFPO: res.data });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleChange = ({ target }) => {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value },
      emidetails: { ...this.state.emidetails, [target.name]: target.value },
      loantasks: { ...this.state.loantasks, [target.name]: target.value },
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

  // bankValidate = () => {
  //   if (this.state.checkedB) {
  //     const emidetails = this.state.emidetails;
  //     const validations = this.state.validations;
  //     map(validations, (validation, key) => {
  //       let value = emidetails[key] ? emidetails[key] : "";
  //       const bankErrors = validateInput(value, validation);
  //       let errorset = this.state.bankErrors;
  //       if (bankErrors.length > 0) errorset[key] = bankErrors;
  //       else delete errorset[key];
  //       this.setState({ bankErrors: errorset });
  //     });
  //   }
  // };

  hasError = (field) => {
    if (this.state.errors[field] !== undefined) {
      console.log("errors length", Object.keys(this.state.errors).length);
      return Object.keys(this.state.errors).length > 0 &&
        this.state.errors[field].length > 0
        ? true
        : false;
    }
  };

  hasBankError = (field) => {
    if (this.state.checkedB) {
      if (this.state.bankErrors[field] !== undefined) {
        console.log(
          "bankerr length",
          Object.keys(this.state.bankErrors).length
        );
        return Object.keys(this.state.bankErrors).length > 0 &&
          this.state.bankErrors[field].length > 0
          ? true
          : false;
      }
    }
  };

  handleCheckBox = (event) => {
    this.setState({ ...this.state, [event.target.name]: event.target.checked });
    this.setState({
      emidetails: {
        id: this.state.emidetails.id,
        addPrincipal: "",
        addInterest: "",
      },
    });
    this.setState({ hasBankError: "" });
    let allValidations;
    let allErrors;
    if (event.target.checked) {
      let validations = {
        addPrincipal: {
          required: {
            value: "true",
            message: "Bank Account Name field required",
          },
        },
        addInterest: {
          required: { value: "true", message: "Account Number field required" },
        },
      };

      let errors = {
        addPrincipal: [],
        addInterest: [],
      };

      allValidations = { ...this.state.values.addVillage, ...validations };
      allErrors = { ...this.state.values.errors, ...errors };
    } else {
      allValidations = { ...this.state.values.addVillage };
      allErrors = { ...this.state.values.errors };
      delete allValidations["addPrincipal"];
      delete allValidations["addInterest"];
      delete allErrors["addPrincipal"];
      delete allErrors["addInterest"];
    }
    this.setState({ validations: allValidations });
    this.setState({ errors: allErrors });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.validate();
    this.setState({ formSubmitted: "" });
    console.log("errors", this.state.errors);
    // if (this.state.checkedB) {
    //   this.bankValidate();
    // }
    // if (Object.keys(this.state.errors).length > 0) return;
    let productName = this.state.values.addPurpose;
    let addDuration = this.state.values.addDuration;
    let addSpecification = this.state.values.addSpecification;
    let addAmount = this.state.values.addAmount;
    let addFPO = this.state.values.addFPO;
    let loanEmi = this.state.values.addEMI;
    console.log("addFPO----", addFPO, loanEmi);
    if (Object.keys(this.state.errors).length > 0) return;
    if (this.state.editPage[0]) {
      console.log("editPage[0]--");
      // let bankIds = "";
      await axios
        .put(
          process.env.REACT_APP_SERVER_URL +
            "loanmodels/" +
            this.state.editPage[1],
          {
            product_name: productName,
            duration: addDuration,
            specification: addSpecification,
            loan_amount: addAmount,
            fpo: addFPO,
            emi: loanEmi,
          },
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + "",
            },
          }
        )
        .then((res) => {
          this.saveEmiDetails(
            process.env.REACT_APP_SERVER_URL + "emidetails",
            res.data.id
          );
          this.saveTaskDetails("url", res.data.id);
          this.setState({ formSubmitted: true });

          // bankIds = res.data.id;
          console.log("data added", res);
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
      console.log("--else part");
      await axios
        .post(
          process.env.REACT_APP_SERVER_URL + "loanmodels/",
          {
            product_name: productName,
            duration: addDuration,
            specification: addSpecification,
            loan_amount: addAmount,
            fpo: addFPO,
            emi: loanEmi,
          },
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + "",
            },
          }
        )
        .then((res) => {
          console.log("add ", res);
          let bankId = res.data.id;
          this.setState({ bankDeatilsId: bankId });
          // if (this.state.checkedB)
          this.saveEmiDetails(
            process.env.REACT_APP_SERVER_URL + "emidetails",
            res.data.id
          );
          this.saveTaskDetails("url", res.data.id);
          this.props.history.push({ pathname: "/loanpurposes", addData: true });
          this.setState({ formSubmitted: true });
        })
        .catch((error) => {
          this.setState({ formSubmitted: false });
          console.log("Error  ", error);
        });
    }
  };

  saveEmiDetails = async (data, Id) => {
    let saveData = {
      principal: this.state.values.addPrincipal,
      interest: this.state.values.addInterest,
      loan_model: Id,
    };
    if (data.emidetails) {
      await axios
        .put(process.env.REACT_APP_SERVER_URL + "emidetails/", saveData, {
          headers: {
            Authorization: "Bearer " + auth.getToken() + "",
          },
        })
        .then((res) => {})
        .catch((error) => {
          console.log(error);
        });
    } else {
      await axios
        .post(process.env.REACT_APP_SERVER_URL + "emidetails/", saveData, {
          headers: {
            Authorization: "Bearer " + auth.getToken() + "",
          },
        })
        .then((res) => {})
        .catch((error) => {
          console.log(error);
        });
    }
  };

  saveTaskDetails = async (url, Id) => {
    let TaskName = this.state.values.addTask;
    await axios
      .post(
        process.env.REACT_APP_SERVER_URL + "loantasks/",
        {
          name: TaskName,
          loan_model: Id,
        },
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + "",
          },
        }
      )
      .then((res) => {})
      .catch((error) => {
        console.log(error);
      });
  };

  // deleteemidetails = async (url) => {
  //   await axios
  //     .delete(url, {
  //       headers: {
  //         Authorization: "Bearer " + auth.getToken() + "",
  //       },
  //     })
  //     .then((res) => {
  //       this.setState({ formSubmitted: true });

  //       this.props.history.push({ pathname: "/loanpurposes", addData: true });
  //     })
  //     .catch((error) => {
  //       this.setState({ formSubmitted: false });
  //       console.log(error);
  //     });
  // };

  cancelForm = () => {
    this.setState({
      values: {},
      formSubmitted: "",
    });
  };

  render() {
    let fpoFilters = this.state.getFPO;
    let addFPO = this.state.values.addFPO;
    let isCancel = this.state.isCancel;
    let checked = this.state.checkedB;
    let checkedTasks = this.state.checkedTasks;

    return (
      <Layout
      // breadcrumbs={
      // //   this.state.editPage[0] ? EDIT__BREADCRUMBS : ADD_BREADCRUMBS
      // // }
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
                    label="Purpose*"
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

                <Grid item md={12} xs={12}>
                  <FormGroup row>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={this.state.checkedB}
                          onChange={this.handleCheckBox}
                          name="checkedB"
                          color="primary"
                        />
                      }
                      label="EMI Installments"
                    />
                  </FormGroup>
                </Grid>

                {this.state.checkedB ? (
                  <Aux>
                    <Grid item md={6} xs={12}>
                      <Input
                        fullWidth
                        label="Principal"
                        type="number"
                        name="addPrincipal"
                        // disabled={checked ? false : true}
                        error={this.hasBankError("addPrincipal")}
                        helperText={
                          this.hasBankError("addPrincipal")
                            ? this.state.bankErrors.addPrincipal[0]
                            : null
                        }
                        value={this.state.emidetails.addPrincipal || ""}
                        onChange={this.handleChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <Input
                        fullWidth
                        label="Interest"
                        type="number"
                        name="addInterest"
                        // disabled={checked ? false : true}
                        error={this.hasBankError("addInterest")}
                        helperText={
                          this.hasBankError("addInterest")
                            ? this.state.bankErrors.addInterest[0]
                            : null
                        }
                        value={this.state.emidetails.addInterest || ""}
                        onChange={this.handleChange}
                        variant="outlined"
                      />
                    </Grid>
                  </Aux>
                ) : (
                  ""
                )}
              </Grid>
              <br />
              <Grid item md={12} xs={12}>
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={this.state.checkedTasks}
                        onChange={this.handleCheckBox}
                        name="checkedTasks"
                        color="primary"
                      />
                    }
                    label="Tasks"
                  />
                </FormGroup>
              </Grid>
              <br />
              {this.state.checkedTasks ? (
                <Aux>
                  <Grid item md={12} xs={12}>
                    <Input
                      fullWidth
                      label="Task"
                      name="addTask"
                      disabled={checkedTasks ? false : true}
                      error={this.hasBankError("addTask")}
                      helperText={
                        this.hasBankError("addTask")
                          ? this.state.taskErrors.addTask[0]
                          : null
                      }
                      value={this.state.loantasks.addTask || ""}
                      onChange={this.handleChange}
                      variant="outlined"
                    />
                  </Grid>
                </Aux>
              ) : (
                ""
              )}
            </CardContent>
            <Divider />
            <CardActions>
              <Button type="submit">Save</Button>
              <Button
                color="default"
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
export default LoanpurposePage;
