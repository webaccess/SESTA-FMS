import React, { Component } from "react";
import auth from "../../components/Auth/Auth";
import { withStyles } from "@material-ui/core/styles";
import * as serviceProvider from "../../api/Axios";
import { Grid } from "@material-ui/core";
import PersonIcon from "@material-ui/icons/Person";
import PeopleIcon from "@material-ui/icons/People";
import HomeWorkIcon from "@material-ui/icons/HomeWork";
import MoneyIcon from "@material-ui/icons/Money";

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
  },
  evenBlock: {
    backgroundColor: "#112e23",
    padding: "15px",
    textAlign: "center",
    color: "white",
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
      memberData: 0,
      shgData: 0,
      voData: 0,
      approvedLoans: 0,
      pendingLoans: 0,
    };
  }

  async componentDidMount() {
    /** get members */
    let newDataArray = [];
    let url = "crm-plugin/contact/?contact_type=individual";

    serviceProvider
      .serviceProviderForGetRequest(process.env.REACT_APP_SERVER_URL + url)
      .then((res) => {
        res.data.map((e, i) => {
          if (e.user === null) {
            newDataArray.push(e); // add only those contacts having contact type=individual & users===null
          }
        });
        this.setState({ memberData: newDataArray.length });
      })
      .catch((error) => {});

    /** get SHGs */
    let shgUrl =
      "crm-plugin/contact/?contact_type=organization&&organization.sub_type=SHG";

    serviceProvider
      .serviceProviderForGetRequest(process.env.REACT_APP_SERVER_URL + shgUrl)
      .then((res) => {
        this.setState({ shgData: res.data.length });
      })
      .catch((error) => {});

    /** get VOs */
    let voUrl =
      "crm-plugin/contact/?contact_type=organization&&organization.sub_type=VO";

    serviceProvider
      .serviceProviderForGetRequest(process.env.REACT_APP_SERVER_URL + voUrl)
      .then((res) => {
        this.setState({ voData: res.data.length });
      });

    let loanAppUrl = "loan-applications/";

    /** get pending loan applications */
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + loanAppUrl + "?status=UnderReview"
      )
      .then((res) => {
        this.setState({ pendingLoans: res.data.length });
      })
      .catch((error) => {});

    /** get approved loan applications */
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + loanAppUrl + "?status=Approved"
      )
      .then((res) => {
        this.setState({ approvedLoans: res.data.length });
      })
      .catch((error) => {});
  }

  render() {
    const { classes } = this.props;
    const userInfo = auth.getUserInfo();

    return (
      <div className="App">
        <Grid container>
          <Grid item md={3} spacing={3} style={{ backgroundColor: "#e5e9e3" }}>
            <div className={classes.oddBlock}>
              <PersonIcon className={classes.Icon} />
              <h3 style={{ color: "white", marginBottom: "5px" }}>MEMBERS </h3>
              <h2 className={classes.labelValues}>
                {this.state.memberData.toLocaleString()}
              </h2>
            </div>
            <div className={classes.evenBlock}>
              <HomeWorkIcon className={classes.Icon} />
              <h3 style={{ color: "white", marginBottom: "5px" }}>
                {" "}
                VILLAGE ORGANIZATIONS{" "}
              </h3>
              <h2 className={classes.labelValues}>
                {this.state.voData.toLocaleString()}
              </h2>
            </div>
          </Grid>
          <Grid item md={3} spacing={3} style={{ backgroundColor: "#e5e9e3" }}>
            <div className={classes.evenBlock}>
              <PeopleIcon className={classes.Icon} />
              <h3 style={{ color: "white", marginBottom: "5px" }}>
                SELF HELP GROUPS{" "}
              </h3>
              <h2 className={classes.labelValues}>
                {this.state.shgData.toLocaleString()}
              </h2>
            </div>
            <div className={classes.oddBlock}>
              <MoneyIcon className={classes.Icon} />
              <h3 style={{ color: "white", marginBottom: "5px" }}>
                LOAN APPLICATIONS{" "}
              </h3>
              <div style={{ display: "inline-flex" }}>
                <div
                  style={{ borderRight: "1px solid #fff", padding: "0px 15px" }}
                >
                  <h5 style={{ display: "block", margin: "0px" }}>APPROVED</h5>
                  <span className={classes.fieldValues}>
                    {this.state.approvedLoans}
                  </span>
                </div>
                <div style={{ padding: "0px 15px" }}>
                  <h5 style={{ display: "block", margin: "0px" }}>PENDING</h5>
                  <span className={classes.fieldValues}>
                    {this.state.pendingLoans}
                  </span>
                </div>
              </div>
            </div>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(useStyles)(DashboardForFPO);
