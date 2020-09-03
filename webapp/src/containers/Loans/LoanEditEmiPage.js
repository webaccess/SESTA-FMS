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
import { map } from "lodash";
import validateInput from "../../components/Validation/ValidateInput/ValidateInput";
import auth from "../../components/Auth/Auth.js";

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
            actual_payment_date: res.data[0].actual_payment_date,
            actual_principal: res.data[0].actual_principal,
            actual_interest: res.data[0].actual_interest,
            fine: res.data[0].fine,
            expected_principal: res.data[0].expected_principal,
            expected_interest: res.data[0].expected_interest
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
    if (this.state.values.actual_principal == null) {
      this.state.values.actual_principal = this.state.values.expected_principal;
    }
    if (this.state.values.actual_interest == null) {
      this.state.values.actual_interest = this.state.values.expected_interest;
    }
    this.validate();
    this.setState({ formSubmitted: "" });

    if (Object.keys(this.state.errors).length > 0) return;
    let loanEmiData = this.props.location.state.loanEmiData;
    let loanEmiId = loanEmiData.id;

    let actual_payment_date = this.state.values.actual_payment_date;
    let actual_principal = this.state.values.actual_principal;
    let actual_interest = this.state.values.actual_interest;
    let fine = this.state.values.fine;
    let postData = {
      actual_payment_date: actual_payment_date,
      actual_principal: actual_principal,
      actual_interest: actual_interest,
      fine: fine
    }

    serviceProvider
      .serviceProviderForPutRequest(
        process.env.REACT_APP_SERVER_URL + "loan-application-installments",
        loanEmiId,
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

                // Updated activity while updating loan emi by csp
                if (fdata.loan_application_installment != null) {
                  if (fdata.loan_application_installment.id === loanEmiId) {
                    updateActivityFlag = true;
                    fdata.start_datetime = this.state.values.actual_payment_date;
                    fdata.end_datetime = this.state.values.actual_payment_date;
                    fdata.unit = 1;
                    delete fdata.contacts;
                    fdata.contact = {
                      id: auth.getUserInfo().contact.id
                    }

                    serviceProvider
                      .serviceProviderForPutRequest(
                        process.env.REACT_APP_SERVER_URL + "crm-plugin/activities",
                        fdata.id,
                        fdata
                      )
                      .then((activityRes) => { });
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
        let app_id = res.data.loan_application["id"];
        this.props.history.push("/loans/emi/" + app_id, {
          loanAppData: this.props.location.state.loanAppData,
          loanEditEmiPage: true
        });
      })
  }

  addActivity() {
    let loanEmiId = this.props.location.state.loanEmiData.id;
    let principalId, interestId;
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/activitytypes",
      )
      .then((activityTypeResp) => {
        activityTypeResp.data.map(type => {
          if (type.name == "Collection of principal amount") {
            principalId = type.id;
          }
          if (type.name == "Interest collection") {
            interestId = type.id;
          }
        })

        // add activity records while updating loan emi for the first time by csp
        let activities = [
          {
            title: this.props.location.state.loanAppData.contact.name + ": Prinicipal paid",
            start_datetime: this.state.values.actual_payment_date,
            end_datetime: this.state.values.actual_payment_date,
            unit: 1,
            description: "",
            activitytype: {
              id: principalId,
            },
            loan_application_installment: {
              id: loanEmiId
            }
          },
          {
            title: this.props.location.state.loanAppData.contact.name + ": Interest paid",
            start_datetime: this.state.values.actual_payment_date,
            end_datetime: this.state.values.actual_payment_date,
            unit: 1,
            description: "",
            activitytype: {
              id: interestId,
            },
            loan_application_installment: {
              id: loanEmiId
            }
          },
        ];
        activities.map(postdata => {
          serviceProvider
            .serviceProviderForPostRequest(
              process.env.REACT_APP_SERVER_URL + "crm-plugin/activities",
              postdata
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
    this.props.history.push(this.props.history.goBack(), { loanEmiData: this.state.loanEmiData });
    //routing code #route to loan_application_list page
  };

  render() {
    const { classes } = this.props;
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
                    label="Principal Paid*"
                    name="actual_principal"
                    value={this.state.values.actual_principal ? this.state.values.actual_principal : this.state.values.expected_principal || ""}
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
                    value={this.state.values.actual_interest ? this.state.values.actual_interest : this.state.values.expected_interest || ""}
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
                    value={this.state.values.actual_payment_date || ""}
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
                    value={this.state.values.fine || ""}
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