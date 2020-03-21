import React from "react";
import axios from "axios";
import Table from "../../components/Datatable/Datatable.js";
import Layout from "../../hoc/Layout/Layout";
import Input from "../../components/UI/Input/Input";
import { map } from "lodash";
import validateInput from "../../components/Validation/ValidateInput/ValidateInput";
import Button from '../../components/UI/Button/Button.js'
import { withStyles } from "@material-ui/core/styles";
<<<<<<< HEAD
import style from "./Villages.module.css";
import Grid from '@material-ui/core/Grid';
import { Link } from "react-router-dom";
=======
import { Link } from "react-router-dom";
import style from "./Villages.module.css";
import { Grid } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Input from "../../components/UI/Input/Input";
>>>>>>> b048a09c597ca7957afb966ac0bec444364cec81
import auth from "../../components/Auth/Auth.js";
import { useTheme } from "@material-ui/styles";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
<<<<<<< HEAD
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useMediaQuery } from "@material-ui/core";

const useStyles = theme => ({
  root: {},
  row: {
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
  },
  buttonRow: {
    height: '42px',
    marginTop: theme.spacing(1),
=======
const useStyles = theme => ({
  root: {},
  row: {
    height: "42px",
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(1)
  },
  buttonRow: {
    height: "42px",
    marginTop: theme.spacing(1)
>>>>>>> b048a09c597ca7957afb966ac0bec444364cec81
  },
  spacer: {
    flexGrow: 1
  },
  addButton: {
    // float: "right",
    marginRight: theme.spacing(1)
  },
  searchInput: {
    marginRight: theme.spacing(1)
  },
  Districts: {
<<<<<<< HEAD
=======
    marginRight: theme.spacing(1)
  },
  States: {
    marginRight: theme.spacing(1)
  },
  Search: {
    marginRight: theme.spacing(1)
  },
  Cancel: {
>>>>>>> b048a09c597ca7957afb966ac0bec444364cec81
    marginRight: theme.spacing(1)
  },
  States: {
    marginRight: theme.spacing(1)
  },
  Search: {
    marginRight: theme.spacing(1)
  },
  Cancel: {
    marginRight: theme.spacing(1)
  },
});

export class villages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
<<<<<<< HEAD
      filterText: (''),
=======
      values: {},
      filterState: "",
      filterDistrict: "",
      filterVillage: "",
      Result: [],
      TestData: [],
>>>>>>> b048a09c597ca7957afb966ac0bec444364cec81
      data: [],
      selectedid: 0,
      getDistrict: [],
      columnsvalue: [],
<<<<<<< HEAD
      getState: [],
      values: [],
      stateSelected: [],
      formSubmitted: "",
      addVillage: [],
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
    };
  }
  handleStateChangeAutoComplete = (event, value) => {
    if (value !== null) {
      this.setState({
        values: { ...this.state.values, stateFilter: value.name, addState: value.name }
      });
      axios
        .get(
          process.env.REACT_APP_SERVER_URL + "districts?master_state.id=" + value.id,
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
        values: { ...this.state.values, stateFilter: "", districtFilter: "" },
        getDistrict: []
      });
    }
  };

  handleDistrictChangeAutoComplete = (event, value) => {
    if (value !== null) {
      this.setState({
        values: { ...this.state.values, districtFilter: value.name, addDistrict: value.name }
      });
    } else {
      this.setState({
        values: { ...this.state.values, districtFilter: "" }
      });
    }
  };

=======
      DeleteData: false,
      properties: props,
      getState: [],
      getDistrict: [],
      getVillage: [],
      isCancel: false,
      dataCellId: [],
      singleDelete: "",
      multipleDelete: ""
    };
  }
>>>>>>> b048a09c597ca7957afb966ac0bec444364cec81
  async componentDidMount() {
    await axios
      .get(process.env.REACT_APP_SERVER_URL + "villages/?_sort=name:ASC", {
        headers: {
          Authorization: "Bearer " + auth.getToken() + ""
        }
      })
      .then(res => {
<<<<<<< HEAD
        let getStateName = [];
        for (let i in res.data) {
          if (res.data[i]["state"] !== res.data[i]["state"]) {
            getStateName.push(res.data[i]["state"]["id"])
          }
        }
        this.setState({ data: res.data });
=======
        this.setState({ data: this.getData(res.data) });
      });
    //api call for states filter
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
>>>>>>> b048a09c597ca7957afb966ac0bec444364cec81
      });
    await axios
      .get(
        process.env.REACT_APP_SERVER_URL + "states",
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + ""
          }
        }
      )
      .then(res => {
        this.setState({ getState: res.data });
      })
      .catch(error => {
        console.log(error);
      });
  }
