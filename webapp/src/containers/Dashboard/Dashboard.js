import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import auth from "../../components/Auth/Auth";
import Village from "../Villages/Villages";

class Dashboard extends Component {
  render() {
    const userInfo = auth.getUserInfo();
    return (
      // <Layout>
        <div>
          <h3>Welcome {userInfo.username}</h3>
          <Village />
        </div>
      // </Layout> 
    );
  }
}

export default Dashboard;
