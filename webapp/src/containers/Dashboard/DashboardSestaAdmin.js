import React, { Component } from "react";
import auth from "../../components/Auth/Auth";
import { withStyles } from "@material-ui/core/styles";
import * as serviceProvider from "../../api/Axios";
import { Grid } from "@material-ui/core";
import PersonIcon from "@material-ui/icons/Person";
import PeopleIcon from "@material-ui/icons/People";
import NaturePeopleIcon from "@material-ui/icons/NaturePeople";
import MoneyIcon from "@material-ui/icons/Money";
import style from "./Dashboard.module.css";
import Spinner from "../../components/Spinner/Spinner";

const useStyles = (theme) => ({
  Icon: {
    fontSize: "40px",
    color: "#008000",
    "&:hover": {
      color: "#008000",
    },
    "&:active": {
      color: "#008000",
    },
  },
  oddBlock: {
    backgroundColor: "#000",
    padding: "15px",
    textAlign: "center",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    width: "100%",
    flexWrap: "wrap",
  },
  evenBlock: {
    backgroundColor: "#112e23",
    padding: "15px",
    textAlign: "center",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    width: "100%",
    flexWrap: "wrap",
  },
  labelValues: {
    color: "#028941",
    fontSize: "46px",
    fontWeight: "bold",
    marginBottom: "0px",
    marginTop: "0px",
    lineHeight: "1.5",
  },
  fieldValues: {
    color: "#028941",
    fontSize: "32px",
    fontWeight: "bold",
    lineHeight: "1.5",
  },
});

class DashboardForFPO extends Component {
  constructor(props) {
    super(props);
    this.state = {
      memberData: "",
      shgData: "",
      voData: "",
      approvedLoans: "",
      pendingLoans: "",
      isMemLoading: true,
      isVoLoading: true,
      isShgLoading: true,
      isLoanLoading: true,
    };
  }

  async componentDidMount() {
    /** get members */
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/contact/members/count"
      )
      .then((res) => {
        this.setState({ memberData: res.data, isMemLoading: false });
      })
      .catch((error) => {});

    /** get SHGs */
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/contact/shg/count/"
      )
      .then((res) => {
        this.setState({ shgData: res.data, isShgLoading: false });
      })
      .catch((error) => {});

    /** get VOs */
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/contact/vo/count/"
      )
      .then((res) => {
        this.setState({ voData: res.data, isVoLoading: false });
      });

    /** get pending loan applications */
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "loan-applications/loans/count/?status=UnderReview"
      )
      .then((res) => {
        this.setState({ pendingLoans: res.data, isLoanLoading: false });
      })
      .catch((error) => {});

    /** get approved loan applications */
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "loan-applications/loans/count/"
      )
      .then((res) => {
        this.setState({ approvedLoans: res.data, isLoanLoading: false });
      })
      .catch((error) => {});
  }

  render() {
    const { classes } = this.props;
    const userInfo = auth.getUserInfo();

    return (
      <div className="App">
        <Grid container>
          <Grid
            item
            md={6}
            xs={12}
            spacing={3}
            className={style.dashboardSestawrap}
          >
            <Grid container>
              <Grid
                item
                sm={6}
                xs={12}
                spacing={3}
                style={{ display: "inline-flex" }}
              >
                <div className={classes.oddBlock}>
                  <PersonIcon className={classes.Icon} />
                  <h3
                    style={{
                      color: "white",
                      marginBottom: "5px",
                      flex: "auto",
                    }}
                  >
                    MEMBERS{" "}
                  </h3>
                  {!this.state.isMemLoading ? (
                    <h2 className={classes.labelValues}>
                      {this.state.memberData.toLocaleString()}
                    </h2>
                  ) : (
                    <Spinner />
                  )}
                </div>
              </Grid>
              <Grid
                item
                sm={6}
                xs={12}
                spacing={3}
                style={{
                  display: "inline-flex",
                  borderBottom: "1px solid black",
                }}
              >
                <div className={classes.evenBlock}>
                  <PeopleIcon className={classes.Icon} />
                  <h3
                    style={{
                      color: "white",
                      marginBottom: "5px",
                      flex: "auto",
                    }}
                  >
                    SELF HELP GROUPS
                  </h3>
                  {!this.state.isShgLoading ? (
                    <h2 className={classes.labelValues}>
                      {this.state.shgData.toLocaleString()}
                    </h2>
                  ) : (
                    <Spinner />
                  )}
                </div>
              </Grid>
            </Grid>
            <Grid container>
              <Grid
                item
                sm={6}
                xs={12}
                spacing={3}
                style={{ display: "inline-flex" }}
              >
                <div className={classes.evenBlock}>
                  <NaturePeopleIcon className={classes.Icon} />
                  <h3
                    style={{
                      color: "white",
                      marginBottom: "5px",
                      flex: "auto",
                    }}
                  >
                    VILLAGE ORGANIZATIONS
                  </h3>
                  {!this.state.isVoLoading ? (
                    <h2 className={classes.labelValues}>
                      {this.state.voData.toLocaleString()}
                    </h2>
                  ) : (
                    <Spinner />
                  )}
                </div>
              </Grid>
              <Grid
                item
                sm={6}
                xs={12}
                spacing={3}
                style={{ display: "inline-flex" }}
              >
                <div className={classes.oddBlock}>
                  <MoneyIcon className={classes.Icon} />
                  <h3
                    style={{
                      color: "white",
                      marginBottom: "5px",
                      flex: "auto",
                    }}
                  >
                    LOAN APPLICATIONS
                  </h3>
                  {!this.state.isLoanLoading ? (
                    <div style={{ display: "inline-flex" }}>
                      <div
                        style={{
                          borderRight: "1px solid #fff",
                          padding: "0px 15px",
                        }}
                      >
                        <h5 style={{ display: "block", margin: "0px" }}>
                          APPROVED
                        </h5>
                        <span className={classes.fieldValues}>
                          {this.state.approvedLoans}
                        </span>
                      </div>
                      <div style={{ padding: "0px 15px" }}>
                        <h5 style={{ display: "block", margin: "0px" }}>
                          PENDING
                        </h5>
                        <span className={classes.fieldValues}>
                          {this.state.pendingLoans}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <Spinner />
                  )}
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(useStyles)(DashboardForFPO);
