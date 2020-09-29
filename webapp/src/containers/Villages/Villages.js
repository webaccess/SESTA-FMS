import React from "react";
import * as serviceProvider from "../../api/Axios";
import Table from "../../components/Datatable/Datatable.js";
import Layout from "../../hoc/Layout/Layout";
import Button from "../../components/UI/Button/Button";
import { withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import { map } from "lodash";
import style from "./Villages.module.css";
import { Grid } from "@material-ui/core";
import Autocomplete from "../../components/Autocomplete/Autocomplete";
import Input from "../../components/UI/Input/Input";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import Modal from "../../components/UI/Modal/Modal.js";
import Switch from "../../components/UI/Switch/Switch";
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
  States: {
    marginRight: theme.spacing(1),
  },
  Search: {
    marginRight: theme.spacing(1),
  },
  Cancel: {
    marginRight: theme.spacing(1),
  },
  menuName: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    margin: "0px",
  },
});
const SORT_FIELD_KEY = "_sort";

export class Villages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      filterDistrict: "",
      Result: [],
      data: [],
      contacts: [],
      selectedid: 0,
      open: false,
      isActiveAllShowing: false,
      columnsvalue: [],
      DeleteData: false,
      properties: props,
      getDistrict: [],
      isCancel: false,
      dataCellId: [],
      deleteVillageName: "",
      singleDelete: "",
      multipleDelete: "",
      villageInUse: "",
      villageInUseSingleDelete: "",
      villageInUseDeleteAll: "",
      active: {},
      allIsActive: [],
      isLoader: true,
      stateId: constants.STATE_ID,
      /** pagination data */
      pageSize: "",
      totalRows: "",
      page: "",
      pageCount: "",
      resetPagination: false,
      values: {},
    };
  }
  async componentDidMount() {
    await this.getVillage(10, 1);

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

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/contact/?_sort=id:ASC"
      )
      .then((res) => {
        this.setState({ contacts: res.data });
      });
  }

  getVillage = async (pageSize, page, params = null) => {
    if (params !== null && !formUtilities.checkEmpty(params)) {
      let defaultParams = {};
      if (params.hasOwnProperty(SORT_FIELD_KEY)) {
        defaultParams = {
          page: page,
          pageSize: pageSize,
        };
      } else {
        defaultParams = {
          page: page,
          pageSize: pageSize,
          [SORT_FIELD_KEY]: "name:ASC",
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
      };
    }
    await serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/villages/get",
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
      });
  };

  handleVillageChange(event, value) {
    this.setState({
      [event.target.name]: event.target.value,
      values: {
        ["name_contains"]: event.target.value,
      },
    });
  }

  handleDistrictChange(event, value) {
    if (value !== null) {
      this.setState({
        filterDistrict: value,
        values: {
          ["district.id"]: value.id,
        },
      });
    } else {
      this.setState({
        filterDistrict: "",
      });
    }
  }

  /** Pagination to handle row change*/
  handlePerRowsChange = async (perPage, page) => {
    // this.setState({ isLoader: true });
    if (formUtilities.checkEmpty(this.state.values)) {
      await this.getVillage(perPage, page);
    } else {
      await this.getVillage(perPage, page, this.state.values);
    }
  };

  /** Pagination to handle page change */
  handlePageChange = (page) => {
    // this.setState({ isLoader: true });
    if (formUtilities.checkEmpty(this.state.values)) {
      this.getVillage(this.state.pageSize, page);
    } else {
      this.getVillage(this.state.pageSize, page, this.state.values);
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
    this.state.values[SORT_FIELD_KEY] = column.selector + ":" + sortDirection;
    this.getVillage(perPage, page, this.state.values);
  };

  handleSearch() {
    this.setState({ isLoader: true });
    this.getVillage(this.state.pageSize, this.state.page, this.state.values);
  }

  handleActive = (event) => {
    this.setState({ isActiveAllShowing: false });
    let setActiveId = this.state.setActiveId;
    let IsActive = this.state.IsActive;
    let villageInUse = false;
    this.state.contacts.find((cd) => {
      if (cd.addresses.length > 0) {
        if (cd.addresses[0].village === parseInt(setActiveId)) {
          this.state.data.map((villgdata) => {
            if (parseInt(setActiveId) === villgdata.id) {
              this.setState({
                villageInUse: true,
                deleteVillageName: villgdata.name,
              });
              villageInUse = true;
            }
          });
        }
      }
    });
    if (!villageInUse) {
      serviceProvider
        .serviceProviderForPutRequest(
          process.env.REACT_APP_SERVER_URL + "crm-plugin/villages",
          setActiveId,
          {
            is_active: IsActive,
          }
        )
        .then((res) => {
          this.setState({ formSubmitted: true });
          this.setState({ open: true });
          this.componentDidMount({ updateData: true });
          this.props.history.push({ pathname: "/villages", updateData: true });
          if (
            this.props.location.updateData &&
            this.snackbar.current !== null
          ) {
            this.snackbar.current.handleClick();
          }
        })
        .catch((error) => {
          this.setState({ formSubmitted: false });
          if (error.response !== undefined) {
            this.setState({
              errorCode:
                error.response.data.statusCode +
                " Error- " +
                error.response.data.error +
                " Message- " +
                error.response.data.message +
                " Please try again!",
            });
          } else {
            this.setState({ errorCode: "Network Error - Please try again!" });
          }
          console.log(error);
        });
    }
  };

  editData = (cellid) => {
    this.props.history.push("/villages/edit/" + cellid);
  };

  DeleteData = (cellid, selectedId) => {
    if (cellid.length !== null && selectedId < 1) {
      this.setState({ singleDelete: "", multipleDelete: "" });
      let villageInUseSingleDelete = false;
      this.state.contacts.find((cd) => {
        if (cd.addresses.length > 0) {
          if (cd.addresses[0].village === parseInt(cellid)) {
            this.state.data.map((villgdata) => {
              if (cellid === villgdata.id) {
                this.setState({
                  villageInUseSingleDelete: true,
                  deleteVillageName: villgdata.name,
                });
                villageInUseSingleDelete = true;
              }
            });
          }
        }
      });

      if (!villageInUseSingleDelete) {
        serviceProvider
          .serviceProviderForDeleteRequest(
            process.env.REACT_APP_SERVER_URL + "crm-plugin/villages",
            cellid
          )
          .then((res) => {
            this.setState({ singleDelete: res.data.name });
            this.setState({ dataCellId: "" });
            this.componentDidMount();
          })
          .catch((error) => {
            this.setState({ singleDelete: false });
            console.log(error);
          });
      }
    }
  };

  DeleteAll = (selectedId) => {
    if (selectedId.length !== 0) {
      this.setState({ singleDelete: "", multipleDelete: "" });

      let villgInUse = [];
      this.state.contacts.map((cd) => {
        if (cd.addresses.length > 0 && cd.addresses[0].village != null) {
          for (let i in selectedId) {
            if (parseInt(selectedId[i]) === cd.addresses[0].village) {
              villgInUse.push(selectedId[i]);
              this.setState({ villageInUseDeleteAll: true });
            }
            villgInUse = [...new Set(villgInUse)];
          }
        }
      });

      var deleteVillg = selectedId.filter(function (obj) {
        return villgInUse.indexOf(obj) == -1;
      });
      for (let i in deleteVillg) {
        serviceProvider
          .serviceProviderForDeleteRequest(
            process.env.REACT_APP_SERVER_URL + "crm-plugin/villages",
            deleteVillg[i]
          )
          .then((res) => {
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

  confirmActive = (event) => {
    if (this.state.villageInUse === true) {
      this.setState({ villageInUse: "" });
    }
    this.setState({ isActiveAllShowing: true });
    this.setState({ setActiveId: event.target.id });
    this.setState({ IsActive: event.target.checked });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  closeActiveAllModalHandler = (event) => {
    this.setState({ isActiveAllShowing: false });
  };

  handleCheckBox = (event) => {
    this.setState({ [event.target.name]: event.target.checked });
    this.setState({ addIsActive: true });
  };

  cancelForm = () => {
    this.setState({
      filterDistrict: "",
      name: "",
      values: {},
      formSubmitted: "",
      isCancel: true,
      isLoader: true,
    });
    this.componentDidMount();
  };

  render() {
    let data = this.state.data;
    const Usercolumns = [
      {
        name: "Village",
        selector: "name",
        sortable: true,
        cell: (row) => (row.name ? row.name : "-"),
      },
      {
        name: "District",
        selector: "district.name",
        sortable: true,
        cell: (row) => (row.district.name ? row.district.name : "-"),
      },
      {
        name: "Active",
        cell: (cell) => (
          <Switch
            id={cell.id}
            onChange={(e) => {
              this.confirmActive(e);
            }}
            defaultChecked={cell.is_active}
            Small={true}
          />
        ),
        sortable: true,
        button: true,
      },
    ];

    let selectors = [];
    for (let i in Usercolumns) {
      selectors.push(Usercolumns[i]["selector"]);
    }

    let columnsvalue = selectors[0];
    const { classes } = this.props;
    let statesFilter = this.state.getState;
    let districtsFilter = this.state.getDistrict;
    let filterDistrict = this.state.filterDistrict;
    let filters = this.state.values;
    let addDistricts = [];
    map(filterDistrict, (district, key) => {
      addDistricts.push(
        districtsFilter.findIndex(function (item, i) {
          return item.id === district;
        })
      );
    });

    return (
      <Layout>
        <Grid>
          <div className="App">
            <h5 className={classes.menuName}>MASTERS</h5>
            <div className={style.headerWrap}>
              <h2 className={style.title}>Manage Villages</h2>
              <div className={classes.buttonRow}>
                <Button variant="contained" component={Link} to="/Villages/add">
                  Add Village
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
            {this.props.location.updateData ? (
              <Snackbar
                ref={this.snackbar}
                open={true}
                autoHideDuration={4000}
                severity="success"
              >
                Village updated successfully.
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
            {this.state.multipleDelete === true &&
            this.state.villageInUseDeleteAll !== true ? (
              <Snackbar severity="success" Showbutton={false}>
                Villages deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            {this.state.villageInUse === true ? (
              <Snackbar severity="info" Showbutton={false}>
                Village {this.state.deleteVillageName} is in use, it can not be
                Deactivated!!
              </Snackbar>
            ) : null}
            {this.state.villageInUseSingleDelete === true ? (
              <Snackbar severity="info" Showbutton={false}>
                Village {this.state.deleteVillageName} is in use, it can not be
                Deleted.
              </Snackbar>
            ) : null}
            {this.state.villageInUseDeleteAll === true ? (
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
                      label="Village Name"
                      name="name"
                      variant="outlined"
                      onChange={(event, value) => {
                        this.handleVillageChange(event, value);
                      }}
                      value={this.state.name || ""}
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
                title={"Villages"}
                showSearch={false}
                filterData={true}
                allIsActive={this.state.allIsActive}
                Searchplaceholder={"Search by Village Name"}
                filterBy={["name", "state.name"]}
                filters={filters}
                data={data}
                column={Usercolumns}
                editData={this.editData}
                DeleteData={this.DeleteData}
                DeleteAll={this.DeleteAll}
                handleActive={this.handleActive}
                rowsSelected={this.rowsSelect}
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
            <Modal
              className="modal"
              show={this.state.isActiveAllShowing}
              close={this.closeActiveAllModalHandler}
              displayCross={{ display: "none" }}
              handleEventChange={true}
              event={this.handleActive}
              footer={{
                footerSaveName: "OKAY",
                footerCloseName: "CLOSE",
                displayClose: { display: "true" },
                displaySave: { display: "true" },
              }}
            >
              {this.state.IsActive
                ? "Do you want to activate selected village ?"
                : "Do you want to deactivate selected village ?"}
            </Modal>
          </div>
        </Grid>
      </Layout>
    );
  }
}
export default withStyles(useStyles)(Villages);
