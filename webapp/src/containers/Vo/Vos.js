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
      isCancel: false,
      properties: props,
      getState: [],
      getDistrict: [],
      getVillage: [],
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
        console.log("res.data", res);
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
  }
  handleChange = (event, value) => {
    console.log("event", event, "value", value);
  };
  handleStateChange = async (event, value) => {
    console.log("Inside state");
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
      this.state.filterVillage = value.id;
      console.log("village", this.state.filterVillage);
    } else {
      this.setState({
        filterVillage: ""
      });
      console.log("village", this.state.filterVillage);
    }
  }
  editData = cellid => {
    this.props.history.push("/village-organizations/edit/" + cellid);
  };

  DeleteData = cellid => {
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
        this.setState({ multipleDelete: false });
        this.componentDidMount();
      })
      .catch(error => {
        this.setState({ singleDelete: false });
        this.setState({ multipleDelete: false });
        console.log(error.response);
      });
  };
  DeleteAll = selectedId => {
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
          console.log("deleted data res", res.data);
          this.setState({ multipleDelete: true });
          this.componentDidMount();
        })
        .catch(error => {
          this.setState({ multipleDelete: false });

          console.log("err", error);
        });
    }
  };
  cancelForm = () => {
    console.log("---In cancel form");
    this.setState({
      filterState: "",
      filterDistrict: "",
      filterVillage: "",
      isCancel: true
    });
    this.componentDidMount();
  };
  handleSearch() {
    console.log("kkk", this.state);
    let searchData = "";
    if (this.state.filterState) {
      searchData += "state=" + this.state.filterState + "&&";
    }
    if (this.state.filterDistrict) {
      searchData += "shgs.district=" + this.state.filterDistrict + "&&";
    }
    if (this.state.filterVillage) {
      searchData += "shgs.villages=" + this.state.filterVillage;
    }

    //api call after search filter
    axios
      .get(
        process.env.REACT_APP_SERVER_URL +
          "village-organizations?shgs." +
          searchData,
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + ""
          }
        }
      )
      .then(res => {
        console.log("api 222222", res.data);
        // if (res.data.length) {
        this.setState({ data: res.data });
        console.log("data after search", this.state.data);
        // }
        // else {
        //   this.setState({
        //     data: {
        //       name: "no data",
        //       state: { name: "no data" },
        //       district: { name: "no data" },
        //       villages: "no data"
        //     }
        //   });
        // }
      })
      .catch(err => {
        console.log("err", err);
      });
  }
  setData(val) {}

  render() {
    let data = this.state.data;
    console.log("data", data);
    // let data = [];
    if (data.length !== 0) {
    }

    const Usercolumns = [
      {
        name: "Village Organization Name",
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
    console.log("State in render", this.state);
    return (
      <Layout>
        <Grid>
          <div className="App">
            <h1 className={style.title}>Village organizations</h1>
            <div className={classes.row}>
              <div className={style.buttonRow}>
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
            {/* {this.state.multipleDelete === false &&
            this.state.singleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null} */}
            <br></br>
            <div className={classes.row}>
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
                                  console.log("item.id", item.id);
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
                          margin="dense"
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
                          label="Select District"
                          margin="dense"
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
                          label="Select Village"
                          margin="dense"
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
              {/* <Button color="default" clicked={this.cancelForm}>
                cancel
              </Button> */}
            </div>
            {data ? (
              <Table
                title={"Village Organizations"}
                filterData={true}
                showSearch={true}
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
              <div className={style.Progess}>
                <center>
                  <Spinner />
                </center>
              </div>
            )}
          </div>
        </Grid>
      </Layout>
    );
  }
}
export default withStyles(useStyles)(VillageList);
