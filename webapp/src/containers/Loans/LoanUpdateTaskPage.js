import React, { Component } from "react";
import style from "./Loans.module.css";
import { withStyles } from "@material-ui/core/styles";
import Layout from "../../hoc/Layout/Layout";
import { Grid, Card } from "@material-ui/core";
import * as serviceProvider from "../../api/Axios";
import MoneyIcon from "@material-ui/icons/Money";
import IconButton from "@material-ui/core/IconButton";
import Table from "../../components/Datatable/Datatable.js";
import Moment from "moment";

const useStyles = (theme) => ({
  root: {},
  row: {
    height: "42px",
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(1),
  },
  floatRow: {
    height: "40px",
    float: "right",
  },
  buttonRow: {
    height: "42px",
    float: "right",
    marginTop: theme.spacing(1),
  },
  spacer: {
    flexGrow: 1,
  },
  addButton: {
    float: "right",
    marginRight: theme.spacing(1),
  },
  searchInput: {
    marginRight: theme.spacing(1),
  },
  Districts: {
    marginRight: theme.spacing(1),
  },
  States: {
    marginRight: theme.spacing(1),
  },
  Search: {
    marginRight: theme.spacing(1),
  },
  Cancel: {
    marginRight: theme.spacing(1),
  },
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

class LoanUpdateTaskPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loantasks: []
    }
  }

  async componentDidMount() {
    let memberData = this.props.location.state.loanAppData;
    this.getAllDetails(memberData);

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
        "loan-application-tasks/?loan_application.id=" + memberData.id + "&&_sort=id:ASC"
      )
      .then((res) => {
        this.setState({ loantasks: res.data });
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
    let loantask;
    this.state.loantasks.map(data => {
      if (data.id == cellid) {
        loantask = data;
      }
    });

    this.props.history.push("/loan/task/edit/" + cellid, {
      loantask: loantask, loanAppData: this.props.location.state.loanAppData
    });
  }

  render() {
    const { classes } = this.props;
    let data = this.state.data;
    let loantasks = this.state.loantasks;
    loantasks.map(task => {
      if(task.date != null) {
        task.date = Moment(task.date).format('DD MMM YYYY');
      }
    });
    const Usercolumns = [
      {
        name: "Tasks",
        selector: "name",
        sortable: true,
      },
      {
        name: "Date",
        selector: "date",
        sortable: true,
      },
      {
        name: "Status",
        selector: "status",
        sortable: true,
      },
      {
        name: "Comments",
        selector: "comments",
        sortable: true,
      },
    ];
    let selectors = [];
    for (let i in Usercolumns) {
      selectors.push(Usercolumns[i]["selector"]);
    }
    let columnsvalue = selectors[0];
    let filters = this.state.values;

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
                        {loantasks.length > 0 ? (<span className={classes.fieldValues}>
                          {data.pendingAmount}
                        </span>) : "-"}
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
                        {loantasks.length > 0 ? (<span className={classes.fieldValues}>
                          {data.loanEndsOn}
                        </span>) : "-"}
                      </div>
                    </b>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Card>

          {loantasks ? (
            <Table
              title={"UpdateLoanTask"}
              showSearch={false}
              filterData={false}
              filterBy={["name", "date", "status", "comments"]}
              // filters={filters}
              data={loantasks}
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

export default withStyles(useStyles)(LoanUpdateTaskPage);