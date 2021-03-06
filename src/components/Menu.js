import React, { useState, useEffect, useRef } from "react";
import jwt from "jwt-decode";
import { Link , useHistory, useLocation} from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import MenuUI from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItem from '@material-ui/core/ListItem';
import {
  MdMonetizationOn,
  MdArrowUpward,
  MdArrowDownward,
  MdDashboard,
  MdPeople,
  MdPeopleOutline,
  MdAssignment,
  MdContacts,
  MdVerifiedUser,
  MdDehaze
} from "react-icons/md";

import "../styles/menu.css";

const useStyles = makeStyles(theme =>({
  list: {
    width: 300,
  },
  // fullList: {
  //   width: 'auto',
  // },
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export default function Menu({children}) {
  const classes = useStyles();
  const [state, setState] = useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [user, setUser] = useState(null)
  
  const isMounted = useRef(true)

  let history = useHistory();
  let location = useLocation();

//clean up function
  useEffect(() => {
    return () => { 
      isMounted.current = false
    }
  }, [])

  useEffect( () => {

    //upon setting user to local storage
    //start calling refresh endpoint so session does expire
    if(localStorage.token){

      let decode = jwt(localStorage.token);
      //console.log(JSON.stringify(decode.user))
      setUser(decode.user)    

    }else{
      return
    }

  },[setUser, isMounted])


  const handleMenu = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };


  const toggleDrawer = (side, open) => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setState({ ...state, [side]: open });
  };

  const sideList = side => (
    <div
      className={classes.list}
      role="presentation"
      onClick={toggleDrawer(side, false)}
      onKeyDown={toggleDrawer(side, false)}
    >
      <List>
        {/* <ListItem className="menuHeader" ><TiTicket/>&nbsp;GIS Burial Scheme</ListItem> */}
        <List>
          <ListItem> <MdDashboard className="iconStyling"/><Link className="menuText" to="/Dashboard">&nbsp;&nbsp;&nbsp;Dashboard</Link></ListItem>
        </List>
        <Divider/>
        <ListItem> <MdPeople  className="iconStyling"/><Link className="menuText" to="/Members">&nbsp;&nbsp;&nbsp;Members</Link></ListItem>

        <ListItem> <MdPeopleOutline  className="iconStyling"/><Link className="menuText" to="/Dependants">&nbsp;&nbsp;&nbsp;Dependants</Link></ListItem>

        <hr style={{height: '14px',boxShadow: 'inset 0 4px 4px -4px  #1A2819'}}/>

        <ListItem> <MdArrowUpward  className="iconStyling"/><Link className="menuText" to="/Premiums">&nbsp;&nbsp;&nbsp;Premiums</Link></ListItem>

        <ListItem><MdArrowDownward className="iconStyling"/><Link className="menuText" to="/Claims">&nbsp;&nbsp;&nbsp;Claims</Link></ListItem>

        <ListItem> <MdMonetizationOn  className="iconStyling"/><Link className="menuText" to="/AdhocFunds">&nbsp;&nbsp;&nbsp;AdhocFunds</Link></ListItem>        
        
        <hr style={{height: '14px',boxShadow: 'inset 0 4px 4px -4px  #1A2819'}}/>
        
        <ListItem> <MdAssignment  className="iconStyling"/><Link className="menuText" to="/Statements">&nbsp;&nbsp;&nbsp;Statements</Link></ListItem>
        
        {/* <hr style={{height: '14px',boxShadow: 'inset 0 4px 4px -4px  #1A2819'}}/> */}
        {/* {user ?        
        adminPanel()
        :
        <div/>
        } */}

      </List>
    </div>
  );

  const adminPanel = () =>{

    if(user.role.id === 1)
    return (
      <div>
        <hr style={{height: '14px',boxShadow: 'inset 0 12px 12px -12px  #1A2819'}}/>
        <ListItem className="menuHeader" style={{marginBottom:'12px'}}><MdVerifiedUser/>&nbsp;Admin</ListItem>
      <ListItem style={{marginLeft:'20px'}}> 
      <MdContacts  className="iconStyling"/>
      <Link className="menuText" to="/Users">&nbsp;&nbsp;&nbsp;Users</Link>
      </ListItem>
      </div>
    );

  }

  return (
    <div>
      {localStorage.token ?

          <div className={classes.root}>
          <AppBar id= "appBarColor" position="static"
          >
            <Toolbar>
            <Button onClick={toggleDrawer('left', true)}><MdDehaze id ="menuIcon"/></Button>
          <Drawer open={state.left} onClose={toggleDrawer('left', false)} children={sideList('left')}>
          </Drawer>
            <Typography variant="h6" align = "center" className={classes.title}>
               Burial Scheme Web App
              </Typography>
              
              <Button onClick={handleMenu} color="inherit">Hi, {user ? user.name : ""}</Button>

              <MenuUI
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={open}
                    onClose={handleClose}
                  >
                    <MenuItem onClick = {() => { history.push("/", {last : location.pathname});   //localStorage.clear(); 
                    }}> Log Out</MenuItem>
                  </MenuUI>

            </Toolbar>
          </AppBar>
          {children}
          </div>
    
    
      :

      //if they are not logged in they are booted out to log in page
      history.push("/")
      

      
      }


    </div>

  );
}