import React from "react";
import * as serviceProvider from "../../api/Axios";
import Table from "../../components/Datatable/Datatable.js";
import Layout from "../../hoc/Layout/Layout";
import Button from "../../components/UI/Button/Button";
import { withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import style from "./Countries.module.css";
import { Grid } from "@material-ui/core";
import Input from "../../components/UI/Input/Input";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import Modal from "../../components/UI/Modal/Modal.js";
import Switch from "../../components/UI/Switch/Switch";

const useStyles = (theme) => ({
  root: {},
  row: {
    height: "42px",
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(1),
  },
  buttonRow: {
    height: "42px",
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
  Countries: {
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

export class Countries extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      filterCountry: "",
      Result: [],
      data: [],
      selectedid: 0,
      open: false,
      isSetActive: false,
      isSetInActive: false,
      isActiveAllShowing: false,
      columnsvalue: [],
      DeleteData: false,
      properties: props,
      isCancel: false,
      dataCellId: [],
      singleDelete: "",
      multipleDelete: "",
      active: {},
      allIsActive: [],
    };
  }

  async componentDidMount() {
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/countries/?_sort=name:ASC"
      )
      .then((res) => {
        this.setState({ data: res.data });
      });
  }

  StateFilter(event, value, target) {
    this.setState({
      values: { ...this.state.values, [event.target.name]: event.target.value },
    });
  }

  getData(result) {
    for (let i in result) {
      let countries = [];
      for (let j in result[i].countries) {
        countries.push(result[i].countries[j].name + " ");
      }
      result[i]["countries"] = countries;
    }
    return result;
  }

  handleSearch() {
    let searchData = "";
    if (this.state.values.filterCountry) {
      searchData += "name_contains=" + this.state.values.filterCountry;
    }
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/countries/?" +
          searchData +
          "&&_sort=name:ASC"
      )
      .then((res) => {
        this.setState({ data: this.getData(res.data) });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  editData = (cellid) => {
    this.props.history.push("/countries/edit/" + cellid);
  };

  cancelForm = () => {
    this.setState({
      filterCountry: "",
      values: {},
      formSubmitted: "",
      stateSelected: false,
      isCancel: true,
    });
    this.componentDidMount();
  };

  DeleteData = (cellid, selectedId) => {
    if (cellid.length !== null && selectedId < 1) {
      this.setState({ singleDelete: "", multipleDelete: "" });
      serviceProvider
        .serviceProviderForDeleteRequest(
          process.env.REACT_APP_SERVER_URL + "crm-plugin/countries",
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
  };

  DeleteAll = (selectedId) => {
    if (selectedId.length !== 0) {
      this.setState({ singleDelete: "", multipleDelete: "" });
      for (let i in selectedId) {
        serviceProvider
          .serviceProviderForDeleteRequest(
            process.env.REACT_APP_SERVER_URL + "crm-plugin/countries",
            selectedId[i]
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

  ActiveAll = (selectedId, selected) => {
    if (selectedId.length !== 0) {
      let numberOfIsActive = [];
      for (let i in selected) {
        numberOfIsActive.push(selected[i]["is_active"]);
      }
      this.setState({ allIsActive: numberOfIsActive });
      let IsActive = "";
      numberOfIsActive.forEach((element, index) => {
        if (numberOfIsActive[index] === true) {
          IsActive = false;
        } else {
          IsActive = true;
        }

        let setActiveId = selectedId[index];
        serviceProvider
          .serviceProviderForPutRequest(
            process.env.REACT_APP_SERVER_URL + "crm-plugin/countries",
            setActiveId,
            {
              is_active: IsActive,
            }
          )
          .then((res) => {
            this.setState({ formSubmitted: true });
            this.componentDidMount({ editData: true });
            this.props.history.push({ pathname: "/countries", editData: true });
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
              this.setState({ errorCode: "Network Error - Please try again!" });
            }
            console.log(error);
          });
      });
    }
  };

  confirmActive = (event) => {
    this.setState({ isActiveAllShowing: true });
    this.setState({ setActiveId: event.target.id });
    this.setState({ IsActive: event.target.checked });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleActive = (event) => {
    this.setState({ isActiveAllShowing: false });
    let setActiveId = this.state.setActiveId;
    let IsActive = this.state.IsActive;
    serviceProvider
      .serviceProviderForPutRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/countries",
        setActiveId,
        {
          is_active: IsActive,
        }
      )
      .then((res) => {
        this.setState({ formSubmitted: true });
        this.setState({ open: true });
        this.componentDidMount({ editData: true });
        this.props.history.push({ pathname: "/countries", editData: true });
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
          this.setState({ errorCode: "Network Error - Please try again!" });
        }
        console.log(error);
      });
  };

  closeActiveAllModalHandler = (event) => {
    this.setState({ isActiveAllShowing: false });
  };

  handleCheckBox = (event) => {
    this.setState({ [event.target.name]: event.target.checked });
    this.setState({ addIsActive: true });
  };

  render() {
    let data = this.state.data;
    const Usercolumns = [
      {
        name: "Country",
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
	            <h2 className={style.title}>
	              Manage Countries</h2>
              <div className={classes.buttonRow}>
                <Button
                  variant="contained"
                  component={Link}
                  to="/countries/add"
                >
                  Add Country
                </Button>
              </div>
            </div>
            {this.props.location.addData ? (
              <Snackbar severity="success">
                Country added successfully.
              </Snackbar>
            ) : null}
            {this.props.location.editData ? (
              <Snackbar severity="success">
                Country edited successfully.
              </Snackbar>
            ) : null}
            {this.state.singleDelete !== false &&
            this.state.singleDelete !== "" &&
            this.state.singleDelete ? (
              <Snackbar severity="success" Showbutton={false}>
                Country {this.state.singleDelete} deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.singleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === true ? (
              <Snackbar severity="success" Showbutton={false}>
                Countries deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            <div className={classes.row} style={{flexWrap: "wrap", height: "auto",}}>
              <div className={classes.searchInput}>
                <div className={style.Districts}>
                  <Grid item md={12} xs={12}>
                    <Input
                      fullWidth
                      label="Country Name"
                      name="filterCountry"
                      variant="outlined"
                      onChange={(event, value) => {
                        this.StateFilter(event, value);
                      }}
                      value={this.state.values.filterCountry || ""}
                    />
                  </Grid>
                </div>
              </div>
                <Button
                  style={{ marginRight: "5px", marginBottom: "8px", }}
                  onClick={this.handleSearch.bind(this)}>Search</Button>
                <Button
                  style={{ marginBottom: "8px", }}
                  color="secondary" clicked={this.cancelForm}>
                  Reset
                </Button>
            </div>
            {data ? (
              <Table
                showSetAllActive={true}
                title={"Countries"}
                showSearch={false}
                filterData={true}
                allIsActive={this.state.allIsActive}
                Searchplaceholder={"Search by Country Name"}
                filterBy={["name"]}
                filters={filters}
                data={data}
                column={Usercolumns}
                editData={this.editData}
                DeleteData={this.DeleteData}
                clearSelected={this.clearSelected}
                DeleteAll={this.DeleteAll}
                handleActive={this.handleActive}
                ActiveAll={this.ActiveAll}
                rowsSelected={this.rowsSelect}
                columnsvalue={columnsvalue}
                selectableRows
                pagination
                DeleteMessage={"Are you Sure you want to Delete"}
                ActiveMessage={
                  "Are you Sure you want to Deactivate selected Country"
                }
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
                ? " Do you want to activate selected country ?"
                : "Do you want to deactivate selected country ?"}
            </Modal>
          </div>
        </Grid>
      </Layout>
    );
  }
}
export default withStyles(useStyles)(Countries);
