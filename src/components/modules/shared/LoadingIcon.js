import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress"
import "../../../styles/loadingIcon.css";

 export default function LoadingIcon () {
 
 return (
    <div  id = 'center-the-circle'>
      <CircularProgress size={70}/>
    </div>
 )
}

