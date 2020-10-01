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
  menuName: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    margin: "0px",
  },
});
const SORT_FIELD_KEY = "_sort";

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
      isLoader: true,
      loanApp: [],
      values: {},
      purposeInUseSingleDelete: "",
      purposeInUseDeleteAll: "",
      deletePurposeName: "",
      /** pagination data */
      pageSize: "",
      totalRows: "",
      page: "",
      pageCount: "",
      resetPagination: false,
    };

    //let history = props;
  }
  async componentDidMount() {
    await this.getLoanModels(10, 1);

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "loan-applications/?_sort=id:ASC"
      )
      .then((res) => {
        this.setState({ loanApp: res.data });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  getLoanModels = async (pageSize, page, params = null) => {
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
          [SORT_FIELD_KEY]: "name:ASC",
        };
      }
      Object.keys(params).map((key) => {
        defaultParams[key] = params[key];
      });
      params = defaultParams;
    } else {
      params = {
        page: page,
        pageSize: pageSize,
        [SORT_FIELD_KEY]: "name:ASC",
      };
    }

    await serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "loan-models/get",
        params
      )
      .then((res) => {
        this.setState({
          data: res.data.result,
          isLoader: false,
          pageSize: res.data.pageSize,
          totalRows: res.data.rowCount,
          page: res.data.page,
          pageCount: res.data.pageCount,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  /** Pagination to handle row change*/
  handlePerRowsChange = async (perPage, page) => {
    if (formUtilities.checkEmpty(this.state.values)) {
      await this.getLoanModels(perPage, page);
    } else {
      await this.getLoanModels(perPage, page, this.state.values);
    }
  };

  /** Pagination to handle page change */
  handlePageChange = (page) => {
    if (formUtilities.checkEmpty(this.state.values)) {
      this.getLoanModels(this.state.pageSize, page);
    } else {
      this.getLoanModels(this.state.pageSize, page, this.state.values);
    }
  };

  /** Sorting */
  handleSort = (
    column,
    sortDirection,
    perPage = this.state.pageSize,
    page = 1
  ) => {
    if (column.selector === "product_name") {
      column.selector = "product_name";
    }
    if (column.selector === "fpo.name") {
      column.selector = "fpo.name";
    }
    if (column.selector === "duration") {
      column.selector = "duration";
    }
    if (column.selector === "emi") {
      column.selector = "emi";
    }
    this.state.values[SORT_FIELD_KEY] = column.selector + ":" + sortDirection;
    this.getLoanModels(perPage, page, this.state.values);
  };

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
      values: {
        ["product_name_contains"]: event.target.value,
      },
    });
  }

  editData = (cellid) => {
    this.props.history.push("/loanpurpose/edit/" + cellid);
  };

  DeleteData = (cellid, selectedId) => {
    if (cellid.length !== null && selectedId < 1) {
      this.setState({ singleDelete: "", multipleDelete: "" });

      let purposeInUseSingleDelete = false;
      this.state.loanApp.find((loandata) => {
        if (loandata.loan_model !== null) {
          if (loandata.loan_model.id === parseInt(cellid)) {
            this.setState({
              purposeInUseSingleDelete: true,
              deletePurposeName: loandata.purpose,
            });
            purposeInUseSingleDelete = true;
          }
        }
      });
      if (!purposeInUseSingleDelete) {
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
            this.setState({
              singleDelete: res.data.product_name,
              purposeInUseSingleDelete: res.data.product_name,
            });

            this.componentDidMount();
          })
          .catch((error) => {
            this.setState({ singleDelete: false });
            console.log(error.response);
          });
      }
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

      let purposeInUse = [];
      this.state.loanApp.map((loandata) => {
        if (loandata.loan_model !== null) {
          for (let i in selectedId) {
            if (parseInt(selectedId[i]) === loandata.loan_model.id) {
              purposeInUse.push(selectedId[i]);
              this.setState({ purposeInUseDeleteAll: true });
            }
            purposeInUse = [...new Set(purposeInUse)];
          }
        }
      });
      var deletePurpose = selectedId.filter(function (obj) {
        return purposeInUse.indexOf(obj) == -1;
      });

      for (let i in deletePurpose) {
        serviceProvider
          .serviceProviderForDeleteRequest(
            process.env.REACT_APP_SERVER_URL + "loan-models",
            deletePurpose[i]
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
            console.log(error);
          });
      }
    }
  };

  cancelForm = () => {
    this.setState({
      filterProduct: "",
      isCancel: true,
      isLoader: true,
    });

    this.componentDidMount();
  };

  handleSearch() {
    this.setState({ isLoader: true });
    this.getLoanModels(this.state.pageSize, this.state.page, this.state.values);
  }

  render() {
    let data = this.state.data;
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
        cell: (row) => (row.emi ? "₹" + row.emi.toLocaleString() : "-"),
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
            <h5 className={classes.menuName}>MASTER</h5>
            <div className={style.headerWrap}>
              <h2 className={style.title}>Manage Loan Purpose</h2>
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
            {this.state.multipleDelete === true &&
            //? (
            this.state.purposeInUseDeleteAll !== true ? (
              <Snackbar severity="success" Showbutton={false}>
                Loan Purposes deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            {this.state.purposeInUseSingleDelete === true ? (
              <Snackbar severity="info" Showbutton={false}>
                Loan Purpose {this.state.deletePurposeName} is in use, it can
                not be Deleted.
              </Snackbar>
            ) : null}
            {this.state.purposeInUseDeleteAll === true ? (
              <Snackbar severity="info" Showbutton={false}>
                Some Loan purposes are in use hence it can not be Deleted.
              </Snackbar>
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
              <Button
                style={{ marginRight: "5px", marginBottom: "8px" }}
                variant="contained"
                onClick={this.handleSearch.bind(this)}
              >
                Search
              </Button>
              <Button
                style={{ marginBottom: "8px" }}
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
                filterData={false}
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
          </div>
        </Grid>
      </Layout>
    );
  }
}
export default withStyles(useStyles)(Loanpurposes);
