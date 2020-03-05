import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import axios from "axios";
import auth from "../../components/Auth/Auth";
import Button from "../../components/UI/Button/Button";
import Input from "../../components/UI/Input/Input";
import Snackbar from "../../components/UI/Snackbar/Snackbar.js";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Grid
} from "@material-ui/core";
import { map } from "lodash";
import validateInput from "../../components/Validation/ValidateInput/ValidateInput";
import { ADD_VILLAGE_BREADCRUMBS } from "./config";
class Villages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      getState: [],
      getDistrict: [],
      validations: {
        addVillage: {
          required: { value: "true", message: "Village field required" }
        },
        addState: {
          required: { value: "true", message: "State field required" }
        },
        addDistrict: {
          required: { value: "true", message: "District field required" }
        }
      },
      errors: {
        addVillage: [],
        addState: [],
        addDistrict: []
      },
      serverErrors: {},
      formSubmitted: "",
      stateSelected: false,
      editPage: [
        this.props.match.params.id !== undefined ? true : false,
        this.props.match.params.id
      ]
    };
  }

  async componentDidMount() {
    console.log("token", auth.getToken());
    if (this.state.editPage[0]) {
      await axios
        .get(
          process.env.REACT_APP_SERVER_URL +
            "villages?id=" +
            this.state.editPage[1],
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + ""
            }
          }
        )
        .then(res => {
          this.setState({
            values: {
              addVillage: res.data[0].name,
              addDistrict: res.data[0].master_district.id,
              addState: res.data[0].master_state.id
            }
          });
        })
        .catch(error => {
          console.log(error);
        });
      this.stateIds = this.state.values.addState;
      await axios
        .get(
          process.env.REACT_APP_SERVER_URL +
            "districts?master_state.id=" +
            this.state.values.addState,
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + ""
            }
          }
        )
        .then(res => {
          this.setState({ getDistrict: res.data });
        })
        .catch(error => {
          console.log(error);
        });
    }
    await axios
      .get(process.env.REACT_APP_SERVER_URL + "states/", {
        headers: {
          Authorization: "Bearer " + auth.getToken() + ""
        }
      })
      .then(res => {
        this.setState({ getState: res.data });
      })
      .catch(error => {
        console.log(error);
      });
    if (this.state.values.addState) {
      this.setState({ stateSelected: true });
    }
  }

  handleChange = ({ target }) => {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value }
    });
  };

  handleStateChange = async ({ target }) => {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value }
    });
    let stateId = target.value;
    await axios
      .get(
        process.env.REACT_APP_SERVER_URL +
          "districts?master_state.id=" +
          stateId,
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + ""
          }
        }
      )
      .then(res => {
        this.setState({ getDistrict: res.data });
      })
      .catch(error => {
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

  hasError = field => {
    if (this.state.errors[field] !== undefined) {
      return Object.keys(this.state.errors).length > 0 &&
        this.state.errors[field].length > 0
        ? true
        : false;
    }
  };

  handleSubmit = async e => {
    e.preventDefault();
    this.validate();

    if (Object.keys(this.state.errors).length > 0) return;
    let villageName = this.state.values.addVillage;
    let districtId = this.state.values.addDistrict;
    let stateId = this.state.values.addState;
    let body = {
      name: villageName,
      master_district: {
        id: districtId
      },
      master_state: {
        id: stateId
      }
    };
    if (this.state.editPage[0]) {
      console.log("bodu", body);

      await axios
        .put(
          process.env.REACT_APP_SERVER_URL +
            "villages/" +
            this.state.editPage[1],
          {
            name: villageName,
            master_district: {
              id: districtId
            },
            master_state: {
              id: stateId
            }
          },
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + ""
            }
          }
        )
        .then(res => {
          console.log("res", res);
          this.setState({ formSubmitted: true });
        })
        .catch(error => {
          this.setState({ formSubmitted: false });
          console.log(error.response);
        });
    } else {
      await axios
        .post(
          process.env.REACT_APP_SERVER_URL + "villages",

          {
            name: villageName,
            master_district: {
              id: districtId
            },
            master_state: {
              id: stateId
            }
          },
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + ""
            }
          }
        )
        .then(res => {
          this.setState({ formSubmitted: true });
        })
        .catch(error => {
          this.setState({ formSubmitted: false });
          console.log(error.response);
        });
    }
  };

  cancelForm = () => {
    this.setState({
      values: {}
    });
    //routing code #route to village_list page
  };

  render() {
    return (
      <Layout breadcrumbs={ADD_VILLAGE_BREADCRUMBS}>
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
                {/* <Grid item md={12} xs={12}>
                  {this.state.formSubmitted === true ? (
                    <Snackbar severity="success">
                      Village added successfully.
                    </Snackbar>
                  ) : null}
                  {this.state.formSubmitted === false ? (
                    <Snackbar severity="error">An error occured.</Snackbar>
                  ) : null}
                </Grid> */}
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Village Name"
                    margin="dense"
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
                    label="Select State"
                    margin="dense"
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
                    {this.state.getState.map(states => (
                      <option value={states.id} key={states.id}>
                        {states.name}
                      </option>
                    ))}
                  </Input>
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Select District"
                    margin="dense"
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
                    {this.state.getDistrict.map(district => (
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
              <Button color="default" clicked={this.cancelForm}>
                cancel
              </Button>
            </CardActions>
          </form>
        </Card>
      </Layout>
    );
  }
}
export default Villages;
