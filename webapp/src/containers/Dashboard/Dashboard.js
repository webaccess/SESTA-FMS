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
        <a href="/villages/add">Add Village</a>
        <a href="/villages/edit/2">Edit Village</a>
      </div>
      // </Layout>
    );
  }
}

export default Dashboard;
