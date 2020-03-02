import React, { Component } from "react";
import Router from "./Routes.js";
import { ThemeProvider } from "@material-ui/styles";
import theme from "./theme";

class App extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <Router />
      </ThemeProvider>
    );
  }
}

export default App;
