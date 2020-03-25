import React from "react";
import axios from "axios";
import Table from "../../components/Datatable/Datatable.js";
import Layout from "../../hoc/Layout/Layout";
import Button from "@material-ui/core/Button";
import { withStyles, ThemeProvider } from "@material-ui/core/styles";
import style from "./Vo.module.css";
import { Redirect, Route } from "react-router-dom";
import { Link } from "react-router-dom";
import Spinner from "../../components/Spinner";
import auth from "../../components/Auth/Auth.js";
import Input from "../../components/UI/Input/Input";
import AutoSuggest from "../../components/UI/Autosuggest/Autosuggest";
import { Grid } from "@material-ui/core";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Select from "@material-ui/core/Select";
import PrivateRoute from "../../hoc/PrivateRoute/PrivateRoute";
import Vopage from "./Vopage";

import { createBrowserHistory } from "history";

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
  },
  spacer: {
    flexGrow: 1
  },
  addButton: {
    float: "right",
    marginRight: theme.spacing(1)
  },
  searchInput: {
    marginRight: theme.spacing(1)
  },
  Districts: {
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
  }
});

export class VillageList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterState: "",
      filterDistrict: "",
      filterVillage: "",
      Result: [],
      data: [],
      selectedid: 0,
      open: false,
      columnsvalue: [],
      DeleteData: false,
      properties: props,
      getState: [],
      getDistrict: [],
      getVillage: [],
      getShgs: [],
      selectedShg: [],
      isCancel: false,
      singleDelete: "",
      multipleDelete: ""
    };

    let history = props;
  }

  async componentDidMount() {
    await axios
      .get(
        process.env.REACT_APP_SERVER_URL +
          "village-organizations/?_sort=name:ASC",
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + ""
          }
        }
      )
      .then(res => {
        this.setState({ data: res.data });
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
      });

    //api call for villages filter
    await axios
      .get(process.env.REACT_APP_SERVER_URL + "Villages/", {
        headers: {
          Authorization: "Bearer " + auth.getToken() + ""
        }
      })
      .then(res => {
        this.setState({ getVillage: res.data });
      })
      .catch(error => {
        console.log(error);
      });
    //api for shgs filter
    await axios
      .get(process.env.REACT_APP_SERVER_URL + "shgs/", {
        headers: {
          Authorization: "Bearer " + auth.getToken() + ""
        }
      })
      .then(res => {
        this.setState({ getShgs: res.data });
      })
      .catch(error => {
        console.log(error);
      });
  }
  handleChange = (event, value) => {};
  handleStateChange = async (event, value, method) => {
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
    }
  };
  handleDistrictChange(event, value) {
    if (value !== null) {
      this.setState({ filterDistrict: value.id });
    } else {
      this.setState({
        filterDistrict: ""
        // filterVillage: ""
      });
    }
  }
  handleVillageChange(event, value) {
    if (value !== null) {
      this.state.filterVillage = value.id;
    } else {
      this.setState({
        filterVillage: ""
      });
    }
    this.setState({ selectedShg: "" });
  }
  editData = cellid => {
    this.props.history.push("/village-organizations/edit/" + cellid);
  };

  DeleteData = (cellid, selectedId) => {
    if (cellid.length !== null) {
      this.setState({ singleDelete: "", multipleDelete: "" });

      axios
        .delete(
          process.env.REACT_APP_SERVER_URL + "village-organizations/" + cellid,
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + ""
            }
          }
        )
        .then(res => {
          this.setState({ singleDelete: res.data.name });
          this.componentDidMount();
        })
        .catch(error => {
          this.setState({ singleDelete: false });
          console.log(error.response);
        });
    }
  };
  DeleteAll = selectedId => {
    if (selectedId.length !== 0) {
      this.setState({ singleDelete: "", multipleDelete: "" });
      for (let i in selectedId) {
        axios
          .delete(
            process.env.REACT_APP_SERVER_URL +
              "village-organizations/" +
              selectedId[i],
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
    }
  };
  cancelForm = () => {
    this.setState({
      filterState: "",
      filterDistrict: "",
      filterVillage: "",
      selectedShg: "",
      isCancel: true
    });

    this.componentDidMount();
  };
  handleSearch() {
    let searchData = "";
    if (
      this.state.filterState ||
      this.state.filterDistrict ||
      this.state.filterDistrict ||
      this.state.selectedShg
    )
      searchData = "?";
    if (this.state.selectedShg) {
      searchData += "shgs.id=" + this.state.selectedShg["id"];
    }
    if (this.state.filterState) {
      searchData += searchData ? "&" : "";
      searchData += "shgs.state=" + this.state.filterState;
    }

    if (this.state.filterDistrict) {
      searchData += searchData ? "&" : "";
      searchData += "shgs.district=" + this.state.filterDistrict;
    }

    if (
      (this.state.filterVillage && this.state.filterDistrict) ||
      this.state.filterState ||
      this.state.selectedShg
    ) {
      searchData += searchData ? "&" : "";
      searchData += "shgs.villages=" + this.state.filterVillage;
    } else {
      searchData += "shgs.villages=" + this.state.filterVillage;
    }

    //api call after search filter
    axios
      .get(
        process.env.REACT_APP_SERVER_URL + "village-organizations" + searchData,
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + ""
          }
        }
      )
      .then(res => {
        this.setState({ data: res.data });
      })
      .catch(err => {
        console.log("err", err);
      });
  }
  onHandleChange = shgValue => {
    this.setState({
      isCancel: false
    });
    this.setState({ selectedShg: shgValue });
  };

  render() {
    let data = this.state.data;
    if (data.length !== 0) {
    }

    const Usercolumns = [
      {
        name: "Name of the Village Organizations",
        selector: "name"
      }
    ];

    let selectors = [];
    for (let i in Usercolumns) {
      selectors.push(Usercolumns[i]["selector"]);
    }

    let columnsvalue = [0];
    const { classes } = this.props;
    let statesFilter = this.state.getState;
    let filterState = this.state.filterState;
    let districtsFilter = this.state.getDistrict;
    let filterDistrict = this.state.filterDistrict;
    let villagesFilter = this.state.getVillage;
    let filterVillage = this.state.filterVillage;

    return (
      <Layout>
        <Grid>
          <div className="App">
            <h1 className={style.title}> Manage Village organizations</h1>
            <div className={classes.row}>
              <div className={classes.buttonRow}>
                <Button
                  color="primary"
                  variant="contained"
                  component={Link}
                  to="/Village-organizations/add"
                >
                  Add Village Organization
                </Button>
              </div>
            </div>
            {this.props.location.addVoData ? (
              <Snackbar severity="success">
                Village organization added successfully.
              </Snackbar>
            ) : this.props.location.editVoData ? (
              <Snackbar severity="success">
                Village organization edited successfully.
              </Snackbar>
            ) : null}
            {this.state.singleDelete !== false &&
            this.state.singleDelete !== "" &&
            this.state.singleDelete ? (
              <Snackbar severity="success" Showbutton={false}>
                Village organization {this.state.singleDelete} deleted
                successfully!
              </Snackbar>
            ) : null}
            {/* {this.state.singleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null} */}
            {this.state.multipleDelete === true ? (
              <Snackbar severity="success" Showbutton={false}>
                Village organizations deleted successfully!
              </Snackbar>
            ) : null}
            {/* {this.state.multipleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null} */}
            <br></br>
            <div className={classes.row}>
              <div className={classes.searchInput}>
                <div className={style.Districts}>
                  <Grid item md={12} xs={12}>
                    {/* <Autosuggest /> */}
                    <AutoSuggest
                      data={this.state.getShgs}
                      margin="dense"
                      onSelectShg={this.onHandleChange}
                      onClearShg={this.state.isCancel}
                    />
                  </Grid>
                </div>
              </div>
              <div className={classes.searchInput}>
                <div className={style.Districts}>
                  <Grid item md={12} xs={12}>
                    <Autocomplete
                      width="150px"
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
                          margin="dense"
                          label="Select State"
                          name="addState"
                          variant="outlined"
                        />
                      )}
                    />
                  </Grid>
                </div>
              </div>
              {/* <Select
                labelId="demo-mutiple-name-label"
                id="demo-mutiple-name"
                multiple
                value={statesFilter}
                onChange={this.handleChange}
                input={<Input />} */}
              {/* // MenuProps={MenuProps} */}
              {/* // ></Select> */}
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
                          margin="dense"
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
                          margin="dense"
                          label="Select Village"
                          value={filterVillage}
                          name="filterVillage"
                          variant="outlined"
                        />
                      )}
                    />
                  </Grid>
                </div>
              </div>
              <br></br>
              <Button
                color="primary"
                variant="contained"
                onClick={this.handleSearch.bind(this)}
              >
                Search
              </Button>
              &nbsp;&nbsp;&nbsp;
              <Button
                color="default"
                variant="contained"
                // clicked={this.cancelForm}
                onClick={this.cancelForm.bind(this)}
              >
                cancel
              </Button>
            </div>
            {data ? (
              <Table
                title={"Village Organizations"}
                filterData={true}
                showSearch={false}
                Searchplaceholder={"Search by Village Organization Name"}
                filterBy={["name"]}
                data={data}
                column={Usercolumns}
                editData={this.editData}
                DeleteData={this.DeleteData}
                DeleteAll={this.DeleteAll}
                rowsSelected={this.rowsSelect}
                modalHandle={this.modalHandle}
                columnsvalue={columnsvalue}
                DeleteMessage={"Are you Sure you want to Delete"}
              />
            ) : (
              <h1>Loading...</h1>
            )}
          </div>
        </Grid>
      </Layout>
    );
  }
}
export default withStyles(useStyles)(VillageList);
