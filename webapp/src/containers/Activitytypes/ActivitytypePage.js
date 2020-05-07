import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import axios from "axios";
import auth from "../../components/Auth/Auth";
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
import {
  ADD_ACTIVITYTYPE_BREADCRUMBS,
  EDIT_ACTIVITYTYPE_BREADCRUMBS,
} from "./config";
import { Link } from "react-router-dom";
import Snackbar from "../../components/UI/Snackbar/Snackbar";

class ActivitytypePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      getFPO: [],
      addIsActive: false,
      validations: {
        addActivitytype: {
          required: {
            value: "true",
            message: "Activitytype  name is required",
          },
        },
      },
      errors: {
        addActivitytype: [],
      },
      serverErrors: {},
      formSubmitted: "",
      errorCode: "",
      activitytypeSelected: false,
      editPage: [
        this.props.match.params.id !== undefined ? true : false,
        this.props.match.params.id,
      ],
    };
  }

  async componentDidMount() {
    if (this.state.editPage[0]) {
      await axios
        .get(
          process.env.REACT_APP_SERVER_URL +
            "activitytypes?id=" +
            this.state.editPage[1],
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + "",
            },
          }
        )
        .then((res) => {
          console.log(res.data);
          this.setState({
            values: {
              addActivitytype: res.data[0].name,
            },
          });
          this.setState({ addIsActive: res.data[0].is_active });
        })
        .catch((error) => {
          console.log(error);
        });
    }
    this.activitytypeIds = this.state.values.addActivitytype;
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
    let activitytypeName = this.state.values.addActivitytype;
    let IsActive = this.state.addIsActive;
    if (this.state.editPage[0]) {
      // Code for Edit Data Page
      await axios
        .put(
          process.env.REACT_APP_SERVER_URL +
            "activitytypes/" +
            this.state.editPage[1],
          {
            name: activitytypeName,
            is_active: IsActive,
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
            pathname: "/activitytypes",
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
      //Code for Add Data Page
      await axios
        .post(
          process.env.REACT_APP_SERVER_URL + "activitytypes",
          {
            name: activitytypeName,
            is_active: IsActive,
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
            pathname: "/activitytypes",
            addData: true,
          });
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
      activitytypeSelected: false,
    });
    // Routing code #route to state_list page
  };

  render() {
    return (
      <Layout
        breadcrumbs={
          this.state.editPage[0]
            ? EDIT_ACTIVITYTYPE_BREADCRUMBS
            : ADD_ACTIVITYTYPE_BREADCRUMBS
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
              title={
                this.state.editPage[0]
                  ? "Edit Activity Type"
                  : "Add Activity Type"
              }
              subheader={
                this.state.editPage[0]
                  ? "You can edit activity type data here!"
                  : "You can add new activity type data here!"
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
                    label="Activity Type Name*"
                    name="addActivitytype"
                    error={this.hasError("addActivitytype")}
                    helperText={
                      this.hasError("addActivitytype")
                        ? this.state.errors.addActivitytype[0]
                        : null
                    }
                    value={this.state.values.addActivitytype || ""}
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
            <CardActions>
              <Button type="submit">Save</Button>
              <Button
                color="secondary"
                clicked={this.cancelForm}
                component={Link}
                to="/activitytypes"
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

export default ActivitytypePage;
