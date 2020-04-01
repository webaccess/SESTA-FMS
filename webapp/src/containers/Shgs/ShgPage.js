import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import axios from "axios";
import auth from "../../components/Auth/Auth";
import Button from "../../components/UI/Button/Button";
import Autocomplete from "../../components/Autocomplete/Autocomplete.js";
import Autosuggest from "../../components/Autosuggest/Autosuggest.js";
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
      bankValues:{},
      addState: "",
      addShg: "",
      addDistrict: "",
      addVillage: "",
      getState: [],
      checkedB: false,
      getDistrict: [],
      getVillage: [],
      getVillageOrganization:[],
      validations: {
        addShg: {
          required: { value: "true", message: "Shg field required" }
        },
        // addVillage: {
        //   required: { value: "true", message: "Village field required" }
        // },
        addState: {
          required: { value: "true", message: "State field required" }
        },
        addDistrict: {
          required: { value: "true", message: "District field required" }
        },
        addVo: {
          required: {
            value: "true",
            message: "Village Organization field required"
          }
        },
        addAddress: {
          required: {
            value: "true",
            message: "Address field required"
          }
        },
        addPointOfContact: {
          required: {
            value: "true",
            message: "Point of Contact field required"
          }
        },
        addAccountName: {
          required: {
            value: "true",
            message: "Bank Account Name field required"
          }
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
        }
      },
      errors: {
        addVillage: [],
        addState: [],
        addDistrict: [],
        addVo: []
      },
      bankErrors: {},
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
      let stateId ="";
      this.setState({ checkedB: true });
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
          console.log("results", res.data);
          this.setState({
            values: {
              addShg: res.data[0].name,
              addAddress: res.data[0].address,
              addPointOfContact: res.data[0].person_incharge,
              addDistrict: res.data[0].district.id,
              addVillage: res.data[0].villages[0].id,
              addState: res.data[0].state.id,
 	            addVo: res.data[0].village_organization.id, 
            },
          });
          if(res.data[0].bank_detail !== null) {
          this.setState({
           bankValues:{
              addAccountName: res.data[0].bank_detail.account_name,
              addBankName: res.data[0].bank_detail.bank_name,
              addAccountNo: res.data[0].bank_detail.account_no,
              addIfsc: res.data[0].bank_detail.ifsc_code,
              addBranch: res.data[0].bank_detail.branch,
          }})
          }else{
          this.setState({
            checkedB: false
          })}

          stateId = res.data[0].state.id;
        })
        .catch(error => {
          console.log(error);
        });
     
      //api call 3 for  getting district list
      await axios
        .get(
          process.env.REACT_APP_SERVER_URL +
            "districts?master_state.id=" +
            stateId, //value recovered from shg api call state value
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + ""
            }
          }
        )
        .then(res => {
          this.setState({ getDistrict: res.data }); // district list data
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

    await axios
      .get(process.env.REACT_APP_SERVER_URL + "village-organizations/", {
        headers: {
          Authorization: "Bearer " + auth.getToken() + ""
        }
      })
      .then(res => {
        this.setState({ getVillageOrganization: res.data });
        console.log("dataaaa", res.data);
      })
      .catch(error => {
        console.log(error);
      });
  }

  handleStateChange = async (event, value) => {
    if (value !== null) {
      this.setState({
        values: { ...this.state.values, addState: value.id }
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
        values: {
          ...this.state.values,
          addState: "",
          addDistrict: "",
          filterVillage: "",
          addVillage: ""
        }
      });
    }
  };

  handleChange = ({ target }) => {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value },
      bankValues: { ...this.state.values, [target.name]: target.value }
    });
  };

  handleDistrictChange(event, value) {
    if (value !== null) {
      this.setState({
        values: { ...this.state.values, addDistrict: value.id }
      });
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
        values: {
          ...this.state.values,
          addDistrict: "",
          filterVillage: "",
          addVillage: ""
        }
      });
    }
  }

  handleVillageChange(event, value) {
    console.log("kehta hai dil", value);
    let villageValue = [];
    console.log("sddsfdfs",value.length)
    for(let i in value){
        villageValue.push('id:'+value[i]['id']);
    }
    console.log("asdsadhdsahsadhdsah",villageValue)
     console.log("test",villageValue)
    if (value !== null) {
      this.setState({
        values: { ...this.state.values, addVillage: villageValue }
      });
      console.log("village", this.state.addVillage);
    } else {
      this.setState({
        addVillage: ""
      });
      console.log("village", this.state.addVillage);
    }
  }

  handleVoChange(event, value) {
    if (value !== null) {
      this.setState({
        values: { ...this.state.values, addVo: value.id }
      });
    } else {
      this.setState({
        values: {
          ...this.state.values,
          addVo: ""
        }
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

  bankValidate = () => {
     if (this.state.checkedB){
      const bankValues = this.state.bankValues;
      const validations = this.state.validations;
      map(validations, (validation, key) => {
        let value = bankValues[key] ? bankValues[key] : "";
        const bankErrors = validateInput(value, validation);
        let errorset = this.state.bankErrors;
        if (bankErrors.length > 0) errorset[key] = bankErrors;
        else delete errorset[key];
        this.setState({ bankErrors: errorset });
      });
    }
  };

  hasError = field => {
    if (this.state.errors[field] !== undefined) {
      return Object.keys(this.state.errors).length > 0 &&
        this.state.errors[field].length > 0
        ? true
        : false;
    }
  };

  hasBankError = field => {
    if (this.state.checkedB) {
      if (this.state.bankErrors[field] !== undefined) {
        return Object.keys(this.state.bankErrors).length > 0 &&
          this.state.bankErrors[field].length > 0
          ? true
          : false;
      }
    }
  };

  handleCheckBox = event => {
    this.setState({ ...this.state, [event.target.name]: event.target.checked });
    this.setState({ bankValues : {}});
    this.setState({ hasBankError: '' });
  };

  handleSubmit = async e => {
    e.preventDefault();
    this.validate();
    if (this.state.checkedB){
      this.bankValidate();
    }
    this.setState({ formSubmitted: "" });
    // if (Object.keys(this.state.errors).length > 0) return;
    let shgName = this.state.values.addShg;
    let shgAddress = this.state.values.addAddress;
    let shgPersonInCharge = this.state.values.addPointOfContact;
    let shgState = this.state.values.addState;
    let shgDistrict = this.state.values.addDistrict;
    let shgVillage = this.state.values.addVillage;
    let shgVo = this.state.values.addVo;

    console.log("sdghasdghsadhgsad",Object.keys(this.state.errors).length)
    let bankId = [];
    let body = {

    }
    // if (Object.keys(this.state.errors).length > 0) return;
    if (this.state.editPage[0]) {
    await axios
    .put(
      process.env.REACT_APP_SERVER_URL + "shgs/" +
        this.state.editPage[1],
      {
        name: shgName,
        address: shgAddress,
        person_incharge: shgPersonInCharge,
        state: {
          id: shgState
        },
        district: {
          id: shgDistrict
        },
        villages: [
          {
           id: shgVillage
          },
        ],
        village_organization: {
          id: shgVo
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
        name: shgName,
        address: shgAddress,
        person_incharge: shgPersonInCharge,
        state: {
          id: shgState
        },
        district: {
          id: shgDistrict
        },

        villages: 
           shgVillage
          ,
        village_organization: {
          id: shgVo
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
       let bankId = res.data.id
       this.setState({ bankDeatilsId: bankId });
       this.handleBankDetails(bankId);   // 
       this.props.history.push({ pathname: "/shgs", addData: true });
    })
    .catch(error => {
      console.log("Error  aya",error);
    });
    }
  };

 handleBankDetails = async (bankId )=> {
   if (this.state.checkedB){
    await axios
  .post(
    process.env.REACT_APP_SERVER_URL + "bank-details?shg=", 

    {
      account_name: this.state.values.addAccountName,
      account_no: this.state.values.addAccountName,
      bank_name: this.state.values.addBankName,
      branch: this.state.values.addBranch,
      ifsc_code: this.state.values.addIfsc,
      shg: this.state.bankDeatilsId
    },
    {
      headers: {
        Authorization: "Bearer " + auth.getToken() + ""
      }
    }
  )
  .then(res => {
    this.setState({ formSubmitted: true });

    this.props.history.push({ pathname: "/Shgs", addData: true });
  })
  .catch(error => {
    this.setState({ formSubmitted: false });
    console.log(error);
    console.log("formsubmitted", this.state.formSubmitted);
  });
}
  };

  cancelForm = () => {
    this.setState({
      values: {},
      formSubmitted: "",
      stateSelected: false
    });
  };

  render() {
    console.log("all the value", auth.getToken())
    console.log("checked", this.state.checkedB);
    let statesFilter = this.state.getState;
    let voFilters = this.state.getVillageOrganization;
    let addVo = this.state.values.addVo;
    let addState = this.state.values.addState;
    let districtsFilter = this.state.getDistrict;
    let addDistrict = this.state.values.addDistrict;
    let villagesFilter = this.state.getVillage;
    let addVillage = this.state.values.addVillage;
    let isCancel = this.state.isCancel;
    let checked = this.state.checkedB;

    return (
      <Layout
        breadcrumbs={
          this.state.editPage[0] ? EDIT_SHG_BREADCRUMBS : ADD_SHG_BREADCRUMBS
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
                      Shg added successfully.
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
                  <Autosuggest
                    id="combo-box-demo"
                    options={statesFilter}
                    label="Select State"
                    variant="outlined"
                    getOptionLabel={option => option.name}
                    onChange={(event, value) => {
                      this.handleStateChange(event, value);
                    }}
                    value={
                      addState
                        ? this.state.isCancel === true
                          ? null
                          : statesFilter[
                              statesFilter.findIndex(function(item, i) {
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
                    renderInput={params => (
                      <Input
                        fullWidth
                        label="Select State"
                        name="addState"
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Autosuggest
                    id="combo-box-demo"
                    options={districtsFilter}
                    label="Select District"
                    variant="outlined"
                    name="addDistrict"
                    getOptionLabel={option => option.name}
                    onChange={(event, value) => {
                      this.handleDistrictChange(event, value);
                    }}
                    value={
                      addDistrict
                        ? this.state.isCancel === true
                          ? null
                          : districtsFilter[
                              districtsFilter.findIndex(function(item, i) {
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
                    }
                    renderInput={params => (
                      <Input
                        fullWidth
                        label="Select District"
                        name="addDistrict"
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                    <Autocomplete
                    id="combo-box-demo"
                    options={villagesFilter}
                    multiple={true}
                    variant="outlined"
                    label="Select Village"
                    name="addVillage"
                    getOptionLabel={option => option.name}
                    onChange={(event, value) => {
                      this.handleVillageChange(event, value);
                    }}
                    value={
                      addVillage
                        ? this.state.isCancel === true
                          ? null
                          : villagesFilter[
                              villagesFilter.findIndex(function(item, i) {
                                return item.id === addVillage;
                              })
                            ] || null
                        : null
                    }
                     error={this.hasError("addVillage")}
                     helperText={
                      this.hasError("addVillage")
                        ? this.state.errors.addVillage[0]
                        : null
                    }
                    renderInput={params => (
                      <Input
                        fullWidth
                        label="Select Village"
                        name="addVillage"
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
                  <Autosuggest
                    id="combo-box-demo"
                    options={voFilters}
                    variant="outlined"
                    label="Select VO"
                    getOptionLabel={option => option.name}
                    onChange={(event, value) => {
                      this.handleVoChange(event, value);
                    }}
                    value={
                      addVo
                        ? this.state.isCancel === true
                          ? null
                          : voFilters[
                              voFilters.findIndex(function(item, i) {
                                return item.id === addVo;
                              })
                            ] || null
                        : null
                    }
                    error={this.hasError("addVo")}
                    helperText={
                      this.hasError("addVo") ? this.state.errors.addVo[0] : null
                    }
                    renderInput={params => (
                      <Input
                        fullWidth
                        label="Select VO"
                        name="addVo"
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
                    disabled={checked ? false : true}
                    name="addAccountName"
                    error={this.hasBankError("addAccountName")}
                    helperText={
                      this.hasBankError("addAccountName")
                        ? this.state.bankErrors.addAccountName[0]
                        : null
                    }
                    value={this.state.bankValues.addAccountName || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Account Number"
                    name="addAccountNo"
                    disabled={checked ? false : true}
                    error={this.hasBankError("addAccountNo")}
                    helperText={
                      this.hasBankError("addAccountNo")
                        ? this.state.bankErrors.addAccountNo[0]
                        : null
                    }
                    value={this.state.bankValues.addAccountNo || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    disabled={checked ? false : true}
                    label="Bank Name"
                    name="addBankName"
                    error={this.hasBankError("addBankName")}
                    helperText={
                      this.hasBankError("addBankName")
                        ? this.state.bankErrors.addBankName[0]
                        : null
                    }
                    value={this.state.bankValues.addBankName || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Branch"
                    disabled={checked ? false : true}
                    name="addBranch"
                    error={this.hasBankError("addBranch")}
                    helperText={
                      this.hasBankError("addBranch")
                        ? this.state.bankErrors.addBranch[0]
                        : null
                    }
                    value={this.state.bankValues.addBranch || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="IFSC Code"
                    name="addIfsc"
                    disabled={checked ? false : true}
                    error={this.hasBankError("addIfsc")}
                    helperText={
                      this.hasBankError("addIfsc")
                        ? this.state.bankErrors.addIfsc[0]
                        : null
                    }
                    value={this.state.bankValues.addIfsc || ""}
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
