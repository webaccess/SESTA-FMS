import { Grid } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import Autocomplete from "../../components/Autocomplete/Autocomplete";
import axios from "axios";
import React from "react";
import { Link } from "react-router-dom";
import auth from "../../components/Auth/Auth.js";
import Table from "../../components/Datatable/Datatable.js";
import { map } from "lodash";
import Spinner from "../../components/Spinner";
import Button from "../../components/UI/Button/Button";
import Input from "../../components/UI/Input/Input";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import Layout from "../../hoc/Layout/Layout";
import style from "./Shgs.module.css";

const useStyles = (theme) => ({
  root: {},
  row: {
    height: "42px",
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(1),
  },
  floatRow: {
    height: "40px",
    float: "right",
  },
  buttonRow: {
    height: "42px",
    float: "right",
    marginTop: theme.spacing(1),
  },
  spacer: {
    flexGrow: 1,
  },
  addButton: {
    float: "right",
    marginRight: theme.spacing(1),
  },
  exportButton: {
    marginRight: theme.spacing(1),
  },
  searchInput: {
    marginRight: theme.spacing(1),
  },
});

export class Shgs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filterState: "",
      filterDistrict: "",
      filterVillage: "",
      filterShg: "",
      filterVo: "",
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
      multipleDelete: "",
    };
  }
  async componentDidMount() {
    await axios
      .get(
        process.env.REACT_APP_SERVER_URL +
          JSON.parse(process.env.REACT_APP_CONTACT_TYPE)["Organization"][0] +
          "s?sub_type=SHG",
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + "",
          },
        }
      )
      .then((res) => {
        this.setState({ data: this.getData(res.data) });
      });
    //api call for states filter
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
    //api call for village filter
    await axios
      .get(process.env.REACT_APP_SERVER_URL + "villages/", {
        headers: {
          Authorization: "Bearer " + auth.getToken() + "",
        },
      })
      .then((res) => {
        this.setState({ getVillage: res.data });
      })
      .catch((error) => {
        console.log(error);
      });
  }
  getData(result) {
    for (let i in result) {
      let villages = [];
      for (let j in result[i].contact.villages) {
        villages.push(result[i].contact.villages[j].name + " ");
      }

      result[i]["contact"]["villages"] = villages;
    }
    return result;
  }
  handleStateChange = async (event, value) => {
    if (value !== null) {
      this.setState({ filterState: value });
      this.setState({
        isCancel: false,filterDistrict:"",filterVillage:''
      });

      let stateId = value.id;
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
    } else {
      this.setState({
        filterState: "",
        filterDistrict: "",
        filterVillage: "",
        getVillage: "",
      });
      this.componentDidMount();
    }
  };
  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleDistrictChange(event, value) {
    if (value !== null) {
      this.setState({ filterDistrict: value });
      this.setState({filterVillage:''})
      let distId = value.id;
      axios
        .get(process.env.REACT_APP_SERVER_URL + "districts/" + distId, {
          headers: {
            Authorization: "Bearer " + auth.getToken() + "",
          },
        })
        .then((res) => {
          this.setState({ getVillage: res.data.villages });
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      this.setState({
        filterDistrict: "",
        filterVillage: "",
      });
      this.componentDidMount();
    }
  }

  handleVillageChange(event, value) {
    if (value !== null) {
      this.setState({ filterVillage: value });
      this.setState({
        isCancel: false,
      });
    } else {
      this.setState({
        filterVillage: "",
      });
    }
  }

  editData = (cellid) => {
    this.props.history.push("/shgs/edit/" + cellid);
  };

  DeleteData = (cellid, selectedId) => {
    if (cellid.length !== null && selectedId < 1) {
      this.setState({ singleDelete: "", multipleDelete: "" });

      axios
        .delete(
          process.env.REACT_APP_SERVER_URL +
            JSON.parse(process.env.REACT_APP_CONTACT_TYPE)["Organization"][0] +
            "s/" +
            cellid,
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + "",
            },
          }
        )
        .then((res) => {
          this.setState({ singleDelete: res.data.name });
          this.componentDidMount();
        })
        .catch((error) => {
          this.setState({ singleDelete: false });
          console.log(error);
        });
    }
  };
  DeleteAll = (selectedId) => {
    if (selectedId.length !== 0) {
      this.setState({ singleDelete: "", multipleDelete: "" });
      for (let i in selectedId) {
        axios
          .delete(
            process.env.REACT_APP_SERVER_URL +
              JSON.parse(process.env.REACT_APP_CONTACT_TYPE)[
                "Organization"
              ][0] +
              "s/" +
              selectedId[i],
            {
              headers: {
                Authorization: "Bearer " + auth.getToken() + "",
              },
            }
          )
          .then((res) => {
            this.setState({ multipleDelete: true });
            this.componentDidMount();
          })
          .catch((error) => {
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
      filterVo: "",
      filterShg: "",

      isCancel: true,
    });
    this.componentDidMount();
    //routing code #route to village_list page
  };
  handleSearch() {
    let searchData = "";
    if (this.state.filterShg) {
      searchData += "name_contains=" + this.state.filterShg + "&&";
    }
    if (this.state.filterVo) {
      searchData +=
        "village_organization.name_contains=" + this.state.filterVo + "&&";
    }
    if (this.state.filterState) {
      searchData += "state.id=" + this.state.filterState.id + "&&";
    }
    if (this.state.filterDistrict) {
      searchData += "district.id=" + this.state.filterDistrict.id + "&&";
    }
    if (this.state.filterVillage) {
      searchData += "villages.id=" + this.state.filterVillage.id;
    }
    //api call after search filter
    axios
      .get(process.env.REACT_APP_SERVER_URL + "shgs?" + searchData, {
        headers: {
          Authorization: "Bearer " + auth.getToken() + "",
        },
      })
      .then((res) => {
        this.setState({ data: this.getData(res.data) });
      })
      .catch((err) => {
        console.log("err", err);
      });
  }

  render() {
    let data = this.state.data;

    const Usercolumns = [
      {
        name: "SHG",
        selector: "name",
        sortable: true,
      },
      {
        name: "Village Organization",
        selector: "village_organization.name",
        sortable: true
      },
      {
        name: "Village",
        selector: "villages",
        sortable: true
      },
      {
        name: "District",
        selector: "district.name",
        sortable: true
      },
      {
        name: "State",
        selector: "state.name",
        sortable: true
      }
      // {
      //   name: "Village Name",
      //   selector: "contact.villages",
      //   sortable: true,
      // },
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
    let addStates = [];
    map(filterState, (state, key) => {
      addStates.push(
        statesFilter.findIndex(function (item, i) {
          return item.id === state;
        })
      );
    });
    let addDistricts = [];
    map(filterDistrict, (district, key) => {
      addDistricts.push(
        districtsFilter.findIndex(function (item, i) {
          return item.id === district;
        })
      );
      let addVillages = [];
      map(filterVillage, (village, key) => {
        addVillages.push(
          villagesFilter.findIndex(function (item, i) {
            return item.id === village;
          })
        );
      });
    });
    return (
      <Layout>
        <div className="App">
          <h1 className={style.title}>
            Manage Self Help Group
            <div className={classes.floatRow}>
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
          </h1>
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
          <div className={classes.row}>
            <div className={classes.searchInput}>
              <div className={style.Districts}>
                <Grid item md={12} xs={12}>
                  <Input
                    fullWidth
                    label="SHG Name"
                    name="filterShg"
                    id="combo-box-demo"
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
                  <Input
                    fullWidth
                    label="VO Name"
                    name="filterVo"
                    id="combo-box-demo"
                    value={this.state.filterVo || ""}
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
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => {
                      this.handleStateChange(event, value);
                    }}
                    value={
                      filterState
                        ? this.state.isCancel === true
                          ? null
                          : filterState
                        : null
                    }
                    renderInput={(params) => (
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
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => {
                      this.handleDistrictChange(event, value);
                    }}
                    value={
                      filterDistrict
                        ? this.state.isCancel === true
                          ? null
                          : filterDistrict
                        : null
                    }
                    renderInput={(params) => (
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
                  <Autocomplete
                    id="combo-box-demo"
                    options={villagesFilter}
                    name="filterVillage"
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => {
                      this.handleVillageChange(event, value);
                    }}
                    value={
                      filterVillage
                        ? this.state.isCancel === true
                        ? null
                        :filterVillage
                        : null
                    }
                    renderInput={(params) => (
                      <Input
                        {...params}
                        fullWidth
                        label="Select Village"
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
            <Button color="secondary" clicked={this.cancelForm}>
              reset
            </Button>
          </div>
          {data ? (
            <Table
              title={"Shgs"}
              filterData={true}
              Searchplaceholder={"Seacrh by SHG Name"}
              // filterBy={["name"]}
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
