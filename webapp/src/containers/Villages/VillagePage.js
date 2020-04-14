import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import axios from "axios";
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
import { map } from "lodash";
import validateInput from "../../components/Validation/ValidateInput/ValidateInput";
import { ADD_VILLAGE_BREADCRUMBS, EDIT_VILLAGE_BREADCRUMBS } from "./config";
import { Link } from "react-router-dom";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import Autocomplete from "@material-ui/lab/Autocomplete";

class VillagePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      getState: [],
      getDistrict: [],
      validations: {
        addVillage: {
          required: { value: "true", message: "Village field required" },
        },
        addState: {
          required: { value: "true", message: "State field required" },
        },
        addDistrict: {
          required: { value: "true", message: "District field required" },
        },
      },
      errors: {
        addVillage: [],
        addState: [],
        addDistrict: [],
      },
      serverErrors: {},
      formSubmitted: "",
      errorCode: "",
      stateSelected: false,
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
            "villages?id=" +
            this.state.editPage[1],
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + "",
            },
          }
        )
        .then((res) => {
          this.setState({
            values: {
              addVillage: res.data[0].name,
              addDistrict: res.data[0].district.id,
              addState: res.data[0].state.id,
            },
          });
        })
        .catch((error) => {
          console.log(error);
        });
      this.stateIds = this.state.values.addState;
      await axios
        .get(
          process.env.REACT_APP_SERVER_URL +
            "districts?is_active=true&&master_state.id=" +
            this.state.values.addState,
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + "",
            },
          }
        )
        .then((res) => {
          this.setState({ getDistrict: res.data });
        })
        .catch((error) => {
          console.log(error);
        });
    }
    await axios
      .get(process.env.REACT_APP_SERVER_URL + "states?is_active=true", {
        headers: {
          Authorization: "Bearer " + auth.getToken() + "",
        },
      })
      .then((res) => {
        this.setState({ getState: res.data });
      })
      .catch((error) => {
        console.log(error);
      });
    if (this.state.values.addState) {
      this.setState({ stateSelected: true });
    }
  }

  handleChange = ({ target }) => {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value },
    });
  };

  handleStateChange = async ({ target }) => {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value },
    });
    let stateId = target.value;
    await axios
      .get(
        process.env.REACT_APP_SERVER_URL +
          "districts?is_active=true&&master_state.id=" +
          stateId,
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + "",
          },
        }
      )
      .then((res) => {
        this.setState({ getDistrict: res.data });
      })
      .catch((error) => {
        console.log(error);
      });
    if (this.state.values.addState) {
      this.setState({ stateSelected: true });
    }
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
    let villageName = this.state.values.addVillage;
    let districtId = this.state.values.addDistrict;
    let stateId = this.state.values.addState;

    if (this.state.editPage[0]) {
      // for edit data page
      await axios
        .put(
          process.env.REACT_APP_SERVER_URL +
            "villages/" +
            this.state.editPage[1],
          {
            name: villageName,
            district: {
              id: districtId,
            },
            state: {
              id: stateId,
            },
          },
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + "",
            },
          }
        )
        .then((res) => {
          this.setState({ formSubmitted: true });
          this.props.history.push({ pathname: "/villages", editData: true });
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
      await axios
        .post(
          process.env.REACT_APP_SERVER_URL + "villages",

          {
            name: villageName,
            district: {
              id: districtId,
            },
            state: {
              id: stateId,
            },
          },
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + "",
            },
          }
        )
        .then((res) => {
          this.setState({ formSubmitted: true });

          this.props.history.push({ pathname: "/villages", addData: true });
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
    //routing code #route to village_list page
  };

  render() {
    return (
      <Layout
        breadcrumbs={
          this.state.editPage[0]
            ? EDIT_VILLAGE_BREADCRUMBS
            : ADD_VILLAGE_BREADCRUMBS
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
              title={this.state.editPage[0] ? "Edit village" : "Add village"}
              subheader={
                this.state.editPage[0]
                  ? "You can edit village data here!"
                  : "You can add new village data here!"
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={12} xs={12}>
                  {/* {this.state.formSubmitted === true ? (
                    <Snackbar severity="success">
                      Village added successfully.
                    </Snackbar>
                  ) : null} */}
                  {this.state.formSubmitted === false ? (
                    <Snackbar severity="error" Showbutton={false}>
                      {this.state.errorCode}
                    </Snackbar>
                  ) : null}
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Village Name*"
                    name="addVillage"
                    error={this.hasError("addVillage")}
                    helperText={
                      this.hasError("addVillage")
                        ? this.state.errors.addVillage[0]
                        : null
                    }
                    value={this.state.values.addVillage || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>

                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Select State*"
                    name="addState"
                    onChange={this.handleStateChange}
                    select
                    error={this.hasError("addState")}
                    helperText={
                      this.hasError("addState")
                        ? this.state.errors.addState[0]
                        : null
                    }
                    value={this.state.values.addState || ""}
                    variant="outlined"
                  >
                    {this.state.getState.map((states) => (
                      <option value={states.id} key={states.id}>
                        {states.name}
                      </option>
                    ))}
                  </Input>
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Select District*"
                    name="addDistrict"
                    onChange={this.handleChange}
                    select
                    error={this.hasError("addDistrict")}
                    helperText={
                      this.hasError("addDistrict")
                        ? this.state.errors.addDistrict[0]
                        : this.state.stateSelected
                        ? null
                        : "Please select the state first"
                    }
                    value={this.state.values.addDistrict || ""}
                    variant="outlined"
                  >
                    {this.state.getDistrict.map((district) => (
                      <option value={district.id} key={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </Input>
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
                to="/Villages"
              >
                cancel
              </Button>
            </CardActions>
          </form>
        </Card>
      </Layout>
    );
  }
}
export default VillagePage;
