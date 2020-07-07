import React, { useEffect, useState, useCallback, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory, useLocation } from "react-router-dom";
import Snackbar from "@material-ui/core/Snackbar";
import LoadingIcon from "../shared/LoadingIcon";
import Alert from "../shared/Alert";
import { ErrorPage } from "../shared/ErrorPage";
import Button from "@material-ui/core/Button";
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import List from "@material-ui/core/List";
import Tooltip from "@material-ui/core/Tooltip";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import { MdClear, MdFileDownload, MdEmail, MdSearch } from "react-icons/md";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import {
  getRequest,
  reportDownloadAllRequest,
  reportDownloadRequest,
  reportEmailAllRequest,
} from "../../../api/Api";
import "../../../styles/validationForm.css";
import "../../../styles/statements.css";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
    
  },
  button: {
    margin: theme.spacing(1),
    marginRight: "10px"
  },
  list: {
    width: "100%",
    flexGrow:1,
    position: "relative",
    //maxHeight:700,
    overflowX: "hidden",
    overflowY:"auto"
  },
}));

export default function Statements() {
  const [checked, setChecked] = useState([]);
  const [data, setData] = useState([]);
  const [initialData, setInitialData] = useState([])
  const [connection, setConnection] = useState(false);
  const [error, setError] = useState(false);

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

  function filterList(event) {
    let items = initialData;
    items = items.filter((item) => {
      return (
        JSON.stringify(item)
          .toLowerCase()
          .search(event.target.value.toLowerCase()) !== -1
      );
    });
    setData(items);
  }


  useEffect(() => {
    async function fetchData() {
      let x = await getRequest("v1/members");
      console.log(x);
      if (x.message === "SUCCESS") {
        setData(x.data);
        setInitialData(x.data)
        setConnection(true);
      } else if (x.message === "unauthorized") {
        //localStorage.clear();
        history.push("/", { last: location.pathname });
      } else {
        setOpenSnackbar({
          severity: "error",
          message: "Check your internet connection",
          open: true,
          time: 6000,
          closeType: close,
        });
        setError(true);
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
          resp = await reportDownloadRequest(
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
          var list = Object.assign([], checked);

          var list2 = Object.assign([], checked);

          var time = 3000;

          console.log(list);
          let req = "v1/reports/memberStatement/";

          list.forEach(function (part, index) {
            console.log(part);
            this[index] = req + part.id;
          }, list);

          console.log(list);

          resp = await reportDownloadAllRequest(list);
          console.log(resp);

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
        }

        console.log(resp);
        if (resp.message === "SUCCESS") {
          setOpenSnackbar({
            severity: "success",
            message: "Success",
            open: true,
            time: time,
            closeType: close,
          });
        } else if (resp.message === "unauthorized") {
          //localStorage.clear();
          history.push("/", { last: location.pathname, data: location.state });
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

        list.forEach(function (part, index) {
          console.log(part);
          this[index] = req + part.id;
        }, list);

        console.log(list);

        resp = await reportDownloadAllRequest(list);

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
            message: "Success",
            open: true,
            time: time,
            closeType: close,
          });
        } else if (resp.message === "unauthorized") {
          //localStorage.clear();
          history.push("/", { last: location.pathname, data: location.state });
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

  const emailStatements = useCallback(
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
          resp = await reportDownloadRequest(
            "v1/reports/memberStatement/" +
              checked[0].id +
              "/" +
              checked[0].email
          );
        } else {
          var list = Object.assign([], checked);

          var time = 3000;

          console.log(list);
          let req = "v1/reports/memberStatement/";

          list.forEach(function (part, index) {
            console.log(part);
            this[index] = req + part.id + "/" + part.email;
          }, list);

          console.log(list);

          resp = await reportEmailAllRequest(list);
          console.log(resp);
        }

        console.log(resp);
        if (resp.message === "SUCCESS") {
          setOpenSnackbar({
            severity: "success",
            message: "Success",
            open: true,
            time: time,
            closeType: close,
          });
        } else if (resp.message === "unauthorized") {
          //localStorage.clear();
          history.push("/", { last: location.pathname, data: location.state });
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

  const emailAllStatements = useCallback(
    async (x) => {
      // don't send again while we are sending
      if (isSending) return;

      // update state
      setIsSending(true);
      // send the actual request

      var list = Object.assign([], x);

      async function getStatements() {
        var time = 3000;

        let resp;
        console.log(list);
        let req = "v1/reports/memberStatement/";

        list.forEach(function (part, index) {
          console.log(part);
          this[index] = req + part.id + "/" + part.email;
        }, list);

        console.log(list);

        resp = await reportEmailAllRequest(list);

        console.log(resp);
        if (resp.message === "SUCCESS") {
          setOpenSnackbar({
            severity: "success",
            message: "Success",
            open: true,
            time: time,
            closeType: close,
          });
        } else if (resp.message === "unauthorized") {
          //localStorage.clear();
          history.push("/", { last: location.pathname, data: location.state });
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
      {connection ? (
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

          <Grid container spacing={3} style={{ marginTop: "40px" }}>
            <Grid item xs style={{ minWidth: "200px" }}>
              <div className="App">
                Selected Members:
                {checked.map((x) => {
                  return <ul key={x.id}>{x.name + " " + x.surname}</ul>;
                })}
              </div>
            </Grid>

            <Grid item xs style={{ minWidth: "400px" }}>
              <form className="statementForm App ">
                <h1 className="h1Dashboard">Statements</h1>
                <h4>choose members and then select an option below</h4>
                <div style={{ textAlign: "center", float: "right" }}>
                  <Tooltip title="Clear Selection">
                    <IconButton
                      onClick={() => {
                        setChecked([]);
                      }}
                    >
                      <MdClear size={20} color="#1A2819" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip
                    title={
                      checked.length > 1
                        ? "Download Statements"
                        : "Download Statement"
                    }
                  >
                    <IconButton 
                    onClick={() =>{if(checked.length>0)downloadStatements(checked) }}
                    disabled={isSending == true}
                    >
                      <MdFileDownload size={20} color="#1A2819" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip
                    title={
                      checked.length > 1
                        ? "Email Statements"
                        : "Email Statement"
                    }
                  >
                    <IconButton 
                    onClick={() => {if(checked.length>0)emailStatements(checked) }}
                    disabled={isSending == true}
                    >
                      <MdEmail size={20} color="#1A2819" />
                    </IconButton>
                  </Tooltip>
                </div>

                <div style={{ textAlign: "center", float: "right" }}>
                  <TextField
                    id="input-with-icon-textfield"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MdSearch size={20} color="#1A2819" />
                        </InputAdornment>
                      )
                    }}
                    onChange = {(e) => filterList(e)}
                  />
                </div>

                <List className={classes.list}>
                  {data.map((value) => {
                    //const labelId = `checkbox-list-label-${value}`;

                    return (
                      <ListItem
                        key={value.id}
                        role={undefined}
                        //dense
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
                          primary={ value.id +". " + value.name + " " + value.surname}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </form>
            </Grid>

            <Grid
              item
              xs
              style={{ padding: 1, textAlign: "right", minWidth: "400px" }}
            >
              <div>
                <Button
                  color="primary"
                  // size="large"
                  onClick={() => downloadAllStatements(data)}
                  variant="contained"
                  startIcon={<MdFileDownload />}
                  //className={classes.button}
                  style={{ margin: "5px" }}
                  disabled={isSending == true}
                >
                  All
                </Button>

                <Button
                  color="primary"
                  // size="large"
                  onClick={() => emailAllStatements(data)}
                  variant="contained"
                  startIcon={<MdEmail />}
                  //className={classes.button}
                  style={{ marginRight: "10%" }}
                  disabled={isSending == true}
                >
                  All
                </Button>
              </div>
            </Grid>
          </Grid>
        </div>
      ) : (
        <div>{error ? <ErrorPage /> : <LoadingIcon />}</div>
      )}
    </div>
  );
}
