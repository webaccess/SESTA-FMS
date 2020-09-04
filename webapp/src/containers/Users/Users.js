import React from "react";
import * as serviceProvider from "../../api/Axios";
import Table from "../../components/Datatable/Datatable.js";
import Layout from "../../hoc/Layout/Layout";
import Button from "../../components/UI/Button/Button";
import { withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import style from "./Users.module.css";
import { Grid } from "@material-ui/core";
import Input from "../../components/UI/Input/Input";
import auth from "../../components/Auth/Auth.js";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import Autocomplete from "../../components/Autocomplete/Autocomplete";
import { map } from "lodash";

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
  Countries: {
    marginRight: theme.spacing(1),
  },
  Search: {
    marginRight: theme.spacing(1),
  },
  Cancel: {
    marginRight: theme.spacing(1),
  },
});

export class Users extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      values: {},
      isCancel: false,
      DeleteData: false,
      dataCellId: [],
      singleDelete: "",
      multipleDelete: "",
      getRoles: [],
      loggedInUserRole: auth.getUserInfo().role.name,
    };
  }

  async componentDidMount() {
    /** get all users */
    let url = "users/?_sort=username:ASC";
    if (
      this.state.loggedInUserRole === "FPO Admin" ||
      this.state.loggedInUserRole === "CSP (Community Service Provider)"
    ) {
      url += "&&contact.creator_id=" + auth.getUserInfo().contact.id;
    }
    serviceProvider
      .serviceProviderForGetRequest(process.env.REACT_APP_SERVER_URL + url)
      .then((res) => {
        this.setState({ data: res.data });
      })
      .catch((error) => {
        console.log(error);
      });

    let roleArray = [];
    if (
      this.state.loggedInUserRole === "Sesta Admin" ||
      this.state.loggedInUserRole === "Superadmin"
    ) {
      roleArray = [
        { id: 1, name: "Sesta Admin" },
        { id: 2, name: "FPO Admin" },
        { id: 3, name: "CSP (Community Service Provider)" },
      ];
    }
    if (this.state.loggedInUserRole === "FPO Admin") {
      roleArray = [
        { id: 1, name: "FPO Admin" },
        { id: 2, name: "CSP (Community Service Provider)" },
      ];
    }
    this.setState({ getRoles: roleArray });
  }

  editData = (cellid) => {
    this.props.history.push("/users/edit/" + cellid);
  };

  DeleteData = async (cellid, selectedId) => {
    if (cellid.length !== null && selectedId < 1) {
      this.setState({ singleDelete: "", multipleDelete: "" });

      serviceProvider
        .serviceProviderForDeleteRequest(
          process.env.REACT_APP_SERVER_URL + "users",
          cellid
        )
        .then((res) => {
          this.deleteContact(res.data.contact.id);
        })
        .catch((error) => {
          this.setState({ singleDelete: false });
          console.log(error);
        });
    }
  };

  deleteContact = async (id) => {
    serviceProvider
      .serviceProviderForDeleteRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/contact",
        id
      )
      .then((res) => {
        this.setState({ singleDelete: res.data.username, dataCellId: "" });
        this.componentDidMount();
      })
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
            process.env.REACT_APP_SERVER_URL + "users",
            selectedId[i]
          )
          .then((res) => {
            this.deleteContact(res.data.contact.id);
            this.setState({ multipleDelete: true });
          })
          .catch((error) => {
            this.setState({ multipleDelete: false });
            console.log(error);
          });
      }
    }
  };

  handleUserChange(event, value) {
    this.setState({
      values: { ...this.state.values, [event.target.name]: event.target.value },
    });
  }

  handleRoleChange = async (event, value) => {
    if (value !== null) {
      this.setState({ roleStatus: value, isCancel: false });
    } else {
      this.setState({ roleStatus: "" });
    }
  };

  handleSearch() {
    let searchData = "";
    if (this.state.values.addUser) {
      searchData += "username_contains=" + this.state.values.addUser;
    }
    if (this.state.roleStatus) {
      searchData += searchData ? "&&" : "";
      searchData += "role.name=" + this.state.roleStatus.name;
    }
    /** api call after search filter */
    let url = "users/?_sort=username:ASC";
    if (
      this.state.loggedInUserRole === "FPO Admin" ||
      this.state.loggedInUserRole === "CSP (Community Service Provider)"
    ) {
      url += "&&contact.creator_id=" + auth.getUserInfo().contact.id;
    }
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + url + "&&" + searchData
      )
      .then((res) => {
        this.setState({ data: res.data });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  cancelForm = () => {
    this.setState({
      values: {},
      formSubmitted: "",
      isCancel: true,
    });
    this.componentDidMount();
    //routing code #route to users page
  };

  render() {
    const { classes } = this.props;
    let data = this.state.data;
    let roleFilter = this.state.getRoles;
    let roleStatus = this.state.roleStatus;

    const Usercolumns = [
      {
        name: "Username",
        selector: "username",
        sortable: true,
      },
      {
        name: "Email",
        selector: "email",
        sortable: true,
      },
      {
        name: "Role",
        selector: "role.name",
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
            <h5 className={style.menuName}>USERS</h5>
            <div className={style.headerWrap}>
              <h2 className={style.title}>
                Manage Users</h2>
              <div className={classes.buttonRow}>
                <Button variant="contained" component={Link} to="/users/add">
                  Add New User
                </Button>
              </div>
            </div>
            {this.props.location.addData ? (
              <Snackbar severity="success">User added successfully.</Snackbar>
            ) : this.props.location.editData ? (
              <Snackbar severity="success">User edited successfully.</Snackbar>
            ) : null}
            {this.state.singleDelete !== false &&
            this.state.singleDelete !== "" &&
            this.state.singleDelete ? (
              <Snackbar severity="success" Showbutton={false}>
                User {this.state.singleDelete} deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.singleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === true ? (
              <Snackbar severity="success" Showbutton={false}>
                Users deleted successfully!
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
                      label="Username"
                      name="addUser"
                      variant="outlined"
                      onChange={(event, value) => {
                        this.handleUserChange(event, value);
                      }}
                      value={this.state.values.addUser || ""}
                    />
                  </Grid>
                </div>
              </div>
              <div className={classes.searchInput}>
                <div className={style.Districts}>
                  <Grid item md={12} xs={12}>
                    <Autocomplete
                      id="combo-box-demo"
                      options={roleFilter}
                      getOptionLabel={(option) => option.name}
                      onChange={(event, value) => {
                        this.handleRoleChange(event, value);
                      }}
                      value={
                        roleStatus
                          ? this.state.isCancel === true
                            ? null
                            : roleStatus
                          : null
                      }
                      renderInput={(params) => (
                        <Input
                          {...params}
                          fullWidth
                          label="Select Role"
                          name="selectRole"
                          variant="outlined"
                        />
                      )}
                    />
                  </Grid>
                </div>
              </div>
              <Button onClick={this.handleSearch.bind(this)}
                style={{ marginRight: "5px", marginBottom: "8px", }}>Search</Button>
              <Button color="secondary" clicked={this.cancelForm}
                style={{ marginBottom: "8px", }}>
                reset
              </Button>
            </div>
            {data ? (
              <Table
                title={"Users"}
                showSearch={false}
                filterData={true}
                filterBy={["username", "email", "role.name"]}
                selectableRows
                data={data}
                column={Usercolumns}
                editData={this.editData}
                DeleteData={this.DeleteData}
                DeleteAll={this.DeleteAll}
                columnsvalue={columnsvalue}
                pagination
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
export default withStyles(useStyles)(Users);
