import React, { Component } from "react";
import style from "./Loans.module.css";
import Layout from "../../hoc/Layout/Layout";
import { withStyles } from "@material-ui/core/styles";
import * as serviceProvider from "../../api/Axios";
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
import Button from "../../components/UI/Button/Button";
import Moment from "moment";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import { Link } from "react-router-dom";

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
    color: "black",
    fontSize: "11px",
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
      loan_installments: [],
      shgUnderVo: "",
      handlePurposeChange: "",
      isCancel: false,
      loan_model: [],
      memberData: [],
    };
  }

  async componentDidMount() {
    let url, shgid, VOid;
    if (this.props.location.state.hasOwnProperty("individual")) {
      shgid = this.props.location.state.individual.shg;
      VOid = this.props.location.state.individual.vo;
    }
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
          "crm-plugin/contact/?contact_type=organization&id=" +
          shgid
      )
      .then((res) => {
        // get VO assigned to selected SHG member
        res.data.map((e, i) => {
          e.organization.vos.map((item) => {
            this.setState({ shgUnderVo: item.name });
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });

    if (shgid !== 0) {
      url = "?shg.id=" + shgid;
    } else {
      url = "?vo.id=" + VOid;
    }

    // get shg/vo from Individual model
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/individuals/" + url
      )
      .then((res) => {
        this.setState({ getShgVo: res.data });
      });

    // get purpose from loan model
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "loan-models/?_sort=id:ASC"
      )
      .then((res) => {
        this.setState({ loan_model: res.data });
      });
  }

  handleFieldChange = (event, value) => {
    if (value != null) {
      this.setState({ handlePurposeChange: value, isCancel: false });
    } else {
      this.setState({ handlePurposeChange: "" });
    }
  };

  SaveData() {
    // save loan application to contact
    let loan_application_data = [];
    let assignLoanAppValues;
    let activeLoanPresent, loanApplied, loanAlreadyApplied;
    let postData = this.props.location.state;
    if (
      this.state.memberData &&
      this.state.memberData.length &&
      this.state.memberData[0].hasOwnProperty("loan_applications")
    ) {
      postData = this.state.memberData[0];
    }

    if (this.state.handlePurposeChange) {
      assignLoanAppValues = this.state.handlePurposeChange;
    } else {
      assignLoanAppValues = this.state.loan_model[0];
    }
    loan_application_data = {
      contact: postData.id,
      loan_model: assignLoanAppValues.id,
      application_no: assignLoanAppValues.id.toString(),
      application_date: Moment().format("YYYY-MM-DD"),
      purpose: assignLoanAppValues.product_name,
      status: "UnderReview",
    };

    if (postData.loan_applications && postData.loan_applications.length > 0) {
      postData.loan_applications.map((loanapp) => {
        if (loanapp.status == "UnderReview" || loanapp.status == "Approved") {
          if (loanapp.loan_model == assignLoanAppValues.id) {
            loanAlreadyApplied = true;
            activeLoanPresent = false;
            loanApplied = false;
            this.props.history.push({
              pathname: "/loans",
              state: {
                loanAlreadyApplied: true,
                purpose: assignLoanAppValues.product_name,
              },
            });
          } else if (loanapp.loan_model !== assignLoanAppValues.id) {
            activeLoanPresent = true;
            loanAlreadyApplied = false;
            loanApplied = false;
            this.props.history.push({
              pathname: "/loans",
              state: { activeLoanPresent: true },
            });
          }
        } else if (
          loanapp.status == "Denied" ||
          loanapp.status == "Cancelled"
        ) {
          if (!loanApplied && !activeLoanPresent && !loanAlreadyApplied) {
            this.saveApplyLoan(
              loan_application_data,
              postData.id,
              assignLoanAppValues
            );
            loanApplied = true;
            loanAlreadyApplied = false;
            activeLoanPresent = false;
          }
        }
      });
    } else {
      this.saveApplyLoan(
        loan_application_data,
        postData.id,
        assignLoanAppValues
      );
      loanApplied = true;
      this.setState({ loanApplied: true });
    }
  }

  saveApplyLoan(postData, memberId, assignLoanAppValues) {
    serviceProvider
      .serviceProviderForPostRequest(
        process.env.REACT_APP_SERVER_URL + "loan-applications",
        postData
      )
      .then((res) => {
        this.getMemberData(memberId);

        // put method to update application_no
        let updateAppNo = res.data;
        updateAppNo.application_no = res.data.id;

        serviceProvider
          .serviceProviderForPutRequest(
            process.env.REACT_APP_SERVER_URL + "loan-applications",
            res.data.id,
            updateAppNo
          )
          .then((loanapp_res) => {});

        this.props.history.push({
          pathname: "/loans",
          state: {
            loanApplied: true,
            purpose: assignLoanAppValues.product_name,
            memberData: res.data,
          },
        });
      })
      .catch((error) => {
        this.props.history.push({
          pathname: "/loans",
          state: { loanNotApplied: true },
        });
      });
  }

  getMemberData(id) {
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/contact/?id=" + id
      )
      .then((res) => {
        this.setState({ memberData: res.data });
      });
  }

  cancelForm = () => {
    this.setState({
      values: {},
      formSubmitted: "",
      isCancel: true,
    });
    this.componentDidMount();
    //routing code #route to loan_application_list page
  };

  render() {
    const { classes } = this.props;
    let shgName, loan_amnt, duration, specification, loan_purpose;

    // store memberData(props.history.push) from member page
    let data = this.props.location.state;
    if (
      this.state.memberData &&
      this.state.memberData.length &&
      this.state.memberData[0].hasOwnProperty("loan_applications")
    ) {
      data = this.state.memberData[0];
    }
    let loan_model = this.state.loan_model;
    let handlePurposeChange = this.state.handlePurposeChange;

    this.state.loan_model.map((loanmodel) => {
      if (handlePurposeChange) {
        if (loanmodel.id == this.state.handlePurposeChange.id) {
          loan_amnt = loanmodel.loan_amount;
          duration = loanmodel.duration;
          specification = loanmodel.specification;
          loan_purpose = loanmodel.product_name;
          this.state.loan_installments = loanmodel.emidetails;
        }
      } else {
        loan_amnt = loan_model[0].loan_amount;
        duration = loan_model[0].duration;
        specification = loan_model[0].specification;
        loan_purpose = loan_model[0].product_name;
        this.state.loan_installments = loan_model[0].emidetails;
      }
    });

    // To add a due date in emi installments
    this.state.loan_installments.map((row, i) => {
      var futureMonth = Moment().add(i, "M").format("DD MMM YYYY");
      row.due_date = futureMonth;
    });

    this.state.loan_installments.sort((a, b) => {
      return a.id - b.id;
    });

    this.state.getShgVo.map((shgvo) => {
      shgName = shgvo.shg.name;
    });
    let shgUnderVo = this.state.shgUnderVo;

    return (
      <Layout>
        <Grid>
          <div className="App">
            <h5 className={style.loan}>LOAN</h5>
            <h2 className={style.title}>Apply for Loan</h2>

            {/* <h4 align="right">Birangana Women Producers Company Pvt. Ltd</h4> */}

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
                <Grid item xs={12} style={{ width: "74%" }}>
                  <Autocomplete
                    id="combo-box-demo"
                    disabled={false}
                    options={loan_model}
                    getOptionLabel={(option) => option.product_name}
                    onChange={(event, value) => {
                      this.handleFieldChange(event, value);
                    }}
                    value={
                      handlePurposeChange
                        ? loan_model[
                            loan_model.findIndex(function (item, i) {
                              return item.id == handlePurposeChange.id;
                            })
                          ]
                        : loan_model[0]
                    }
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
                    <td style={{ paddingBottom: "179px" }}>
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

                    <td style={{ paddingBottom: "50px" }}>
                      <b>
                        <table style={{ width: "100%", height: "100%" }}>
                          <tr>
                            <td>EMI Installment</td>
                            <td></td>
                            <td>Amount in rupees</td>
                          </tr>
                          <tr style={{ backgroundColor: "#dddddd" }}>
                            <th>Due Date</th>
                            <th>Principle</th>
                            <th>Interest</th>
                          </tr>
                          {this.state.loan_installments
                            ? this.state.loan_installments.map((row) => (
                                <tr>
                                  <td>{row.due_date}</td>
                                  <td>{row.principal}</td>
                                  <td>{row.interest}</td>
                                </tr>
                              ))
                            : null}
                        </table>
                      </b>
                    </td>
                  </tr>
                </table>
              </Grid>
              <Divider />

              <br />
              <Grid>
                <Button onClick={this.SaveData.bind(this)}>Save</Button>
                &nbsp;&nbsp;&nbsp;
                <Button
                  color="secondary"
                  clicked={this.cancelForm}
                  component={Link}
                  to="/members"
                >
                  Cancel
                </Button>
              </Grid>
            </Card>
          </div>
        </Grid>
      </Layout>
    );
  }
}

export default withStyles(useStyles)(LoansPage);
