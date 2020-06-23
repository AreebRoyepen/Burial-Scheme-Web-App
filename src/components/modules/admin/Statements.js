import React, { useEffect, useState, useCallback, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory, useLocation } from "react-router-dom";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "../shared/Alert";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import CommentIcon from "@material-ui/icons/Comment";
import Api from "../../../api/Api";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function Statements() {
  const [checked, setChecked] = useState([]);
  const [data, setData] = useState([]);
  const [connection, setConnection] = useState(false);

  const [isSending, setIsSending] = useState(false);
  const isMounted = useRef(true);

  let history = useHistory();
  let location = useLocation();

  const classes = useStyles();
  const [openSnackbar, setOpenSnackbar] = useState({
    
    message: "",
    open: false,
    time: 0,
    closeType: null,
  });

  const close = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar({ ...openSnackbar, [openSnackbar.open]: false });
  };

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];
    console.log(value);
    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  useEffect(() => {
    async function fetchData() {
      let x = await Api.getRequest("v1/members");
      console.log(x);
      if (x.message === "SUCCESS") {
        setData(x.data);
        setConnection(true);
      } else if (x.message === "unauthorized") {
        localStorage.clear();
        history.push("/", { last: location.pathname });
      } else {
        setOpenSnackbar({
          severity: "error",
          message: "Check your internet connection",
          open: true,
          time: 6000,
          closeType: close,
        });
        //setError(true);
      }
    }

    fetchData();
  }, [history]);

  const downloadStatements = useCallback(
    async (checked) => {
      // don't send again while we are sending
      if (isSending) return;

      // update state
      setIsSending(true);
      // send the actual request

      async function getStatements() {
        var time = 3000;

        let resp;
        console.log(checked);
        if (checked.length == 1) {
          resp = await Api.reportDownloadRequest(
            "v1/reports/memberStatement/" + checked[0].id
          );
          const url = window.URL.createObjectURL(new Blob([resp.data]));
          const link = document.createElement("a");
          link.href = url;
          let date = new Date();
          let filename =
            "GIS Burial Scheme Statement: " +
            checked[0].name +
            " " +
            checked[0].surname +
            " " +
            date.toDateString() +
            ".pdf";
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
        } else {
          resp = { message: "SUCCESS" };
          console.log("else");
        }

        console.log(resp);
        if (resp.message === "SUCCESS") {
          setOpenSnackbar({
            severity: "success",
            message: "Successfully edited",
            open: true,
            time: time,
            closeType: close,
          });
        } else if (resp.message === "unauthorized") {
          localStorage.clear();
          history.push("/", { last: location.pathname, data: location.state });
        } else if (resp.message === "error") {
          time = 6000;
          setOpenSnackbar({
            severity: "error",
            message: "unknown error",
            open: true,
            time: time,
            closeType: close,
          });
        } else if (resp.message === "no connection") {
          time = 6000;
          setOpenSnackbar({
            severity: "error",
            message: "Check your internet connection",
            open: true,
            time: time,
            closeType: close,
          });
        } else if (resp.message === "timeout") {
          time = 6000;
          setOpenSnackbar({
            severity: "error",
            message: "Request timed out. Please Try Again",
            open: true,
            time: time,
            closeType: close,
          });
        }
      }

      getStatements();

      // once the request is sent, update state again
      if (isMounted.current)
        // only update if we are still mounted
        setIsSending(false);
    },
    [isSending, location, history]
  ); // update the callback if the state changes

  const downloadAllStatements = useCallback(
    async (x) => {
      // don't send again while we are sending
      if (isSending) return;

      // update state
      setIsSending(true);
      // send the actual request


      
      var list = Object.assign([], x);
      
      var list2 = Object.assign([], x);
      
      async function getStatements() {
        var time = 3000;

        let resp;
        console.log(list);
        let req = "v1/reports/memberStatement/";
        resp = { message: "SUCCESS" };

        list.forEach(function (part, index) {
          console.log(part);
          this[index] = req + part.id;
        }, list);

        console.log(list);

        resp = await Api.reportDownloadAllRequest(
            list
          );

        
          resp.data.forEach(function (part, index) {
            console.log(part);
            const url = window.URL.createObjectURL(new Blob([part.data]));
            const link = document.createElement("a");
            link.href = url;
            let date = new Date();
            let filename =
              "GIS Burial Scheme Statement: " +
              list2[index].name +
              " " +
              list2[index].surname +
              " " +
              date.toDateString() +
              ".pdf";
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
          }, resp.data);
  

        

        console.log(resp);
        if (resp.message === "SUCCESS") {


          setOpenSnackbar({
            severity: "success",
            message: "Successfully edited",
            open: true,
            time: time,
            closeType: close,
          });
        } else if (resp.message === "unauthorized") {
          localStorage.clear();
          history.push("/", { last: location.pathname, data: location.state });
        } else if (resp.message === "error") {
          time = 6000;
          setOpenSnackbar({
            severity: "error",
            message: "unknown error",
            open: true,
            time: time,
            closeType: close,
          });
        } else if (resp.message === "no connection") {
          time = 6000;
          setOpenSnackbar({
            severity: "error",
            message: "Check your internet connection",
            open: true,
            time: time,
            closeType: close,
          });
        } else if (resp.message === "timeout") {
          time = 6000;
          setOpenSnackbar({
            severity: "error",
            message: "Request timed out. Please Try Again",
            open: true,
            time: time,
            closeType: close,
          });
        }
      }

      getStatements();

      // once the request is sent, update state again
      if (isMounted.current)
        // only update if we are still mounted
        setIsSending(false);
    },
    [isSending, location, history]
  ); // update the callback if the state changes
  return (
    <div>
      {console.log(checked)}
      <div className={classes.root}>
        <Snackbar
          open={openSnackbar.open}
          autoHideDuration={openSnackbar.time}
          onClose={openSnackbar.closeType}
        >
          <Alert
            onClose={openSnackbar.closeType}
            severity={openSnackbar.severity}
          >
            {openSnackbar.message}
          </Alert>
        </Snackbar>
      </div>
      <button
        onClick={() => {
          setChecked([]);
        }}
        //style={{ opacity: 0 }}
        className="funButton headerButtons"
        //disabled
      >
        Clear Selection
      </button>

      <button
        onClick={() => downloadStatements(checked)}
        //style={{ opacity: 0 }}
        className="funButton headerButtons"
        //disabled
      >
        {checked.length > 1 ? "Download Statements" : "Download Statement"}
      </button>

      <button
        onClick={() => downloadAllStatements(data)}
        //style={{ opacity: 0 }}
        className="funButton headerButtons"
        //disabled
      >
        {"Download All"}
      </button>

      <List className={classes.root}>
        <ListItem
          key="all"
          role={undefined}
          dense
          button
          onClick={handleToggle("all")}
        >
          <ListItemIcon>
            <Checkbox
              edge="start"
              checked={checked.indexOf("all") !== -1}
              tabIndex={-1}
              disableRipple
              //inputProps={{ "aria-labelledby": labelId }}
            />
          </ListItemIcon>
          <ListItemText id="all" primary="All" />
          {/* <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="comments">
                <CommentIcon />
              </IconButton>
            </ListItemSecondaryAction> */}
        </ListItem>
        {data.map((value) => {
          //const labelId = `checkbox-list-label-${value}`;

          return (
            <ListItem
              key={value.id}
              role={undefined}
              dense
              button
              onClick={handleToggle(value)}
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                  //inputProps={{ "aria-labelledby": labelId }}
                />
              </ListItemIcon>
              <ListItemText
                id={value.id}
                primary={value.name + " " + value.surname}
              />
              {/* <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="comments">
                <CommentIcon />
              </IconButton>
            </ListItemSecondaryAction> */}
            </ListItem>
          );
        })}
      </List>
    </div>
  );
}
