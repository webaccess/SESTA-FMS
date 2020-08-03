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

import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { EDIT_LOAN_EMI_BREADCRUMBS } from "./config";
import Snackbar from "../../components/UI/Snackbar/Snackbar";

class LoanEditEmiPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      validations: {
        actual_principal: {
          required: {
            value: "true",
            message: "Principal Paid field is required",
          },
        },
        actual_interest: {
          required: {
            value: "true",
            message: "Interest Paid field is required",
          },
        },
        fine: {},
      },
      errors: {
        actual_principal: [],
        actual_interest: [],
        fine: [],
      },
      serverErrors: {},
      formSubmitted: "",
      errorCode: "",
      countrySelected: false,
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
            "loan-application-installments/" +
            this.state.editPage[1]
        )
        .then((res) => {
          this.setState({
            values: {
              actual_principal: res.data.actual_principal,
              actual_interest: res.data.actual_interest,
              fine: res.data.fine,
            },
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
    this.countryIds = this.state.values.actual_principal;
  }

  handleChange = ({ target, event }) => {
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
    let actual_principal = this.state.values.actual_principal;
    let actual_interest = this.state.values.actual_interest;
    let fine = this.state.values.fine;

    let postData = {
      actual_principal: actual_principal,
      actual_interest: actual_interest,
      fine: fine,
    };
    if (this.state.editPage[0]) {
      // Code for Edit Data Page
      serviceProvider
        .serviceProviderForPutRequest(
          process.env.REACT_APP_SERVER_URL + "loan-application-installments",
          this.state.editPage[1],
          postData
        )
        .then((res) => {
          this.setState({ formSubmitted: true });
          let app_id = res.data.loan_application["id"];
          // this.props.history.push({
          //   pathname: "/loans/emi/" + app_id,
          //   {loanAppData: res.data.loan_application}
          // });
          this.props.history.push("/loans/emi/" + app_id, {
            loanAppData: res.data.loan_application,
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
          process.env.REACT_APP_SERVER_URL + "crm-plugin/countries/",
          postData
        )
        .then((res) => {
          this.setState({ formSubmitted: true });
          this.props.history.push({ pathname: "/countries", addData: true });
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
      countrySelected: false,
    });
  };

  render() {
    return (
      <Layout breadcrumbs={EDIT_LOAN_EMI_BREADCRUMBS}>
        <Card>
          <form
            autoComplete="off"
            noValidate
            onSubmit={this.handleSubmit}
            method="post"
          >
            <CardHeader
              title={"Edit EMI Installments"}
              subheader={"You can edit EMI Installments here"}
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
                <Grid item xs={12}>
                  <Input
                    fullWidth
                    label="Principal Paid*"
                    name="actual_principal"
                    error={this.hasError("actual_principal")}
                    helperText={
                      this.hasError("actual_principal")
                        ? this.state.errors.actual_principal[0]
                        : null
                    }
                    value={this.state.values.actual_principal || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Interest Paid*"
                    name="actual_interest"
                    error={this.hasError("actual_interest")}
                    helperText={
                      this.hasError("actual_interest")
                        ? this.state.errors.actual_interest[0]
                        : null
                    }
                    value={this.state.values.actual_interest || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Fine"
                    type="number"
                    name="fine"
                    error={this.hasError("fine")}
                    helperText={
                      this.hasError("fine") ? this.state.errors.fine[0] : null
                    }
                    value={this.state.values.fine || ""}
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
                to="/countries"
              >
                Cancel
              </Button>
            </CardActions>
          </form>
        </Card>
      </Layout>
    );
  }
}

export default LoanEditEmiPage;
