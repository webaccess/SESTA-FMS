import React, { Component } from "react";
import auth from "../../components/Auth/Auth";
import { withStyles } from "@material-ui/core/styles";
import Piechart from "../../components/UI/Piechart/Piechart";
import * as serviceProvider from "../../api/Axios";
import Table from "../../components/Datatable/Datatable.js";
import { Grid } from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import PersonIcon from "@material-ui/icons/Person";
import PeopleIcon from "@material-ui/icons/People";
import NaturePeopleIcon from "@material-ui/icons/NaturePeople";
import MoneyIcon from "@material-ui/icons/Money";
import Moment from "moment";
import { Link } from "react-router-dom";

const useStyles = (theme) => ({
  Icon: {
    fontSize: "40px",
    color: "#008000",
    "&:hover": {
      color: "#008000",
    },
    "&:active": {
      color: "#008000",
    },
  },
  oddBlock: {
    backgroundColor: "#000",
    padding: "15px",
    textAlign: "center",
    color: "white",
  },
  evenBlock: {
    backgroundColor: "#112e23",
    padding: "15px",
    textAlign: "center",
    color: "white",
  },
  labelValues: {
    color: "#028941",
    fontSize: "46px",
    fontWeight: "bold",
    marginBottom: "0px",
    marginTop: "0px",
    lineHeight: "1.5",
  },
  fieldValues: {
    color: "#028941",
    fontSize: "32px",
    fontWeight: "bold",
    lineHeight: "1.5",
  },
});

class DashboardForFPO extends Component {
  constructor(props) {
    super(props);
    this.state = {
      memberData: 0,
      shgData: 0,
      voData: 0,
      approvedLoans: 0,
      pendingLoans: 0,
      loanDistributedAmounts: [],
      totalLoanDistributed: 0,
      loansTableData: [],
      loansAllDetails: [],
      purposesValues: [],
      purposes: [],
    };
  }

  async componentDidMount() {
    /** get members */
    let newDataArray = [];
    let url =
      "crm-plugin/contact/?contact_type=individual&&_sort=name:ASC&&creator_id=" +
      auth.getUserInfo().contact.id;

    serviceProvider
      .serviceProviderForGetRequest(process.env.REACT_APP_SERVER_URL + url)
      .then((res) => {
        res.data.map((e, i) => {
          if (e.user === null) {
            newDataArray.push(e); // add only those contacts having contact type=individual & users===null
          }
        });
        this.setState({ memberData: newDataArray.length });
      })
      .catch((error) => {});

    /** get SHGs */
    let shgUrl =
      "crm-plugin/contact/?contact_type=organization&&organization.sub_type=SHG&&_sort=name:ASC&&creator_id=" +
      auth.getUserInfo().contact.id;

    serviceProvider
      .serviceProviderForGetRequest(process.env.REACT_APP_SERVER_URL + shgUrl)
      .then((res) => {
        this.setState({ shgData: res.data.length });
      })
      .catch((error) => {});

    /** get VOs */
    let voUrl =
      "crm-plugin/contact/?contact_type=organization&&organization.sub_type=VO&&_sort=name:ASC&&creator_id=" +
      auth.getUserInfo().contact.id;

    serviceProvider
      .serviceProviderForGetRequest(process.env.REACT_APP_SERVER_URL + voUrl)
      .then((res) => {
        this.setState({ voData: res.data.length });
      });

    let loanAppUrl = "loan-applications/";

    /** get pending loan applications */
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + loanAppUrl + "?status=UnderReview"
      )
      .then((res) => {
        this.setState({ pendingLoans: res.data.length });
      })
      .catch((error) => {});

