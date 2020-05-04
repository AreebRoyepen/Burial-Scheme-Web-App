import React, { useEffect, useRef } from "react";
import { Link , useHistory, useLocation} from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import DehazeIcon from '@material-ui/icons/Dehaze';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import MenuUI from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItem from '@material-ui/core/ListItem';
import { TiTicket } from "react-icons/ti";
import {MdEvent, MdDashboard,MdPeople, MdAssignment, MdContacts, MdVerifiedUser} from "react-icons/md";
import Api from "../api/Api";

import "../styles/menu.css";

const useStyles = makeStyles(theme =>({
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
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
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [user, setUser] = React.useState(null)
  
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
    if(localStorage.user){

      setUser(JSON.parse(localStorage.user))
      
      var id = setInterval(() =>{
        //setOpenModal(openModal);
        async function fetchData(){
                        
          let x = await Api.refresh("refresh")
          console.log(x)
          
          if(x.message === "success"){

            console.log("refreshed")
                                    
          }else if (x.message === "unauthorized"){
            localStorage.clear();
            history.push("/")

          }
      }
          
      

      fetchData() 
      if(!isMounted.current) return clearInterval(id)
      

      }
      , ((parseInt(localStorage.expiration) -(1/2 * parseInt(localStorage.expiration)))* 1000));      

      

    }else{
      return
    }


  },[setUser, setOpenModal, isMounted])


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
        <ListItem className="menuHeader" ><TiTicket/>&nbsp;GIS Burial Scheme</ListItem>
        <List>
          <ListItem> <MdDashboard className="iconStyling"/><Link className="menuText" to="/Dashboard">&nbsp;&nbsp;&nbsp;Dashboard</Link></ListItem>
        </List>
        <Divider/>
        <ListItem> <MdPeople  className="iconStyling"/><Link className="menuText" to="/People">&nbsp;&nbsp;&nbsp;People</Link></ListItem>
        
        {user ?        
        adminPanel()
        :
        <div/>
        }

      </List>
    </div>
  );

  const adminPanel = () =>{

    if(user.role.id === 1)
    return (
      <div>
        <hr style={{height: '14px',boxShadow: 'inset 0 12px 12px -12px  #08533C'}}/>
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
      {localStorage.user ?

          <div className={classes.root}>
          {popup()}
          <AppBar id= "appBarColor" position="fixed">
            <Toolbar>
            <Button onClick={toggleDrawer('left', true)}><DehazeIcon id ="menuIcon"/></Button>
          <Drawer open={state.left} onClose={toggleDrawer('left', false)} children={sideList('left')}>
          </Drawer>
            <Typography variant="h6" align = "center" className={classes.title}>
               Burial Society
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
                    <MenuItem onClick = {() => { history.push("/", {last : location.pathname});   localStorage.clear(); }}> Log Out</MenuItem>
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