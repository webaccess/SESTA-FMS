import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import axios from "axios";
import auth from "../../components/Auth/Auth";
import Button from "../../components/UI/Button/Button";
import Autotext from "../../components/Autotext/Autotext.js";
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
import { ADD_FPO_BREADCRUMBS, EDIT_FPO_BREADCRUMBS } from "./config";
import { Link } from "react-router-dom";
import Snackbar from "../../components/UI/Snackbar/Snackbar";

class FpoPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      getState: [],
      getDistrict: [],

      validations: {
        addFpo: {
          required: {
            value: "true",
            message: "Farmer Producer Organization field required",
          },
        },
        addDistrict: {
          required: { value: "true", message: "District field required" },
        },
        addState: {
          required: {
            value: "true",
            message: "State field required",
          },
        },
        addEmail: {
          email: {
            value: "true",
            message: "Please enter valid email id",
          },
        },
        addPhone: {
          phone: {
            value: "true",
            message: "Please enter valid phone number",
          },
        },
      },
      errors: {
        addDistrict: [],
        addState: [],
      },
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
      let stateId = "";
      await axios
        .get(
          process.env.REACT_APP_SERVER_URL +
            JSON.parse(process.env.REACT_APP_CONTACT_TYPE)["Organization"][0] +
            "s?sub_type=FPO&id=" +
            this.state.editPage[1],
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + "",
            },
          }
        )
        .then((res) => {
          console.log("results", res.data[0]);
          this.setState({
            values: {
              addFpo: res.data[0].name,
              addAddress: res.data[0].contact.address_1,
              addPointOfContact: res.data[0].person_incharge,
              addDistrict: res.data[0].contact.district,
              addState: res.data[0].contact.state,
              addBlock: res.data[0].contact.block,
              addEmail: res.data[0].contact.email,
              addPhone: res.data[0].contact.phone,
            },
          });
          stateId = res.data[0].contact.state;
        })
        .catch((error) => {
          console.log(error);
        });
      console.log("state".stteId);
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
  }

  handleChange = ({ target }) => {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value },
      bankValues: { ...this.state.bankValues, [target.name]: target.value },
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
    // if (Object.keys(this.state.errors).length > 0) return;
    let fpoName = this.state.values.addFpo;
    let fpoState = this.state.values.addState;
    let fpoDistrict = this.state.values.addDistrict;
    let fpoAddress = this.state.values.addAddress;
    let fpoBlock = this.state.values.addBlock;
    let fpoPersonInCharge = this.state.values.addPointOfContact;
    let fpoEmail = this.state.values.addEmail;
    let fpoPhone = this.state.values.addPhone;

    if (Object.keys(this.state.errors).length > 0) return;
    if (this.state.editPage[0]) {
      await axios
        .put(
          process.env.REACT_APP_SERVER_URL +
            "organizations/" +
            this.state.editPage[1],
          {
            name: fpoName,
            sub_type: "FPO",
            person_incharge: fpoPersonInCharge,
            contact_type: JSON.parse(process.env.REACT_APP_CONTACT_TYPE)[
              "Organization"
            ][0],
            name: fpoName,
            address_1: fpoAddress,
            state: fpoState,
            district: fpoDistrict,
            block: fpoBlock,
            email: fpoEmail,
            phone: fpoPhone,
          },
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + "",
            },
          }
        )
        .then((res) => {
          this.setState({ formSubmitted: true });
          console.log("testing", res);
          this.props.history.push({ pathname: "/fpos", editData: true });
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
          console.log("error", error.response);
        });
    } else {
      await axios
        .post(
          process.env.REACT_APP_SERVER_URL + "organizations/",
          {
            name: fpoName,
            sub_type: "FPO",
            person_incharge: fpoPersonInCharge,
            contact_type: JSON.parse(process.env.REACT_APP_CONTACT_TYPE)[
              "Organization"
            ][0],
            name: fpoName,
            address_1: fpoAddress,
            state: fpoState,
            district: fpoDistrict,
            block: fpoBlock,
            email: fpoEmail,
            phone: fpoPhone,
          },
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + "",
            },
          }
        )
        .then((res) => {
          this.setState({ formSubmitted: true });
          this.props.history.push({ pathname: "/fpos", addData: true });
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
          console.log("Error  ", error);
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
          this.state.editPage[0] ? EDIT_FPO_BREADCRUMBS : ADD_FPO_BREADCRUMBS
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
              title={this.state.editPage[0] ? "Edit FPO" : "Add FPO"}
              subheader={
                this.state.editPage[0]
                  ? "You can edit FPO data here!"
                  : "You can add new FPO data here!"
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
                    label="Farmer Producer Organization Name*"
                    name="addFpo"
                    error={this.hasError("addFpo")}
                    helperText={
                      this.hasError("addFpo")
                        ? this.state.errors.addFpo[0]
                        : null
                    }
                    value={this.state.values.addFpo || ""}
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
                  <Input
                    fullWidth
                    label="Block"
                    name="addBlock"
                    error={this.hasError("addBlock")}
                    helperText={
                      this.hasError("addBlock")
                        ? this.state.errors.addBlock[0]
                        : null
                    }
                    value={this.state.values.addBlock || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={12} xs={12}>
                  <Input
                    fullWidth
                    label="Address"
                    name="addAddress"
                    error={this.hasError("addAddress")}
                    helperText={
                      this.hasError("addAddress")
                        ? this.state.errors.addAddress[0]
                        : null
                    }
                    value={this.state.values.addAddress || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Email"
                    type="email"
                    name="addEmail"
                    error={this.hasError("addEmail")}
                    helperText={
                      this.hasError("addEmail")
                        ? this.state.errors.addEmail[0]
                        : null
                    }
                    value={this.state.values.addEmail || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Phone"
                    type="tel"
                    name="addPhone"
                    error={this.hasError("addPhone")}
                    helperText={
                      this.hasError("addPhone")
                        ? this.state.errors.addPhone[0]
                        : null
                    }
                    value={this.state.values.addPhone || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Point Of Contact"
                    name="addPointOfContact"
                    error={this.hasError("addPointOfContact")}
                    helperText={
                      this.hasError("addPointOfContact")
                        ? this.state.errors.addPointOfContact[0]
                        : null
                    }
                    value={this.state.values.addPointOfContact || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={12} xs={12}></Grid>
              </Grid>
            </CardContent>
            <Divider />
            <CardActions>
              <Button type="submit">Save</Button>
              <Button
                color="secondary"
                clicked={this.cancelForm}
                component={Link}
                to="/fpos"
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
export default FpoPage;
