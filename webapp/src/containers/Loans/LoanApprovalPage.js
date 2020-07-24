import React, { Component } from "react";
import style from "./Loans.module.css";
import Layout from "../../hoc/Layout/Layout";
import { withStyles } from "@material-ui/core/styles";
import * as serviceProvider from "../../api/Axios";
import auth from "../../components/Auth/Auth";
import Table from "../../components/Datatable/Datatable.js";
import Autocomplete from "../../components/Autocomplete/Autocomplete";
import Input from "../../components/UI/Input/Input";
import { Card, Divider, Grid } from "@material-ui/core";
import PersonIcon from "@material-ui/icons/Person";
import MoneyIcon from "@material-ui/icons/Money";
import TextField from "@material-ui/core/TextField";
import Button from "../../components/UI/Button/Button";
import Moment from "moment";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import { Link } from "react-router-dom";
import * as constants from "../../constants/Constants";
import { sign } from "crypto";
import { size } from "lodash";

const useStyles = (theme) => ({
  root: {
    "& > span": {
      margin: theme.spacing(2),
    },
  },
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
      editPage: [
        this.props.match.params.id !== undefined ? true : false,
        this.props.match.params.id,
      ],
    };
  }
  async componentDidMount() {
    console.log("--user--", auth.getUserInfo());
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
    console.log("--loanapp loas res-- ", data);
    let document;
    let purpose = data.purpose;
    let applicationDate = Moment(data.application_date).format("DD MMM YYYY");
    let loanAmnt = data.loan_model.loan_amount.toLocaleString();
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
    });
  };

  onSave = () => {
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
    console.log("-- postdata -- ", postData);
    serviceProvider
      .serviceProviderForPutRequest(
        process.env.REACT_APP_SERVER_URL + "loan-applications",
        this.state.editPage[1],
        postData
      )
      .then((loanAppRes) => {
        console.log("--save res--", loanAppRes.data);
        this.saveLoanAppTasks(loanAppRes.data);
      })
      .catch((error) => {});
  }

  saveLoanAppTasks = (data) => {
    console.log("--loanAppres--", data);
    if (data.status === "Approved") {
      // if loan is approved, make entries in loan application tasks table
      serviceProvider
        .serviceProviderForGetRequest(
          process.env.REACT_APP_SERVER_URL + "loan-models/" + data.loan_model.id
        )
        .then((loanModelRes) => {
          console.log("--loanModelRes-- ", loanModelRes.data);
          loanModelRes.data.loantasks.forEach((element) => {
            let postLoanTaskData = {
              date: Moment().format("YYYY-MM-DD"),
              status: true,
              comments: data.review_comments,
              loan_application: data.id,
              name: element.name,
            };
            console.log("--postloantaskdata-- ", postLoanTaskData);
            serviceProvider
              .serviceProviderForPostRequest(
                process.env.REACT_APP_SERVER_URL + "loan-application-tasks",
                postLoanTaskData
              )
              .then((res) => {
                console.log("--loanAppTask save res-- ", res.data);
              })
              .catch((error) => {
                console.log(error);
              });
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  render() {
    const { classes } = this.props;
    console.log("--data service-- ", this.state.data);
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
                style={{ display: "inline-flex", padding: "20px 0px" }}
              >
                <PersonIcon className={classes.Icon} />
                <b>
                  <div className={classes.member}>
                    LOANEE
                    <br />
                    <span className={classes.fieldValues}>{data.loanee}</span>
                  </div>
                </b>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>
                  <div className={classes.member}>
                    SHG GROUP <br />
                    <span className={classes.fieldValues}>{data.shg}</span>
                  </div>
                </b>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>
                  <div className={classes.member}>
                    VILLAGE <br />
                    <span className={classes.fieldValues}>{data.village}</span>
                  </div>
                </b>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>
                  <div className={classes.member}>
                    VILLAGE ORGANIZATION <br />
                    <span className={classes.fieldValues}>{data.vo}</span>
                  </div>
                </b>
              </Grid>
              <Divider />
              <Grid
                container
                spacing={3}
                style={{ display: "inline-flex", padding: "20px 0px" }}
              >
                <MoneyIcon className={classes.Icon} />
                <b>
                  <div className={classes.member}>
                    PURPOSE
                    <br />
                    <span className={classes.fieldValues}>{data.purpose}</span>
                  </div>
                </b>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>
                  <div className={classes.member}>
                    APPLICATION DATE <br />
                    <span className={classes.fieldValues}>
                      {data.applicationDate}
                    </span>
                  </div>
                </b>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>
                  <div className={classes.member}>
                    LOAN AMOUNT <br />
                    <span className={classes.fieldValues}>
                      {data.loanAmount}
                    </span>
                  </div>
                </b>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <b>
                  <div className={classes.member}>
                    LOAN DURATION <br />
                    <span className={classes.fieldValues}>{data.duration}</span>
                  </div>
                </b>
              </Grid>
              <Divider />
              <Grid container spacing={3} style={{ padding: "20px 0px" }}>
                <Grid item md={12}>
                  Select Document &nbsp;&nbsp;&nbsp;
                  <input
                    required
                    type="file"
                    name="file"
                    onChange={this.onChangeHandler}
                  />
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
                <Grid item md={3} xs={12}>
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
                        // error={this.hasError("loanStatus")}
                      />
                    )}
                  />
                </Grid>
                <Grid item md={9} xs={12}>
                  <Input
                    fullWidth
                    label="Comment"
                    name="comment"
                    // error={this.hasError("comment")}
                    // helperText={
                    //   this.hasError("comment")
                    //     ? this.state.errors.comment[0]
                    //     : null
                    // }
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
