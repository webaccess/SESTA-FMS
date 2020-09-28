import React from "react";
import * as serviceProvider from "../../api/Axios";
import Table from "../../components/Datatable/Datatable.js";
import Layout from "../../hoc/Layout/Layout";
import Button from "../../components/UI/Button/Button";
import { withStyles } from "@material-ui/core/styles";
import style from "./Vos.module.css";
import { Link } from "react-router-dom";
import auth from "../../components/Auth/Auth.js";
import Input from "../../components/UI/Input/Input";
import { Grid } from "@material-ui/core";
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

export class Vos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterVo: "",
      data: [],
      selectedid: 0,
      open: false,
      columnsvalue: [],
      DeleteData: false,
      isCancel: false,
      singleDelete: "",
      multipleDelete: "",
      loggedInUserRole: auth.getUserInfo().role.name,
      isLoader: true,
      contacts: [],
      voInUseSingleDelete: "",
      voInUseDeleteAll: "",
      deleteVOName: "",
      values: {},
      isFilterSearch: false,
      /** pagination data */
      pageSize: "",
      totalRows: "",
      page: "",
      pageCount: "",
    };
  }

  async componentDidMount() {
    this.getVo(10, 1);

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/contact/?_sort=id:ASC"
      )
      .then((res) => {
        this.setState({ contacts: res.data });
      })
      .catch((error) => {});
  }

  getVo = async (pageSize, page, params = null) => {
    if (params !== null && !formUtilities.checkEmpty(params)) {
      let defaultParams = {};
      if (params.hasOwnProperty(SORT_FIELD_KEY)) {
        defaultParams = {
          page: page,
          pageSize: pageSize,
          contact_type: "organization",
          "organization.sub_type": "VO",
        };
      } else {
        defaultParams = {
          page: page,
          pageSize: pageSize,
          [SORT_FIELD_KEY]: "name:ASC",
          contact_type: "organization",
          "organization.sub_type": "VO",
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
        contact_type: "organization",
        "organization.sub_type": "VO",
      };
    }
    if (this.state.loggedInUserRole === "FPO Admin") {
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/individuals/" +
            auth.getUserInfo().contact.individual
        )
        .then((res) => {
          serviceProvider
            .serviceProviderForGetRequest(
              process.env.REACT_APP_SERVER_URL +
                "crm-plugin/contact/vos/?id=" +
                res.data.fpo.id,
              params
            )
            .then((voRes) => {
              this.setState({
                data: voRes.data.result,
                isLoader: false,
                pageSize: voRes.data.pageSize,
                totalRows: voRes.data.rowCount,
                page: voRes.data.page,
                pageCount: voRes.data.pageCount,
              });
            });
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      await serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL + "crm-plugin/contact/vos/",
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
    }
  };

  handleChange = (event, value) => {
    this.setState({
      filterVo: event.target.value,
      values: {
        ["name_contains"]: event.target.value,
      },
    });
  };

  /** Pagination to handle row change*/
  handlePerRowsChange = async (perPage, page) => {
    // this.setState({ isLoader: true });
    if (formUtilities.checkEmpty(this.state.values)) {
      await this.getVo(perPage, page);
    } else {
      if (this.state.isFilterSearch) {
        await this.searchFilter(perPage, page);
      } else {
        await this.getVo(perPage, page, this.state.values);
      }
    }
  };

  /** Pagination to handle page change */
  handlePageChange = async (page) => {
    // this.setState({ isLoader: true });
    if (formUtilities.checkEmpty(this.state.values)) {
      this.getVo(this.state.pageSize, page);
    } else {
      if (this.state.isFilterSearch) {
        await this.searchFilter(this.state.pageSize, page);
      } else {
        await this.getVo(this.state.pageSize, page, this.state.values);
      }
    }
  };

  /** Pagination Search filter is called when we select filters and click on search button */
  searchFilter = async (perPage = this.state.pageSize, page = 1) => {
    if (!formUtilities.checkEmpty(this.state.values)) {
      this.setState({ isFilterSearch: true });
      await this.getVo(perPage, page, this.state.values);
    } else {
      await this.getVo(perPage, page);
    }
  };

  /** Sorting */
  handleSort = (
    column,
    sortDirection,
    perPage = this.state.pageSize,
    page = 1
  ) => {
    if (column.selector === "name") {
      column.selector = "name";
    }
    this.state.values[SORT_FIELD_KEY] = column.selector + ":" + sortDirection;
    this.getVo(perPage, page, this.state.values);
  };

  handleSearch() {
    this.setState({ isLoader: true });
    this.getVo(this.state.pageSize, this.state.page, this.state.values);
  }

  editData = (cellid) => {
    this.props.history.push("/village-organizations/edit/" + cellid);
  };

  DeleteData = (cellid, selectedId) => {
    if (cellid.length !== null && selectedId < 1) {
      this.setState({ singleDelete: "", multipleDelete: "" });
      let voInUseSingleDelete = false;
      this.state.contacts.find((cdata) => {
        if (
          (cdata.id === parseInt(cellid) && cdata.org_vos.length > 0) ||
          (cdata.individual !== null &&
            cdata.individual.vo === parseInt(cellid))
        ) {
          this.setState({
            voInUseSingleDelete: true,
            deleteVOName: cdata.name,
          });
          voInUseSingleDelete = true;
        }
      });
      if (!voInUseSingleDelete) {
        serviceProvider
          .serviceProviderForDeleteRequest(
            process.env.REACT_APP_SERVER_URL + "crm-plugin/contact",
            cellid
          )
          .then((res) => {
            this.setState({ singleDelete: res.data.name });
            this.componentDidMount();
          })
          .catch((error) => {
            this.setState({ singleDelete: false });
            console.log(error.response);
          });
      }
    }
  };

  DeleteAll = (selectedId) => {
    if (selectedId.length !== 0) {
      this.setState({ singleDelete: "", multipleDelete: "" });

      let voInUse = [];
      this.state.contacts.map((cdata) => {
        for (let i in selectedId) {
          if (
            (cdata.id === parseInt(selectedId[i]) &&
              cdata.org_vos.length > 0) ||
            (cdata.individual !== null &&
              cdata.individual.vo === parseInt(selectedId[i]))
          ) {
            voInUse.push(selectedId[i]);
            this.setState({ voInUseDeleteAll: true });
          }
          voInUse = [...new Set(voInUse)];
        }
      });
      var deleteVO = selectedId.filter(function (obj) {
        return voInUse.indexOf(obj) == -1;
      });
      for (let i in deleteVO) {
        serviceProvider
          .serviceProviderForDeleteRequest(
            process.env.REACT_APP_SERVER_URL + "crm-plugin/contact",
            deleteVO[i]
          )
          .then((res) => {
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
      filterState: "",
      filterDistrict: "",
      filterVillage: "",
      filterVo: "",
      isCancel: true,
      isLoader: true,
      values: {},
      isFilterSearch: false,
    });

    this.componentDidMount();
  };

  render() {
    let data = this.state.data;
    const Usercolumns = [
      {
        name: "Village Organization",
        selector: "name",
        sortable: true,
      },
    ];

    let selectors = [];
    for (let i in Usercolumns) {
      selectors.push(Usercolumns[i]["selector"]);
    }

    let columnsvalue = [0];
    const { classes } = this.props;

    return (
      <Layout>
        <Grid>
          <div className="App">
            <h5 className={classes.menuName}>MASTERS</h5>
            <div className={style.headerWrap}>
              <h2 className={style.title}>Manage Village Organizations</h2>
              <div className={classes.buttonRow}>
                <Button
                  variant="contained"
                  component={Link}
                  to="/Village-organizations/add"
                >
                  Add Village Organization
                </Button>
              </div>
            </div>
            {this.props.location.addVoData ? (
              <Snackbar severity="success">
                Village organization added successfully.
              </Snackbar>
            ) : this.props.location.editVoData ? (
              <Snackbar severity="success">
                Village organization edited successfully.
              </Snackbar>
            ) : null}
            {this.state.singleDelete !== false &&
            this.state.singleDelete !== "" &&
            this.state.singleDelete ? (
              <Snackbar severity="success" Showbutton={false}>
                Village organization {this.state.singleDelete} deleted
                successfully!
              </Snackbar>
            ) : null}
            {this.state.singleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === true &&
            this.state.voInUseDeleteAll !== true ? (
              <Snackbar severity="success" Showbutton={false}>
                Village organizations deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            {this.state.voInUseSingleDelete === true ? (
              <Snackbar severity="info" Showbutton={false}>
                Village Organization {this.state.deleteVOName} is in use, it can
                not be Deleted.
              </Snackbar>
            ) : null}
            {this.state.voInUseDeleteAll === true ? (
              <Snackbar severity="info" Showbutton={false}>
                Some Village Organization is in use hence it can not be Deleted.
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
                      label="Village Organization"
                      name="filterVo"
                      id="combo-box-demo"
                      value={this.state.filterVo || ""}
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
                title={"Village Organizations"}
                filterData={true}
                showSearch={false}
                Searchplaceholder={"Search by Village Organization Name"}
                filterBy={["name"]}
                data={data}
                column={Usercolumns}
                editData={this.editData}
                DeleteData={this.DeleteData}
                DeleteAll={this.DeleteAll}
                rowsSelected={this.rowsSelect}
                modalHandle={this.modalHandle}
                columnsvalue={columnsvalue}
                selectableRows
                pagination
                paginationServer
                paginationDefaultPage={this.state.page}
                paginationPerPage={this.state.pageSize}
                paginationTotalRows={this.state.totalRows}
                paginationRowsPerPageOptions={[10, 15, 20, 25, 30]}
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
export default withStyles(useStyles)(Vos);
