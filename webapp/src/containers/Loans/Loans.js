import React from "react";
import axios from "axios";
import { withStyles } from "@material-ui/core/styles";
import Layout from "../../hoc/Layout/Layout";
import { Grid } from "@material-ui/core";
import style from "./Loans.module.css";
import Input from "../../components/UI/Input/Input";
import Autocomplete from "../../components/Autocomplete/Autocomplete";
import Button from "../../components/UI/Button/Button";
import Table from "../../components/Datatable/Datatable.js";
import auth from "../../components/Auth/Auth.js";


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
      getSHG: [],
      getStatus: [
        {'id':1, 'name': 'UnderReview'},
        {'id':2, 'name': 'Approved'},
        {'id':3, 'name': 'Denied'},
        {'id':4, 'name': 'Cancelled'}
      ],
      loanStatus: [],
      isCancel: false,
      values: {},
      filterStatus : "",
      properties: props,
     };
  }

  async componentDidMount() {
    await axios
      .get(process.env.REACT_APP_SERVER_URL + "loan-applications", {
        headers: {
          Authorization: "Bearer " + auth.getToken() + "",
        },
      })
      .then((res) => {
        this.setState({ data: res.data });
      });

    await axios
      .get(process.env.REACT_APP_SERVER_URL + "loan-application-tasks", {
        headers: {
          Authorization: "Bearer " + auth.getToken() + "",
        },
      })
      .then((res) => {
        this.setState({ loanStatus: res.data });
      });
  }

  handleSearch() {
    let searchData = "";
    if (this.state.values.addMember) {
      searchData += "loan_model.product_name_contains=" + this.state.values.addMember + "&&";
    }
    if (this.state.filterStatus) {
      searchData += "status=" + this.state.filterStatus.name;
    }
    axios
      .get(
        process.env.REACT_APP_SERVER_URL +
          "loan-applications?" +
          searchData ,
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + "",
          },
        }
      )
      .then((res) => {
        this.setState({ data: res.data });
      })
      .catch((err) => {
        console.log("err", err);
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
  handleStatusChange= async (event, value) => {
    if (value !== null) {
      this.setState({ filterStatus: value, isCancel: false });
    } else {
      this.setState({ filterStatus: "" });
    }
  }
  viewMemberData() {
    // this.props.history.push("/villages/edit/" + cellid);
  }

  viewData = (cellid) => {
    // this.props.history.push("/loans/view" + cellid);
    this.props.history.push("/loans/view/:id");
  };

  render() {
    const { classes } = this.props;
    let data = this.state.data;
    let loanStatus = this.state.loanStatus;
    let shgFilter = this.state.getSHG;
    let statusFilter = this.state.getStatus;
    let filterStatus = this.state.filterStatus;
    let filters = this.state.values;
    const Usercolumns = [
      {
        name: "Member Name",
        selector: "loan_model.product_name",
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
      // {
      //   name: "Amount Due",
      //   selector: "loan.amount_due",
      //   sortable: true,
      // },
      {
        name: "Installment Date",
        selector: "loan_application_installment.payment_date",
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
            LOAN
            <h1 className={style.title}>
              Manage Loan Application
            </h1>
          </div>

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
                    value={""}
                    renderInput={(params) => (
                      <Input
                        {...params}
                        fullWidth
                        label="SHG Name"
                        name="shgName"
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
                          :filterStatus
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
              // noDataComponent={"No Records To be shown"}
              Searchplaceholder={"Seacrh by Product name"}
              filterBy={["loan_model.product_name", "purpose", "application_date", "loan_model.loan_amount", "status", "loan_application_installment.payment_date"]}
              filters={filters}
              data={data}
              column={Usercolumns}
              // viewMemberData={this.viewMemberData}
              viewData={this.viewData}
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