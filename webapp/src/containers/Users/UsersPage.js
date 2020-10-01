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
import { map } from "lodash";
import validateInput from "../../components/Validation/ValidateInput/ValidateInput";
import { ADD_USERS_BREADCRUMBS, EDIT_USERS_BREADCRUMBS } from "./config";
import { Link } from "react-router-dom";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Autotext from "../../components/Autotext/Autotext";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Spinner from "../../components/Spinner/Spinner";

class UsersPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      editContactId: "",
      formSubmitted: "",
      errorCode: "",
      validations: {
        firstName: {
          required: { value: "true", message: "First name is required" },
        },
        lastName: {
          required: { value: "true", message: "Last name is required" },
        },
        addEmail: {
          email: {
            value: "true",
            message: "Please enter valid email id",
          },
        },
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
        password: {
          required: { value: "true", message: "Password is required" },
        },
        role: {
          required: { value: "true", message: "Role is required" },
        },
      },
      rolesList: [],
      roleWiseData: [],
      loggedInUserRole: auth.getUserInfo().role.name,
      errors: {},
      editPage: [
        this.props.match.params.id !== undefined ? true : false,
        this.props.match.params.id,
      ],
      isLoader: "",
      userId: ""
    };
  }

  async componentDidMount() {
    let newRoleArray = [];
    let roleArray = [];
    /** get all roles*/
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "users-permissions/roles"
      )
      .then((res) => {
        if (
          this.state.loggedInUserRole === "Sesta Admin" ||
          this.state.loggedInUserRole === "Superadmin"
        ) {
          roleArray = [
            "Sesta Admin",
            "FPO Admin",
            "CSP (Community Service Provider)",
          ];
        }
        if (this.state.loggedInUserRole === "FPO Admin") {
          roleArray = ["FPO Admin", "CSP (Community Service Provider)"];
        }

        roleArray.forEach((e, i) => {
          res.data.roles
            .filter((item) => item.name === e)
            .map((filteredRole) => {
              newRoleArray.push(filteredRole);
            });
        });
        this.setState({ rolesList: newRoleArray }, function () {
          this.getDetails();
        });
      })
      .catch((error) => {
        console.log(error);
      });

    await serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "users"
      )
      .then((res) => {
        res.data.map(userdata => {
          if (userdata.contact.id === parseInt(this.state.editPage[1])) {
            this.setState({ userId: userdata.id })
          }
        })
      })
  }

  getDetails = () => {
    if (this.state.editPage[0]) {
      this.setState({ isLoader: true });
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/contact/" +
            this.state.editPage[1]
        )
        .then((res) => {
          delete this.state.validations["password"]; // remove password validation while editing the user
          delete this.state.errors["password"];

          serviceProvider
            .serviceProviderForGetRequest(
              process.env.REACT_APP_SERVER_URL +
                "users-permissions/roles/" +
                res.data.user.role
            )
            .then((roleRes) => {
              this.handleRoleChange("", roleRes.data.role);
              this.setState({
                values: {
                  firstName: res.data.individual.first_name,
                  lastName: res.data.individual.last_name,
                  addPhone: res.data.phone,
                  addEmail: res.data.user.email,
                  username: res.data.user.username,
                  password: undefined,
                  role: roleRes.data.role,
                },
                editContactId: res.data.id,
                isLoader: false,
              });
              let tempValues = this.state.values;
              if (roleRes.data.role.name === "FPO Admin") {
                tempValues["selectField"] = res.data.individual.fpo;
              }
              if (
                roleRes.data.role.name === "CSP (Community Service Provider)"
              ) {
                tempValues["selectField"] = res.data.individual.vo;
              }
              this.setState({
                values: tempValues,
                isLoader: false,
              });
            })
            .catch((error) => {});
        })
        .catch((error) => {});
    }
  };

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
    map(validations, (validation, key) => {
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

  handleRoleChange = (event, value) => {
    /** add selectfield validation based on loggedInUserRole & selected role*/
    let loggedInUserRole = this.state.loggedInUserRole;
    if (
      ((loggedInUserRole === "Sesta Admin" ||
        loggedInUserRole === "Superadmin") &&
        value.name === "FPO Admin") ||
      ((loggedInUserRole === "Sesta Admin" ||
        loggedInUserRole === "Superadmin") &&
        value.name === "CSP (Community Service Provider)") ||
      (loggedInUserRole === "FPO Admin" &&
        value.name === "CSP (Community Service Provider)")
    ) {
      Object.assign(this.state.validations, {
        selectField: {
          required: { value: "true", message: "is  required" },
        },
      });
    } else {
      delete this.state.validations["selectField"];
      delete this.state.errors["selectField"];
    }

    /** get FPO/VO as per selected role */
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
        if (this.state.loggedInUserRole === "FPO Admin") {
          apiUrl += "&&creator_id=" + auth.getUserInfo().contact.id;
          serviceProvider
            .serviceProviderForGetRequest(
              process.env.REACT_APP_SERVER_URL +
                "crm-plugin/individuals/" +
                auth.getUserInfo().contact.individual
            )
            .then((res) => {
              let voUrl =
                "crm-plugin/contact/?contact_type=organization&&organization.sub_type=VO&&_sort=name:ASC&&organization.fpo=" +
                res.data.fpo.id;

              serviceProvider
                .serviceProviderForGetRequest(
                  process.env.REACT_APP_SERVER_URL + voUrl
                )
                .then((voRes) => {
                  this.setState({ roleWiseData: voRes.data });
                });
            });
        }
      } else if (value.name === "FPO Admin") {
        apiUrl =
          "crm-plugin/contact/?contact_type=organization&organization.sub_type=FPO&_sort=name:ASC";
        if (this.state.loggedInUserRole === "FPO Admin") {
          apiUrl += "&&creator_id=" + auth.getUserInfo().contact.id;
        }
      }
      serviceProvider
        .serviceProviderForGetRequest(process.env.REACT_APP_SERVER_URL + apiUrl)
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
    this.setState({
      values: {
        ...this.state.values,
        showPassword: !this.state.values.showPassword,
      },
    });
  };

  handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.validate();
    this.setState({ formSubmitted: "" });
    if (Object.keys(this.state.errors).length > 0) return;

    let fName = this.state.values.firstName;
    let lName = this.state.values.lastName;
    let phoneNo = this.state.values.addPhone;
    let emailAdd = this.state.values.addEmail;
    if (emailAdd == "" || emailAdd == undefined) {
      emailAdd = phoneNo + "@example.com";
    }
    let postData = {
      name: fName + " " + lName,
      phone: phoneNo,
      email: emailAdd,
      contact_type: JSON.parse(process.env.REACT_APP_CONTACT_TYPE)[
        "Individual"
      ][0],
      first_name: fName,
      last_name: lName,
    };
    if (this.state.editPage[0]) {
      /** edit present contact/individual record (update API) */
      this.saveUser(postData);
    } else {
      /** save data in contact & individual table */
      Object.assign(postData, {
        creator_id: auth.getUserInfo().contact.id,
      });
      this.saveUser(postData);
    }
  };

  saveUser = async (postData) => {
    let emailAdd = this.state.values.addEmail;
    let username = this.state.values.addPhone;
    let password = this.state.values.password;
    let roleId = this.state.values.role;
    let selectFieldId = this.state.values.selectField;
    if (emailAdd == "" || emailAdd == undefined) {
      emailAdd = username + "@example.com";
    }
    let postUserData = {
      username: username,
      password: password,
      role: roleId,
      confirmed: true,
      // contact: data.id,
      email: emailAdd,
      first_name: postData.first_name,
      last_name: postData.last_name,
      mobile: postData.phone,
    };
    let postIndividualData = {};
    if (roleId) {
      if (roleId.name === "CSP (Community Service Provider)") {
        postIndividualData = {
          vo: selectFieldId,
          shg: 0,
          fpo: 0,
        };
      }
      if (
        roleId.name === "FPO Admin" &&
        (this.state.loggedInUserRole === "Superadmin" ||
          this.state.loggedInUserRole === "Sesta Admin")
      ) {
        postIndividualData = {
          vo: 0,
          shg: 0,
          fpo: selectFieldId,
        };
      }
      if (
        roleId.name === "FPO Admin" &&
        this.state.loggedInUserRole === "FPO Admin"
      ) {
        serviceProvider
          .serviceProviderForGetRequest(
            process.env.REACT_APP_SERVER_URL +
              "crm-plugin/individuals/" +
              auth.getUserInfo().contact.individual
          )
          .then((indRes) => {
            postIndividualData = {
              vo: 0,
              shg: 0,
              fpo: indRes.data.fpo.id,
            };
          })
          .catch((error) => {});
      }
    } else {
      postIndividualData = {
        vo: 0,
        shg: 0,
        fpo: 0,
      };
    }
    if (this.state.editPage[0]) {
      /** edit user in Users table */
      serviceProvider
        .serviceProviderForPutRequest(
          process.env.REACT_APP_SERVER_URL + "users",
          this.state.userId,
          postUserData
        )
        .then((res) => {
          /** edit fpo/vo in Individuals table based on selected role */
          if (postData.phone === this.state.values.addPhone) {
            postData.user = res.data.id;
            serviceProvider
              .serviceProviderForPutRequest(
                process.env.REACT_APP_SERVER_URL + "crm-plugin/contact",
                this.state.editContactId,
                postData
              )
              .then((res) => {
                let data = res.data;
                serviceProvider
                  .serviceProviderForPutRequest(
                    process.env.REACT_APP_SERVER_URL + "crm-plugin/individuals",
                    data.individual.id,
                    postIndividualData
                  )
                  .then((res) => {
                    this.props.history.push({
                      pathname: "/users",
                      editData: true,
                    });
                  });
              })
              .catch((error) => {
                console.log(error);
              });
          } else {
            this.state.errors.addPhone = [];
            this.state.errors.addPhone.push("");
            this.setState({
              formSubmitted: false,
              errorCode:
                "Phone number already exists, please use another phone number.",
            });
          }
        })
        .catch((error) => {
          if (
            error.response.data.message[0]["messages"][0]["id"] ===
            "Auth.form.error.username.taken"
          ) {
            this.state.errors.addPhone = [];
            this.state.errors.addPhone.push("");
            this.setState({
              formSubmitted: false,
              errorCode:
                "Phone number already exists, please use another phone number.",
            });
          }
          console.log(error);
        })
    } else {
      /** add user in Users table */
      serviceProvider
        .serviceProviderForPostRequest(
          process.env.REACT_APP_SERVER_URL + "users/",
          postUserData
        )
        .then((res) => {
          /** add fpo/vo in Individuals table based on selected role */
          postData.user = res.data.id;
          serviceProvider
            .serviceProviderForPostRequest(
              process.env.REACT_APP_SERVER_URL + "crm-plugin/contact/",
              postData
            )
            .then((res) => {
              let data = res.data;
              serviceProvider
                .serviceProviderForPutRequest(
                  process.env.REACT_APP_SERVER_URL + "crm-plugin/individuals",
                  data.individual.id,
                  postIndividualData
                )
                .then((res) => {
                  this.props.history.push({
                    pathname: "/users",
                    addData: true,
                  });
                });
            })
            .catch((error) => {});
        })
        .catch((error) => {
          if (
            error.response.data.message[0]["messages"][0]["id"] ===
            "Auth.form.error.username.taken"
          ) {
            this.state.errors.addPhone = [];
            this.state.errors.addPhone.push("");
            this.setState({
              formSubmitted: false,
              errorCode:
                "Phone number already exists, please use another phone number.",
            });
          }
          console.log(error);
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
    let loggedInUserRole = this.state.loggedInUserRole;
    let role = {};
    let roleName = "";
    if (this.state.values.role) {
      role = this.state.values.role;
      roleName = role.name;
    }
    let roleFilter = this.state.rolesList;
    let selectField = {};
    if (this.state.values.selectField) {
      selectField = this.state.values.selectField;
    }
    let roleWiseData = this.state.roleWiseData;

    return (
      <Layout
        breadcrumbs={
          this.state.editPage[0]
            ? EDIT_USERS_BREADCRUMBS
            : ADD_USERS_BREADCRUMBS
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
                title={this.state.editPage[0] ? "Edit user" : "Add user"}
                subheader={
                  this.state.editPage[0]
                    ? "You can edit user data here!"
                    : "You can add new user data here!"
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
                      label="Email"
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
                  <Grid item md={6} xs={12}>
                    <Input
                      fullWidth
                      label="Phone Number*"
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
                  {/* <Grid item md={6} xs={12}>
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
                </Grid> */}
                  <Grid item md={6} xs={12}>
                    <Input
                      variant="outlined"
                      id="standard-adornment-password"
                      name="password"
                      label="Password*"
                      error={this.hasError("password")}
                      helperText={
                        this.hasError("password")
                          ? this.state.errors.password[0]
                          : null
                      }
                      type={
                        this.state.values.showPassword ? "text" : "password"
                      }
                      value={this.state.values.password || ""}
                      onChange={this.handleChange}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={this.handleClickShowPassword}
                              onMouseDown={this.handleMouseDownPassword}
                            >
                              {this.state.values.showPassword ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    {/* </FormControl> */}
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
                          helperText={
                            this.hasError("role")
                              ? this.state.errors.role[0]
                              : null
                          }
                        />
                      )}
                    />
                  </Grid>
                  {((loggedInUserRole === "Sesta Admin" ||
                    loggedInUserRole === "Superadmin") &&
                    roleName === "FPO Admin") ||
                  ((loggedInUserRole === "Sesta Admin" ||
                    loggedInUserRole === "Superadmin") &&
                    roleName === "CSP (Community Service Provider)") ||
                  (loggedInUserRole === "FPO Admin" &&
                    roleName === "CSP (Community Service Provider)") ? (
                    <Grid item md={6} xs={12}>
                      <Autotext
                        id="select-field"
                        options={roleWiseData}
                        variant="outlined"
                        label={
                          roleName === "CSP (Community Service Provider)"
                            ? "Select Village Organization*"
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
                            ? roleWiseData[
                                roleWiseData.findIndex(function (item, i) {
                                  return item.id === selectField;
                                })
                              ] || null
                            : null
                        }
                        error={this.hasError("selectField")}
                        helperText={
                          this.hasError("selectField")
                            ? this.state.errors.selectField[0]
                            : null
                        }
                        renderInput={(params) => (
                          <Input
                            {...params}
                            fullWidth
                            label={
                              roleName === "CSP (Community Service Provider)"
                                ? "Select Village Organization*"
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
              </CardContent>
              <Divider />
              <CardActions style={{ padding: "15px" }}>
                <Button type="submit">Save</Button>
                <Button
                  color="secondary"
                  clicked={this.cancelForm}
                  component={Link}
                  to="/users"
                >
                  Cancel
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

export default UsersPage;
