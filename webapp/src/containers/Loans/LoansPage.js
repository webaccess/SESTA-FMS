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
import PersonIcon from '@material-ui/icons/Person';
import PeopleIcon from '@material-ui/icons/People';
import HomeIcon from '@material-ui/icons/Home';
import MoneyIcon from '@material-ui/icons/Money';
import HomeWorkIcon from '@material-ui/icons/HomeWork';
import TextField from '@material-ui/core/TextField';
import Button from "../../components/UI/Button/Button";
import Moment from 'moment';
import Snackbar from "../../components/UI/Snackbar/Snackbar";

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
      color: "#008000"
    },
    "&:active": {
      color: "#008000"
    }
  },
  loan: {
    position: "relative",
    top: "20px"
  },
  member: {
    color: "black",
    fontSize: "11px"
  },
  memberData: {
    fontSize: "20px"
  },
  tableData: {
    // padding: "1px",
    width: "100%",
    border: "0px solid black",
    borderCollapse: "collapse"
  },
  thData: {
    padding: "5px",
    textAlign: "left"
  },
  mainContent: {
    padding: "25px"
  },
  purposeCard: {
    padding: "20px"
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
      handlePurposeChange: "",
      isCancel: false,
      loanApplied: "",
      loanNotApplied: "",
      loanAlreadyApplied: "",
    }
  }

  async componentDidMount() {
    let url, VoOrg, shgid, VOid;
    if (this.props.location.state.hasOwnProperty('individual')) {
      shgid = this.props.location.state.individual.shg;
      VOid = this.props.location.state.individual.vo;
    }
    await axios
      .get(
        process.env.REACT_APP_SERVER_URL +
        "crm-plugin/contact/?contact_type=organization&id=" + shgid,
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

    let VoContactId;
    if (VoOrg) {
      VoContactId = VoOrg[0].organization.vo;
    }
    await axios
      .get(
        process.env.REACT_APP_SERVER_URL +
        "crm-plugin/contact/?id=" + VoContactId,
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
      .get(
        process.env.REACT_APP_SERVER_URL +
        "crm-plugin/individuals/" + url,
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + "",
          },
        }
      )
      .then((res) => {
        this.setState({ getShgVo: res.data });
      });

    // get purpose from loan application model
    let memberId = this.props.location.state.id;
    await axios
      // .get(process.env.REACT_APP_SERVER_URL + "loan-applications/?contact.id=" + memberId, {
      .get(process.env.REACT_APP_SERVER_URL + "loan-applications/?_sort=id:ASC", {
        headers: {
          Authorization: "Bearer " + auth.getToken() + "",
        },
      })
      .then((res) => {
        this.setState({ loan_app: res.data });
        this.setState({ loan_installments: res.data[0].loan_app_installments });
      })


  }

  handleFieldChange = (event, value) => {
    if (value != null) {
      this.setState({ handlePurposeChange: value, isCancel: false });
    } else {
      this.setState({ handlePurposeChange: "" });
    }
  }

  SaveData() {
    // save loan application to contact
    let loan_application_data = [];
    let assignLoanAppValues;
    let postData = this.props.location.state;
    delete postData.individual;
    delete postData.user;
    this.state.loanApplied = false;
    if (this.state.handlePurposeChange) {
      assignLoanAppValues = this.state.handlePurposeChange;
    } else {
      assignLoanAppValues = this.state.loan_app[0];
    }

    loan_application_data = {
      id: assignLoanAppValues.id,
      loan_model: assignLoanAppValues.assignLoanAppValues,
      application_no: assignLoanAppValues.application_no,
      application_date: assignLoanAppValues.application_date,
      approved_by: assignLoanAppValues.approved_by,
      approved_date: assignLoanAppValues.approved_date,
      loan_application_task: assignLoanAppValues.loan_application_task,
      purpose: assignLoanAppValues.purpose,
      review_comments: assignLoanAppValues.review_comments,
      status: assignLoanAppValues.status,
    };

    if (postData.loan_applications && postData.loan_applications.length) {
      postData.loan_applications.map(loanapp => {
        if (assignLoanAppValues.id === loanapp.id) {
          this.setState({ loanAlreadyApplied: true });
        }
        else {
          postData.loan_applications.push(loan_application_data);
          this.saveApplyLoan(postData);
          this.setState({ loanApplied: true });
        }
      })
    } else {
      postData.loan_applications.push(loan_application_data);
      this.saveApplyLoan(postData);
      this.setState({ loanApplied: true });
    }
  }

  saveApplyLoan(postData) {
    axios
      .put(
        process.env.REACT_APP_SERVER_URL +
        "crm-plugin/contact/" + postData.id,
        postData,
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + "",
          },
        }
      )
      .then((res) => {
        this.setState({ loanApplied: true });
        this.setState({ loanAlreadyApplied: false });
      })
      .catch((error) => {
        this.setState({ loanNotApplied: true });
      })
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
    let shgName, voName, loan_amnt, duration, specification;
    let payment_date, expected_principal, expected_interest, loan_purpose;
    let loan_installments = this.state.loan_installments;

    // store memberData(props.history.push) from member page
    let data = this.props.location.state;
    let loan_app = this.state.loan_app;
    let handlePurposeChange = this.state.handlePurposeChange;
    this.state.loan_app.map(lap => {
      if (handlePurposeChange) {
        if (lap.id == this.state.handlePurposeChange.id) {
          loan_amnt = lap.loan_model.loan_amount;
          duration = lap.loan_model.duration;
          specification = lap.loan_model.specification;
          loan_purpose = lap.purpose;
          this.state.loan_installments = lap.loan_app_installments;
        }
      } else {
        loan_amnt = loan_app[0].loan_model.loan_amount;
        duration = loan_app[0].loan_model.duration;
        specification = loan_app[0].loan_model.specification;
        loan_purpose = loan_app[0].purpose;
      }
    });
    loan_installments.map(row => {
      payment_date = row.payment_date;
      row.payment_date = Moment(payment_date).format('DD MMM YYYY')
    });
    this.state.getShgVo.map(shgvo => {
      shgName = shgvo.shg.name;
      voName = shgvo.vo.name;
    });
    let shgUnderVo;
    this.state.shgUnderVo.map(vo => {
      shgUnderVo = vo.name;
    });
    let filters = this.state.values;
    const Usercolumns = [
      {
        name: "Name",
        selector: "name",
        sortable: true,
      }
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
            <h2 className={style.title}>
              Apply for Loan
            </h2>

            <h4 align="right">Birangana Women Producers Company Pvt. Ltd</h4>

            {this.state.loanApplied ? (
              <Snackbar severity="success">Successfully applied for the loan.</Snackbar>) :
              null}
            {this.state.loanAlreadyApplied ? (
              <Snackbar severity="info">You have already applied loan for the Purpose {loan_purpose}.</Snackbar>) :
              null}
            {this.state.loanNotApplied ? (
              <Snackbar severity="error">An error occured - Please try again later!</Snackbar>) :
              null}

            <Card className={classes.mainContent}>
              <Grid>
                <IconButton aria-label="view">
                  <PersonIcon className={classes.Icon} />
                  <b><div className={classes.member}>LOANEE<br />{data.name}</div></b>
                </IconButton>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <IconButton aria-label="view">
                  <PeopleIcon className={classes.Icon} />
                  <b><div className={classes.member}>SHG GROUP <br />{shgName}</div></b>
                </IconButton>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <IconButton aria-label="view">
                  <HomeIcon className={classes.Icon} />
                  <b><div className={classes.member}>VILLAGE <br />{data.villages[0].name}</div></b>
                </IconButton>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <IconButton aria-label="view">
                  <HomeWorkIcon className={classes.Icon} />
                  <b><div className={classes.member}>VILLAGE ORGANIZATION <br />{shgUnderVo}</div></b>
                </IconButton>
              </Grid>

              <Divider />
              <Grid className={classes.purposeCard}>
                <Grid item xs={12} style={{ width: "74%" }}>
                  <Autocomplete
                    id="combo-box-demo"
                    disabled={false}
                    options={loan_app}
                    getOptionLabel={(option) => option.purpose}
                    onChange={(event, value) => {
                      this.handleFieldChange(event, value);
                    }}
                    value={handlePurposeChange ? loan_app[loan_app.findIndex(function (item, i) {
                      return item.id == handlePurposeChange.id;
                    })] : loan_app[0]}
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
                          <td >
                            <b>Loan Amount <br /> Rs. {loan_amnt} </b><br /><br />
                            <b>Duration <br /> {duration} Months </b><br /><br />
                            <b>Area/Size/Specifications <br /> {specification} </b><br /><br />
                          </td>
                        </tr>
                      </table>
                    </td>

                    <td style={{ paddingBottom: "50px" }}>
                      <b><table style={{ width: "100%", height: "100%" }}>
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
                        {this.state.loan_installments ? this.state.loan_installments.map(row => (
                          <tr>
                            <td>{row.payment_date}</td>
                            <td>{row.expected_principal}</td>
                            <td>{row.expected_interest}</td>
                          </tr>
                        )) : null}
                      </table></b>
                    </td>
                  </tr>
                </table>
              </Grid>
              <Divider />

              <br />
              <Grid>
                <Button onClick={this.SaveData.bind(this)}>Save</Button>
                &nbsp;&nbsp;&nbsp;
                <Button color="secondary" clicked={this.cancelForm}>
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