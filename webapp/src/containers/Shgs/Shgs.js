import { Grid } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import Autocomplete from "@material-ui/lab/Autocomplete";
import axios from "axios";
import React from "react";
import { Link } from "react-router-dom";
import auth from "../../components/Auth/Auth.js";
import Table from "../../components/Datatable/Datatable.js";
import Spinner from "../../components/Spinner";
import Button from "../../components/UI/Button/Button";
import Input from "../../components/UI/Input/Input";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import Layout from "../../hoc/Layout/Layout";
import style from "./Shgs.module.css";

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
  exportButton: {
    marginRight: theme.spacing(1)
  },
  searchInput: {
    marginRight: theme.spacing(1)
  }
});

export class Shgs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filterState: "",
      filterDistrict: "",
      filterVillage: "",
      filterShg:'',
      Result: [],
      TestData: [],
      data: [],
      selectedid: 0,
      open: false,
      columnsvalue: [],
      DeleteData: false,
      properties: props,
      getState: [],
      getDistrict: [],
      getVillage: [],
      isCancel: false,
      singleDelete: "",
      multipleDelete: ""
    };
  }
  async componentDidMount() {
    await axios
      .get(process.env.REACT_APP_SERVER_URL + "shgs/", {
        headers: {
          Authorization: "Bearer " + auth.getToken() + ""
        }
      })
      .then(res => {
        console.log("api result village", res.data);
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
      });
  }
  getData(result) {
    for (let i in result) {
      let villages = [];
      for (let j in result[i].villages) {
        villages.push(result[i].villages[j].name + " ");
      }

      result[i]["villages"] = villages;
    }
    console.log("hi ", result);
    return result;
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
  handleChange(event){
    this.setState({filterShg:event.target.value})
  }

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

  editData = cellid => {
    this.props.history.push("/shgs/edit/" + cellid);
  };

  DeleteData = (cellid, selectedId) => {
    if (cellid.length !== null && selectedId < 1) {
      console.log("delete", cellid);
      this.setState({ singleDelete: "", multipleDelete: "" });

      axios
        .delete(process.env.REACT_APP_SERVER_URL + "shgs/" + cellid, {
          headers: {
            Authorization: "Bearer " + auth.getToken() + ""
          }
        })
        .then(res => {
          console.log("deleted data res", res.data);
          this.setState({ singleDelete: res.data.name });
          this.componentDidMount();
        })
        .catch(error => {
          this.setState({ singleDelete: false });
          console.log(error);
        });
    }
  };
  DeleteAll = selectedId => {
    if (selectedId.length !== 0) {
      this.setState({ singleDelete: "", multipleDelete: "" });
      for (let i in selectedId) {
        axios
          .delete(process.env.REACT_APP_SERVER_URL + "shgs/" + selectedId[i], {
            headers: {
              Authorization: "Bearer " + auth.getToken() + ""
            }
          })
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
    }
  };
  cancelForm = () => {
    this.setState({
      filterState: "",
      filterDistrict: "",
      filterVillage: "",
      filterShg:'',

      isCancel: true
    });
    this.componentDidMount();
    //routing code #route to village_list page
  };
  handleSearch() {
    console.log("kkk", this.state);
    let searchData = "";
    if (this.state.filterShg){
      searchData += "name_contains=" + this.state.filterShg + "&&";
    }
    if (this.state.filterState) {
      searchData += "state.id=" + this.state.filterState + "&&";
    }
    if (this.state.filterDistrict) {
      searchData += "district.id=" + this.state.filterDistrict + "&&";
    }
    if (this.state.filterVillage) {
      searchData += "villages.id=" + this.state.filterVillage;
    }

    //api call after search filter
    axios
      .get(process.env.REACT_APP_SERVER_URL + "shgs?" + searchData, {
        headers: {
          Authorization: "Bearer " + auth.getToken() + ""
        }
      })
      .then(res => {
        console.log("api 222222", res.data);
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
        name: "SHG Name",
        selector: "name",
        sortable: true
      },
      {
        name: "State Name",
        selector: "state.name",
        sortable: true
      },
      {
        name: "District Name",
        selector: "district.name",
        sortable: true
      },
      {
        name: "Village Name",
        selector: "villages",
        sortable: true
      }
    ];

    let selectors = [];
    for (let i in Usercolumns) {
      selectors.push(Usercolumns[i]["selector"]);
    }

    let columnsvalue = selectors[0];
    const { classes } = this.props;
    let statesFilter = this.state.getState;
    let filterState = this.state.filterState;
    let districtsFilter = this.state.getDistrict;
    let filterDistrict = this.state.filterDistrict;
    let villagesFilter = this.state.getVillage;
    let filterVillage = this.state.filterVillage;
    let isCancel = this.state.isCancel;
    console.log(this.state);
    return (
      <Layout>
        <div className="App">
          <h1 className={style.title}>Manage Self Help Group</h1>
          <div className={classes.row}>
            <div className={style.addButton}>
              <Button
                color="primary"
                variant="contained"
                component={Link}
                to="/Shgs/add"
              >
                Add SHG
              </Button>
            </div>
          </div>
          {this.props.location.addData ? (
            <Snackbar severity="success">SHG added successfully.</Snackbar>
          ) : this.props.location.editData ? (
            <Snackbar severity="success">SHG edited successfully.</Snackbar>
          ) : null}
          {this.state.singleDelete !== false &&
          this.state.singleDelete !== "" &&
          this.state.singleDelete ? (
            <Snackbar severity="success" Showbutton={false}>
              SHG {this.state.singleDelete} deleted successfully!
            </Snackbar>
          ) : null}
          {this.state.singleDelete === false ? (
            <Snackbar severity="error" Showbutton={false}>
              An error occured - Please try again!
            </Snackbar>
          ) : null}
          {this.state.multipleDelete === true ? (
            <Snackbar severity="success" Showbutton={false}>
              SHG's deleted successfully!
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
                  <Input
                    fullWidth
                    label="SHG Name"
                    name="filterShg"
                    id="combo-box-demo"
                    margin="dense"
                    value={this.state.filterShg || ""}
                    onChange={this.handleChange.bind(this)}
                    variant="outlined"
                  />
                </Grid>
              </div>
            </div>
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
                        margin="dense"
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
                        // value={filterVillage}
                        name="filterVillage"
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
              </div>
            </div>
            <br></br>
            <Button onClick={this.handleSearch.bind(this)}>Search</Button>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <Button color="default" clicked={this.cancelForm}>
              cancel
            </Button>
          </div>
          {data ? (
            <Table
              title={"Shgs"}
              filterData={true}
              Searchplaceholder={"Seacrh by SHG Name"}
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
              noDataComponent={false}
            />
          ) : (
            <h1>Loading...</h1>
          )}
        </div>
      </Layout>
    );
  }
}
export default withStyles(useStyles)(Shgs);
