import React from "react";
import axios from "axios";
import Table from "../../components/Datatable/Datatable.js";
import Layout from "../../hoc/Layout/Layout";
import Input from "../../components/UI/Input/Input";
import { map } from "lodash";
import validateInput from "../../components/Validation/ValidateInput/ValidateInput";
import Button from '../../components/UI/Button/Button.js'
import { withStyles } from "@material-ui/core/styles";
import style from "./Villages.module.css";
import Grid from '@material-ui/core/Grid';
import { Link } from "react-router-dom";
import auth from "../../components/Auth/Auth.js";
import { useTheme } from "@material-ui/styles";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useMediaQuery } from "@material-ui/core";

const useStyles = theme => ({
  root: {},
  row: {
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
  },
  buttonRow: {
    height: '42px',
    marginTop: theme.spacing(1),
  },
  spacer: {
    flexGrow: 1
  },
  addButton: {
    // float: "right",
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
  },
});

export class VillageList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterText: (''),
      data: [],
      selectedid: 0,
      getDistrict: [],
      columnsvalue: [],
      getState: [],
      values: [],
      stateSelected: [],
      formSubmitted: "",
      addVillage: [],
      validations: {
        addVillage: {
          required: { value: "true", message: "Village field required" }
        },
        addState: {
          required: { value: "true", message: "State field required" }
        },
        addDistrict: {
          required: { value: "true", message: "District field required" }
        }
      },
      errors: {
        addVillage: [],
        addState: [],
        addDistrict: []
      },
    };
  }
  handleStateChangeAutoComplete = (event, value) => {
    if (value !== null) {
      this.setState({
        values: { ...this.state.values, stateFilter: value.name, addState: value.name }
      });
      axios
        .get(
          process.env.REACT_APP_SERVER_URL + "districts?master_state.id=" + value.id,
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + ""
            }
          }
        )
        .then(res => {
          this.setState({ getDistrict: res.data });
        })
        .catch(error => {
          console.log(error);
        });
    } else {
      this.setState({
        values: { ...this.state.values, stateFilter: "", districtFilter: "" },
        getDistrict: []
      });
    }
  };

  handleDistrictChangeAutoComplete = (event, value) => {
    if (value !== null) {
      this.setState({
        values: { ...this.state.values, districtFilter: value.name, addDistrict: value.name }
      });
    } else {
      this.setState({
        values: { ...this.state.values, districtFilter: "" }
      });
    }
  };

  async componentDidMount() {
    await axios
      .get(process.env.REACT_APP_SERVER_URL + "villages/?_sort=name:ASC", {
        headers: {
          Authorization: "Bearer " + auth.getToken() + ""
        }
      })
      .then(res => {
        let getStateName = [];
        for (let i in res.data) {
          if (res.data[i]["state"] !== res.data[i]["state"]) {
            getStateName.push(res.data[i]["state"]["id"])
          }
        }
        this.setState({ data: res.data });
      });
    await axios
      .get(
        process.env.REACT_APP_SERVER_URL + "states",
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + ""
          }
        }
      )
      .then(res => {
        this.setState({ getState: res.data });
      })
      .catch(error => {
        console.log(error);
      });
  }

  editData = cellid => {
    this.props.history.push("/villages/edit/" + cellid);
  };

  DeleteAll = (selectedId, cellid) => {
    if (selectedId) {
      for (let i in selectedId) {
        axios
          .delete(process.env.REACT_APP_SERVER_URL + "villages/" + selectedId[i], {
            headers: {
              Authorization: "Bearer " + auth.getToken() + ""
            }
          })
          .then(res => {
            this.componentDidMount();
          })
          .catch(error => {
            console.log(error.response);
            console.log(selectedId);
          });
      }
    };
  }

  DeleteData = (cellid, selectedId) => {
    if (cellid.length > 0) {
      axios
        .delete(process.env.REACT_APP_SERVER_URL + "villages/" + cellid, {
          headers: {
            Authorization: "Bearer " + auth.getToken() + ""
          }
        })
        .then(res => {
          this.componentDidMount();
        })
        .catch(error => {
          console.log(error.response);
        });
    };
  };

  validate = () => {
    const values = this.state.values;
    const validations = this.state.validations;
    map(validations, (validation, key) => {
      let value = values[key] ? values[key] : "";
      const errors = validateInput(value, validation);
      let errorset = this.state.errors;
      if (errors.length > 0) errorset[key] = errors;
      else delete errorset[key];
      this.setState({ errors: errorset });
    });
  };

  hasError = field => {
    if (this.state.errors[field] !== undefined) {
      return Object.keys(this.state.errors).length > 0 &&
        this.state.errors[field].length > 0
        ? true
        : false;
    }
  };

  handleChange = ({ target }) => {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value }
    });
  };

  filters = (values, row) => {
    this.setState({ filterText: this.state.values })
  }

  handleSubmit = (e) => {
    console.log("handle Submit", this.state.filterText)
    e.preventDefault();
    this.validate();
    if (this.state.values.addVillage && this.state.values.stateFilter && this.state.values.districtFilter) {
      axios
        .get(
          process.env.REACT_APP_SERVER_URL +
          "villages?name_contains=" + this.state.values.addVillage + "&&state.name=" + this.state.values.stateFilter + "&&district.name=" + this.state.values.districtFilter,
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + ""
            }
          }
        )
        .then(res => {
          console.log("Handle Submit Data", this.state.values.addVillage.toLowerCase());
          this.setState({ data: res.data })
        })
        .catch(error => {
          console.log(error);
        });
    }
  }

  cancelForm = () => {
    this.setState({
      values: [],
      stateSelected: false,
      addDistrict: []
    });
    this.componentDidMount();
  };

  render() {
    let data = this.state.data;

    let villageName = [];
    if (data) {
      for (let i in data) {
        let villages = data[i].villages;
        for (let j in villages) {
          villageName.push(villages[j]["name"]);
        }
      }
    }

    const Usercolumns = [
      {
        name: "Village Name",
        selector: "name",
        sortable: true
      },
      {
        name: "District Name",
        selector: "district.name",
        sortable: true,
      },
      {
        name: "State Name",
        selector: "state.name",
        sortable: true
      },
    ];

    let selectors = [];
    for (let i in Usercolumns) {
      selectors.push(Usercolumns[i]["selector"]);
    }
    // const theme = useTheme();
    // const isDesktop = useMediaQuery(theme.breakpoints.up("lg"), {
    //   defaultMatches: true
    // });
    let columnsvalue = selectors[0];
    let filters = this.state.values;
    const { classes } = this.props;
    return (
      <Layout>
        <div className={classes.root}>
          <h1 className={style.title}>Villages</h1>
          <Grid >
            <div className={classes.buttonRow}>
              <div className={classes.addButton}>
                <Button
                  color="primary"
                  variant="contained"
                  component={Link}
                  to="/Villages/add"
                >
                  Add Village
              </Button>
              </div>
            </div>
            {this.props.location.addData ? (
              <Snackbar severity="success">Village added successfully.</Snackbar>
            ) : this.props.location.editData ? (
              <Snackbar severity="success">Village edited successfully.</Snackbar>
            ) : null}
            <br></br>
            <div>
              <form
                autoComplete="off"
                noValidate
                onSubmit={this.handleSubmit}
              >
                {/* {isDesktop ? <h1>helloooooo</h1> : <h1>ghdsghsdgfsdg</h1>} */}
                <div className={classes.row}>
                  <div className={classes.searchInput}>
                    <div className={style.Districts}>
                      <Input
                        id="outlined-basic"
                        type="search"
                        label="Village Name"
                        variant="outlined"
                        name={"addVillage"}
                        onChange={this.handleChange}
                        value={this.state.values.addVillage}
                        error={this.hasError("addVillage")}
                        helperText={
                          this.hasError("addVillage")
                            ? this.state.errors.addVillage[0]
                            : null
                        }
                      />
                    </div>
                  </div>
                  <div className={classes.States}>
                    <div className={style.Districts}>
                      <Autocomplete
                        id="combo-box-demo"
                        onfocus="this.value=''"
                        options={this.state.getState}
                        onChange={this.handleStateChangeAutoComplete}
                        getOptionLabel={option => option.name}
                        renderInput={params => (
                          <Input
                            {...params}
                            label="Select State"
                            variant="outlined"
                            name="addState"
                            error={this.hasError("addState")}
                            helperText={
                              this.hasError("addState")
                                ? this.state.errors.addState[0]
                                : null
                            }
                            value={this.state.values.addState || ""}
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className={classes.Districts}>
                    <div className={style.Districts}>
                      <Autocomplete
                        id="combo-box-demo"
                        onChange={this.handleDistrictChangeAutoComplete}
                        options={this.state.getDistrict}
                        getOptionLabel={option => option.name}
                        renderInput={params => (
                          <Input
                            {...params}
                            label="Select District"
                            variant="outlined"
                            name="addDistrict"
                            onChange={this.handleChange}
                            error={this.hasError("addDistrict")}
                            helperText={
                              this.hasError("addDistrict")
                                ? this.state.errors.addDistrict[0]
                                : this.state.stateSelected
                              // ? null
                              // : "Please select the state first"
                            }
                            value={this.state.values.addDistrict || ""}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className={classes.Search}>
                    <Button
                      color="primary"
                      variant="contained"
                      type="submit"
                    >
                      Search
                  </Button>
                  </div>
                  <div className={classes.Cancel}>
                    <Button
                      color="default"
                      clicked={this.cancelForm}
                      component={Link}
                      to="/Villages"
                    >
                      cancel
                  </Button>
                  </div>
                </div>
              </form>
              <Table
                title={"Villages"}
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
                DeleteMessage={"Are you Sure you want to Delete"}
              />
            </div>
          </Grid>
        </div>

      </Layout>
    );
  }
}
export default withStyles(useStyles)(VillageList);