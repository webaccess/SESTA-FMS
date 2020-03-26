import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import axios from "axios";
import auth from "../../components/Auth/Auth";
import Button from "../../components/UI/Button/Button";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Input from "../../components/UI/Input/Input";
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
import { ADD_SHG_BREADCRUMBS, EDIT_SHG_BREADCRUMBS } from "./config";
import { Link } from "react-router-dom";
import Snackbar from "../../components/UI/Snackbar/Snackbar";

class VillagePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      filterState: "",
      addShg:'',
      filterDistrict: "",
      filterVillage: "",
      getState: [],
      getDistrict: [],
      getVillage: [],
      validations: {
        addShg: {
          required: { value: "true", message: "Shg field required" }
        },
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
    if (this.state.editPage[0]) {
      await axios
        .get(
          process.env.REACT_APP_SERVER_URL +
            "shgs?id=" +
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
              addDistrict: res.data[0].district.id,
              addState: res.data[0].state.id
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

 handleStateChange = async (event, value) => {
    if (value !== null) {
      this.setState({ filterState: value.id });
      this.setState({
        isCancel: false
      });

      let stateId = value.id;
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
    } else {
      this.setState({
        filterState: "",
        filterDistrict: "",
        filterVillage: ""
      });
      console.log("state null", this.state.filterState);
    }
  };

 handleChange = ({ target }) => {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value }
    });
  };

  handleDistrictChange(event, value) {
    if (value !== null) {
      this.setState({ filterDistrict: value.id });
      console.log("District", this.state.filterDistrict);
      let distId = value.id;
      axios
        .get(process.env.REACT_APP_SERVER_URL + "districts/" + distId, {
          headers: {
            Authorization: "Bearer " + auth.getToken() + ""
          }
        })
        .then(res => {
          console.log("villagedata", res.data.villages);
          this.setState({ getVillage: res.data.villages });
        })
        .catch(error => {
          console.log(error);
        });
    } else {
      this.setState({
        filterDistrict: "",
        filterVillage: ""
      });
      console.log("District null", this.state.filterDistrict);
    }
  }

  handleVillageChange(event, value) {
    if (value !== null) {
      this.setState({ filterVillage: value.id });
      console.log("village", this.state.filterVillage);
    } else {
      this.setState({
        filterVillage: ""
      });
      console.log("village", this.state.filterVillage);
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
    this.setState({ formSubmitted: "" });
    console.log("aLLVALUES",this.state.values)
    // 
  };

  cancelForm = () => {
    this.setState({
      values: {},
      formSubmitted: "",
      stateSelected: false
    });
    //routing code #route to village_list page
  };

  render() {
    let statesFilter = this.state.getState;
    let filterState = this.state.filterState;
    let districtsFilter = this.state.getDistrict;
    let filterDistrict = this.state.filterDistrict;
    let villagesFilter = this.state.getVillage;
    let filterVillage = this.state.filterVillage;
    let isCancel = this.state.isCancel;
    return (
      <Layout
        breadcrumbs={
          this.state.editPage[0]
            ? EDIT_SHG_BREADCRUMBS
            : ADD_SHG_BREADCRUMBS
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
              title={this.state.editPage[0] ? "Edit shg" : "Add shg"}
              subheader={
                this.state.editPage[0]
                  ? "You can edit shg data here!"
                  : "You can add new shg data here!"
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
                      Network Error - Please try again!
                    </Snackbar>
                  ) : null}
                </Grid>
               <Grid item md={12} xs={12}>
                   <Input
                    fullWidth
                    label="Shg Name"
                    name="addShg"
                    error={this.hasError("addShg")}
                    helperText={
                      this.hasError("addShg")
                        ? this.state.errors.addShg[0]
                        : null
                    }
                    value={this.state.values.addShg || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                 <Grid item md={6} xs={12}>
                <Autocomplete
                    id="combo-box-demo"
                    options={statesFilter}
                    getOptionLabel={option => option.name}
                    onChange={(event, value) => {
                      this.handleStateChange(event, value);
                    }}
                    value={
                      filterState
                        ? this.state.isCancel === true
                          ? null
                          : statesFilter[
                              statesFilter.findIndex(function(item, i) {
                                return item.id === filterState;
                              })
                            ] || null
                        : null
                    }
                    renderInput={params => (
                      <Input
                        {...params}
                        fullWidth
                        label="Select State"
                        error={this.hasError("addState")}
                    helperText={
                      this.hasError("addState")
                        ? this.state.errors.addState[0]
                        : null
                    }
                        name="addState"
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
               <Autocomplete
                    id="combo-box-demo"
                    options={districtsFilter}
                    name="filterDistrict"
                    getOptionLabel={option => option.name}
                    onChange={(event, value) => {
                      this.handleDistrictChange(event, value);
                    }}
                    value={
                      filterDistrict
                        ? this.state.isCancel === true
                          ? null
                          : districtsFilter[
                              districtsFilter.findIndex(function(item, i) {
                                return item.id === filterDistrict;
                              })
                            ] || null
                        : null
                    }
                    renderInput={params => (
                      <Input
                        {...params}
                        fullWidth
                        label="Select District"
                        error={this.hasError("addDistrict")}
                        helperText={
                          this.hasError("addDistrict")
                            ? this.state.errors.addDistrict[0]
                            : this.state.stateSelected
                        }
                        name="filterDistrict"
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
               
          
                <Grid item md={6} xs={12}>
                  <Autocomplete
                    id="combo-box-demo"
                    options={villagesFilter}
                    name="filterVillage"
                    getOptionLabel={option => option.name}
                    onChange={(event, value) => {
                      this.handleVillageChange(event, value);
                    }}
                    value={
                      filterVillage
                        ? this.state.isCancel === true
                          ? null
                          : villagesFilter[
                              villagesFilter.findIndex(function(item, i) {
                                return item.id === filterVillage;
                              })
                            ] || null
                        : null
                    }
                    renderInput={params => (
                      <Input
                        {...params}
                        fullWidth
                        label="Select Village"
                        error={this.hasError("addVillage")}
                        helperText={
                          this.hasError("addVillage")
                            ? this.state.errors.addVillage[0]
                            : null
                        }
                        name="filterVillage"
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
                  <Grid item md={12} xs={12}>
                   <Input
                    fullWidth
                    label="Address"
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
                    label="Point Of Contact"
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
                <Autocomplete
                    id="combo-box-demo"
                    options={statesFilter}
                    getOptionLabel={option => option.name}
                    onChange={(event, value) => {
                      this.handleStateChange(event, value);
                    }}
                    value={
                      filterState
                        ? this.state.isCancel === true
                          ? null
                          : statesFilter[
                              statesFilter.findIndex(function(item, i) {
                                return item.id === filterState;
                              })
                            ] || null
                        : null
                    }
                    renderInput={params => (
                      <Input
                        {...params}
                        fullWidth
                        label="Select VO"
                        name="addState"
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
                 <Grid item md={6} xs={12}>
                   <Input
                    fullWidth
                    label="Bank Account Name"
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
                    label="Account Number"
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
                    label="Bank Name"
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
                    label="Branch"
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
                    label="IFSC Code"
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
              </Grid>
            </CardContent>
            <Divider />
            <CardActions>
              <Button type="submit">Save</Button>
              <Button
                color="default"
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