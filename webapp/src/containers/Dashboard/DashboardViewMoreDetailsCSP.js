import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import auth from "../../components/Auth/Auth";
import { withStyles } from "@material-ui/core/styles";
import * as serviceProvider from "../../api/Axios";
import Table from "../../components/Datatable/Datatable.js";
import { Grid, Card } from "@material-ui/core";
import Moment from "moment";
import Input from "../../components/UI/Input/Input";
import Autocomplete from "../../components/Autocomplete/Autocomplete";
import Datepicker from "../../components/UI/Datepicker/Datepicker.js";
import Button from "../../components/UI/Button/Button";
import { Link } from "react-router-dom";
import { CSVLink, CSVDownload } from "react-csv";
import style from "./Dashboard.module.css";
import * as formUtilities from "../../utilities/FormUtilities";

const useStyles = (theme) => ({
  root: {},
  row: {
    height: "42px",
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(1),
  },
  pie: {
    width: "50px",
    height: "50px",
  },
  searchInput: {
    marginRight: theme.spacing(1),
    marginBottom: "8px",
  },
  Districts: {
    width: "230px",
  },
  csvData: {
    color: "white",
    textDecoration: "none",
  },
  buttonRow: {
    height: "42px",
    marginTop: theme.spacing(1),
  },
});
const SORT_FIELD_KEY = "_sort";

