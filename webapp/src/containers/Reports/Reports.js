import React from "react";
import auth from "../../components/Auth/Auth";
import { withStyles } from "@material-ui/core/styles";
import * as serviceProvider from "../../api/Axios";
import Layout from "../../hoc/Layout/Layout";
import { Grid, Card } from "@material-ui/core";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import Moment from "moment";
import Input from "../../components/UI/Input/Input";
import Datepicker from "../../components/UI/Datepicker/Datepicker.js";
import Button from "../../components/UI/Button/Button";
import Table from "../../components/Datatable/Datatable.js";
import Autocomplete from "../../components/Autocomplete/Autocomplete";
import { Link } from "react-router-dom";

const useStyles = (theme) => ({
  root: {
    maxWidth: 345,
    height: "150px",
  },
  row: {
    height: "42px",
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(1),
  },
  searchInput: {
    marginRight: theme.spacing(1),
  },
  Districts: {
    marginRight: theme.spacing(1),
    width: "230px",
  },
});

export class Reports extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {}

  render() {
    const { classes } = this.props;
    return (
      <Layout>
        <Grid>
          <Grid>
            <div>
              <h3>Reports</h3>
            </div>
            <Card className={classes.root}>
              <CardActionArea
                component={Link}
                to={{
                  pathname: "/summary-report",
                }}
              >
                <CardContent>CSP Summary Report</CardContent>
              </CardActionArea>
            </Card>
            <Card className={classes.root}>
              <CardActionArea
                component={Link}
                to={{
                  pathname: "/activity-report",
                }}
              >
                <CardContent>CSP Activity Report</CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Layout>
    );
  }
}
export default withStyles(useStyles)(Reports);
