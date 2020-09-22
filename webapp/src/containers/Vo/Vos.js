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
    };
  }

  async componentDidMount() {
    let url =
      "crm-plugin/contact/?contact_type=organization&&organization.sub_type=VO&&_sort=name:ASC";
    if (this.state.loggedInUserRole === "FPO Admin") {
      this.getVo("load", "");
    } else {
      serviceProvider
        .serviceProviderForGetRequest(process.env.REACT_APP_SERVER_URL + url)
        .then((res) => {
          this.setState({ data: res.data, isLoader: false });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  getVo = (param, searchData) => {
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/individuals/" +
          auth.getUserInfo().contact.individual
      )
      .then((res) => {
        let voUrl =
          "crm-plugin/contact/?contact_type=organization&&organization.sub_type=VO&&_sort=name:ASC&&organization.fpo=" +
          res.data.fpo.id;
        if (param === "search") {
          voUrl += "&&" + searchData;
        }
        serviceProvider
          .serviceProviderForGetRequest(
            process.env.REACT_APP_SERVER_URL + voUrl
          )
          .then((res) => {
            this.setState({ data: res.data, isLoader: false });
          })
          .catch((error) => {
            console.log(error);
          });
      });
  };

  handleChange = (event, value) => {
    this.setState({ filterVo: event.target.value });
  };

  editData = (cellid) => {
    this.props.history.push("/village-organizations/edit/" + cellid);
  };

  DeleteData = (cellid, selectedId) => {
    if (cellid.length !== null && selectedId < 1) {
      this.setState({ singleDelete: "", multipleDelete: "" });

      let voInUseSingleDelete = false;
      this.state.contacts.find((cdata) => {
        if (cdata.org_vos.length > 0) {
          if (cdata.id === parseInt(cellid)) {
            this.setState({
              voInUseSingleDelete: true,
              deleteVOName: cdata.name,
            });
            voInUseSingleDelete = true;
          }
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
        if (cdata.org_vos.length > 0) {
          for (let i in selectedId) {
            if (parseInt(selectedId[i]) === cdata.id) {
              voInUse.push(selectedId[i]);
              this.setState({ voInUseDeleteAll: true });
            }
            voInUse = [...new Set(voInUse)];
          }
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
    });

    this.componentDidMount();
  };

  handleSearch() {
    this.setState({ isLoader: true });
    let searchData = "";
    if (this.state.filterVo) {
      searchData += "name_contains=" + this.state.filterVo;
    }

    //api call after search filter
    let url =
      "crm-plugin/contact/?contact_type=organization&&organization.sub_type=VO&&_sort=name:ASC";
    if (this.state.loggedInUserRole === "FPO Admin") {
      this.getVo("search", searchData);
    } else {
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL + url + "&&" + searchData
        )
        .then((res) => {
          this.setState({ data: res.data, isLoader: false });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  render() {
    let data = this.state.data;
    const Usercolumns = [
      {
        name: "Village Organization",
        selector: "name",
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
