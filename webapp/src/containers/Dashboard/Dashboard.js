import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import auth from '../../components/Auth/Auth';

class Dashboard extends Component {
  render() {
    const userInfo = auth.getUserInfo()
    return (
      <Layout>
          <h3>Welcome {userInfo.username}</h3>
      </Layout>

    );
  }
}

export default Dashboard;
