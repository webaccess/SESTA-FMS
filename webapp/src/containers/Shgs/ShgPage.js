import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import * as serviceProvider from "../../api/Axios";
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
      addShg: "",
      isBankDetailsChecked: false,
      getState: [],
      getDistrict: [],
      getVillage: [],
      getVillageOrganization: [],
      bankInfoId: "",
      formSubmitted: "",
      loggedInUserRole: auth.getUserInfo().role.name,
      validations: {
        addShg: {
          required: { value: "true", message: "Shg name is required" },
        },
        addState: {
          required: { value: "true", message: "State is required" },
        },
        addDistrict: {
          required: { value: "true", message: "District is required" },
        },
        addVillage: {
          required: { value: "true", message: "Village is required" },
        },
        addVo: {
          required: {
            value: "true",
            message: "Village Organization is required",
          },
        },
      },
      bankValidations: {
        addAccountName: {
          required: {
            value: "true",
            message: "Bank Account Name is required",
          },
        },
        addAccountNo: {
          required: { value: "true", message: "Account Number is required" },
        },
        addBankName: {
          required: { value: "true", message: "Bank Name is required" },
        },
        addBranch: {
          required: { value: "true", message: "Branch is required" },
        },
        addIfsc: {
          required: { value: "true", message: "IFSC code is required" },
        },
      },
      errors: {},
      editPage: [
        this.props.match.params.id !== undefined ? true : false,
        this.props.match.params.id,
      ],
    };
  }

  async componentDidMount() {
    if (this.state.editPage[0]) {
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/contact/" +
            this.state.editPage[1]
        )
        .then((res) => {
          this.handleStateChange(res.data.addresses[0].state);
          this.handleDistrictChange(res.data.addresses[0].district);
          this.handleVoChange("", res.data.organization.vos[0]);

          this.setState({
            values: {
              addShg: res.data.name,
              addAddress: res.data.addresses[0].address_line_1,
              addPointOfContact: res.data.organization.person_incharge,
              addId: res.data.addresses[0].id,
              addDistrict: res.data.addresses[0].district,
              addState: res.data.addresses[0].state,
              addVillage: res.data.addresses[0].village,
              addVo: res.data.organization.vos[0].id,
            },
          });
          console.log("values", this.state.values);

          // if "add bankdetails" is checked
          if (res.data.organization.bankdetail) {
            this.setState({ bankInfoId: res.data.organization.bankdetail });
            serviceProvider
              .serviceProviderForGetRequest(
                process.env.REACT_APP_SERVER_URL +
                  "bankdetails/" +
                  res.data.organization.bankdetail
              )
              .then((res) => {
                let tempValues = this.state.values;
                tempValues["addAccountName"] = res.data.account_name;
                tempValues["addAccountNo"] = res.data.account_no;
                tempValues["addBankName"] = res.data.bank_name;
                tempValues["addBranch"] = res.data.branch;
                tempValues["addIfsc"] = res.data.ifsc_code;
                this.setState({
                  isBankDetailsChecked: true,
                  values: tempValues,
                });
              })
              .catch((eror) => {});
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }

    // get all states
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/states/?is_active=true"
      )
      .then((res) => {
        this.setState({ getState: res.data });
      })
      .catch((error) => {
        console.log(error);
      });

    if (this.state.values.addState) {
      this.setState({ stateSelected: true });
    }

    // get all VOs
    let url =
      "crm-plugin/contact/?contact_type=organization&&organization.sub_type=VO&&_sort=name:ASC";
    if (
      this.state.loggedInUserRole === "FPO Admin" ||
      this.state.loggedInUserRole === "CSP (Community Service Provider)"
    ) {
      url += "&&creator_id=" + auth.getUserInfo().contact.id;
    }
    serviceProvider
      .serviceProviderForGetRequest(process.env.REACT_APP_SERVER_URL + url)
      .then((res) => {
        this.setState({ getVillageOrganization: res.data });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleChange = ({ target }) => {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value },
    });
  };

  handleStateChange(value) {
    if (value !== null) {
      let newVal = value;
      if (typeof value === "object") {
        newVal = value.id;
      }
      this.setState({
        values: { ...this.state.values, addState: newVal },
      });
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/districts/?is_active=true&&state.id=" +
            newVal
        )
        .then((res) => {
          this.setState({ getDistrict: res.data });
        })
        .catch((error) => {
          console.log(error);
        });
      this.setState({ stateSelected: true });
    } else {
      this.setState({
        values: {
          ...this.state.values,
          addState: "",
          addDistrict: "",
        },
      });
      this.setState({ stateSelected: false });
    }
  }

  handleDistrictChange(value) {
    if (value !== null) {
      let newVal = value;
      if (typeof value === "object") {
        newVal = value.id;
      }
      this.setState({
        values: { ...this.state.values, addDistrict: newVal },
      });
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/villages/?is_active=true&&district.id=" +
            newVal
        )
        .then((res) => {
          this.setState({ getVillage: res.data });
        })
        .catch((error) => {
          console.log(error);
        });
      this.setState({ districtSelected: true });
    } else {
      this.setState({
        values: {
          ...this.state.values,
          addDistrict: "",
          addVillage: "",
        },
      });
      this.setState({ districtSelected: false });
    }
  }

  handleVillageChange(event, value) {
    if (value !== null) {
      let newVal = value;
      console.log("value--", value);
      if (typeof value === "object") {
        newVal = value.id;
      }
      console.log("newVal", newVal);
      this.setState({
        values: { ...this.state.values, addVillage: newVal },
      });
    } else {
      this.setState({
        values: {
          ...this.state.values,
          addVillage: "",
        },
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
    const bankValidations = this.state.bankValidations;
    const allValiations = validations;
    if (this.state.isBankDetailsChecked) {
      Object.assign(allValiations, bankValidations);
    } else {
      delete allValiations["addAccountName"];
      delete allValiations["addAccountNo"];
      delete allValiations["addBankName"];
      delete allValiations["addBranch"];
      delete allValiations["addIfsc"];
    }

    map(allValiations, (validation, key) => {
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

  handleCheckBox = (event) => {
    this.setState({
      isBankDetailsChecked: !this.state.isBankDetailsChecked,
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.validate();
    this.setState({ formSubmitted: "" });
    if (Object.keys(this.state.errors).length > 0) return;
    let shgName = this.state.values.addShg;
    let addressId = this.state.values.addId;
    let shgAddress = this.state.values.addAddress;
    let shgPersonInCharge = this.state.values.addPointOfContact;
    let shgVillage = this.state.values.addVillage;
    let shgVo = this.state.values.addVo;
    let stateId = this.state.values.addState;
    let districtId = this.state.values.addDistrict;

    let postAddressData = {
      address_line_1: shgAddress,
      district: {
        id: districtId,
      },
      state: {
        id: stateId,
      },
      village: {
        id: shgVillage,
      },
    };
    console.log("postAddressData", postAddressData);
    let postShgData = {
      name: shgName,
      sub_type: "SHG",
      person_incharge: shgPersonInCharge,
      contact_type: JSON.parse(process.env.REACT_APP_CONTACT_TYPE)[
        "Organization"
      ][0],
      addresses: [postAddressData],
      vos: shgVo,
    };
    if (this.state.editPage[0]) {
      Object.assign(postAddressData, {
        id: addressId,
      });
      // edit SHG data
      serviceProvider
        .serviceProviderForPutRequest(
          process.env.REACT_APP_SERVER_URL + "crm-plugin/contact",
          this.state.editPage[1],
          postShgData
        )
        .then((res) => {
          this.saveBankDetails(res.data);
          this.setState({ formSubmitted: true });
          this.props.history.push({ pathname: "/shgs", editData: true });
        })
        .catch((error) => {
          this.setState({ formSubmitted: false });
          if (error.response !== undefined) {
            this.setState({
              errorCode:
                error.response.data.statusCode +
                " Error- " +
                error.response.data.error +
                " Message- " +
                error.response.data.message +
                " Please try again!",
            });
          } else {
            this.setState({ errorCode: "Network Error - Please try again!" });
          }
        });
    } else {
      // create SHG
      Object.assign(postShgData, {
        creator_id: auth.getUserInfo().contact.id,
      });
      serviceProvider
        .serviceProviderForPostRequest(
          process.env.REACT_APP_SERVER_URL + "crm-plugin/contact/",
          postShgData
        )
        .then((res) => {
          if (this.state.isBankDetailsChecked) {
            this.saveBankDetails(res.data);
          }
          this.setState({ formSubmitted: true });
          this.props.history.push({ pathname: "/shgs", addData: true });
        })
        .catch((error) => {
          this.setState({ formSubmitted: false });
          if (error.response !== undefined) {
            this.setState({
              errorCode:
                error.response.data.statusCode +
                " Error- " +
                error.response.data.error +
                " Message- " +
                error.response.data.message +
                " Please try again!",
            });
          } else {
            this.setState({ errorCode: "Network Error - Please try again!" });
          }
        });
    }
  };

  saveBankDetails = async (data) => {
    let postBankData = {
      account_name: this.state.values.addAccountName,
      account_no: this.state.values.addAccountNo,
      bank_name: this.state.values.addBankName,
      branch: this.state.values.addBranch,
      ifsc_code: this.state.values.addIfsc,
      organization: data.organization.id,
    };

    if (data.organization.bankdetail) {
      // update bankdetail info in bankdetails table
      if (this.state.isBankDetailsChecked) {
        serviceProvider
          .serviceProviderForPutRequest(
            process.env.REACT_APP_SERVER_URL + "bankdetails",
            this.state.bankInfoId,
            postBankData
          )
          .then((res) => {})
          .catch((error) => {
            console.log(error);
          });
      } else {
        if (this.state.bankInfoId) {
          serviceProvider
            .serviceProviderForDeleteRequest(
              process.env.REACT_APP_SERVER_URL + "bankdetails",
              this.state.bankInfoId
            )
            .then((res) => {})
            .catch((error) => {
              console.log(error);
            });
        }
      }
    } else {
      // save data in bankdetails model
      serviceProvider
        .serviceProviderForPostRequest(
          process.env.REACT_APP_SERVER_URL + "bankdetails/",
          postBankData
        )
        .then((res) => {})
        .catch((error) => {
          console.log(error);
        });
    }
  };

  cancelForm = () => {
    this.setState({
      values: {},
      formSubmitted: "",
      stateSelected: false,
      districtSelected: false,
    });
  };

  render() {
    let voFilters = this.state.getVillageOrganization;
    let addVo = this.state.values.addVo;
    let villageFilter = this.state.getVillage;
    let addVillage = this.state.values.addVillage;
    let checked = this.state.isBankDetailsChecked;
    let stateFilter = this.state.getState;
    let addState = this.state.values.addState;
    let districtFilter = this.state.getDistrict;
    let addDistrict = this.state.values.addDistrict;

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
              title={
                this.state.editPage[0]
                  ? "Edit Self Help Group"
                  : "Add Self Help Group"
              }
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
                    label="Self Help Group Name*"
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
                  <Autotext
                    id="combo-box-demo"
                    options={stateFilter}
                    variant="outlined"
                    label="Select State*"
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => {
                      this.handleStateChange(value);
                    }}
                    defaultValue={[]}
                    value={
                      addState
                        ? stateFilter[
                            stateFilter.findIndex(function (item, i) {
                              return item.id === addState;
                            })
                          ] || null
                        : null
                    }
                    error={this.hasError("addState")}
                    helperText={
                      this.hasError("addState")
                        ? this.state.errors.addState[0]
                        : null
                    }
                    renderInput={(params) => (
                      <Input
                        fullWidth
                        label="Select State*"
                        name="addState"
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Autotext
                    id="combo-box-demo"
                    options={districtFilter}
                    variant="outlined"
                    label="Select District*"
                    name="addDistrict"
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => {
                      this.handleDistrictChange(value);
                    }}
                    defaultValue={[]}
                    value={
                      addDistrict
                        ? districtFilter[
                            districtFilter.findIndex(function (item, i) {
                              return item.id === addDistrict;
                            })
                          ] || null
                        : null
                    }
                    error={this.hasError("addDistrict")}
                    helperText={
                      this.hasError("addDistrict")
                        ? this.state.errors.addDistrict[0]
                        : this.state.stateSelected
                        ? null
                        : "Please select the state first"
                    }
                    renderInput={(params) => (
                      <Input
                        {...params}
                        fullWidth
                        label="Select District*"
                        name="addDistrict"
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Autotext
                    id="combo-box-demo"
                    options={villageFilter}
                    variant="outlined"
                    label="Select Village*"
                    name="addVillage"
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => {
                      this.handleVillageChange(event, value);
                    }}
                    defaultValue={[]}
                    value={
                      addVillage
                        ? villageFilter[
                            villageFilter.findIndex(function (item, i) {
                              return item.id === addVillage;
                            })
                          ] || null
                        : null
                    }
                    error={this.hasError("addVillage")}
                    helperText={
                      this.hasError("addVillage")
                        ? this.state.errors.addVillage[0]
                        : this.state.districtSelected
                        ? null
                        : "Please select the district first"
                    }
                    renderInput={(params) => (
                      <Input
                        {...params}
                        fullWidth
                        label="Select Village"
                        name="addVillage"
                        variant="outlined"
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
                    label="Select VO*"
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
                          checked={this.state.isBankDetailsChecked}
                          onChange={this.handleCheckBox}
                          name="isBankDetailsChecked"
                          color="primary"
                        />
                      }
                      label="Add Bank details"
                    />
                  </FormGroup>
                </Grid>
                {this.state.isBankDetailsChecked ? (
                  <Aux>
                    <Grid item md={6} xs={12}>
                      <Input
                        fullWidth
                        label="Bank Account Name*"
                        disabled={checked ? false : true}
                        name="addAccountName"
                        error={this.hasError("addAccountName")}
                        helperText={
                          this.hasError("addAccountName")
                            ? this.state.errors.addAccountName[0]
                            : null
                        }
                        value={this.state.values.addAccountName || ""}
                        onChange={this.handleChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <Input
                        fullWidth
                        label="Account Number*"
                        name="addAccountNo"
                        disabled={checked ? false : true}
                        error={this.hasError("addAccountNo")}
                        helperText={
                          this.hasError("addAccountNo")
                            ? this.state.errors.addAccountNo[0]
                            : null
                        }
                        value={this.state.values.addAccountNo || ""}
                        onChange={this.handleChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <Input
                        fullWidth
                        disabled={checked ? false : true}
                        label="Bank Name*"
                        name="addBankName"
                        error={this.hasError("addBankName")}
                        helperText={
                          this.hasError("addBankName")
                            ? this.state.errors.addBankName[0]
                            : null
                        }
                        value={this.state.values.addBankName || ""}
                        onChange={this.handleChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <Input
                        fullWidth
                        label="Branch*"
                        disabled={checked ? false : true}
                        name="addBranch"
                        error={this.hasError("addBranch")}
                        helperText={
                          this.hasError("addBranch")
                            ? this.state.errors.addBranch[0]
                            : null
                        }
                        value={this.state.values.addBranch || ""}
                        onChange={this.handleChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <Input
                        fullWidth
                        label="IFSC Code*"
                        name="addIfsc"
                        disabled={checked ? false : true}
                        error={this.hasError("addIfsc")}
                        helperText={
                          this.hasError("addIfsc")
                            ? this.state.errors.addIfsc[0]
                            : null
                        }
                        value={this.state.values.addIfsc || ""}
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
                color="secondary"
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
