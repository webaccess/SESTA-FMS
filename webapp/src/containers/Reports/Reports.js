import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Layout from "../../hoc/Layout/Layout";
import { Grid, Card } from "@material-ui/core";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
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
  menuName: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
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
        <div>
          <h5 className={classes.menuName}>REPORTS</h5>
        </div>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <div>
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
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <div>
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
            </div>
          </Grid>
        </Grid>
      </Layout>
    );
  }
}
export default withStyles(useStyles)(Reports);
