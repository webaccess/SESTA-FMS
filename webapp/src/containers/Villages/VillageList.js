import React from "react";
import axios from "axios";
import Table from "../../components/Datatable/Datatable.js";
import Layout from "../../hoc/Layout/Layout";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import style from "./VillageList.module.css";
import { Redirect, Route } from "react-router-dom";
import { Link } from "react-router-dom";
import Spinner from "../../components/Spinner";
import auth from "../../components/Auth/Auth.js";
import PrivateRoute from "../../hoc/PrivateRoute/PrivateRoute";
import villagePage from "./VillagePage";

import { createBrowserHistory } from "history";

const useStyles = theme => ({
  root: {},
  row: {
    height: "42px",
    // display: 'flex',
    alignItems: "center",
    marginTop: theme.spacing(2)
  },
  spacer: {
    flexGrow: 1
  },
  addButton: {
    float: "right",
    marginRight: theme.spacing(1)
  },
  exportButton: {
    marginRight: theme.spacing(1)
  },
  searchInput: {
    marginRight: theme.spacing(1)
  }
});

export class VillageList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Result: [],
      TestData: [],
      data: [],
      selectedid: 0,
      open: false,
      columnsvalue: [],
      DeleteData: false,
      properties: props
    };
    console.log("yovishal", props);
    let history = props;
  }
  componentDidMount() {
    axios
      .get(process.env.REACT_APP_SERVER_URL + "villages/?_sort=name:ASC", {
        headers: {
          Authorization: "Bearer " + auth.getToken() + ""
        }
      })
      .then(res => {
        this.setState({ data: res.data });
      });
  }
  editData = cellid => {
    this.props.history.push("/villages/edit/" + cellid);
  };
  DeleteAll = selectedId => {
    axios
      .delete(process.env.REACT_APP_SERVER_URL + "villages/?" + selectedId, {
        headers: {
          Authorization: "Bearer " + auth.getToken() + ""
        }
      })
      .then(res => {
        console.log("deleted data res", res.data);
      })
      .catch(error => {
        console.log(error.response);
        console.log(selectedId);
      });
  };

  DeleteData = cellid => {
    axios
      .delete(process.env.REACT_APP_SERVER_URL + "villages/" + cellid, {
        headers: {
          Authorization: "Bearer " + auth.getToken() + ""
        }
      })
      .then(res => {
        console.log("deleted data res", res.data);
        this.componentDidMount();
      })
      .catch(error => {
        console.log(error.response);
      });
  };

  render() {
    let data = this.state.data;
    console.log("hhddd", this.history);

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
        selector: "master_district.name",
        sortable: true
      },
      {
        name: "State Name",
        selector: "master_state.name",
        sortable: true
      },
      {
        cell: row => <Button>Loans</Button>,
        button: true
      }
    ];

    let selectors = [];
    for (let i in Usercolumns) {
      selectors.push(Usercolumns[i]["selector"]);
    }

    let columnsvalue = selectors[0];
    const { classes } = this.props;
    return (
      <Layout>
        <div className="App">
          <h1 className={style.title}>Villages</h1>
          <div className={classes.row}>
            <div className={style.addButton}>
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
          {data.length ? (
            <Table
              title={"Villages"}
              filterData={true}
              Searchplaceholder={"Seacrh by Village Name"}
              filterBy={["name"]}
              data={data}
              column={Usercolumns}
              editData={this.editData}
              DeleteData={this.DeleteData}
              DeleteAll={this.DeleteAll}
              rowsSelected={this.rowsSelect}
              modalHandle={this.modalHandle}
              columnsvalue={columnsvalue}
              DeleteMessage={"Are you Sure you want to Delete"}
            />
          ) : (
            <div className={style.Progess}>
              <center>
                <Spinner />
              </center>
            </div>
          )}
        </div>
      </Layout>
    );
  }
}
export default withStyles(useStyles)(VillageList);