<<<<<<< HEAD

  editData = cellid => {
    this.props.history.push("/villages/edit/" + cellid);
  };

  DeleteAll = (selectedId, cellid) => {
    if (selectedId) {
      for (let i in selectedId) {
        axios
          .delete(process.env.REACT_APP_SERVER_URL + "villages/" + selectedId[i], {
            headers: {
              Authorization: "Bearer " + auth.getToken() + ""
            }
          })
          .then(res => {
            this.componentDidMount();
          })
          .catch(error => {
            console.log(error.response);
            console.log(selectedId);
          });
      }
    };
  }

  DeleteData = (cellid, selectedId) => {
    if (cellid.length > 0) {
=======
  getData(result) {
    for (let i in result) {
      let villages = [];
      for (let j in result[i].villages) {
        villages.push(result[i].villages[j].name + " ");
        console.log("push");
      }
      result[i]["villages"] = villages;
    }
    console.log("final data", result);
    return result;
  }
  handleStateChange = async (event, value) => {
    if (value !== null) {
      this.setState({ filterState: value.id });

      this.setState({
        isCancel: false
      });
      console.log("state", this.state.filterState);
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
  handleDistrictChange(event, value) {
    if (value !== null) {
      this.setState({ filterDistrict: value.id });

      let distId = value.id;
      axios
        .get(process.env.REACT_APP_SERVER_URL + "districts/" + distId, {
          headers: {
            Authorization: "Bearer " + auth.getToken() + ""
          }
        })
        .then(res => {
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
    }
  }
  handleVillageChange(event, value, target) {
    this.setState({
      values: { ...this.state.values, [event.target.name]: event.target.value }
    });
  }
  editData = cellid => {
    this.props.history.push("/villages/edit/" + cellid);
  };

  DeleteData = (cellid, selectedId) => {
    if (cellid.length !== null && selectedId < 1) {
      this.setState({ singleDelete: "", multipleDelete: "" });
>>>>>>> b048a09c597ca7957afb966ac0bec444364cec81
      axios
        .delete(process.env.REACT_APP_SERVER_URL + "villages/" + cellid, {
          headers: {
            Authorization: "Bearer " + auth.getToken() + ""
          }
        })
        .then(res => {
<<<<<<< HEAD
=======
          this.setState({ singleDelete: res.data.name });
          this.setState({ dataCellId: "" });
>>>>>>> b048a09c597ca7957afb966ac0bec444364cec81
          this.componentDidMount();
        })
        .catch(error => {
          this.setState({ singleDelete: false });
          console.log(error);
        });
    };
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
<<<<<<< HEAD
  };

  handleChange = ({ target }) => {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value }
    });
  };

  filters = (values, row) => {
    this.setState({ filterText: this.state.values })
  }

  handleSubmit = (e) => {
    console.log("handle Submit", this.state.filterText)
    e.preventDefault();
    this.validate();
    if (this.state.values.addVillage && this.state.values.stateFilter && this.state.values.districtFilter) {
      axios
        .get(
          process.env.REACT_APP_SERVER_URL +
          "villages?name_contains=" + this.state.values.addVillage + "&&state.name=" + this.state.values.stateFilter + "&&district.name=" + this.state.values.districtFilter,
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + ""
            }
          }
        )
        .then(res => {
          console.log("Handle Submit Data", this.state.values.addVillage.toLowerCase());
          this.setState({ data: res.data })
        })
        .catch(error => {
          console.log(error);
        });
=======
    // }

  };
  DeleteAll = selectedId => {
    if (selectedId.length !== 0) {
      this.setState({ singleDelete: "", multipleDelete: "" });
      for (let i in selectedId) {
        axios
          .delete(
            process.env.REACT_APP_SERVER_URL + "villages/" + selectedId[i],
            {
              headers: {
                Authorization: "Bearer " + auth.getToken() + ""
              }
            }
          )
          .then(res => {
            this.setState({ multipleDelete: true });
            this.componentDidMount();
          })
          .catch(error => {
            this.setState({ multipleDelete: false });
            console.log("err", error);
          });
      }
>>>>>>> b048a09c597ca7957afb966ac0bec444364cec81
    }
  }

  cancelForm = () => {
    this.setState({
      values: [],
      stateSelected: false,
      addDistrict: []
    });
    this.componentDidMount();
  };

  cancelForm = () => {
    this.setState({
      filterState: "",
      filterDistrict: "",
      filterVillage: "",
      values: {},
      formSubmitted: "",
      stateSelected: false,
      isCancel: true
    });
    this.componentDidMount();
    //routing code #route to village_list page
  };

  handleChange = ({ target }) => {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value }
    });
  };

  handleSearch() {
    let searchData = "";
    if (this.state.filterState) {
      searchData += "state.id=" + this.state.filterState + "&&";
    }
    if (this.state.filterDistrict) {
      searchData += "district.id=" + this.state.filterDistrict + "&&";
    } if (this.state.values.addVillage) {
      searchData += "name_contains=" + this.state.values.addVillage;
    }
    axios
      .get(
        process.env.REACT_APP_SERVER_URL +
        "villages?" +
        searchData +
        "&&_sort=name:ASC",
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + ""
          }
        }
      )
      .then(res => {
        this.setState({ data: this.getData(res.data) });
      })
      .catch(err => {
        console.log("err", err);
      });
  }

  render() {
    let data = this.state.data;
    const Usercolumns = [
      {
        name: "Village Name",
        selector: "name",
        sortable: true
      },
      {
        name: "District Name",
        selector: "district.name",
        sortable: true,
      },
      {
        name: "State Name",
        selector: "state.name",
        sortable: true
      }
    ];

    let selectors = [];
    for (let i in Usercolumns) {
      selectors.push(Usercolumns[i]["selector"]);
    }
<<<<<<< HEAD
    // const theme = useTheme();
    // const isDesktop = useMediaQuery(theme.breakpoints.up("lg"), {
    //   defaultMatches: true
    // });
=======

>>>>>>> b048a09c597ca7957afb966ac0bec444364cec81
    let columnsvalue = selectors[0];
    let filters = this.state.values;
    const { classes } = this.props;
    let statesFilter = this.state.getState;
    let filterState = this.state.filterState;
    let districtsFilter = this.state.getDistrict;
    let filterDistrict = this.state.filterDistrict;
    let villagesFilter = this.state.getVillage;
    let filterVillage = this.state.filterVillage;
    let filters = this.state.values;
    return (
      <Layout>
<<<<<<< HEAD
        <div className={classes.root}>
          <h1 className={style.title}>Villages</h1>
          <Grid >
            <div className={classes.buttonRow}>
              <div className={classes.addButton}>
=======
        <Grid>
          <div className="App">
            <h1 className={style.title}>Villages</h1>
            <div className={classes.row}>
              <div className={classes.buttonRow}>
>>>>>>> b048a09c597ca7957afb966ac0bec444364cec81
                <Button
                  color="primary"
                  variant="contained"
                  component={Link}
                  to="/Villages/add"
                >
                  Add Village
<<<<<<< HEAD
              </Button>
              </div>
            </div>
            {this.props.location.addData ? (
              <Snackbar severity="success">Village added successfully.</Snackbar>
            ) : this.props.location.editData ? (
              <Snackbar severity="success">Village edited successfully.</Snackbar>
            ) : null}
            <br></br>
            <div>
              <form
                autoComplete="off"
                noValidate
                onSubmit={this.handleSubmit}
              >
                {/* {isDesktop ? <h1>helloooooo</h1> : <h1>ghdsghsdgfsdg</h1>} */}
                <div className={classes.row}>
                  <div className={classes.searchInput}>
                    <div className={style.Districts}>
                      <Input
                        id="outlined-basic"
                        type="search"
                        label="Village Name"
                        variant="outlined"
                        name={"addVillage"}
                        onChange={this.handleChange}
                        value={this.state.values.addVillage}
                        error={this.hasError("addVillage")}
                        helperText={
                          this.hasError("addVillage")
                            ? this.state.errors.addVillage[0]
                            : null
                        }
                      />
                    </div>
                  </div>
                  <div className={classes.States}>
                    <div className={style.Districts}>
                      <Autocomplete
                        id="combo-box-demo"
                        onfocus="this.value=''"
                        options={this.state.getState}
                        onChange={this.handleStateChangeAutoComplete}
                        getOptionLabel={option => option.name}
                        renderInput={params => (
                          <Input
                            {...params}
                            label="Select State"
                            variant="outlined"
                            name="addState"
                            error={this.hasError("addState")}
                            helperText={
                              this.hasError("addState")
                                ? this.state.errors.addState[0]
                                : null
                            }
                            value={this.state.values.addState || ""}
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className={classes.Districts}>
                    <div className={style.Districts}>
                      <Autocomplete
                        id="combo-box-demo"
                        onChange={this.handleDistrictChangeAutoComplete}
                        options={this.state.getDistrict}
                        getOptionLabel={option => option.name}
                        renderInput={params => (
                          <Input
                            {...params}
                            label="Select District"
                            variant="outlined"
                            name="addDistrict"
                            onChange={this.handleChange}
                            error={this.hasError("addDistrict")}
                            helperText={
                              this.hasError("addDistrict")
                                ? this.state.errors.addDistrict[0]
                                : this.state.stateSelected
                              // ? null
                              // : "Please select the state first"
                            }
                            value={this.state.values.addDistrict || ""}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className={classes.Search}>
                    <Button
                      color="primary"
                      variant="contained"
                      type="submit"
                    >
                      Search
                  </Button>
                  </div>
                  <div className={classes.Cancel}>
                    <Button
                      color="default"
                      clicked={this.cancelForm}
                      component={Link}
                      to="/Villages"
                    >
                      cancel
                  </Button>
                  </div>
                </div>
              </form>
=======
                </Button>
              </div>
            </div>
            {this.props.location.addData ? (
              <Snackbar severity="success">
                Village added successfully.
              </Snackbar>
            ) : this.props.location.editData ? (
              <Snackbar severity="success">
                Village edited successfully.
              </Snackbar>
            ) : null}
            {this.state.singleDelete !== false &&
              this.state.singleDelete !== "" &&
              this.state.singleDelete ? (
                <Snackbar severity="success" Showbutton={false}>
                  Village {this.state.singleDelete} deleted successfully!
                </Snackbar>
              ) : null}
            {this.state.singleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === true ? (
              <Snackbar severity="success" Showbutton={false}>
                Villages deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            <br></br>
            <div className={classes.row}>
              <div className={classes.searchInput}>
                <div className={style.Districts}>
                  <Grid item md={12} xs={12}>
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
                            statesFilter.findIndex(function (item, i) {
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
                          name="addState"
                          variant="outlined"
                        />
                      )}
                    />
                  </Grid>
                </div>
              </div>
              <div className={classes.searchInput}>
                <div className={style.Districts}>
                  <Grid item md={12} xs={12}>
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
                            districtsFilter.findIndex(function (item, i) {
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
                          name="filterDistrict"
                          variant="outlined"
                        />
                      )}
                    />
                  </Grid>
                </div>
              </div>
              <div className={classes.searchInput}>
                <div className={style.Districts}>
                  <Grid item md={12} xs={12}>
                    {/* <Autocomplete
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
                      renderInput={params => ( */}
                    <Input
                      fullWidth
                      label="Select Village"
                      name="addVillage"
                      variant="outlined"
                      onChange={(event, value) => {
                        this.handleVillageChange(event, value);
                      }}
                      value={this.state.values.addVillage || ""}
                    />
                  </Grid>
                </div>
              </div>
              <br></br>
              <Button onClick={this.handleSearch.bind(this)}>Search</Button>
              &nbsp;&nbsp;&nbsp;
              <Button color="default" clicked={this.cancelForm}>
                cancel
              </Button>
            </div>
            {data ? (
>>>>>>> b048a09c597ca7957afb966ac0bec444364cec81
              <Table
                title={"Villages"}
                showSearch={false}
                filterData={true}
<<<<<<< HEAD
=======
                // noDataComponent={"No Records To be shown"}
>>>>>>> b048a09c597ca7957afb966ac0bec444364cec81
                Searchplaceholder={"Seacrh by Village Name"}
                filterBy={["name", "state.name"]}
                filters={filters}
                data={data}
                column={Usercolumns}
                editData={this.editData}
                DeleteData={this.DeleteData}
                DeleteAll={this.DeleteAll}
                rowsSelected={this.rowsSelect}
                columnsvalue={columnsvalue}
                DeleteMessage={"Are you Sure you want to Delete"}
              />
<<<<<<< HEAD
            </div>
          </Grid>
        </div>

=======
            ) : (
                <h1>Loading...</h1>
              )}
          </div>
        </Grid>
>>>>>>> b048a09c597ca7957afb966ac0bec444364cec81
      </Layout>
    );
  }
}
<<<<<<< HEAD
export default withStyles(useStyles)(VillageList);
=======
export default withStyles(useStyles)(villages);
>>>>>>> b048a09c597ca7957afb966ac0bec444364cec81
