import React, { Component } from "react";
import style from "./Loans.module.css";
import Layout from "../../hoc/Layout/Layout";
import { withStyles } from "@material-ui/core/styles";
import axios from "axios";
import auth from "../../components/Auth/Auth";
import Table from "../../components/Datatable/Datatable.js";
import Autocomplete from "../../components/Autocomplete/Autocomplete";
import Input from "../../components/UI/Input/Input";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Grid,
} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import PersonIcon from "@material-ui/icons/Person";
import PeopleIcon from "@material-ui/icons/People";
import HomeIcon from "@material-ui/icons/Home";
import MoneyIcon from "@material-ui/icons/Money";
import HomeWorkIcon from "@material-ui/icons/HomeWork";
import TextField from "@material-ui/core/TextField";

const useStyles = (theme) => ({
  root: {},
  row: {
    height: "42px",
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(1),
  },
  floatRow: {
    height: "40px",
    float: "right",
  },
  buttonRow: {
    height: "42px",
    float: "right",
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
  loan: {
    position: "relative",
    top: "20px",
  },
  member: {
    fontSize: "11px",
    color: "#000000",
  },
  memberData: {
    fontSize: "20px",
  },
  tableData: {
    // padding: "1px",
    width: "100%",
    border: "0px solid black",
    borderCollapse: "collapse",
  },
  thData: {
    padding: "5px",
    textAlign: "left",
  },
  mainContent: {
    padding: "25px",
  },
  purposeCard: {
    padding: "20px",
  },
});

class LoansPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      values: {},
      getShgVo: [],
      loan_app: [],
      loan_installments: [],
      shgUnderVo: [],
    };
  }

  async componentDidMount() {
    let url, VoOrg;
    let shgid = this.props.location.state.individual.shg;
    let VOid = this.props.location.state.individual.vo;

    await axios
      .get(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/contact/?contact_type=organization&id=" +
          shgid,
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + "",
          },
        }
      )
      .then((res) => {
        VoOrg = res.data;
      })
      .catch((error) => {
        console.log(error);
      });

    let VoContactId = VoOrg[0].organization.vo;
    await axios
      .get(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/contact/?id=" +
          VoContactId,
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + "",
          },
        }
      )
      .then((res) => {
        this.setState({ shgUnderVo: res.data });
      })
      .catch((error) => {
        console.log(error);
      });

    if (shgid != 0) {
      url = "?shg.id=" + shgid;
    } else {
      url = "?vo.id=" + VOid;
    }

    // get shg/vo from Individual model
    await axios
      .get(process.env.REACT_APP_SERVER_URL + "crm-plugin/individuals/" + url, {
        headers: {
          Authorization: "Bearer " + auth.getToken() + "",
        },
      })
      .then((res) => {
        this.setState({ getShgVo: res.data });
      });

    // get purpose from loan application model
    let memberId = this.props.location.state.id;
    await axios
      .get(
        process.env.REACT_APP_SERVER_URL +
          "loan-applications/?contact.id=" +
          memberId,
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + "",
          },
        }
      )
      .then((res) => {
        this.setState({ loan_app: res.data });
      });

    // get details of emi installments
    await axios
      .get(process.env.REACT_APP_SERVER_URL + "loan-application-installments", {
        headers: {
          Authorization: "Bearer " + auth.getToken() + "",
        },
      })
      .then((res) => {
        this.setState({ loan_installments: res.data });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    const { classes } = this.props;
    let data = this.props.location.state;
    let shgName, voName, loan_app_purpose, loan_amnt, duration, specification;
    let loan_app = this.state.loan_app;
    let loan_installments = this.state.loan_installments;
    this.state.loan_app.map((lap) => {
      loan_app_purpose = lap.purpose;
      loan_amnt = lap.loan_model.loan_amount;
      duration = lap.loan_model.duration;
      specification = lap.loan_model.specification;
    });
    this.state.getShgVo.map((shgvo) => {
      shgName = shgvo.shg.name;
      voName = shgvo.vo.name;
    });
    let shgUnderVo;
    this.state.shgUnderVo.map((vo) => {
      shgUnderVo = vo.name;
    });
    let filters = this.state.values;
    const Usercolumns = [
      {
        name: "Name",
        selector: "name",
        sortable: true,
      },
    ];
    let selectors = [];
    for (let i in Usercolumns) {
      selectors.push(Usercolumns[i]["selector"]);
    }
    let columnsvalue = selectors[0];
    return (
      <Layout>
        <Grid>
          <div className="App">
            <h5 className={style.loan}>LOAN</h5>
            <h2 className={style.title}>Apply for Loan</h2>
            <h4 align="right">Birangana Women Producers Company Pvt. Ltd</h4>

            <Card className={classes.mainContent}>
              <Grid>
                <IconButton aria-label="view">
                  <PersonIcon className={classes.Icon} />
                  <b>
                    <div className={classes.member}>
                      LOANEE
                      <br />
                      {data.name}
                    </div>
                  </b>
                </IconButton>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <IconButton aria-label="view">
                  <PeopleIcon className={classes.Icon} />
                  <b>
                    <div className={classes.member}>
                      SHG GROUP <br />
                      {shgName}
                    </div>
                  </b>
                </IconButton>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <IconButton aria-label="view">
                  <HomeIcon className={classes.Icon} />
                  <b>
                    <div className={classes.member}>
                      VILLAGE <br />
                      {data.villages[0].name}
                    </div>
                  </b>
                </IconButton>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <IconButton aria-label="view">
                  <HomeWorkIcon className={classes.Icon} />
                  <b>
                    <div className={classes.member}>
                      VILLAGE ORGANIZATION <br />
                      {shgUnderVo}
                    </div>
                  </b>
                </IconButton>
              </Grid>

              <Divider />
              <Grid className={classes.purposeCard}>
                <Grid item xs={12} style={{ width: "66%" }}>
                  <Autocomplete
                    id="combo-box-demo"
                    disabled={true}
                    options={loan_app}
                    getOptionDisabled={(option) => option}
                    getOptionLabel={(option) =>
                      option ? loan_app_purpose : ""
                    }
                    disabled={{ autoComplete: "nope" }}
                    renderInput={(params) => (
                      <Input
                        {...params}
                        fullWidth
                        label="PURPOSE"
                        name="purpose"
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Divider />

              <Grid className={classes.purposeCard}>
                <table style={{ padding: "20px" }}>
                  <tr>
                    <td style={{ paddingBottom: "130px" }}>
                      <table>
                        <tr>
                          <td>
                            <b>Product Details</b>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <b>
                              Loan Amount <br /> Rs. {loan_amnt}{" "}
                            </b>
                            <br />
                            <br />
                            <b>
                              Duration <br /> {duration} Months{" "}
                            </b>
                            <br />
                            <br />
                            <b>
                              Area/Size/Specifications <br /> {specification}{" "}
                            </b>
                            <br />
                            <br />
                          </td>
                        </tr>
                      </table>
                    </td>

                    <td style={{ paddingBottom: "60px" }}>
                      <b>
                        <table style={{ width: "100%", height: "100%" }}>
                          <tr
                            style={{
                              border: "1px solid lightgray",
                              borderCollapse: "collapse",
                            }}
                          >
                            <td
                              style={{
                                border: "0px solid black",
                                borderCollapse: "collapse",
                              }}
                            >
                              EMI Installment
                            </td>
                            <td
                              style={{
                                border: "0px solid black",
                                borderCollapse: "collapse",
                              }}
                            ></td>
                            <td
                              style={{
                                border: "0px solid black",
                                borderCollapse: "collapse",
                              }}
                            >
                              Amount in rupees
                            </td>
                          </tr>
                          <tr
                            style={{
                              border: "0px solid black",
                              borderCollapse: "collapse",
                              backgroundColor: "#dddddd",
                            }}
                          >
                            <th
                              style={{
                                border: "0px solid black",
                                borderCollapse: "collapse",
                              }}
                            >
                              Due Date
                            </th>
                            <th
                              style={{
                                border: "0px solid black",
                                borderCollapse: "collapse",
                              }}
                            >
                              Principle
                            </th>
                            <th
                              style={{
                                border: "0px solid black",
                                borderCollapse: "collapse",
                              }}
                            >
                              Interest
                            </th>
                          </tr>
                          {loan_installments.map((row) => (
                            <tr
                              style={{
                                border: "1px solid lightgray",
                                borderCollapse: "collapse",
                              }}
                            >
                              <td
                                style={{
                                  border: "0px solid black",
                                  borderCollapse: "collapse",
                                }}
                              >
                                {row.payment_date}
                              </td>
                              <td
                                style={{
                                  border: "0px solid black",
                                  borderCollapse: "collapse",
                                }}
                              >
                                {row.expected_principal}
                              </td>
                              <td
                                style={{
                                  border: "0px solid black",
                                  borderCollapse: "collapse",
                                }}
                              >
                                {row.expected_interest}
                              </td>
                            </tr>
                          ))}
                        </table>
                      </b>
                    </td>
                  </tr>
                </table>
              </Grid>
            </Card>
          </div>
        </Grid>
      </Layout>
    );
  }
}

export default withStyles(useStyles)(LoansPage);
