import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import auth from "../../components/Auth/Auth";
import DashboardCSP from "./DashboardCSP.js";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  async componentDidMount() { }

  render() {
    const { classes } = this.props;
    const userInfo = auth.getUserInfo();

    return (
      <Layout>
        <h3>Welcome {userInfo.username}</h3>
        {userInfo.role.name === "Superadmin" ? (
          <div>
          </div>
        ) : null}
        {userInfo.role.name === "Sesta Admin" ? (
          <div>
          </div>
        ) : null}
        {userInfo.role.name === "FPO Admin" ? (
          <div>
          </div>
        ) : null}
        {userInfo.role.name === "CSP (Community Service Provider)" ? (
          <div>
            <DashboardCSP></DashboardCSP>
          </div>
        ) : null}
      </Layout>
    );
  }
}

export default Dashboard;
