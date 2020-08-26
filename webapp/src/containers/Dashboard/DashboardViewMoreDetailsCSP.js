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
import { Link } from "react-router-dom";

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
    height: "50px",
  },
  searchInput: {
    marginRight: theme.spacing(1),
  },
  Districts: {
    marginRight: theme.spacing(1),
    width: "230px",
  },
});
class DashboardViewMoreDetailsCSP extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loanData: [],
      activitiesData: [],
      loanInstallmentData: [],
      loanModelData: [],
      activitytypeData: [],
      filterLoaneeName: "",
      filterPurpose: "",
      filterActType: "",
      filterStartDate: "",
      filterEndDate: "",
      remuneration: "",
      isCancel: false,
    };
  }

  async componentDidMount() {
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "loan-application-installments?_sort=id:asc"
      )
      .then((res) => {
        this.setState({ loanInstallmentData: res.data });
      });

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "loan-applications?_sort=id:asc"
      )
      .then((res) => {
        this.setState({ loanData: res.data });
      });

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/activities?_sort=end_datetime:asc"
      )
      .then((activityRes) => {
        this.getCspActivties(activityRes);
      })
      .catch((error) => {
        console.log(error);
      });

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "loan-models"
      )
      .then((loanModelRes) => {
        this.setState({ loanModelData: loanModelRes.data });
      });

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/activitytypes"
      )
      .then((typeRes) => {
        this.setState({ activitytypeData: typeRes.data });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  getCspActivties(activityRes) {
    let filteredArray = [];
    activityRes.data.map((e, i) => {
      e.activityassignees.map((item) => {});
      e.activityassignees
        .filter((item) => item.contact === auth.getUserInfo().contact.id)
        .map((filteredData) => {
          filteredArray.push(e);
        });
    });
    this.setState({ activitiesData: filteredArray });
  }

  handleNameChange(event, value) {
    this.setState({
      filterLoaneeName: event.target.value,
    });
  }
  handlePurposeChange(event, value) {
    if (value !== null) {
      this.setState({ filterPurpose: value, isCancel: false });
    } else {
      this.setState({
        filterPurpose: "",
      });
    }
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

  handleActivitySearch() {
    let searchData = "";
    if (this.state.filterActType) {
      searchData += searchData ? "&&" : "";
      searchData += "activitytype.name=" + this.state.filterActType.name;
    }
    if (this.state.filterStartDate) {
      searchData += searchData ? "&&" : "";
      searchData +=
        "start_datetime_gte=" + this.state.filterStartDate.toISOString();
    }
    if (this.state.filterEndDate) {
      searchData += searchData ? "&&" : "";
      searchData +=
        "start_datetime_lte=" + this.state.filterEndDate.toISOString();
    }

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/activities/?" +
          searchData
      )
      .then((res) => {
        this.getCspActivties(res);
      });
  }

  handleLoanEMISearch() {
    let searchData = "";
    let memberId = 0;
    if (this.state.filterLoaneeName) {
      let searchName = "";
      searchName += searchName ? "&&" : "";
      searchName += "contact.name_contains=" + this.state.filterLoaneeName;

      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL + "loan-applications?" + searchName
        )
        .then((res) => {
          if (res.data.length) {
            memberId = res.data[0].id;
          }
          searchData += searchData ? "&&" : "";
          searchData += "loan_application.id=" + memberId;
          this.searchEmiAPI(searchData);
        });
    }

    if (this.state.filterPurpose) {
      searchData += searchData ? "&&" : "";
      searchData +=
        "loan_application.purpose=" + this.state.filterPurpose.product_name;
    }
    if (this.state.filterStartDate) {
      searchData += searchData ? "&&" : "";
      searchData +=
        "payment_date_gte=" + this.state.filterStartDate.toISOString();
    }
    if (this.state.filterEndDate) {
      searchData += searchData ? "&&" : "";
      searchData +=
        "payment_date_lte=" + this.state.filterEndDate.toISOString();
    }
    this.searchEmiAPI(searchData);
  }

  searchEmiAPI(searchData) {
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "loan-application-installments?" +
          searchData
      )
      .then((res) => {
        this.setState({ loanInstallmentData: res.data });
      });
  }

  cancelForm = () => {
    this.setState({
      filterActType: "",
      filterStartDate: "",
      filterEndDate: "",
      isCancel: true,
    });
    this.componentDidMount();
  };

  manageLoanEMIData(loanInstallmentData) {
    this.state.loanInstallmentData.map((ldata) => {
      if (ldata.loan_application.creator_id == auth.getUserInfo().contact.id) {
        if (ldata.actual_principal === null && ldata.actual_interest === null) {
          this.state.loanData.map((ld) => {
            // calculate pending loan amount
            let pendingAmount =
              ldata.expected_principal + ldata.expected_interest;
            ldata.pendingAmount = pendingAmount;

            // get Member name and EMI
            if (ld.id == ldata.loan_application.id) {
              ldata.loan_application.memName = ld.contact.name;
              ldata.emi = ld.loan_model.emi;
            }
          });
          loanInstallmentData.push(ldata);
        }
      }
    });
    // sort loan application installments by payment date
    loanInstallmentData.sort(
      (a, b) =>
        new Date(...a.payment_date.split("/").reverse()) -
        new Date(...b.payment_date.split("/").reverse())
    );
  }

  render() {
    const { classes } = this.props;
    let activitytypeData = this.state.activitytypeData;

    let dbLoanData, dbActivitiesData;
    if (this.props.location.state.loanEMIData) {
      dbLoanData = this.props.location.state.loanEMIData;
    }
    if (this.props.location.state.activitiesData) {
      dbActivitiesData = this.props.location.state.activitiesData;
    }

    const userInfo = auth.getUserInfo();
    let loanModelData = this.state.loanModelData;

    let loanInstallmentData = [];
    this.manageLoanEMIData(loanInstallmentData);

    let activitiesData = this.state.activitiesData;

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
            <div align="right">
              <Button color="primary" component={Link} to="/">
                Back
              </Button>
            </div>
            {dbLoanData ? <h3>EMI Due</h3> : null}
            {dbLoanData ? (
              <div className={classes.row}>
                <div className={classes.searchInput}>
                  <div className={classes.Districts}>
                    <Grid item md={12} xs={12}>
                      <Input
                        fullWidth
                        label="Name"
                        name="name"
                        variant="outlined"
                        onChange={(event, value) => {
                          this.handleNameChange(event, value);
                        }}
                        value={this.state.filterLoaneeName || ""}
                      />
                    </Grid>
                  </div>
                </div>
                <div className={classes.searchInput}>
                  <div className={classes.Districts}>
                    <Grid item md={12} xs={12}>
                      <Autocomplete
                        id="combo-box-demo"
                        options={loanModelData}
                        getOptionLabel={(option) => option.product_name}
                        onChange={(event, value) => {
                          this.handlePurposeChange(event, value);
                        }}
                        value={
                          this.state.filterPurpose
                            ? this.state.isCancel === true
                              ? null
                              : this.state.filterPurpose
                            : null
                        }
                        renderInput={(params) => (
                          <Input
                            {...params}
                            fullWidth
                            label="Purpose"
                            name="purpose"
                            variant="outlined"
                          />
                        )}
                      />
                    </Grid>
                  </div>
                </div>
                <div className={classes.searchInput}>
                  <div className={classes.Districts}>
                    <Grid item md={12} xs={12}>
                      <DateTimepicker
                        label="Start Date"
                        name="startDate"
                        value={this.state.filterStartDate || ""}
                        // format={"dd MMM yyyy"}
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
                      <DateTimepicker
                        label="End Date"
                        name="endDate"
                        value={this.state.filterEndDate || ""}
                        // format={"dd MMM yyyy"}
                        onChange={(event, value) =>
                          this.handleEndDateChange(event, value)
                        }
                      />
                    </Grid>
                  </div>
                </div>
                <Button onClick={this.handleLoanEMISearch.bind(this)}>
                  Search
                </Button>
                &nbsp;&nbsp;&nbsp;
                <Button color="secondary" clicked={this.cancelForm}>
                  reset
                </Button>
              </div>
            ) : null}
            {dbLoanData ? (
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
                pagination
              />
            ) : null}
          </Grid>
          <Grid>
            {dbActivitiesData ? <h3>Recent Activities</h3> : null}
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
                <div className={classes.searchInput}>
                  <div className={classes.Districts}>
                    <Grid item md={12} xs={12}>
                      <DateTimepicker
                        label="Start Date"
                        name="startDate"
                        value={this.state.filterStartDate || ""}
                        // format={"dd MMM yyyy"}
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
                      <DateTimepicker
                        label="End Date"
                        name="endDate"
                        value={this.state.filterEndDate || ""}
                        // format={"dd MMM yyyy"}
                        onChange={(event, value) =>
                          this.handleEndDateChange(event, value)
                        }
                      />
                    </Grid>
                  </div>
                </div>
                <Button onClick={this.handleActivitySearch.bind(this)}>
                  Search
                </Button>
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
                  "activitytype.remuneration",
                ]}
                column={Usercolumns1}
                editData={this.editData}
                rowsSelected={this.rowsSelect}
                columnsvalue={columnsvalue1}
                pagination
              />
            ) : null}
          </Grid>
        </Grid>
      </Layout>
    );
  }
}

export default withStyles(useStyles)(DashboardViewMoreDetailsCSP);
