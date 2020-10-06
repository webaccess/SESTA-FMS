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
import * as constants from "../../constants/Constants";
import * as formUtilities from "../../utilities/FormUtilities";

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
    marginBottom: "8px",
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
    when: (row) => row.status == "Approved" || row.status == "InProgress",
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
const SORT_FIELD_KEY = "_sort";
export class Loans extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      getShg: [],
      getStatus: constants.LOAN_STATUS,
      isCancel: false,
      values: {},
      filterStatus: "",
      filterShg: "",
      loggedInUserRole: auth.getUserInfo().role.name,
      isLoader: true,
      myArray: []
    };
  }

  async componentDidMount() {
    await this.getLoanAppDetails(10, 1);

    // get all SHGs
    let getShgurl =
      "crm-plugin/contact/?contact_type=organization&organization.sub_type=SHG&_sort=name:ASC";
    if (this.state.loggedInUserRole === "FPO Admin") {
      getShgurl += "&creator_id=" + auth.getUserInfo().contact.id;
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

  getLoanAppDetails = async (pageSize, page, params = null, type) => {
    if (params !== null && !formUtilities.checkEmpty(params)) {
      let defaultParams = {};
      if (params.hasOwnProperty(SORT_FIELD_KEY)) {
        defaultParams = {
          page: page,
          pageSize: pageSize,
        };
      } else {
        defaultParams = {
          page: page,
          pageSize: pageSize,
          [SORT_FIELD_KEY]: "status:DESC",
        };
      }
      let str = "";
      Object.keys(params).map((key) => {
        defaultParams[key] = params[key];
      });
      params = defaultParams;
    } else {
      params = {
        page: page,
        pageSize: pageSize,
        [SORT_FIELD_KEY]: "status:DESC",
      };
    }

    if (params.hasOwnProperty("addMember")) {
      delete params.addMember;
    }
    let url = "loan-applications/get";
    if (
      // this.state.loggedInUserRole === "FPO Admin" ||
      this.state.loggedInUserRole === "CSP (Community Service Provider)"
    ) {
      url += "?creator_id=" + auth.getUserInfo().contact.id;
      if (type === "search" && this.state.filterShg) {
        url += "&id=" + this.state.filterShg.contact;
      }
    } else {
      if (type === "search" && this.state.filterShg) {
        url += "/?id=" + this.state.filterShg.id;
      }
    }
    serviceProvider
      .serviceProviderForGetRequest(process.env.REACT_APP_SERVER_URL + url, params)
      .then((res) => {
        this.setState({
          pageSize: res.data.pageSize,
          totalRows: res.data.rowCount,
          page: res.data.page,
          pageCount: res.data.pageCount,
        });
        this.getFormattedData(res.data.result);
      });
  }

  getFormattedData = (data) => {
    data.map((loandata) => {
      loandata.application_date = Moment(loandata.application_date).format(
        "DD MMM YYYY"
      );
      loandata.loan_model.loan_amount = loandata.loan_model.loan_amount.toLocaleString();

      //sort installments date by id
      if (loandata.loan_app_installments.length > 0) {
        loandata.loan_app_installments.sort(
          (a, b) =>
            new Date(...a.payment_date.split("/").reverse()) -
            new Date(...b.payment_date.split("/").reverse())
        );
      }

      if (
        loandata.loan_app_installments.length > 0 &&
        loandata.status == "Approved" || loandata.status == "InProgress" || loandata.status == "Completed"
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
    this.setState({ data: data, isLoader: false });
  };

  /** Pagination to handle row change*/
  handlePerRowsChange = async (perPage, page) => {
    this.setState({ isLoader: true });
    if (formUtilities.checkEmpty(this.state.values)) {
      await this.getLoanAppDetails(perPage, page);
    } else {
      await this.getLoanAppDetails(perPage, page, this.state.values);
    }
  };

  /** Pagination to handle page change */
  handlePageChange = (page) => {
    this.setState({ isLoader: true });
    if (formUtilities.checkEmpty(this.state.values)) {
      this.getLoanAppDetails(this.state.pageSize, page);
    } else {
      this.getLoanAppDetails(this.state.pageSize, page, this.state.values);
    }
  };

  /** Sorting */
  handleSort = (
    column,
    sortDirection,
    perPage = this.state.pageSize,
    page = 1
  ) => {
    if (column.selector === "contact.name") {
      column.selector = "contact.name";
    }
    if (column.selector === "purpose") {
      column.selector = "purpose";
    }
    if (column.selector === "application_date") {
      column.selector = "application_date";
    }
    if (column.selector === "loan_model.loan_amount") {
      column.selector = "loan_model.loan_amount";
    }
    if (column.selector === "status") {
      column.selector = "status";
    }
    if (column.selector === "outstandingAmount") {
      column.selector = "outstandingAmount";
    }
    if (column.selector === "amount_due") {
      column.selector = "amount_due";
    }
    if (column.selector === "payment_date") {
      column.selector = "payment_date";
    }
    this.state.values[SORT_FIELD_KEY] = column.selector + ":" + sortDirection;
    this.getLoanAppDetails(perPage, page, this.state.values);
  };

  handleSearch() {
    this.getLoanAppDetails(this.state.pageSize, this.state.page, this.state.values, "search");
  }

  cancelForm = () => {
    this.setState({
      values: {},
      filterStatus: "",
      formSubmitted: "",
      filterShg: "",
      isCancel: true,
      isLoader: true,
    });
    this.componentDidMount();
    //routing code #route to loan_application_list page
  };

  handleMemberChange(event, value) {
    this.setState({
      values: {
        ...this.state.values,
        [event.target.name]: event.target.value,
        ["contact.name_contains"]: event.target.value
      }
    });
  }

  handleShgChange(event, value) {
    if (value !== null) {
      this.setState({
        filterShg: value, isCancel: false,
      });
    } else {
      this.setState({
        filterShg: "",
        values: { ...this.state.values }
      });
    }
  }

  handleStatusChange = async (event, value) => {
    if (value !== null) {
      this.setState({
        filterStatus: value, isCancel: false,
        values: { ...this.state.values, ["status"]: value.id },
      });
    } else {
      this.setState({ filterStatus: "", values: { ...this.state.values } });
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

  customAction = (cellid) => {
    let memberData;
    let token = Auth.getToken();
    serviceProvider
      .serviceProviderForGetRequestDownloadPDFFile(
        process.env.REACT_APP_SERVER_URL + "loan-applications-print/" + cellid
      )
      .then((res) => { })
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
        cell: (row) => "₹" + row.loan_model.loan_amount,
      },
      {
        name: "Status",
        selector: "status",
        sortable: true,
        cell: (row) => this.state.getStatus.map(status => {
          if (status.id === row.status) {
            return status.name;
          }
        })
      },
      {
        name: "Outstanding amount",
        selector: "outstandingAmount",
        sortable: true,
        cell: (row) =>
          row.outstandingAmount ? "₹" + row.outstandingAmount : "-",
      },
      {
        name: "Amount Due",
        selector: "amount_due",
        sortable: true,
        cell: (row) => (row.amount_due ? "₹" + row.amount_due : "-"),
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
            <h5 className={style.loan}>LOANS</h5>
            <h2 className={style.title}>Manage Loan Application</h2>
          </div>

          {this.props.location.loanApplied ? (
            <Snackbar severity="success">
              You have successfully applied for the loan{" "}
              <b>{loanState.purpose}</b>
            </Snackbar>
          ) : null}
          {this.props.location.loanAlreadyApplied ? (
            <Snackbar severity="info">
              You have already applied loan for the Purpose{" "}
              <b>{loanState.purpose}</b>
            </Snackbar>
          ) : null}
          {this.props.location.activeLoanPresent ? (
            <Snackbar severity="info">
              You already have one active loan.
            </Snackbar>
          ) : null}
          {this.props.location.loanNotApplied ? (
            <Snackbar severity="error">
              An error occured - Please try again later!
            </Snackbar>
          ) : null}
          {this.props.location.loanApproved ? (
            <Snackbar severity="success">Changes saved successfully</Snackbar>
          ) : null}

          <div
            className={classes.row}
            style={{ flexWrap: "wrap", height: "auto" }}
          >
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
            <Button
              onClick={this.handleSearch.bind(this)}
              style={{ marginRight: "5px", marginBottom: "8px" }}
            >
              Search
            </Button>
            <Button
              color="secondary"
              clicked={this.cancelForm}
              style={{ marginBottom: "8px" }}
            >
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
              pagination
              paginationServer
              paginationDefaultPage={this.state.page}
              paginationPerPage={this.state.pageSize}
              paginationTotalRows={this.state.totalRows}
              paginationRowsPerPageOptions={[10, 15, 20, 25, 30]}
              paginationResetDefaultPage={this.state.resetPagination}
              onChangeRowsPerPage={this.handlePerRowsChange}
              onChangePage={this.handlePageChange}
              onSort={this.handleSort}
              sortServer={true}
              progressComponent={this.state.isLoader}
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
