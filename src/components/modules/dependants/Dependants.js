import React, { useState, useEffect } from "react";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory, useLocation } from "react-router-dom";
import CardList from "../shared/CardList";
import { LoadingIcon } from "../shared/LoadingIcon";
import {ErrorPage} from "../shared/ErrorPage";
import Api from "../../../api/Api";
import "../../../styles/eventCard.css";


function Alert(props) {
    return <MuiAlert elevation={6} {...props} />;
  }
  
  const useStyles = makeStyles(theme => ({
    root: {
      width: '100%',
      '& > * + *': {
        marginTop: theme.spacing(2),
      },
    },
  }));
  
export default function Dependants(){

    const [data, setData] = useState([]);
    const [connection, setConnection] = useState(false);
    const [error,setError] = useState(false)

    let history = useHistory();
    let location = useLocation()

    const classes = useStyles();
    const [openSnackbar, setOpenSnackbar] = useState({
      severity : "",
      message : "",
      open : false,
      time : 0,
      closeType : null
    });

    const errorClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setOpenSnackbar({...openSnackbar, [openSnackbar.open]:false})
      };

    useEffect(() => {
        async function fetchData(){

            let x = await Api.getRequest("v1/dependants");
            if(x.message === "SUCCESS"){
                setData(x.data)
                setConnection(true)
            }else if (x.message === "unauthorized"){
                localStorage.clear();
                history.push("/" , {last: location.pathname})
            }else{
                setOpenSnackbar({severity : "error", message : "Check your internet connection", open : true, time : 6000, closeType : errorClose})
                setError(true)
              }

        }
      
        fetchData()
    },[history]);

    return (
        <div>
            <div className={classes.root}>
            <Snackbar open={openSnackbar.open} autoHideDuration={openSnackbar.time} onClose={openSnackbar.closeType}>
                <Alert onClose={openSnackbar.closeType} severity={openSnackbar.severity}>
                {openSnackbar.message}
                </Alert>
            </Snackbar>
            </div>

            {connection
            
            ?
        
            <div>
            <button onClick = {() => {  history.push("/DependantPage",{id:null, edit:false})  }} className="funButton headerButtons">ADD DEPENDANT</button>
            <CardList content={data} type = "Dependants" page = "/DependantPage"/>
            </div>
            :

            <div>          

            {error ?
            <ErrorPage/>
            :
            <LoadingIcon/>
            }
    
            </div>

          
            }
        </div>
    );
}