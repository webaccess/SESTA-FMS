import React from "react";
import * as serviceProvider from "../../api/Axios";
import Table from "../../components/Datatable/Datatable.js";
import Layout from "../../hoc/Layout/Layout";
import Button from "../../components/UI/Button/Button";
import { withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import { map } from "lodash";
import style from "./Villages.module.css";
import { Grid } from "@material-ui/core";
import Autocomplete from "../../components/Autocomplete/Autocomplete";
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
  menuName: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    margin: "0px",
  },
});

export class Villages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      filterState: "",
      filterDistrict: "",
      filterVillage: "",
      Result: [],
      data: [],
      contacts: [],
      selectedid: 0,
      open: false,
      isActiveAllShowing: false,
      columnsvalue: [],
      DeleteData: false,
      properties: props,
      getState: [],
      getDistrict: [],
      getVillage: [],
      isCancel: false,
      dataCellId: [],
      deleteVillageName: "",
      singleDelete: "",
      multipleDelete: "",
      villageInUse: "",
      villageInUseSingleDelete: "",
      villageInUseDeleteAll: "",
      active: {},
      allIsActive: [],
      isLoader: true,
    };
  }
  async componentDidMount() {
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/villages/?_sort=name:ASC"
      )
      .then((res) => {
        this.setState({ data: this.getData(res.data), isLoader: false });
      });

    //api call for states filter
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/states/?is_active=true"
      )
      .then((res) => {
        this.setState({ getState: res.data });
      })
      .catch((error) => {
        console.log(error);
      });

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/contact/?_sort=id:ASC"
      )
      .then((res) => {
        this.setState({ contacts: res.data });
      });
  }

  getData(result) {
    for (let i in result) {
      let villages = [];
      for (let j in result[i].villages) {
        villages.push(result[i].villages[j].name + " ");
      }
      result[i]["villages"] = villages;
    }
    return result;
  }

  handleStateChange = async (event, value) => {
    if (value !== null) {
      this.setState({ filterState: value });

      this.setState({
        isCancel: false,
        filterDistrict: "",
      });
      let stateId = value.id;
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL +
            "crm-plugin/districts/?is_active=true&&state.id=" +
            stateId
        )
        .then((res) => {
          this.setState({ getDistrict: res.data });
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      this.setState({
        filterState: "",
        filterDistrict: "",
        filterVillage: "",
      });
    }
  };

  handleDistrictChange(event, value) {
    if (value !== null) {
      this.setState({ filterDistrict: value });
      let distId = value.id;
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL + "crm-plugin/districts/" + distId
        )
        .then((res) => {
          this.setState({ getVillage: res.data.villages });
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      this.setState({
        filterDistrict: "",
        filterVillage: "",
      });
    }
  }

  handleVillageChange(event, value, target) {
    this.setState({
      values: { ...this.state.values, [event.target.name]: event.target.value },
    });
  }

  editData = (cellid) => {
    this.props.history.push("/villages/edit/" + cellid);
  };

  DeleteData = (cellid, selectedId) => {
    if (cellid.length !== null && selectedId < 1) {
      this.setState({ singleDelete: "", multipleDelete: "" });
      let villageInUseSingleDelete = false;
      this.state.contacts.find((cd) => {
        if (cd.addresses.length > 0) {
          if (cd.addresses[0].village === parseInt(cellid)) {
            this.state.data.map(villgdata => {
              if (cellid === villgdata.id) {
                this.setState({ villageInUseSingleDelete: true, deleteVillageName: villgdata.name });
                villageInUseSingleDelete = true;
              }
            })
          }
        }
      });

      if (!villageInUseSingleDelete) {
        serviceProvider
          .serviceProviderForDeleteRequest(
            process.env.REACT_APP_SERVER_URL + "crm-plugin/villages",
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

      let villgInUse = [];
      this.state.contacts.map((cd) => {
        if (cd.addresses.length > 0 && cd.addresses[0].village != null) {
          for (let i in selectedId) {
            if (parseInt(selectedId[i]) === cd.addresses[0].village) {
              villgInUse.push(selectedId[i])
            }
            villgInUse = [...new Set(villgInUse)]
          }
        }
      });

      var deleteVillg = selectedId.filter(function (obj) {
        return villgInUse.indexOf(obj) == -1;
      });
      for (let i in deleteVillg) {
        serviceProvider
          .serviceProviderForDeleteRequest(
            process.env.REACT_APP_SERVER_URL + "crm-plugin/villages",
            deleteVillg[i]
          )
          .then((res) => {
            this.setState({ villageInUseDeleteAll: true });
            this.componentDidMount();
          })
          .catch((error) => {
            this.setState({ multipleDelete: false });
            console.log(error);
          });
      }
    }
  };

  confirmActive = (event) => {
    if (this.state.villageInUse === true) {
      this.setState({ villageInUse: "" });
    }
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
    let villageInUse = false;
    this.state.contacts.find((cd) => {
      if (cd.addresses.length > 0) {
        if (cd.addresses[0].village === parseInt(setActiveId)) {
          this.setState({ villageInUse: true });
          villageInUse = true;
        }
      }
    });
    if (!villageInUse) {
      serviceProvider
        .serviceProviderForPutRequest(
          process.env.REACT_APP_SERVER_URL + "crm-plugin/villages",
          setActiveId,
          {
            is_active: IsActive,
          }
        )
        .then((res) => {
          this.setState({ formSubmitted: true });
          this.setState({ open: true });
          this.componentDidMount({ updateData: true });
          this.props.history.push({ pathname: "/villages", updateData: true });
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
            this.setState({ errorCode: "Network Error - Please try again!" });
          }
          console.log(error);
        });
    }
  };

  closeActiveAllModalHandler = (event) => {
    this.setState({ isActiveAllShowing: false });
  };

  handleCheckBox = (event) => {
    this.setState({ [event.target.name]: event.target.checked });
    this.setState({ addIsActive: true });
  };

  cancelForm = () => {
    this.setState({
      filterState: "",
      filterDistrict: "",
      filterVillage: "",
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

  handleSearch() {
    this.setState({ isLoader: true });
    let searchData = "";
    if (this.state.filterState) {
      searchData += "state.id=" + this.state.filterState.id + "&&";
    }
    if (this.state.filterDistrict) {
      searchData += "district.id=" + this.state.filterDistrict.id + "&&";
    }
    if (this.state.values.addVillage) {
      searchData += "name_contains=" + this.state.values.addVillage;
    }
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/villages/?" +
          searchData +
          "&&_sort=name:ASC"
      )
      .then((res) => {
        this.setState({ data: this.getData(res.data), isLoader: false });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    let data = this.state.data;
    const Usercolumns = [
      {
        name: "Village",
        selector: "name",
        sortable: true,
      },
      {
        name: "State",
        selector: "state.name",
        sortable: true,
      },
      {
        name: "District",
        selector: "district.name",
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
    let statesFilter = this.state.getState;
    let filterState = this.state.filterState;
    let districtsFilter = this.state.getDistrict;
    let filterDistrict = this.state.filterDistrict;
    let filters = this.state.values;

    let addStates = [];
    map(filterState, (state, key) => {
      addStates.push(
        statesFilter.findIndex(function (item, i) {
          return item.id === state;
        })
      );
    });
    let addDistricts = [];
    map(filterDistrict, (district, key) => {
      addDistricts.push(
        districtsFilter.findIndex(function (item, i) {
          return item.id === district;
        })
      );
    });

    return (
      <Layout>
        <Grid>
          <div className="App">
            <h5 className={classes.menuName}>MASTERS</h5>
            <div className={style.headerWrap}>
              <h2 className={style.title}>Manage Villages</h2>
              <div className={classes.buttonRow}>
                <Button variant="contained" component={Link} to="/Villages/add">
                  Add Village
                </Button>
              </div>
            </div>
            {this.props.location.addData ? (
              <Snackbar severity="success">
                Village added successfully.
              </Snackbar>
            ) : this.props.location.editData ? (
              <Snackbar severity="success">
                Village edited successfully.
              </Snackbar>
            ) : null}
            {this.props.location.updateData ? (
              <Snackbar
                ref={this.snackbar}
                open={true}
                autoHideDuration={4000}
                severity="success"
              >
                Village updated successfully.
              </Snackbar>
            ) : null}
            {this.state.singleDelete !== false &&
            this.state.singleDelete !== "" &&
            this.state.singleDelete ? (
              <Snackbar severity="success" Showbutton={false}>
                Village {this.state.singleDelete} deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.singleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === true ? (
              <Snackbar severity="success" Showbutton={false}>
                Villages deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            {this.state.villageInUse === true ? (
              <Snackbar severity="error" Showbutton={false}>
                Village is in use, it can not be Deactivated!!
              </Snackbar>
            ) : null}
            {this.state.villageInUseSingleDelete === true ? (
              <Snackbar severity="info" Showbutton={false}>
                Village {this.state.deleteVillageName} is in use, it can not be Deleted.
              </Snackbar>
            ) : null}
            {this.state.villageInUseDeleteAll === true ? (
              <Snackbar severity="info" Showbutton={false}>
                Some Village is in use hence it can not be Deleted.
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
                      label="Village Name"
                      name="addVillage"
                      variant="outlined"
                      onChange={(event, value) => {
                        this.handleVillageChange(event, value);
                      }}
                      value={this.state.values.addVillage || ""}
                    />
                  </Grid>
                </div>
              </div>
              <div className={classes.searchInput}>
                <div className={style.Districts}>
                  <Grid item md={12} xs={12}>
                    <Autocomplete
                      id="combo-box-demo"
                      options={statesFilter}
                      getOptionLabel={(option) => option.name}
                      onChange={(event, value) => {
                        this.handleStateChange(event, value);
                      }}
                      value={
                        filterState
                          ? this.state.isCancel === true
                            ? null
                            : filterState
                          : null
                      }
                      renderInput={(params) => (
                        <Input
                          {...params}
                          fullWidth
                          label="Select State"
                          name="addState"
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
                      options={districtsFilter}
                      name="filterDistrict"
                      getOptionLabel={(option) => option.name}
                      onChange={(event, value) => {
                        this.handleDistrictChange(event, value);
                      }}
                      value={
                        filterDistrict
                          ? this.state.isCancel === true
                            ? null
                            : filterDistrict
                          : null
                      }
                      renderInput={(params) => (
                        <Input
                          {...params}
                          fullWidth
                          label="Select District"
                          name="filterDistrict"
                          variant="outlined"
                        />
                      )}
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
                clicked={this.cancelForm}
              >
                reset
              </Button>
            </div>
            {data ? (
              <Table
                title={"Villages"}
                showSearch={false}
                filterData={true}
                allIsActive={this.state.allIsActive}
                Searchplaceholder={"Search by Village Name"}
                filterBy={["name", "state.name"]}
                filters={filters}
                data={data}
                column={Usercolumns}
                editData={this.editData}
                DeleteData={this.DeleteData}
                DeleteAll={this.DeleteAll}
                handleActive={this.handleActive}
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
                ? "Do you want to activate selected village ?"
                : "Do you want to deactivate selected village ?"}
            </Modal>
          </div>
        </Grid>
      </Layout>
    );
  }
}
export default withStyles(useStyles)(Villages);
