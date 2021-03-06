import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, Switch } from "react-router-dom";
import {createBrowserHistory} from "history";
import {MuiPickersUtilsProvider} from '@material-ui/pickers';

import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import DateFnsUtils from '@date-io/date-fns';
import "./index.css";
import * as serviceWorker from "./serviceWorker";

import Menu from "./components/Menu";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Reports from "./components/modules/admin/Reports";

import MemberForm from "./components/modules/members/MemberForm";
import MembersV2 from "./components/modules/members/MembersV2";

import DependantForm from "./components/modules/dependants/DependantForm";
import DependantsV2 from "./components/modules/dependants/DependantsV2";

import AdhocFunds from "./components/modules/funds/AdhocFunds";
import Claims from "./components/modules/funds/Claims";
import Premiums from "./components/modules/funds/Premiums";
import Statements from "./components/modules/admin/Statements";


const history = createBrowserHistory();


const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#1A2819",
    },
    secondary: {
      main: "#866F3E",
    },
  },
});

ReactDOM.render(
  <ThemeProvider theme={theme}>
  <Router history={history}>
    <MuiPickersUtilsProvider utils = {DateFnsUtils}>
    <Switch>

      <Route exact path="/" render={() => <Login />} />
      
      <Route path="/Dashboard" render={() => (<Menu> <Dashboard /></Menu> )} />

      {/* <Route path="/MemberPage" render={() => ( <Menu> <MemberPage /> </Menu> )}/> */}

      <Route path="/MemberPage" render={() => ( <Menu> <MemberForm /> </Menu> )}/>

      {/* <Route path="/Members" render={() => ( <Menu> <Members /> </Menu> )}/> */}

      <Route path="/Members" render={() => ( <Menu> <MembersV2 /> </Menu> )}/>

      <Route path="/DependantPage" render={() => ( <Menu> <DependantForm /> </Menu> )}/>

      <Route path="/Dependants" render={() => ( <Menu> <DependantsV2 /> </Menu> )}/>

      {/* <Route path="/DependantsV2" render={() => ( <Menu> <DependantsV2 /> </Menu> )}/> */}
      
      <Route path="/AdhocFunds" render={() => (<Menu> <AdhocFunds /></Menu> )} />

      <Route path="/Claims" render={() => (<Menu> <Claims /></Menu> )} />

      <Route path="/Premiums" render={() => (<Menu> <Premiums /></Menu> )} />



      <Route path="/Reports" render={() => ( <Menu> <Reports /> </Menu> )}/>

      <Route path="/Statements" render={() => ( <Menu> <Statements /> </Menu> )}/>


     
    </Switch>
    </MuiPickersUtilsProvider>
  </Router>
  </ThemeProvider>,
  document.getElementById("root")
);

serviceWorker.register();
