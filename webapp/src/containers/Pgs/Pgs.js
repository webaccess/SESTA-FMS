import React from "react";
import axios from "axios";
import Table from "../../components/Datatable/Datatable.js";
import Layout from "../../hoc/Layout/Layout";
import Button from "../../components/UI/Button/Button";
import { withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import style from "./Pgs.module.css";
import { Grid } from "@material-ui/core";
import Input from "../../components/UI/Input/Input";
import auth from "../../components/Auth/Auth.js";
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

export class Pgs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      data: [],
      DeleteData: false,
      isCancel: false,
      singleDelete: "",
      multipleDelete: "",
      errorCode: "",
      successCode: "",
    };
  }
  async componentDidMount() {
    await axios
      .get(process.env.REACT_APP_SERVER_URL + "tags/?_sort=name:ASC", {
        headers: {
          Authorization: "Bearer " + auth.getToken() + "",
        },
      })
      .then((res) => {
        this.setState({ data: res.data });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  editData = (cellid) => {
    this.props.history.push("/pgs/edit/" + cellid);
  };

  DeleteData = (cellid, selectedId) => {
    if (cellid.length !== null && selectedId < 1) {
      this.setState({ singleDelete: "", multipleDelete: "" });

      axios
        .delete(process.env.REACT_APP_SERVER_URL + "tags/" + cellid, {
          headers: {
            Authorization: "Bearer " + auth.getToken() + "",
          },
        })
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
        axios
          .delete(process.env.REACT_APP_SERVER_URL + "tags/" + selectedId[i], {
            headers: {
              Authorization: "Bearer " + auth.getToken() + "",
            },
          })
          .then((res) => {
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

  resetForm = () => {
    this.setState({
      values: {},
      formSubmitted: "",
      stateSelected: false,
      isCancel: true,
    });
    this.componentDidMount();
  };

  handleChange = ({ target }) => {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value },
    });
  };
  handleActive = async (e) => {
    this.setState({ successCode: "", errorCode: "" });
    let setActiveId = e.target.id;
    let IsActive = e.target.checked;
    await axios
      .put(
        process.env.REACT_APP_SERVER_URL + "tags/" + setActiveId,
        {
          is_active: IsActive,
        },
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + "",
          },
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
        this.props.history.push({ pathname: "/pgs", editData: true });
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
  handleSearch() {
    let searchData = "";
    if (this.state.values.filterPg) {
      searchData += "name_contains=" + this.state.values.filterPg;
    }
    axios
      .get(
        process.env.REACT_APP_SERVER_URL +
          "tags?" +
          searchData +
          "&&_sort=name:ASC",
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + "",
          },
        }
      )
      .then((res) => {
        this.setState({ data: res.data });
      })
      .catch((err) => {
        console.log("err", err);
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
              this.handleActive(e);
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
            <h1 className={style.title}>
              Manage Producer Group
              <div className={classes.floatRow}>
                <div className={classes.buttonRow}>
                  <Button variant="contained" component={Link} to="/Pgs/add">
                    Add PG
                  </Button>
                </div>
              </div>
            </h1>
            {this.props.location.addData ? (
              <Snackbar severity="success">
                Producer Group added successfully.
              </Snackbar>
            ) : this.props.location.editData ? (
              this.state.successCode !== "" ? (
                <Snackbar severity="success">{this.state.successCode}</Snackbar>
              ) : (
                <Snackbar severity="success">
                  Producer Group edited successfully.
                </Snackbar>
              )
            ) : null}
            {this.state.singleDelete !== false &&
            this.state.singleDelete !== "" &&
            this.state.singleDelete ? (
              <Snackbar severity="success" Showbutton={false}>
                PG {this.state.singleDelete} deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.singleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === true ? (
              <Snackbar severity="success" Showbutton={false}>
                PGs deleted successfully!
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
            <br></br>
            <div className={classes.row}>
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
              <div className={classes.searchInput}></div>
              <br></br>
              <Button onClick={this.handleSearch.bind(this)}>Search</Button>
              &nbsp;&nbsp;&nbsp;
              <Button color="secondary" clicked={this.resetForm}>
                reset
              </Button>
            </div>
            {data ? (
              <Table
                title={"Producer Group"}
                showSearch={false}
                filterData={true}
                // noDataComponent={"No Records To be shown"}
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
export default withStyles(useStyles)(Pgs);
