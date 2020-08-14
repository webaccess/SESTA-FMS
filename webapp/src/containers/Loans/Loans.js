import React from "react";
import * as serviceProvider from "../../api/Axios";
import { withStyles } from "@material-ui/core/styles";
import Layout from "../../hoc/Layout/Layout";
import { Grid } from "@material-ui/core";
import style from "./Loans.module.css";
import Input from "../../components/UI/Input/Input";
import Autocomplete from "../../components/Autocomplete/Autocomplete";
import Button from "../../components/UI/Button/Button";
import Table from "../../components/Datatable/Datatable.js";
import auth from "../../components/Auth/Auth.js";
import Moment from "moment";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import { Link } from "react-router-dom";
import Auth from "../../components/Auth/Auth.js";

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
});

const conditionalRowStyles = [
  {
    when: (row) => row.status == "Approved",
    style: {
      backgroundColor: "#c9e7b1",
      color: "black",
      "&:hover": {
        backgroundColor: "#bce09e",
        cursor: "pointer",
      },
    },
  },
  {
    when: (row) => row.status == "UnderReview",
    style: {
      backgroundColor: "#ffd6cc",
      color: "black",
      "&:hover": {
        backgroundColor: "#ffc2b3",
        cursor: "pointer",
      },
    },
  },
  {
    when: (row) => row.status == "Denied" || row.status == "Cancelled",
    style: {
      backgroundColor: "#d7dbdb",
      color: "black",
      "&:hover": {
        backgroundColor: "#c9cfcf",
        cursor: "pointer",
      },
    },
  },
];
export class Loans extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      getShg: [],
      getStatus: [
        { id: 1, name: "UnderReview" },
        { id: 2, name: "Approved" },
        { id: 3, name: "Denied" },
        { id: 4, name: "Cancelled" },
      ],
      loanStatus: [],
      isCancel: false,
      values: {},
      filterStatus: "",
      filterShg: "",
      loggedInUserRole: auth.getUserInfo().role.name,
    };
  }

  async componentDidMount() {
    console.log("auth--", auth.getUserInfo());
    let url = "loan-applications";
    // if (
    //   this.state.loggedInUserRole === "FPO Admin" ||
    //   this.state.loggedInUserRole === "CSP (Community Service Provider)"
    // ) {
    //   url += "&&creator_id=" + auth.getUserInfo().contact.id;
    // }
    serviceProvider
      .serviceProviderForGetRequest(process.env.REACT_APP_SERVER_URL + url)
      .then((res) => {
        console.log("--res--", res.data);
        this.getFormattedData(res.data);
      });

    // get all SHGs
    let getShgurl =
      "crm-plugin/contact/?contact_type=organization&organization.sub_type=SHG&&_sort=name:ASC";
    if (this.state.loggedInUserRole === "FPO Admin") {
      url += "&creator_id=" + auth.getUserInfo().contact.id;
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL + getShgurl
        )
        .then((res) => {
          this.setState({ getShg: res.data });
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (
      this.state.loggedInUserRole === "CSP (Community Service Provider)"
    ) {
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/contact/?individual=" +
            auth.getUserInfo().contact.individual
        )
        .then((res) => {
          serviceProvider
            .serviceProviderForGetRequest(
              process.env.REACT_APP_SERVER_URL +
                "crm-plugin/contact/?id=" +
                res.data[0].individual.vo
            )
            .then((response) => {
              this.setState({ getShg: response.data[0].org_vos });
            });
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL + getShgurl
        )
        .then((res) => {
          this.setState({ getShg: res.data });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  getFormattedData = (data) => {
    data.map((loandata) => {
      loandata.application_date = Moment(loandata.application_date).format(
        "DD MMM YYYY"
      );
      loandata.loan_model.loan_amount = loandata.loan_model.loan_amount.toLocaleString();
      if (
        loandata.loan_app_installments.length > 0 &&
        loandata.status == "Approved"
      ) {
        let loanDueId = loandata.loan_app_installments.length - 1;
        let loanDueData = loandata.loan_app_installments[loanDueId];
        loandata.amount_due = (
          loanDueData.expected_interest + loanDueData.expected_principal
        ).toLocaleString();
        loandata.payment_date = Moment(loanDueData.payment_date).format(
          "DD MMM YYYY"
        );

        let paid = 0;
        loandata.loan_app_installments.map((emidata) => {
          if (emidata.fine !== null || emidata.fine !== 0) {
            emidata.totalPaid =
              emidata.fine + emidata.actual_principal + emidata.actual_interest;
          } else {
            emidata.totalPaid =
              emidata.actual_principal + emidata.actual_interest;
          }
          let totalLoanAmnt =
            emidata.expected_principal + emidata.expected_interest;
          emidata.outstanding = (
            totalLoanAmnt -
            (emidata.actual_principal + emidata.actual_interest)
          ).toLocaleString();

          paid = paid + emidata.totalPaid;
        });

        let totalamount = parseInt(
          loandata.loan_model.loan_amount.replace(/,/g, "")
        );
        let outstandingAmount = totalamount - paid;

        if (outstandingAmount < 0) {
          loandata.outstandingAmount = 0;
        }
        loandata.outstandingAmount = outstandingAmount.toLocaleString();
      }
    });
    this.setState({ data: data });
  };

  handleSearch() {
    let searchData = "";
    if (this.state.values.addMember) {
      searchData += searchData ? "&&" : "";
      searchData += "contact.name_contains=" + this.state.values.addMember;
    }
    if (this.state.filterStatus) {
      searchData += searchData ? "&&" : "";
      searchData += "status=" + this.state.filterStatus.name;
    }
    this.searchData(searchData);
    if (this.state.filterShg) {
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/individuals/?shg.id=" +
            this.state.filterShg.id
        )
        .then((res) => {
          if (res.data.length > 0) {
            res.data.map((shgcontact) => {
              if (
                shgcontact.shg.id &&
                this.state.filterShg.id === shgcontact.shg.id
              ) {
                searchData += searchData ? "&&" : "";
                searchData += "contact.id=" + shgcontact.contact.id;
                this.searchData(searchData);
              }
            });
          } else {
            searchData += searchData ? "&&" : "";
            searchData += "contact.id=" + 0;
            this.searchData(searchData);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  searchData(searchData) {
    let url = "loan-applications";
    // if (
    //   this.state.loggedInUserRole === "FPO Admin" ||
    //   this.state.loggedInUserRole === "CSP (Community Service Provider)"
    // ) {
    //   url += "&&creator_id=" + auth.getUserInfo().contact.id;
    // }
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + url + "&&" + searchData
      )
      .then((res) => {
        this.getFormattedData(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  cancelForm = () => {
    this.setState({
      values: {},
      formSubmitted: "",
      isCancel: true,
    });
    this.componentDidMount();
    //routing code #route to loan_application_list page
  };

  handleMemberChange(event, value) {
    this.setState({
      values: { ...this.state.values, [event.target.name]: event.target.value },
    });
  }

  handleStatusChange = async (event, value) => {
    if (value !== null) {
      this.setState({ filterStatus: value, isCancel: false });
    } else {
      this.setState({ filterStatus: "" });
    }
  };

  viewTask = (cellid) => {
    let loanAppData;
    this.state.data.map((e) => {
      if (e.id == cellid) {
        loanAppData = e;
        this.props.history.push("/loan/update/" + cellid, {
          loanAppData: loanAppData,
        });
      }
    });
  };

  viewEmi = (cellid) => {
    let loanAppData;
    this.state.data.map((e) => {
      if (e.id == cellid) {
        loanAppData = e;
        this.props.history.push("/loans/emi/" + cellid, {
          loanAppData: loanAppData,
        });
      }
    });
  };

  viewLoanEmi = (cellid) => {
    let loanAppData;
    this.state.data.map((e) => {
      if (e.id == cellid) {
        loanAppData = e;
        this.props.history.push("/loan/emi/view/" + cellid, {
          loanAppData: loanAppData,
        });
      }
    });
  };

  loanApproveData = (cellid) => {
    let loanAppData;
    this.state.data.map((item) => {
      if (cellid == item.id) {
        loanAppData = item;
      }
    });
    this.props.history.push("/loans/approve/" + cellid, loanAppData);
  };

  handleShgChange(event, value) {
    if (value !== null) {
      this.setState({ filterShg: value, isCancel: false });
    } else {
      this.setState({
        filterShg: "",
      });
    }
  }

  customAction = (cellid) => {
    let memberData;
    let token = Auth.getToken();
    serviceProvider
      .serviceProviderForGetRequestDownloadPDFFile(
        process.env.REACT_APP_SERVER_URL + "loan-applications-print/" + cellid
      )
      .then((res) => {
        console.log("done here");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    const { classes } = this.props;
    let data = this.state.data;
    let shgFilter = this.state.getShg;
    let filterShg = this.state.filterShg;
    let statusFilter = this.state.getStatus;
    let filterStatus = this.state.filterStatus;
    let filters = this.state.values;
    const Usercolumns = [
      {
        name: "Member Name",
        selector: "contact.name",
        sortable: true,
      },
      {
        name: "Purpose",
        selector: "purpose",
        sortable: true,
      },
      {
        name: "Application Date",
        selector: "application_date",
        sortable: true,
      },
      {
        name: "Amount",
        selector: "loan_model.loan_amount",
        sortable: true,
      },
      {
        name: "Status",
        selector: "status",
        sortable: true,
      },
      {
        name: "Outstanding amount",
        selector: "outstandingAmount",
        sortable: true,
        cell: (row) => (row.outstandingAmount ? row.outstandingAmount : "-"),
      },
      {
        name: "Amount Due",
        selector: "amount_due",
        sortable: true,
        cell: (row) => (row.amount_due ? row.amount_due : "-"),
      },
      {
        name: "Installment Date",
        selector: "payment_date",
        sortable: true,
        cell: (row) => (row.payment_date ? row.payment_date : "-"),
      },
    ];
    let selectors = [];
    for (let i in Usercolumns) {
      selectors.push(Usercolumns[i]["selector"]);
    }
    let columnsvalue = selectors[0];
    let loanState = {};
    if (this.props.location.state) {
      loanState = this.props.location.state;
    }
    return (
      <Layout>
        <Grid>
          <div className="App">
            LOAN
            <h1 className={style.title}>Manage Loan Application</h1>
          </div>

          {loanState.loanApplied ? (
            <Snackbar severity="success">
              You have successfully applied for the loan{" "}
              <b>{loanState.purpose}</b>
            </Snackbar>
          ) : null}
          {loanState.loanAlreadyApplied ? (
            <Snackbar severity="info">
              You have already applied loan for the Purpose{" "}
              <b>{loanState.purpose}</b>
            </Snackbar>
          ) : null}
          {loanState.activeLoanPresent ? (
            <Snackbar severity="info">
              You already have one active loan.
            </Snackbar>
          ) : null}
          {loanState.loanNotApplied ? (
            <Snackbar severity="error">
              An error occured - Please try again later!
            </Snackbar>
          ) : null}
          {loanState.loanApproved ? (
            <Snackbar severity="success">Changes saved successfully</Snackbar>
          ) : null}

          <br></br>
          <div className={classes.row}>
            <div className={classes.searchInput}>
              <div className={style.Districts}>
                <Grid item md={12} xs={12}>
                  <Input
                    fullWidth
                    label="Member"
                    name="addMember"
                    variant="outlined"
                    onChange={(event, value) => {
                      this.handleMemberChange(event, value);
                    }}
                    value={this.state.values.addMember || ""}
                  />
                </Grid>
              </div>
            </div>
            <div className={classes.searchInput}>
              <div className={style.Districts}>
                <Grid item md={12} xs={12}>
                  <Autocomplete
                    id="combo-box-demo"
                    options={shgFilter}
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => {
                      this.handleShgChange(event, value);
                    }}
                    value={
                      filterShg
                        ? this.state.isCancel === true
                          ? null
                          : filterShg
                        : null
                    }
                    renderInput={(params) => (
                      <Input
                        {...params}
                        fullWidth
                        label="SHG Name"
                        name="filterShg"
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
              </div>
            </div>
            <div className={classes.searchInput}>
              <div className={style.Districts}>
                <Grid item md={12} xs={12}>
                  <Autocomplete
                    id="combo-box-demo"
                    options={statusFilter}
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => {
                      this.handleStatusChange(event, value);
                    }}
                    value={
                      filterStatus
                        ? this.state.isCancel === true
                          ? null
                          : filterStatus
                        : null
                    }
                    renderInput={(params) => (
                      <Input
                        {...params}
                        fullWidth
                        label="Select Status"
                        name="selectStatus"
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
              </div>
            </div>
            <br></br>
            <Button onClick={this.handleSearch.bind(this)}>Search</Button>
            &nbsp;&nbsp;&nbsp;
            <Button color="secondary" clicked={this.cancelForm}>
              reset
            </Button>
          </div>

          {data ? (
            <Table
              title={"Loans"}
              showSearch={false}
              filterData={true}
              Searchplaceholder={"Seacrh by Member name"}
              filterBy={[
                "contact.name",
                "purpose",
                "application_date",
                "loan_model.loan_amount",
                "status",
                "outstandingAmount",
                "amount_due",
                "payment_date",
              ]}
              filters={filters}
              data={data}
              column={Usercolumns}
              loanApproveData={this.loanApproveData}
              customAction={this.customAction}
              viewTask={this.viewTask}
              viewEmi={this.viewEmi}
              viewLoanEmi={this.viewLoanEmi}
              DeleteData={this.DeleteData}
              DeleteAll={this.DeleteAll}
              rowsSelected={this.rowsSelect}
              columnsvalue={columnsvalue}
              conditionalRowStyles={conditionalRowStyles}
              DeleteMessage={"Are you Sure you want to Delete"}
            />
          ) : (
            <h1>Loading...</h1>
          )}
        </Grid>
      </Layout>
    );
  }
}

export default withStyles(useStyles)(Loans);