    /** approved loans, loan distributed amount, loan table data */
    let loanDistributedAmounts = [];
    let loanDistributedVal = 0;
    let actualPrincipalPaid = 0;
    let actualInterestPaid = 0;
    let actualFinePaid = 0;
    let outstandingAmount = 0;
    let loansDetails = [];
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + loanAppUrl + "?status=Approved"
      )
      .then((res) => {
        res.data.map((e, i) => {
          let emiPaid = 0;

          /** loan amount distributed*/
          loanDistributedVal += e.loan_model.loan_amount;
          e.loan_app_installments.map((emi, index) => {
            if (emi.actual_principal) {
              actualPrincipalPaid += emi.actual_principal;
            }
            if (emi.actual_interest) {
              actualInterestPaid += emi.actual_interest;
            }
            if (emi.fine) {
              actualFinePaid += emi.fine;
            }
            let totalPaid = emi.actual_principal + emi.actual_interest;
            emiPaid += totalPaid;
          });
          /** Loans table */
          outstandingAmount = e.loan_model.loan_amount - emiPaid;
          loansDetails.push({
            memberName: e.contact.name,
            loanAmount: e.loan_model.loan_amount,
            outstandingAmount: outstandingAmount,
            loanDate: e.application_date,
          });
        });

        loanDistributedAmounts.push(
          loanDistributedVal,
          actualPrincipalPaid + actualInterestPaid + actualFinePaid
        );
        // sort loanDetails with latest date first
        loansDetails.sort(
          (a, b) =>
            new Date(...b.loanDate.split("/").reverse()) -
            new Date(...a.loanDate.split("/").reverse())
        );
        this.setState({
          approvedLoans: res.data.length,
          loanDistributedAmounts: loanDistributedAmounts,
          totalLoanDistributed:
            loanDistributedAmounts[0] + loanDistributedAmounts[1],
          loansTableData: loansDetails.slice(0, 5),
          loansAllDetails: loansDetails,
        });
      })
      .catch((error) => {});

    /** loans by purpose */
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + loanAppUrl
      )
      .then((res) => {
        let purposeList = [];
        let purposes = [];
        let purposesValues = [];
        res.data.map((loan, index) => {
          purposeList.push(loan.loan_model.product_name);
        });

        var map = purposeList.reduce(function (prev, cur) {
          prev[cur] = (prev[cur] || 0) + 1;
          return prev;
        }, {});
        Object.keys(map).map((key, i) => {
          purposes.push(key.toUpperCase());
          purposesValues.push(map[key]);
        });
        this.setState({ purposes: purposes, purposesValues: purposesValues });
      })
      .catch((error) => {});
  }

  render() {
    const { classes } = this.props;
    const userInfo = auth.getUserInfo();
    const loanData = this.state.loansTableData;
    const Usercolumns = [
      {
        name: "Member Name",
        selector: "memberName",
        sortable: true,
      },
      {
        name: "Loan Amount",
        selector: "loanAmount",
        sortable: true,
        cell: (row) =>
          row.loanAmount ? "₹" + row.loanAmount.toLocaleString() : null,
      },
      {
        name: "Outstanding Amount",
        selector: "outstandingAmount",
        sortable: true,
        cell: (row) =>
          row.outstandingAmount
            ? "₹" + row.outstandingAmount.toLocaleString()
            : null,
      },
      {
        name: "Loan Date",
        selector: "loanDate",
        sortable: true,
        cell: (row) =>
          row.loanDate ? Moment(row.loanDate).format("DD MMM YYYY") : "-",
      },
    ];
    let selectors = [];
    for (let i in Usercolumns) {
      selectors.push(Usercolumns[i]["selector"]);
    }
    let columnsvalue = selectors[0];

    /** random color generator for pie chart */
    let color;
    let newColor = [];
    let entries = 10 + Math.floor(Math.random() * 8);
    for (let i = 0; i < entries; i++) {
      let r = Math.floor(Math.random() * 200);
      let g = Math.floor(Math.random() * 200);
      let b = Math.floor(Math.random() * 200);
      color = "rgb(" + r + ", " + g + ", " + b + ")";
      newColor.push(color);
    }

    return (
      <div className="App" style={{ paddingTop: "15px" }}>
        <Grid container style={{ border: "1px solid #ccc" }}>
          <Grid item md={3} spacing={3}>
            <div className={classes.oddBlock}>
              <PersonIcon className={classes.Icon} />
              <h3 style={{ color: "white", marginBottom: "5px" }}>MEMBERS </h3>
              <h2 className={classes.labelValues}>
                {this.state.memberData.toLocaleString()}
              </h2>
            </div>
          </Grid>

          <Grid item md={3} spacing={3}>
            <div className={classes.evenBlock}>
              <PeopleIcon className={classes.Icon} />
              <h3 style={{ color: "white", marginBottom: "5px" }}>
                SELF HELP GROUPS{" "}
              </h3>
              <h2 className={classes.labelValues}>
                {this.state.shgData.toLocaleString()}
              </h2>
            </div>
          </Grid>

          <Grid item md={3} spacing={3}>
            <div className={classes.oddBlock}>
              <NaturePeopleIcon className={classes.Icon} />
              <h3 style={{ color: "white", marginBottom: "5px" }}>
                {" "}
                VILLAGE ORGANIZATIONS{" "}
              </h3>
              <h2 className={classes.labelValues}>
                {this.state.voData.toLocaleString()}
              </h2>
            </div>
          </Grid>

          <Grid item md={3} spacing={3}>
            <div className={classes.evenBlock}>
              <MoneyIcon className={classes.Icon} />
              <h3 style={{ color: "white", marginBottom: "5px" }}>
                LOAN APPLICATIONS{" "}
              </h3>
              <div style={{ display: "inline-flex" }}>
                <div
                  style={{ borderRight: "1px solid #fff", padding: "0px 15px" }}
                >
                  <h5 style={{ display: "block", margin: "0px" }}>APPROVED</h5>
                  <span className={classes.fieldValues}>
                    {this.state.approvedLoans}
                  </span>
                </div>
                <div style={{ padding: "0px 15px" }}>
                  <h5 style={{ display: "block", margin: "0px" }}>PENDING</h5>
                  <span className={classes.fieldValues}>
                    {this.state.pendingLoans}
                  </span>
                </div>
              </div>
            </div>
          </Grid>
        </Grid>

        <Grid container style={{ border: "1px solid #ccc" }}>
          <Grid
            item
            md={3}
            spacing={3}
            style={{ padding: "15px", backgroundColor: "#fff" }}
          >
            <h3 align="center">LOAN AMOUNT DISTRIBUTED</h3>
            <h2 align="center" className={classes.fieldValues}>
              ₹ {this.state.totalLoanDistributed.toLocaleString()}
            </h2>
            {this.state.loanDistributedAmounts &&
            this.state.loanDistributedAmounts.length > 0 ? (
              <Piechart
                width={50}
                height={50}
                labels={["DISTRIBUTED", "RECEIVED"]}
                datasets={[
                  {
                    data: this.state.loanDistributedAmounts,
                    backgroundColor: ["#2E8B57", "#2F4F2F "],
                  },
                ]}
              />
            ) : (
              <h3 align="center"> No Data to display </h3>
            )}
          </Grid>

          <Grid item md={6} spacing={3}>
            <div
              style={{
                border: "1px solid #ccc",
                backgroundColor: "#fff",
                marginTop: "-1px",
                height: "100%",
              }}
            >
              <h3 align="center">LOANS</h3>
              <div style={{ height: "calc(100% - 115px)" }}>
                {loanData ? (
                  <Table
                    title={"FPO Loans"}
                    data={loanData}
                    showSearch={false}
                    filterData={false}
                    filterBy={["memberName", "loanAmount", "loanDate"]}
                    column={Usercolumns}
                    // editData={this.editData}
                    rowsSelected={this.rowsSelect}
                    columnsvalue={columnsvalue}
                  />
                ) : (
                  <h1>Loading...</h1>
                )}
              </div>
              <div align="right">
                <Tooltip title="View More">
                  <IconButton
                    component={Link}
                    to={{
                      pathname: "/fpo/loans/view/more",
                      loanData: this.state.loansAllDetails,
                      loanColumns: Usercolumns,
                    }}
                  >
                    <MoreHorizIcon className={classes.MoreHorizIcon} />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          </Grid>

          <Grid
            item
            md={3}
            spacing={3}
            style={{ padding: "15px", backgroundColor: "#fff" }}
          >
            <h3 align="center">LOAN BY PURPOSE</h3>
            {this.state.purposes && this.state.purposes.length > 0 ? (
              <Piechart
                width={50}
                height={50}
                labels={this.state.purposes}
                datasets={[
                  {
                    data: this.state.purposesValues,
                    // backgroundColor: newColor,
                    backgroundColor: [
                      "#2dc190",
                      "#28a8b5",
                      "#bc7e9d",
                      "#028941",
                      "#ff6361",
                      "#3CB371",
                      "#5a3da3",
                      "#bfa05c",
                      "#6495ED",
                      "#A52A2A",
                      "#9ACD32",
                      "#FFD700",
                      "#bc5090",
                      "#D2691E",
                      "#696969",
                      "#00008B",
                      "#C0C0C0",
                      "#488f31",
                      "#FFDEAD",
                      "#EE82EE",
                      "#4682B4",
                    ],
                  },
                ]}
              />
            ) : (
              <h3 align="center"> No Data to display </h3>
            )}
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(useStyles)(DashboardForFPO);
