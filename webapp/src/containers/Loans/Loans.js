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
    };
  }

  async componentDidMount() {
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "loan-applications"
      )
      .then((res) => {
        this.getFormattedData(res.data);
      });

    // get all SHGs
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/contact/?contact_type=organization&&organization.sub_type=SHG"
      )
      .then((res) => {
        this.setState({ getShg: res.data });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  getFormattedData = (data) => {
    let amount_due;
    data.map((loandata) => {
      loandata.application_date = Moment(loandata.application_date).format(
        "DD MMM YYYY"
      );

      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "loan-models/?id=" +
            loandata.loan_model.id
        )
        .then((res) => {
          // this.setState({ getShg: res.data });
        });
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
    // if (this.state.filterShg) {
    //   searchData += searchData ? "&&" : "";
    //   searchData += "individual.shg=" + this.state.filterShg.id;
    // }
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "loan-applications?" + searchData
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

  viewData = (cellid) => {
    // this.props.history.push("/loans/view" + cellid);
    this.props.history.push("/loans/view/:id");
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
    // this.state.data.map((memData) => {
    //   if (cellid == memData.id) {
    //     memberData = memData;
    //   }
    // });
    // serviceProvider
    //   .serviceProviderForGetRequest(
    //     process.env.REACT_APP_SERVER_URL + "loan-applications-print/" + cellid
    //   )
    //   .then((res) => {
    //     console.log("done here");
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
    window.location.href =
      process.env.REACT_APP_SERVER_URL + "loan-applications-print/" + cellid;
    // this.props.history.push(
    //   process.env.REACT_APP_SERVER_URL + "loan-applications-print/" + cellid
    // );
  };

  render() {
    const { classes } = this.props;
    let data = this.state.data;
    console.log("data ==>", data);

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
        name: "Amount Due",
        selector: "loan_app_installments.amount_due",
        sortable: true,
      },
      {
        name: "Installment Date",
        selector: "loan_app_installments.payment_date",
        sortable: true,
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
            {/* <div className={classes.searchInput}>
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
            </div> */}
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
                "loan_app_installments.amount_due",
                "loan_app_installments.payment_date",
              ]}
              filters={filters}
              data={data}
              column={Usercolumns}
              // viewMemberData={this.viewMemberData}
              viewData={this.viewData}
              customAction={this.customAction}
              // editData={this.editData}
              DeleteData={this.DeleteData}
              DeleteAll={this.DeleteAll}
              rowsSelected={this.rowsSelect}
              columnsvalue={columnsvalue}
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
