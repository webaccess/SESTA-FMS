import React from "react";
import * as serviceProvider from "../../api/Axios";
import Table from "../../components/Datatable/Datatable.js";
import Layout from "../../hoc/Layout/Layout";
import Button from "../../components/UI/Button/Button";
import { withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import style from "./Members.module.css";
import { Grid } from "@material-ui/core";
import Input from "../../components/UI/Input/Input";
import auth from "../../components/Auth/Auth.js";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import Autocomplete from "../../components/Autocomplete/Autocomplete";
import { map } from "lodash";

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
  searchInput: {
    marginRight: theme.spacing(1),
    marginBottom: "8px",
  },
  Districts: {
    marginRight: theme.spacing(1),
  },
  Countries: {
    marginRight: theme.spacing(1),
  },
  Search: {
    marginRight: theme.spacing(1),
  },
  Cancel: {
    marginRight: theme.spacing(1),
  },
});

export class Members extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      data: [],
      getState: [],
      getDistrict: [],
      getVillage: [],
      getShg: [],
      filterState: "",
      filterDistrict: "",
      filterVillage: "",
      filterShg: "",
      isCancel: false,
      DeleteData: false,
      dataCellId: [],
      singleDelete: "",
      multipleDelete: "",
      loggedInUserRole: auth.getUserInfo().role.name,
      bankDetailsFound: true,
    };
  }

  async componentDidMount() {
    this.getMembers();

    // get all SHGs
    let url =
      "crm-plugin/contact/?contact_type=organization&organization.sub_type=SHG&&_sort=name:ASC";
    if (this.state.loggedInUserRole === "FPO Admin") {
      url += "&creator_id=" + auth.getUserInfo().contact.id;
      serviceProvider
        .serviceProviderForGetRequest(process.env.REACT_APP_SERVER_URL + url)
        .then((res) => {
          this.setState({ getShg: res.data });
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (
      this.state.loggedInUserRole === "CSP (Community Service Provider)"
    ) {
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/contact/?individual=" +
            auth.getUserInfo().contact.individual
        )
        .then((res) => {
          serviceProvider
            .serviceProviderForGetRequest(
              process.env.REACT_APP_SERVER_URL +
                "crm-plugin/contact/?id=" +
                res.data[0].individual.vo
            )
            .then((response) => {
              this.setState({ getShg: response.data[0].org_vos });
            });
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      serviceProvider
        .serviceProviderForGetRequest(process.env.REACT_APP_SERVER_URL + url)
        .then((res) => {
          this.setState({ getShg: res.data });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  getMembers = () => {
    let newDataArray = [];
    let url = "crm-plugin/contact/?contact_type=individual&&_sort=name:ASC";
    if (
      this.state.loggedInUserRole === "CSP (Community Service Provider)" ||
      this.state.loggedInUserRole === "FPO Admin"
    ) {
      url += "&creator_id=" + auth.getUserInfo().contact.id;
    }
    serviceProvider
      .serviceProviderForGetRequest(process.env.REACT_APP_SERVER_URL + url)
      .then((res) => {
        res.data.map((e, i) => {
          if (e.user === null) {
            newDataArray.push(e); // add only those contacts having contact type=individual & users===null
          }
        });
        this.setState({ data: newDataArray });
      })
      .catch((error) => {
        console.log(error);
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
  };

  handleStateChange = async (event, value) => {
    if (value !== null) {
      this.setState({ filterState: value });

      this.setState({
        isCancel: false,
        filterDistrict: "",
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
      });
    }
  };

  handleDistrictChange(event, value) {
    if (value !== null) {
      this.setState({ filterDistrict: value });
      this.setState({
        isCancel: false,
        filterVillage: "",
      });
      let distId = value.id;
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/villages/?is_active=true&&district.id=" +
            distId
        )
        .then((res) => {
          this.setState({ getVillage: res.data });
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      this.setState({
        filterDistrict: "",
        filterVillage: "",
      });
    }
  }

  handleShgChange(event, value) {
    if (value !== null) {
      this.setState({ filterShg: value, isCancel: false });
    } else {
      this.setState({
        filterShg: "",
      });
    }
  }

  handleVillageChange = async (event, value) => {
    if (value !== null) {
      this.setState({ filterVillage: value, isCancel: false });
    } else {
      this.setState({
        filterVillage: "",
      });
    }
  };

  cancelForm = () => {
    this.setState({
      filterState: "",
      filterDistrict: "",
      filterVillage: "",
      filterShg: "",
      isCancel: true,
    });

    this.componentDidMount();
  };

  handleSearch() {
    let searchData = "";
    if (this.state.filterState) {
      searchData += searchData ? "&&" : "";
      searchData += "state=" + this.state.filterState.id;
    }
    if (this.state.filterDistrict) {
      searchData += searchData ? "&&" : "";
      searchData += "district=" + this.state.filterDistrict.id;
    }
    if (this.state.filterVillage) {
      searchData += searchData ? "&&" : "";
      searchData += "villages=" + this.state.filterVillage.id;
    }
    if (this.state.filterShg) {
      searchData += searchData ? "&&" : "";
      if (this.state.loggedInUserRole === "CSP (Community Service Provider)") {
        searchData += "individual.shg=" + this.state.filterShg.contact;
      } else {
        searchData += "individual.shg=" + this.state.filterShg.id;
      }
    }

    //api call after search filter
    let newDataArray = [];
    let url = "crm-plugin/contact/?contact_type=individual&&_sort=name:ASC";
    if (
      this.state.loggedInUserRole === "CSP (Community Service Provider)" ||
      this.state.loggedInUserRole === "FPO Admin"
    ) {
      url += "&creator_id=" + auth.getUserInfo().contact.id;
    }
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + url + "&&" + searchData
      )
      .then((res) => {
        res.data.map((e, i) => {
          if (e.user === null) {
            newDataArray.push(e);
          }
        });
        this.setState({ data: newDataArray });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  editData = (cellid) => {
    this.props.history.push("/members/edit/" + cellid);
  };

  DeleteData = async (cellid, selectedId) => {
    if (cellid.length !== null && selectedId < 1) {
      this.setState({ singleDelete: "", multipleDelete: "" });

      serviceProvider
        .serviceProviderForDeleteRequest(
          process.env.REACT_APP_SERVER_URL + "crm-plugin/contact",
          cellid
        )
        .then((res) => {
          if (res.data.shareinformation) {
            this.deleteShareInfo(res.data.shareinformation.id);
          }
          this.setState({ singleDelete: res.data.name });
          this.setState({ dataCellId: "" });
          this.componentDidMount();
        })
        .catch((error) => {
          this.setState({ singleDelete: false });
          console.log(error);
        });
    }
  };

  deleteShareInfo = async (id) => {
    serviceProvider
      .serviceProviderForDeleteRequest(
        process.env.REACT_APP_SERVER_URL + "shareinformations",
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
            if (res.data.shareinformation) {
              this.deleteShareInfo(res.data.shareinformation.id);
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

  viewData = (cellid) => {
    let memberData;
    this.state.data.map((memData) => {
      if (cellid == memData.id) {
        memberData = memData;
      }
    });
    /** check bandetails present for the SHG of the selected member
     * if yes, allow member to apply for the loan
     * else, display warning message
     */
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/contact/?id=" +
          memberData.individual.shg
      )
      .then((res) => {
        serviceProvider
          .serviceProviderForGetRequest(
            process.env.REACT_APP_SERVER_URL +
              "bankdetails/?organization=" +
              res.data[0].organization.id
          )
          .then((res) => {
            let bankData = res.data;
            this.setState({ bankDetailsFound: true });
            if (bankData.length > 0) {
              this.props.history.push("/loans/apply/" + cellid, memberData);
            } else {
              this.setState({ bankDetailsFound: false });
            }
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    const { classes } = this.props;
    let statesFilter = this.state.getState;
    let filterState = this.state.filterState;
    let districtsFilter = this.state.getDistrict;
    let filterDistrict = this.state.filterDistrict;
    let villagesFilter = this.state.getVillage;
    let filterVillage = this.state.filterVillage;
    let shgFilter = this.state.getShg;
    let filterShg = this.state.filterShg;
    let filters = this.state.values;

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

    let data = this.state.data;
    data.map((memdata) => {
      this.state.getShg.map((shg) => {
        if (
          this.state.loggedInUserRole === "CSP (Community Service Provider)"
        ) {
          if (memdata.individual.shg === shg.contact) {
            memdata.shgName = shg.name;
          }
        } else {
          if (memdata.individual.shg === shg.id) {
            memdata.shgName = shg.name;
          }
        }
      });
    });
    const Usercolumns = [
      {
        name: "Name",
        selector: "name",
        sortable: true,
      },
      {
        name: "State",
        sortable: true,
        cell: (row) => (row.state ? row.state.name : "-"),
      },
      {
        name: "District",
        sortable: true,
        cell: (row) => (row.district ? row.district.name : "-"),
      },
      {
        name: "Village",
        sortable: true,
        cell: (row) => (row.villages[0] ? row.villages[0].name : "-"),
      },
      {
        name: "SHG Name",
        selector: "shgName",
        sortable: true,
      },
      {
        name: "Phone",
        selector: "phone",
        sortable: true,
        cell: (row) => (row.phone ? row.phone : "-"),
      },
    ];

    let selectors = [];
    for (let i in Usercolumns) {
      selectors.push(Usercolumns[i]["selector"]);
    }
    let columnsvalue = selectors[0];

    return (
      <Layout>
        <Grid>
          <div className="App">
            <h5 className={style.menuName}>MEMBERS</h5>
            <div className={style.headerWrap}>
              <h2 className={style.title}>
                Manage Members</h2>
              <div className={classes.buttonRow}>
                <Button
                  variant="contained"
                  component={Link}
                  to="/members/add"
                >
                  Add New Member
                </Button>
              </div>
            </div>
            {!this.state.bankDetailsFound ? (
              <Snackbar severity="info">
                No bank details found for SHG of this member
              </Snackbar>
            ) : null}
            {this.props.location.addData ? (
              <Snackbar severity="success">Member added successfully.</Snackbar>
            ) : this.props.location.editData ? (
              <Snackbar severity="success">
                Member edited successfully.
              </Snackbar>
            ) : null}
            {this.state.singleDelete !== false &&
            this.state.singleDelete !== "" &&
            this.state.singleDelete ? (
              <Snackbar severity="success" Showbutton={false}>
                Member {this.state.singleDelete} deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.singleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === true ? (
              <Snackbar severity="success" Showbutton={false}>
                Members deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            <div className={classes.row} style={{flexWrap: "wrap", height: "auto",}}>
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
                          name="filterVillage"
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
                      options={shgFilter}
                      name="filterShg"
                      getOptionLabel={(option) => option.name}
                      onChange={(event, value) => {
                        this.handleShgChange(event, value);
                      }}
                      value={
                        filterShg
                          ? this.state.isCancel === true
                            ? null
                            : filterShg
                          : null
                      }
                      renderInput={(params) => (
                        <Input
                          {...params}
                          fullWidth
                          label="Select SHG"
                          name="filterShg"
                          variant="outlined"
                        />
                      )}
                    />
                  </Grid>
                </div>
              </div>
              <Button style={{ marginRight: "5px", marginBottom: "8px", }}
                variant="contained"
                onClick={this.handleSearch.bind(this)}
              >
                Search
              </Button>
              <Button style={{ marginBottom: "8px", }}
                color="secondary"
                variant="contained"
                onClick={this.cancelForm.bind(this)}
              >
                Reset
              </Button>
            </div>
            <div className={style.manageTable}>
            {data ? (
              <Table
                title={"Members"}
                showSearch={false}
                filterData={true}
                filterBy={[
                  "name",
                  "villages[0].name",
                  "district.name",
                  "shgName",
                  "phone",
                ]}
                filters={filters}
                data={data}
                column={Usercolumns}
                viewData={this.viewData}
                editData={this.editData}
                DeleteData={this.DeleteData}
                DeleteAll={this.DeleteAll}
                columnsvalue={columnsvalue}
                selectableRows
                pagination
                DeleteMessage={"Are you Sure you want to Delete"}
              />
            ) : (
                <h1>Loading...</h1>
              )}
            </div>
          </div>
        </Grid>
      </Layout>
    );
  }
}
export default withStyles(useStyles)(Members);
