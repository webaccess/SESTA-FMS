import { Grid } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import Autocomplete from "../../components/Autocomplete/Autocomplete";
import * as serviceProvider from "../../api/Axios";
import React from "react";
import { Link } from "react-router-dom";
import auth from "../../components/Auth/Auth.js";
import Table from "../../components/Datatable/Datatable.js";
import { map } from "lodash";
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
  menuName: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    margin: "0px",
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
      newData: [],
      data: [],
      selectedid: 0,
      open: false,
      columnsvalue: [],
      DeleteData: false,
      getState: [],
      getDistrict: [],
      getVillage: [],
      isCancel: false,
      singleDelete: "",
      multipleDelete: "",
      deleteShgName: "",
      shgInUseSingleDelete: "",
      shgInUseDeleteAll: "",
      loggedInUserRole: auth.getUserInfo().role.name,
      isLoader: true,
      individualContact: [],
    };
  }

  async componentDidMount() {
    let url =
      "crm-plugin/contact/?contact_type=organization&&organization.sub_type=SHG&&_sort=name:ASC";
    if (this.state.loggedInUserRole === "FPO Admin") {
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/individuals/" +
            auth.getUserInfo().contact.individual
        )
        .then((res) => {
          this.getShg(res, "laod", "");
        });
    } else {
      serviceProvider
        .serviceProviderForGetRequest(process.env.REACT_APP_SERVER_URL + url)
        .then((res) => {
          this.setState({ data: res.data, isLoader: false });
        });
    }

    //api call for states filter
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/states/?is_active=true"
      )
      .then((res) => {
        this.setState({ getState: res.data });
      })
      .catch((error) => {
        console.log(error);
      });

    //api call for village filter
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/villages/"
      )
      .then((res) => {
        this.setState({ getVillage: res.data });
      })
      .catch((error) => {
        console.log(error);
      });

      serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/contact/?_sort=id:ASC&&contact_type=individual"
      )
      .then((res) => {
        this.setState({ individualContact: res.data });
      });
  }

  getShg = (res, param, searchData) => {
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/contact/shgs/?id=" +
          res.data.fpo.id
      )
      .then((shgRes) => {
        this.setState({ data: shgRes.data, isLoader: false });
      });
  };

  handleStateChange = async (event, value) => {
    if (value !== null) {
      this.setState({
        filterState: value,
        isCancel: false,
        filterDistrict: "",
        filterVillage: "",
      });

      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/districts/?is_active=true&&state.id=" +
            value.id
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
      this.setState({
        filterDistrict: value,
        isCancel: false,
        filterVillage: "",
      });
      let distId = value.id;
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL + "crm-plugin/districts/" + distId
        )
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

      let shgInUseSingleDelete = false;
      this.state.individualContact.find((cd) => {
        if (cd.individual.shg !== null) {
          if (cd.individual.shg === parseInt(cellid)) {
            this.state.data.map(shgdata => {
              if (cellid === shgdata.id) {
                this.setState({ shgInUseSingleDelete: true, deleteShgName: shgdata.name });
                shgInUseSingleDelete = true;
              }
            })
          }
        }
      });

      if(!shgInUseSingleDelete){
      serviceProvider
        .serviceProviderForDeleteRequest(
          process.env.REACT_APP_SERVER_URL + "crm-plugin/contact",
          cellid
        )
        .then((res) => {
          if (res.data.organization.bankdetail) {
            this.deleteBankDetails(res.data.organization.bankdetail);
          }
          this.setState({ singleDelete: res.data.name });
          this.componentDidMount();
        })
        .catch((error) => {
          this.setState({ singleDelete: false });
          console.log(error);
        });
      }
    }
  };

  deleteBankDetails = async (id) => {
    serviceProvider
      .serviceProviderForDeleteRequest(
        process.env.REACT_APP_SERVER_URL + "bankdetails",
        id
      )
      .then((res) => {})
      .catch((error) => {
        console.log(error);
      });
  };

  DeleteAll = (selectedId) => {
    if (selectedId.length !== 0) {
      this.setState({ singleDelete: "", multipleDelete: "" });
      let shgInUseDeleteAll = false;
      let shgInUse = [];
      this.state.individualContact.map((cd) => {
        if (cd.individual.shg !== null) {
          for (let i in selectedId) {
            if (parseInt(selectedId[i]) === cd.individual.shg) {
              shgInUse.push(selectedId[i])
              shgInUseDeleteAll = true;
            }
            shgInUse = [...new Set(shgInUse)]
          }
        }
      });
      var deleteVillg = selectedId.filter(function (obj) {
        return shgInUse.indexOf(obj) == -1;
      });

      for (let i in deleteVillg) {
        serviceProvider
          .serviceProviderForDeleteRequest(
            process.env.REACT_APP_SERVER_URL + "crm-plugin/contact",
            deleteVillg[i]
          )
          .then((res) => {
            if (res.data.organization.bankdetail) {
              this.deleteBankDetails(res.data.organization.bankdetail);
            }
            this.setState({ shgInUseDeleteAll: true });
            this.componentDidMount();
          })
          .catch((error) => {
            this.setState({ multipleDelete: false });
            console.log(error);
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
      isLoader: true,
      isCancel: true,
    });
    this.componentDidMount();
  };

  handleSearch() {
    this.setState({ isLoader: true });
    let searchData = "";
    if (this.state.filterShg) {
      searchData += "name_contains=" + this.state.filterShg + "&&";
    }
    if (this.state.filterVo) {
      searchData +=
        "organization.vos[0].name_contains=" + this.state.filterVo + "&&";
    }
    if (this.state.filterState) {
      searchData += "addresses.state.id=" + this.state.filterState.id + "&&";
    }
    if (this.state.filterDistrict) {
      searchData +=
        "addresses.district.id=" + this.state.filterDistrict.id + "&&";
    }
    if (this.state.filterVillage) {
      searchData += "addresses.village.id=" + this.state.filterVillage.id;
    }

    //api call after search filter
    let url =
      "crm-plugin/contact/?contact_type=organization&&organization.sub_type=SHG&&_sort=name:ASC";
    if (this.state.loggedInUserRole === "FPO Admin") {
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/individuals/" +
            auth.getUserInfo().contact.individual
        )
        .then((res) => {
          serviceProvider
            .serviceProviderForGetRequest(
              process.env.REACT_APP_SERVER_URL +
                "crm-plugin/contact/?contact_type=organization&&organization.sub_type=VO&&_sort=name:ASC&&organization.fpo=" +
                res.data.fpo.id
            )
            .then((voRes) => {
              let voList = [];
              voRes.data.map((e) => {
                voList.push(e.id);
              });
              let newUrl =
                "crm-plugin/contact/?contact_type=organization&&organization.sub_type=SHG&&_sort=name:ASC&&";
              voList.map((voId) => {
                newUrl += "organization.vos.id_in=" + voId + "&&";
              });
              serviceProvider
                .serviceProviderForGetRequest(
                  process.env.REACT_APP_SERVER_URL + newUrl + "&&" + searchData
                )
                .then((response) => {
                  this.setState({ data: response.data, isLoader: false });
                });
            });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL + url + "&&" + searchData
        )
        .then((res) => {
          this.setState({ data: res.data, isLoader: false });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  render() {
    let data = this.state.data;
    const Usercolumns = [
      {
        name: "Name of the Group",
        selector: "name",
        sortable: true,
      },
      {
        name: "State",
        selector: "stateName",
        sortable: true,
        cell: (row) => (row.stateName ? row.stateName : "-"),
      },
      {
        name: "District",
        selector: "districtName",
        sortable: true,
        cell: (row) => (row.districtName ? row.districtName : "-"),
      },
      {
        name: "Village",
        selector: "villageName",
        sortable: true,
        cell: (row) => (row.villageName ? row.villageName : "-"),
      },
      {
        name: "Village Organization",
        sortable: true,
        cell: (row) =>
          row.organization.vos.length > 0 ? row.organization.vos[0].name : "-",
      },
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
          <h5 className={classes.menuName}>MASTERS</h5>
          <div className={style.headerWrap}>
            <h2 className={style.title}>Manage Self Help Group</h2>
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
              SHGs deleted successfully!
            </Snackbar>
          ) : null}
          {this.state.multipleDelete === false ? (
            <Snackbar severity="error" Showbutton={false}>
              An error occured - Please try again!
            </Snackbar>
          ) : null}
          {this.state.shgInUseSingleDelete === true ? (
              <Snackbar severity="info" Showbutton={false}>
                SHG {this.state.deleteShgName} is in use, it can not be Deleted.
              </Snackbar>
            ) : null}
            {this.state.shgInUseDeleteAll === true ? (
              <Snackbar severity="info" Showbutton={false}>
                Some Village is in use hence it can not be Deleted.
              </Snackbar>
            ) : null}
          <div
            className={classes.row}
            style={{ flexWrap: "wrap", height: "auto" }}
          >
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
            {/* this filter is temporary commented  */}
            {/* <div className={classes.searchInput}>
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
            </div> */}
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
                          : filterVillage
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
            <Button
              style={{ marginRight: "5px", marginBottom: "8px" }}
              onClick={this.handleSearch.bind(this)}
            >
              Search
            </Button>
            <Button
              style={{ marginBottom: "8px" }}
              color="secondary"
              clicked={this.cancelForm}
            >
              reset
            </Button>
          </div>
          {data ? (
            <Table
              title={"Shgs"}
              filterData={true}
              Searchplaceholder={"Seacrh by SHG Name"}
              filterBy={[
                "name",
                "organization.vos[0].name",
                "villages[0].name",
                "district.name",
                "state.name",
              ]}
              data={data}
              column={Usercolumns}
              editData={this.editData}
              DeleteData={this.DeleteData}
              DeleteAll={this.DeleteAll}
              rowsSelected={this.rowsSelect}
              modalHandle={this.modalHandle}
              columnsvalue={columnsvalue}
              selectableRows
              pagination
              progressComponent={this.state.isLoader}
              DeleteMessage={"Are you Sure you want to Delete"}
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
