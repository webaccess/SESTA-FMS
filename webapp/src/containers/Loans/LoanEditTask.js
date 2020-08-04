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

class LoanEditTask extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loanTaskStatus: constants.LOAN_TASK_STATUS,
      data: [],
      values: {},
      loantask: {},
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

    if (this.state.values) {
      loanTaskData.status = this.state.values.editStatus ? this.state.values.editStatus : loanTaskData.status;
      loanTaskData.date = this.state.values.editDate ? Moment(this.state.values.editDate).format('YYYY-MM-DD') : loanTaskData.date;
      loanTaskData.comments = this.state.values.comments ? this.state.values.comments : loanTaskData.comments;
    }

    serviceProvider
      .serviceProviderForPutRequest(
        process.env.REACT_APP_SERVER_URL + "loan-application-tasks",
        loanAppId,
        loanTaskData
      )
      .then((res) => {
        this.setState({ loantask: res.data });
        this.setState({ formSubmitted: true });
        this.props.history.push(this.props.history.goBack(), { loantask: res.data });
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
    let loantask = this.state.loantask;
    if (this.props.location.state && this.props.location.state.loantask) {
      loantask = this.props.location.state.loantask;
    }
    let defaultStatus;
    loanTaskStatus.map(status => {
      if (status.id == loantask.status) {
        defaultStatus = status;
      }
    });
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
                    value={this.state.values.editDate ? this.state.values.editDate : loantask.date}
                    format={"dd MMM yyyy"}
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
                    value={this.state.values.comments ? this.state.values.comments : loantask.comments}
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
