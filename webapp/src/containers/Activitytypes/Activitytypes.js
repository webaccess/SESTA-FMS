import React from "react";
import * as serviceProvider from "../../api/Axios";
import Table from "../../components/Datatable/Datatable.js";
import Layout from "../../hoc/Layout/Layout";
import Button from "../../components/UI/Button/Button";
import { withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import style from "./Activitytypes.module.css";
import { Grid } from "@material-ui/core";
import Input from "../../components/UI/Input/Input";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import Modal from "../../components/UI/Modal/Modal.js";
import Switch from "../../components/UI/Switch/Switch";
import * as formUtilities from "../../utilities/FormUtilities";

const useStyles = (theme) => ({
  root: {},
  row: {
    height: "42px",
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(1),
  },
  buttonRow: {
    height: "42px",
    marginTop: theme.spacing(1),
  },
  floatRow: {
    height: "40px",
    float: "right",
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
  Activitytypes: {
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

export class Activitytypes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      filterActivitytype: "",
      Result: [],
      data: [],
      selectedid: 0,
      open: false,
      isActiveAllShowing: false,
      columnsvalue: [],
      DeleteData: false,
      isCancel: false,
      dataCellId: [],
      singleDelete: "",
      multipleDelete: "",
      allIsActive: [],
      isActTypePresent: false,
      isLoader: true,
      activities: [],
      acttypeInUseSingleDelete: "",
      acttypeInUseDeleteAll: "",
      deleteActtypeName: "",
      /** pagination data */
      pageSize: "",
      totalRows: "",
      page: "",
      pageCount: "",
      resetPagination: false,
    };
  }

  async componentDidMount() {
    await this.getActivityTypes(10, 1);

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/activities/?_sort=start_datetime:desc"
      )
      .then((activityRes) => {
        this.setState({ activities: activityRes.data });
      });
  }

  getActivityTypes = async (pageSize, page, params = null) => {
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
        process.env.REACT_APP_SERVER_URL + "crm-plugin/activitytypes/get",
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
  };

  /** Pagination to handle row change*/
  handlePerRowsChange = async (perPage, page) => {
    // this.setState({ isLoader: true });
    if (formUtilities.checkEmpty(this.state.values)) {
      await this.getActivityTypes(perPage, page);
    } else {
      await this.getActivityTypes(perPage, page, this.state.values);
    }
  };

  /** Pagination to handle page change */
  handlePageChange = (page) => {
    // this.setState({ isLoader: true });
    if (formUtilities.checkEmpty(this.state.values)) {
      this.getActivityTypes(this.state.pageSize, page);
    } else {
      this.getActivityTypes(this.state.pageSize, page, this.state.values);
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
    if (column.selector === "remuneration") {
      column.selector = "remuneration";
    }
    this.state.values[SORT_FIELD_KEY] = column.selector + ":" + sortDirection;
    this.getActivityTypes(perPage, page, this.state.values);
  };

  //activityFilter(event, value, target) {
  //  this.setState({
  //    values: { ...this.state.values, [event.target.name]: event.target.value },
  //  });
  //}

  getData(result) {
    for (let i in result) {
      let activitytypes = [];
      let contacts = [];
      for (let j in result[i].activitytypes) {
        activitytypes.push(result[i].activitytypes[j].name + " ");
        activitytypes.push(result[i].activitytypes[j].remuneration + " ");
        activitytypes.push(result[i].activitytypes[j].contacts + " ");
      }
      result[i]["activitytypes"] = activitytypes;
    }

    return result;
  }

  AllModalHandler = (event) => {
    this.setState({ isActiveAllShowing: false });
  };

  handleSearch() {
    this.setState({ isLoader: true });
    this.getActivityTypes(
      this.state.pageSize,
      this.state.page,
      this.state.values
    );
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
      values: {
        ["name_contains"]: event.target.value,
      },
    });
  }

  editData = (cellid) => {
    this.props.history.push("/activitytypes/edit/" + cellid);
  };

  cancelForm = () => {
    this.setState({
      filterActivitytype: "",
      values: {},
      formSubmitted: "",
      stateSelected: false,
      isCancel: true,
      isLoader: true,
    });
    this.componentDidMount();
  };

  DeleteData = (cellid, selectedId) => {
    if (cellid.length !== null && selectedId < 1) {
      this.setState({ singleDelete: "", multipleDelete: "" });
      let acttypeInUseSingleDelete = false;
      this.state.activities.find((act) => {
        if (act.activitytype !== null) {
          if (act.activitytype.id === parseInt(cellid)) {
            this.setState({
              acttypeInUseSingleDelete: true,
              deleteActtypeName: act.activitytype.name,
            });
            acttypeInUseSingleDelete = true;
          }
        }
      });
      if (!acttypeInUseSingleDelete) {
        serviceProvider
          .serviceProviderForDeleteRequest(
            process.env.REACT_APP_SERVER_URL + "crm-plugin/activitytypes",
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

      let acttypeInUse = [];
      this.state.activities.map((act) => {
        if (act.activitytype !== null) {
          for (let i in selectedId) {
            if (parseInt(selectedId[i]) === act.activitytype.id) {
              acttypeInUse.push(selectedId[i]);
              this.setState({ acttypeInUseDeleteAll: true });
            }
            acttypeInUse = [...new Set(acttypeInUse)];
          }
        }
      });
      var deleteActtype = selectedId.filter(function (obj) {
        return acttypeInUse.indexOf(obj) == -1;
      });

      for (let i in deleteActtype) {
        serviceProvider
          .serviceProviderForDeleteRequest(
            process.env.REACT_APP_SERVER_URL + "crm-plugin/activitytypes",
            deleteActtype[i]
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

  confirmActive = (event) => {
    this.setState({ isActiveAllShowing: true });
    this.setState({ setActiveId: event.target.id });
    this.setState({ IsActive: event.target.checked });
    if (this.state.isActTypePresent === true) {
      this.setState({ isActTypePresent: false });
    }
  };

  handleActive = (event) => {
    this.setState({ isActiveAllShowing: false });
    let setActiveId = this.state.setActiveId;
    let IsActive = this.state.IsActive;
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/activities/?activitytype.id=" +
          setActiveId
      )
      .then((typeRes) => {
        if (typeRes.data.length > 0) {
          this.setState({
            isActTypePresent: true,
            deleteActtypeName: typeRes.data[0].activitytype.name,
          });
        } else {
          this.setState({ isActTypePresent: false });
          serviceProvider
            .serviceProviderForPutRequest(
              process.env.REACT_APP_SERVER_URL + "crm-plugin/activitytypes",
              setActiveId,
              {
                is_active: IsActive,
              }
            )
            .then((res) => {
              this.setState({ formSubmitted: true });
              this.setState({ open: true });
              this.componentDidMount({ editData: true });
              this.props.history.push({
                pathname: "/activitytypes",
                editData: true,
              });
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
                this.setState({
                  errorCode: "Network Error - Please try again!",
                });
              }
              console.log(error);
            });
        }
      })
      .catch((error) => {});
  };

  closeActiveAllModalHandler = (event) => {
    this.setState({ isActiveAllShowing: false });
  };

  handleCheckBox = (event) => {
    this.setState({ [event.target.name]: event.target.checked });
  };

  render() {
    let data = this.state.data;
    const Usercolumns = [
      {
        name: "Activity Type",
        selector: "name",
        sortable: true,
      },
      {
        name: "Remuneration",
        selector: "remuneration",
        sortable: true,
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
    let filters = this.state.values;
    return (
      <Layout>
        <Grid>
          <div className="App">
            <h5 className={classes.menuName}>MASTERS</h5>
            <div className={style.headerWrap}>
              <h2 className={style.title}>Manage Activity Types</h2>
              <div className={classes.buttonRow}>
                <Button
                  variant="contained"
                  component={Link}
                  to="/activitytypes/add"
                >
                  Add Activity Type
                </Button>
              </div>
            </div>
            {this.props.location.addData ? (
              <Snackbar severity="success">
                Activity type added successfully.
              </Snackbar>
            ) : null}
            {this.props.location.editData ? (
              <Snackbar severity="success">
                Activity type edited successfully.
              </Snackbar>
            ) : null}
            {this.props.location.updateData ? (
              <Snackbar
                ref={this.snackbar}
                open={true}
                autoHideDuration={4000}
                severity="success"
              >
                Activity type updated successfully.
              </Snackbar>
            ) : null}
            {this.state.singleDelete !== false &&
            this.state.singleDelete !== "" &&
            this.state.singleDelete ? (
              <Snackbar severity="success" Showbutton={false}>
                Activity type {this.state.singleDelete} deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.singleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === true &&
            this.state.acttypeInUseDeleteAll !== true ? (
              <Snackbar severity="success" Showbutton={false}>
                Activity types deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.isActTypePresent === true ? (
              <Snackbar severity="info" Showbutton={false}>
                Activity type {this.state.deleteActtypeName} is in use, it can
                not be Deactivated!!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            {this.state.acttypeInUseSingleDelete === true ? (
              <Snackbar severity="info" Showbutton={false}>
                Activity type {this.state.deleteActtypeName} is in use, it can
                not be Deleted.
              </Snackbar>
            ) : null}
            {this.state.acttypeInUseDeleteAll === true ? (
              <Snackbar severity="info" Showbutton={false}>
                Some Activity types are in use hence it can not be Deleted.
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
                      label="Activity Type"
                      name="filterActivitytype"
                      variant="outlined"
                      value={this.state.filterActivitytype || ""}
                      onChange={this.handleChange.bind(this)}
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
                Reset
              </Button>
            </div>
            {data ? (
              <Table
                showSetAllActive={true}
                title={"Activitytypes"}
                showSearch={false}
                filterData={true}
                allIsActive={this.state.allIsActive}
                Searchplaceholder={"Search by Activity Type Name"}
                filterBy={["name"]}
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
                ? "Do you want to activate selected activity type ?"
                : "Do you want to deactivate selected activity type ?"}
            </Modal>
          </div>
        </Grid>
      </Layout>
    );
  }
}
export default withStyles(useStyles)(Activitytypes);
