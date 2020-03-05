import React from "react";
import axios from 'axios';
import Table from "../../components/Datatable/Datatable.js";
import Layout from "../../hoc/Layout/Layout";
import Button from '@material-ui/core/Button';
import { withStyles } from "@material-ui/core/styles";
import style from "./Village_listing.module.css"
import { Link } from "react-router-dom";
import Spinner from "../../components/Spinner";

const useStyles = theme => ({
  root: {},
  row: {
    height: '42px',
    // display: 'flex',
    alignItems: 'center',
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

export class Village_listing extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Result: [],
      TestData: [],
      data: [],
      selectedid: 0,
      open: false,
      columnsvalue: []
    };
  }
  componentDidMount() {
    axios.get('http://192.168.2.61:1337/villages').then(res => {
      this.setState({ data: res.data });
    });
  }

  DeleteData = (cellid, selected) => {
    axios.get('http://192.168.2.61:1337/villages').then(res => {
      this.setState({ TestData: res.data });
      this.setState({ Result: res.status });
    });
  }



  render() {

    let data = this.state.data;
    let villageName = [];
    if (data) {
      for (let i in data) {
        let villages = data[i].villages
        for (let j in villages) {
          villageName.push(villages[j]["name"])
        }
      }
    }

    const Usercolumns = [
      {
        name: 'Village Name',
        selector: 'name',
        sortable: true,
      },
      {
        name: 'District Name',
        selector: 'master_district.name',
        sortable: true,
      },
      {
        name: 'State Name',
        selector: 'master_state.name',
        sortable: true,
      },
      {
        cell: row => <Button>Loans</Button>,
        button: true,
      },
    ];

    let selectors = [];
    for (let i in Usercolumns) {
      selectors.push(Usercolumns[i]["selector"])
    }

    let columnsvalue = selectors[0]
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
                component={Link} to="/Villages">
                Add user
            </Button>
            </div>
          </div>
          {data.length ? <Table
            title={"Villages"}
            filterData={true}
            Searchplaceholder={"Seacrh by Village Name"}
            filterBy={["name"]}
            data={data}
            column={Usercolumns}
            DeleteData={this.DeleteData}
            rowsSelected={this.rowsSelect}
            modalHandle={this.modalHandle}
            columnsvalue={columnsvalue}
            DeleteMessage={"Are you Sure you want to Delete"}
          /> : <div className={style.Progess}><center><Spinner /></center></div>}
        </div>
      </Layout>
    )
  }
}
export default withStyles(useStyles)(Village_listing);