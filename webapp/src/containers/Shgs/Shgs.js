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
      loggedInUserRole: auth.getUserInfo().role.name,
    };
  }

  async componentDidMount() {
    let url =
      "crm-plugin/contact/?contact_type=organization&&organization.sub_type=SHG&&_sort=name:ASC";
    if (
      this.state.loggedInUserRole === "FPO Admin" ||
      this.state.loggedInUserRole === "CSP (Community Service Provider)"
    ) {
      url += "&&creator_id=" + auth.getUserInfo().contact.id;
    }
    serviceProvider
      .serviceProviderForGetRequest(process.env.REACT_APP_SERVER_URL + url)
      .then((res) => {
        this.setState({ data: res.data });
      });

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
  }

  handleStateChange = async (event, value) => {
    if (value !== null) {
      this.setState({ filterState: value });
      this.setState({
        isCancel: false,
        filterDistrict: "",
        filterVillage: "",
      });

      let stateId = value.id;
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/districts/?is_active=true&&state.id=" +
            stateId
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
      this.setState({ filterVillage: "" });
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
      for (let i in selectedId) {
        serviceProvider
          .serviceProviderForDeleteRequest(
            process.env.REACT_APP_SERVER_URL + "crm-plugin/contact",
            selectedId[i]
          )
          .then((res) => {
            if (res.data.organization.bankdetail) {
              this.deleteBankDetails(res.data.organization.bankdetail);
            }
            this.setState({ multipleDelete: true });
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

      isCancel: true,
    });
    this.componentDidMount();
  };

  handleSearch() {
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
    if (
      this.state.loggedInUserRole === "FPO Admin" ||
      this.state.loggedInUserRole === "CSP (Community Service Provider)"
    ) {
      url += "&&creator_id=" + auth.getUserInfo().contact.id;
    }
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + url + "&&" + searchData
      )
      .then((res) => {
        this.setState({ data: res.data });
      })
      .catch((err) => {
        console.log(err);
      });
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
        name: "Village Organization",
        selector: "organization.vos[0].name",
        sortable: true,
      },
      //{
      //  name: "Village",
      //  selector: "villages[0].name",
      //  sortable: true,
      //},
      //{
      //  name: "District",
      //  selector: "district.name",
      //  sortable: true,
      //},
      //{
      //  name: "State",
      //  selector: "state.name",
      //  sortable: true,
      //},
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
              SHGs deleted successfully!
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
