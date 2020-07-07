import React, { useState, useEffect, useRef }  from "react";
import { useLocation, useHistory } from "react-router-dom";
import Snackbar from '@material-ui/core/Snackbar';
import { makeStyles } from '@material-ui/core/styles';
import Alert from "../shared/Alert"
import {reportDownloadRequest} from "../../../api/Api";
import "../../../styles/validationForm.css";

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

export default function ReportEndpoints(props) {

    let location = useLocation();
    let history = useHistory();

    const classes = useStyles();
    const [openSnackbar, setOpenSnackbar] = useState({
      severity : "",
      message : "",
      open : false,
      time : 0,
      closeType : null
    });
    const x = props.props


    const [isSending, setIsSending] = useState(false)
    const isMounted = useRef(true)

    const closeSnack = (event, reason) => {
    if (reason === 'clickaway') {
        return;
    }
    setOpenSnackbar({...openSnackbar, [openSnackbar.open]:false})
    };

    useEffect(() => {       

        if (isSending) return
  
        // update state
        setIsSending(true)
    
        // send the actual request 
        async function fetchData(){
            var time = 6000

            if(x.param2 === "download"){
                setOpenSnackbar({...openSnackbar, [openSnackbar.open]:false})
                setOpenSnackbar({severity: "success", message : "Report to download shortly", open : true, time : time, closeType : closeSnack})

                let t
                var filename
                var date = new Date()
                if(x.endpoint === "claims"){
                    t = await reportDownloadRequest("v1/reports/claims") 
                    filename = "REPORT Claims " + date.toDateString() +".csv"
                }
                if(x.endpoint === "memberDetails"){
                    t = await reportDownloadRequest("v1/reports/memberDetails")
                    filename = "REPORT Member Dump " + date.toDateString() +".csv"
                }
                
                console.log(t)
                if(t.message === "SUCCESS"){
                    setOpenSnackbar({...openSnackbar, [openSnackbar.open]:false})
                    setOpenSnackbar({severity: "success", message : "Report downloaded", open : true, time : time, closeType : closeSnack})
                    
                    const url = window.URL.createObjectURL(new Blob([t.data]));
                    const link = document.createElement('a');
                    link.href = url;                   
                    
                    link.setAttribute('download', filename);
                    document.body.appendChild(link);
                    link.click();
        
                }else if (t.message === "unauthorized"){
                    //localStorage.clear();
                    history.push("/", {last : location.pathname, data : location.state})
        
                }else if(t.message === "no connection"){
                    time = 6000
                    setOpenSnackbar({severity : "error", message : "Check your internet connection", open : true, time : time, closeType : closeSnack})
        
                }else if(t.message === "timeout"){
                    time = 6000
                    setOpenSnackbar({severity : "error", message : "Request timed out. Please Try Again", open : true, time : time, closeType : closeSnack})
                    
                }else{
                    time = 6000
                    setOpenSnackbar({severity : "warning", message : t.error, open : true, time : time, closeType : closeSnack})
        
                }
                

            }else if (x.param2 === "email"){

                setOpenSnackbar({...openSnackbar, [openSnackbar.open]:false})
                setOpenSnackbar({severity: "success", message : "Email to be sent shortly", open : true, time : time, closeType : closeSnack})

                let t
                if(x.endpoint === "claims"){
                    t = await reportDownloadRequest("v1/reports/claims/"+x.email) 
                }
                if(x.endpoint === "memberDetails"){
                    t = await reportDownloadRequest("v1/reports/memberDetails/"+x.email)
                }

                //let t = await reportEmailRequest(x.endpoint,x.param1, x.param2, x.email) 
                
                    console.log(t)
                    if(t.message === "SUCCESS"){
                        setOpenSnackbar({...openSnackbar, [openSnackbar.open]:false})
                        setOpenSnackbar({severity: "success", message : "Report Emailed Successfully", open : true, time : time, closeType : closeSnack})
            
                    }else if (t.message === "unauthorized"){
                        //localStorage.clear();
                        history.push("/", {last : location.pathname, data : location.state})
            
                    }else if(t.message === "no connection"){
                        time = 6000
                        setOpenSnackbar({severity : "error", message : "Check your internet connection", open : true, time : time, closeType : closeSnack})
            
                    }else if(t.message === "timeout"){
                        time = 6000
                        setOpenSnackbar({severity : "error", message : "Request timed out. Please Try Again", open : true, time : time, closeType : closeSnack})
                        
                    }else{
                        time = 6000
                        setOpenSnackbar({severity : "warning", message : t.error, open : true, time : time, closeType : closeSnack})
            
                    }

            }      
    
        }
        
        fetchData()
    
        // once the request is sent, update state again
        if (isMounted.current) // only update if we are still mounted
            setIsSending(false)
    
        }, [isSending, props]); // update the callback if the state changes

    
    return(
        
      <div>

        <div className={classes.root}>
          <Snackbar open={openSnackbar.open} autoHideDuration={openSnackbar.time} onClose={openSnackbar.closeType}>
            <Alert onClose={openSnackbar.closeType} severity={openSnackbar.severity}>
              {openSnackbar.message}
            </Alert>
          </Snackbar>
        </div>

      </div>

    );
}