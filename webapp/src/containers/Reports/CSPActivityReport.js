import React from "react";
import auth from "../../components/Auth/Auth";
import { withStyles } from "@material-ui/core/styles";
import * as serviceProvider from "../../api/Axios";
import Layout from "../../hoc/Layout/Layout";
import { Grid } from "@material-ui/core";
import Input from "../../components/UI/Input/Input";
import Datepicker from "../../components/UI/Datepicker/Datepicker.js";
import Button from "../../components/UI/Button/Button";
import Autocomplete from "../../components/Autocomplete/Autocomplete";
import { CSP_ACTIVITY_REPORT_BREADCRUMBS } from "./config";

const useStyles = (theme) => ({
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

export class CSPSummaryReport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterStartDate: "",
      filterEndDate: "",
      filterCspName: "",
      isCancel: false,
      cspList: [],
    };
  }

  async componentDidMount() {
    /** get all CSPs */
    let url =
      "users/?contact.creator_id=" +
      auth.getUserInfo().contact.id +
      "&&_sort=username:ASC";
    serviceProvider
      .serviceProviderForGetRequest(process.env.REACT_APP_SERVER_URL + url)
      .then((res) => {
        console.log("--res--", res.data);
        this.setState({ cspList: res.data });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleStartDateChange(event, value) {
    if (event !== null) {
      this.setState({ filterStartDate: event, isCancel: false });
    } else {
      this.setState({
        filterStartDate: "",
      });
    }
  }

  handleEndDateChange(event, value) {
    if (event !== null) {
      this.setState({ filterEndDate: event, isCancel: false });
    } else {
      this.setState({
        filterEndDate: "",
      });
    }
  }

  handleCSPChange(event, value) {
    if (value !== null) {
      this.setState({ filterCspName: value, isCancel: false });
    } else {
      this.setState({
        filterCspName: "",
      });
    }
  }

  handleSearch() {}

  cancelForm = () => {
    this.setState({
      filterStartDate: "",
      filterEndDate: "",
      isCancel: true,
    });
    this.componentDidMount();
  };

  render() {
    const { classes } = this.props;
    return (
      <Layout breadcrumbs={CSP_ACTIVITY_REPORT_BREADCRUMBS}>
        <Grid>
          <Grid>
            <div>
              <h3>CSP Activity Report</h3>
            </div>
            <div className={classes.row}>
              <div className={classes.searchInput}>
                <div className={classes.Districts}>
                  <Grid item md={12} xs={12}>
                    <Autocomplete
                      id="combo-box-demo"
                      options={this.state.cspList}
                      getOptionLabel={(option) => option.username}
                      onChange={(event, value) => {
                        this.handleCSPChange(event, value);
                      }}
                      value={
                        this.state.filterCspName
                          ? this.state.isCancel === true
                            ? null
                            : this.state.filterCspName
                          : null
                      }
                      renderInput={(params) => (
                        <Input
                          {...params}
                          fullWidth
                          label="CSP"
                          name="cspName"
                          variant="outlined"
                        />
                      )}
                    />
                  </Grid>
                </div>
              </div>
              <div className={classes.searchInput}>
                <div className={classes.Districts}>
                  <Grid item md={12} xs={12}>
                    <Datepicker
                      label="Start Date"
                      name="startDate"
                      value={this.state.filterStartDate || ""}
                      format={"dd MMM yyyy"}
                      onChange={(event, value) =>
                        this.handleStartDateChange(event, value)
                      }
                    />
                  </Grid>
                </div>
              </div>
              <div className={classes.searchInput}>
                <div className={classes.Districts}>
                  <Grid item md={12} xs={12}>
                    <Datepicker
                      label="End Date"
                      name="endDate"
                      value={this.state.filterEndDate || ""}
                      format={"dd MMM yyyy"}
                      onChange={(event, value) =>
                        this.handleEndDateChange(event, value)
                      }
                    />
                  </Grid>
                </div>
              </div>
              <Button onClick={this.handleSearch.bind(this)}>Search</Button>
              &nbsp;&nbsp;&nbsp;
              <Button color="secondary" clicked={this.cancelForm}>
                reset
              </Button>
            </div>
          </Grid>
        </Grid>
      </Layout>
    );
  }
}
export default withStyles(useStyles)(CSPSummaryReport);
