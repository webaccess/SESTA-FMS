import React from "react";
import Table from "../../components/Datatable/Datatable.js";
import Layout from "../../hoc/Layout/Layout";
import * as serviceProvider from "../../api/Axios";
import Button from "../../components/UI/Button/Button";
import { withStyles, ThemeProvider } from "@material-ui/core/styles";
import style from "./Loanpurpose.module.css";
import { Link } from "react-router-dom";
import { Grid } from "@material-ui/core";
import Input from "../../components/UI/Input/Input";
import Snackbar from "../../components/UI/Snackbar/Snackbar";

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

export class Loanpurposes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Result: [],
      data: [],
      selectedid: 0,
      open: false,
      columnsvalue: [],
      DeleteData: false,
      properties: props,
      isCancel: false,
      filterProduct: "",
      singleDelete: "",
      multipleDelete: "",
    };

    let history = props;
  }
  async componentDidMount() {
    //api call for loanpurpose filter
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "loan-models/"
      )
      .then((res) => {
        this.setState({ data: res.data });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleChange = (event, value) => {
    this.setState({ filterProduct: event.target.value });
  };

  editData = (cellid) => {
    this.props.history.push("/loanpurpose/edit/" + cellid);
  };

  DeleteData = (cellid, selectedId) => {
    if (cellid.length !== null && selectedId < 1) {
      this.setState({ singleDelete: "", multipleDelete: "" });

      serviceProvider
        .serviceProviderForDeleteRequest(
          process.env.REACT_APP_SERVER_URL + "loan-models",
          cellid
        )
        .then((res) => {
          if (res.data.emidetails) {
            this.deleteEmiDet(res.data.emidetails);
          }
          if (res.data.loantasks) {
            this.deleteTaskDet(res.data.loantasks[0].id);
          }
          this.setState({ singleDelete: res.data.name });
          this.componentDidMount();
        })
        .catch((error) => {
          this.setState({ singleDelete: false });
          console.log(error.response);
        });
    }
  };

  deleteEmiDet = (emiDet) => {
    for (let i in emiDet) {
      serviceProvider
        .serviceProviderForDeleteRequest(
          process.env.REACT_APP_SERVER_URL + "emidetails",
          emiDet[i].id
        )
        .then((res) => {})
        .catch((error) => {
          console.log(error);
        });
    }
  };

  deleteTaskDet = (id) => {
    serviceProvider
      .serviceProviderForDeleteRequest(
        process.env.REACT_APP_SERVER_URL + "loantasks",
        id
      )
      .then((res) => {})
      .catch((error) => {
        console.log(error);
      });
  };
  DeleteAll = (selectedId) => {
    if (selectedId.length !== 0) {
      this.setState({ singleDelete: "", multipleDelete: "" });

      for (let i in selectedId) {
        serviceProvider
          .serviceProviderForDeleteRequest(
            process.env.REACT_APP_SERVER_URL + "loan-models",
            selectedId[i]
          )
          .then((res) => {
            if (res.data.emidetails) {
              this.deleteEmiDet(res.data.emidetails);
            }
            if (res.data.loantasks) {
              this.deleteTaskDet(res.data.loantasks[0].id);
            }
            this.setState({ multipleDelete: true });
            this.componentDidMount();
          })
          .catch((error) => {
            this.setState({ multipleDelete: false });
            console.log("err", error);
          });
      }
    }
  };
  cancelForm = () => {
    this.setState({
      filterProduct: "",
      isCancel: true,
    });

    this.componentDidMount();
  };

  handleSearch() {
    if (this.state.filterProduct) {
      //call api for searching product name
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "loan-models?product_name_contains=" +
            this.state.filterProduct
        )
        .then((res) => {
          this.setState({ data: res.data });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  render() {
    let data = this.state.data;
    if (this.state.data.length > 0) {
    }
    const Usercolumns = [
      {
        name: "Name of the Product",
        selector: "product_name",
        sortable: true,
      },
      {
        name: "Duration(months)",
        selector: "duration",
        sortable: true,
      },
      {
        name: "EMI",
        selector: "emi",
        sortable: true,
      },
      {
        name: "FPO",
        selector: "fpo.name",
        sortable: true,
      },
    ];

    let selectors = [];
    for (let i in Usercolumns) {
      selectors.push(Usercolumns[i]["selector"]);
    }

    let columnsvalue = selectors[0];
    const { classes } = this.props;

    return (
      <Layout>
        <Grid>
          <div className="App">
            <h1 className={style.title}>
              {" "}
              Manage Loan Purpose
              <div className={classes.floatRow}>
                <div className={classes.buttonRow}>
                  <Button
                    variant="contained"
                    component={Link}
                    to="/Loanpurpose/add"
                  >
                    Add Loan Purpose
                  </Button>
                </div>
              </div>
            </h1>
            {this.props.location.addData ? (
              <Snackbar severity="success">
                Loan Purpose added successfully.
              </Snackbar>
            ) : this.props.location.editData ? (
              <Snackbar severity="success">
                Loan Purpose edited successfully.
              </Snackbar>
            ) : null}
            {this.state.singleDelete !== false &&
            this.state.singleDelete !== "" &&
            this.state.singleDelete ? (
              <Snackbar severity="success" Showbutton={false}>
                Loan Purpose {this.state.singleDelete} deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.singleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === true ? (
              <Snackbar severity="success" Showbutton={false}>
                Loan Purposes deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            <div className={classes.row}>
              <div className={classes.searchInput}>
                <div className={style.Districts}>
                  <Grid item md={12} xs={12}>
                    <Input
                      fullWidth
                      label="Product Name"
                      name="filterProduct"
                      id="combo-box-demo"
                      value={this.state.filterProduct || ""}
                      onChange={this.handleChange.bind(this)}
                      variant="outlined"
                    />
                  </Grid>
                </div>
              </div>
              <br></br>
              <Button
                variant="contained"
                onClick={this.handleSearch.bind(this)}
              >
                Search
              </Button>
              &nbsp;&nbsp;&nbsp;
              <Button
                color="secondary"
                variant="contained"
                onClick={this.cancelForm.bind(this)}
              >
                Reset
              </Button>
            </div>
            {data ? (
              <Table
                title={"Loan Purposes"}
                filterData={true}
                showSearch={false}
                Searchplaceholder={"Search by loan purpose"}
                filterBy={["product_name", "duration", "emi", "FPO"]}
                data={data}
                column={Usercolumns}
                editData={this.editData}
                DeleteData={this.DeleteData}
                clearSelected={this.clearSelected}
                DeleteAll={this.DeleteAll}
                rowsSelected={this.rowsSelect}
                columnsvalue={columnsvalue}
                selectableRows
                DeleteMessage={"Are you Sure you want to Delete"}
              />
            ) : (
              <h1>Loading...</h1>
            )}
          </div>
        </Grid>
      </Layout>
    );
  }
}
export default withStyles(useStyles)(Loanpurposes);
