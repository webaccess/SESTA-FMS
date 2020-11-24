import React from "react";
import auth from "../../components/Auth/Auth";
import { withStyles } from "@material-ui/core/styles";
import * as serviceProvider from "../../api/Axios";
import Layout from "../../hoc/Layout/Layout";
import {
  Grid,
  Card,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Divider,
} from "@material-ui/core";
import Input from "../../components/UI/Input/Input";
import Button from "../../components/UI/Button/Button";
import Autocomplete from "../../components/Autocomplete/Autocomplete";
import { CSP_SUMMARY_REPORT_BREADCRUMBS } from "./config";
import Datepicker from "../../components/UI/Datepicker/Datepicker.js";
import { CSVLink } from "react-csv";
import Moment from "moment";

const useStyles = (theme) => ({
  root: {},
  row: {
    height: "42px",
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(1),
  },
  searchInput: {
    marginRight: theme.spacing(1),
    marginBottom: "8px",
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
      completedActivities: [],
      activityTypesWithCount: [],
      sanctionedLoans: [],
      loanDefaulters: [],
      principalCollected: "",
      interestCollected: "",
      userContacts: [],
    };
  }

  async componentDidMount() {
    /** get all CSPs */
    let userContacts = [];
    let url =
      "users/?contact.creator_id=" +
      auth.getUserInfo().contact.id +
      "&&role.name=CSP (Community Service Provider)&&_sort=username:ASC";
    serviceProvider
      .serviceProviderForGetRequest(process.env.REACT_APP_SERVER_URL + url)
      .then((res) => {
        res.data.map((user) => {
          userContacts.push(user.contact);
        });
        this.setState({ cspList: res.data, userContacts: userContacts });
      })
      .catch((error) => {
        console.log(error);
      });

    this.getCompletedActivities();
    this.getSanctionedLoans();
    this.getEMICollection();
  }

  getCompletedActivities = () => {
    let activityUrl = "crm-plugin/activities/?_sort=start_datetime:desc";
    if (this.state.filterCspName || this.state.filterCspName !== "") {
      activityUrl +=
        "&&activityassignees.contact.id=" + this.state.filterCspName.id;
    }
    if (this.state.filterStartDate) {
      activityUrl +=
        "&&start_datetime_gte=" + this.state.filterStartDate.toISOString();
    }
    if (this.state.filterEndDate) {
      activityUrl +=
        "&&start_datetime_lte=" + this.state.filterEndDate.toISOString();
    }
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + activityUrl
      )
      .then((res) => {
        this.setState({ completedActivities: res.data });
        this.getActivityTypeWithCount(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  getActivityTypeWithCount = (activitiesData) => {
    let activtiesArr = [];
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/activitytypes"
      )
      .then((typeRes) => {
        let activityTypeRes = typeRes.data;
        activityTypeRes.map((type) => {
          let activityTypeName,
            activityTypeCount = 0;
          activitiesData.map((activity) => {
            if (activity.activitytype.name == type.name) {
              activityTypeName = activity.activitytype.name;
              activityTypeCount = activityTypeCount + 1;
            }
          });
          if (activityTypeName) {
            activtiesArr.push({
              Name: activityTypeName,
              Count: activityTypeCount,
            });
          }
        });
        this.setState({ activityTypesWithCount: activtiesArr });
      });
  };

  getSanctionedLoans = () => {
    let loanUrl = "loan-applications/?status=Approved&status=InProgress";
    if (this.state.filterCspName || this.state.filterCspName !== "") {
      loanUrl += "&&creator_id.id=" + this.state.filterCspName.id;
    }
    if (this.state.filterStartDate) {
      loanUrl +=
        "&&approved_date_gte=" + this.state.filterStartDate.toISOString();
    }
    if (this.state.filterEndDate) {
      loanUrl +=
        "&&approved_date_lte=" + this.state.filterEndDate.toISOString();
    }
    serviceProvider
      .serviceProviderForGetRequest(process.env.REACT_APP_SERVER_URL + loanUrl)
      .then((loanRes) => {
        this.setState({ sanctionedLoans: loanRes.data });
      })
      .catch((error) => {});
  };

  getEMICollection = () => {
    let emiUrl = "loan-application-installments/?_sort=id:asc";
    if (this.state.filterCspName || this.state.filterCspName !== "") {
      emiUrl += "&&loan_application.creator_id=" + this.state.filterCspName.id;
    }
    if (this.state.filterStartDate) {
      emiUrl +=
        "&&actual_payment_date_gte=" + this.state.filterStartDate.toISOString();
    }
    if (this.state.filterEndDate) {
      emiUrl +=
        "&&actual_payment_date_lte=" + this.state.filterEndDate.toISOString();
    }
    serviceProvider
      .serviceProviderForGetRequest(process.env.REACT_APP_SERVER_URL + emiUrl)
      .then((emiRes) => {
        let loanDefaulters = [];
        let actualPrincipalPaid = 0;
        let actualInterestPaid = 0;
        emiRes.data.map((emi, index) => {
          if (emi.actual_principal) {
            actualPrincipalPaid += emi.actual_principal;
          }
          if (emi.actual_interest) {
            actualInterestPaid += emi.actual_interest;
          }

          /** No of loan defaulters */
          if (
            emi.actual_payment_date !== null &&
            new Date(emi.payment_date) < new Date(emi.actual_payment_date)
          ) {
            serviceProvider
              .serviceProviderForGetRequest(
                process.env.REACT_APP_SERVER_URL +
                  "loan-applications?id=" +
                  emi.loan_application.id
              )
              .then((response) => {
                response.data.map((e, i) => {
                  loanDefaulters.push(e.id);
                });
                this.setState({ loanDefaulters: [...new Set(loanDefaulters)] });
              })
              .catch((error) => {});
          }
        });

        this.setState({
          principalCollected: actualPrincipalPaid,
          interestCollected: actualInterestPaid,
        });
      })
      .catch((error) => {});
  };

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
    this.getCompletedActivities();
    this.getSanctionedLoans();
    this.getEMICollection();
  }

  cancelForm = () => {
    this.setState(
      {
        filterStartDate: "",
        filterEndDate: "",
        filterCspName: "",
        isCancel: true,
      },
      function () {
        this.componentDidMount();
      }
    );
  };

  render() {
    const { classes } = this.props;
    const columns = [
      {
        id: "Name",
        displayName: "Name",
      },
      {
        id: "Count",
        displayName: "Count",
      },
    ];
    const datas = [
      {
        Name: "Amount of principal collected",
        Count: "₹" + this.state.principalCollected,
      },
      {
        Name: "Amount of interest collected",
        Count: "₹" + this.state.interestCollected,
      },
      {
        Name: "No of livelihood activities",
        Count: this.state.completedActivities.length,
      },
      {
        Name: "No of loans sanctioned",
        Count: this.state.sanctionedLoans.length,
      },
      {
        Name: "No of loan defaulters",
        Count: this.state.loanDefaulters.length,
      },
      {
        Name: "",
        Count: "",
      },
      {
        Name: "Types of activities",
        Count: "",
      },
    ];

    /** csv file name & report header name */
    let fileName = "";
    let reportFilterName = "";
    let filterCsp = "All";
    if (this.state.filterCspName) {
      fileName += "_for_" + this.state.filterCspName.name.split(" ").join("_");
      filterCsp = this.state.filterCspName.name;
    }

    if (filterCsp === "All") {
      reportFilterName += "Report of " + filterCsp + " CSPs";
    } else {
      reportFilterName += "Report for CSP: " + filterCsp;
    }

    if (this.state.filterStartDate) {
      let filterStDate = this.state.filterStartDate
        ? Moment(this.state.filterStartDate).format("DD MMM YYYY")
        : null;
      fileName +=
        "_from_" + Moment(this.state.filterStartDate).format("DDMMMYYYY");
      reportFilterName += " for the duration: " + filterStDate;
    }

    if (this.state.filterEndDate) {
      let filterEnDate = this.state.filterEndDate
        ? Moment(this.state.filterEndDate).format("DD MMM YYYY")
        : null;
      fileName += "_to_" + Moment(this.state.filterEndDate).format("DDMMMYYYY");
      reportFilterName += " - " + filterEnDate;
    }
    fileName = "csp_summary_report" + fileName + ".csv";

    if (this.state.activityTypesWithCount.length <= 0) {
      datas.push({
        Name: "No records found",
        Count: "",
      });
    }
    /** display list of activity types with their count */
    var elements = [];
    this.state.activityTypesWithCount.map((key, value) => {
      datas.push(key);
      elements.push(
        <ListItem>
          <ListItemText primary={key.Name} />
          <ListItemSecondaryAction style={{ paddingRight: "100px" }}>
            {key.Count}
          </ListItemSecondaryAction>
        </ListItem>
      );
    });

    return (
      <Layout breadcrumbs={CSP_SUMMARY_REPORT_BREADCRUMBS}>
        <Grid>
          <Grid>
            <div className="App">
              <h3>CSP Summary Report</h3>
              <div
                className={classes.row}
                style={{ flexWrap: "wrap", height: "auto" }}
              >
                <div className={classes.searchInput}>
                  <div className={classes.Districts}>
                    <Grid item md={12} xs={12}>
                      <Autocomplete
                        id="combo-box-demo"
                        options={this.state.userContacts}
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
                <div className={classes.searchInput}>
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
                <Button
                  style={{ marginRight: "5px", marginBottom: "8px" }}
                  onClick={this.handleSearch.bind(this)}
                >
                  Search
                </Button>
                &nbsp;&nbsp;&nbsp;
                <Button
                  style={{ marginBottom: "8px" }}
                  color="secondary"
                  clicked={this.cancelForm}
                >
                  reset
                </Button>
              </div>

              <h5>{reportFilterName}</h5>

              <Card style={{ maxHeight: "max-content" }}>
                <List>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography style={{ fontWeight: "500" }}>
                          No of livelihood activites
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction style={{ paddingRight: "100px" }}>
                      {this.state.completedActivities.length}
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                <Divider />

                <div style={{ paddingTop: "15px" }}>
                  <Typography
                    style={{
                      paddingLeft: "15px",
                      fontWeight: "500",
                    }}
                  >
                    Type of activities
                  </Typography>
                  <div style={{ paddingLeft: "15px" }}>
                    {elements.length > 0 ? (
                      <List>{elements}</List>
                    ) : (
                      <h5 style={{ paddingTop: "15px", paddingLeft: "13px" }}>
                        No records found
                      </h5>
                    )}
                  </div>
                </div>
                <Divider />

                <List>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography style={{ fontWeight: "500" }}>
                          No of loans sanctioned
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction style={{ paddingRight: "100px" }}>
                      {this.state.sanctionedLoans.length}
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                <Divider />

                <List>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography style={{ fontWeight: "500" }}>
                          No of loan defaulters
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction style={{ paddingRight: "100px" }}>
                      {this.state.loanDefaulters.length}
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                <Divider />

                <List>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography style={{ fontWeight: "500" }}>
                          Amount of principal collected
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction style={{ paddingRight: "100px" }}>
                      ₹{this.state.principalCollected.toLocaleString()}
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                <Divider />

                <List>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography style={{ fontWeight: "500" }}>
                          Amount of interest collected
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction style={{ paddingRight: "100px" }}>
                      ₹{this.state.interestCollected.toLocaleString()}
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                <Divider />
              </Card>

              <div style={{ paddingTop: "15px" }}>
                <Button>
                  <CSVLink
                    data={datas}
                    filename={fileName}
                    className={classes.csvData}
                  >
                    Download
                  </CSVLink>
                </Button>
              </div>
            </div>
          </Grid>
        </Grid>
      </Layout>
    );
  }
}
export default withStyles(useStyles)(CSPSummaryReport);
