import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import Layout from "../../hoc/Layout/Layout";
import { Grid, Card } from "@material-ui/core";
import * as serviceProvider from "../../api/Axios";
import MoneyIcon from "@material-ui/icons/Money";
import Table from "../../components/Datatable/Datatable.js";
import Moment from "moment";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import { LOAN_EMI_BREADCRUMBS } from "./config";
import style from "./Loans.module.css";
import Button from "../../components/UI/Button/Button";
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
  member: {
    color: "black",
    fontSize: "10px",
    padding: "5px 0px",
    margin: "5px 0px",
  },
  mainContent: {
    padding: "25px",
  },
  loanee: {
    display: "flex",
    paddingLeft: "75px",
  },
  fieldValues: {
    fontSize: "13px !important",
    marginTop: "10px !important",
    display: "flex",
  },
  dataRow: {
    display: "flex",
  },
  emiViewWrap: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
  },
  loaneeName: {
    margin: "10px 0",
    display: "inline-flex",
  }
});

class LoanEmiPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loanEmiData: [],
    };
  }

  async componentDidMount() {
    let memberData = this.props.location.state.loanAppData;
    this.getAllDetails(memberData);

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
        "loan-application-installments/?loan_application.id=" +
        memberData.id +
        "&&_sort=payment_date:ASC"
      )
      .then((res) => {
        this.setState({ loanEmiData: res.data });
      });
  }

  getAllDetails = (memberData) => {
    let loaneeName = memberData.contact.name;
    let purpose = memberData.purpose;
    let amount = memberData.loan_model.loan_amount;
    let duration = memberData.loan_model.duration + " Months";
    let emi = memberData.loan_model.emi;
    let pendingAmount = memberData.amount_due;
    let loanEndsOn = memberData.application_date;

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
        "crm-plugin/individuals/" +
        memberData.contact.individual
      )
      .then((res) => {
        let shgName = res.data.shg.name;

        serviceProvider
          .serviceProviderForGetRequest(
            process.env.REACT_APP_SERVER_URL +
            "crm-plugin/contact/?organization.id=" +
            res.data.shg.organization
          )
          .then((response) => {
            let villageName = response.data[0].villages[0].name;
            this.setState({
              data: {
                loanee: loaneeName,
                shg: shgName,
                village: villageName,
                purpose: purpose,
                amount: amount,
                duration: duration,
                emi: "₹" + emi.toLocaleString(),
                pendingAmount: pendingAmount ? pendingAmount : "-",
                loanEndsOn: loanEndsOn
                  ? Moment(loanEndsOn).format("DD MMM YYYY")
                  : "-",
              },
            });
          });
      });
  };

  editData = (cellid) => {
    let loanEmiData;
    this.state.loanEmiData.map((data) => {
      if (data.id === cellid) {
        loanEmiData = data;
      }
    });
    this.props.history.push("/loan/emi/edit/" + cellid, {
      loanEmiData: loanEmiData,
      loanAppData: this.props.location.state.loanAppData,
    });
  };

  render() {
    const { classes } = this.props;
    let data = this.state.data;
    let loanEmiData = this.state.loanEmiData;
    let loanAppData = this.props.location.state.loanAppData;

    let paid = 0;
    loanEmiData.map((emidata) => {
      if (emidata.fine !== null || emidata.fine !== 0) {
        emidata.totalPaid = (
          emidata.fine +
          emidata.actual_principal +
          emidata.actual_interest
        ).toLocaleString();
      } else {
        emidata.totalPaid = (
          emidata.actual_principal + emidata.actual_interest
        ).toLocaleString();
      }
      let totalLoanAmnt =
        emidata.expected_principal + emidata.expected_interest;
      emidata.outstanding = (
        totalLoanAmnt -
        (emidata.actual_principal + emidata.actual_interest)
      ).toLocaleString();

      emidata.totalPaid = parseInt(emidata.totalPaid.replace(/,/g, ""));
      paid = paid + emidata.totalPaid;
    });

    // Pending Amount = Actual amount + Fine - Total installment paid
    let pendingAmount;
    if (data.amount) {
      let totalamount = parseInt(data.amount.replace(/,/g, ""));
      pendingAmount = totalamount - paid;
      if (pendingAmount < 0) {
        pendingAmount = 0;
      }
      pendingAmount = "₹" + pendingAmount.toLocaleString();
    }

    // get Loan Ends On Date
    if (loanAppData.loan_app_installments.length > 0) {
      let sortedPaymentDate = loanAppData.loan_app_installments.sort(
        (a, b) =>
          new Date(...a.payment_date.split("/").reverse()) -
          new Date(...b.payment_date.split("/").reverse())
      );
      let len = sortedPaymentDate.length - 1;
      data.loanEndsOn = Moment(sortedPaymentDate[len].payment_date).format(
        "DD MMM YYYY"
      );
    }
    const Usercolumns = [
      {
        name: "Due Date",
        selector: "payment_date",
        sortable: true,
        cell: (row) =>
          row.payment_date
            ? Moment(row.payment_date).format("DD MMM YYYY")
            : null,
      },
      {
        name: "Principal",
        selector: "expected_principal",
        sortable: true,
        cell: (row) =>
          row.expected_principal
            ? "₹" + row.expected_principal.toLocaleString()
            : null,
      },
      {
        name: "Interest",
        selector: "expected_interest",
        sortable: true,
        cell: (row) =>
          row.expected_interest
            ? "₹" + row.expected_interest.toLocaleString()
            : null,
      },
      {
        name: "Payment Date",
        selector: "actual_payment_date",
        sortable: true,
        cell: (row) =>
          row.actual_payment_date
            ? Moment(row.actual_payment_date).format("DD MMM YYYY")
            : null,
      },
      {
        name: "Priniciple Paid",
        selector: "actual_principal",
        sortable: true,
        cell: (row) =>
          row.actual_principal
            ? "₹" + row.actual_principal.toLocaleString()
            : null,
      },
      {
        name: "Interest Paid",
        selector: "actual_interest",
        sortable: true,
        cell: (row) =>
          row.actual_interest
            ? "₹" + row.actual_interest.toLocaleString()
            : null,
      },
      {
        name: "Fine",
        selector: "fine",
        sortable: true,
        cell: (row) => (row.fine ? "₹" + row.fine.toLocaleString() : null),
      },
      {
        name: "Total Paid",
        selector: "totalPaid",
        sortable: true,
        cell: (row) =>
          row.totalPaid ? "₹" + row.totalPaid.toLocaleString() : null,
      },
      {
        name: "Outstanding",
        selector: "outstanding",
        sortable: true,
        cell: (row) =>
          row.outstanding ? "₹" + row.outstanding.toLocaleString() : null,
      },
    ];
    let selectors = [];
    for (let i in Usercolumns) {
      selectors.push(Usercolumns[i]["selector"]);
    }
    let columnsvalue = selectors[0];

    let emiEditPage = false;
    if (
      this.props.location.state &&
      this.props.location.state.loanEditEmiPage
    ) {
      emiEditPage = true;
    }
    if (this.props.history.action === "POP") {
      emiEditPage = false;
    }

    return (
      <Layout breadcrumbs={LOAN_EMI_BREADCRUMBS}>
        <Grid>
          <div className="App">
            <h5 className={style.loan}>LOANS</h5>
            <div className={classes.emiViewWrap}>
              <h2 className={classes.loaneeName} style={{paddingRight: "4rem",}}>{data.loanee}</h2>
              <div className={classes.dataRow} style={{paddingRight: "4rem",}}>
                <p>
                  <span className={style.filterLabel}>SHG GROUP</span>
                  <span className={style.filterValue}>{data.shg}</span>
                </p>
              </div>

              <div className={classes.dataRow}>
                <p>
                <span className={style.filterLabel}>VILLAGE</span>
                  <span className={style.filterValue}>{data.village}</span>
                </p>
              </div>
            </div>
          </div>
          <Grid item md={12} xs={12}>
            {emiEditPage === true ? (
              <Snackbar severity="success">
                Loan EMI Updated successfully.
              </Snackbar>
            ) : null}
          </Grid>
          <Card className={classes.mainContent}>
            <Grid
              container
              spacing={3}
              style={{ padding: "20px 0px", alignItems: "center" }}
            >
              <Grid spacing={1} xs={1}>
                <MoneyIcon className={classes.Icon} />
              </Grid>
              <Grid spacing={1} xs={11}>
                <Grid container spacing={3}>
                  <Grid spacing={2} xs={2}>
                    <b>
                      <div className={classes.member}>
                        PURPOSE
                        <br />
                        <span className={classes.fieldValues}>
                          {data.purpose}
                        </span>
                      </div>
                    </b>
                  </Grid>
                  <Grid spacing={2} xs={2}>
                    <b>
                      <div className={classes.member}
                        style={{borderLeft: "1px solid #c1c1c1", paddingLeft: "10px",}}>
                        AMOUNT <br />
                        <span className={classes.fieldValues}>
                          ₹{data.amount}
                        </span>
                      </div>
                    </b>
                  </Grid>
                  <Grid spacing={2} xs={2}>
                    <b>
                      <div className={classes.member}
                        style={{borderLeft: "1px solid #c1c1c1", paddingLeft: "10px",}}>
                        PENDING AMOUNT <br />
                        <span className={classes.fieldValues}>
                          {pendingAmount}
                        </span>
                      </div>
                    </b>
                  </Grid>
                  <Grid spacing={2} xs={2}>
                    <b>
                      <div className={classes.member}
                        style={{borderLeft: "1px solid #c1c1c1", paddingLeft: "10px",}}>
                        EMI <br />
                        <span className={classes.fieldValues}>{data.emi}</span>
                      </div>
                    </b>
                  </Grid>
                  <Grid spacing={2} xs={2}>
                    <b>
                      <div className={classes.member}
                        style={{borderLeft: "1px solid #c1c1c1", paddingLeft: "10px",}}>
                        DURATION <br />
                        <span className={classes.fieldValues}>
                          {data.duration}
                        </span>
                      </div>
                    </b>
                  </Grid>
                  <Grid spacing={2} xs={2}>
                    <b>
                      <div className={classes.member}
                        style={{borderLeft: "1px solid #c1c1c1", paddingLeft: "10px",}}>
                        LOAN ENDS ON <br />
                        <span className={classes.fieldValues}>
                          {data.loanEndsOn}
                        </span>
                      </div>
                    </b>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Card>

          {loanEmiData ? (
            <Table
              title={"Loan EMI"}
              data={loanEmiData}
              showSearch={false}
              filterData={false}
              filterBy={[
                "payment_date",
                "expected_principal",
                "expected_interest",
                "actual_payment_date",
                "actual_principal",
                "actual_interest",
                "fine",
                "totalPaid",
                "outstanding",
              ]}
              // filters={filters}
              column={Usercolumns}
              editData={this.editData}
              rowsSelected={this.rowsSelect}
              columnsvalue={columnsvalue}
              pagination
            />
          ) : (
              <h1>Loading...</h1>
            )}
            <div className={style.footerLoanBtn} style={{ padding: "15px 0px" }}>
            <Button color="primary" component={Link} to="/loans">
              Done
              </Button>
          </div>
        </Grid>
      </Layout>
    );
  }
}

export default withStyles(useStyles)(LoanEmiPage);
