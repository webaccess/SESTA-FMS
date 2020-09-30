import React from "react";
import { Grid } from "@material-ui/core";
import Layout from "../../hoc/Layout/Layout";
import * as serviceProvider from "../../api/Axios";
import Table from "../../components/Datatable/Datatable.js";
import { withStyles } from "@material-ui/core/styles";
import Autocomplete from "../../components/Autocomplete/Autocomplete.js";
import style from "./Activity.module.css";
import { Link } from "react-router-dom";
import Input from "../../components/UI/Input/Input";
import Button from "../../components/UI/Button/Button";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import auth from "../../components/Auth/Auth";
import Moment from "moment";
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
});
const SORT_FIELD_KEY = "_sort";

export class Activity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      data: [],
      getActivitytype: [],
      isLoader: true,
      /** pagination data */
      pageSize: "",
      totalRows: "",
      page: "",
      pageCount: "",
      resetPagination: false,
    };
  }

  async componentDidMount() {
    await this.getActivities(10, 1);

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/activitytypes/?is_active=true&&_sort=name:asc"
      )
      .then((res) => {
        this.setState({ getActivitytype: res.data });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  getActivities = async (pageSize, page, params = null) => {
    if (params !== null && !formUtilities.checkEmpty(params)) {
      let defaultParams = {};
      if (params.hasOwnProperty(SORT_FIELD_KEY)) {
        defaultParams = {
          page: page,
          pageSize: pageSize,
          "activityassignees.contact": auth.getUserInfo().contact.id,
        };
      } else {
        defaultParams = {
          page: page,
          pageSize: pageSize,
          [SORT_FIELD_KEY]: "start_datetime:DESC",
          "activityassignees.contact": auth.getUserInfo().contact.id,
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
        [SORT_FIELD_KEY]: "start_datetime:DESC",
        "activityassignees.contact": auth.getUserInfo().contact.id,
      };
    }
    await serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/activities/get/",
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
      await this.getActivities(perPage, page);
    } else {
      await this.getActivities(perPage, page, this.state.values);
    }
  };

  /** Pagination to handle page change */
  handlePageChange = (page) => {
    // this.setState({ isLoader: true });
    if (formUtilities.checkEmpty(this.state.values)) {
      this.getActivities(this.state.pageSize, page);
    } else {
      this.getActivities(this.state.pageSize, page, this.state.values);
    }
  };

  /** Sorting */
  handleSort = (
    column,
    sortDirection,
    perPage = this.state.pageSize,
    page = 1
  ) => {
    if (column.selector === "title") {
      column.selector = "title";
    }
    if (column.selector === "activitytype.name") {
      column.selector = "activitytype.name";
    }
    this.state.values[SORT_FIELD_KEY] = column.selector + ":" + sortDirection;
    this.getActivities(perPage, page, this.state.values);
  };

  handleSearch() {
    this.setState({ isLoader: true });
    this.getActivities(this.state.pageSize, this.state.page, this.state.values);
  }

  handleActivitytype = async (event, value) => {
    if (value !== null) {
      this.setState({
        filterActivitytype: value.id,
        values: { ...this.state.values, ["activitytype.id"]: value.id },
      });
    } else {
      delete this.state.values["activitytype.id"];
      this.setState({
        filterActivitytype: "",
        ...this.state.values,
      });
    }
  };

  handleActivityChange(event, value, target) {
    this.setState({
      [event.target.name]: event.target.value,
      values: { ...this.state.values, ["title_contains"]: event.target.value },
    });
  }

  editData = (cellid) => {
    this.props.history.push("/activities/edit/" + cellid);
  };

  DeleteData = (cellid, selectedId) => {
    if (cellid.length !== null && selectedId < 1) {
      this.setState({ singleDelete: "", multipleDelete: "" });
      serviceProvider
        .serviceProviderForDeleteRequest(
          process.env.REACT_APP_SERVER_URL + "crm-plugin/activities",
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
  };

  DeleteAll = (selectedId) => {
    if (selectedId.length !== 0) {
      this.setState({ singleDelete: "", multipleDelete: "" });
      for (let id in selectedId) {
        serviceProvider
          .serviceProviderForDeleteRequest(
            process.env.REACT_APP_SERVER_URL + "crm-plugin/activities",
            selectedId[id]
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

  cancelForm = () => {
    this.setState({
      filterActivitytype: null,
      FilterActivity: "",
      values: {},
      isLoader: true,
    });
    this.componentDidMount();
  };

  render() {
    let data = this.state.data;
    const Usercolumns = [
      {
        name: "Activity",
        selector: "title",
        sortable: true,
      },
      {
        name: "Activity Type",
        selector: "activitytype.name",
        sortable: true,
      },
      {
        name: "Date",
        selector: "start_datetime",
        format: (row) =>
          `${
            row.start_datetime != null
              ? new Date(row.start_datetime).toLocaleString()
              : ""
          }`,
        sortable: true,
        cell: (row) =>
          row.start_datetime
            ? Moment(row.start_datetime).format("DD MMM YYYY")
            : null,
      },
    ];

    let selectors = [];
    for (let keys in Usercolumns) {
      selectors.push(Usercolumns[keys]["selector"]);
    }
    const { classes } = this.props;
    let columnsvalue = selectors[0];
    let ActivityTypeFilter = this.state.getActivitytype;
    let filterActivitytype = this.state.filterActivitytype;
    let filters = this.state.values;
    return (
      <Layout>
        <Grid>
          <div className="App">
            <div className={style.headerWrap}>
              <h1 className={style.title}>Manage Activities</h1>
              <div className={classes.buttonRow}>
                <Button
                  variant="contained"
                  component={Link}
                  to="/activities/add"
                >
                  Add Activity
                </Button>
              </div>
            </div>
            {this.props.location.addData ? (
              <Snackbar severity="success">
                Activity added successfully.
              </Snackbar>
            ) : this.props.location.editData ? (
              <Snackbar severity="success">
                Activity edited successfully.
              </Snackbar>
            ) : null}
            {this.state.singleDelete !== false &&
            this.state.singleDelete !== "" &&
            this.state.singleDelete ? (
              <Snackbar severity="success" Showbutton={false}>
                Activity {this.state.singleDelete} deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.singleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === true ? (
              <Snackbar severity="success" Showbutton={false}>
                Activities deleted successfully!
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
                    <Input
                      fullWidth
                      label="Activity"
                      name="FilterActivity"
                      variant="outlined"
                      onChange={(event, value) => {
                        this.handleActivityChange(event, value);
                      }}
                      value={this.state.FilterActivity || ""}
                    />
                  </Grid>
                </div>
              </div>
              <div className={classes.searchInput}>
                <div className={style.Districts}>
                  <Grid item md={12} xs={12}>
                    <Autocomplete
                      id="combo-box-demo"
                      options={ActivityTypeFilter}
                      getOptionLabel={(option) => option.name}
                      onChange={(event, value) => {
                        this.handleActivitytype(event, value);
                      }}
                      value={
                        filterActivitytype
                          ? this.state.isCancel === true
                            ? null
                            : ActivityTypeFilter[
                                ActivityTypeFilter.findIndex(function (
                                  item,
                                  i
                                ) {
                                  return item.id === filterActivitytype;
                                })
                              ] || null
                          : null
                      }
                      renderInput={(params) => (
                        <Input
                          {...params}
                          fullWidth
                          label="Activity Type"
                          name="addState"
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
                title={"Activities"}
                showSearch={false}
                filters={filters}
                data={data}
                column={Usercolumns}
                editData={this.editData}
                DeleteData={this.DeleteData}
                DeleteAll={this.DeleteAll}
                rowsSelected={this.rowsSelect}
                columnsvalue={columnsvalue}
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
                selectableRows
                progressComponent={this.state.isLoader}
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
export default withStyles(useStyles)(Activity);
