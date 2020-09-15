import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import * as serviceProvider from "../../api/Axios";
import auth from "../../components/Auth/Auth";
import Button from "../../components/UI/Button/Button";
import Input from "../../components/UI/Input/Input";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Grid,
} from "@material-ui/core";
import { map, values } from "lodash";
import validateInput from "../../components/Validation/ValidateInput/ValidateInput";
import { ADD_MEMBERS_BREADCRUMBS, EDIT_MEMBERS_BREADCRUMBS } from "./config";
import { Link } from "react-router-dom";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import Autotext from "../../components/Autotext/Autotext";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { constants } from "buffer";
import Datepicker from "../../components/UI/Datepicker/Datepicker.js";

class ActivityPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      getState: [],
      getDistrict: [],
      getVillage: [],
      getShgs: [],
      getPgs: [],
      stateSelected: false,
      districtSelected: false,
      values: {
        addIsActive: false,
      },
      isShareholder: false,
      formSubmitted: "",
      errorCode: "",
      shareInfoId: "",
      loggedInUserRole: auth.getUserInfo().role.name,
      validations: {
        firstName: {
          required: { value: "true", message: "First name is required" },
        },
        lastName: {
          required: { value: "true", message: "Last name is required" },
        },
        address: {
          required: { value: "true", message: "Address is required" },
        },
        addState: {
          required: { value: "true", message: "State is required" },
        },
        addDistrict: {
          required: { value: "true", message: "District is required" },
        },
        addBlock: {},
        addGp: {},
        addVillage: {
          required: { value: "true", message: "Village is required" },
        },
        addPincode: {},
        addPhone: {
          required: {
            value: "true",
            message: "Phone number is required",
          },
          phone: {
            value: "true",
            message: "Please enter valid phone number",
          },
        },
        addShg: {
          required: { value: "true", message: "SHG is required" },
        },
      },
      validationsShareholder: {
        noOfShares: {
          required: { value: "true", message: "Number of Shares is required" },
        },
        shareAmt: {
          required: { value: "true", message: "Share Amount is required" },
        },
        certificateNo: {
          required: {
            value: "true",
            message: "Share Certificate Number is required",
          },
        },
        nominee: {
          required: { value: "true", message: "Nominee is required" },
        },
        selectedDate: {
          required: {
            value: "true",
            message: "Date is required",
          },
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
          this.handleShgChange("", res.data.individual.shg);
          this.handlePgChange(res.data.pg);

          this.setState({
            values: {
              firstName: res.data.individual.first_name,
              lastName: res.data.individual.last_name,
              husbandName: res.data.individual.partner_name,
              addId: res.data.addresses[0].id,
              address: res.data.addresses[0].address_line_1,
              addDistrict: res.data.addresses[0].district,
              addState: res.data.addresses[0].state,
              addBlock: res.data.addresses[0].block,
              addGp: res.data.addresses[0].gp,
              addVillage: res.data.addresses[0].village,
              addPincode: res.data.addresses[0].pincode,
              addPhone: res.data.phone,
              addEmail: res.data.email,
              addShg: res.data.individual.shg,
            },
          });
          console.log("village add", res.data.addresses[0].village);
          if (res.data.pg) {
            let pgValue = this.state.values;
            pgValue["addPg"] = res.data.pg.id;
            this.setState({
              values: pgValue,
            });
          }

          // if isShareholder is checked
          if (res.data.shareinformation) {
            this.setState({ shareInfoId: res.data.shareinformation.id });
            let tempValues = this.state.values;
            tempValues["noOfShares"] = res.data.shareinformation.no_share;
            tempValues["shareAmt"] = res.data.shareinformation.amount;
            tempValues["certificateNo"] =
              res.data.shareinformation.certificate_no;
            tempValues["nominee"] = res.data.shareinformation.nominee_name;
            tempValues["selectedDate"] = res.data.shareinformation.date;
            this.setState({
              isShareholder: true,
              values: tempValues,
            });
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

    // get all active pg
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/tags/?_sort=name:ASC&&is_active=true"
      )
      .then((res) => {
        this.setState({ getPgs: res.data });
      })
      .catch((error) => {
        console.log(error);
      });

    // get all shgs
    let url =
      "crm-plugin/contact/?contact_type=organization&organization.sub_type=SHG&&_sort=name:ASC";
    if (this.state.loggedInUserRole === "FPO Admin") {
      url += "&creator_id=" + auth.getUserInfo().contact.id;
      serviceProvider
        .serviceProviderForGetRequest(process.env.REACT_APP_SERVER_URL + url)
        .then((res) => {
          this.setState({ getShgs: res.data });
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (
      this.state.loggedInUserRole === "CSP (Community Service Provider)"
    ) {
      let shgArray = [];
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/contact/?individual=" +
            auth.getUserInfo().contact.individual
        )
        .then((res) => {
          serviceProvider
            .serviceProviderForGetRequest(
              process.env.REACT_APP_SERVER_URL +
                "crm-plugin/contact/?id=" +
                res.data[0].individual.vo
            )
            .then((response) => {
              this.setState({ getShgs: response.data[0].org_vos });
            });
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      serviceProvider
        .serviceProviderForGetRequest(process.env.REACT_APP_SERVER_URL + url)
        .then((res) => {
          this.setState({ getShgs: res.data });
        })
        .catch((error) => {
          console.log(error);
        });
    }

    if (this.state.values.addState) {
      this.setState({ stateSelected: true });
    }
  }

  hasError = (field) => {
    if (this.state.errors[field] !== undefined) {
      return Object.keys(this.state.errors).length > 0 &&
        this.state.errors[field].length > 0
        ? true
        : false;
    }
  };

  validate = () => {
    const values = this.state.values;
    const validations = this.state.validations;
    const validationsShareholder = this.state.validationsShareholder;
    const allValiations = validations;
    if (this.state.isShareholder) {
      Object.assign(allValiations, validationsShareholder);
    } else {
      delete allValiations["certificateNo"];
      delete allValiations["nominee"];
      delete allValiations["shareAmt"];
      delete allValiations["noOfShares"];
      delete allValiations["selectedDate"];
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
          addVillage: "",
        },
        getDistrict: [],
        getVillage: [],
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
        getVillage: [],
      });
      this.setState({ districtSelected: false });
    }
  }

  handleVillageChange(event, value) {
    if (value !== null) {
      let newVal = value;
      if (typeof value === "object") {
        newVal = value.id;
      }
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

  handlePgChange(value) {
    if (value !== null) {
      this.setState({
        values: { ...this.state.values, addPg: value.id },
      });
    } else {
      this.setState({
        values: {
          ...this.state.values,
          addPg: 0,
        },
      });
    }
  }

  handleOnCheck = (event, type) => {
    this.setState({
      isShareholder: !this.state.isShareholder,
    });
  };

  handleShgChange(event, value) {
    if (value !== null) {
      if (this.state.loggedInUserRole === "CSP (Community Service Provider)") {
        this.setState({
          values: { ...this.state.values, addShg: value.contact },
        });
      } else {
        this.setState({
          values: { ...this.state.values, addShg: value.id },
        });
      }
    } else {
      this.setState({
        values: {
          ...this.state.values,
          addShg: "",
        },
      });
    }
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    this.validate();
    this.setState({ formSubmitted: "" });
    if (Object.keys(this.state.errors).length > 0) return;

    let fName = this.state.values.firstName;
    let lName = this.state.values.lastName;
    let hName = this.state.values.husbandName;
    let phoneNo = this.state.values.addPhone;
    let emailAdd = this.state.values.addEmail;
    let block = this.state.values.addBlock;
    let gp = this.state.values.addGp;
    let pincodeNo = this.state.values.addPincode;
    let addressId = this.state.values.addId;
    let address = this.state.values.address;
    let stateId = this.state.values.addState;
    let districtId = this.state.values.addDistrict;
    let villageId = this.state.values.addVillage;
    let shgId = this.state.values.addShg;
    let pgId = this.state.values.addPg;

    console.log("villageId", villageId);
    let postAddressData = {
      block: block,
      gp: gp,
      pincode: pincodeNo,
      address_line_1: address,
      district:
        //districtId,
        {
          id: districtId,
        },
      state: {
        id: stateId,
      },
      //stateId,
      village:
        //villageId,
        {
          id: villageId,
        },
    };
    let postData = {
      name: fName + " " + lName,
      phone: phoneNo,
      email: emailAdd,
      contact_type: JSON.parse(process.env.REACT_APP_CONTACT_TYPE)[
        "Individual"
      ][0],
      addresses: [postAddressData],
      pg: pgId,
      first_name: fName,
      last_name: lName,
      partner_name: hName,
      shg: shgId,
    };

    if (this.state.editPage[0]) {
      // edit present member (update API)
      Object.assign(postAddressData, {
        id: addressId,
      });

      serviceProvider
        .serviceProviderForPutRequest(
          process.env.REACT_APP_SERVER_URL + "crm-plugin/contact",
          this.state.editPage[1],
          postData
        )
        .then((res) => {
          this.saveShareInfo(res.data);
          this.setState({ formSubmitted: true });
          this.props.history.push({ pathname: "/members", editData: true });
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
      // add new member API (entry gets saved in contact & individual table)
      Object.assign(postData, {
        creator_id: auth.getUserInfo().contact.id,
      });
      serviceProvider
        .serviceProviderForPostRequest(
          process.env.REACT_APP_SERVER_URL + "crm-plugin/contact/",
          postData
        )
        .then((res) => {
          if (this.state.isShareholder) {
            this.saveShareInfo(res.data);
          }
          //if (this.state.values.address) {
          //  this.saveaddressInfo(res.data);
          //}
          this.setState({
            formSubmitted: true,
          });
          this.props.history.push({
            pathname: "/members",
            addData: true,
          });
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

  saveShareInfo = async (data) => {
    let sharesNo = this.state.values.noOfShares;
    let sharesAmount = this.state.values.shareAmt;
    let shareCertiNo = this.state.values.certificateNo;
    let shareNominee = this.state.values.nominee;
    let shareDate = this.state.values.selectedDate;
    let postShareData = {
      contact: data.id,
      nominee_name: shareNominee,
      no_share: sharesNo,
      amount: sharesAmount,
      certificate_no: shareCertiNo,
      date: shareDate,
    };
    if (Object.keys(this.state.errors).length > 0) return;
    if (data.shareinformation) {
      // update share info in shareinformation table
      if (this.state.isShareholder) {
        serviceProvider
          .serviceProviderForPutRequest(
            process.env.REACT_APP_SERVER_URL + "shareinformations",
            this.state.shareInfoId,
            postShareData
          )
          .then((res) => {})
          .catch((error) => {
            console.log(error);
          });
      } else {
        if (this.state.shareInfoId) {
          serviceProvider
            .serviceProviderForDeleteRequest(
              process.env.REACT_APP_SERVER_URL + "shareinformations",
              this.state.shareInfoId
            )
            .then((res) => {})
            .catch((error) => {
              console.log(error);
            });
        }
      }
    } else {
      // add share info in shareinformation table
      serviceProvider
        .serviceProviderForPostRequest(
          process.env.REACT_APP_SERVER_URL + "shareinformations/",
          postShareData
        )
        .then((res) => {})
        .catch((error) => {
          console.log(error);
        });
    }
  };

  saveaddressInfo = async (data) => {
    let block = this.state.values.addBlock;
    let gp = this.state.values.addGp;
    let pincodeNo = this.state.values.addPincode;
    let address = this.state.values.address;
    let stateId = this.state.values.addState;
    let districtId = this.state.values.addDistrict;
    let villageId = this.state.values.addVillage;

    let postAddressData = {
      contact: data.id,
      block: block,
      gp: gp,
      pincode: pincodeNo,
      address_1: address,
      district: {
        id: districtId,
      },
      state: {
        id: stateId,
      },
      villages: {
        id: villageId,
      },
    };

    serviceProvider
      .serviceProviderForPostRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/address/",
        postAddressData
      )
      .then((res) => {
        console.log("res", res);
      })
      .catch((error) => {
        console.log(error);
      });
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
    let stateFilter = this.state.getState;
    let addState = this.state.values.addState;
    let districtFilter = this.state.getDistrict;
    let addDistrict = this.state.values.addDistrict;
    let villageFilter = this.state.getVillage;
    let addVillage = this.state.values.addVillage;
    let shgFilters = this.state.getShgs;
    let addShg = this.state.values.addShg;
    let pgFilter = this.state.getPgs;
    let addPg = this.state.values.addPg;

    return (
      <Layout
        breadcrumbs={
          this.state.editPage[0]
            ? EDIT_MEMBERS_BREADCRUMBS
            : ADD_MEMBERS_BREADCRUMBS
        }
      >
        <Card style={{ maxWidth: "45rem" }}>
          <form
            autoComplete="off"
            noValidate
            onSubmit={this.handleSubmit}
            method="post"
          >
            <CardHeader
              title={this.state.editPage[0] ? "Edit Member" : "Add Member"}
              subheader={
                this.state.editPage[0]
                  ? "You can edit member data here!"
                  : "You can add new member data here!"
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={12} xs={12}>
                  {this.state.formSubmitted === false ? (
                    <Snackbar severity="error" Showbutton={false}>
                      {this.state.errorCode}
                    </Snackbar>
                  ) : null}
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="First Name*"
                    name="firstName"
                    error={this.hasError("firstName")}
                    helperText={
                      this.hasError("firstName")
                        ? this.state.errors.firstName[0]
                        : null
                    }
                    value={this.state.values.firstName || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Last Name*"
                    name="lastName"
                    error={this.hasError("lastName")}
                    helperText={
                      this.hasError("lastName")
                        ? this.state.errors.lastName[0]
                        : null
                    }
                    value={this.state.values.lastName || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Husband Name"
                    name="husbandName"
                    helperText={
                      this.hasError("husbandName")
                        ? this.state.errors.husbandName[0]
                        : null
                    }
                    value={this.state.values.husbandName || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    fullWidth
                    label="Address*"
                    name="address"
                    error={this.hasError("address")}
                    helperText={
                      this.hasError("address")
                        ? this.state.errors.address[0]
                        : null
                    }
                    value={this.state.values.address || ""}
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
                  <Input
                    fullWidth
                    label="Block"
                    name="addBlock"
                    error={this.hasError("addBlock")}
                    helperText={
                      this.hasError("addBlock")
                        ? this.state.errors.addBlock[0]
                        : null
                    }
                    value={this.state.values.addBlock || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Gaon Panchayat"
                    name="addGp"
                    error={this.hasError("addGp")}
                    helperText={
                      this.hasError("addGp") ? this.state.errors.addGp[0] : null
                    }
                    value={this.state.values.addGp || ""}
                    onChange={this.handleChange}
                    variant="outlined"
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
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Pincode"
                    name="addPincode"
                    error={this.hasError("addPincode")}
                    helperText={
                      this.hasError("addPincode")
                        ? this.state.errors.addPincode[0]
                        : null
                    }
                    value={this.state.values.addPincode || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Phone Number*"
                    type="tel"
                    name="addPhone"
                    error={this.hasError("addPhone")}
                    helperText={
                      this.hasError("addPhone")
                        ? this.state.errors["addPhone"].map((error) => {
                            return error + " ";
                          })
                        : null
                    }
                    value={this.state.values.addPhone || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Email"
                    type="email"
                    name="addEmail"
                    value={this.state.values.addEmail || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Autotext
                    id="combo-box-demo"
                    options={shgFilters}
                    variant="outlined"
                    label="Select SHG*"
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => {
                      this.handleShgChange(event, value);
                    }}
                    value={
                      this.state.loggedInUserRole ===
                      "CSP (Community Service Provider)"
                        ? addShg
                          ? this.state.isCancel === true
                            ? null
                            : shgFilters[
                                shgFilters.findIndex(function (item, i) {
                                  return item.contact === addShg;
                                })
                              ] || null
                          : null
                        : addShg
                        ? this.state.isCancel === true
                          ? null
                          : shgFilters[
                              shgFilters.findIndex(function (item, i) {
                                return item.id === addShg;
                              })
                            ] || null
                        : null
                    }
                    error={this.hasError("addShg")}
                    helperText={
                      this.hasError("addShg")
                        ? this.state.errors.addShg[0]
                        : null
                    }
                    renderInput={(params) => (
                      <Input
                        fullWidth
                        label="Select SHG"
                        name="addShg"
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Autotext
                    id="combo-box-demo"
                    options={pgFilter}
                    variant="outlined"
                    label="Select PG"
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => {
                      this.handlePgChange(value);
                    }}
                    defaultValue={[]}
                    value={
                      addPg
                        ? pgFilter[
                            pgFilter.findIndex(function (item, i) {
                              return item.id === addPg;
                            })
                          ] || null
                        : null
                    }
                    renderInput={(params) => (
                      <Input
                        fullWidth
                        label="Select PG"
                        name="addPg"
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={this.state.isShareholder}
                        onChange={this.handleOnCheck}
                        name="isShareholder"
                        color="secondary"
                      />
                    }
                    label="Is Shareholder"
                  />
                </Grid>
                <Divider />
                {this.state.isShareholder ? (
                  <Grid
                    container
                    spacing={3}
                    style={{ width: "100%", margin: "0px" }}
                  >
                    <Grid item md={6} xs={12}>
                      <Input
                        fullWidth
                        label="Number of Shares*"
                        name="noOfShares"
                        error={this.hasError("noOfShares")}
                        helperText={
                          this.hasError("noOfShares")
                            ? this.state.errors.noOfShares[0]
                            : null
                        }
                        value={this.state.values.noOfShares || ""}
                        onChange={this.handleChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <Input
                        fullWidth
                        label="Share Amount*"
                        name="shareAmt"
                        error={this.hasError("shareAmt")}
                        helperText={
                          this.hasError("shareAmt")
                            ? this.state.errors.shareAmt[0]
                            : null
                        }
                        value={this.state.values.shareAmt || ""}
                        onChange={this.handleChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <Input
                        fullWidth
                        label="Share Certificate Numbers*"
                        name="certificateNo"
                        error={this.hasError("certificateNo")}
                        helperText={
                          this.hasError("certificateNo")
                            ? this.state.errors.certificateNo[0]
                            : null
                        }
                        value={this.state.values.certificateNo || ""}
                        onChange={this.handleChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <Datepicker
                        label="Date*"
                        name="selectedDate"
                        value={this.state.values.selectedDate || ""}
                        format={"dd MMM yyyy"}
                        error={this.hasError("selectedDate")}
                        helperText={
                          this.hasError("selectedDate")
                            ? this.state.errors.selectedDate[0]
                            : null
                        }
                        onChange={(value) =>
                          this.setState({
                            values: {
                              ...this.state.values,
                              selectedDate: value,
                            },
                          })
                        }
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <Input
                        fullWidth
                        label="Nominee*"
                        name="nominee"
                        error={this.hasError("nominee")}
                        helperText={
                          this.hasError("nominee")
                            ? this.state.errors.nominee[0]
                            : null
                        }
                        value={this.state.values.nominee || ""}
                        onChange={this.handleChange}
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                ) : null}
              </Grid>
            </CardContent>
            <Divider />
            <CardActions style={{ padding: "15px" }}>
              <Button type="submit">Save</Button>
              <Button
                color="secondary"
                clicked={this.cancelForm}
                component={Link}
                to="/members"
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
export default ActivityPage;
