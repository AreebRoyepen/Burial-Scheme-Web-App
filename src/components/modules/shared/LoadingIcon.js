import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from "@material-ui/core/CircularProgress"
import "../../../styles/loadingIcon.css";

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      '& > * + *': {
        marginLeft: theme.spacing(2),
      },
    },
  }));

 export default function LoadingIcon () {

    const classes = useStyles();
 
 return (
    <div  id = 'center-the-circle'>
      <CircularProgress size={70}/>
    </div>
 )
}

