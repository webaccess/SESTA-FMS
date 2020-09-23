import React from "react";
import * as serviceProvider from "../../api/Axios";
import Table from "../../components/Datatable/Datatable.js";
import Layout from "../../hoc/Layout/Layout";
import Button from "../../components/UI/Button/Button";
import { withStyles } from "@material-ui/core/styles";
import style from "./Fpos.module.css";
import { Link } from "react-router-dom";
import Input from "../../components/UI/Input/Input";
import { map } from "lodash";
import { Grid } from "@material-ui/core";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import Autocomplete from "../../components/Autocomplete/Autocomplete.js";
import * as constants from "../../constants/Constants";

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
      filterDistrict: "",
      filterVo: "",
      Result: [],
      data: [],
      contacts: [],
      loanpurpose: [],
      activityTypes: [],
      selectedid: 0,
      open: false,
      columnsvalue: [],
      DeleteData: false,
      properties: props,
      getDistrict: [],
      isCancel: false,
      singleDelete: "",
      multipleDelete: "",
      fpoInUseSingleDelete: "",
      fpoInUseDeleteAll: "",
      deleteFpoName: "",
      isLoader: true,
      stateId: constants.STATE_ID,
    };
  }

  async componentDidMount() {
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
        "crm-plugin/contact/?contact_type=organization&organization.sub_type=FPO&_sort=name:ASC"
      )
      .then((res) => {
        this.setState({ data: res.data, isLoader: false });
      });

    //api call for districts filter
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
        "crm-plugin/districts/?_sort=name:ASC&&is_active=true&&state.id=" +
        this.state.stateId
      )
      .then((res) => {
        this.setState({ getDistrict: res.data });
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

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "loan-models/"
      )
      .then((res) => {
        this.setState({ loanpurpose: res.data });
      })

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
        "crm-plugin/activitytypes/?_sort=id:ASC"
      )
      .then((res) => {
        this.setState({ activityTypes: res.data });
      })

  }

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

  editData = (cellid) => {
    this.props.history.push("/fpos/edit/" + cellid);
  };

  fpoDelete(cellid, fpoInUseSingleDelete) {
    this.state.contacts.find((cd) => {
      // check if fpo is present in user's individual
      if (cd.individual !== null && cd.individual.fpo !== null && cd.individual.fpo === parseInt(cellid)) {
        fpoInUseSingleDelete = true;
      }
      //check if fpo is present in VO
      if (cd.organization !== null && cd.organization.fpo !== null && cd.organization.fpo === parseInt(cellid)) {
        fpoInUseSingleDelete = true;
      }
    });

    // check if fpo is present in loan model
    this.state.loanpurpose.map(loanmodel => {
      if (loanmodel.fpo !== null) {
        if (loanmodel.fpo.id === parseInt(cellid)) {
          fpoInUseSingleDelete = true;
        }
      }
    })

    //check if fpo is present in activity types
    this.state.activityTypes.map(types => {
      if (types.contact.length > 0) {
        if (types.contact[0].id === parseInt(cellid)) {
          fpoInUseSingleDelete = true;
        }
      }
    })
    return fpoInUseSingleDelete;
  }

  DeleteData = (cellid, selectedId) => {
    if (cellid.length !== null && selectedId < 1) {
      this.setState({ singleDelete: "", multipleDelete: "" });

      let fpoInUseSingleDelete = false;
      fpoInUseSingleDelete = this.fpoDelete(cellid, fpoInUseSingleDelete);
      if (fpoInUseSingleDelete) {
        this.state.data.map(fpodata => {
          if (fpodata.id === parseInt(cellid)) {
            this.setState({
              fpoInUseSingleDelete: true,
              deleteFpoName: fpodata.name,
            });
          }
        })
      }
      if (!fpoInUseSingleDelete) {
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

      let fpoInUseDeleteAll = false;
      let shgInUse = [];
      for (let i in selectedId) {
        fpoInUseDeleteAll = this.fpoDelete(selectedId[i], fpoInUseDeleteAll);
        let shg = fpoInUseDeleteAll ? shgInUse.push(selectedId[i]) : shgInUse.push()
      }

      if (fpoInUseDeleteAll) {
        this.setState({ fpoInUseDeleteAll: true });
        shgInUse = [...new Set(shgInUse)];
      }
      var deleteFpo = selectedId.filter(function (obj) {
        return shgInUse.indexOf(obj) == -1;
      });

      for (let i in deleteFpo) {
        serviceProvider
          .serviceProviderForDeleteRequest(
            process.env.REACT_APP_SERVER_URL + "crm-plugin/contact",
            deleteFpo[i]
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
      filterDistrict: "",
      filterFpo: "",
      isCancel: true,
      isLoader: true,
    });

    this.componentDidMount();
  };

  handleSearch() {
    this.setState({ isLoader: true });
    let searchData = "";
    if (this.state.filterDistrict) {
      searchData +=
        "addresses.district.id=" + this.state.filterDistrict.id + "&&";
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
        name: "Name of the  Organization",
        selector: "name",
        sortable: true,
        cell: (row) => (row.name ? row.name : "-"),
      },
      {
        name: "District",
        selector: "districtName",
        sortable: true,
        cell: (row) => (row.districtName ? row.districtName : "-"),
      },
    ];

    let selectors = [];
    for (let i in Usercolumns) {
      selectors.push(Usercolumns[i]["selector"]);
    }

    let columnsvalue = [0];
    const { classes } = this.props;
    let districtsFilter = this.state.getDistrict;
    let filterDistrict = this.state.filterDistrict;
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
            {this.state.multipleDelete === true &&
            this.state.fpoInUseDeleteAll !== true? (
              <Snackbar severity="success" Showbutton={false}>
                FPO deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            {this.state.fpoInUseSingleDelete === true ? (
              <Snackbar severity="info" Showbutton={false}>
                FPO {this.state.deleteFpoName} is in use, it can not be
                Deleted.
              </Snackbar>
            ) : null}
            {this.state.fpoInUseDeleteAll === true ? (
              <Snackbar severity="info" Showbutton={false}>
                Some FPOs is in use hence it can not be Deleted.
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
                progressComponent={this.state.isLoader}
                DeleteMessage={"Are you Sure you want to Delete"}
                style={{}}
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
