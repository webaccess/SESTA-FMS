import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import axios from "axios";
import auth from "../../components/Auth/Auth";
import Button from "../../components/UI/Button/Button";
import Autocomplete from "../../components/Autocomplete/Autocomplete.js";
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
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

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
      checkedB: false,
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
        },
        addVo: {
          required: { value: "true", message: "Village Organization field required" }
        },
        addAddress: {
          required: { value: "true", message: "Address Organization field required" }
        },
        addPointOfContact: {
          required: { value: "true", message: "Point of Contact field required" }
        },
        addAccountName: {
          required: { value: "true", message: "Bank Account Name field required" }
        },
        addAccountNo: {
          required: { value: "true", message: "Account Number field required" }
        },
        addBankName: {
          required: { value: "true", message: "Bank Name field required" }
        },
        addBranch: {
          required: { value: "true", message: "Branch field required" }
        },
         addIfsc: {
          required: { value: "true", message: "IFSC field required" }
        },
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
      this.setState({checkedB: true})
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
          console.log("results",res.data[0].state)
          this.setState({
            values: {
              Villagesdata:res.data[0].villages,
              addShg: res.data[0].name,
              addAddress: res.data[0].address,
              addPointOfContact: res.data[0].person_incharge,
              // addVillage: res.data[0].name,
              filterDistrict: res.data[0].district,
              filterState: res.data[0].state.id
            }
          });
        })
        .catch(error => {
          console.log(error);
        });
      this.stateIds = this.state.values.addState;
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

    await axios
        .get(process.env.REACT_APP_SERVER_URL + "village-organizations/",{
          headers: {
            Authorization: "Bearer " + auth.getToken() + ""
          }
        })
        .then(res => {
          this.setState({ getVillageOrganization: res.data });
        })
        .catch(error => {
          console.log(error);
        });
  }

 handleStateChange = async (event, value) => {
    if (value !== null) {
      this.setState({ filterState: value.id });
      this.setState({
        isCancel: false
      });
      console.log("hgjasdjhsadjhsad")
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
      
      console.log("kehta hai dil",event.value)
    // if (value !== null) {
    //   this.setState({ filterVillage: value.id });
    //   console.log("village", this.state.filterVillage);
    // } else {
    //   this.setState({
    //     filterVillage: ""
    //   });
    //   console.log("village", this.state.filterVillage);
    // }
  }

  handleVoChange(event,value){
    if (value !== null) {
     console.log("gdgdgfgfgfgfgff",value.id)
     this.setState({filterVo :value.id});
      
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

  handleCheckBox = event => {
    this.setState({ ...this.state, [event.target.name]: event.target.checked });
  };

  handleSubmit = async e => {
    e.preventDefault();
    this.validate();
    this.setState({ formSubmitted: "" });
    console.log("aLLVALUES",this.state.addPointOfContact)
     console.log("State Id",this.state.filterState)
    console.log("District Id",this.state.filterDistrict)
    console.log("Village Id",this.state.filterVillage)
    console.log("shgname",this.state.values.addShg);
    let shgName = this.state.values.addShg;
    let shgAddress = this.state.values.addAddress;
    if (this.state.editPage[0]) {
    await axios
    .post(
      process.env.REACT_APP_SERVER_URL + "shgs/" +
        this.state.editPage[1],
      {
        name: this.state.values.addShg,
        address: shgAddress,
        person_incharge: this.state.values.addPointOfContact,
        state: {
          id: this.state.filterState
        },
        district: {
          id: this.state.filterDistrict
        },
        villages: [
          {
            id:  this.state.filterVillage
          },
        ],
        village_organization: {
          id: this.state.filterVo
        }
      },
      {
        headers: {
          Authorization: "Bearer " + auth.getToken() + ""
        }
      }
    )
    .then(res => {
      console.log("response from post",res.data)
      this.setState({ formSubmitted: true });
      this.props.history.push({ pathname: "/shgs", editData: true });
    })
    .catch(error => {
      console.log(error);
    });
    }else {
       await axios
    .post(
      process.env.REACT_APP_SERVER_URL + "shgs/",

      {
        name: this.state.values.addShg,
        address: shgAddress,
        person_incharge: this.state.values.addPointOfContact,
        state: {
          id: this.state.filterState
        },
        district: {
          id: this.state.filterDistrict
        },
        villages: [
          {
            id:  this.state.filterVillage
          },
        ],
        village_organization: {
          id: this.state.filterVo
        }
      },
      {
        headers: {
          Authorization: "Bearer " + auth.getToken() + ""
        }
      }
    )
    .then(res => {
      console.log("response from post",res)
       this.setState({ formSubmitted: true });

          this.props.history.push({ pathname: "/shgs", addData: true });
    })
    .catch(error => {
      console.log("Error  aya",error);
    });
    }
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
    console.log("State",this.state.filterState)
    console.log("District",this.state.filterDistrict)
    console.log("VO",this.state.filterVo)
    console.log("Village",this.state.filterVillage)
    // console.log("hshadshdsajsaddsa",this.state.values.addAddress)
    let statesFilter = this.state.getState;
    let voFilters = this.state.getVillageOrganization;
    let filterVo = this.state.filterVo;
    let filterState = this.state.filterState;
    let districtsFilter = this.state.getDistrict;
    let filterDistrict = this.state.filterDistrict;
    let villagesFilter = this.state.getVillage;
    let filterVillage = this.state.filterVillage;
    let isCancel = this.state.isCancel;
    let checked = this.state.checkedB;
    console.log("DFSDFDSFFSDFDDF",this.state.checkedB)
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
                  {this.state.formSubmitted === true ? (
                    <Snackbar severity="success">
                      Village added successfully.
                    </Snackbar>
                  ) : null} 
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
                    label="Select State"
                    variant="outlined"
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
                    label="Select District"
                    variant="outlined"
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
                    variant="outlined"
                    label="Select Village"
                    name="filterVillage"
                    multiple={true}
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
                        fullWidth
                        label="Select Village"
                        error={this.hasError("addVillage")}
                        helperText={
                          this.hasError("addVillage")
                            ? this.state.errors.addVillage[0]
                            : null
                        }
                        name="filterVillage"
                        value={this.state.Villagesdata || ""}
                        variant="outlined"
                      />
                    )}
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
                 <Grid item md={6} xs={12}>
                <Autocomplete
                    id="combo-box-demo"
                    options={voFilters}
                    variant="outlined"
                    label="Select VO"
                    getOptionLabel={option => option.name}
                    onChange={(event, value) => {
                      this.handleVoChange(event, value);
                    }}
                    value={
                      filterVo
                        ? this.state.isCancel === true
                          ? null
                          : voFilters[
                              voFilters.findIndex(function(item, i) {
                                return item.id === filterVo;
                              })
                            ] || null
                        : null
                    }
                    renderInput={params => (
                      <Input
                        fullWidth
                        label="Select VO"
                        name="addVo"
                        error={this.hasError("addVo")}
                        helperText={
                          this.hasError("addVo")
                            ? this.state.errors.addVo[0]
                            : null
                        }
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
                <Grid item md={12} xs={12}>
                 <FormGroup row>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={this.state.checkedB}
                        onChange={this.handleCheckBox}
                        name="checkedB"
                        color="primary"
                      />
                    }
                    label="Bank details"
                  />
                </FormGroup>
                 </Grid>
                 <Grid item md={6} xs={12}>
                   <Input
                    fullWidth
                    label="Bank Account Name"
                    disabled={ checked ? false : true}  
                    name="addAccountName"
                    error={this.hasError("addAccountName")}
                    helperText={
                      this.hasError("addAccountName")
                        ? this.state.errors.addAccountName[0]
                        : null
                    }
                    value={this.state.values.addAccountName || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                 <Grid item md={6} xs={12}>
                   <Input
                    fullWidth
                    label="Account Number"
                    name="addAccountNo"
                    disabled={ checked ? false : true}  
                    error={this.hasError("addAccountNo")}
                    helperText={
                      this.hasError("addAccountNo")
                        ? this.state.errors.addAccountNo[0]
                        : null
                    }
                    value={this.state.values.addAccountNo || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                 <Grid item md={6} xs={12}>
                   <Input
                    fullWidth
                    disabled={ checked ? false : true}        
                    label="Bank Name"
                    name="addBankName"
                    error={this.hasError("addBankName")}
                    helperText={
                      this.hasError("addBankName")
                        ? this.state.errors.addBankName[0]
                        : null
                    }
                    value={this.state.values.addBankName || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                 <Grid item md={6} xs={12}>
                   <Input
                    fullWidth
                    label="Branch"
                    disabled={ checked ? false : true}  
                    name="addBranch"
                    error={this.hasError("addBranch")}
                    helperText={
                      this.hasError("addBranch")
                        ? this.state.errors.addBranch[0]
                        : null
                    }
                    value={this.state.values.addBranch || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                 <Grid item md={6} xs={12}>
                   <Input
                    fullWidth
                    label="IFSC Code"
                    name="addIfsc"
                    disabled={ checked ? false : true}  
                    error={this.hasError("addIfsc")}
                    helperText={
                      this.hasError("addIfsc")
                        ? this.state.errors.addIfsc[0]
                        : null
                    }
                    value={this.state.values.addIfsc || ""}
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
                to="/shgs"
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