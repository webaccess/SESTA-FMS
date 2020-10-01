import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import * as serviceProvider from "../../api/Axios";
import Button from "../../components/UI/Button/Button";
import Input from "../../components/UI/Input/Input";
import Checkbox from "@material-ui/core/Checkbox";
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
import { ADD_COUNTRY_BREADCRUMBS, EDIT_COUNTRY_BREADCRUMBS } from "./config";
import { Link } from "react-router-dom";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import Spinner from "../../components/Spinner/Spinner";

class CountryPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      addIsActive: false,
      validations: {
        addCountry: {
          required: { value: "true", message: "Country name is required" },
        },
        addAbbreviation: {
          required: {
            value: "true",
            message: "Abbreviation is required",
          },
        },
        addIdentifier: {},
      },
      errors: {
        addCountry: [],
        addAbbreviation: [],
        addIdentifier: [],
      },
      serverErrors: {},
      formSubmitted: "",
      errorCode: "",
      countrySelected: false,
      editPage: [
        this.props.match.params.id !== undefined ? true : false,
        this.props.match.params.id,
      ],
      isLoader: "",
    };
  }

  async componentDidMount() {
    if (this.state.editPage[0]) {
      this.setState({ isLoader: true });
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/countries/?id=" +
            this.state.editPage[1]
        )
        .then((res) => {
          this.setState({
            values: {
              addCountry: res.data[0].name,
              addAbbreviation: res.data[0].abbreviation,
              addIdentifier: res.data[0].identifier,
            },
          });
          this.setState({
            addIsActive: res.data[0].is_active,
            isLoader: false,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
    this.countryIds = this.state.values.addCountry;
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
    let countryName = this.state.values.addCountry;
    let countryAbbr = this.state.values.addAbbreviation;
    let countryIdentifier = this.state.values.addIdentifier;
    let IsActive = this.state.addIsActive;
    let postData = {
      name: countryName,
      is_active: IsActive,
      abbreviation: countryAbbr,
      identifier: countryIdentifier,
    };
    if (this.state.editPage[0]) {
      // Code for Edit Data Page
      serviceProvider
        .serviceProviderForPutRequest(
          process.env.REACT_APP_SERVER_URL + "crm-plugin/countries",
          this.state.editPage[1],
          postData
        )
        .then((res) => {
          this.setState({ formSubmitted: true });
          this.props.history.push({ pathname: "/countries", editData: true });
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
      countrySelected: false,
    });
  };

  render() {
    return (
      <Layout
        breadcrumbs={
          this.state.editPage[0]
            ? EDIT_COUNTRY_BREADCRUMBS
            : ADD_COUNTRY_BREADCRUMBS
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
                title={this.state.editPage[0] ? "Edit country" : "Add country"}
                subheader={
                  this.state.editPage[0]
                    ? "You can edit country data here!"
                    : "You can add new country data here!"
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
                  <Grid item xs={12}>
                    <Input
                      fullWidth
                      label="Country Name*"
                      name="addCountry"
                      error={this.hasError("addCountry")}
                      helperText={
                        this.hasError("addCountry")
                          ? this.state.errors.addCountry[0]
                          : null
                      }
                      value={this.state.values.addCountry || ""}
                      onChange={this.handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <Input
                      fullWidth
                      label="Abbreviation*"
                      name="addAbbreviation"
                      error={this.hasError("addAbbreviation")}
                      helperText={
                        this.hasError("addAbbreviation")
                          ? this.state.errors.addAbbreviation[0]
                          : null
                      }
                      value={this.state.values.addAbbreviation || ""}
                      onChange={this.handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <Input
                      fullWidth
                      label="Identifier"
                      name="addIdentifier"
                      error={this.hasError("addIdentifier")}
                      helperText={
                        this.hasError("addIdentifier")
                          ? this.state.errors.addIdentifier[0]
                          : null
                      }
                      value={this.state.values.addIdentifier || ""}
                      onChange={this.handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={this.state.addIsActive}
                          onChange={this.handleCheckBox}
                          name="addIsActive"
                          color="primary"
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
                  to="/countries"
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

export default CountryPage;
