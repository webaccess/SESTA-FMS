import React from "react";
import * as serviceProvider from "../../api/Axios";
import Table from "../../components/Datatable/Datatable.js";
import Layout from "../../hoc/Layout/Layout";
import Button from "../../components/UI/Button/Button";
import { withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import style from "./Pgs.module.css";
import { Grid } from "@material-ui/core";
import Input from "../../components/UI/Input/Input";
import auth from "../../components/Auth/Auth.js";
import Modal from "../../components/UI/Modal/Modal.js";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import Switch from "../../components/UI/Switch/Switch";

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

export class Pgs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      data: [],
      contacts: [],
      DeleteData: false,
      isActiveAllShowing: false,
      isCancel: false,
      singleDelete: "",
      multipleDelete: "",
      errorCode: "",
      successCode: "",
      deletePgName: "",
      pgInUseSingleDelete: "",
      pgInUseDeleteAll: "",
      isPgPresent: false,
      isLoader: true,
    };
    this.snackbar = React.createRef();
  }
  async componentDidMount() {
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/tags/?_sort=name:ASC"
      )
      .then((res) => {
        this.setState({ data: res.data, isLoader: false });
      })
      .catch((error) => {
        console.log(error);
      });

      serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/contact/?contact_type=individual&&_sort=name:ASC&&pg_null=false"
      )
      .then((res) => {
        this.setState({ contacts: res.data });
      });
  }

  editData = (cellid) => {
    this.props.history.push("/pgs/edit/" + cellid);
  };

  DeleteData = (cellid, selectedId) => {
    if (cellid.length !== null && selectedId < 1) {
      this.setState({ singleDelete: "", multipleDelete: "" });

      let pgInUseSingleDelete = false;
      this.state.contacts.find((cd) => {
        if (cd.pg.id === parseInt(cellid)) {
          this.setState({
            pgInUseSingleDelete: true,
            deletePgName: cd.pg.name,
          });
          pgInUseSingleDelete = true;
        }
      });
      if (!pgInUseSingleDelete) {
        serviceProvider
          .serviceProviderForDeleteRequest(
            process.env.REACT_APP_SERVER_URL + "crm-plugin/tags",
            cellid
          )
          .then((res) => {
            this.setState({ singleDelete: res.data.name });
            this.setState({ dataCellId: "" });
            this.componentDidMount();
          })
          .catch((error) => {
            this.setState({ singleDelete: false });
            console.log(error);
          });
      }
    }
  };

  DeleteAll = (selectedId) => {
    if (selectedId.length !== 0) {
      this.setState({ singleDelete: "", multipleDelete: "" });

      let pgInUse = [];
      this.state.contacts.map((cd) => {
        for (let i in selectedId) {
          if (parseInt(selectedId[i]) === cd.pg.id) {
            pgInUse.push(selectedId[i]);
            this.setState({ pgInUseDeleteAll: true });
          }
          pgInUse = [...new Set(pgInUse)];
        }
      });
      var deletePg = selectedId.filter(function (obj) {
        return pgInUse.indexOf(obj) == -1;
      });
      for (let i in deletePg) {
        serviceProvider
          .serviceProviderForDeleteRequest(
            process.env.REACT_APP_SERVER_URL + "crm-plugin/tags",
            deletePg[i]
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

  resetForm = () => {
    this.setState({
      values: {},
      formSubmitted: "",
      stateSelected: false,
      isCancel: true,
      isLoader: true,
    });
    this.componentDidMount();
  };

  handleChange = ({ target }) => {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value },
    });
  };

  confirmActive = (event) => {
    this.setState({ isActiveAllShowing: true });
    this.setState({ setActiveId: event.target.id });
    this.setState({ IsActive: event.target.checked });
    if (this.state.isPgPresent === true) {
      this.setState({ isPgPresent: false });
    }
  };

  handleActive = async (e) => {
    this.setState({ isActiveAllShowing: false });
    this.setState({ successCode: "", errorCode: "" });
    let setActiveId = this.state.setActiveId;
    let IsActive = this.state.IsActive;

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/contact/?pg=" +
          setActiveId
      )
      .then((pgRes) => {
        if (pgRes.data.length > 0) {
          this.setState({ isPgPresent: true });
        } else {
          this.setState({ isPgPresent: false });
          serviceProvider
            .serviceProviderForPutRequest(
              process.env.REACT_APP_SERVER_URL + "crm-plugin/tags",
              setActiveId,
              {
                is_active: IsActive,
              }
            )
            .then((res) => {
              let isActive = "";
              if (res.data.is_active) {
                isActive = "Active";
              } else {
                isActive = "Inactive";
              }
              this.setState({ formSubmitted: true });
              this.setState({
                successCode:
                  "Producer group " + res.data.name + " is " + isActive + ".",
              });
              this.componentDidMount();
              this.props.history.push({ pathname: "/pgs", updateData: true });
              if (
                this.props.location.updateData &&
                this.snackbar.current !== null
              ) {
                this.snackbar.current.handleClick();
              }
            })
            .catch((error) => {
              this.setState({ formSubmitted: false });
              if (error.response !== undefined) {
                this.setState({
                  errorCode:
                    error.response.data.statusCode +
                    " Error- " +
                    error.response.data.error +
                    " Message- " +
                    error.response.data.message +
                    " Please try again!",
                });
              } else {
                this.setState({
                  errorCode: "Network Error - Please try again!",
                });
              }
              console.log(error);
            });
        }
      })
      .catch((error) => {});
  };

  closeActiveAllModalHandler = (event) => {
    this.setState({ isActiveAllShowing: false });
  };

  handleSearch() {
    this.setState({ isLoader: true });
    let searchData = "";
    if (this.state.values.filterPg) {
      searchData += "name_contains=" + this.state.values.filterPg;
    }
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/tags/?" +
          searchData +
          "&&_sort=name:ASC"
      )
      .then((res) => {
        this.setState({ data: res.data, isLoader: false });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    let data = this.state.data;
    const Usercolumns = [
      {
        name: "Producer Group",
        selector: "name",
        sortable: true,
      },
      {
        name: "Active",
        cell: (cell) => (
          <Switch
            id={cell.id}
            onChange={(e) => {
              this.confirmActive(e);
            }}
            defaultChecked={cell.is_active}
            Small={true}
          />
        ),
        sortable: true,
        button: true,
      },
    ];

    let selectors = [];
    for (let i in Usercolumns) {
      selectors.push(Usercolumns[i]["selector"]);
    }

    let columnsvalue = selectors[0];
    const { classes } = this.props;
    let filters = this.state.values;
    return (
      <Layout>
        <Grid>
          <div className="App">
            <h5 className={classes.menuName}>MASTERS</h5>
            <div className={style.headerWrap}>
              <h2 className={style.title}>Manage Producer Group</h2>
              <div className={classes.buttonRow}>
                <Button variant="contained" component={Link} to="/Pgs/add">
                  Add PG
                </Button>
              </div>
            </div>
            {this.props.location.addData ? (
              <Snackbar severity="success">
                Producer Group added successfully.
              </Snackbar>
            ) : null}
            {this.props.location.editData ? (
              <Snackbar severity="success">
                Producer Group edited successfully.
              </Snackbar>
            ) : null}
            {this.props.location.updateData ? (
              <Snackbar
                ref={this.snackbar}
                open={true}
                autoHideDuration={4000}
                severity="success"
              >
                Producer Group updated successfully.
              </Snackbar>
            ) : null}
            {this.state.singleDelete !== false &&
            this.state.singleDelete !== "" &&
            this.state.singleDelete ? (
              <Snackbar severity="success" Showbutton={false}>
                Producer Group {this.state.singleDelete} deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.singleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === true && this.state.pgInUseDeleteAll !== true? (
              <Snackbar severity="success" Showbutton={false}>
                Producer Groups deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.isPgPresent === true ? (
              <Snackbar severity="info" Showbutton={false}>
                Producer Group is in use, it can not be Deactivated!!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            {this.state.formSubmitted === false ? (
              <Snackbar severity="error" Showbutton={false}>
                {this.state.errorCode}
              </Snackbar>
            ) : null}
            {this.state.pgInUseSingleDelete === true ? (
            <Snackbar severity="info" Showbutton={false}>
              Producer Group {this.state.deletePgName} is in use, it can not be Deleted.
            </Snackbar>
          ) : null}
          {this.state.pgInUseDeleteAll === true ? (
            <Snackbar severity="info" Showbutton={false}>
              Some Producer Group is in use hence it can not be Deleted.
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
                      label="Producer Group"
                      name="filterPg"
                      variant="outlined"
                      onChange={(event) => {
                        this.handleChange(event);
                      }}
                      value={this.state.values.filterPg || ""}
                    />
                  </Grid>
                </div>
              </div>
              <Button
                style={{ marginRight: "5px", marginBottom: "8px" }}
                onClick={this.handleSearch.bind(this)}
              >
                Search
              </Button>
              <Button
                style={{ marginBottom: "8px" }}
                color="secondary"
                clicked={this.resetForm}
              >
                reset
              </Button>
            </div>
            {data ? (
              <Table
                title={"Producer Group"}
                showSearch={false}
                filterData={true}
                Searchplaceholder={"Seacrh by Village Name"}
                filterBy={["name", "state.name"]}
                filters={filters}
                data={data}
                column={Usercolumns}
                editData={this.editData}
                DeleteData={this.DeleteData}
                DeleteAll={this.DeleteAll}
                rowsSelected={this.rowsSelect}
                columnsvalue={columnsvalue}
                selectableRows
                pagination
                progressComponent={this.state.isLoader}
                DeleteMessage={"Are you Sure you want to Delete"}
              />
            ) : (
              <h1>Loading...</h1>
            )}
            <Modal
              className="modal"
              show={this.state.isActiveAllShowing}
              close={this.closeActiveAllModalHandler}
              displayCross={{ display: "none" }}
              handleEventChange={true}
              event={this.handleActive}
              footer={{
                footerSaveName: "OKAY",
                footerCloseName: "CLOSE",
                displayClose: { display: "true" },
                displaySave: { display: "true" },
              }}
            >
              {this.state.IsActive
                ? "Do you want to activate selected PG ?"
                : "Do you want to deactivate selected PG ?"}
            </Modal>
          </div>
        </Grid>
      </Layout>
    );
  }
}
export default withStyles(useStyles)(Pgs);
