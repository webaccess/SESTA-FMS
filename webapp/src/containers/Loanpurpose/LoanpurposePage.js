import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import axios from "axios";
import auth from "../../components/Auth/Auth";
import IconButton from "@material-ui/core/IconButton";
import { AddCircleOutlined, RemoveCircleOutlined } from "@material-ui/icons";
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
      // emId: "",
      // taskId: ""
      details: [],
      addTask: [],
      addPrincipal: [],
      addInterest: [],
      emidetails: [],
      loantasks: {},
      addPurpose: "",
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
        addFPO: {
          // required: {
          //   value: "true",
          //   message: "FPO field is required",
          // },
        },
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
        addPurpose: [],
        addDuration: [],
        addSpecification: [],
        addAmount: [],
        addFPO: [],
        addEMI: [],
        addVillage: [],
        firstName: [],
        addPrincipal: [],
        addInterest: [],
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
            let getEmi = res.data.emidetails;
            for (let i in getEmi) {
              this.setState({
                emidetails: {
                  emId: res.data.emidetails[i].id,
                  addPrincipal: res.data.emidetails[i].principal,
                  addInterest: res.data.emidetails[i].interest,
                },
              });
            }
          } else {
            this.setState({
              checkedB: false,
              checkedTasks: false,
            });
          }
          console.log("----loan tasks---", res.data.loantasks[0].name);
          if (res.data.loantasks) {
            let getTasks = res.data.loantasks;
            for (let i in getTasks) {
              this.setState({
                loantasks: {
                  taskId: res.data.loantasks[i].id,
                  addTask: res.data.loantasks[i].name,
                },
              });
              console.log(
                "----values---",
                this.state.values,
                "emidetails---",
                this.state.emidetails,
                "---loantasks---",
                this.state.loantasks
              );
            }
          } else {
            this.setState({
              checkedB: false,
              checkedTasks: false,
            });
          }
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
  handleEMIChange(i, event) {
    let addPrincipal = [...this.state.addPrincipal];
    addPrincipal[i] = event.target.value;
    console.log("---value--", event.target.value);
    this.setState({ addPrincipal });
    console.log("----addPrincipal--", addPrincipal);
  }
  handleInterestChange(i, event) {
    let addInterest = [...this.state.addInterest];
    addInterest[i] = event.target.value;
    console.log("---value--", event.target.value);
    this.setState({ addInterest });
  }
  handleDetailChange(i, event) {
    // if (this.state.addPrincipal) {
    let details = [...this.state.details];
    details[i] = event.target.value;
    this.setState({ details });
    console.log("addTask---", details);
    // }
  }
  addClick(event) {
    this.setState((prevState) => ({ details: [...prevState.details, ""] }));
    // this.setState({
    // details: { ...this.state.details, [target.name]: target.value },
    // });
  }
  addEmiClick() {
    this.setState((prevState) => ({
      addPrincipal: [...prevState.addPrincipal, ""],
      addInterest: [...prevState.addInterest, ""],
    }));
  }
  removeClick(i) {
    let details = [...this.state.details];
    details.splice(i, 1);
    this.setState({ details });
  }
  removeEmiClick(i) {
    let addPrincipal = [...this.state.addPrincipal];
    addPrincipal.splice(i, 1);
    this.setState({ addPrincipal });
    let addInterest = [...this.state.addInterest];
    addInterest.splice(i, 1);
    this.setState({ addInterest });
  }

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
        // addPrincipal: "",
        // addInterest: "",
      },
    });
    this.setState({ hasBankError: "" });
    let allValidations;
    let allErrors;
    if (event.target.checked) {
      let validations = {
        addPrincipal: {
          // required: {
          //   value: "true",
          //   message: "Bank Account Name field required",
          // },
        },
        // addInterest: {
        //   required: { value: "true", message: "Account Number field required" },
        // },
      };

      let errors = {};

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
    if (this.state.checkedB) {
      // this.bankValidate();
    }
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
          this.saveEmiDetails(res.data, res.data.id);
          if (this.state.checkedTasks) {
            this.saveTaskDetails(res.data, res.data.id);
          }
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
          if (this.state.checkedB) {
            this.saveEmiDetails(res.data, res.data.id);
          }
          if (this.state.checkedTasks) {
            this.saveTaskDetails(res.data, res.data.id);
          }
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
    let emiDet = this.state.emidetails;
    console.log("emiDet---", emiDet, data);
    for (let i in emiDet) {
      console.log("i in this.state.emiDet----", i, emiDet);
    }
    let addPrincipal = this.state.addPrincipal;
    for (let i in addPrincipal) {
      console.log("i in this.state.addPrincipal----", i, addPrincipal);
    }
    if (data.emidetails.addPrincipal) {
      if (this.state.checkedB) {
        for (let i in addPrincipal) {
          console.log(
            "i in this.state.addPrincipal inside----",
            addPrincipal[i],
            this.state.addInterest[i]
          );
          await axios
            .put(
              process.env.REACT_APP_SERVER_URL + "emidetails/",
              {
                principal: this.state.addPrincipal[i],
                interest: this.state.addInterest[i],
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
        }
      } else {
        if (this.state.emidetails.emId) {
          axios
            .delete(
              process.env.REACT_APP_SERVER_URL +
                "emidetails/" +
                this.state.emidetails.emId,
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
        }
      }
    } else {
      for (let i in addPrincipal) {
        console.log(
          "i in this.state.addPrincipal inside----",
          this.state.addPrincipal[i],
          this.state.addInterest[i]
        );
        await axios
          .post(
            process.env.REACT_APP_SERVER_URL + "emidetails/",
            {
              principal: this.state.addPrincipal[i],
              interest: this.state.addInterest[i],
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
      }
    }
  };

  saveTaskDetails = async (data, Id) => {
    let TaskName = this.state.addTask;

    if (data.loantasks) {
      if (this.state.checkedTasks) {
        for (let i in TaskName) {
          await axios
            .put(
              process.env.REACT_APP_SERVER_URL + "loantasks/",
              {
                name: TaskName[i],
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
        }
      } else {
        if (this.state.loantasks.taskId) {
          axios
            .delete(
              process.env.REACT_APP_SERVER_URL +
                "loantasks/" +
                this.state.loantasks.taskId,
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
        }
      }
    } else {
      for (let i in TaskName) {
        await axios
          .post(
            process.env.REACT_APP_SERVER_URL + "loantasks/",
            {
              name: TaskName[i],
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
      }
    }
  };

  createUI() {
    let checkedTasks = this.state.checkedTasks;
    return this.state.details.map((el, i) => (
      <div key={i}>
        <Input
          fullWidth
          label="Task"
          name="details"
          disabled={checkedTasks ? false : true}
          error={this.hasBankError("addTask")}
          helperText={
            this.hasBankError("addTask")
              ? this.state.taskErrors.addTask[0]
              : null
          }
          value={el || ""}
          onChange={this.handleDetailChange.bind(this, i)}
          variant="outlined"
        />

        <IconButton aria-label="remove" onClick={this.removeClick.bind(this)}>
          <RemoveCircleOutlined />
          Remove Task
        </IconButton>
      </div>
    ));
  }

  createEmiUI() {
    console.log(
      "----- this.state.emidetails.addPrincipal",
      this.state.emidetails.addPrincipal
    );
    return this.state.addPrincipal.map((el, i) => (
      <div key={i}>
        <Grid item md={6} xs={12}>
          <Input
            fullWidth
            label="Principal"
            type="number"
            name="addPrincipal"
            // disabled={checkedB ? false : true}
            error={this.hasBankError("addPrincipal")}
            helperText={
              this.hasBankError("addPrincipal")
                ? this.state.bankErrors.addPrincipal[0]
                : null
            }
            value={
              this.state.emidetails.addPrincipal
                ? this.state.emidetails.addPrincipal
                : el
            }
            onChange={this.handleEMIChange.bind(this, i)}
            variant="outlined"
          />
        </Grid>
        <IconButton
          aria-label="remove"
          onClick={this.removeEmiClick.bind(this)}
        >
          <RemoveCircleOutlined />
          Remove Task
        </IconButton>
      </div>
    ));
  }

  createInterestUI() {
    return this.state.addInterest.map((el, i) => (
      <div key={i}>
        <Grid item md={6} xs={12}>
          <Input
            fullWidth
            label="Interest"
            type="number"
            name="addInterest"
            // disabled={checkedB ? false : true}
            error={this.hasBankError("addInterest")}
            helperText={
              this.hasBankError("addInterest")
                ? this.state.bankErrors.addInterest[0]
                : null
            }
            value={
              this.state.emidetails.addInterest
                ? this.state.emidetails.addInterest
                : el
            }
            onChange={this.handleInterestChange.bind(this, i)}
            variant="outlined"
          />
        </Grid>
      </div>
    ));
  }
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
    let checkedB = this.state.checkedB;
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
                    {this.createEmiUI()}
                    {this.createInterestUI()}
                    {/* if(this.state.emidetails.addPrincipal){this.addEmiClick()} */}
                    <IconButton
                      aria-label="add"
                      onClick={this.addEmiClick.bind(this)}
                    >
                      <AddCircleOutlined />
                      Add EMI Details
                    </IconButton>
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
                    {this.createUI()}

                    <IconButton
                      aria-label="add"
                      onClick={this.addClick.bind(this)}
                    >
                      <AddCircleOutlined />
                      Add Task
                    </IconButton>
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
