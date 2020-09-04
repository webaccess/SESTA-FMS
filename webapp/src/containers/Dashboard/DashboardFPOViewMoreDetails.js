import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import { withStyles } from "@material-ui/core/styles";
import * as serviceProvider from "../../api/Axios";
import Table from "../../components/Datatable/Datatable.js";
import { Grid, Card } from "@material-ui/core";
import Moment from "moment";
import Input from "../../components/UI/Input/Input";
import Datepicker from "../../components/UI/Datepicker/Datepicker.js";
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
    marginBottom: "8px",
  },
  Districts: {
    marginRight: theme.spacing(1),
    width: "230px",
  },
});

class DashboardFPOViewMoreDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterStartDate: "",
      filterEndDate: "",
      isCancel: false,
      loanData: [],
    };
  }

  async componentDidMount() {
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "loan-applications" +
          "?status=Approved"
      )
      .then((res) => {
        this.getAllDetails(res.data);
      })
      .catch((error) => {});
  }

  getAllDetails = (data) => {
    let loansDetails = [];
    let outstandingAmount = 0;
    data.map((e, i) => {
      let emiPaid = 0;
      e.loan_app_installments.map((emi, index) => {
        let totalPaid = emi.actual_principal + emi.actual_interest;
        emiPaid += totalPaid;
      });
      outstandingAmount = e.loan_model.loan_amount - emiPaid;
      loansDetails.push({
        memberName: e.contact.name,
        loanAmount: e.loan_model.loan_amount,
        outstandingAmount: outstandingAmount,
        loanDate: e.application_date,
      });
    });

    // sort loanDetails with latest date first
    loansDetails.sort(
      (a, b) =>
        new Date(...b.loanDate.split("/").reverse()) -
        new Date(...a.loanDate.split("/").reverse())
    );
    this.setState({
      loanData: loansDetails,
    });
  };

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

  handleMemberChange(event, value) {
    this.setState({
      memberName: event.target.value,
    });
  }

  handleSearch() {
    let searchData = "";
    if (this.state.memberName) {
      searchData += searchData ? "&&" : "";
      searchData += "contact.name_contains=" + this.state.memberName;
    }
    if (this.state.filterStartDate) {
      searchData += searchData ? "&&" : "";
      searchData +=
        "application_date_gte=" + this.state.filterStartDate.toISOString();
    }
    if (this.state.filterEndDate) {
      searchData += searchData ? "&&" : "";
      searchData +=
        "application_date_lte=" + this.state.filterEndDate.toISOString();
    }

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "loan-applications/?status=Approved&&" +
          searchData
      )
      .then((res) => {
        this.getAllDetails(res.data);
      });
  }

  cancelForm = () => {
    this.setState({
      filterStartDate: "",
      filterEndDate: "",
      memberName: "",
      isCancel: true,
    });
    this.componentDidMount();
  };

  render() {
    const { classes } = this.props;
    let loanData = this.props.location.loanData;
    loanData = this.state.loanData;
    const loanColumns = [
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
    for (let i in loanColumns) {
      selectors.push(loanColumns[i]["selector"]);
    }
    let columnsvalue = selectors[0];

    return (
      <Layout>
        <Grid>
          <Grid>
            <div>
              <h3>
                Loans
                <div align="right">
                  <Button color="primary" component={Link} to="/">
                    Back
                  </Button>
                </div>
              </h3>
            </div>
            <div className={classes.row} style={{flexWrap: "wrap", height: "auto",}}>
              <div className={classes.searchInput}>
                <div className={classes.Districts}>
                  <Grid item md={12} xs={12}>
                    <Input
                      fullWidth
                      label="Member Name"
                      name="memberName"
                      variant="outlined"
                      onChange={(event, value) => {
                        this.handleMemberChange(event, value);
                      }}
                      value={this.state.memberName || ""}
                    />
                  </Grid>
                </div>
              </div>
              <div className={classes.searchInput}>
                <div className={classes.Districts}>
                  <Grid item md={12} xs={12}>
                    <Datepicker
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
              </div>
              <div className={classes.searchInput}>
                <div className={classes.Districts}>
                  <Grid item md={12} xs={12}>
                    <Datepicker
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
              </div>
              <Button
                style={{ marginRight: "5px", marginBottom: "8px", }}
                onClick={this.handleSearch.bind(this)}>Search</Button>
              <Button
                style={{ marginRight: "5px", marginBottom: "8px", }}
                color="secondary" clicked={this.cancelForm}>
                reset
              </Button>
            </div>

            {loanData ? (
              <Table
                title={"FPO Loans"}
                data={loanData}
                showSearch={false}
                filterData={false}
                filterBy={["memberName", "loanAmount", "loanDate"]}
                column={loanColumns}
                editData={this.editData}
                rowsSelected={this.rowsSelect}
                columnsvalue={columnsvalue}
                pagination
              />
            ) : null}
          </Grid>
        </Grid>
      </Layout>
    );
  }
}
export default withStyles(useStyles)(DashboardFPOViewMoreDetails);
