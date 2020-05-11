import React from "react";
import { Grid } from "@material-ui/core";
import Layout from "../../hoc/Layout/Layout";
import axios from "axios";
import Table from "../../components/Datatable/Datatable.js";
import { withStyles } from "@material-ui/core/styles";
import Autocomplete from "../../components/Autocomplete/Autocomplete.js";
import auth from "../../components/Auth/Auth.js";
import style from "./Activity.module.css";
import { Link } from "react-router-dom";
import Input from "../../components/UI/Input/Input";
import Button from "../../components/UI/Button/Button";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import DatePicker from "../../components/UI/DatePicker/DatePicker.js"

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

export class Activity extends React.Component {
 constructor(props) {
    super(props);
    this.state = {
      values: {},
      data: [],
      filterActivitytype:"",
      selectedDate: new Date(),
    };
  };

   async componentDidMount() {
    await axios
      .get(process.env.REACT_APP_SERVER_URL + "activities", {
        headers: {
          Authorization: "Bearer " + auth.getToken() + "",
        },
      })
      .then((res) => {
        this.setState({ data: res.data });
      });
       await axios
        .get(
          process.env.REACT_APP_SERVER_URL +
            "activitytypes?is_active=true",
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + "",
            },
          }
        )
        .then((res) => {
          this.setState({ getActivitytype: res.data });
        })
        .catch((error) => {
          console.log(error);
        });
  };

  handleActivitytype = async (event, value) => {
    if (value !== null) {
      this.setState({ filterActivitytype: value.id });
    }else {
      this.setState({
      filterActivitytype: "",
      });
    }
  };

  handleActiveChange(event, value, target) {
    this.setState({
      values: { ...this.state.values, [event.target.name]: event.target.value },
    });
  };

  editData = (cellid) => {
    this.props.history.push("/activity/edit/" + cellid);
  };

  DeleteData = (cellid, selectedId) => {
    if (cellid.length !== null && selectedId < 1) {
      this.setState({ singleDelete: "", multipleDelete: "" });

      axios
        .delete(process.env.REACT_APP_SERVER_URL + "activities/" + cellid, {
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
          .delete(
            process.env.REACT_APP_SERVER_URL + "activities/" + selectedId[i],
            {
              headers: {
                Authorization: "Bearer " + auth.getToken() + "",
              },
            }
          )
          .then((res) => {
            this.setState({ multipleDelete: true });
            this.componentDidMount();
          })
          .catch((error) => {
            this.setState({ multipleDelete: false });
            console.log("error", error);
          });
      }
    }
  };

  handleSearch(){
    console.log("Handle Search")
    let searchData = "";
    if (this.state.filterActivitytype) {
      searchData += "activitytype.id=" + this.state.filterActivitytype + "&&";
    }
    if (this.state.selectedDate) {
      searchData += "start_datetime=" + this.state.selectedDate + "&&";
    }
    if (this.state.values.FilterActivity) {
      searchData += "title_contains=" + this.state.values.FilterActivity;
    }
    console.log("Search",searchData)
    axios
      .get(
        process.env.REACT_APP_SERVER_URL +
          "activities?" +
          searchData ,
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
  };

  cancelForm = () => {
    this.setState({
      filterActivitytype: "",
      values: {},
      formSubmitted: "",
      stateSelected: false,
      isCancel: true,
    });
    this.componentDidMount();
  };  

  render() {

    let data = this.state.data;
     const Usercolumns = [
      {
        name: "Activity",
        selector: "title",
        sortable: true,
      },
      {
        name: "Activity Type",
        selector: "activitytype.name",
        sortable: true,
      },
      {
        name: "Date",
        selector: "start_datetime",
        sortable: true,
      },
      {
        name: "Time",
        selector: "activitytype.name",
        sortable: true,
      },
    ];

    let selectors = [];
    for (let keys in Usercolumns) {
      selectors.push(Usercolumns[keys]["selector"]);
    }
    const  {classes}  = this.props;
    let columnsvalue = selectors[0];
    let ActivityTypeFilter = this.state.getActivitytype;
    let filterActivitytype = this.state.filterActivitytype;
    let districtsFilter = this.state.getDistrict;
    let filterDistrict = this.state.filterDistrict;
    let villagesFilter = this.state.getVillage;
    let filterVillage = this.state.filterVillage;
    let filters = this.state.values;
    console.log("start_datetime",this.state.selectedDate)
    return (
     <Layout>
        <Grid>
          <div className="App">
            <h1 className={style.title}>Manage Activities</h1>
            <div className={classes.row}>
              <div className={classes.buttonRow}>
                <Button variant="contained" component={Link} to="/activity/add">
                  Add Activity
                </Button>
              </div>
            </div>
            {this.props.location.addData ? (
              <Snackbar severity="success">
                Activity added successfully.
              </Snackbar>
            ) : this.props.location.editData ? (
              <Snackbar severity="success">
                Activity edited successfully.
              </Snackbar>
            ) : null}
            {this.state.singleDelete !== false &&
            this.state.singleDelete !== "" &&
            this.state.singleDelete ? (
              <Snackbar severity="success" Showbutton={false}>
                Activity {this.state.singleDelete} deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.singleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === true ? (
              <Snackbar severity="success" Showbutton={false}>
                Activities deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            <br></br>
            <div className={classes.row}>
              <div className={classes.searchInput}>
                <div className={style.Districts}>
                  <Grid item md={12} xs={12}>
                    <Input
                      fullWidth
                      label="Activity"
                      name="FilterActivity"
                      variant="outlined"
                       onChange={(event, value) => {
                        this.handleActiveChange(event, value);
                      }}
                      value={this.state.values.FilterActivity || ""}
                    />
                  </Grid>
                </div>
              </div>
              <div className={classes.searchInput}>
                <div className={style.Districts}>
                  <Grid item md={12} xs={12}>
                    <Autocomplete
                      id="combo-box-demo"
                      options={ActivityTypeFilter}
                      getOptionLabel={(option) => option.name}
                      onChange={(event, value) => {
                        this.handleActivitytype(event, value);
                      }}
                      value={
                        filterActivitytype
                          ? this.state.isCancel === true
                            ? null
                            : ActivityTypeFilter[
                                ActivityTypeFilter.findIndex(function (item, i) {
                                  return item.id === filterActivitytype;
                                })
                              ] || null
                          : null
                      }
                      renderInput={(params) => (
                        <Input
                          {...params}
                          fullWidth
                          label="Activity Type"
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
                    <DatePicker
                    value={this.state.selectedDate}
                    onChange={value => this.setState({ selectedDate: value })}
                  />
                  </Grid>
                  </div>
                  </div>
              <div className={classes.searchInput}></div>
              <br></br>
              <Button onClick={this.handleSearch.bind(this)}>Search</Button>
              &nbsp;&nbsp;&nbsp;
              <Button color="secondary" clicked={this.cancelForm}>
                reset
              </Button>
            </div>
           {data ? (
              <Table
                title={"Activities"}
                showSearch={false}
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
export default withStyles(useStyles)(Activity);