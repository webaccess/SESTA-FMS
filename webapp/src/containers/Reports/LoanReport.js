import { LOAN_REPORT_BREADCRUMBS } from "./config";
import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import { withStyles } from "@material-ui/core/styles";
import * as serviceProvider from "../../api/Axios";
import Table from "../../components/Datatable/Datatable.js";
import { Grid } from "@material-ui/core";
import Moment from "moment";
import Datepicker from "../../components/UI/Datepicker/Datepicker.js";
import Button from "../../components/UI/Button/Button";
import { CSVLink } from "react-csv";
import * as formUtilities from "../../utilities/FormUtilities";
import auth from "../../components/Auth/Auth";
import * as constants from "../../constants/Constants";
import Input from "../../components/UI/Input/Input";
import Autocomplete from "../../components/Autocomplete/Autocomplete";

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

export class LoanReport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterStartDate: "",
      filterEndDate: "",
      isCancel: false,
      loanTableData: [],
      loanDistributed: "",
      repayment: "",
      interest: "",
      totalCapital: 0,
      isLoader: true,
      filename: [],
      values: {},
      AvailedLoanCount: constants.APPLYLOANCOUNT,
      noOfMemberAvailedLoanFilter: "",
      filterAvailedLoans: "",
    };
  }

  async componentDidMount() {
    await this.getLoanDetails();
  }

  getLoanDetails = async (params = null) => {
    if (params !== null && !formUtilities.checkEmpty(params)) {
      let defaultParams = {};
      Object.keys(params).map((key) => {
        defaultParams[key] = params[key];
      });
      params = defaultParams;
    } else {
      params = {};
    }
    // loan distributed amount, repayment amount and interest paid
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "loan-applications/loans-report",
        params
      )
      .then((res) => {
        this.setState(
          {
            loanTableData: [res.data[0].data],
            loanDistributed: res.data[1].loanDistributedAmount,
            repayment: res.data[2].repaymentAmount,
            interest: res.data[3].interestAmount,
            isLoader: false,
          },
          function () {
            this.getVelocityOfLenting();
            this.getMembersAvailedLoans();
          }
        );
      })
      .catch((error) => {});
  };

  getVelocityOfLenting = async () => {
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/individuals/" +
          auth.getUserInfo().contact.individual
      )
      .then((indRes) => {
        this.setState({ totalCapital: parseInt(indRes.data.fpo.totalcapital) });
      })
      .catch((error) => {});
  };

  getMembersAvailedLoans = () => {
    let loanUrl =
      "loan-applications/?status=Approved&status=InProgress&status=Completed";

    if (this.state.filterStartDate) {
      loanUrl +=
        "&application_date_gte=" + this.state.filterStartDate.toISOString();
    }
    if (this.state.filterEndDate) {
      loanUrl +=
        "&application_date_gte=" + this.state.filterEndDate.toISOString();
    }

    let memberAvailedLoan = [];
    serviceProvider
      .serviceProviderForGetRequest(process.env.REACT_APP_SERVER_URL + loanUrl)
      .then((loanRes) => {
        loanRes.data.map((i) => {
          memberAvailedLoan.push(i.contact.id);
        });
        var result = {};
        memberAvailedLoan.forEach(function (x) {
          result[x] = (result[x] || 0) + 1;
        });

        let exists = [];
        Object.entries(result).map((entry) => {
          let key = entry[0];
          let value = entry[1];
          exists.push(value);
        });
        var result1 = {};
        exists.forEach(function (x) {
          result1[x] = (result1[x] || 0) + 1;
        });
        if (this.state.filterAvailedLoans) {
          if (result1.hasOwnProperty(this.state.filterAvailedLoans.id)) {
            this.setState({
              noOfMemberAvailedLoanFilter:
                result1[this.state.filterAvailedLoans.id],
            });
          } else {
            this.setState({
              noOfMemberAvailedLoanFilter: 0,
            });
          }
        } else {
          this.setState({
            noOfMemberAvailedLoanFilter: [...new Set(memberAvailedLoan)].length,
          });
        }
      })
      .catch((error) => {});
  };

  handleStartDateChange(event, value) {
    if (event !== null) {
      this.setState({
        filterStartDate: event,
        isCancel: false,
        values: {
          ...this.state.values,
          ["application_date_gte"]: event.toISOString(),
        },
      });
    } else {
      delete this.state.values["application_date_gte"];
      this.setState({
        filterStartDate: "",
        ...this.state.values,
      });
    }
  }

  handleEndDateChange(event, value) {
    if (event !== null) {
      this.setState({
        filterEndDate: event,
        isCancel: false,
        values: {
          ...this.state.values,
          ["application_date_lte"]: event.toISOString(),
        },
      });
    } else {
      delete this.state.values["application_date_lte"];
      this.setState({
        filterEndDate: "",
        ...this.state.values,
      });
    }
  }

  handleLoanCountChange(event, value) {
    if (value !== null) {
      this.setState({ filterAvailedLoans: value, isCancel: false });
    } else {
      this.setState({
        filterAvailedLoans: "",
      });
    }
  }

  handleSearch() {
    this.setState({ isLoader: true });
    this.getLoanDetails(this.state.values);
  }

  formatCSVFilename(loanData) {
    let filename = "";
    if (this.state.filterStartDate) {
      filename +=
        "_from_" + Moment(this.state.filterStartDate).format("DDMMMYYYY");
    }
    if (this.state.filterEndDate) {
      filename += "_to_" + Moment(this.state.filterEndDate).format("DDMMMYYYY");
    }
    filename = "loan_report" + filename + ".csv";
    this.setState({ filename: filename });
  }

  cancelForm = () => {
    this.setState({
      filterStartDate: "",
      filterEndDate: "",
      filterAvailedLoans: "",
      isCancel: true,
      isLoader: true,
    });
    this.componentDidMount();
  };

  render() {
    const { classes } = this.props;
    const loanData = this.state.loanTableData;
    const loanColumns = [
      {
        name: "Total amount of Loan Distributed",
        selector: "loanDistributedAmount",
        cell: (row) => "₹" + row.loanDistributedAmount.toLocaleString(),
      },
      {
        name: "Repayment Amount",
        selector: "repaymentAmount",
        cell: (row) => "₹" + row.repaymentAmount.toLocaleString(),
      },
      {
        name: "Interest",
        selector: "interestAmount",
        cell: (row) => "₹" + row.interestAmount.toLocaleString(),
      },
      {
        name: "Velocity of lenting",
        selector: "velocityOfLenting",
        cell: (row) => row.loanDistributedAmount / this.state.totalCapital,
      },
      {
        name: "Loan Repayment Ratio",
        selector: "loanRepaymentRatio",
        cell: (row) => (row.repaymentAmount / 100).toLocaleString(),
      },
      {
        name: "No. of members availed loan",
        selector: "membersAvailedLoan",
        cell: (row) => this.state.noOfMemberAvailedLoanFilter,
      },
    ];

    let selectors = [];
    for (let i in loanColumns) {
      selectors.push(loanColumns[i]["selector"]);
    }
    let columnsvalue = selectors[0];

    // CSV columns
    const columns = [
      {
        id: "Total amount of Loan Distributed",
        displayName: "Total amount of Loan Distributed",
      },
      {
        id: "Repayment Amount",
        displayName: "Repayment Amount",
      },
      {
        id: "Interest",
        displayName: "Interest",
      },
      {
        id: "Velocity of lenting",
        displayName: "Velocity of lenting",
      },
      {
        id: "Loan Repayment Ratio",
        displayName: "Loan Repayment Ratio",
      },
      {
        id: "No. of members availed loan",
        displayName: "No. of members availed loan",
      },
    ];
    const datas = [
      {
        "Total amount of Loan Distributed": "₹" + this.state.loanDistributed,
        "Repayment Amount": "₹" + this.state.repayment,
        Interest: "₹" + this.state.interest,
        "Velocity of lenting":
          this.state.loanDistributed / this.state.totalCapital,
        "Loan Repayment Ratio": this.state.repayment / 100,
        "No. of members availed loan": this.state.noOfMemberAvailedLoanFilter,
      },
    ];

    return (
      <Layout breadcrumbs={LOAN_REPORT_BREADCRUMBS}>
        <Grid>
          <Grid>
            <div>
              <h3>Loan Report</h3>
            </div>
            <div
              className={classes.row}
              style={{ flexWrap: "wrap", height: "auto" }}
            >
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
              <div className={classes.searchInput}>
                <div className={classes.Districts}>
                  <Grid item md={12} xs={12}>
                    <Autocomplete
                      id="combo-box-demo"
                      options={this.state.AvailedLoanCount}
                      getOptionLabel={(option) => option.value}
                      onChange={(event, value) => {
                        this.handleLoanCountChange(event, value);
                      }}
                      value={
                        this.state.filterAvailedLoans
                          ? this.state.isCancel === true
                            ? null
                            : this.state.filterAvailedLoans
                          : null
                      }
                      renderInput={(params) => (
                        <Input
                          {...params}
                          fullWidth
                          label="Availed Loans"
                          name="availedLoans"
                          variant="outlined"
                        />
                      )}
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
            <div className={classes.emiDue}>
              {loanData ? (
                <Table
                  title={"Loan Report"}
                  data={loanData}
                  showSearch={false}
                  filterData={false}
                  filterBy={[
                    "loanDistributedAmount",
                    "repaymentAmount",
                    "interestAmount",
                  ]}
                  column={loanColumns}
                  rowsSelected={this.rowsSelect}
                  columnsvalue={columnsvalue}
                  progressComponent={this.state.isLoader}
                />
              ) : (
                <h5>No records found</h5>
              )}
            </div>
            <br />
            <Button>
              <CSVLink
                data={datas}
                onClick={() => {
                  this.formatCSVFilename(loanData);
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
export default withStyles(useStyles)(LoanReport);
