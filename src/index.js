import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, Switch } from "react-router-dom";
import {createBrowserHistory} from "history";
import {MuiPickersUtilsProvider} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import "./index.css";
import * as serviceWorker from "./serviceWorker";

import MemberPage from "./components/modules/members/MemberPage";
import Members from "./components/modules/members/Members";

import Menu from "./components/Menu";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

import Reports from "./components/modules/admin/Reports";
import DependantPage from "./components/modules/dependants/DependantPage";
import Dependants from "./components/modules/dependants/Dependants";
import AdhocFunds from "./components/modules/funds/AdhocFunds";
import Claims from "./components/modules/funds/Claims";
import Premiums from "./components/modules/funds/Premiums";

const history = createBrowserHistory();

ReactDOM.render(
  <Router history={history}>
    <MuiPickersUtilsProvider utils = {DateFnsUtils}>
    <Switch>

      <Route exact path="/" render={() => <Login />} />
      
      <Route path="/Dashboard" render={() => (<Menu> <Dashboard /></Menu> )} />

      <Route path="/MemberPage" render={() => ( <Menu> <MemberPage /> </Menu> )}/>

      <Route path="/Members" render={() => ( <Menu> <Members /> </Menu> )}/>

      <Route path="/DependantPage" render={() => ( <Menu> <DependantPage /> </Menu> )}/>

      <Route path="/Dependants" render={() => ( <Menu> <Dependants /> </Menu> )}/>


      
      <Route path="/AdhocFunds" render={() => (<Menu> <AdhocFunds /></Menu> )} />

      <Route path="/Claims" render={() => (<Menu> <Claims /></Menu> )} />

      <Route path="/Premiums" render={() => (<Menu> <Premiums /></Menu> )} />



      <Route path="/Reports" render={() => ( <Menu> <Reports /> </Menu> )}/>


     
    </Switch>
    </MuiPickersUtilsProvider>
  </Router>,
  document.getElementById("root")
);

serviceWorker.register();
