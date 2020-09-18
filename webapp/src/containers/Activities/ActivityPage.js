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
  IconButton,
  Fab,
} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import { map } from "lodash";
import validateInput from "../../components/Validation/ValidateInput/ValidateInput";
import { ADD_ACTIVITY_BREADCRUMBS, EDIT_ACTIVITY_BREADCRUMBS } from "./config";
import { Link } from "react-router-dom";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import Autotext from "../../components/Autotext/Autotext";
import Datepicker from "../../components/UI/Datepicker/Datepicker.js";
import style from "./Activity.module.css";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import CancelIcon from "@material-ui/icons/Cancel";
import Spinner from "../../components/Spinner/Spinner";

class ActivityPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      UserRole: null,
      getActivitytype: [],
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
      selectedFile: null,
      fileDataArray: [],
      fileName: "",
      uploadedFile: "",
      isCancelFile: false,
      editPage: [
        this.props.match.params.id !== undefined ? true : false,
        this.props.match.params.id,
      ],
      isLoader: "",
    };
  }

  userdata = (userInfo) => {
    let Info = auth.getUserInfo();
    this.setState({ UserRole: Info.role.name });
  };

  async componentDidMount() {
    if (this.state.editPage[0]) {
      this.setState({ isLoader: true });
      let document;
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/activities/?id=" +
            this.state.editPage[1]
        )
        .then((res) => {
          if (res.data[0].document.length > 0) {
            document =
              res.data[0].document[0].name + res.data[0].document[0].ext;
          } else {
            document = "";
          }
          this.setState({
            values: {
              addTitle: res.data[0].title,
              addActivitytype: res.data[0].activitytype.id,
              addDescription: res.data[0].description,
              addStartDate: res.data[0].start_datetime,
            },
            fileName: document,
            uploadedFile: res.data[0].document[0],
            isLoader: false,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }

    // get activity types having is_active=true
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/activitytypes/?is_active=true&&autocreated=false&&_sort=name:asc"
      )
      .then((res) => {
        this.setState({ getActivitytype: res.data });
        this.userdata();
      })
      .catch((error) => {
        console.log(error);
      });

    // get contacts
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/contact/"
      )
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

  onSave = () => {
    this.validate();
    if (Object.keys(this.state.errors).length > 0) return;
    if (this.state.selectedFile !== null) {
      const formData = new FormData(); // Create an object of formData
      formData.append("files", this.state.selectedFile); // Update the formData object
      // Request made to the backend api & Send formData object
      serviceProvider
        .serviceProviderForPostRequest(
          process.env.REACT_APP_SERVER_URL + "upload",
          formData
        )
        .then((res) => {
          this.setState({ fileDataArray: res.data[0] });
          this.handleSubmit();
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      this.handleSubmit();
    }
  };

  handleSubmit = async (e) => {
    let activityTitle = this.state.values.addTitle;
    let activityType = this.state.values.addActivitytype;
    let activityDescription = this.state.values.addDescription;
    let activityContact = this.state.values.addcontact;
    let activityStartDate = new Date(
      this.state.values.addStartDate
    ).toISOString();

    let postData = {
      title: activityTitle,
      start_datetime: activityStartDate,
      description: activityDescription,
      activitytype: activityType,
      contacts: [activityContact],
      unit: 1,
    };

    if (this.state.uploadedFile && this.state.selectedFile === null) {
      postData["document"] = this.state.uploadedFile;
    } else if (this.state.uploadedFile && this.state.selectedFile) {
      postData["document"] = this.state.fileDataArray;
    } else if (
      this.state.uploadedFile === undefined &&
      this.state.selectedFile
    ) {
      postData["document"] = this.state.fileDataArray;
    }
    if (this.state.isCancelFile) {
      postData["document"] = "";
    }
    if (this.state.editPage[0]) {
      // for edit data page
      serviceProvider
        .serviceProviderForPutRequest(
          process.env.REACT_APP_SERVER_URL + "crm-plugin/activities",
          this.state.editPage[1],
          postData
        )
        .then((res) => {
          /** add logged in user's contact in activity assignee */
          let assigneeData = {
            contact: {
              id: auth.getUserInfo().contact.id,
            },
            activity: {
              id: res.data.id,
            },
          };
          serviceProvider
            .serviceProviderForPutRequest(
              process.env.REACT_APP_SERVER_URL + "crm-plugin/activityassignees",
              res.data.activityassignees[0].id,
              assigneeData
            )
            .then((res) => {
              this.setState({ formSubmitted: true });
              this.props.history.push({
                pathname: "/activities",
                editData: true,
              });
            })
            .catch((error) => {});
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
      serviceProvider
        .serviceProviderForPostRequest(
          process.env.REACT_APP_SERVER_URL + "crm-plugin/activities/",
          postData
        )
        .then((res) => {
          /** add logged in user's contact in activity assignee */
          let assigneeData = {
            contact: {
              id: auth.getUserInfo().contact.id,
            },
            activity: {
              id: res.data.id,
            },
          };
          serviceProvider
            .serviceProviderForPutRequest(
              process.env.REACT_APP_SERVER_URL + "crm-plugin/activityassignees",
              res.data.activityassignees[0].id,
              assigneeData
            )
            .then((res) => {
              this.setState({ formSubmitted: true });
              this.props.history.push({
                pathname: "/activities",
                addData: true,
              });
            })
            .catch((error) => {});
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

  cancelForm = () => {
    this.setState({
      values: {},
      formSubmitted: "",
      stateSelected: false,
    });
  };

  onChangeHandler = (event) => {
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0,
      fileName: event.target.files[0].name,
    });
  };

  cancelFile = (event) => {
    this.setState({ isCancelFile: true, fileName: "" });
  };

  render() {
    let activitytypeFilter = this.state.getActivitytype;
    let addActivitytype = this.state.values.addActivitytype;
    return (
      <Layout
        breadcrumbs={
          this.state.editPage[0]
            ? EDIT_ACTIVITY_BREADCRUMBS
            : ADD_ACTIVITY_BREADCRUMBS
        }
      >
        {!this.state.isLoader ? (
          <Card style={{ maxWidth: "45rem" }}>
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
                    label="Description*"
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
                  <Datepicker
                    label="Date*"
                    name="addStartDate"
                    error={this.hasError("addStartDate")}
                    helperText={
                      this.hasError("addStartDate")
                        ? this.state.errors.addStartDate[0]
                        : null
                    }
                    value={this.state.values.addStartDate || null}
                    format={"dd MMM yyyy"}
                    onChange={(value) =>
                      this.setState({
                        values: { ...this.state.values, addStartDate: value },
                      })
                    }
                  />
                </Grid>
                <Grid item md={9} xs={12}>
                  <TextField
                    id="outlined-multiline-static"
                    fullWidth
                    label="Status / Comments"
                    rows={10}
                    name="addDescription"
                    value={this.state.values.addDescription || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={12}>
                  <label htmlFor="upload-file">
                    <input
                      style={{ display: "none" }}
                      required
                      type="file"
                      name="upload-file"
                      id="upload-file"
                      onChange={this.onChangeHandler}
                    />
                    <Fab
                      color="primary"
                      size="medium"
                      component="span"
                      aria-label="add"
                      variant="extended"
                    >
                      <FileCopyIcon /> Upload Activity Document
                    </Fab>
                  </label>{" "}
                  <IconButton
                    aria-label="cancel"
                    color="secondary"
                    style={{ paddingLeft: "2px" }}
                  >
                    <CancelIcon onClick={this.cancelFile} />
                  </IconButton>
                  &nbsp;&nbsp;&nbsp;
                  {this.state.fileName !== "" ? (
                    <label style={{ color: "green", fontSize: "11px" }}>
                      Selected File: {this.state.fileName}
                    </label>
                  ) : (
                    <label style={{ color: "red", fontSize: "11px" }}>
                      No File Selected!
                    </label>
                  )}
                </Grid>
              </Grid>
            </CardContent>
            <Divider />
            <CardActions style={{ padding: "15px" }}>
              <Button type="submit" onClick={this.onSave.bind(this)}>
                Save
              </Button>
              <Button
                color="secondary"
                clicked={this.cancelForm}
                component={Link}
                to="/Activities"
              >
                cancel
              </Button>
            </CardActions>
          </Card>
        ) : (
          <Spinner />
        )}
      </Layout>
    );
  }
}
export default ActivityPage;
