import React, { Component } from "react";
import style from "./Loans.module.css";
import Layout from "../../hoc/Layout/Layout";
import { withStyles } from "@material-ui/core/styles";
import * as serviceProvider from "../../api/Axios";
import auth from "../../components/Auth/Auth";
import Autocomplete from "../../components/Autocomplete/Autocomplete";
import Input from "../../components/UI/Input/Input";
import { Card, Divider, Grid, Fab } from "@material-ui/core";
import PersonIcon from "@material-ui/icons/Person";
import MoneyIcon from "@material-ui/icons/Money";
import Button from "../../components/UI/Button/Button";
import Moment from "moment";
import { Link } from "react-router-dom";
import * as constants from "../../constants/Constants";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import { map } from "lodash";
import validateInput from "../../components/Validation/ValidateInput/ValidateInput";

const useStyles = (theme) => ({
  root: {
    "& > span": {
      margin: theme.spacing(2),
    },
  },
  spacer: {
    flexGrow: 1,
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
    fontSize: "10px",
  },
  mainContent: {
    padding: "25px",
  },
  fieldValues: {
    fontSize: "13px !important",
  },
});

class LoanApprovalPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loanStatusList: constants.LOAN_STATUS,
      values: {},
      data: {},
      selectedFile: null,
      fileDataArray: [],
      fileName: "",
      validations: {
        comment: {
          required: {
            value: "true",
            message: "Comment is required",
          },
        },
      },
      errors: {},
      editPage: [
        this.props.match.params.id !== undefined ? true : false,
        this.props.match.params.id,
      ],
    };
  }

  async componentDidMount() {
    // get loan application details
    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
        "loan-applications/" +
        this.state.editPage[1]
      )
      .then((res) => {
        this.getAllDetails(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  getAllDetails = (data) => {
    let document;
    let purpose = data.purpose;
    let applicationDate = Moment(data.application_date).format("DD MMM YYYY");
    let loanAmnt = "Rs." + data.loan_model.loan_amount.toLocaleString();
    let duration = data.loan_model.duration + " Months";
    let status = data.status;
    let comment = data.review_comments;
    if (data.document.length > 0) {
      document = data.document[0].name + data.document[0].ext;
    } else {
      document = "";
    }

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL +
        "crm-plugin/individuals/" +
        data.contact.individual
      )
      .then((res) => {
        let loaneeName = res.data.first_name + " " + res.data.last_name;
        let shgName = res.data.shg.name;
        serviceProvider
          .serviceProviderForGetRequest(
            process.env.REACT_APP_SERVER_URL +
            "crm-plugin/contact/?organization.id=" +
            res.data.shg.organization
          )
          .then((response) => {
            let voName = response.data[0].organization.vos[0].name;
            let villageName = response.data[0].villages[0].name;
            this.setState({
              data: {
                loanee: loaneeName,
                shg: shgName,
                village: villageName,
                vo: voName,
                purpose: purpose,
                applicationDate: applicationDate,
                loanAmount: loanAmnt,
                duration: duration,
              },
              values: { selectedStatus: status, comment: comment },
              fileName: document,
            });
          })
          .catch();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  validate = () => {
    const values = this.state.values;
    const validations = this.state.validations;
    map(validations, (validation, key) => {
      let value = values[key] ? values[key] : "";
      const errors = validateInput(value, validation);

      let errorset = this.state.errors;
      if (errors.length > 0) errorset[key] = errors;
      else delete errorset[key];
      this.setState({ errors: errorset });
    });
  };

  hasError = (field) => {
    if (this.state.errors[field] !== undefined) {
      return Object.keys(this.state.errors).length > 0 &&
        this.state.errors[field].length > 0
        ? true
        : false;
    }
  };

  handleStatusChange = (event, value) => {
    if (value !== null) {
      this.setState({
        values: { ...this.state.values, selectedStatus: value.id },
      });
    } else {
      this.setState({
        values: {
          ...this.state.values,
          selectedStatus: "",
        },
      });
    }
  };

  handleChange = ({ target }) => {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value },
    });
  };

  onChangeHandler = (event) => {
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0,
      fileName: event.target.files[0].name,
    });
  };

  onSave = () => {
    this.validate();
    if (Object.keys(this.state.errors).length > 0) return;
    if (this.state.selectedFile !== null) {
      const formData = new FormData(); // Create an object of formData
      formData.append("files", this.state.selectedFile); // Update the formData object

      // Request made to the backend api & Send formData object
      serviceProvider
        .serviceProviderForPostRequest(
          process.env.REACT_APP_SERVER_URL + "upload",
          formData
        )
        .then((res) => {
          this.setState({ fileDataArray: res.data[0] });
          this.saveLoanAppData();
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      this.saveLoanAppData();
    }
  };

  saveLoanAppData() {
    // update loan application status, approved date, approved by, document fields (done by FPO admin only)
    let approvedBy;
    let userInfo = auth.getUserInfo();
    if (userInfo.contact) {
      approvedBy = userInfo.contact.id;
    }
    let postData = {
      status: this.state.values.selectedStatus,
      approved_date: Moment().format("YYYY-MM-DD"),
      review_comments: this.state.values.comment,
      approved_by: approvedBy,
      document: this.state.fileDataArray,
    };
    serviceProvider
      .serviceProviderForPutRequest(
        process.env.REACT_APP_SERVER_URL + "loan-applications",
        this.state.editPage[1],
        postData
      )
      .then((loanAppRes) => {
        if (this.state.values.selectedStatus === "Approved") {
          this.saveLoanAppTasks(loanAppRes.data);
          this.saveLoanAppInstallments(loanAppRes.data);
        } else {
          this.props.history.push({
            pathname: "/loans",
            state: { loanApproved: true },
          });
        }
      })
      .catch((error) => { });
  }

  saveLoanAppTasks = (data) => {
    let appTaskArray = [];
    data.loan_application_tasks.map((task1) => {
      appTaskArray.push(task1.name);
    });
    if (data.status === "Approved") {
      // if loan is approved, make entries in loan application tasks table
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL + "loan-models/" + data.loan_model.id
        )
        .then((loanModelRes) => {
          loanModelRes.data.loantasks.forEach((element) => {
            let postLoanTaskData = {
              status: "Scheduled",
              loan_application: data.id,
              // name: element.name,
              name: element.activitytype.name,
            };

            if (!appTaskArray.includes(element.name)) {
              serviceProvider
                .serviceProviderForPostRequest(
                  process.env.REACT_APP_SERVER_URL + "loan-application-tasks",
                  postLoanTaskData
                )
                .then((res) => {
                  this.props.history.push({
                    pathname: "/loans",
                    state: { loanApproved: true },
                  });
                })
                .catch((error) => { });
            }
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  saveLoanAppInstallments = (data) => {
    let appInstallmentsArray = [];
    data.loan_app_installments.map((item) => {
      appInstallmentsArray.push(item.expected_principal);
    });

    serviceProvider
      .serviceProviderForGetRequest(
        process.env.REACT_APP_SERVER_URL + "loan-models/" + data.loan_model.id
      )
      .then((res) => {
        if (data.status === "Approved") {
          res.data.emidetails.forEach((emi, index) => {
            // To add a payment date from next of loan approval date
            var startMonth = Moment().add(1, "M").format("YYYY-MM-DD");
            var futureMonth = Moment(startMonth)
              .add(index, "M")
              .format("YYYY-MM-DD");
            // To add month as emi number, if duration = 12months, emiNo = 1 to 12
            var emiNo = index + 1;

            let postEmiData = {
              month: emiNo,
              payment_date: futureMonth,
              expected_principal: emi.principal,
              expected_interest: emi.interest,
              loan_application: data.id,
            };

            if (!appInstallmentsArray.includes(emi.principal)) {
              serviceProvider
                .serviceProviderForPostRequest(
                  process.env.REACT_APP_SERVER_URL +
                  "loan-application-installments",
                  postEmiData
                )
                .then((res) => {
                  serviceProvider
                    .serviceProviderForGetRequest(
                      process.env.REACT_APP_SERVER_URL + "loan-applications"
                    )
                    .then((resp) => {
                      this.props.history.push({
                        pathname: "/loans",
                        state: {
                          loanApproved: true,
                          loanAppResData: resp.data,
                        },
                      });
                    });
                })
                .catch((error) => { });
            }
          });
        }
      })
      .catch((error) => { });
  };

  render() {
    const { classes } = this.props;

    let data = this.state.data;
    let statusValue = this.state.values.selectedStatus;

    return (
      <Layout>
        <Grid>
          <div className="App">
            <h5 className={style.loan}>LOAN</h5>
            <h2 className={style.title}>Loan Approval</h2>

            <Card className={classes.mainContent}>
              <Grid
                container
                spacing={3}
                style={{ padding: "20px 0px", alignItems: "center" }}
              >
                <Grid spacing={1} xs={1}>
                  <PersonIcon className={classes.Icon} />
                </Grid>
                <Grid spacing={1} xs={11}>
                  <Grid container spacing={3}>
                    <Grid spacing={2} xs={3}>
                      <b>
                        <div className={classes.member}>
                          LOANEE
                          <br />
                          <span className={classes.fieldValues}>
                            {data.loanee}
                          </span>
                        </div>
                      </b>
                    </Grid>
                    <Grid spacing={2} xs={3}>
                      <b>
                        <div className={classes.member}>
                          SHG GROUP <br />
                          <span className={classes.fieldValues}>
                            {data.shg}
                          </span>
                        </div>
                      </b>
                    </Grid>
                    <Grid spacing={2} xs={3}>
                      <b>
                        <div className={classes.member}>
                          VILLAGE <br />
                          <span className={classes.fieldValues}>
                            {data.village}
                          </span>
                        </div>
                      </b>
                    </Grid>
                    <Grid spacing={2} xs={3}>
                      <b>
                        <div className={classes.member}>
                          VILLAGE ORGANIZATION <br />
                          <span className={classes.fieldValues}>{data.vo}</span>
                        </div>
                      </b>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Divider />
              <Grid
                container
                spacing={3}
                style={{ padding: "20px 0px", alignItems: "center" }}
              >
                <Grid spacing={1} xs={1}>
                  <MoneyIcon className={classes.Icon} />
                </Grid>
                <Grid spacing={1} xs={11}>
                  <Grid container spacing={3}>
                    <Grid spacing={2} xs={3}>
                      <b>
                        <div className={classes.member}>
                          PURPOSE
                          <br />
                          <span className={classes.fieldValues}>
                            {data.purpose}
                          </span>
                        </div>
                      </b>
                    </Grid>
                    <Grid spacing={2} xs={3}>
                      <b>
                        <div className={classes.member}>
                          APPLICATION DATE <br />
                          <span className={classes.fieldValues}>
                            {data.applicationDate}
                          </span>
                        </div>
                      </b>
                    </Grid>
                    <Grid spacing={2} xs={3}>
                      <b>
                        <div className={classes.member}>
                          LOAN AMOUNT <br />
                          <span className={classes.fieldValues}>
                            {data.loanAmount}
                          </span>
                        </div>
                      </b>
                    </Grid>
                    <Grid spacing={2} xs={3}>
                      <b>
                        <div className={classes.member}>
                          LOAN DURATION <br />
                          <span className={classes.fieldValues}>
                            {data.duration}
                          </span>
                        </div>
                      </b>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Divider />
              <Grid container spacing={3} style={{ padding: "20px 0px" }}>
                <Grid item md={12}>
                  <label htmlFor="upload-file">
                    <input
                      style={{ display: "none" }}
                      required
                      type="file"
                      name="upload-file"
                      id="upload-file"
                      onChange={this.onChangeHandler}
                    />
                    <Fab
                      color="primary"
                      size="medium"
                      component="span"
                      aria-label="add"
                      variant="extended"
                    >
                      <FileCopyIcon /> Upload loan application
                    </Fab>
                  </label>{" "}
                  &nbsp;&nbsp;&nbsp;
                  {this.state.fileName !== "" ? (
                    <label style={{ color: "green", fontSize: "11px" }}>
                      Selected File: {this.state.fileName}
                    </label>
                  ) : (
                      <label style={{ color: "red", fontSize: "11px" }}>
                        No File Selected!
                      </label>
                    )}
                </Grid>
                <Grid item md={5} xs={12}>
                  <Autocomplete
                    id="selectStatus"
                    name="loanStatus"
                    options={this.state.loanStatusList}
                    variant="outlined"
                    getOptionLabel={(option) => option.name}
                    placeholder="Select Status"
                    onChange={this.handleStatusChange}
                    value={
                      statusValue
                        ? this.state.loanStatusList[
                        this.state.loanStatusList.findIndex(function (
                          item,
                          i
                        ) {
                          return item.id === statusValue;
                        })
                        ] || null
                        : null
                    }
                    renderInput={(params) => (
                      <Input
                        {...params}
                        fullWidth
                        label="Select Status"
                        name="loanStatus"
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>
                <Grid item md={7} xs={12}>
                  <Input
                    fullWidth
                    label="Comment"
                    name="comment"
                    error={this.hasError("comment")}
                    helperText={
                      this.hasError("comment")
                        ? this.state.errors.comment[0]
                        : null
                    }
                    value={this.state.values.comment || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
              <Divider />
              <br />
              <Grid>
                <Button onClick={this.onSave.bind(this)}>Save</Button>
                &nbsp;&nbsp;&nbsp;
                <Button
                  color="secondary"
                  clicked={this.cancelForm}
                  component={Link}
                  to="/loans"
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
export default withStyles(useStyles)(LoanApprovalPage);
