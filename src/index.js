import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, Switch } from "react-router-dom";
import {createBrowserHistory} from "history";
import "./index.css";
import * as serviceWorker from "./serviceWorker";

import PersonPage from "./components/modules/people/PersonPage";
import People from "./components/modules/people/People";

import Payments from "./components/modules/tickets/Payments";
import Menu from "./components/Menu";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

import Reports from "./components/modules/admin/Reports";

const history = createBrowserHistory();

ReactDOM.render(
  <Router history={history}>
    <Switch>

      <Route exact path="/" render={() => <Login />} />
      
      <Route path="/Dashboard" render={() => (<Menu> <Dashboard /></Menu> )} />

      <Route path="/PersonPage" render={() => ( <Menu> <PersonPage /> </Menu> )}/>
      
      <Route path="/Payments" render={() => (<Menu> <Payments /></Menu> )} />

      <Route path="/People" render={() => ( <Menu> <People /> </Menu> )}/>

      <Route path="/Reports" render={() => ( <Menu> <Reports /> </Menu> )}/>


     
    </Switch>
  </Router>,
  document.getElementById("root")
);

serviceWorker.register();
