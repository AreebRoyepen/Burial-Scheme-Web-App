import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, Switch } from "react-router-dom";
import {createBrowserHistory} from "history";
import "./index.css";
import * as serviceWorker from "./serviceWorker";

import MemberPage from "./components/modules/members/MemberPage";
import Members from "./components/modules/members/Members";

import Payments from "./components/modules/tickets/Payments";
import Menu from "./components/Menu";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

import Reports from "./components/modules/admin/Reports";
import DependantPage from "./components/modules/dependants/DependantPage";
import Dependants from "./components/modules/dependants/Dependants";

const history = createBrowserHistory();

ReactDOM.render(
  <Router history={history}>
    <Switch>

      <Route exact path="/" render={() => <Login />} />
      
      <Route path="/Dashboard" render={() => (<Menu> <Dashboard /></Menu> )} />

      <Route path="/MemberPage" render={() => ( <Menu> <MemberPage /> </Menu> )}/>

      <Route path="/Members" render={() => ( <Menu> <Members /> </Menu> )}/>

      <Route path="/DependantPage" render={() => ( <Menu> <DependantPage /> </Menu> )}/>

      <Route path="/Dependants" render={() => ( <Menu> <Dependants /> </Menu> )}/>


      
      <Route path="/Payments" render={() => (<Menu> <Payments /></Menu> )} />

      



      <Route path="/Reports" render={() => ( <Menu> <Reports /> </Menu> )}/>


     
    </Switch>
  </Router>,
  document.getElementById("root")
);

serviceWorker.register();
