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
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';

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
    height: "50px"
  },
  remun: {
    backgroundColor: "#000",
    padding: "15px",
    textAlign: "center",
    color: "white"
  },
})

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loanData: [],
      activitiesData: [],
      activitytypeData: [],
      remuneration: ""
    }
  }


  async componentDidMount() {
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "loan-applications?_limit=5"
      )
      .then((res) => {
        this.setState({ loanData: res.data });
      })

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/activities?_sort=start_datetime:desc&&_limit=5",

      )
      .then((activityRes) => {
        this.setState({ activitiesData: activityRes.data });

      })
      .catch((error) => {
        console.log(error);
      });

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/activitytypes",

      )
      .then((typeRes) => {
        this.setState({ activitytypeData: typeRes.data });

      })
  }

  handleLoanViewMore() {
    this.props.history.push({ pathname: "/view/more", state: { loanData: this.state.loanData } });
  }
  handleActivityViewMore() {
    this.props.history.push({ pathname: "/view/more", state: { activitiesData: this.state.activitiesData } });
  }

  render() {
    const { classes } = this.props;
    const userInfo = auth.getUserInfo();

    let loanData = [];
    this.state.loanData.map(ldata => {
      if (ldata.loan_app_installments.length > 0) {
        loanData.push(ldata);
      }
    })

    let lastPaymentDate;
    loanData.map(emi => {

      // sort loan application installments
      emi.loan_app_installments.sort((a, b) => new Date(...a.payment_date.split('/').reverse()) - new Date(...b.payment_date.split('/').reverse()));

      let paid = 0;
      emi.loan_app_installments.map(emidata => {

        // get Pending Loan amount
        if (emidata.fine !== null || emidata.fine !== 0) {
          emidata.totalPaid = (emidata.fine + emidata.actual_principal + emidata.actual_interest);
        } else {
          emidata.totalPaid = (emidata.actual_principal + emidata.actual_interest);
        }
        paid = paid + emidata.totalPaid;

        // get last payment date
        if (emidata.actual_payment_date != null && emidata.actual_principal != null) {
          return lastPaymentDate = emidata.id;
        }
        // get EMI Due date if emi has been paid before
        if (emidata.id == (lastPaymentDate + 1)) {
          emi.emiDueDate = emidata.payment_date;
        }
      })
      // get Pending Loan amount
      let totalamount = emi.loan_model.loan_amount;
      let pendingLoanAmount = totalamount - paid;
      if (pendingLoanAmount < 0) {
        emi.pendingLoanAmount = 0;
      }
      emi.pendingLoanAmount = pendingLoanAmount;

      // get EMI Due date if emi has never been paid before
      if (emi.loan_model.loan_amount === emi.pendingLoanAmount) {
        emi.emiDueDate = emi.loan_app_installments[0].payment_date;
      }
    })

    let activitiesData = this.state.activitiesData;
    let remunaration = 0;
    activitiesData.map(cspActivity => {
      let remun = cspActivity.activitytype.remuneration;
      let unit = cspActivity.unit;
      let cal = remun * unit;
      remunaration = remunaration + cal;
    })

    let activitytypeRes = this.state.activitytypeData;
    let activtiesArr = [];
    activitytypeRes.map(type => {
      let activityTypeName, activityTypeCount = 0;
      activitiesData.map(activity => {
        if (activity.activitytype.name == type.name) {
          activityTypeName = activity.activitytype.name;
          activityTypeCount = activityTypeCount + 1;
        }
      })
      if (activityTypeName) {
        activtiesArr.push({ activityName: activityTypeName, activityCount: activityTypeCount });
      }
    })
    let activityname = [];
    let activityvalue = [];
    activtiesArr.map(act => {
      activityname.push(act.activityName);
      activityvalue.push(act.activityCount);
    })

    const Usercolumns = [
      {
        name: "Loanee",
        selector: "contact.name",
        sortable: true,
      },
      {
        name: "Purpose",
        selector: "purpose",
        sortable: true,
      },
      {
        name: "Loan amount",
        selector: "pendingLoanAmount",
        sortable: true,
        cell: (row) =>
          row.pendingLoanAmount ?
            (row.pendingLoanAmount).toLocaleString() : null
      },
      {
        name: "Due date",
        selector: "emiDueDate",
        sortable: true,
        cell: (row) =>
          row.emiDueDate ?
            Moment(row.emiDueDate).format('DD MMM YYYY') : "-"
      },
      {
        name: "EMI",
        selector: "loan_model.emi",
        sortable: true,
        cell: (row) =>
          row.loan_model.emi ?
            (row.loan_model.emi).toLocaleString() : null
      },
    ];
    let selectors = [];
    for (let i in Usercolumns) {
      selectors.push(Usercolumns[i]["selector"]);
    }
    let columnsvalue = selectors[0];

    const Usercolumns1 = [
      {
        name: "Loanee",
        selector: "title",
        sortable: true, // width:20%
      },
      {
        name: "Due date",
        selector: "start_datetime",
        sortable: true,
        cell: (row) =>
          row.start_datetime ?
            Moment(row.start_datetime).format('DD MMM YYYY') : null
      },
      {
        name: "EMI",
        selector: "activitytype.remuneration",
        sortable: true,
      },
    ];

    let selectors1 = [];
    for (let i in Usercolumns1) {
      selectors1.push(Usercolumns1[i]["selector"]);
    }
    let columnsvalue1 = selectors1[0];
    return (
      
      <Layout>
        <h3>Welcome {userInfo.username}</h3>
        {userInfo.role.name == "CSP (Community Service Provider)" ? (
        <Grid container style={{ border: "1px solid #ccc" }}>
          <Grid item md={4} spacing={3} style={{ backgroundColor: "#e5e9e3" }}>
            <div className={classes.remun}>
              <AccountBalanceWalletIcon className={classes.Icon} />
              <h3 style={{ color: "white", "marginBottom": "5px" }}>REMUNARATION </h3>
              <p style={{ color: "white", "marginTop": "0px" }}>FOR AUGUST 2020 </p>
              <h2 style={{ color: "green" }}>Rs. {remunaration}</h2>
            </div>
            <h3 align="center">ACTIVITIES</h3>
            <Piechart
              width={50}
              height={50}
              labels={activityname}
              datasets={[
                {
                  data: activityvalue,
                  backgroundColor: ["tomato", "green ", "blue", "yellow"],
                },
              ]}
            />

          </Grid>
          <Grid item md={8} spacing={3}>
            <div style={{ border: "1px solid #ccc", "backgroundColor": "#fff", "marginTop": "-1px" }}>
              <h3 style={{ paddingLeft: "15px" }}>EMI DUE</h3>
              {loanData ? (
                <Table
                  title={"EMI Due"}
                  data={loanData}
                  showSearch={false}
                  filterData={false}
                  filterBy={[
                    "contact.name",
                    "purpose",
                    "pendingLoanAmount",
                    "application_date",
                    "loan_model.emi",
                  ]}
                  column={Usercolumns}
                  editData={this.editData}
                  rowsSelected={this.rowsSelect}
                  columnsvalue={columnsvalue}
                />
              ) : (
                  <h1>Loading...</h1>
                )}
              <div align="right">
                <Tooltip title="View More">
                  <IconButton onClick={this.handleLoanViewMore.bind(this)}>
                    <MoreHorizIcon className={classes.MoreHorizIcon} />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
            <div style={{ border: "1px solid #ccc", "backgroundColor": "#fff", "marginTop": "-1px" }}>
              <h3 style={{ paddingLeft: "15px" }}>RECENT ACTIVITIES</h3>
              {activitiesData ? (
                <Table
                  title={"Recent Activities"}
                  data={activitiesData}
                  showSearch={false}
                  filterData={false}
                  filterBy={[
                    "title",
                    "start_datetime",
                    "activitytype.remuneration"
                  ]}
                  column={Usercolumns1}
                  editData={this.editData}
                  rowsSelected={this.rowsSelect}
                  columnsvalue={columnsvalue1}
                />
              ) : (
                  <h1>Loading...</h1>
                )}

              <div align="right">
                <Tooltip title="View More">
                  <IconButton onClick={this.handleActivityViewMore.bind(this)}>
                    <MoreHorizIcon className={classes.MoreHorizIcon} />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          </Grid>
        </Grid>
      ) : null}
      </Layout>
    );
  }
}

export default withStyles(useStyles)(Dashboard);
