import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import axios from "axios";
import auth from "../../components/Auth/Auth";
import Button from "../../components/UI/Button/Button";
import Autocomplete from "../../components/Autocomplete/Autocomplete.js";
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
import { ADD_SHG_BREADCRUMBS, EDIT_SHG_BREADCRUMBS } from "./config";
import { Link } from "react-router-dom";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Aux from "../../hoc/Auxiliary/Auxiliary.js";

class ShgPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      bankValues: {},
      addShg: "",
      addVillage: [],
      getState: [],
      checkedB: false,
      getDistrict: [],
      getVillage: [],
      getVillageOrganization: [],
      validations: {
        addShg: {
          required: { value: "true", message: "Shg name field required" },
        },
        addVillage: {
          required: { value: "true", message: "Village field required" },
        },
        addVo: {
          required: {
            value: "true",
            message: "Village Organization field required",
          },
        },
      },
      errors: {
        addVillage: [],
        addVo: [],
      },
      bankErrors: {},
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
      await axios
        .get(
          process.env.REACT_APP_SERVER_URL +
            JSON.parse(process.env.REACT_APP_CONTACT_TYPE)["Organization"][0] +
            "s?sub_type=SHG&id=" +
            this.state.editPage[1],
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + "",
            },
          }
        )
        .then((res) => {
          console.log("results", res.data[0].contact.name);
          this.setState({
            values: {
              addShg: res.data[0].contact.name,
              addAddress: res.data[0].contact.address_1,
              addPointOfContact: res.data[0].person_incharge,
              addVillage: res.data[0].contact.villages,
              addVo: res.data[0].vo.id,
            },
          });
          if (res.data[0].bankdetail !== null) {
            this.setState({
              bankValues: {
                id: res.data[0].bankdetail.id,
                addAccountName: res.data[0].bankdetail.account_name,
                addBankName: res.data[0].bankdetail.bank_name,
                addAccountNo: res.data[0].bankdetail.account_no,
                addIfsc: res.data[0].bankdetail.ifsc_code,
                addBranch: res.data[0].bankdetail.branch,
              },
            });
          } else {
            this.setState({
              checkedB: false,
            });
          }

          stateId = res.data[0].state.id;
        })
        .catch((error) => {
          console.log(error);
        });
    }

    await axios
      .get(process.env.REACT_APP_SERVER_URL + "village-organizations/", {
        headers: {
          Authorization: "Bearer " + auth.getToken() + "",
        },
      })
      .then((res) => {
        this.setState({ getVillageOrganization: res.data });
      })
      .catch((error) => {
        console.log(error);
      });

    //api call for village filter
    await axios
      .get(process.env.REACT_APP_SERVER_URL + "villages/", {
        headers: {
          Authorization: "Bearer " + auth.getToken() + "",
        },
      })
      .then((res) => {
        console.log("villagedata", res.data);
        this.setState({ getVillage: res.data });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleChange = ({ target }) => {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value },
      bankValues: { ...this.state.bankValues, [target.name]: target.value },
    });
  };

  handleVillageChange(event, value) {
    let villageValue = [];
    let villageIds;
    console.log("villageValue", villageValue);
    for (let i in value) {
      villageIds = map(villageValue, (village, key) => {
        return village.id;
      });
      if (villageIds.indexOf(value[i].id) <= -1) villageValue.push(value[i]);
    }
    if (value !== null) {
      console.log("villageValue--", villageValue);
      this.setState({
        values: { ...this.state.values, addVillage: villageValue },
      });
    } else {
      this.setState({
        addVillage: [],
      });
    }
  }

  handleVoChange(event, value) {
    if (value !== null) {
      this.setState({
        values: { ...this.state.values, addVo: value.id },
      });
    } else {
      this.setState({
        values: {
          ...this.state.values,
          addVo: "",
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

  bankValidate = () => {
    if (this.state.checkedB) {
      const bankValues = this.state.bankValues;
      const validations = this.state.validations;
      map(validations, (validation, key) => {
        let value = bankValues[key] ? bankValues[key] : "";
        const bankErrors = validateInput(value, validation);
        let errorset = this.state.bankErrors;
        if (bankErrors.length > 0) errorset[key] = bankErrors;
        else delete errorset[key];
        this.setState({ bankErrors: errorset });
      });
    }
  };

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
      bankValues: {
        id: this.state.bankValues.id,
        addAccountName: "",
        addAccountNo: "",
        addBankName: "",
        addBranch: "",
        addIfsc: "",
      },
    });
    this.setState({ hasBankError: "" });
    let allValidations;
    let allErrors;
    if (event.target.checked) {
      let validations = {
        addAccountName: {
          required: {
            value: "true",
            message: "Bank Account Name field required",
          },
        },
        addAccountNo: {
          required: { value: "true", message: "Account Number field required" },
        },
        addBankName: {
          required: { value: "true", message: "Bank Name field required" },
        },
        addBranch: {
          required: { value: "true", message: "Branch field required" },
        },
        addIfsc: {
          required: { value: "true", message: "IFSC field required" },
        },
      };

      let errors = {
        addAccountName: [],
        addAccountNo: [],
        addBankName: [],
        addBranch: [],
        addIfsc: [],
      };

      allValidations = { ...this.state.values.addVillage, ...validations };
      allErrors = { ...this.state.values.errors, ...errors };
    } else {
      allValidations = { ...this.state.values.addVillage };
      allErrors = { ...this.state.values.errors };
      delete allValidations["addAccountName"];
      delete allValidations["addAccountNo"];
      delete allValidations["addBankName"];
      delete allValidations["addBranch"];
      delete allValidations["addIfsc"];
      delete allErrors["addAccountName"];
      delete allErrors["addAccountNo"];
      delete allErrors["addBankName"];
      delete allErrors["addBranch"];
      delete allErrors["addIfsc"];
    }
    this.setState({ validations: allValidations });
    this.setState({ errors: allErrors });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.validate();
    console.log("errors", this.state.errors);
    if (this.state.checkedB) {
      this.bankValidate();
    }
    this.setState({ formSubmitted: "" });
    // if (Object.keys(this.state.errors).length > 0) return;
    let shgName = this.state.values.addShg;
    let shgAddress = this.state.values.addAddress;
    let shgPersonInCharge = this.state.values.addPointOfContact;
    let shgVillage = this.state.values.addVillage;
    let shgVo = this.state.values.addVo;

    if (Object.keys(this.state.errors).length > 0) return;
    if (this.state.editPage[0]) {
      // let bankIds = "";
      await axios
        .put(
          process.env.REACT_APP_SERVER_URL +
            "organizations/" +
            this.state.editPage[1],
          {
            name: shgName,
            sub_type: "SHG",
            address_1: shgAddress,
            person_incharge: shgPersonInCharge,
            contact_type: JSON.parse(process.env.REACT_APP_CONTACT_TYPE)[
              "Organization"
            ][0],
            villages: shgVillage,
            vo: shgVo,
            account_name: this.state.values.addAccountName,
            account_no: this.state.values.addAccountNo,
            bank_name: this.state.values.addBankName,
            branch: this.state.values.addBranch,
            ifsc_code: this.state.values.addIfsc,
            hasBankDetails: this.state.checkedB,
          },
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + "",
            },
          }
        )
        .then((res) => {
          this.setState({ formSubmitted: true });

          // bankIds = res.data.id;
          console.log("data added", res);
          //api call for edited values in bank
          // if (this.state.checkedB)
          //   this.handleBankDetails(
          //     process.env.REACT_APP_SERVER_URL +
          //       "bank-details?shg=" +
          //       res.data.id,
          //     res.data.id
          //   );
          // else
          //   this.deleteBankDetails(
          //     process.env.REACT_APP_SERVER_URL +
          //       "bank-details/" +
          //       this.state.bankValues.id
          //   );

          this.props.history.push({ pathname: "/shgs", editData: true });
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      await axios
        .post(
          process.env.REACT_APP_SERVER_URL + "organizations/",
          {
            name: shgName,
            sub_type: "SHG",
            address_1: shgAddress,
            person_incharge: shgPersonInCharge,

            contact_type: JSON.parse(process.env.REACT_APP_CONTACT_TYPE)[
              "Organization"
            ][0],
            villages: shgVillage,
            vo: shgVo,

            account_name: this.state.values.addAccountName,
            account_no: this.state.values.addAccountNo,
            bank_name: this.state.values.addBankName,
            branch: this.state.values.addBranch,
            ifsc_code: this.state.values.addIfsc,
          },
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + "",
            },
          }
        )
        .then((res) => {
          console.log("add shg", res);
          this.setState({ formSubmitted: true });
          let bankId = res.data.id;
          this.setState({ bankDeatilsId: bankId });
          // if (this.state.checkedB)
          //   this.handleBankDetails(
          //     process.env.REACT_APP_SERVER_URL + "bank-details",
          //     res.data.id
          //   );
          this.props.history.push({ pathname: "/shgs", addData: true });
        })
        .catch((error) => {
          console.log("Error  ", error);
        });
    }
  };

  handleBankDetails = async (url, shgId) => {
    await axios
      .post(
        url,

        {
          account_name: this.state.values.addAccountName,
          account_no: this.state.values.addAccountNo,
          bank_name: this.state.values.addBankName,
          branch: this.state.values.addBranch,
          ifsc_code: this.state.values.addIfsc,
          shg: shgId,
        },
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + "",
          },
        }
      )
      .then((res) => {
        this.setState({ formSubmitted: true });

        this.props.history.push({ pathname: "/Shgs", addData: true });
      })
      .catch((error) => {
        this.setState({ formSubmitted: false });
        console.log(error);
      });
  };

  deleteBankDetails = async (url) => {
    await axios
      .delete(url, {
        headers: {
          Authorization: "Bearer " + auth.getToken() + "",
        },
      })
      .then((res) => {
        this.setState({ formSubmitted: true });

        this.props.history.push({ pathname: "/Shgs", addData: true });
      })
      .catch((error) => {
        this.setState({ formSubmitted: false });
        console.log(error);
      });
  };

  cancelForm = () => {
    this.setState({
      values: {},
      formSubmitted: "",
      stateSelected: false,
    });
  };

  render() {
    let statesFilter = this.state.getState;
    let voFilters = this.state.getVillageOrganization;
    let addVo = this.state.values.addVo;
    let villagesFilter = this.state.getVillage;
    console.log("villagesFilter==", villagesFilter);
    let addVillage = this.state.values.addVillage;
    const addVillageConst = addVillage
      ? this.state.isCancel === true
        ? []
        : addVillage
      : [];
    let isCancel = this.state.isCancel;
    let checked = this.state.checkedB;
    console.log("addVillage", addVillage);
    let addVillages = [];
    map(addVillage, (village, key) => {
      console.log("village===", village);
      addVillages.push(
        villagesFilter.findIndex(function (item, i) {
          return item.id === village;
        })
      );
    });

    console.log("addVillages", addVillages);

    let vtest =
      villagesFilter[
        villagesFilter.findIndex(function (item, i) {
          return item.id === 12;
        })
      ];

    console.log("vtest", vtest);

    return (
      <Layout
        breadcrumbs={
          this.state.editPage[0] ? EDIT_SHG_BREADCRUMBS : ADD_SHG_BREADCRUMBS
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
              title={this.state.editPage[0] ? "Edit shg" : "Add shg"}
              subheader={
                this.state.editPage[0]
                  ? "You can edit shg data here!"
                  : "You can add new shg data here!"
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={12} xs={12}>
                  {this.state.formSubmitted === true ? (
                    <Snackbar severity="success">
                      Shg added successfully.
                    </Snackbar>
                  ) : null}
                  {this.state.formSubmitted === false ? (
                    <Snackbar severity="error" Showbutton={false}>
                      Network Error - Please try again!
                    </Snackbar>
                  ) : null}
                </Grid>
                <Grid item md={12} xs={12}>
                  <Input
                    fullWidth
                    label="Shg Name"
                    name="addShg"
                    error={this.hasError("addShg")}
                    helperText={
                      this.hasError("addShg")
                        ? this.state.errors.addShg[0]
                        : null
                    }
                    value={this.state.values.addShg || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Autocomplete
                    id="combo-box-demo"
                    options={villagesFilter}
                    multiple={true}
                    variant="outlined"
                    label="Select Village"
                    // name="addVillage"
                    getOptionLabel={(option) => (option ? option.name : "")}
                    onChange={(event, value) => {
                      this.handleVillageChange(event, value);
                    }}
                    defaultValue={[]}
                    value={
                      addVillage
                        ? this.state.isCancel === true
                          ? []
                          : addVillage
                        : []
                    }
                    error={this.hasError("addVillage")}
                    renderInput={(params) => (
                      <Input
                        {...params}
                        fullWidth
                        label="Select Village"
                        name="addVillage"
                        variant="outlined"
                        helperText={
                          this.hasError("addVillage")
                            ? this.state.errors.addVillage[0]
                            : null
                        }
                      />
                    )}
                  />
                </Grid>
                <Grid item md={12} xs={12}>
                  <Input
                    fullWidth
                    label="Address"
                    name="addAddress"
                    error={this.hasError("addAddress")}
                    helperText={
                      this.hasError("addAddress")
                        ? this.state.errors.addAddress[0]
                        : null
                    }
                    value={this.state.values.addAddress || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Point Of Contact"
                    name="addPointOfContact"
                    error={this.hasError("addPointOfContact")}
                    helperText={
                      this.hasError("addPointOfContact")
                        ? this.state.errors.addPointOfContact[0]
                        : null
                    }
                    value={this.state.values.addPointOfContact || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Autotext
                    id="combo-box-demo"
                    options={voFilters}
                    variant="outlined"
                    label="Select VO"
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => {
                      this.handleVoChange(event, value);
                    }}
                    value={
                      addVo
                        ? this.state.isCancel === true
                          ? null
                          : voFilters[
                              voFilters.findIndex(function (item, i) {
                                return item.id === addVo;
                              })
                            ] || null
                        : null
                    }
                    error={this.hasError("addVo")}
                    helperText={
                      this.hasError("addVo") ? this.state.errors.addVo[0] : null
                    }
                    renderInput={(params) => (
                      <Input
                        fullWidth
                        label="Select VO"
                        name="addVo"
                        variant="outlined"
                      />
                    )}
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
                      label="Add Bank details"
                    />
                  </FormGroup>
                </Grid>
                {this.state.checkedB ? (
                  <Aux>
                    <Grid item md={6} xs={12}>
                      <Input
                        fullWidth
                        label="Bank Account Name"
                        disabled={checked ? false : true}
                        name="addAccountName"
                        error={this.hasBankError("addAccountName")}
                        helperText={
                          this.hasBankError("addAccountName")
                            ? this.state.bankErrors.addAccountName[0]
                            : null
                        }
                        value={this.state.bankValues.addAccountName || ""}
                        onChange={this.handleChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <Input
                        fullWidth
                        label="Account Number"
                        name="addAccountNo"
                        disabled={checked ? false : true}
                        error={this.hasBankError("addAccountNo")}
                        helperText={
                          this.hasBankError("addAccountNo")
                            ? this.state.bankErrors.addAccountNo[0]
                            : null
                        }
                        value={this.state.bankValues.addAccountNo || ""}
                        onChange={this.handleChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <Input
                        fullWidth
                        disabled={checked ? false : true}
                        label="Bank Name"
                        name="addBankName"
                        error={this.hasBankError("addBankName")}
                        helperText={
                          this.hasBankError("addBankName")
                            ? this.state.bankErrors.addBankName[0]
                            : null
                        }
                        value={this.state.bankValues.addBankName || ""}
                        onChange={this.handleChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <Input
                        fullWidth
                        label="Branch"
                        disabled={checked ? false : true}
                        name="addBranch"
                        error={this.hasBankError("addBranch")}
                        helperText={
                          this.hasBankError("addBranch")
                            ? this.state.bankErrors.addBranch[0]
                            : null
                        }
                        value={this.state.bankValues.addBranch || ""}
                        onChange={this.handleChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <Input
                        fullWidth
                        label="IFSC Code"
                        name="addIfsc"
                        disabled={checked ? false : true}
                        error={this.hasBankError("addIfsc")}
                        helperText={
                          this.hasBankError("addIfsc")
                            ? this.state.bankErrors.addIfsc[0]
                            : null
                        }
                        value={this.state.bankValues.addIfsc || ""}
                        onChange={this.handleChange}
                        variant="outlined"
                      />
                    </Grid>
                  </Aux>
                ) : (
                  ""
                )}
              </Grid>
            </CardContent>
            <Divider />
            <CardActions>
              <Button type="submit">Save</Button>
              <Button
                color="default"
                clicked={this.cancelForm}
                component={Link}
                to="/shgs"
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
export default ShgPage;
