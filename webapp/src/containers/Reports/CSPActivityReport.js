import React from "react";
import auth from "../../components/Auth/Auth";
import { withStyles } from "@material-ui/core/styles";
import * as serviceProvider from "../../api/Axios";
import Layout from "../../hoc/Layout/Layout";
import { Grid } from "@material-ui/core";
import Input from "../../components/UI/Input/Input";
import Datepicker from "../../components/UI/Datepicker/Datepicker.js";
import Button from "../../components/UI/Button/Button";
import Autocomplete from "../../components/Autocomplete/Autocomplete";
import { CSP_ACTIVITY_REPORT_BREADCRUMBS } from "./config";
import Moment from "moment";
import Table from "../../components/Datatable/Datatable.js";
import { CSVLink, CSVDownload } from "react-csv";
import * as formUtilities from "../../utilities/FormUtilities";

const useStyles = (theme) => ({
  row: {
    height: "42px",
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(1),
  },
  searchInput: {
    marginRight: theme.spacing(1),
  },
  Districts: {
    marginRight: theme.spacing(1),
    width: "230px",
  },
  csvData: {
    color: "white",
    textDecoration: "none",
  },
});
const SORT_FIELD_KEY = "_sort";
export class CSPSummaryReport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      filterStartDate: "",
      filterEndDate: "",
      filterCspName: "",
      isCancel: false,
      cspList: [],
      activitiesData: [],
      filename: [],
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
    await this.getCspActivities(10, 1);
  }

  getCspActivities = async (pageSize, page, params = null) => {
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
          [SORT_FIELD_KEY]: "start_datetime:desc",
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
        [SORT_FIELD_KEY]: "start_datetime:desc",
      };
    }

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/activities/get/?id=" + auth.getUserInfo().contact.id,
        params
      )
      .then((res) => {
        this.setState({
          activitiesData: res.data.result,
          cspList: res.data.cspList,
          isLoader: false,
          pageSize: res.data.pageSize,
          totalRows: res.data.rowCount,
          page: res.data.page,
          pageCount: res.data.pageCount,
        });
      })
  }

  /** Pagination to handle row change*/
  handlePerRowsChange = async (perPage, page) => {
    this.setState({ isLoader: true });
    if (formUtilities.checkEmpty(this.state.values)) {
      await this.getCspActivities(perPage, page);
    } else {
      await this.getCspActivities(perPage, page, this.state.values);
    }
  };

  /** Pagination to handle page change */
  handlePageChange = (page) => {
    this.setState({ isLoader: true });
    if (formUtilities.checkEmpty(this.state.values)) {
      this.getCspActivities(this.state.pageSize, page);
    } else {
      this.getCspActivities(this.state.pageSize, page, this.state.values);
    }
  };

  /** Sorting */
  handleSort = (
    column,
    sortDirection,
    perPage = this.state.pageSize,
    page = 1
  ) => {
    if (column.selector === "start_datetime") {
      column.selector = "start_datetime";
    }
    if (column.selector === "activitytype.name") {
      column.selector = "activitytype.name";
    }
    if (column.selector === "title") {
      column.selector = "title";
    }
    if (column.selector === "memberName") {
      column.selector = "memberName";
    }
    this.state.values[SORT_FIELD_KEY] = column.selector + ":" + sortDirection;
    this.getCspActivities(perPage, page, this.state.values);
  };

  handleStartDateChange(event, value) {
    if (event !== null) {
      this.setState({
        filterStartDate: event,
        isCancel: false,
        values: {
          ...this.state.values, ["start_datetime_gte"]: event.toISOString(),
        },
      });
    } else {
      delete this.state.values["start_datetime_gte"];
      this.setState({
        filterStartDate: "",
        ...this.state.values
      });
    }
  }

  handleEndDateChange(event, value) {
    if (event !== null) {
      this.setState({
        filterEndDate: event,
        isCancel: false,
        values: {
          ...this.state.values, ["start_datetime_lte"]: event.toISOString(),
        },
      });
    } else {
      delete this.state.values["start_datetime_lte"];
      this.setState({
        filterEndDate: "",
        ...this.state.values
      });
    }
  }

  handleCSPChange(event, value) {
    if (value !== null) {
      this.setState({
        filterCspName: value,
        isCancel: false,
        values: {
          ...this.state.values, ["activityassignees.contact"]: value.contact.id,
        },
      });
    } else {
      delete this.state.values["activityassignees.contact"];
      this.setState({
        filterCspName: "",
        ...this.state.values
      });
    }
  }

  handleSearch() {
    this.setState({ isLoader: true });
    this.getCspActivities(this.state.pageSize, this.state.page, this.state.values);
  }

  formatCSVFilename(csvActivityData) {
    let filename = "";
    if (this.state.filterCspName) {
      filename += "_of_" + this.state.filterCspName.username;
    }
    if (this.state.filterStartDate) {
      filename +=
        "_from_" + Moment(this.state.filterStartDate).format("DDMMMYYYY");
    }
    if (this.state.filterEndDate) {
      filename += "_to_" + Moment(this.state.filterEndDate).format("DDMMMYYYY");
    }
    filename = "csp_activitiy_report" + filename + ".csv";
    this.setState({ filename: filename });
  }

  cancelForm = () => {
    this.setState({
      filterCspName: "",
      filterStartDate: "",
      filterEndDate: "",
      isCancel: true,
      isLoader: true,
    });
    this.componentDidMount();
  };

  render() {
    const { classes } = this.props;
    let activitiesData = this.state.activitiesData;
    let date, activityType, description, memberName, filename;
    let csvActivityData = [];
    let splitTitle;

    activitiesData.map((activity) => {
      // Get Member name from activity only related to loans
      if (
        activity.activitytype.name == "Loan application collection" ||
        activity.activitytype.name == "Collection of principal amount" ||
        activity.activitytype.name == "Interest collection" ||
        activity.loan_application_task != null
      ) {
        splitTitle = ~activity.title.indexOf(":")
          ? activity.title.split(":")
          : "-";
        activity.memberName = splitTitle[0];
        activity.contact = {
          name: splitTitle[0]
        };
      } else {
        activity.memberName = "-";
        activity.contact = {
          name: "-"
        };
      }

      date = Moment(activity.start_datetime).format("DD MMM YYYY");
      activityType = activity.activitytype.name;
      description = activity.title;
      memberName = activity.memberName;
      csvActivityData.push({
        Date: date,
        "Activity Type": activityType,
        Description: description,
        "Member Name": memberName,
      });
    });
    if (csvActivityData.length <= 0) {
      csvActivityData = "There are no records to display";
    }

    let reportFilterName = "";
    let filterCsp = "All";
    if (this.state.filterCspName) {
      filterCsp = this.state.filterCspName.name;
    }
    let filterStDate = this.state.filterStartDate
      ? Moment(this.state.filterStartDate).format("DD MMM YYYY")
      : null;
    let filterEnDate = this.state.filterEndDate
      ? Moment(this.state.filterEndDate).format("DD MMM YYYY")
      : null;

    if (filterCsp === "All") {
      reportFilterName += "Report of " + filterCsp + " CSPs";
    } else {
      reportFilterName += "Report for CSP: " + filterCsp;
    }

    if (this.state.filterStartDate) {
      reportFilterName += " for the duration: " + filterStDate;
    }
    if (this.state.filterEndDate) {
      reportFilterName += " - " + filterEnDate;
    }

    const Usercolumns = [
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
        name: "Activity Type",
        selector: "activitytype.name",
        sortable: true,
      },

      {
        name: "Description",
        selector: "title",
        sortable: true,
      },
      {
        name: "Member Name",
        selector: "memberName",
        sortable: true,
        cell: (row) => (row.memberName ? row.memberName : "-"),
      },
    ];

    let selectors = [];
    for (let i in Usercolumns) {
      selectors.push(Usercolumns[i]["selector"]);
    }
    let columnsvalue = selectors[0];
    return (
      <Layout breadcrumbs={CSP_ACTIVITY_REPORT_BREADCRUMBS}>
        <Grid>
          <Grid>
            <div>
              <h3>CSP Activity Report</h3>
            </div>
            <div
              className={classes.row}
              style={{ flexWrap: "wrap", height: "auto" }}
            >
              <div className={classes.searchInput}>
                <div className={classes.Districts}>
                  <Grid item md={12} xs={12}>
                    <Autocomplete
                      id="combo-box-demo"
                      options={this.state.cspList}
                      getOptionLabel={(option) => option.name}
                      onChange={(event, value) => {
                        this.handleCSPChange(event, value);
                      }}
                      value={
                        this.state.filterCspName
                          ? this.state.isCancel === true
                            ? null
                            : this.state.filterCspName
                          : null
                      }
                      renderInput={(params) => (
                        <Input
                          {...params}
                          fullWidth
                          label="CSP"
                          name="cspName"
                          variant="outlined"
                        />
                      )}
                    />
                  </Grid>
                </div>
              </div>
              <div className={classes.searchInput}>
                <div className={classes.Districts}>
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
                <div className={classes.Districts}>
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
              <Button onClick={this.handleSearch.bind(this)}>Search</Button>
              &nbsp;&nbsp;&nbsp;
              <Button color="secondary" clicked={this.cancelForm}>
                reset
              </Button>
            </div>
            <h5>{reportFilterName}</h5>
            <div className={classes.emiDue}>
              {activitiesData ? (
                <Table
                  title={"CSP Report"}
                  data={activitiesData}
                  showSearch={false}
                  filterData={false}
                  filterBy={[
                    "start_datetime",
                    "activitytype.name",
                    "title",
                    "memberName",
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
              ) : (
                  <h1>Loading...</h1>
                )}
            </div>
            <br />
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
          </Grid>
        </Grid>
      </Layout>
    );
  }
}
export default withStyles(useStyles)(CSPSummaryReport);
