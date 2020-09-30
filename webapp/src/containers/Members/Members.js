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
import * as constants from "../../constants/Constants";
import * as formUtilities from "../../utilities/FormUtilities";

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
const SORT_FIELD_KEY = "_sort";

export class Members extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      data: [],
      getDistrict: [],
      getVillage: [],
      getShg: [],
      filterDistrict: "",
      filterVillage: "",
      filterShg: "",
      isCancel: false,
      DeleteData: false,
      datacellId: [],
      singleDelete: "",
      multipleDelete: "",
      loggedInUserRole: auth.getUserInfo().role.name,
      bankDetailsFound: true,
      confirmSingleDelete: true,
      confirmDelete: true,
      singleDeleteName: "",
      isLoader: true,
      stateId: constants.STATE_ID,
      /** pagination data */
      pageSize: "",
      totalRows: "",
      page: "",
      pageCount: "",
      resetPagination: false,
    };
  }

  async componentDidMount() {
    await this.getMembers(10, 1);

    // get all SHGs
    let url =
      "crm-plugin/contact/?contact_type=organization&organization.sub_type=SHG&&_sort=name:ASC";
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
                "crm-plugin/contact/shglist/?id=" +
                res.data.fpo.id
            )
            .then((shgRes) => {
              this.setState({ getShg: shgRes.data.result });
            })
            .catch((error) => {});
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

  getMembers = async (pageSize, page, params = null) => {
    if (params !== null && !formUtilities.checkEmpty(params)) {
      let defaultParams = {};
      if (params.hasOwnProperty(SORT_FIELD_KEY)) {
        defaultParams = {
          page: page,
          pageSize: pageSize,
          contact_type: "individual",
          user_null: true,
        };
      } else {
        defaultParams = {
          page: page,
          pageSize: pageSize,
          [SORT_FIELD_KEY]: "name:ASC",
          contact_type: "individual",
          user_null: true,
        };
      }
      Object.keys(params).map((key) => {
        defaultParams[key] = params[key];
      });
      params = defaultParams;
    } else {
      params = {
        page: page,
        pageSize: pageSize,
        [SORT_FIELD_KEY]: "name:ASC",
        contact_type: "individual",
        user_null: true,
      };
    }
    if (this.state.loggedInUserRole === "CSP (Community Service Provider)") {
      await serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/individuals/" +
            auth.getUserInfo().contact.individual
        )
        .then((res) => {
          serviceProvider
            .serviceProviderForGetRequest(
              process.env.REACT_APP_SERVER_URL +
                "crm-plugin/contact/members/?id=" +
                res.data.vo.id,
              params
            )
            .then((memResp) => {
              this.setState({
                data: memResp.data.result,
                isLoader: false,
                pageSize: memResp.data.pageSize,
                totalRows: memResp.data.rowCount,
                page: memResp.data.page,
                pageCount: memResp.data.pageCount,
              });
            });
        })
        .catch((error) => {});
    } else {
      await serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL + "crm-plugin/contact/members/",
          params
        )
        .then((res) => {
          this.setState({
            data: res.data.result,
            isLoader: false,
            pageSize: res.data.pageSize,
            totalRows: res.data.rowCount,
            page: res.data.page,
            pageCount: res.data.pageCount,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }

    //api call for districts filter
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/districts/?_sort=name:ASC&&is_active=true&&state.id=" +
          this.state.stateId
      )
      .then((res) => {
        this.setState({ getDistrict: res.data });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  /** Pagination to handle row change*/
  handlePerRowsChange = async (perPage, page) => {
    if (formUtilities.checkEmpty(this.state.values)) {
      await this.getMembers(perPage, page);
    } else {
      await this.getMembers(perPage, page, this.state.values);
    }
  };

  /** Pagination to handle page change */
  handlePageChange = (page) => {
    if (formUtilities.checkEmpty(this.state.values)) {
      this.getMembers(this.state.pageSize, page);
    } else {
      this.getMembers(this.state.pageSize, page, this.state.values);
    }
  };

  /** Sorting */
  handleSort = (
    column,
    sortDirection,
    perPage = this.state.pageSize,
    page = 1
  ) => {
    if (column.selector === "name") {
      column.selector = "name";
    }
    if (column.selector === "shgName") {
      column.selector = "individual.shg";
    }
    this.state.values[SORT_FIELD_KEY] = column.selector + ":" + sortDirection;
    this.getMembers(perPage, page, this.state.values);
  };

  handleSearch() {
    this.setState({ isLoader: true });
    this.getMembers(this.state.pageSize, this.state.page, this.state.values);
  }

  handleDistrictChange(event, value) {
    if (value !== null) {
      this.setState({
        filterDistrict: value,
        isCancel: false,
        filterVillage: "",
        values: { ...this.state.values, ["addresses.district"]: value.id },
      });
      let distId = value.id;
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/villages/?_sort=name:ASC&&is_active=true&&district.id=" +
            distId
        )
        .then((res) => {
          this.setState({ getVillage: res.data });
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      delete this.state.values["addresses.district"];
      delete this.state.values["addresses.village"];
      this.setState({
        filterDistrict: "",
        filterVillage: "",
        getVillage: [],
        ...this.state.values,
      });
      this.componentDidMount();
    }
  }

  handleShgChange(event, value) {
    if (value !== null) {
      this.setState({
        filterShg: value,
        isCancel: false,
      });
      if (this.state.loggedInUserRole === "CSP (Community Service Provider)") {
        this.setState({
          values: { ...this.state.values, ["individual.shg"]: value.contact },
        });
      } else {
        this.setState({
          values: { ...this.state.values, ["individual.shg"]: value.id },
        });
      }
    } else {
      delete this.state.values["individual.shg"];
      this.setState({
        filterShg: "",
        ...this.state.values,
      });
    }
  }

  handleVillageChange(event, value) {
    if (value !== null) {
      this.setState({
        filterVillage: value,
        isCancel: false,
        values: { ...this.state.values, ["addresses.village"]: value.id },
      });
    } else {
      delete this.state.values["addresses.village"];
      this.setState({
        filterVillage: "",
        ...this.state.values,
      });
    }
  }

  cancelForm = () => {
    this.setState({
      filterDistrict: "",
      filterVillage: "",
      filterShg: "",
      isCancel: true,
      isLoader: true,
      values: {},
    });

    this.componentDidMount();
  };

  editData = (cellId) => {
    this.props.history.push("/members/edit/" + cellId);
  };

  DeleteData = async (cellId, selectedId) => {
    if (cellId.length !== null && selectedId < 1) {
      this.setState({
        singleDelete: "",
        multipleDelete: "",
      });
      if (this.state.confirmSingleDelete === false) {
        this.setState({ confirmSingleDelete: true });
      }

      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "loan-applications/?contact.id=" +
            cellId
        )
        .then((loanRes) => {
          if (loanRes.data.length > 0) {
            this.setState({
              confirmSingleDelete: false,
              singleDeleteName: loanRes.data[0].contact.name,
            });
          } else {
            serviceProvider
              .serviceProviderForDeleteRequest(
                process.env.REACT_APP_SERVER_URL + "crm-plugin/contact",
                cellId
              )
              .then((res) => {
                if (res.data.shareinformation) {
                  this.deleteShareInfo(res.data.shareinformation.id);
                }
                this.setState({ singleDelete: res.data.name });
                this.setState({ datacellId: "" });
                this.componentDidMount();
              })
              .catch((error) => {
                this.setState({ singleDelete: false });
                console.log(error);
              });
          }
        })
        .catch((error) => {});
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
          .serviceProviderForGetRequest(
            process.env.REACT_APP_SERVER_URL +
              "loan-applications/?contact.id=" +
              selectedId[i]
          )
          .then((loanRes) => {
            if (loanRes.data.length > 0) {
              this.setState({
                confirmDelete: false,
              });
            } else {
              serviceProvider
                .serviceProviderForDeleteRequest(
                  process.env.REACT_APP_SERVER_URL + "crm-plugin/contact",
                  selectedId[i]
                )
                .then((res) => {
                  if (res.data.shareinformation) {
                    this.deleteShareInfo(res.data.shareinformation.id);
                  }
                  this.setState({
                    multipleDelete: true,
                  });
                  this.componentDidMount();
                })
                .catch((error) => {
                  this.setState({ multipleDelete: false });
                  console.log(error);
                });
            }
          })
          .catch((error) => {});
      }
    }
  };

  viewData = (cellId) => {
    let memberData;
    this.state.data.map((memData) => {
      if (cellId == memData.id) {
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
              this.props.history.push("/loans/apply/" + cellId, memberData);
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
    let districtsFilter = this.state.getDistrict;
    let filterDistrict = this.state.filterDistrict;
    let villagesFilter = this.state.getVillage;
    let filterVillage = this.state.filterVillage;
    let shgFilter = this.state.getShg;
    let filterShg = this.state.filterShg;
    let filters = this.state.values;
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
    const Usercolumns = [
      {
        name: "Name",
        selector: "name",
        sortable: true,
      },
      {
        name: "Certificate No.",
        cell: (row) =>
          row.shareinformation
            ? row.shareinformation.certificate_no ||
              row.shareinformation.certificate_no !== null
              ? row.shareinformation.certificate_no
              : "-"
            : "-",
      },
      {
        name: "District",
        selector: "districtName",
        cell: (row) => (row.districtName ? row.districtName : "-"),
      },
      {
        name: "Village",
        selector: "villageName",
        cell: (row) => (row.villageName ? row.villageName : "-"),
      },
      {
        name: "SHG Name",
        selector: "shgName",
        sortable: true,
        cell: (row) => (row.shgName ? row.shgName : "-"),
      },
      {
        name: "Phone",
        selector: "phone",
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
              <h2 className={style.title}>Manage Members</h2>
              <div className={classes.buttonRow}>
                <Button variant="contained" component={Link} to="/members/add">
                  Add New Member
                </Button>
              </div>
            </div>
            {!this.state.bankDetailsFound ? (
              <Snackbar severity="info">
                No bank details found for SHG of this member
              </Snackbar>
            ) : null}
            {!this.state.confirmDelete ? (
              <Snackbar severity="info">
                Loan exists for some of the members hence can not be deleted.
              </Snackbar>
            ) : null}
            {!this.state.confirmSingleDelete ? (
              <Snackbar severity="info">
                Loan exists for the member {this.state.singleDeleteName}, it can
                not be deleted.
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
            <div
              className={classes.row}
              style={{ flexWrap: "wrap", height: "auto" }}
            >
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
              <Button
                style={{ marginRight: "5px", marginBottom: "8px" }}
                variant="contained"
                onClick={this.handleSearch.bind(this)}
              >
                Search
              </Button>
              <Button
                style={{ marginBottom: "8px" }}
                color="secondary"
                variant="contained"
                onClick={this.cancelForm.bind(this)}
              >
                Reset
              </Button>
            </div>
            <div>
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
                  paginationServer
                  paginationDefaultPage={this.state.page}
                  paginationPerPage={this.state.pageSize}
                  paginationTotalRows={this.state.totalRows}
                  paginationRowsPerPageOptions={[10, 15, 20, 25, 30]}
                  paginationResetDefaultPage={this.state.resetPagination}
                  onChangeRowsPerPage={this.handlePerRowsChange}
                  onChangePage={this.handlePageChange}
                  onSort={this.handleSort}
                  sortServer={true}
                  progressComponent={this.state.isLoader}
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
