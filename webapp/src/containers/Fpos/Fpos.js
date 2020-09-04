import React from "react";
import * as serviceProvider from "../../api/Axios";
import Table from "../../components/Datatable/Datatable.js";
import Layout from "../../hoc/Layout/Layout";
import Button from "../../components/UI/Button/Button";
import { withStyles } from "@material-ui/core/styles";
import style from "./Fpos.module.css";
import { Link } from "react-router-dom";
import auth from "../../components/Auth/Auth.js";
import Input from "../../components/UI/Input/Input";
import { map } from "lodash";
import { Grid } from "@material-ui/core";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import Autocomplete from "../../components/Autocomplete/Autocomplete.js";

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

export class Fpos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterState: "",
      filterDistrict: "",
      filterVillage: "",
      filterVo: "",
      Result: [],
      data: [],
      selectedid: 0,
      open: false,
      columnsvalue: [],
      DeleteData: false,
      properties: props,
      getState: [],
      getDistrict: [],
      isCancel: false,
      singleDelete: "",
      multipleDelete: "",
    };
  }

  async componentDidMount() {
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/contact/?contact_type=organization&organization.sub_type=FPO&_sort=name:ASC"
      )
      .then((res) => {
        this.setState({ data: res.data });
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
  }

  handleStateChange = async (event, value, method) => {
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
      });
    }
  };

  handleChange = (event, value) => {
    this.setState({ filterFpo: event.target.value });
  };

  handleDistrictChange(event, value) {
    if (value !== null) {
      this.setState({ filterDistrict: value });
    } else {
      this.setState({
        filterDistrict: "",
      });
    }
  }

  handleVillageChange(event, value) {
    if (value !== null) {
      this.setState({ filterVillage: value });
      this.setState({ isCancel: false });
    } else {
      this.setState({
        filterVillage: "",
      });
    }
  }

  editData = (cellid) => {
    this.props.history.push("/fpos/edit/" + cellid);
  };

  DeleteData = (cellid, selectedId) => {
    if (cellid.length !== null && selectedId < 1) {
      this.setState({ singleDelete: "", multipleDelete: "" });
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
  };

  DeleteAll = (selectedId) => {
    if (selectedId.length !== 0) {
      this.setState({ singleDelete: "", multipleDelete: "" });
      for (let i in selectedId) {
        serviceProvider
          .serviceProviderForDeleteRequest(
            process.env.REACT_APP_SERVER_URL + "crm-plugin/contact",
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
  cancelForm = () => {
    this.setState({
      filterState: "",
      filterDistrict: "",
      filterVillage: "",
      filterFpo: "",
      isCancel: true,
    });

    this.componentDidMount();
  };

  handleSearch() {
    let searchData = "";
    if (this.state.filterState) {
      searchData += "state.id=" + this.state.filterState.id + "&&";
    }
    if (this.state.filterDistrict) {
      searchData += "district.id=" + this.state.filterDistrict.id + "&&";
    }
    if (this.state.filterFpo) {
      searchData += "name_contains=" + this.state.filterFpo;
    }
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/contact/?contact_type=organization&organization.sub_type=FPO&&_sort=name:ASC&&" +
          searchData
      )
      .then((res) => {
        this.setState({ data: res.data });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    let data = this.state.data;
    if (data.length !== 0) {
    }

    const Usercolumns = [
      {
        name: "Name of the  Organization",
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
    let statesFilter = this.state.getState;
    let filterState = this.state.filterState;
    let districtsFilter = this.state.getDistrict;
    let filterDistrict = this.state.filterDistrict;

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
              <h2 className={style.title}>
                Manage Farmers Producer Organization
              </h2>
              <div className={classes.buttonRow}>
                <Button variant="contained" component={Link} to="/fpos/add">
                  Add FPO
                </Button>
              </div>
            </div>
            {this.props.location.addData ? (
              <Snackbar severity="success">FPO added successfully.</Snackbar>
            ) : this.props.location.editData ? (
              <Snackbar severity="success">FPO edited successfully.</Snackbar>
            ) : null}
            {this.state.singleDelete !== false &&
            this.state.singleDelete !== "" &&
            this.state.singleDelete ? (
              <Snackbar severity="success" Showbutton={false}>
                FPO {this.state.singleDelete} deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.singleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === true ? (
              <Snackbar severity="success" Showbutton={false}>
                FPO deleted successfully!
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
                      label="FPO Name"
                      name="filterFpo"
                      id="combo-box-demo"
                      value={this.state.filterFpo || ""}
                      onChange={this.handleChange.bind(this)}
                      variant="outlined"
                    />
                  </Grid>
                </div>
              </div>
              <div className={classes.searchInput}>
                <div className={style.Districts}>
                  <Grid item md={12} xs={12}>
                    <Autocomplete
                      width="150px"
                      id="combo-box-demo"
                      options={statesFilter}
                      getOptionLabel={(option) => option.name}
                      onChange={(event, value) => {
                        this.handleStateChange(event, value);
                      }}
                      defaultValue={[]}
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
                          // margin="dense"
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
                style={{ marginRight: "5px", marginBottom: "8px", }}
                variant="contained"
                onClick={this.handleSearch.bind(this)}
              >
                Search
              </Button>
              <Button
                style={{ marginBottom: "8px", }}
                color="secondary"
                variant="contained"
                // clicked={this.cancelForm}
                onClick={this.cancelForm.bind(this)}
              >
                Reset
              </Button>
            </div>
            {data ? (
              <Table
                title={"FPOs"}
                filterData={true}
                showSearch={false}
                Searchplaceholder={"Search by FPO Name"}
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
                DeleteMessage={"Are you Sure you want to Delete"}
                style = {{}}
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
export default withStyles(useStyles)(Fpos);
