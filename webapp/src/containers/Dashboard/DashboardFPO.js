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
import style from "./Dashboard.module.css";
import Spinner from "../../components/Spinner/Spinner";

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
  fpoInlineGrid: {
    display: "inline-flex",
    flexWrap: "wrap",
  },
  oddBlock: {
    backgroundColor: "#000",
    padding: "15px",
    textAlign: "center",
    color: "white",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  evenBlock: {
    backgroundColor: "#112e23",
    padding: "15px",
    textAlign: "center",
    color: "white",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  labelValues: {
    color: "#028941",
    fontSize: "46px",
    fontWeight: "bold",
    marginBottom: "0px",
    marginTop: "0px",
    lineHeight: "1.5",
    flex: "auto",
  },
  fieldValues: {
    color: "#028941",
    fontSize: "32px",
    fontWeight: "bold",
    lineHeight: "1.5",
  },
  fpoHead3: {
    color: "white",
    marginBottom: "5px",
    flex: "auto",
  },
});

class DashboardForFPO extends Component {
  constructor(props) {
    super(props);
    this.state = {
      memberData: "",
      shgData: "",
      voData: "",
      approvedLoans: "",
      pendingLoans: "",
      loanDistributedAmounts: [],
      totalLoanDistributed: 0,
      loansTableData: [],
      loansAllDetails: [],
      purposesValues: [],
      purposes: [],
      isLoader: true,
      isMemLoading: true,
      isVoLoading: true,
      isShgLoading: true,
      isLoanLoading: true,
      isLoanAmtLoading: true,
    };
  }

  async componentDidMount() {
    /** get members */
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/contact/members/count"
      )
      .then((res) => {
        this.setState({ memberData: res.data, isMemLoading: false });
      })
      .catch((error) => {});

    /** get SHGs */
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
              "crm-plugin/contact/shg/count/?id=" +
              res.data.fpo.id
          )
          .then((shgRes) => {
            this.setState({ shgData: shgRes.data, isShgLoading: false });
          });
      });

    /** get VOs */
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/individuals/" +
          auth.getUserInfo().contact.individual
      )
      .then((res) => {
        let voUrl = "crm-plugin/contact/vo/count/?id=" + res.data.fpo.id;

        serviceProvider
          .serviceProviderForGetRequest(
            process.env.REACT_APP_SERVER_URL + voUrl
          )
          .then((res) => {
            this.setState({ voData: res.data, isVoLoading: false });
          })
          .catch((error) => {
            console.log(error);
          });
      });

    let loanAppUrl = "loan-applications/";
    /** get pending loan applications */
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "loan-applications/loans/count/?status=UnderReview"
      )
      .then((res) => {
        this.setState({ pendingLoans: res.data, isLoanLoading: false });
      })
      .catch((error) => {});

    /** get approved loan applications */
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "loan-applications/loans/count/"
      )
      .then((res) => {
        this.setState({ approvedLoans: res.data, isLoanLoading: false });
      })
      .catch((error) => {});

    /** approved loans, loan distributed amount, loan table data */
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "loan-applications/loans/details/?status=Approved&status=InProgress"
      )
      .then((res) => {
        this.setState({
          loanDistributedAmounts: res.data.loanDistributedAmounts,
          totalLoanDistributed: res.data.totalLoanDistributed,
          loansTableData: res.data.loansTableData,
          loansAllDetails: res.data.loansAllDetails,
          isLoader: false,
        });
      })
      .catch((error) => {});

    /** loans by purpose */
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "loan-applications/loans/details/"
      )
      .then((res) => {
        this.setState({
          purposes: res.data.purposes,
          purposesValues: res.data.purposesValues,
        });
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
          <Grid
            className={classes.fpoInlineGrid}
            item
            md={3}
            sm={6}
            xs={12}
            spacing={3}
          >
            <div className={classes.oddBlock}>
              <PersonIcon className={classes.Icon} />
              <h3 className={classes.fpoHead3}>MEMBERS </h3>
              {!this.state.isMemLoading ? (
                <h2 className={classes.labelValues}>
                  {this.state.memberData.toLocaleString()}
                </h2>
              ) : (
                <Spinner />
              )}
            </div>
          </Grid>

          <Grid
            className={classes.fpoInlineGrid}
            item
            md={3}
            sm={6}
            xs={12}
            spacing={3}
          >
            <div className={classes.evenBlock}>
              <PeopleIcon className={classes.Icon} />
              <h3 className={classes.fpoHead3}>SELF HELP GROUPS </h3>
              {!this.state.isShgLoading ? (
                <h2 className={classes.labelValues}>
                  {this.state.shgData.toLocaleString()}
                </h2>
              ) : (
                <Spinner />
              )}
            </div>
          </Grid>

          <Grid
            className={classes.fpoInlineGrid}
            item
            md={3}
            sm={6}
            xs={12}
            spacing={3}
          >
            <div className={classes.oddBlock}>
              <NaturePeopleIcon className={classes.Icon} />
              <h3 className={classes.fpoHead3}> VILLAGE ORGANIZATIONS </h3>
              {!this.state.isVoLoading ? (
                <h2 className={classes.labelValues}>
                  {this.state.voData.toLocaleString()}
                </h2>
              ) : (
                <Spinner />
              )}
            </div>
          </Grid>

          <Grid
            className={classes.fpoInlineGrid}
            item
            md={3}
            sm={6}
            xs={12}
            spacing={3}
          >
            <div className={classes.evenBlock}>
              <MoneyIcon className={classes.Icon} />
              <h3 className={classes.fpoHead3}>LOAN APPLICATIONS </h3>
              {!this.state.isLoanLoading ? (
                <div style={{ display: "inline-flex" }}>
                  <div
                    style={{
                      borderRight: "1px solid #fff",
                      padding: "0px 15px",
                    }}
                  >
                    <h5 style={{ display: "block", margin: "0px" }}>
                      APPROVED
                    </h5>
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
              ) : (
                <Spinner />
              )}
            </div>
          </Grid>
        </Grid>

        <Grid container style={{ border: "1px solid #ccc" }}>
          <Grid
            item
            sm={3}
            xs={12}
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

          <Grid item sm={6} xs={12}>
            <div className={style.loanDashboardTable}>
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
                    rowsSelected={this.rowsSelect}
                    columnsvalue={columnsvalue}
                    progressComponent={this.state.isLoader}
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

          <Grid item sm={3} xs={12} className={style.loanPurposesDashboard}>
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
