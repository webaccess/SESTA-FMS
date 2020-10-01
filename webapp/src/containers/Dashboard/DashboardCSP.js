import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import auth from "../../components/Auth/Auth";
import { withStyles } from "@material-ui/core/styles";
import Piechart from "../../components/UI/Piechart/Piechart";
import * as serviceProvider from "../../api/Axios";
import Table from "../../components/Datatable/Datatable.js";
import { Grid } from "@material-ui/core";
import Moment from "moment";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import style from "./Dashboard.module.css";

const useStyles = (theme) => ({
  root: {},
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
  pie: {
    width: "50px",
    height: "50px",
  },
  remun: {
    backgroundColor: "#000",
    padding: "15px",
    textAlign: "center",
    color: "white",
  },
  remunText: {
    color: "white",
    marginBottom: "5px",
  },
  remunDate: {
    color: "white",
    marginTop: "0px",
  },
  emiDue: {
    borderWidth: "1px 0px",
    borderStyle: "solid",
    borderColor: "#ccc",
    backgroundColor: "#fff",
    marginTop: "-1px",
  },
});

class DashboardCSP extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loanData: [],
      loanInstallmentData: [],
      activitiesData: [],
      activitytypeData: [],
      activityname: [],
      activityvalue: [],
      remuneration: "",
      isLoader: true,
      isLoaderAct: true,
    };
  }

  async componentDidMount() {
    let filteredArray = [];

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "loan-application-installments/emidue/details/?_limit=5&&loan_application.creator_id=" + auth.getUserInfo().contact.id
      )
      .then((res) => {
        this.setState({ loanInstallmentData: res.data.result, isLoader: false });
      });

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/activities/recent/activities?_sort=end_datetime:desc"
      )
      .then((activityRes) => {
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
          isLoaderAct: false,
          pageSize: activityRes.data.pageSize,
          totalRows: activityRes.data.rowCount,
          page: activityRes.data.page,
          pageCount: activityRes.data.pageCount
        },
          function () {
            this.actOtherDetail(activityRes.data)
          });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  actOtherDetail(data) {
    this.setState({ remuneration: data.dashRemuneration })
    this.setState({ activityname: data.pieChartCal.activityname })
    this.setState({ activityvalue: data.pieChartCal.activityvalue })
  }

  render() {
    const { classes } = this.props;
    const userInfo = auth.getUserInfo();

    let loanInstallmentData = this.state.loanInstallmentData;
    let activitiesData = this.state.activitiesData;

    // Today's date
    let today = new Date();
    today = today.getFullYear() + "-" + (today.getMonth() + 1);

    // Date format for Remuneration
    let remun_date = Moment(today).format("MMMM YYYY").toUpperCase();
    let remuneration = this.state.remuneration;
    let activityname = this.state.activityname;
    let activityvalue = this.state.activityvalue;
    let loanEmiRedirect = {
      pathname: "/view/more",
      state: { loanEMIData: loanInstallmentData },
    };
    let activityRedirect = {
      pathname: "/view/more",
      state: { activitiesData: this.state.activitiesData },
    };

    // Top 5 records of Loan EMI Data and Activties
    activitiesData =
      activitiesData.length > 5 ? activitiesData.slice(1, 6) : activitiesData;
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
      <div className="App" style={{ paddingTop: "15px" }}>
        <Grid container style={{ border: "1px solid #ccc" }}>
          <Grid
            item
            md={4}
            xs={12}
            spacing={3}
            style={{ backgroundColor: "#e5e9e3" }}
          >
            <div className={classes.remun}>
              <AccountBalanceWalletIcon className={classes.Icon} />
              <h3 className={classes.remunText}>REMUNERATION </h3>
              <p className={classes.remunDate}>FOR {remun_date} </p>
              <h2 style={{ color: "green" }}>₹ {remuneration}</h2>
            </div>
            <h3 align="center">ACTIVITIES</h3>
            {activityname.length > 0 && activityvalue.length > 0 ? (
              <Piechart
                width={5}
                height={5}
                labels={activityname}
                datasets={[
                  {
                    data: activityvalue,
                    backgroundColor: [
                      "#A52A2A",
                      "#9ACD32",
                      "#6495ED",
                      "#ff6361",
                      "#3CB371",
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
                    // backgroundColor: activitycolor,
                  },
                ]}
              />
            ) : (
                <h3 align="center">No records present for this month</h3>
              )}
          </Grid>
          <Grid item md={8} xs={12} spacing={3}>
            <div className={classes.emiDue}>
              <h3 className={style.emiDueHead}>EMI DUE</h3>
              {loanInstallmentData ? (
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
                  progressComponent={this.state.isLoader}
                />
              ) : (
                  <h1>Loading...</h1>
                )}
              <div align="right">
                <Tooltip title="View More">
                  <IconButton component={Link} to={loanEmiRedirect}>
                    <MoreHorizIcon className={classes.MoreHorizIcon} />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
            <div className={classes.emiDue}>
              <h3 className={style.emiDueHead}>RECENT ACTIVITIES</h3>
              {activitiesData ? (
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
                  rowsSelected={this.rowsSelect}
                  columnsvalue={columnsvalue1}
                  progressComponent={this.state.isLoaderAct}
                />
              ) : (
                  <h1>Loading...</h1>
                )}

              <div align="right">
                <Tooltip title="View More">
                  <IconButton component={Link} to={activityRedirect}>
                    <MoreHorizIcon className={classes.MoreHorizIcon} />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(useStyles)(DashboardCSP);
