import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import auth from "../../components/Auth/Auth";
import DashboardCSP from "./DashboardCSP.js";
import DashboardFPO from "./DashboardFPO";
import DashboardSestaAdmin from "./DashboardSestaAdmin";

class Dashboard extends Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {}

  render() {
    const { classes } = this.props;
    const userInfo = auth.getUserInfo();

    return (
      <Layout>
        <h3
          style={{ fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif" }}
        >
          DASHBOARD
        </h3>

        {userInfo.role.name === "FPO Admin" ? <DashboardFPO /> : null}

        {userInfo.role.name === "Sesta Admin" ||
        userInfo.role.name === "Superadmin" ? (
          <DashboardSestaAdmin></DashboardSestaAdmin>
        ) : null}

        {userInfo.role.name === "CSP (Community Service Provider)" ? (
          <DashboardCSP></DashboardCSP>
        ) : null}
      </Layout>
    );
  }
}

export default Dashboard;
