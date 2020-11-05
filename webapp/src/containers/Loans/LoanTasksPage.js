import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import Layout from "../../hoc/Layout/Layout";
import { Grid, Card } from "@material-ui/core";
import * as serviceProvider from "../../api/Axios";
import MoneyIcon from "@material-ui/icons/Money";
import Table from "../../components/Datatable/Datatable.js";
import Moment from "moment";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import { LOAN_TASK_BREADCRUMBS } from "./config";
import style from "./Loans.module.css";
import Button from "../../components/UI/Button/Button";
import { Link } from "react-router-dom";
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
  member: {
    color: "black",
    fontSize: "10px",
    padding: "5px 0px",
    margin: "5px 0px",
  },
  mainContent: {
    padding: "25px",
    marginTop: "10px !important",
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
    display: "inline-flex",
  },
  emiViewWrap: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
  },
  loaneeName: {
    margin: "10px 0",
    display: "inline-flex",
  },
});

class LoanTasksPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      newData: [],
      loantasks: [],
      isLoader: true,
    };
  }

  async componentDidMount() {
    let memberData = this.props.location.state.loanAppData;
    this.getAllDetails(memberData);

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "loan-application-tasks/?loan_application.id=" +
          memberData.id +
          "&&_sort=id:ASC"
      )
      .then((res) => {
        this.setState({ loantasks: res.data, isLoader: false });
      });
  }

  async getVillage(data) {
    await serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/villages/" + data.village
      )
      .then((res) => {
        this.setState({
          newData: { ...this.state.newData, village: res.data.name },
        });
        this.setState({ data: this.state.newData });
      })
      .catch((error) => {
        console.log(error);
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
            let villageName = response.data[0].addresses[0].village;
            this.setState({
              newData: {
                loanee: loaneeName,
                shg: shgName,
                village: villageName,
                purpose: purpose,
                amount: "₹" + amount.toLocaleString(),
                duration: duration,
                emi: "₹" + emi.toLocaleString(),
                pendingAmount: pendingAmount
                  ? "₹" + pendingAmount.toLocaleString()
                  : "-",
                loanEndsOn: loanEndsOn
                  ? Moment(loanEndsOn).format("DD MMM YYYY")
                  : "-",
              },
            });
            this.getVillage(this.state.newData);
          });
      });
  };

  editData = (cellid) => {
    let loantask;
    this.state.loantasks.map((data) => {
      if (data.id === cellid) {
        loantask = data;
      }
    });

    this.props.history.push("/loan/task/edit/" + cellid, {
      loantask: loantask,
      loanAppData: this.props.location.state.loanAppData,
    });
  };

  render() {
    const { classes } = this.props;
    let data = this.state.data;
    let loantasks = this.state.loantasks;
    let loanAppData = this.props.location.state.loanAppData;
    let pendingAmount;
    if (
      loanAppData.outstanding_amount !== null ||
      loanAppData.outstanding_amount !== ""
    ) {
      pendingAmount = "₹" + loanAppData.outstanding_amount.toLocaleString();
    } else {
      pendingAmount = "-";
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

    loantasks.map((task) => {
      if (task.date != null) {
        task.date = Moment(task.date).format("DD MMM YYYY");
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
        cell: (row) => (row.comments ? row.comments : "-"),
      },
    ];
    let selectors = [];
    for (let i in Usercolumns) {
      selectors.push(Usercolumns[i]["selector"]);
    }
    let columnsvalue = selectors[0];

    let taskEditPage = false,
      taskAddPage = false;
    if (
      this.props.location.state &&
      this.props.location.state.loanEditTaskPage &&
      this.props.history.action === "PUSH"
    ) {
      taskEditPage = true;
    }
    if (
      this.props.location.state &&
      this.props.location.state.loanTaskAddPage === true &&
      this.props.history.action == "PUSH"
    ) {
      taskAddPage = true;
    }
    let loanTaskAdd = {
      pathname: "/loan/task/add/",
      state: { loanAppData: loanAppData },
    };

    return (
      <Layout breadcrumbs={LOAN_TASK_BREADCRUMBS}>
        {!this.state.isLoader ? (
          <Grid>
            <div className="App">
              <h5 className={style.loan}>LOANS</h5>
              <div className={classes.emiViewWrap}>
                <h2
                  className={classes.loaneeName}
                  style={{ paddingRight: "4rem" }}
                >
                  {data.loanee}
                </h2>
                <div
                  className={classes.dataRow}
                  style={{ paddingRight: "4rem" }}
                >
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
              {taskEditPage === true ? (
                <Snackbar severity="success">
                  Loan Task Updated successfully.
                </Snackbar>
              ) : null}
            </Grid>
            <Grid item md={12} xs={12}>
              {taskAddPage ? (
                <Snackbar severity="success">
                  Loan Task Updated successfully.
                </Snackbar>
              ) : null}
            </Grid>
            <Card className={classes.mainContent}>
              <Grid container style={{ alignItems: "center" }}>
                <Grid spacing={1} xs={2} sm={1} style={{ maxWidth: "55px" }}>
                  <MoneyIcon className={classes.Icon} />
                </Grid>
                <Grid
                  spacing={1}
                  xs={10}
                  sm={11}
                  style={{ maxWidth: "calc(100% - 55px)" }}
                >
                  <Grid container>
                    <Grid spacing={2} md={2} xs={4}>
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
                    <Grid spacing={2} md={2} xs={4}>
                      <b>
                        <div
                          className={classes.member}
                          style={{
                            borderLeft: "1px solid #c1c1c1",
                            paddingLeft: "10px",
                          }}
                        >
                          AMOUNT <br />
                          <span className={classes.fieldValues}>
                            {data.amount}
                          </span>
                        </div>
                      </b>
                    </Grid>
                    <Grid spacing={2} md={2} xs={4}>
                      <b>
                        <div
                          className={classes.member}
                          style={{
                            borderLeft: "1px solid #c1c1c1",
                            paddingLeft: "10px",
                          }}
                        >
                          PENDING AMOUNT
                          <br />
                          {loantasks.length > 0 ? (
                            <span className={classes.fieldValues}>
                              {pendingAmount}
                            </span>
                          ) : (
                            <span className={classes.fieldValues}>-</span>
                          )}
                        </div>
                      </b>
                    </Grid>
                    <Grid spacing={2} md={2} xs={4}>
                      <b>
                        <div
                          className={classes.member}
                          style={{
                            borderLeft: "1px solid #c1c1c1",
                            paddingLeft: "10px",
                          }}
                        >
                          EMI <br />
                          <span className={classes.fieldValues}>
                            {data.emi}
                          </span>
                        </div>
                      </b>
                    </Grid>
                    <Grid spacing={2} md={2} xs={4}>
                      <b>
                        <div
                          className={classes.member}
                          style={{
                            borderLeft: "1px solid #c1c1c1",
                            paddingLeft: "10px",
                          }}
                        >
                          DURATION <br />
                          <span className={classes.fieldValues}>
                            {data.duration}
                          </span>
                        </div>
                      </b>
                    </Grid>
                    <Grid spacing={2} md={2} xs={4}>
                      <b>
                        <div
                          className={classes.member}
                          style={{
                            borderLeft: "1px solid #c1c1c1",
                            paddingLeft: "10px",
                          }}
                        >
                          LOAN ENDS ON <br />
                          {loantasks.length > 0 ? (
                            <span className={classes.fieldValues}>
                              {data.loanEndsOn}
                            </span>
                          ) : (
                            <span className={classes.fieldValues}>-</span>
                          )}
                        </div>
                      </b>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Card>
            <div className={style.loanAddTask} align="right">
              <Button color="primary" component={Link} to={loanTaskAdd}>
                Add Task
              </Button>
            </div>
            {loantasks ? (
              <Table
                title={"Loan Task"}
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
            <div className={style.footerLoanBtn}>
              <Button color="primary" component={Link} to="/loans">
                Done
              </Button>
            </div>
          </Grid>
        ) : (
          <Spinner />
        )}
      </Layout>
    );
  }
}

export default withStyles(useStyles)(LoanTasksPage);
