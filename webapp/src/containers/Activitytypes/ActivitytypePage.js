import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import * as serviceProvider from "../../api/Axios";
import * as constants from "../../constants/Constants";

import auth from "../../components/Auth/Auth";
import Button from "../../components/UI/Button/Button";
import Input from "../../components/UI/Input/Input";
import Autotext from "../../components/Autotext/Autotext.js";
import Checkbox from "@material-ui/core/Checkbox";
import { MenuItem, TextField } from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
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
  ADD_ACTIVITYTYPE_BREADCRUMBS,
  EDIT_ACTIVITYTYPE_BREADCRUMBS,
} from "./config";
import { Link } from "react-router-dom";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import Spinner from "../../components/Spinner/Spinner";

class ActivitytypePage extends Component {
  constructor(props) {
    super(props);
    let userInfo = auth.getUserInfo();
    let validateFpo;
    if (
      userInfo.role.name == "Sesta Admin" ||
      userInfo.role.name == "Superadmin"
    ) {
      validateFpo = {
        required: {
          value: true,
          message: "FPO is required",
        },
      };
    }
    this.state = {
      remNotation: constants.REMUNERATION_NOTATION,
      values: {},
      getFPO: [],
      addIsActive: false,
      isActTypePresent: false,
      validations: {
        addActivitytype: {
          required: {
            value: "true",
            message: "Activity type name is required",
          },
        },
        addRemuneration: {
          required: {
            value: "true",
            message: "Remuneration is required",
          },
        },
        selectedNotation: {
          required: {
            value: "true",
            message: "Notation is required",
          },
        },
        addFpo: validateFpo,
      },
      errors: {
        addFpo: [],
        selectedNotation: [],
      },
      serverErrors: {},
      formSubmitted: "",
      errorCode: "",
      activitytypeSelected: false,
      editPage: [
        this.props.match.params.id !== undefined ? true : false,
        this.props.match.params.id,
      ],
      assignedFPO: "",
      loggedInUserRole: auth.getUserInfo().role.name,
      isLoader: "",
    };
  }

