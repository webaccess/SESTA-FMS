import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import auth from "../../components/Auth/Auth";
import { withStyles } from "@material-ui/core/styles";
import * as serviceProvider from "../../api/Axios";
import Table from "../../components/Datatable/Datatable.js";
import { Grid, Card } from "@material-ui/core";
import Moment from "moment";
import Input from "../../components/UI/Input/Input";
import Autocomplete from "../../components/Autocomplete/Autocomplete";
import DateTimepicker from "../../components/UI/DateTimepicker/DateTimepicker.js";
import Button from "../../components/UI/Button/Button";

const useStyles = (theme) => ({
  root: {},
  row: {
    height: "42px",
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(1),
  },
  pie: {
    width: "50px",
    height: "50px"
  },
  searchInput: {
    marginRight: theme.spacing(1),
  },
  Districts: {
    marginRight: theme.spacing(1),
    width: "230px"
  },
})
class DashboardViewMoreDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loanData: [],
      activitiesData: [],
      activitytypeData: [],
      filterActType: "",
      filterStartDate: "",
      filterEndDate: "",
      remuneration: "",
      isCancel: false,
    }
  }

  async componentDidMount() {
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "loan-applications?_sort=id:asc"
      )
      .then((res) => {
        this.setState({ loanData: res.data });
      })

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/activities?_sort=id:asc",

      )
      .then((activityRes) => {
        this.setState({ activitiesData: activityRes.data });
      })

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/activitytypes",
      )
      .then((typeRes) => {
        this.setState({ activitytypeData: typeRes.data });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleActivityTypeChange(event, value) {
    if (value !== null) {
      this.setState({ filterActType: value, isCancel: false });
    } else {
      this.setState({
        filterActType: "",
      });
    }
  }
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

  handleSearch() {
    let searchData = "";
    if (this.state.filterActType) {
      searchData += searchData ? "&&" : "";
      searchData += "activitytype.name=" + this.state.filterActType.name;
    }
    if (this.state.filterStartDate) {
      searchData += searchData ? "&&" : "";
      searchData += "start_datetime=" + this.state.filterStartDate;
    }

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
        "crm-plugin/activities/?" + searchData
      )
      .then((res) => {
        this.setState({ activitiesData: res.data });
      })
  }

  cancelForm = () => {
    this.setState({
      filterActType: "",
      filterStartDate: "",
      filterEndDate: "",
      isCancel: true,
    });
    this.componentDidMount();
  }

  render() {
    const { classes } = this.props;
    let activitytypeData = this.state.activitytypeData;

    let dbLoanData, dbActivitiesData;
    if (this.props.location.state.loanData) {
      dbLoanData = this.props.location.state.loanData;
    }
    if (this.props.location.state.activitiesData) {
      dbActivitiesData = this.props.location.state.activitiesData;
    }

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
        sortable: true,
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
        <Grid>
          <Grid>
            {dbLoanData ? <h3>EMI Due</h3> : null}
            {dbLoanData ? (
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
                pagination
              />
            ) : (
                null
              )}
          </Grid>
          <Grid>
            {dbActivitiesData ? (<h3>Activities</h3>) : null}
            {dbActivitiesData ? (
              <div className={classes.row}>
                <div className={classes.searchInput}>
                  <div className={classes.Districts}>
                    <Grid item md={12} xs={12}>
                      <Autocomplete
                        id="combo-box-demo"
                        options={activitytypeData}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, value) => {
                          this.handleActivityTypeChange(event, value);
                        }}
                        value={
                          this.state.filterActType
                            ? this.state.isCancel === true
                              ? null
                              : this.state.filterActType
                            : null
                        }
                        renderInput={(params) => (
                          <Input
                            {...params}
                            fullWidth
                            label="Activity Type"
                            name="activityType"
                            variant="outlined"
                          />
                        )}
                      />
                    </Grid>
                  </div>
                </div>
                {/* <div className={classes.searchInput}>
                <div className={classes.Districts}>
                  <Grid item md={6} xs={12}>
                    <DateTimepicker
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
              </div> */}
                {/* <div className={classes.searchInput}>
                <div className={classes.Districts}>
                  <Grid item md={6} xs={12}>
                    <DateTimepicker
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
              </div> */}

                <Button onClick={this.handleSearch.bind(this)}>Search</Button>
              &nbsp;&nbsp;&nbsp;
                <Button color="secondary" clicked={this.cancelForm}>
                  reset
              </Button>
              </div>
            ) : null}
            {dbActivitiesData ? (
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
                pagination
              />
            ) : (
                null
              )}
          </Grid>
        </Grid>

      </Layout>
    );
  }
}

export default withStyles(useStyles)(DashboardViewMoreDetails);