class DashboardViewMoreDetailsCSP extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      loanData: [],
      activitiesData: [],
      loanInstallmentData: [],
      loanModelData: [],
      activitytypeData: [],
      filterLoaneeName: "",
      filterPurpose: "",
      filterActType: "",
      filterStartDate: "",
      filterEndDate: "",
      remunTotal: "",
      isCancel: false,
      filename: [],
      csvActivityData: [],
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
    await this.getLoanModels(10, 1);
    await this.getActivityModels(10, 1);

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "loan-models"
      )
      .then((loanModelRes) => {
        this.setState({ loanModelData: loanModelRes.data });
      });

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/activitytypes"
      )
      .then((typeRes) => {
        this.setState({ activitytypeData: typeRes.data });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  getLoanModels = async (pageSize, page, params = null) => {
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
          [SORT_FIELD_KEY]: "payment_date:ASC",
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
        [SORT_FIELD_KEY]: "payment_date:ASC",
      };
    }

    await serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "loan-application-installments/emidue/details/?loan_application.creator_id=" + auth.getUserInfo().contact.id,
        params
      )
      .then((res) => {
        this.setState({
          loanInstallmentData: res.data.result,
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
  getActivityModels = async (pageSize, page, params = null) => {
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
          [SORT_FIELD_KEY]: "start_datetime:ASC",
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
        [SORT_FIELD_KEY]: "start_datetime:ASC",
      };
    }

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/activities/recent/activities",
        params
      )
      .then((activityRes) => {
        this.getCspActivties(activityRes);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  /** Pagination to handle row change*/
  handlePerRowsChange = async (perPage, page) => {
    if (formUtilities.checkEmpty(this.state.values)) {
      await this.getLoanModels(perPage, page);
    } else {
      await this.getLoanModels(perPage, page, this.state.values);
    }
  };

  /** Pagination to handle page change */
  handlePageChange = (page) => {
    if (formUtilities.checkEmpty(this.state.values)) {
      this.getLoanModels(this.state.pageSize, page);
    } else {
      this.getLoanModels(this.state.pageSize, page, this.state.values);
    }
  };

  /** Sorting */
  handleSort = (
    column,
    sortDirection,
    perPage = this.state.pageSize,
    page = 1
  ) => {
    if (column.selector === "loan_application.memName") {
      column.selector = "loan_application.memName";
    }
    if (column.selector === "loan_application.purpose") {
      column.selector = "loan_application.purpose";
    }
    if (column.selector === "pendingAmount") {
      column.selector = "pendingAmount";
    }
    if (column.selector === "payment_date") {
      column.selector = "payment_date";
    }
    if (column.selector === "emi") {
      column.selector = "emi";
    }
    this.state.values[SORT_FIELD_KEY] = column.selector + ":" + sortDirection;
    this.getLoanModels(perPage, page, this.state.values);
  };

  /** Pagination to handle row change*/
  handlePerRowsChangeAct = async (perPage, page) => {
    if (formUtilities.checkEmpty(this.state.values)) {
      await this.getActivityModels(perPage, page);
    } else {
      await this.getActivityModels(perPage, page, this.state.values);
    }
  };

  /** Pagination to handle page change */
  handlePageChangeAct = (page) => {
    if (formUtilities.checkEmpty(this.state.values)) {
      this.getActivityModels(this.state.pageSize, page);
    } else {
      this.getActivityModels(this.state.pageSize, page, this.state.values);
    }
  };
  /** Sorting */
  handleSortAct = (
    column,
    sortDirection,
    perPage = this.state.pageSize,
    page = 1
  ) => {
    if (column.selector === "title") {
      column.selector = "title";
    }
    if (column.selector === "start_datetime") {
      column.selector = "start_datetime";
    }
    if (column.selector === "activitytype.remuneration") {
      column.selector = "activitytype.remuneration";
    }
    this.state.values[SORT_FIELD_KEY] = column.selector + ":" + sortDirection;
    this.getActivityModels(perPage, page, this.state.values);
  };

  getCspActivties(activityRes) {
    let filteredArray = [];
    activityRes.data.result.map((e, i) => {
      e.activityassignees.map((item) => { });
      e.activityassignees
        .filter((item) => item.contact === auth.getUserInfo().contact.id)
        .map((filteredData) => {
          filteredArray.push(e);
        });

    });
    this.setState({
      activitiesData: filteredArray,
      csvActivityData: activityRes.data.csvActivityData,
      remunTotal: activityRes.data.viewMoreRemunTotal,
      isLoader: false,
      pageSize: activityRes.data.pageSize,
      totalRows: activityRes.data.rowCount,
      page: activityRes.data.page,
      pageCount: activityRes.data.pageCount,
    });
  }

  handleNameChange(event, value) {
    this.setState({
      filterLoaneeName: event.target.value,
      values: {
        ["loan_application.contact.name_contains"]: event.target.value,
      },
    });
  }

  handlePurposeChange(event, value) {
    if (value !== null) {
      this.setState({
        filterPurpose: value, isCancel: false,
        values: {
          ["loan_application.purpose"]: value.product_name,
        },
      });
    } else {
      this.setState({
        filterPurpose: "",
      });
    }
  }

  handleActivityTypeChange(event, value) {
    if (value !== null) {
      this.setState({
        filterActType: value, isCancel: false,
        values: {
          ["activitytype.name"]: value.name,
        },
      });
    } else {
      this.setState({
        filterActType: "",
      });
    }
  }

  handleStartDateChange(event, value) {
    if (event !== null) {
      if (this.props.location.state.loanEMIData) {
        this.setState({
          filterStartDate: event, isCancel: false,
          values: {
            ["payment_date_lte"]: event.toISOString(),
          },
        });
      }
      if (this.props.location.state.activitiesData) {
        this.setState({
          filterStartDate: event, isCancel: false,
          values: {
            ["start_datetime_lte"]: event.toISOString(),
          },
        });
      }
    } else {
      this.setState({
        filterStartDate: "",
      });
    }
  }

  handleEndDateChange(event, value) {
    if (event !== null) {
      if (this.props.location.state.loanEMIData) {
        this.setState({
          filterEndDate: event, isCancel: false,
          values: {
            ["payment_date_lte"]: event.toISOString(),
          },
        });
      }
      if (this.props.location.state.activitiesData) {
        this.setState({
          filterEndDate: event, isCancel: false,
          values: {
            ["start_datetime_lte"]: event.toISOString(),
          },
        });
      }
    } else {
      this.setState({
        filterEndDate: "",
      });
    }
  }

  handleActivitySearch() {
    this.setState({ isLoader: true });
    this.getActivityModels(this.state.pageSize, this.state.page, this.state.values);
  }

  handleLoanEMISearch() {
    this.setState({ isLoader: true });
    this.getLoanModels(this.state.pageSize, this.state.page, this.state.values);
  }

  cancelForm = () => {
    this.setState({
      filterLoaneeName: "",
      filterActType: "",
      filterStartDate: "",
      filterEndDate: "",
      isCancel: true,
      isLoader: true,
    });
    this.componentDidMount();
  };

  formatCSVFilename() {
    let filename = "";
    if (this.state.filterActType) {
      filename += "_of_" + this.state.filterActType.name;
    }
    if (this.state.filterStartDate) {
      filename +=
        "_from_" + Moment(this.state.filterStartDate).format("DDMMMYYYY");
    }
    if (this.state.filterEndDate) {
      filename += "_to_" + Moment(this.state.filterEndDate).format("DDMMMYYYY");
    }
    filename = "csp_activities" + filename + ".csv";
    this.setState({ filename: filename });
  }

  render() {
    const { classes } = this.props;
    let activitytypeData = this.state.activitytypeData;

    let dbLoanData, dbActivitiesData;
    if (this.props.location.state.loanEMIData) {
      dbLoanData = this.props.location.state.loanEMIData;
    }
    if (this.props.location.state.activitiesData) {
      dbActivitiesData = this.props.location.state.activitiesData;
    }

    const userInfo = auth.getUserInfo();
    let loanModelData = this.state.loanModelData;
    let loanInstallmentData = this.state.loanInstallmentData;
    let activitiesData = this.state.activitiesData;
    let csvActivityData = this.state.csvActivityData;
    let remunTotal = this.state.remunTotal;
    const Usercolumns = [
      {
        name: "Name",
        selector: "loan_application.memName",
        sortable: true,
      },
      {
        name: "Purpose",
        selector: "loan_application.purpose",
        sortable: true,
      },
      {
        name: "Pending Loan amount",
        selector: "pendingAmount",
        sortable: true,
        cell: (row) =>
          row.pendingAmount ? "₹" + row.pendingAmount.toLocaleString() : null,
      },
      {
        name: "Due date",
        selector: "payment_date",
        sortable: true,
        cell: (row) =>
          row.payment_date
            ? Moment(row.payment_date).format("DD MMM YYYY")
            : null,
      },
      {
        name: "EMI Amount",
        selector: "emi",
        sortable: true,
        cell: (row) => (row.emi ? "₹" + row.emi.toLocaleString() : null),
      },
    ];
    let selectors = [];
    for (let i in Usercolumns) {
      selectors.push(Usercolumns[i]["selector"]);
    }
    let columnsvalue = selectors[0];

    const Usercolumns1 = [
      {
        name: "Activity Name",
        selector: "title",
        sortable: true,
      },
      {
        name: "Date",
        selector: "start_datetime",
        sortable: true,
        cell: (row) =>
          row.start_datetime
            ? Moment(row.start_datetime).format("DD MMM YYYY")
            : null,
      },
      {
        name: "Remuneration",
        selector: "activitytype.remuneration",
        sortable: true,
        cell: (row) => "₹" + row.activitytype.remuneration.toLocaleString(),
      },
    ];

    let selectors1 = [];
    for (let i in Usercolumns1) {
      selectors1.push(Usercolumns1[i]["selector"]);
    }
    let columnsvalue1 = selectors1[0];

    return (
      <Layout>
        <Grid>
          <Grid>
            <div className={style.headerWrap}>
              {dbLoanData ? <h2 className={style.title}>EMI Due</h2> : null}
              {dbActivitiesData ? (
                <h2 className={style.title}>Recent Activities</h2>
              ) : null}
              <div className={classes.buttonRow}>
                <Button color="primary" component={Link} to="/">
                  Back
                </Button>
              </div>
            </div>
            {dbLoanData ? (
              <div
                className={classes.row}
                style={{ flexWrap: "wrap", height: "auto" }}
              >
                <div className={classes.searchInput}>
                  <div className={classes.Districts}>
                    <Grid item md={12} xs={12}>
                      <Input
                        fullWidth
                        label="Name"
                        name="name"
                        variant="outlined"
                        onChange={(event, value) => {
                          this.handleNameChange(event, value);
                        }}
                        value={this.state.filterLoaneeName || ""}
                      />
                    </Grid>
                  </div>
                </div>
                <div className={classes.searchInput}>
                  <div className={classes.Districts}>
                    <Grid item md={12} xs={12}>
                      <Autocomplete
                        id="combo-box-demo"
                        options={loanModelData}
                        getOptionLabel={(option) => option.product_name}
                        onChange={(event, value) => {
                          this.handlePurposeChange(event, value);
                        }}
                        value={
                          this.state.filterPurpose
                            ? this.state.isCancel === true
                              ? null
                              : this.state.filterPurpose
                            : null
                        }
                        renderInput={(params) => (
                          <Input
                            {...params}
                            fullWidth
                            label="Purpose"
                            name="purpose"
                            variant="outlined"
                          />
                        )}
                      />
                    </Grid>
                  </div>
                </div>
                <div className={classes.searchInput}>
                  <div>
                    <Grid item md={12} xs={12}>
                      <Datepicker
                        label="Start Date"
                        name="startDate"
                        value={this.state.filterStartDate || ""}
                        format={"dd MMM yyyy"}
                        onChange={(event, value) =>
                          this.handleStartDateChange(event, value)
                        }
                      />
                    </Grid>
                  </div>
                </div>
                <div className={classes.searchInput}>
                  <div>
                    <Grid item md={12} xs={12}>
                      <Datepicker
                        label="End Date"
                        name="endDate"
                        value={this.state.filterEndDate || ""}
                        format={"dd MMM yyyy"}
                        onChange={(event, value) =>
                          this.handleEndDateChange(event, value)
                        }
                      />
                    </Grid>
                  </div>
                </div>
                <Button
                  style={{ marginRight: "5px", marginBottom: "8px" }}
                  onClick={this.handleLoanEMISearch.bind(this)}
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
            ) : null}

            {dbLoanData ? (
              <Table
                title={"EMI Due"}
                data={loanInstallmentData}
                showSearch={false}
                filterData={false}
                filterBy={[
                  "loan_application.memName",
                  "loan_application.purpose",
                  "pendingAmount",
                  "payment_date",
                  "emi",
                ]}
                column={Usercolumns}
                editData={this.editData}
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
                progressComponent={this.state.isLoader}
              />
            ) : null}
          </Grid>
          <Grid>
            {dbActivitiesData ? (
              <div className={classes.row}>
                <div className={classes.searchInput}>
                  <div className={classes.Districts}>
                    <Grid item md={12} xs={12}>
                      <Autocomplete
                        id="combo-box-demo"
                        options={activitytypeData}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, value) => {
                          this.handleActivityTypeChange(event, value);
                        }}
                        value={
                          this.state.filterActType
                            ? this.state.isCancel === true
                              ? null
                              : this.state.filterActType
                            : null
                        }
                        renderInput={(params) => (
                          <Input
                            {...params}
                            fullWidth
                            label="Activity Type"
                            name="activityType"
                            variant="outlined"
                          />
                        )}
                      />
                    </Grid>
                  </div>
                </div>
                <div className={classes.searchInput}>
                  <div>
                    <Grid item md={12} xs={12}>
                      <Datepicker
                        label="Start Date"
                        name="startDate"
                        value={this.state.filterStartDate || ""}
                        format={"dd MMM yyyy"}
                        onChange={(event, value) =>
                          this.handleStartDateChange(event, value)
                        }
                      />
                    </Grid>
                  </div>
                </div>
                <div className={classes.searchInput}>
                  <div>
                    <Grid item md={12} xs={12}>
                      <Datepicker
                        label="End Date"
                        name="endDate"
                        value={this.state.filterEndDate || ""}
                        format={"dd MMM yyyy"}
                        onChange={(event, value) =>
                          this.handleEndDateChange(event, value)
                        }
                      />
                    </Grid>
                  </div>
                </div>
                <Button
                  style={{ marginRight: "5px", marginBottom: "8px" }}
                  onClick={this.handleActivitySearch.bind(this)}
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
            ) : null}
            {dbActivitiesData ? (
              <h5>TOTAL REMUNERATION : {remunTotal}</h5>
            ) : null}
            {dbActivitiesData ? (
              <Table
                title={"Recent Activities"}
                data={activitiesData}
                showSearch={false}
                filterData={false}
                filterBy={[
                  "title",
                  "start_datetime",
                  "activitytype.remuneration",
                ]}
                column={Usercolumns1}
                editData={this.editData}
                rowsSelected={this.rowsSelect}
                columnsvalue={columnsvalue1}
                pagination
                paginationServer
                paginationDefaultPage={this.state.page}
                paginationPerPage={this.state.pageSize}
                paginationTotalRows={this.state.totalRows}
                paginationRowsPerPageOptions={[10, 15, 20, 25, 30]}
                paginationResetDefaultPage={this.state.resetPagination}
                onChangeRowsPerPage={this.handlePerRowsChangeAct}
                onChangePage={this.handlePageChangeAct}
                onSort={this.handleSortAct}
                sortServer={true}
                progressComponent={this.state.isLoader}
              />
            ) : null}
          </Grid>
          <br />
          {dbActivitiesData ? (
            <Button>
              <CSVLink
                data={csvActivityData}
                onClick={() => {
                  this.formatCSVFilename(csvActivityData);
                }}
                filename={this.state.filename}
                className={classes.csvData}
              >
                Download
              </CSVLink>
            </Button>
          ) : null}
        </Grid>
      </Layout>
    );
  }
}

export default withStyles(useStyles)(DashboardViewMoreDetailsCSP);
