import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import axios from "axios";
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
import { map } from "lodash";
import validateInput from "../../components/Validation/ValidateInput/ValidateInput";
import { ADD_MEMBERS_BREADCRUMBS, EDIT_MEMBERS_BREADCRUMBS } from "./config";
import { Link } from "react-router-dom";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import Autotext from "../../components/Autotext/Autotext";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import InputAdornment from "@material-ui/core/InputAdornment";
import FormControl from "@material-ui/core/FormControl";
import IconButton from "@material-ui/core/IconButton";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import Autocomplete from "@material-ui/lab/Autocomplete";

class ActivityPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      getState: [],
      getDistrict: [],
      getVillage: [],
      stateSelected: false,
      districtSelected: false,
      values: {
        addIsActive: false,
      },
      isShareholder: false,
      createUser: false,
      password: "",
      showPassword: false,
      formSubmitted: "",
      errorCode: "",
      rolesList: [],
      roleName: "",
      roleWiseData: [],
      shareInfoId: "",
      createUserId: "",
      validations: {
        firstName: {
          required: { value: "true", message: "First name field is required" },
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
          phone: {
            value: "true",
            message: "Please enter valid phone number",
          },
        },
        addEmail: {
          required: {
            value: "true",
            message: "Email is required",
          },
          email: {
            value: "true",
            message: "Please enter valid email id",
          },
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
      },
      validationsCreateuser: {
        username: {
          required: { value: "true", message: "Username is required" },
        },
        password: {
          required: { value: "true", message: "Password is required" },
        },
        role: {
          required: { value: "true", message: "Role is required" },
        },
        selectField: {
          required: { value: "true", message: "Field is required" },
        },
      },
      errors: {
        firstName: [],
        lastName: [],
        address: [],
        addState: [],
        addDistrict: [],
        addBlock: [],
        addGp: [],
        addVillage: [],
        addPincode: [],
        noOfShares: [],
        shareAmt: [],
        certificateNo: [],
        nominee: [],
        username: [],
        password: [],
        role: [],
        selectField: [],
      },
      editPage: [
        this.props.match.params.id !== undefined ? true : false,
        this.props.match.params.id,
      ],
    };
  }

  async componentDidMount() {
    // get all roles
    axios
      .get(process.env.REACT_APP_SERVER_URL + "users-permissions/roles", {
        headers: {
          Authorization: "Bearer " + auth.getToken() + "",
        },
      })
      .then((res) => {
        this.setState({ rolesList: res.data.roles });
      })
      .catch((error) => {
        console.log(error);
      });

    if (this.state.editPage[0]) {
      await axios
        .get(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/contact/" +
            this.state.editPage[1],
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + "",
            },
          }
        )
        .then((res) => {
          this.handleStateChange(res.data.state);
          this.handleDistrictChange(res.data.district);

          this.setState({
            values: {
              firstName: res.data.individual.first_name,
              lastName: res.data.individual.last_name,
              husbandName: res.data.individual.partner_name,
              address: res.data.address_1,
              addDistrict: res.data.district.id,
              addState: res.data.state.id,
              addBlock: res.data.block,
              addGp: res.data.gp,
              addVillage: res.data.villages[0].id,
              addPincode: res.data.pincode,
              addPhone: res.data.phone,
              addEmail: res.data.email,
            },
          });

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
          // if createUser is checked
          if (res.data.user) {
            this.setState({ createUserId: res.data.user.id });
            axios
              .get(
                process.env.REACT_APP_SERVER_URL +
                  "users/?role.id=" +
                  res.data.user.role +
                  "&&contact.id=" +
                  res.data.id,
                {
                  headers: {
                    Authorization: "Bearer " + auth.getToken() + "",
                  },
                }
              )
              .then((response) => {
                let tempUserValues = this.state.values;
                tempUserValues["username"] = res.data.user.username;
                tempUserValues["role"] = response.data[0].role;
                // to get the role obj from role id
                axios
                  .get(
                    process.env.REACT_APP_SERVER_URL +
                      "users-permissions/roles/" +
                      res.data.user.role,
                    {
                      headers: {
                        Authorization: "Bearer " + auth.getToken() + "",
                      },
                    }
                  )
                  .then((roleRes) => {
                    if (roleRes.data.role.name === "SHG Member") {
                      tempUserValues["selectField"] = res.data.individual.shg;
                    }
                    if (
                      roleRes.data.role.name ===
                      "CSP (Community Service Provider)"
                    ) {
                      tempUserValues["selectField"] = res.data.individual.vo;
                    }

                    this.handleRoleChange("", roleRes.data.role);
                  })
                  .catch((error) => {});
                this.setState({
                  createUser: true,
                  values: tempUserValues,
                });
              })
              .catch((error) => {
                console.log(error);
              });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }

    // get all states
    await axios
      .get(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/states/?is_active=true",
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + "",
          },
        }
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
    const validationsCreateuser = this.state.validationsCreateuser;
    const allValiations = validations;

    if (this.state.isShareholder) {
      Object.assign(allValiations, validationsShareholder);
    } else {
      delete allValiations[validationsShareholder];
    }
    if (this.state.createUser) {
      Object.assign(allValiations, validationsCreateuser);
    } else {
      delete allValiations[validationsCreateuser];
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
      this.setState({
        values: { ...this.state.values, addState: value.id },
      });
      let stateId = value.id;
      axios
        .get(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/districts/?is_active=true&&state.id=" +
            stateId,
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + "",
            },
          }
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
      this.setState({
        values: { ...this.state.values, addDistrict: value.id },
      });
      let districtId = value.id;
      axios
        .get(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/villages/?is_active=true&&district.id=" +
            districtId,
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + "",
            },
          }
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
      this.setState({
        values: { ...this.state.values, addVillage: value.id },
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

  handleOnCheck = (event, type) => {
    this.setState({
      isShareholder: !this.state.isShareholder,
    });
  };

  handleOnUserCheck = (event, type) => {
    this.setState({
      createUser: !this.state.createUser,
    });
  };

  handleRoleChange = (event, value) => {
    let apiUrl;
    if (value !== null) {
      this.setState({
        values: {
          ...this.state.values,
          role: value,
          roleName: value.name,
        },
      });

      if (value.name === "CSP (Community Service Provider)") {
        apiUrl =
          "crm-plugin/contact/?contact_type=organization&organization.sub_type=VO&_sort=name:ASC";
      } else if (value.name === "SHG Member") {
        apiUrl =
          "crm-plugin/contact/?contact_type=organization&organization.sub_type=SHG&_sort=name:ASC";
      } else if (value.name === "FPO Admin") {
        apiUrl =
          "crm-plugin/contact/?contact_type=organization&organization.sub_type=FPO&_sort=name:ASC";
      }

      // get all VO for role CSP
      axios
        .get(process.env.REACT_APP_SERVER_URL + apiUrl, {
          headers: {
            Authorization: "Bearer " + auth.getToken() + "",
          },
        })
        .then((res) => {
          this.setState({ roleWiseData: res.data });
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      this.setState({
        values: {
          ...this.state.values,
          role: "",
          roleName: "",
        },
      });
    }
  };

  handleFieldChange = (event, value) => {
    if (value !== null) {
      this.setState({
        values: { ...this.state.values, selectField: value.id },
      });
    } else {
      this.setState({
        values: {
          ...this.state.values,
          selectField: "",
        },
      });
    }
  };

  handleClickShowPassword = () => {
    this.setState({ showPassword: !this.state.showPassword });
  };

  handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.validate();
    this.setState({ formSubmitted: "" });
    let fName = this.state.values.firstName;
    let lName = this.state.values.lastName;
    let hName = this.state.values.husbandName;
    let address = this.state.values.address;
    let stateId = this.state.values.addState;
    let districtId = this.state.values.addDistrict;
    let block = this.state.values.addBlock;
    let gp = this.state.values.addGp;
    let phoneNo = this.state.values.addPhone;
    let emailAdd = this.state.values.addEmail;
    let pincodeNo = this.state.values.addPincode;
    let villageId = this.state.values.addVillage;

    let postData = {
      name: fName + " " + lName,
      phone: phoneNo,
      email: emailAdd,
      address_1: address,
      pincode: pincodeNo,
      contact_type: JSON.parse(process.env.REACT_APP_CONTACT_TYPE)[
        "Individual"
      ][0],
      district: {
        id: districtId,
      },
      state: {
        id: stateId,
      },
      villages: {
        id: villageId,
      },
      block: block,
      gp: gp,
      first_name: fName,
      last_name: lName,
      partner_name: hName,
    };

    if (this.state.editPage[0]) {
      // edit present member (update API)
      await axios
        .put(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/contact/" +
            this.state.editPage[1],
          postData,
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + "",
            },
          }
        )
        .then((res) => {
          // if (this.state.isShareholder) {
          this.saveShareInfo(res.data);
          // }
          // if (this.state.createUser) {
          this.saveUser(res.data);
          // }
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
      await axios
        .post(
          process.env.REACT_APP_SERVER_URL + "crm-plugin/contact/",
          postData,
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + "",
            },
          }
        )
        .then((res) => {
          if (this.state.isShareholder) {
            this.saveShareInfo(res.data);
          }
          if (this.state.createUser) {
            this.saveUser(res.data);
          }
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

    if (data.shareinformation) {
      // update share info in shareinformation table
      if (this.state.isShareholder) {
        await axios
          .put(
            process.env.REACT_APP_SERVER_URL +
              "shareinformations/" +
              this.state.shareInfoId,
            postShareData,
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
      } else {
        if (this.state.shareInfoId) {
          axios
            .delete(
              process.env.REACT_APP_SERVER_URL +
                "shareinformations/" +
                this.state.shareInfoId,
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
      // add share info in shareinformation table
      await axios
        .post(
          process.env.REACT_APP_SERVER_URL + "shareinformations/",
          postShareData,
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
  };

  saveUser = async (data) => {
    let username = this.state.values.username;
    let password = this.state.values.password;
    let roleId = this.state.values.role;
    let selectFieldId = this.state.values.selectField;

    let postUserData = {
      username: username,
      password: password,
      role: roleId,
      contact: data.id,
      email: this.state.values.addEmail,
      first_name: this.state.values.firstName,
      last_name: this.state.values.lastName,
    };

    let postIndividualData = {};
    if (roleId.name === "SHG Member") {
      postIndividualData = {
        shg: selectFieldId,
        vo: 0,
      };
    } else if (roleId.name === "CSP (Community Service Provider)") {
      postIndividualData = {
        vo: selectFieldId,
        shg: 0,
      };
    } else {
      postIndividualData = {
        vo: 0,
        shg: 0,
      };
    }

    if (data.user) {
      // update user in Users table
      if (this.state.createUser) {
        // if createUser checkbox is checked
        await axios
          .put(
            process.env.REACT_APP_SERVER_URL +
              "users/" +
              this.state.createUserId,
            postUserData,
            {
              headers: {
                Authorization: "Bearer " + auth.getToken() + "",
              },
            }
          )
          .then((res) => {
            axios
              .put(
                process.env.REACT_APP_SERVER_URL +
                  "crm-plugin/individuals/" +
                  data.individual.id,
                postIndividualData,
                {
                  headers: {
                    Authorization: "Bearer " + auth.getToken() + "",
                  },
                }
              )
              .then((res) => {})
              .catch((error) => {});
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        if (this.state.createUserId) {
          // if createUSer is selected previously but unchecked later
          axios
            .delete(
              process.env.REACT_APP_SERVER_URL +
                "users/" +
                this.state.createUserId,
              {
                headers: {
                  Authorization: "Bearer " + auth.getToken() + "",
                },
              }
            )
            .then((res) => {
              axios
                .put(
                  process.env.REACT_APP_SERVER_URL +
                    "crm-plugin/individuals/" +
                    data.individual.id,
                  { shg: 0, vo: 0 },
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
            })
            .catch((error) => {
              console.log(error);
            });
        }
      }
    } else {
      // add user in Users table
      await axios
        .post(process.env.REACT_APP_SERVER_URL + "users/", postUserData, {
          headers: {
            Authorization: "Bearer " + auth.getToken() + "",
          },
        })
        .then((res) => {
          // add shg/vo in Individuals table based on selected role
          axios
            .put(
              process.env.REACT_APP_SERVER_URL +
                "crm-plugin/individuals/" +
                data.individual.id,
              postIndividualData,
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
        })
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
    let stateFilter = this.state.getState;
    let addState = this.state.values.addState;
    let districtFilter = this.state.getDistrict;
    let addDistrict = this.state.values.addDistrict;
    let villageFilter = this.state.getVillage;
    let addVillage = this.state.values.addVillage;
    let roleFilter = this.state.rolesList;
    let role = this.state.values.role;
    let roleName = this.state.values.roleName;
    let selectField = this.state.values.selectField;

    return (
      <Layout
        breadcrumbs={
          this.state.editPage[0]
            ? EDIT_MEMBERS_BREADCRUMBS
            : ADD_MEMBERS_BREADCRUMBS
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
                <Grid item md={12} xs={12}>
                  {/* {this.state.formSubmitted === false ? (
                    <Snackbar severity="error" Showbutton={false}>
                      {this.state.errorCode}
                    </Snackbar>
                  ) : null} */}
                </Grid>
                <Grid item md={12} xs={12}>
                  {/* {this.state.DateTimepickerError === true ? (
                    <Snackbar severity="error" Showbutton={false}>
                      "Start Date Cannot be Greater than End Date"
                    </Snackbar>
                  ) : null} */}
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
                    label="Phone Number"
                    type="tel"
                    name="addPhone"
                    error={this.hasError("addPhone")}
                    helperText={
                      this.hasError("addPhone")
                        ? this.state.errors.addPhone[0]
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
                    label="Email*"
                    type="email"
                    name="addEmail"
                    error={this.hasError("addEmail")}
                    helperText={
                      this.hasError("addEmail")
                        ? this.state.errors["addEmail"].map((error) => {
                            return error + " ";
                          })
                        : null
                    }
                    value={this.state.values.addEmail || ""}
                    onChange={this.handleChange}
                    variant="outlined"
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
                  <Grid container spacing={3}>
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
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                          autoOk
                          inputVariant="outlined"
                          margin="normal"
                          id="date-picker-dialog"
                          label="Date"
                          format="MM/dd/yyyy"
                          value={this.state.values.selectedDate}
                          onChange={(value) =>
                            this.setState({
                              values: {
                                ...this.state.values,
                                selectedDate: value,
                              },
                            })
                          }
                          KeyboardButtonProps={{
                            "aria-label": "change date",
                          }}
                        />
                      </MuiPickersUtilsProvider>
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

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={this.state.createUser}
                        onChange={this.handleOnUserCheck}
                        name="createUser"
                        color="secondary"
                      />
                    }
                    label="Create User"
                  />
                </Grid>
                <Divider />
                {this.state.createUser ? (
                  <Grid container spacing={3}>
                    <Grid item md={6} xs={12}>
                      <Input
                        fullWidth
                        label="Username*"
                        name="username"
                        error={this.hasError("username")}
                        helperText={
                          this.hasError("username")
                            ? this.state.errors.username[0]
                            : null
                        }
                        value={this.state.values.username || ""}
                        onChange={this.handleChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <FormControl variant="outlined">
                        <InputLabel htmlFor="outlined-adornment-password">
                          Password*
                        </InputLabel>
                        <OutlinedInput
                          fullWidth
                          name="password"
                          type={this.state.showPassword ? "text" : "password"}
                          error={this.hasError("username")}
                          // value={this.state.password}
                          onChange={this.handleChange}
                          endadornment={
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={this.handleClickShowPassword}
                                onMouseDown={this.handleMouseDownPassword}
                                edge="end"
                              >
                                <VisibilityIcon />
                                {this.state.showPassword ? (
                                  <VisibilityIcon />
                                ) : (
                                  <VisibilityOffIcon />
                                )}
                              </IconButton>
                            </InputAdornment>
                          }
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <Autocomplete
                        id="select-role"
                        name="role"
                        value={role}
                        options={roleFilter}
                        variant="outlined"
                        getOptionLabel={(option) => option.name}
                        placeholder="Select Role*"
                        onChange={this.handleRoleChange}
                        renderInput={(params) => (
                          <Input
                            {...params}
                            fullWidth
                            label="Select Role*"
                            name="role"
                            variant="outlined"
                            error={this.hasError("role")}
                          />
                        )}
                      />
                    </Grid>
                    {roleName === "CSP (Community Service Provider)" ||
                    roleName === "SHG Member" ||
                    roleName === "FPO Admin" ||
                    roleName === "" ? (
                      <Grid item md={6} xs={12}>
                        <Autotext
                          id="select-field"
                          options={this.state.roleWiseData}
                          variant="outlined"
                          label={
                            roleName === "CSP (Community Service Provider)"
                              ? "Select Village Organization*"
                              : roleName === "SHG Member"
                              ? "Select SHGs*"
                              : roleName === "FPO Admin"
                              ? "Select FPO*"
                              : null
                          }
                          name="selectField"
                          getOptionLabel={(option) => option.name}
                          onChange={(event, value) => {
                            this.handleFieldChange(event, value);
                          }}
                          defaultValue={[]}
                          value={
                            selectField
                              ? this.state.roleWiseData[
                                  this.state.roleWiseData.findIndex(function (
                                    item,
                                    i
                                  ) {
                                    return item.id === selectField;
                                  })
                                ] || null
                              : null
                          }
                          error={this.hasError("selectField")}
                          renderInput={(params) => (
                            <Input
                              {...params}
                              fullWidth
                              label={
                                roleName === "CSP (Community Service Provider)"
                                  ? "Select Village Organization*"
                                  : roleName === "SHG Member"
                                  ? "Select SHGs*"
                                  : roleName === "FPO Admin"
                                  ? "Select FPO*"
                                  : null
                              }
                              name="selectField"
                              variant="outlined"
                            />
                          )}
                        />
                      </Grid>
                    ) : null}
                  </Grid>
                ) : null}
              </Grid>
            </CardContent>
            <Divider />
            <CardActions>
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
