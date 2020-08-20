import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useHistory } from "react-router-dom";
import TextField from "@material-ui/core/TextField";
import Snackbar from "@material-ui/core/Snackbar";
import { makeStyles } from "@material-ui/core/styles";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";
import 'date-fns';
import Alert from "../shared/Alert";
import {getRequest, postRequest, PREMIUM} from "../../../api/Api";
import "../../../styles/validationForm.css";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
}));

export default function Premiums() {
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

  const [amount, setAmount] = useState();
  const [person, setPerson] = useState();

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
      let resp = await getRequest("v1/members");
    
      if (resp.message === "SUCCESS") {
        if (active) {
          setOptions(resp.data);
          if (resp.data.length === 0) {
            setOptions([]);
          }
        }
      } else if (resp.message === "unauthorized") {
        //localStorage.clear();
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

      let body = {

        amount : amount,
        type: PREMIUM,
        id : person.id

      }

      //console.log(body)

      let resp = await postRequest("v1/premiums", body);
      //console.log(resp)
      if (resp.message === "SUCCESS") {
        var message = "Payment Successful";
        setOpenSnackbar({
          severity: "success",
          message: message,
          open: true,
          time: time,
          closeType: successClose,
        });
      } else if (resp.message === "unauthorized") {
        //localStorage.clear();
        history.push("/", { last: location.pathname });
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
      }else{
        time = 6000;
        setOpenSnackbar({
          severity: "error",
          message: resp.error,
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
  }, [isSending, history, location, successClose, errorClose]); // update the callback if the state changes

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
      {/* {console.log(amount)} */}
      {/* {console.log(person)} */}
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

      <body className="bodyVal centerInputCard htmlVal spanVal">
        <form className="form">
          <h1 className="h1Dashboard">Premiums</h1>
          <div>
            <h3>
              {location.state}
              <br />
            </h3>
            <h4>
              Select member to assign premium to
              <br />
            </h4>
            <Autocomplete
              style={{marginBottom: "15px", marginTop: "15px" }}
              open={open}
              fullWidth
              onOpen={() => {
                setOpen(true);
              }}
              onClose={() => {
                setOpen(false);
              }}
              getOptionSelected={(option, value) => option.name === value.name}
              getOptionLabel={(option) =>  option.id + ". " + option.name + " " + option.surname}
              options={options}
              loading={loading}
              value={person}
              onChange={(event, newValue) => {
                setPerson(newValue);
              }}
              renderInput={(params) => (
                <TextField
                fullWidth
                  {...params}
                  label= "Select Member"
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
              value={amount}
              onChange={(e) => {
                setAmount(parseFloat(e.target.value));
              }}
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
            />

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
            Back
          </button>
        </div>
      </body>
    </div>
  );
}
