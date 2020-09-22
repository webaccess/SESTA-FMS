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
} from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { map } from "lodash";
import validateInput from "../../components/Validation/ValidateInput/ValidateInput";
import { ADD_PG_BREADCRUMBS, EDIT_PG_BREADCRUMBS } from "./config";
import { Link } from "react-router-dom";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import Spinner from "../../components/Spinner/Spinner";

class PgPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      addIsActive: false,
      isPgPresent: false,
      validations: {
        addPg: {
          required: { value: "true", message: "Producer Group field required" },
        },
      },
      errors: {},
      serverErrors: {},
      formSubmitted: "",
      errorCode: "",
      stateSelected: false,
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
            "crm-plugin/tags/?id=" +
            this.state.editPage[1]
        )
        .then((res) => {
          // disable active field if PG is in use
          serviceProvider
            .serviceProviderForGetRequest(
              process.env.REACT_APP_SERVER_URL +
                "crm-plugin/contact/?pg=" +
                this.state.editPage[1]
            )
            .then((pgRes) => {
              if (pgRes.data.length > 0) {
                this.setState({
                  isPgPresent: true,
                  addIsActive: res.data[0].is_active,
                  isLoader: false,
                });
              } else {
                this.setState({
                  isPgPresent: false,
                  addIsActive: res.data[0].is_active,
                  isLoader: false,
                });
              }
            })
            .catch((error) => {});
          this.setState({
            values: {
              addPg: res.data[0].name,
              addDescription: res.data[0].description,
            },
            isLoader: false,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  handleChange = ({ target }) => {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value },
    });
  };

  handleCheckBox = (event) => {
    this.setState({ [event.target.name]: event.target.checked });
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
    let pgName = this.state.values.addPg;
    let isActive = this.state.addIsActive;
    let pgDescription = this.state.values.addDescription;
    let postData = {
      name: pgName,
      is_active: isActive,
      description: pgDescription,
    };
    if (this.state.editPage[0]) {
      // for edit data page
      serviceProvider
        .serviceProviderForPutRequest(
          process.env.REACT_APP_SERVER_URL + "crm-plugin/tags",
          this.state.editPage[1],
          postData
        )
        .then((res) => {
          this.setState({ formSubmitted: true });
          this.props.history.push({ pathname: "/Pgs", editData: true });
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
          process.env.REACT_APP_SERVER_URL + "crm-plugin/tags/",
          postData
        )
        .then((res) => {
          this.setState({ formSubmitted: true });

          this.props.history.push({ pathname: "/pgs", addData: true });
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

  render() {
    return (
      <Layout
        breadcrumbs={
          this.state.editPage[0] ? EDIT_PG_BREADCRUMBS : ADD_PG_BREADCRUMBS
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
                    ? "Edit Producer Group"
                    : "Add Producer Group"
                }
                subheader={
                  this.state.editPage[0]
                    ? "You can edit Producer Group data here!"
                    : "You can add new Producer Group data here!"
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
                    <Input
                      fullWidth
                      label="Producer Group Name*"
                      name="addPg"
                      error={this.hasError("addPg")}
                      helperText={
                        this.hasError("addPg")
                          ? this.state.errors.addPg[0]
                          : null
                      }
                      value={this.state.values.addPg || ""}
                      onChange={this.handleChange.bind(this)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={this.state.addIsActive}
                          onChange={this.handleCheckBox}
                          name="addIsActive"
                          color="primary"
                          disabled={this.state.isPgPresent ? true : false}
                        />
                      }
                      label="Active"
                    />
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <Input
                      fullWidth
                      label="Description"
                      name="addDescription"
                      value={this.state.values.addDescription || ""}
                      onChange={this.handleChange.bind(this)}
                      variant="outlined"
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
                  to="/Pgs"
                >
                  cancel
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
export default PgPage;
