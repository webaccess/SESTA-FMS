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
import { EDIT_LOAN_EMI_BREADCRUMBS } from "./config";
import Input from "../../components/UI/Input/Input";
import DateTimepicker from "../../components/UI/DateTimepicker/DateTimepicker.js";
import Button from "../../components/UI/Button/Button";
import { Link } from "react-router-dom";
import * as serviceProvider from "../../api/Axios";
import Moment from "moment";
import { map } from "lodash";
import validateInput from "../../components/Validation/ValidateInput/ValidateInput";

class LoanEditEmiPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loanEmiData: {},
      editPage: [
        this.props.match.params.id !== undefined ? true : false,
        this.props.match.params.id,
      ],
      values: {},
      validations: {
        actual_payment_date: {
          required: { value: "true", message: "Payment Date field is required" },
        },
        actual_principal: {
          required: { value: "true", message: "Principal Paid field is required" },
        },
        actual_interest: {
          required: { value: "true", message: "Interest Paid field is required" },
        },
        fine: {}
      },
      errors: {},
    }
  }

  async componentDidMount() {
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
        "loan-application-installments/?id=" + this.state.editPage[1] + "&&_sort=id:ASC"
      )
      .then((res) => {
        this.setState({
          values: {
            actual_payment_date: res.data.actual_payment_date,
            actual_principal: res.data.actual_principal,
            actual_interest: res.data.actual_interest,
            fine: res.data.fine
          }
        });
      })
      .catch((error) => {
        console.log(error);
      });
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
    let loanEmiData = this.props.location.state.loanEmiData;
    let loanEmiId = loanEmiData.id;

    if (this.state.values) {
      loanEmiData.actual_payment_date = this.state.values.actual_payment_date ? Moment(this.state.values.actual_payment_date).format('YYYY-MM-DD') : loanEmiData.actual_payment_date;
      loanEmiData.actual_principal = this.state.values.actual_principal ? this.state.values.actual_principal : loanEmiData.actual_principal;
      loanEmiData.actual_interest = this.state.values.actual_interest ? this.state.values.actual_interest : loanEmiData.actual_interest;
      loanEmiData.fine = this.state.values.fine ? this.state.values.fine : loanEmiData.fine;
    }
    serviceProvider
      .serviceProviderForPutRequest(
        process.env.REACT_APP_SERVER_URL + "loan-application-installments",
        loanEmiId,
        loanEmiData
      )
      .then((res) => {
        this.setState({ loanEmiData: res.data });
        let app_id = res.data.loan_application["id"];
        this.props.history.push("/loans/emi/" + app_id, {
          loanAppData: this.props.location.state.loanAppData,
          loanEditEmiPage: true
        });
      })
  }

  cancelForm = () => {
    this.setState({
      values: {},
      formSubmitted: "",
      isCancel: true,
    });
    this.componentDidMount();
    this.props.history.push(this.props.history.goBack(), { loanEmiData: this.state.loanEmiData });
    //routing code #route to loan_application_list page
  };

  render() {
    const { classes } = this.props;
    let loanEmiData = this.state.loanEmiData;
    if (this.props.location.state && this.props.location.state.loanEmiData) {
      loanEmiData = this.props.location.state.loanEmiData;
    }

    this.state.values.actual_principal = this.state.values.actual_principal ? this.state.values.actual_principal : loanEmiData.actual_principal;
    this.state.values.actual_interest = this.state.values.actual_interest ? this.state.values.actual_interest : loanEmiData.actual_interest;
    this.state.values.actual_payment_date = this.state.values.actual_payment_date ? this.state.values.actual_payment_date : loanEmiData.actual_payment_date;
    this.state.values.fine = this.state.values.fine ? this.state.values.fine : loanEmiData.fine;

    return (
      <Layout
        breadcrumbs={
          EDIT_LOAN_EMI_BREADCRUMBS
        }
      >
        <Card>
          <form
            autoComplete="off"
            noValidate
            onSubmit={this.handleSubmit}
            method="post">
            <CardHeader
              title={"Edit Loan EMI"}
              subheader={
                "You can edit loan EMI here!"
              }
            />
            <Divider />

            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Principle Paid*"
                    name="actual_principal"
                    value={this.state.values.actual_principal ? this.state.values.actual_principal : loanEmiData.actual_principal}
                    error={this.hasError("actual_principal")}
                    helperText={
                      this.hasError("actual_principal")
                        ? this.state.errors.actual_principal[0]
                        : null
                    }
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Interest Paid*"
                    name="actual_interest"
                    value={this.state.values.actual_interest ? this.state.values.actual_interest : loanEmiData.actual_interest}
                    error={this.hasError("actual_interest")}
                    helperText={
                      this.hasError("actual_interest")
                        ? this.state.errors.actual_interest[0]
                        : null
                    }
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <DateTimepicker
                    label="Payment Date*"
                    name="actual_payment_date"
                    error={this.hasError("actual_payment_date")}
                    helperText={
                      this.hasError("actual_payment_date")
                        ? this.state.errors.actual_payment_date[0]
                        : null
                    }
                    value={this.state.values.actual_payment_date ? this.state.values.actual_payment_date : loanEmiData.actual_payment_date}
                    format={"dd MMM yyyy"}
                    onChange={(value) =>
                      this.setState({
                        values: { ...this.state.values, actual_payment_date: value }
                      })
                    }
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Fine"
                    name="fine"
                    value={this.state.values.fine ? this.state.values.fine : loanEmiData.fine}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>

              </Grid>
            </CardContent>

            <CardActions>
              <Button type="submit">Save</Button>
              <Button
                color="secondary"
                clicked={this.cancelForm}
                component={Link}
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

export default LoanEditEmiPage;