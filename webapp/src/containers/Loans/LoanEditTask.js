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
import { EDIT_LOAN_TASK_BREADCRUMBS } from "./config";
import Input from "../../components/UI/Input/Input";
import Autotext from "../../components/Autotext/Autotext";
import * as constants from "../../constants/Constants";
import DateTimepicker from "../../components/UI/DateTimepicker/DateTimepicker.js";
import Button from "../../components/UI/Button/Button";
import { Link } from "react-router-dom";
import * as serviceProvider from "../../api/Axios";
import Moment from "moment";
import { map } from "lodash";
import validateInput from "../../components/Validation/ValidateInput/ValidateInput";
import auth from "../../components/Auth/Auth.js";

class LoanEditTask extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loanTaskStatus: constants.LOAN_TASK_STATUS,
      data: [],
      values: {},
      validations: {
        editStatus: {
          required: { value: "true", message: "Status field is required" },
        },
        editDate: {
          required: { value: "true", message: "Date field is required" },
        }
      },
      errors: {},
      formSubmitted: "",
      editPage: [
        this.props.match.params.id !== undefined ? true : false,
        this.props.match.params.id,
      ]
    }
  }

  async componentDidMount() {
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
        "loan-application-tasks/" +
        this.state.editPage[1]
      )
      .then((res) => {
        this.setState({
          values: {
            editStatus: res.data.status,
            editDate: res.data.date,
            comments: res.data.comments
          }
        })

      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleStatusChange(value) {
    if (value !== null) {
      this.setState({
        values: { ...this.state.values, editStatus: value.id },
      });
    } else {
      this.setState({
        values: {
          ...this.state.values,
          editStatus: "",
        },
      });
    }
  }

  handleChange = ({ target, e }) => {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value },
    });
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
    let loanTaskData = this.props.location.state.loantask;
    let loanAppId = loanTaskData.id;

    let status = this.state.values.editStatus;
    let editDate = this.state.values.editDate;
    let comments = this.state.values.comments;
    let postData = {
      status: status,
      date: editDate,
      comments: comments
    }

    serviceProvider
      .serviceProviderForPutRequest(
        process.env.REACT_APP_SERVER_URL + "loan-application-tasks",
        loanAppId,
        postData
      )
      .then((res) => {
        let updateActivityFlag;
        if (auth.getUserInfo().role.name === 'CSP (Community Service Provider)') {

          //get all activities
          serviceProvider
            .serviceProviderForGetRequest(
              process.env.REACT_APP_SERVER_URL + "crm-plugin/activities",
            )
            .then((resp) => {
              resp.data.map(fdata => {
                if (fdata.loan_application_task != null) {
                  if (fdata.loan_application_task.id == loanTaskData.id) {
                    updateActivityFlag = true;
                    delete fdata.contacts;
                    fdata.unit = 1;
                    fdata.contact = {
                      id: auth.getUserInfo().contact.id
                    }
                    fdata.description = loanTaskData.comments;
                    serviceProvider
                      .serviceProviderForPutRequest(
                        process.env.REACT_APP_SERVER_URL + "crm-plugin/activities",
                        fdata.id,
                        fdata
                      )
                      .then((activtyRes) => { });
                  }
                }
              })
              if (!updateActivityFlag && resp.data.length !== 0) {
                this.addActivity();
              }

              if (resp.data.length == 0) {
                this.addActivity();
              }
            })
        }
        this.setState({ formSubmitted: true });
        let app_id = res.data.loan_application["id"];
        this.props.history.push("/loan/update/" + app_id, {
          loanAppData: this.props.location.state.loanAppData,
          loanEditTaskPage: true
        });
      })
  }

  addActivity() {
    let loanTaskData = this.props.location.state.loantask;
    let loanAppId = this.props.location.state.loantask.id;

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/activitytypes",
      )
      .then((activityTypeResp) => {
        activityTypeResp.data.map(type => {
          if (type.name == loanTaskData.name) {
            let activityTypeId = type.id;
            let activitiyData = {
              title: this.props.location.state.loanAppData.contact.name + ": " + loanTaskData.name,
              start_datetime: this.state.values.editDate,
              end_datetime: this.state.values.editDate,
              unit: 1,
              description: loanTaskData.comments,
              activitytype: {
                id: activityTypeId,
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
                  .then((assigneeResp) => { })
              })
          }
        })
      })
  }

  cancelForm = () => {
    this.setState({
      values: {},
      formSubmitted: "",
      isCancel: true,
    });
    this.componentDidMount();
    this.props.history.push(this.props.history.goBack(), { loantask: this.props.location.state.loantask });
    //routing code #route to loan_application_list page
  };

  render() {
    const { classes } = this.props;
    let loanTaskStatus = constants.LOAN_TASK_STATUS;
    let statusValue = this.state.values.editStatus;

    return (
      <Layout
        breadcrumbs={
          EDIT_LOAN_TASK_BREADCRUMBS
        }
      >
        <Card>
          <form
            autoComplete="off"
            noValidate
            onSubmit={this.handleSubmit}
            method="post">
            <CardHeader
              title={"Edit Loan task"}
              subheader={
                "You can edit loan task here!"
              }
            />
            <Divider />

            <CardContent>
              <Grid container spacing={3}>
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
                    value={
                      statusValue
                        ? this.state.loanTaskStatus[
                        this.state.loanTaskStatus.findIndex(function (
                          item,
                          i
                        ) {
                          return item.id === statusValue;
                        })
                        ] || null
                        : null
                    }
                    error={this.hasError("editStatus")}
                    helperText={
                      this.hasError("editStatus")
                        ? this.state.errors.editStatus[0]
                        : null
                    }
                    renderInput={(params) => (
                      <Input
                        fullWidth
                        label="Select Status*"
                        name="editStatus"
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>

                <Grid item md={6} xs={12}>
                  <DateTimepicker
                    label="Date*"
                    name="editDate"
                    error={this.hasError("editDate")}
                    helperText={
                      this.hasError("editDate")
                        ? this.state.errors.editDate[0]
                        : null
                    }
                    value={this.state.values.editDate || ""}
                    // format={"dd MMM yyyy"}
                    onChange={(value) =>
                      this.setState({
                        values: { ...this.state.values, editDate: value }
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

export default LoanEditTask;
