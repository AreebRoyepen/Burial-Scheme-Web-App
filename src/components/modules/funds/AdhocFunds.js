import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useHistory } from "react-router-dom";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Snackbar from "@material-ui/core/Snackbar";
import { makeStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import Grid from "@material-ui/core/Grid";
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

export default function AdhocFunds() {
  let location = useLocation();
  let history = useHistory();

  const classes = useStyles();
  const [openSnackbar, setOpenSnackbar] = useState({
    
    message: "",
    open: false,
    time: 0,
    closeType: null,
  });

  const [isSending, setIsSending] = useState(false);
  const isMounted = useRef(true);

  const [amount, setAmount] = useState();
  const [reason, setReason] = useState();

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

  const payment = useCallback(async () => {
    // don't send again while we are sending
    if (isSending) return;

    // update state
    setIsSending(true);

    // send the actual request
    async function fetchData() {
      var time = 3000;

      if (type) {

        let resp = await Api.getRequest(
          "v1/incomes/" + amount + "/" + Api.INCOME
        );

        if (resp.message === "SUCCESS") {
          var message = "Payment Successful";
          setAmount("")
          setReason("")
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
      } else {

        let pay = {
          "amount": parseFloat(amount),
          "reason": reason,
          "type": Api.EXPENSE,
        };

        console.log(pay);

        let resp = await Api.postRequest("v1/expenses", pay);
        console.log(resp);

        if (resp.message === "SUCCESS") {
          setAmount("")
          setReason("")
          time = 3000;
          var message = "Payment Successful";

          if (resp.short)
            setOpenSnackbar({
              severity: "warning",
              message:
                message +
                " R" +
                parseFloat(resp.amount).toFixed(2) +
                " outstanding",
              open: true,
              time: time,
              closeType: successClose,
            });
          else if (resp.surplus)
            setOpenSnackbar({
              severity: "success",
              message:
                message +
                " R" +
                parseFloat(resp.amount).toFixed(2) +
                " surplus given",
              open: true,
              time: time,
              closeType: successClose,
            });
          else
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
        } else {
          time = 6000;
          setOpenSnackbar({
            severity: "warning",
            message: resp.message,
            open: true,
            time: time,
            closeType: errorClose,
          });
        }
      }
    }

    fetchData();

    // once the request is sent, update state again
    if (isMounted.current)
      // only update if we are still mounted
      setIsSending(false);
  }, [
    isSending,
    history,
    type,
    location,
    reason,
    amount,
    
    successClose,
    errorClose,
  ]); // update the callback if the state changes

  const back = () => {
    
    setAmount("")
    setReason("")
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

      <body className="bodyVal htmlVal spanVal">
        <form className="form">
          <h1 className="h1Dashboard">ADHOC Funds</h1>
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
                <Grid
                  component="label"
                  container
                  alignItems="center"
                  spacing={1}
                >
                  <Grid item>expense</Grid>
                  <Grid item>
                    <Switch
                      checked={type}
                      onChange={(e) => setType(e.target.checked)}
                      color="primary"
                    />
                  </Grid>
                  <Grid item>income</Grid>
                </Grid>
              }
            />
            
            <TextField
            fullWidth
              style={{ marginTop: "15px" }}
              id="filled-number"
              label={"Amount"}
              type="number"
              value = {amount}
              onChange={(e) => {
                setAmount(e.target.value);
              }}
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
            />
              <div>
                {!type ? (
                  <TextField
                  fullWidth
                  style={{ marginTop: "15px" }}
                    id="filled-number"
                    label="Reason"
                    rowsMax={10}
                    multiline
                    value = {reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    variant="outlined"
                  />
                ) : (
                  <div />
                )}
              </div>

          </div>
        </form>
        <div className="btn-group">
          {amount ? (
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
            Clear
          </button>
        </div>
      </body>
    </div>
  );
}
