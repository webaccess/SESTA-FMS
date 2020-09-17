import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Grid,
} from "@material-ui/core";
import { ADD_LOAN_TASK_BREADCRUMBS } from "./config";
import * as constants from "../../constants/Constants";
import * as serviceProvider from "../../api/Axios";
import Input from "../../components/UI/Input/Input";
import Autotext from "../../components/Autotext/Autotext";
import Datepicker from "../../components/UI/Datepicker/Datepicker.js";
import Button from "../../components/UI/Button/Button";
import { map } from "lodash";
import validateInput from "../../components/Validation/ValidateInput/ValidateInput";
import auth from "../../components/Auth/Auth.js";

class AddLoanTask extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loanTaskStatus: constants.LOAN_TASK_STATUS,
      activitytypes: [],
      values: {},
      validations: {
        addTask: {
          required: { value: "true", message: "Task field is required" },
        },
        addStatus: {
          required: { value: "true", message: "Status field is required" },
        },
        addDate: {
          required: { value: "true", message: "Date field is required" },
        }
      },
      errors: {},
      formSubmitted: "",
    }
  }

  async componentDidMount() {
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/activitytypes/?_sort=name:asc"
      )
      .then((res) => {
        this.setState({ activitytypes: res.data });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleTaskChange(value) {
    if (value !== null) {
      this.setState({
        values: { ...this.state.values, addTask: value.name, typeId: value.id },
      });
    } else {
      this.setState({
        values: {
          ...this.state.values,
          addTask: "",
        }
      });
    }
  }

  handleStatusChange(value) {
    if (value !== null) {
      this.setState({
        values: { ...this.state.values, addStatus: value.id },
      });
    } else {
      this.setState({
        values: {
          ...this.state.values,
          addStatus: "",
        },
      });
    }
  }

  handleChange = ({ target, e }) => {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value },
    });
  };

  cancelForm = () => {
    this.setState({
      values: {},
      formSubmitted: "",
      isCancel: true,
    });
    this.componentDidMount();
    this.props.history.push(this.props.history.goBack());
    //routing code #route to loan_application_list page
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.validate();
    this.setState({ formSubmitted: "" });
    if (Object.keys(this.state.errors).length > 0) return;

    let loanAppliactionId = this.props.location.state.loanAppData.id;
    let postData = {
      name: this.state.values.addTask,
      status: this.state.values.addStatus,
      date: this.state.values.addDate,
      comments: this.state.values.comments,
      loan_application: loanAppliactionId
    }
    serviceProvider
      .serviceProviderForPostRequest(
        process.env.REACT_APP_SERVER_URL + "loan-application-tasks",
        postData
      )
      .then((res) => {
        // add activity
        let loanAppId = res.data.id;
        let activitiyData = {
          title: this.props.location.state.loanAppData.contact.name + ": " + this.state.values.addTask,
          start_datetime: this.state.values.addDate,
          end_datetime: this.state.values.addDate,
          unit: 1,
          description: this.state.values.comments,
          activitytype: {
            id: this.state.values.typeId,
          },
          loan_application_task: {
            id: loanAppId
          }
        }

        serviceProvider
          .serviceProviderForPostRequest(
            process.env.REACT_APP_SERVER_URL + "crm-plugin/activities",
            activitiyData
          )
          .then((resp) => {
            let cid = resp.data.id;
            // add activityassingnees
            let activityassignee = {
              contact: {
                id: auth.getUserInfo().contact.id
              },
              activity: {
                id: cid
              }
            }
            serviceProvider
              .serviceProviderForPostRequest(
                process.env.REACT_APP_SERVER_URL + "crm-plugin/activityassignees",
                activityassignee
              )
              .then((assigneeResp) => {
                this.setState({ formSubmitted: true });
                let app_id = res.data.loan_application["id"];
                this.props.history.push("/loan/update/" + app_id, {
                  loanAppData: this.props.location.state.loanAppData,
                  loanTaskAddPage: true
                });
              })
          })
      })
      .catch((error) => {
        console.log(error);
      })
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

  render() {
    const { classes } = this.props;
    let loanTaskStatus = constants.LOAN_TASK_STATUS;
    let activitytypes = this.state.activitytypes;

    return (
      <Layout breadcrumbs={ADD_LOAN_TASK_BREADCRUMBS}>
        <Card>
          <form
            autoComplete="off"
            noValidate
            onSubmit={this.handleSubmit}
            method="POST">
            <CardHeader
              title={"Add Loan task"}
              subheader={
                "You can add loan task here!"
              }
            />
            <Divider />

            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={6} xs={12}>
                  <Autotext
                    id="combo-box-demo"
                    options={activitytypes}
                    variant="outlined"
                    label="Select Task*"
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => {
                      this.handleTaskChange(value);
                    }}
                    error={this.hasError("addTask")}
                    helperText={
                      this.hasError("addTask")
                        ? this.state.errors.addTask[0]
                        : null
                    }
                    renderInput={(params) => (
                      <Input
                        fullWidth
                        label="Select Task*"
                        name="addTask"
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Autotext
                    id="combo-box-demo"
                    options={loanTaskStatus}
                    variant="outlined"
                    label="Select Status*"
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => {
                      this.handleStatusChange(value);
                    }}
                    error={this.hasError("addStatus")}
                    helperText={
                      this.hasError("addStatus")
                        ? this.state.errors.addStatus[0]
                        : null
                    }
                    renderInput={(params) => (
                      <Input
                        fullWidth
                        label="Select Status*"
                        name="addStatus"
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>

                <Grid item md={3} xs={12}>
                  <Datepicker
                    label="Date*"
                    name="addDate"
                    error={this.hasError("addDate")}
                    helperText={
                      this.hasError("addDate")
                        ? this.state.errors.addDate[0]
                        : null
                    }
                    value={this.state.values.addDate || ""}
                    format={"dd MMM yyyy"}
                    onChange={(value) =>
                      this.setState({
                        values: { ...this.state.values, addDate: value }
                      })
                    }
                  />
                </Grid>

                <Grid item md={9} xs={12}>
                  <Input
                    fullWidth
                    label="Comments"
                    name="comments"
                    value={this.state.values.comments || ""}
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
              >
                cancel
              </Button>
            </CardActions>
          </form>
        </Card>
      </Layout>
    )
  }
}
export default AddLoanTask;