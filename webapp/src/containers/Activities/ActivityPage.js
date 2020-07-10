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
import TextField from "@material-ui/core/TextField";
import { map } from "lodash";
import validateInput from "../../components/Validation/ValidateInput/ValidateInput";
import { ADD_ACTIVITY_BREADCRUMBS, EDIT_ACTIVITY_BREADCRUMBS } from "./config";
import { Link } from "react-router-dom";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import Autotext from "../../components/Autotext/Autotext";
import DateTimepicker from "../../components/UI/DateTimepicker/DateTimepicker.js";

class ActivityPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      UserRole: null,
      DateTimepickerError: null,
      getActivitytype: [],
      getcontact: [],
      validations: {
        addTitle: {
          required: { value: "true", message: "Action name field is required" },
        },
        addStartDate: {
          required: {
            value: "true",
            message: "Start Date/Time field is required",
          },
        },
        addActivitytype: {
          required: {
            value: "true",
            message: "Activity type field is required",
          },
        },
      },
      errors: {
        addTitle: [],
        addStartDate: [],
        addActivitytype: [],
      },
      serverErrors: {},
      formSubmitted: "",
      errorCode: "",
      editPage: [
        this.props.match.params.id !== undefined ? true : false,
        this.props.match.params.id,
      ],
    };
  }

  userdata = (userInfo) => {
    let Info = auth.getUserInfo();
    this.setState({ UserRole: Info.role.name });
  };

  async componentDidMount() {
    if (this.state.editPage[0]) {
      await axios
        .get(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/activities/?id=" +
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
              addTitle: res.data[0].title,
              addActivitytype: res.data[0].activitytype.id,
              addDescription: res.data[0].description,
              addStartDate: res.data[0].start_datetime,
              addEndDate: res.data[0].end_datetime,
            },
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }

    // get activity types having is_active=true
    await axios
      .get(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/activitytypes/?is_active=true",
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + "",
          },
        }
      )
      .then((res) => {
        this.setState({ getActivitytype: res.data });
        this.userdata();
      })
      .catch((error) => {
        console.log(error);
      });

    // get contacts
    await axios
      .get(process.env.REACT_APP_SERVER_URL + "crm-plugin/contacts/", {
        headers: {
          Authorization: "Bearer " + auth.getToken() + "",
        },
      })
      .then((res) => {
        this.setState({ getcontact: res.data });
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

  handleAutocompleteChange(event, value) {
    if (value !== null) {
      this.setState({
        values: { ...this.state.values, addActivitytype: value.id },
      });
    } else {
      this.setState({
        values: {
          ...this.state.values,
          addActivitytype: [],
        },
      });
    }
  }

  handleContactChange(event, value) {
    if (value !== null) {
      this.setState({
        values: { ...this.state.values, addcontact: value.id },
      });
    } else {
      this.setState({
        values: {
          ...this.state.values,
          addcontact: [],
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

  handleSubmit = async (e) => {
    e.preventDefault();
    this.validate();
    this.setState({ formSubmitted: "" });

    if (Object.keys(this.state.errors).length > 0) return;
    let activityTitle = this.state.values.addTitle;
    let activityType = this.state.values.addActivitytype;
    let activityDescription = this.state.values.addDescription;
    let activityContact = this.state.values.addcontact;
    let activityStartDate = new Date(
      this.state.values.addStartDate
    ).toISOString();
    let activityEndDate = null;
    if (this.state.values.addEndDate != null) {
      activityEndDate = new Date(this.state.values.addEndDate).toISOString();
    }
    let startDate = this.state.values.addStartDate;
    let endDate = this.state.values.addEndDate;
    if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
      this.setState({ DateTimepickerError: true });
    } else {
      this.setState({ DateTimepickerError: false });
      if (this.state.editPage[0]) {
        // for edit data page
        await axios
          .put(
            process.env.REACT_APP_SERVER_URL +
              "crm-plugin/activities/" +
              this.state.editPage[1],
            {
              title: activityTitle,
              start_datetime: activityStartDate,
              end_datetime: activityEndDate,
              description: activityDescription,
              activitytype: activityType,
              contacts: [activityContact],
            },
            {
              headers: {
                Authorization: "Bearer " + auth.getToken() + "",
              },
            }
          )
          .then((res) => {
            this.setState({ formSubmitted: true });
            this.props.history.push({
              pathname: "/activities",
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
        //for add data page
        await axios
          .post(
            process.env.REACT_APP_SERVER_URL + "crm-plugin/activities/",

            {
              title: activityTitle,
              start_datetime: activityStartDate,
              end_datetime: activityEndDate,
              description: activityDescription,
              activitytype: activityType,
              contacts: [activityContact],
            },
            {
              headers: {
                Authorization: "Bearer " + auth.getToken() + "",
              },
            }
          )
          .then((res) => {
            this.setState({ formSubmitted: true });

            this.props.history.push({ pathname: "/activities", addData: true });
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
    }
  };

  cancelForm = () => {
    this.setState({
      values: {},
      formSubmitted: "",
      stateSelected: false,
    });
  };

  render() {
    let contactFilter = this.state.getcontact;
    let activitytypeFilter = this.state.getActivitytype;
    let addcontact = this.state.values.addcontact;
    let addActivitytype = this.state.values.addActivitytype;
    return (
      <Layout
        breadcrumbs={
          this.state.editPage[0]
            ? EDIT_ACTIVITY_BREADCRUMBS
            : ADD_ACTIVITY_BREADCRUMBS
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
              title={this.state.editPage[0] ? "Edit Activity" : "Add Activity"}
              subheader={
                this.state.editPage[0]
                  ? "You can edit activity data here!"
                  : "You can add new activity data here!"
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
                  {this.state.DateTimepickerError === true ? (
                    <Snackbar severity="error" Showbutton={false}>
                      "Start Date Cannot be Greater than End Date"
                    </Snackbar>
                  ) : null}
                </Grid>
                <Grid item md={6} xs={12}>
                  <Autotext
                    id="combo-box-demo"
                    options={activitytypeFilter}
                    variant="outlined"
                    label="Select Activity Type*"
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => {
                      this.handleAutocompleteChange(event, value);
                    }}
                    defaultValue={[]}
                    value={
                      addActivitytype
                        ? activitytypeFilter[
                            activitytypeFilter.findIndex(function (item, i) {
                              return item.id === addActivitytype;
                            })
                          ] || null
                        : null
                    }
                    error={this.hasError("addActivitytype")}
                    helperText={
                      this.hasError("addActivitytype")
                        ? this.state.errors.addActivitytype[0]
                        : null
                    }
                    renderInput={(params) => (
                      <Input
                        fullWidth
                        label="Select Activity Type*"
                        name="addActivitytype"
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Activity Title*"
                    name="addTitle"
                    error={this.hasError("addTitle")}
                    helperText={
                      this.hasError("addTitle")
                        ? this.state.errors.addTitle[0]
                        : null
                    }
                    value={this.state.values.addTitle || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={3} xs={12}>
                  <DateTimepicker
                    label="Start Date/Time*"
                    name="addStartDate"
                    error={this.hasError("addStartDate")}
                    helperText={
                      this.hasError("addStartDate")
                        ? this.state.errors.addStartDate[0]
                        : null
                    }
                    value={this.state.values.addStartDate || null}
                    onChange={(value) =>
                      this.setState({
                        values: { ...this.state.values, addStartDate: value },
                      })
                    }
                  />
                </Grid>
                <Grid item md={3} xs={12}>
                  <DateTimepicker
                    label="End Date/Time"
                    name="addEndDate"
                    value={this.state.values.addEndDate}
                    onChange={(value) =>
                      this.setState({
                        values: { ...this.state.values, addEndDate: value },
                      })
                    }
                  />
                </Grid>
                {this.state.UserRole === "FPO Admin" ? (
                  <Grid item md={6} xs={12}>
                    <Autotext
                      id="combo-box-demo"
                      options={contactFilter}
                      variant="outlined"
                      label="Contact"
                      getOptionLabel={(option) => option.name}
                      onChange={(event, value) => {
                        this.handleContactChange(event, value);
                      }}
                      defaultValue={[]}
                      value={
                        addcontact
                          ? contactFilter[
                              contactFilter.findIndex(function (item, i) {
                                return item.id === addcontact;
                              })
                            ] || null
                          : null
                      }
                      renderInput={(params) => (
                        <Input
                          fullWidth
                          label="Contact"
                          name="addcontact"
                          variant="outlined"
                        />
                      )}
                    />
                  </Grid>
                ) : null}
                <Grid item md={12} xs={12}>
                  <TextField
                    id="outlined-multiline-static"
                    fullWidth
                    label="Status / Comments"
                    multiline
                    rows={10}
                    name="addDescription"
                    value={this.state.values.addDescription || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </CardContent>
            <Divider />
            <CardActions>
              <Button type="submit">Save</Button>
              <Button
                color="secondary"
                clicked={this.cancelForm}
                component={Link}
                to="/Activities"
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
