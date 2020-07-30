import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import Layout from "../../hoc/Layout/Layout";
import { Grid, Card } from "@material-ui/core";
import * as serviceProvider from "../../api/Axios";
import MoneyIcon from "@material-ui/icons/Money";
import Table from "../../components/Datatable/Datatable.js";
import Moment from "moment";

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
  },
  mainContent: {
    padding: "25px",
  },
  loanee: {
    display: "flex",
    paddingLeft: "75px"
  },
  fieldValues: {
    fontSize: "13px !important",
  },
  dataRow: {
    display: "flex",
    paddingLeft: "75px"
  },
});

class LoanEmiPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loanEmiData: []
    }
  }

  async componentDidMount() {
    let memberData = this.props.location.state.loanAppData;
    this.getAllDetails(memberData);

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
        "loan-application-installments/?loan_application.id=" + memberData.id + "&&_sort=id:ASC"
      )
      .then((res) => {
        this.setState({ loanEmiData: res.data });
      })
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
                amount: "Rs." + (amount).toLocaleString(),
                duration: duration,
                emi: "Rs." + (emi).toLocaleString(),
                pendingAmount: pendingAmount ? "Rs." + (pendingAmount).toLocaleString() : "-",
                loanEndsOn: loanEndsOn ? Moment(loanEndsOn).format("DD MMM YYYY") : "-"
              }
            })
          })
      })
  }

  editData = (cellid) => {
    let loanEmiData;
    this.state.loanEmiData.map(data => {
      if (data.id === cellid) {
        loanEmiData = data;
      }
    });
    this.props.history.push("/loan/emi/edit/" + cellid, {loanEmiData: loanEmiData});
  }

  render() {
    const { classes } = this.props;
    let data = this.state.data;
    let loanEmiData = this.state.loanEmiData;
    loanEmiData.map(emidata=>{
      emidata.totalPaid = emidata.actual_principal + emidata.actual_interest;
      let totalLoanAmnt = emidata.expected_principal + emidata.expected_interest;
      emidata.outstanding = totalLoanAmnt - (emidata.actual_principal + emidata.actual_interest);
    })

    const Usercolumns = [
      {
        name: "Due Date",
        selector: "payment_date",
        sortable: true,
      },
      {
        name: "Principle",
        selector: "expected_principal",
        sortable: true,
      },
      {
        name: "Interest",
        selector: "expected_interest",
        sortable: true,
      },
      {
        name: "Payment Date",
        selector: "actual_payment_date",
        sortable: true,
      },
      {
        name: "Priniciple Paid",
        selector: "actual_principal",
        sortable: true,
      },
      {
        name: "Interest Paid",
        selector: "actual_interest",
        sortable: true,
      },
      {
        name: "Fine",
        selector: "fine",
        sortable: true,
      },
      {
        name: "Total Paid",
        selector: "totalPaid",
        sortable: true,
      },
      {
        name: "Outstanding",
        selector: "outstanding",
        sortable: true,
      },
    ];
    let selectors = [];
    for (let i in Usercolumns) {
      selectors.push(Usercolumns[i]["selector"]);
    }
    let columnsvalue = selectors[0];

    return (
      <Layout>
        <Grid>
          <div className="App">
            <h5>LOAN</h5>

            <div style={{ display: "flex" }}>
              <h2 style={{ margin: "13px" }}>{data.loanee}</h2>
              <div className={classes.dataRow}><p>SHG GROUP <b>{data.shg}</b></p></div>

              <div className={classes.dataRow}><p>VILLAGE <b>{data.village}</b> </p></div>
            </div>
          </div>
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
                      <div className={classes.member}>
                        AMOUNT <br />
                        <span className={classes.fieldValues}>
                          {data.amount}
                        </span>
                      </div>
                    </b>
                  </Grid>
                  <Grid spacing={2} xs={2}>
                    <b>
                      <div className={classes.member}>
                        PENDING AMOUNT <br />
                        <span className={classes.fieldValues}>
                          {data.pendingAmount}
                        </span>
                      </div>
                    </b>
                  </Grid>
                  <Grid spacing={2} xs={2}>
                    <b>
                      <div className={classes.member}>
                        EMI <br />
                        <span className={classes.fieldValues}>
                          {data.emi}
                        </span>
                      </div>
                    </b>
                  </Grid>
                  <Grid spacing={2} xs={2}>
                    <b>
                      <div className={classes.member}>
                        DURATION <br />
                        <span className={classes.fieldValues}>
                          {data.duration}
                        </span>
                      </div>
                    </b>
                  </Grid>
                  <Grid spacing={2} xs={2}>
                    <b>
                      <div className={classes.member}>
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
              title={"LoanEMI"}
              data={loanEmiData}
              showSearch={false}
              filterData={false}
              filterBy={["payment_date", "expected_principal", "expected_interest", "actual_payment_date","actual_principal", "actual_interest", "fine", "totalPaid", "outstanding"]}
              // filters={filters}
              column={Usercolumns}
              editData={this.editData}
              rowsSelected={this.rowsSelect}
              columnsvalue={columnsvalue}
            />
          ) : (
              <h1>Loading...</h1>
            )}
        </Grid>
      </Layout>
    )
  }
}

export default withStyles(useStyles)(LoanEmiPage);