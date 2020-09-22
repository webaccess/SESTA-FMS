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
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import { map } from "lodash";
import validateInput from "../../components/Validation/ValidateInput/ValidateInput";
import {
  ADD_VILLAGE_ORGANIZATIONS_BREADCRUMBS,
  EDIT_VILLAGE_ORGANIZATIONS_BREADCRUMBS,
} from "./config";
import { Link } from "react-router-dom";
import Spinner from "../../components/Spinner/Spinner";
import Autotext from "../../components/Autotext/Autotext.js";

class VoPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      validations: {
        addVo: {
          required: {
            value: "true",
            message: "Village Organization Name is required",
          },
        },
        addFPO: {
          required: {
            value: "true",
            message: "FPO is required",
          },
        },
      },
      errors: {},
      serverErrors: {},
      formSubmitted: "",
      stateSelected: false,
      editPage: [
        this.props.match.params.id !== undefined ? true : false,
        this.props.match.params.id,
      ],
      isLoader: "",
      loggedInUserRole: auth.getUserInfo().role.name,
      assignedFPO: "",
      getFPO: [],
    };
  }

  async componentDidMount() {
    if (this.state.editPage[0]) {
      this.setState({ isLoader: true });
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/contact/" +
            this.state.editPage[1]
        )
        .then((res) => {
          this.setState({
            values: {
              addVo: res.data.organization.name,
              addId: res.data.addresses[0].id,
              addVoAddress: res.data.addresses[0].address_line_1,
              addPerson: res.data.organization.person_incharge,
              addBlock: res.data.addresses[0].block,
              addGp: res.data.addresses[0].gp,
              addFPO: res.data.organization.fpo,
            },
            isLoader: false,
          });
        })
        .catch((error) => {
          console.log(error);
        });
      this.stateIds = this.state.values.addState;
    }

    // get all FPO
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/contact/?contact_type=organization&organization.sub_type=FPO&&_sort=name:ASC"
      )
      .then((res) => {
        this.setState({ getFPO: res.data });
      })
      .catch((error) => {});

    /** get FPO assigned to logged in FPO admn user */
    if (this.state.loggedInUserRole === "FPO Admin") {
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/individuals/" +
            auth.getUserInfo().contact.individual
        )
        .then((indRes) => {
          this.setState({ assignedFPO: indRes.data.fpo.id });
        })
        .catch((error) => {});
    }
  }

  handleChange = ({ target }) => {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value },
    });
  };

  handleFpoChange(event, value) {
    if (value !== null) {
      this.setState({
        values: { ...this.state.values, addFPO: value.id },
      });
    } else {
      this.setState({
        values: {
          ...this.state.values,
          addFPO: "",
        },
      });
    }
  }

  validate = () => {
    const values = this.state.values;
    const validations = this.state.validations;
    if (this.state.loggedInUserRole === "FPO Admin") {
      delete validations["addFPO"];
    }
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

    let voName = this.state.values.addVo;
    let addressId = this.state.values.addId;
    let voAddress = this.state.values.addVoAddress;
    let person = this.state.values.addPerson;
    let block = this.state.values.addBlock;
    let gp = this.state.values.addGp;
    let postAddressData = {
      address_line_1: voAddress,
      block: block,
      gp: gp,
    };
    let postData = {
      name: voName,
      sub_type: "VO",
      //address: voAddress,
      addresses: [postAddressData],
      person_incharge: person,
      contact_type: JSON.parse(process.env.REACT_APP_CONTACT_TYPE)[
        "Organization"
      ][0],
    };
    /** save fpo selected from the drop down if roles are sesta admin & superadmin
     * save FPO belongs to logged in user if role is FPO admin
     */
    if (
      this.state.loggedInUserRole === "Sesta Admin" ||
      this.state.loggedInUserRole === "Superadmin"
    ) {
      Object.assign(postData, {
        fpo: this.state.values.addFPO,
      });
    } else {
      Object.assign(postData, {
        fpo: this.state.assignedFPO,
      });
    }
    if (Object.keys(this.state.errors).length > 0) return;

    if (this.state.editPage[0]) {
      // for edit Vo page

      Object.assign(postAddressData, {
        id: addressId,
      });

      serviceProvider
        .serviceProviderForPutRequest(
          process.env.REACT_APP_SERVER_URL + "crm-plugin/contact",
          this.state.editPage[1],
          postData
        )
        .then((res) => {
          this.setState({ formSubmitted: true });
          this.props.history.push({
            pathname: "/village-organizations",
            editVoData: true,
          });
        })
        .catch((error) => {
          this.setState({ formSubmitted: false });
          console.log(error.response);
        });
    } else {
      //for add VO page
      Object.assign(postData, {
        creator_id: auth.getUserInfo().contact.id,
      });
      serviceProvider
        .serviceProviderForPostRequest(
          process.env.REACT_APP_SERVER_URL + "crm-plugin/contact/",
          postData
        )
        .then((res) => {
          this.setState({ formSubmitted: true });
          this.props.history.push({
            pathname: "/village-organizations",
            addVoData: true,
          });
        })
        .catch((error) => {
          this.setState({ formSubmitted: false });
          console.log(error.response);
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
    let fpoFilters = this.state.getFPO;
    let addFPO = this.state.values.addFPO;
    return (
      <Layout
        breadcrumbs={
          this.state.editPage[0]
            ? EDIT_VILLAGE_ORGANIZATIONS_BREADCRUMBS
            : ADD_VILLAGE_ORGANIZATIONS_BREADCRUMBS
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
                    ? "Edit Village Organization"
                    : "Add Village Organization"
                }
                subheader={
                  this.state.editPage[0]
                    ? "You can edit village organization here!"
                    : "You can add new village organization here!"
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item md={12} xs={12}>
                    {this.state.formSubmitted === false ? (
                      <Snackbar severity="error" Showbutton={false}>
                        Network Error - Please try again!
                      </Snackbar>
                    ) : null}
                  </Grid>
                  <Grid item xs={12}>
                    <Input
                      fullWidth
                      label="Village Organization Name*"
                      name="addVo"
                      error={this.hasError("addVo")}
                      helperText={
                        this.hasError("addVo")
                          ? this.state.errors.addVo[0]
                          : null
                      }
                      value={this.state.values.addVo || ""}
                      onChange={this.handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Input
                      fullWidth
                      label="Address"
                      name="addVoAddress"
                      error={this.hasError("addVoAddress")}
                      helperText={
                        this.hasError("addVoAddress")
                          ? this.state.errors.addVoAddress[0]
                          : null
                      }
                      value={this.state.values.addVoAddress || ""}
                      onChange={this.handleChange}
                      variant="outlined"
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
                  <Grid item md={6} xs={12}>
                    <Input
                      fullWidth
                      label="Gaon Panchayat"
                      name="addGp"
                      error={this.hasError("addGp")}
                      helperText={
                        this.hasError("addGp")
                          ? this.state.errors.addGp[0]
                          : null
                      }
                      value={this.state.values.addGp || ""}
                      onChange={this.handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <Input
                      fullWidth
                      label="Point of Contact"
                      name="addPerson"
                      error={this.hasError("addPerson")}
                      helperText={
                        this.hasError("addPerson")
                          ? this.state.errors.addPerson[0]
                          : null
                      }
                      value={this.state.values.addPerson || ""}
                      onChange={this.handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  {this.state.loggedInUserRole === "Sesta Admin" ||
                  this.state.loggedInUserRole === "Superadmin" ? (
                    <Grid item md={6} xs={12}>
                      <Autotext
                        id="combo-box-demo"
                        options={fpoFilters}
                        name="addFPO"
                        variant="outlined"
                        label="Select FPO*"
                        getOptionLabel={(option) => option.name}
                        onChange={(event, value) => {
                          this.handleFpoChange(event, value);
                        }}
                        value={
                          addFPO
                            ? this.state.isCancel === true
                              ? null
                              : fpoFilters[
                                  fpoFilters.findIndex(function (item, i) {
                                    return item.id === addFPO;
                                  })
                                ] || null
                            : null
                        }
                        error={this.hasError("addFPO")}
                        helperText={
                          this.hasError("addFPO")
                            ? this.state.errors.addFPO[0]
                            : null
                        }
                        renderInput={(params) => (
                          <Input
                            fullWidth
                            label="Select FPO*"
                            name="addFPO"
                            variant="outlined"
                          />
                        )}
                      />
                    </Grid>
                  ) : null}
                </Grid>
              </CardContent>
              <Divider />
              <CardActions style={{ padding: "15px" }}>
                <Button type="submit">Save</Button>
                <Button
                  color="secondary"
                  clicked={this.cancelForm}
                  component={Link}
                  to="/village-organizations"
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
export default VoPage;
