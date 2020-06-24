import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useHistory } from "react-router-dom";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Snackbar from "@material-ui/core/Snackbar";
import { makeStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import Grid from "@material-ui/core/Grid";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";
import { KeyboardDatePicker } from "@material-ui/pickers";
import "date-fns";
import Alert from "../shared/Alert";
import Api from "../../../api/Api";
import "../../../styles/validationForm.css";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
}));

export default function Claims() {
  let location = useLocation();
  let history = useHistory();

  const classes = useStyles();
  const [openSnackbar, setOpenSnackbar] = useState({
    
    message: "",
    open: false,
    time: 0,
    closeType: null,
  });

  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const loading = open && options.length === 0;
  const [isSending, setIsSending] = useState(false);
  const isMounted = useRef(true);
  const [person, setPerson] = useState()

  const [data, setData] = useState({
    transactionType: Api.CLAIM,
    buriedDate: new Date(),
    deathDate: new Date(),
  });

  const [type, setType] = useState(false);

  const successClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnackbar({ ...openSnackbar, [openSnackbar.open]: false });
  };

  const errorClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar({ ...openSnackbar, [openSnackbar.open]: false });
  };

  useEffect(() => {
    let active = true;

    if (!loading) {
      return undefined;
    }

    (async () => {
      let resp;
      if (type) {
        console.log(resp);
        resp = await Api.getRequest("v1/members");
      } else {
        resp = await Api.getRequest("v1/dependants");
      }
      if (resp.message === "SUCCESS") {
        if (active) {
          setOptions(resp.data);
          if (resp.data.length === 0) {
            setOptions([]);
          }
        }
      } else if (resp.message === "unauthorized") {
        localStorage.clear();
        history.push("/", { last: location.pathname });
      } else {
        setOpenSnackbar({
          severity: "error",
          message: "Check your internet connection",
          open: true,
          time: 6000,
          closeType: errorClose,
        });
      }
    })();

    return () => {
      active = false;
    };
  }, [loading]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  const payment = useCallback(async () => {
    // don't send again while we are sending
    if (isSending) return;

    // update state
    setIsSending(true);

    // send the actual request
    async function fetchData() {
      var time = 3000;
      let resp;

      if (type) {
        resp = await Api.postRequest("v1/claims", {...data, id : person.id});
      } else {
        resp = await Api.postRequest("v1/claims/dependantClaim", {...data, id : person.id});
      }
      console.log(resp);
      if (resp.message === "SUCCESS") {
        var message = "Payment Successful";
        setData({ transactionType: Api.CLAIM });
        setOpenSnackbar({
          severity: "success",
          message: message,
          open: true,
          time: time,
          closeType: successClose,
        });
      } else if (resp.message === "unauthorized") {
        localStorage.clear();
        history.push("/", { last: location.pathname });
      } else if (resp.message === "error") {
        time = 6000;
        setOpenSnackbar({
          severity: "error",
          message: "unknown error",
          open: true,
          time: time,
          closeType: errorClose,
        });
      } else if (resp.message === "no connection") {
        time = 6000;
        setOpenSnackbar({
          severity: "error",
          message: "Check your internet connection",
          open: true,
          time: time,
          closeType: errorClose,
        });
      } else if (resp.message === "timeout") {
        time = 6000;
        setOpenSnackbar({
          severity: "error",
          message: "Request timed out. Please Try Again",
          open: true,
          time: time,
          closeType: errorClose,
        });
      }
    }

    fetchData();

    // once the request is sent, update state again
    if (isMounted.current)
      // only update if we are still mounted
      setIsSending(false);
  }, [isSending, history, type, location, successClose, errorClose]); // update the callback if the state changes

  const back = () => {
      history.push("/Dashboard");    
  };

  // const validateForm = () => {
  //   var x = {
  //     ticketNumberF: parseInt(ticketNumberF),
  //     amount: amount,
  //     person: reason,
  //   };
  //   if (
  //     /^\d+(\.\d{2})?$/.test(x.amount) &&
  //     (x.person ||
  //       (/(null|undefined|^$|^\d+$)/.test(x.ticketNumberF) &&
  //         x.ticketNumberF > 0))
  //   ) {
  //     return "trueValid";
  //   }
  //   return "falseValid";
  // };

  return (
    <div className="App">
      {console.log(data)}
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

      <div className="bodyVal htmlVal spanVal">
        <form className="form">
          <h1 className="h1Dashboard">Claims</h1>
          <div>
            <h3>
              {location.state}
              <br />
            </h3>
            <h4>
              words here
              <br />
            </h4>
            Select Option
            <br />
            <FormControlLabel
              control={
                <Grid component="label" container alignItems="center" spacing={1} >
                  <Grid item>dependant</Grid>
                  <Grid item>
                    <Switch
                      checked={type}
                      onChange={(e) => setType(e.target.checked)}
                      color="primary"
                    />
                  </Grid>
                  <Grid item>member</Grid>
                </Grid>
              }
            />
            <Autocomplete
              style={{ marginBottom: "15px", marginTop: "15px" }}
              open={open}
              fullWidth
              onOpen={() => {
                setOpen(true);
              }}
              onClose={() => {
                setOpen(false);
              }}
              getOptionSelected={(option, value) => option.name === value.name}
              getOptionLabel={(option) => option.name + " " + option.surname}
              options={options}
              loading={loading}
              value={person}
              onChange={(event, newValue) => {
                setPerson(newValue)
              }}
              renderInput={(params) => (
                <TextField
                  fullWidth
                  {...params}
                  label={type ? "Select Member" : "Select Dependant"}
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {loading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
            />
            <TextField
              fullWidth
              style={{ marginTop: "15px" }}
              id="filled-number"
              label={"Amount"}
              type="number"
              value={data.amount}
              onChange={(e) => {
                setData({ ...data, amount: e.target.value });
              }}
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
            />
            <TextField
              fullWidth
              style={{ marginTop: "15px" }}
              id="filled-number"
              label="Burial Place"
              rowsMax={10}
              value={data.burialPlace}
              onChange={(e) => {
                setData({ ...data, burialPlace: e.target.value });
              }}
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
            />
            <KeyboardDatePicker
              fullWidth
              //disableToolbar
              inputVariant="outlined"
              //variant="inline"
              autoOk
              margin="normal"
              id="date-picker-dialog"
              label="Death Date"
              format="dd/MM/yyyy"
              value={data.deathDate}
              onChange={(e) => {
                setData({ ...data, deathDate: e });
              }}
              KeyboardButtonProps={{
                "aria-label": "change date",
              }}
            />
            <KeyboardDatePicker
              fullWidth
              //disableToolbar
              inputVariant="outlined"
              //variant="inline"
              autoOk
              margin="normal"
              id="date-picker-dialog"
              label="Burial Date"
              format="dd/MM/yyyy"
              value={data.buriedDate}
              onChange={(e) => {
                setData({ ...data, buriedDate: e });
              }}
              KeyboardButtonProps={{
                "aria-label": "change date",
              }}
            />

          </div>
        </form>
        <div className="btn-group">
          {data.amount ? (
            <button
              //id={validateForm()}
              className="button"
              type="button"
              disabled={isSending}
              onClick={payment}
              style={{ marginTop: "10px" }}
            >
              Submit
            </button>
          ) : (
            <div></div>
          )}

          <button
            className="button"
            type="button"
            onClick={back}
            style={{ marginTop: "10px" }}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
