import React from "react";
import auth from "../../components/Auth/Auth";
import { withStyles } from "@material-ui/core/styles";
import * as serviceProvider from "../../api/Axios";
import Layout from "../../hoc/Layout/Layout";
import { Grid } from "@material-ui/core";
import Input from "../../components/UI/Input/Input";
import DateTimepicker from "../../components/UI/DateTimepicker/DateTimepicker.js";
import Button from "../../components/UI/Button/Button";
import Autocomplete from "../../components/Autocomplete/Autocomplete";
import { CSP_ACTIVITY_REPORT_BREADCRUMBS } from "./config";
import Moment from "moment";
import Table from "../../components/Datatable/Datatable.js";
import { CSVLink, CSVDownload } from "react-csv";

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

export class CSPSummaryReport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterStartDate: "",
      filterEndDate: "",
      filterCspName: "",
      isCancel: false,
      cspList: [],
      activitiesData: [],
      filename: [],
    };
  }

  async componentDidMount() {
    /** get all CSPs */
    let url =
      "users/?contact.creator_id=" +
      auth.getUserInfo().contact.id +
      "&&role.name=CSP (Community Service Provider)&&_sort=username:ASC";
    serviceProvider
      .serviceProviderForGetRequest(process.env.REACT_APP_SERVER_URL + url)
      .then((res) => {
        let cspContact = [];
        res.data.map((e) => {
          e.name = e.contact.name;
          this.setState({ cspList: res.data });
        });
      })
      .catch((error) => {
        console.log(error);
      });

    let activityArr = [];
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
        "crm-plugin/activities/?_sort=start_datetime:desc"
      )
      .then((activityRes) => {
        activityRes.data.map((activity) => {
          if (
            activity.contacts[0].creator_id.id == auth.getUserInfo().contact.id
          ) {
            activityArr.push(activity);
          }
        });
        this.setState({ activitiesData: activityArr });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleStartDateChange(event, value) {
    if (event !== null) {
      this.setState({ filterStartDate: event, isCancel: false });
    } else {
      this.setState({
        filterStartDate: "",
      });
    }
  }

  handleEndDateChange(event, value) {
    if (event !== null) {
      this.setState({ filterEndDate: event, isCancel: false });
    } else {
      this.setState({
        filterEndDate: "",
      });
    }
  }

  handleCSPChange(event, value) {
    if (value !== null) {
      this.setState({ filterCspName: value, isCancel: false });
    } else {
      this.setState({
        filterCspName: "",
      });
    }
  }

  handleSearch() {
    let searchData = "";
    if (this.state.filterCspName) {
      searchData += searchData ? "&&" : "";
      searchData +=
        "activityassignees.contact=" + this.state.filterCspName.contact.id;
    }
    if (this.state.filterStartDate) {
      searchData += searchData ? "&&" : "";
      searchData +=
        "start_datetime_gte=" + this.state.filterStartDate.toISOString();
    }
    if (this.state.filterEndDate) {
      searchData += searchData ? "&&" : "";
      searchData +=
        "start_datetime_lte=" + this.state.filterEndDate.toISOString();
    }
    let activityArr = [];
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
        "crm-plugin/activities?" +
        searchData +
        "&&_sort=start_datetime:desc"
      )
      .then((activityRes) => {
        activityRes.data.map((activity) => {
          if (
            activity.contacts[0].creator_id.id == auth.getUserInfo().contact.id
          ) {
            activityArr.push(activity);
          }
        });
        this.setState({ activitiesData: activityArr });
      })
      .catch((error) => {
        console.log(error);
      });
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
    });
    this.componentDidMount();
  };

  render() {
    const { classes } = this.props;
    let activitiesData = this.state.activitiesData;
    let date, activityType, description, memberName, filename;
    let csvActivityData = [];
    let splitTitle;

    activitiesData.map(activity => {

      // Get Member name from activity only related to loans
      if (activity.activitytype.name == "Loan application collection" || activity.activitytype.name == "Collection of principal amount" || activity.activitytype.name == "Interest collection" || activity.loan_application_task != null) {
        splitTitle = ~activity.title.indexOf(":") ? activity.title.split(":") : "-";
        activity.memberName = splitTitle[0];
      } else {
        activity.memberName = "-";
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
            <div className={classes.row}>
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
                    <DateTimepicker
                      label="Start Date"
                      name="startDate"
                      value={this.state.filterStartDate || ""}
                      // format={"dd MMM yyyy"}
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
                    <DateTimepicker
                      label="End Date"
                      name="endDate"
                      value={this.state.filterEndDate || ""}
                      // format={"dd MMM yyyy"}
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
