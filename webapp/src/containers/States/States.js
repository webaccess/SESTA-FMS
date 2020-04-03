import React from "react";
import axios from "axios";
import Table from "../../components/Datatable/Datatable.js";
import Layout from "../../hoc/Layout/Layout";
import Button from "../../components/UI/Button/Button";
import { withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import style from "./States.module.css";
import { Grid } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Input from "../../components/UI/Input/Input";
import auth from "../../components/Auth/Auth.js";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import Switch from "../../components/Switch/Switch";

const useStyles = theme => ({
  root: {},
  row: {
    height: "42px",
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(1)
  },
  buttonRow: {
    height: "42px",
    marginTop: theme.spacing(1)
  },
  spacer: {
    flexGrow: 1
  },
  addButton: {
    float: "right",
    marginRight: theme.spacing(1)
  },
  searchInput: {
    marginRight: theme.spacing(1)
  },
  Districts: {
    marginRight: theme.spacing(1)
  },
  States: {
    marginRight: theme.spacing(1)
  },
  Search: {
    marginRight: theme.spacing(1)
  },
  Cancel: {
    marginRight: theme.spacing(1)
  }
});

export class Villages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      FilterState: "",
      toggleSwitch: false,
      Result: [],
      TestData: [],
      data: [],
      selectedid: 0,
      open: false,
      columnsvalue: [],
      DeleteData: false,
      properties: props,
      getState: [],
      getDistrict: [],
      getVillage: [],
      isCancel: false,
      dataCellId: [],
      singleDelete: "",
      multipleDelete: "",
      active:{}
    };
  }
  async componentDidMount() {
    await axios
      .get(process.env.REACT_APP_SERVER_URL + "states/?_sort=name:ASC", {
        headers: {
          Authorization: "Bearer " + auth.getToken() + ""
        }
      })
      .then(res => {
        this.setState({ data: res.data });
      });
   
  }

  StateFilter (event, value, target){
  this.setState({
      values: { ...this.state.values, [event.target.name]: event.target.value }
    });
  }
 getData(result) {
    for (let i in result) {
      let states = [];
      for (let j in result[i].states) {
        states.push(result[i].states[j].name + " ");
        console.log("push");
      }
      result[i]["states"] = states;
    }
    return result;
  }

handleSearch() {
  let searchData = "";
  if (this.state.values.FilterState) {
searchData += "name_contains=" + this.state.values.FilterState;
   }
      // searchData += "name_contains=" + 
    
    axios
      .get(
        process.env.REACT_APP_SERVER_URL +
          "states?" +
          searchData +
          "&&_sort=name:ASC",
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + ""
          }
        }
      )
      .then(res => {
        this.setState({ data: this.getData(res.data) });
      })
      .catch(err => {
        console.log("err", err);
      });
  }
  editData = cellid => {
    this.props.history.push("/states/edit/" + cellid);
  };

  cancelForm = () => {
      this.setState({
        FilterState: "",
        values: {},
        formSubmitted: "",
        stateSelected: false,
        isCancel: true
      });
      this.componentDidMount();
    };

  DeleteData = (cellid, selectedId) => {
    if (cellid.length !== null && selectedId < 1) {
      this.setState({ singleDelete: "", multipleDelete: "" });
      axios
        .delete(process.env.REACT_APP_SERVER_URL + "states/" + cellid, {
          headers: {
            Authorization: "Bearer " + auth.getToken() + ""
          }
        })
        .then(res => {
          this.setState({ singleDelete: res.data.name });
          this.setState({ dataCellId: "" });
          this.componentDidMount();
        })
        .catch(error => {
          this.setState({ singleDelete: false });
          console.log(error);
        });
    }
  };

  DeleteAll = selectedId => {
    if (selectedId.length !== 0) {
      this.setState({ singleDelete: "", multipleDelete: "" });
      for (let i in selectedId) {
        axios
          .delete(
            process.env.REACT_APP_SERVER_URL + "states/" + selectedId[i],
            {
              headers: {
                Authorization: "Bearer " + auth.getToken() + ""
              }
            }
          )
          .then(res => {
            this.setState({ multipleDelete: true });
            this.componentDidMount();
          })
          .catch(error => {
            this.setState({ multipleDelete: false });
            console.log("err", error);
          });
      }
    }
  };

  handleActive = (event) => {
    if(this.state.toggleSwitch === true )
    this.setState({toggleSwitch: false})
    else{
      this.setState({toggleSwitch: true})
    }
    this.setState({ ...this.state.active, [event.target.name]: event.target.checked });
    // console.log("IsActive??:",event.target.id)
  }
  render() {
    let data = this.state.data;
    const Usercolumns = [
      {
        name: "State Name",
        selector: "name",
        sortable: true,
        grow: 2,
      },
      {
        name: "Active",
         cell: cell => ( <div><Switch checked={this.state.toggleSwitch} onChange={this.handleActive} id={cell.id} name={cell.name}/></div> 
        ),
        sortable: true,
        button: true
      }
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
            <h1 className={style.title}>States</h1>
            <div className={classes.row}>
              <div className={classes.buttonRow}>
                <Button
                  variant="contained"
                  component={Link}
                  to="/states/add"
                >
                  Add State
                </Button>
              </div>
            </div>
            {this.props.location.addData ? (
              <Snackbar severity="success">
                State added successfully.
              </Snackbar>
            ) : this.props.location.editData ? (
              <Snackbar severity="success">
                State edited successfully.
              </Snackbar>
            ) : null}
            {this.state.singleDelete !== false &&
            this.state.singleDelete !== "" &&
            this.state.singleDelete ? (
              <Snackbar severity="success" Showbutton={false}>
                State {this.state.singleDelete} deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.singleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === true ? (
              <Snackbar severity="success" Showbutton={false}>
                States deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
             <div className={classes.searchInput}>
                <div className={style.Districts}>
                  <Grid item md={12} xs={12}>
                    <Input
                      fullWidth
                      label="State Name"
                      name="FilterState"
                      variant="outlined"
                      onChange={(event, value) => {
                        this.StateFilter(event, value);
                      }}
                      value={this.state.values.FilterState || ""}
                    />
                  </Grid>
                </div>
              </div>
              <div className={classes.searchInput}></div>
              <br></br>
              <Button onClick={this.handleSearch.bind(this)}>Search</Button>
             
              <Button color="secondary" clicked={this.cancelForm}>
                cancel
              </Button>
           
            <br></br> 
            {data ? (
              <Table
                title={"States"}
                showSearch={false}
                filterData={true}
                // noDataComponent={"No Records To be shown"}
                Searchplaceholder={"Search by State Name"}
                filterBy={["name"]}
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
export default withStyles(useStyles)(Villages);