  async componentDidMount() {
    if (this.state.editPage[0]) {
      this.setState({ isLoader: true });
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/activitytypes/" +
            this.state.editPage[1]
        )
        .then((res) => {
          this.setState({
            values: {
              addActivitytype: res.data.name,
              addRemuneration: res.data.remuneration,
              selectedNotation: res.data.notation,
              // isLoader: false
            },
          });

          // disable active field if activity type is in use
          serviceProvider
            .serviceProviderForGetRequest(
              process.env.REACT_APP_SERVER_URL +
                "crm-plugin/activities/?activitytype.id=" +
                this.state.editPage[1]
            )
            .then((typeRes) => {
              if (typeRes.data.length > 0) {
                this.setState({
                  isActTypePresent: true,
                  addIsActive: res.data.is_active,
                  // isLoader: false
                });
              } else {
                this.setState({
                  isActTypePresent: false,
                  addIsActive: res.data.is_active,
                  // isLoader: false
                });
              }
            })
            .catch((error) => {});

          if (res.data.contact[0]) {
            let tempValues = this.state.values;
            tempValues["addFpo"] = res.data.contact[0].id;
            this.setState({
              values: tempValues,
            });
          }
          this.setState({ isLoader: false });
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

  handleChange = ({ target, event }) => {
    this.setState({
      values: {
        ...this.state.values,
        [target.name]: target.value,
      },
    });
  };

  handleFpoChange(event, value) {
    if (value !== null) {
      let newVal = value;
      this.setState({
        values: { ...this.state.values, addFpo: value.id },
      });
    } else {
      this.setState({
        values: {
          ...this.state.values,
          addFpo: "",
        },
      });
    }
  }

  handleNotationChange = (event, value) => {
    if (value.props !== null) {
      this.setState({
        values: { ...this.state.values, selectedNotation: value.props.value },
      });
    } else {
      this.setState({
        values: {
          ...this.state.values,
          selectedNotation: "",
        },
      });
    }
  };

  validate = () => {
    const values = this.state.values;
    const validations = this.state.validations;
    map(validations, (validation, key) => {
      let value = values[key] ? values[key] : "";
      const errors = validateInput(value, validation);
      let errorset = this.state.errors;
      if (errors.length > 0) {
        errorset[key] = errors;
      } else {
        delete errorset[key];
      }
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

  handleSubmit = async (e) => {
    e.preventDefault();
    this.validate();
    this.setState({ formSubmitted: "" });
    let activitytypeName = this.state.values.addActivitytype;
    let IsActive = this.state.addIsActive;
    let remunerate = this.state.values.addRemuneration;
    let notation = this.state.values.selectedNotation;
    let formData = {
      name: activitytypeName,
      remuneration: remunerate,
      is_active: IsActive,
      autocreated: false,
      notation: notation,
    };
    /** save fpo selected from the drop down if roles are sesta admin & superadmin
     * save FPO belongs to logged in user if role is FPO admin
     */
    if (
      this.state.loggedInUserRole === "Sesta Admin" ||
      this.state.loggedInUserRole === "Superadmin"
    ) {
      Object.assign(formData, {
        contact: this.state.values.addFpo,
      });
    } else {
      Object.assign(formData, {
        contact: this.state.assignedFPO,
      });
    }

    if (Object.keys(this.state.errors).length > 0) return;
    if (this.state.editPage[0]) {
      // Code for Edit Data Page
      serviceProvider
        .serviceProviderForPutRequest(
          process.env.REACT_APP_SERVER_URL + "crm-plugin/activitytypes",
          this.state.editPage[1],
          formData
        )
        .then((res) => {
          this.setState({ formSubmitted: true });
          this.props.history.push({
            pathname: "/activitytypes",
            editData: true,
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
          console.log(error);
        });
    } else {
      //Code for Add Data Page
      serviceProvider
        .serviceProviderForPostRequest(
          process.env.REACT_APP_SERVER_URL + "crm-plugin/activitytypes/",
          formData
        )
        .then((res) => {
          this.setState({ formSubmitted: true });
          this.props.history.push({
            pathname: "/activitytypes",
            addData: true,
          });
          this.handleActive();
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

  handleCheckBox = (event) => {
    this.setState({ [event.target.name]: event.target.checked });
  };

  cancelForm = () => {
    this.setState({
      values: {},
      formSubmitted: "",
      activitytypeSelected: false,
    });
    // Routing code #route to activitytype_list page
  };

  render() {
    let fposFilter = this.state.getFPO;
    let addFpo = this.state.values.addFpo;
    let selectedNotation = this.state.values.selectedNotation;
    const userInfo = auth.getUserInfo();
    let isCancel = this.state.isCancel;
    let checked = this.state.checkedB;
    return (
      <Layout
        breadcrumbs={
          this.state.editPage[0]
            ? EDIT_ACTIVITYTYPE_BREADCRUMBS
            : ADD_ACTIVITYTYPE_BREADCRUMBS
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
                    ? "Edit Activity Type"
                    : "Add Activity Type"
                }
                subheader={
                  this.state.editPage[0]
                    ? "You can edit activity type data here!"
                    : "You can add new activity type data here!"
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
                    <Input
                      fullWidth
                      label="Name*"
                      name="addActivitytype"
                      error={this.hasError("addActivitytype")}
                      helperText={
                        this.hasError("addActivitytype")
                          ? this.state.errors.addActivitytype[0]
                          : null
                      }
                      value={this.state.values.addActivitytype || ""}
                      onChange={this.handleChange}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item md={6} xs={12}>
                    <Input
                      fullWidth
                      label="Remuneration*"
                      type="number"
                      name="addRemuneration"
                      error={this.hasError("addRemuneration")}
                      helperText={
                        this.hasError("addRemuneration")
                          ? this.state.errors.addRemuneration[0]
                          : null
                      }
                      value={this.state.values.addRemuneration || ""}
                      onChange={this.handleChange}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item md={6} xs={12}>
                    <TextField
                      fullWidth
                      id="outlined-select-currency"
                      select
                      label="Notation*"
                      error={this.hasError("selectedNotation")}
                      helperText={
                        this.hasError("selectedNotation")
                          ? this.state.errors.selectedNotation[0]
                          : selectedNotation === "Flat"
                          ? "Amount stored in rupees"
                          : null
                      }
                      value={selectedNotation || ""}
                      onChange={(event, value) => {
                        this.handleNotationChange(event, value);
                      }}
                      variant="outlined"
                    >
                      3
                      {this.state.remNotation.map((option) => (
                        <MenuItem key={option.id} value={option.name}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {this.state.loggedInUserRole === "Sesta Admin" ||
                  this.state.loggedInUserRole === "Superadmin" ? (
                    <Grid item md={12} xs={12}>
                      <Autotext
                        id="combo-box-demo"
                        options={fposFilter}
                        variant="outlined"
                        label="FPO"
                        getOptionLabel={(option) => option.name}
                        onChange={(event, value) => {
                          this.handleFpoChange(event, value);
                        }}
                        value={
                          addFpo
                            ? this.state.isCancel === true
                              ? null
                              : fposFilter[
                                  fposFilter.findIndex(function (item, i) {
                                    return item.id === addFpo;
                                  })
                                ] || null
                            : null
                        }
                        error={this.hasError("addFpo")}
                        helperText={
                          this.hasError("addFpo")
                            ? this.state.errors.addFpo[0]
                            : null
                        }
                        renderInput={(params) => (
                          <Input
                            fullWidth
                            label="FPO*"
                            name="addFpo"
                            variant="outlined"
                          />
                        )}
                      />
                    </Grid>
                  ) : null}

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={this.state.addIsActive}
                          onChange={this.handleCheckBox}
                          name="addIsActive"
                          color="primary"
                          disabled={this.state.isActTypePresent ? true : false}
                        />
                      }
                      label="Active"
                    />
                  </Grid>
                </Grid>
              </CardContent>
              <Divider />
              <CardActions style={{ padding: "15px" }}>
                <Button type="submit">Save</Button>
                <Button
                  color="secondary"
                  clicked={this.cancelForm}
                  component={Link}
                  to="/activitytypes"
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

export default ActivitytypePage;
