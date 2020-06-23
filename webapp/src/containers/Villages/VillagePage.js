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
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { map } from "lodash";
import validateInput from "../../components/Validation/ValidateInput/ValidateInput";
import { ADD_VILLAGE_BREADCRUMBS, EDIT_VILLAGE_BREADCRUMBS } from "./config";
import { Link } from "react-router-dom";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import Autotext from "../../components/Autotext/Autotext";

class VillagePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {
        addIsActive: false,
      },
      getState: [],
      getDistrict: [],
      validations: {
        addVillage: {
          required: { value: "true", message: "Village field is required" },
        },
        addState: {
          required: { value: "true", message: "State field is required" },
        },
        addDistrict: {
          required: { value: "true", message: "District field is required" },
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
              addAbbreviation: res.data[0].abbreviation,
              addIdentifier: res.data[0].identifier,
              addIsActive: res.data[0].is_active,
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
  handleCheckBox = (event) => {
    this.setState({
      values: {
        ...this.state.values,
        [event.target.name]: event.target.checked,
      },
    });
  };

  handleStateChange(event, value) {
    if (value !== null) {
      this.setState({
        values: { ...this.state.values, addState: value.id },
      });
      let stateId = value.id;
      axios
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
      this.setState({ stateSelected: true });
    } else {
      this.setState({
        values: {
          ...this.state.values,
          addState: "",
          addDistrict: "",
        },
      });
      this.setState({ stateSelected: false });
    }
  }

  handleDistrictChange(event, value) {
    if (value !== null) {
      this.setState({
        values: { ...this.state.values, addDistrict: value.id },
      });
    } else {
      this.setState({
        values: {
          ...this.state.values,
          addDistrict: "",
        },
      });
    }
  }

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
    let abbreviation = this.state.values.addAbbreviation;
    let identifier = this.state.values.addIdentifier;
    let isActive = this.state.values.addIsActive;
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
            abbreviation: abbreviation,
            identifier: identifier,
            is_active: isActive,
            district: {
              id: districtId,
            },
            state: {
              id: stateId,
            }
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
            abbreviation: abbreviation,
            identifier: identifier,
            is_active: isActive,
            district: {
              id: districtId,
            },
            state: {
              id: stateId,
            }
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
  };

  render() {
    let stateFilter = this.state.getState;
    let addState = this.state.values.addState;
    let districtFilter = this.state.getDistrict;
    let addDistrict = this.state.values.addDistrict;

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
                  {this.state.formSubmitted === false ? (
                    <Snackbar severity="error" Showbutton={false}>
                      {this.state.errorCode}
                    </Snackbar>
                  ) : null}
                </Grid>
                <Grid item md={12} xs={12}>
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
                    label="Abbreviation"
                    name="addAbbreviation"
                    error={this.hasError("addAbbreviation")}
                    helperText={
                      this.hasError("addAbbreviation")
                        ? this.state.errors.addVAbbreviation[0]
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

                <Grid item md={6} xs={12}>
                  <Autotext
                    id="combo-box-demo"
                    options={stateFilter}
                    variant="outlined"
                    label="Select State*"
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => {
                      this.handleStateChange(event, value);
                    }}
                    defaultValue={[]}
                    value={
                      addState
                        ? stateFilter[
                            stateFilter.findIndex(function (item, i) {
                              return item.id === addState;
                            })
                          ] || null
                        : null
                    }
                    error={this.hasError("addState")}
                    helperText={
                      this.hasError("addState")
                        ? this.state.errors.addState[0]
                        : null
                    }
                    renderInput={(params) => (
                      <Input
                        fullWidth
                        label="Select State*"
                        name="addState"
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Autotext
                    id="combo-box-demo"
                    options={districtFilter}
                    variant="outlined"
                    label="Select District*"
                    name="addDistrict"
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => {
                      this.handleDistrictChange(event, value);
                    }}
                    defaultValue={[]}
                    value={
                      addDistrict
                        ? districtFilter[
                            districtFilter.findIndex(function (item, i) {
                              return item.id === addDistrict;
                            })
                          ] || null
                        : null
                    }
                    error={this.hasError("addDistrict")}
                    helperText={
                      this.hasError("addDistrict")
                        ? this.state.errors.addDistrict[0]
                        : this.state.stateSelected
                        ? null
                        : "Please select the state first"
                    }
                    renderInput={(params) => (
                      <Input
                        {...params}
                        fullWidth
                        label="Select District*"
                        name="addDistrict"
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={this.state.values.addIsActive}
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