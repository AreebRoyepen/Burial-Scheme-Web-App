import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useHistory } from "react-router-dom";
import Snackbar from "@material-ui/core/Snackbar";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import Switch from "@material-ui/core/Switch";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import {KeyboardDatePicker} from '@material-ui/pickers';
import Alert from "../shared/Alert";
import Api from "../../../api/Api";
import "../../../styles/login.css";
import "../../../styles/validationForm.css";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
}));

export default function DependantPage() {
  let history = useHistory();
  let location = useLocation();

  const classes = useStyles();
  const [openSnackbar, setOpenSnackbar] = useState({
    severity: "",
    message: "",
    open: false,
    time: 0,
    closeType: null,
  });

  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const loading = open && options.length === 0;
  const [isSending, setIsSending] = useState(false);
  const isMounted = useRef(true);

  const [dependant, setDependant] = useState({
    // address: "",
    // area: "",
    // cellNumber: "",
    // claimed: null,
    // dob: "",
    // doe: "",
    // email: "",
    // homeNumber: "",
    // id: null,
    // idnumber: "",
    // name: "",
    // paidJoiningFee: null,
    // postalCode: null,
    // surname: "",
    // workNumber: ""
  });

  const [editedDependant, seteditedDependant] = useState({});

  const [close, setClose] = useState(false);

  useEffect(() => {
    let active = true;

    if (!loading) {
      return undefined;
    }

    (async () => {
      let resp = await Api.getRequest("v1/roles");

      if (resp.message === "SUCCESS") {
        if (active) {
          setOptions(resp.data);
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
    if (location.state.edit) {
      console.log(location.state.x);
      setDependant(location.state.x);
    }
  }, [location]);

  const successClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    if (location.state.last) {
      history.push(location.state.last, location.state.data);
    } else {
      history.push("/dependants");
    }
  };

  const errorClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar({ ...openSnackbar, [openSnackbar.open]: false });
  };

  const sendRequest = useCallback(async () => {
    // don't send again while we are sending
    if (isSending) return;

    // update state
    setIsSending(true);
    // send the actual request

    async function updatedependant() {
      var time = 3000;

      if (location.state.edit) {
        let resp = await Api.putRequest(
          "v1/dependants/" + location.state.x.id,
          dependant
        );
        console.log(resp);
        if (resp.message === "SUCCESS") {
          setOpenSnackbar({
            severity: "success",
            message: "Successfully edited",
            open: true,
            time: time,
            closeType: successClose,
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
        let resp = await Api.postRequest("v1/dependants", dependant);
        console.log(resp);
        if (resp.message === "SUCCESS") {
          setOpenSnackbar({
            severity: "success",
            message: "Successfully added",
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

    updatedependant();

    // once the request is sent, update state again
    if (isMounted.current)
      // only update if we are still mounted
      setIsSending(false);
  }, [isSending, dependant, location, history]); // update the callback if the state changes

  // const validateForm=() =>
  // {
  //   var x = {
  //     "name": name,
  //     "surname": surname,
  //     "number": number,
  //     "email": email
  //   };
  //   var emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  //   console.log(x)
  //   if((/^\D*$/.test(x.name)) && (/^\D*$/.test(x.surname)) && x.cellNumber.length >9
  //    && emailRegex.test(x.email) && !(/(null|undefined|^$|^\d+$)/).test(x.name) && !(/(null|undefined|^$|^\d+$)/).test(x.surname))
  //    return "trueValid";
  //  return "falseValid";
  // }

  const back = () => {
    if (location.state.last) {
      history.push(location.state.last, location.state.data);
    } else {
      history.push("/dependants");
    }
  };

  return (
    <div>
      {console.log(dependant)}

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
        <form className="form ">
          <div>
            <label htmlFor="text" className="form__label">
              First Name
            </label>
            <input
              required
              type="text"
              className="form__input inputValText"
              name="text"
              placeholder="Name"
              pattern="^\D*$"
              value={dependant.name}
              onChange={(e) =>
                setDependant({ ...dependant, name: e.target.value })
              }
            />
            <div className="form__requirements">First name is required</div>
          </div>
          <div>
            <label htmlFor="text" className="form__label ">
              Last Name
            </label>
            <input
              required
              type="text"
              className="form__input inputValText"
              name="text"
              placeholder="Surname"
              pattern="^\D*$"
              value={dependant.surname}
              onChange={(e) =>
                setDependant({ ...dependant, surname: e.target.value })
              }
            />
            <div className="form__requirements">Last name is required</div>
          </div>
          <div>
            <label htmlFor="text" className="form__label ">
              ID Number
            </label>
            <input
              required
              type="text"
              className="form__input inputValText"
              name="text"
              placeholder="ID Number"
              pattern="^\D*$"
              value={dependant.idnumber}
              onChange={(e) =>
                setDependant({ ...dependant, idnumber: e.target.value })
              }
            />
            <div className="form__requirements">ID Number is required</div>
          </div>

          <div>
            <label htmlFor="text" className="form__label ">
              DOB
            </label>
            {/* <input
              required
              type="text"
              className="form__input inputValText"
              name="text"
              placeholder=""
              pattern="^\D*$"
              
              
            /> */}
            <KeyboardDatePicker
                disableToolbar
                inputVariant="outlined"
                variant = "inline"
                autoOk
                  margin="normal"
                  id="date-picker-dialog"
                  //label="Death Date"
                  format="dd/MM/yyyy"
                  value={dependant.dob}
                  onChange={(e) =>
                    setDependant({ ...dependant, dob: e.target.value })
                  }
                  KeyboardButtonProps={{
                    'aria-label': 'change date',
                  }}
            />
            <div className="form__requirements">DOB is required</div>
          </div>

          <div>
            <label htmlFor="text" className="form__label ">
              DOE
            </label>
            <KeyboardDatePicker
                disableToolbar
                inputVariant="outlined"
                variant = "inline"
                autoOk
                  margin="normal"
                  id="date-picker-dialog"
                  //label="Death Date"
                  format="dd/MM/yyyy"
                  value={dependant.doe}
                  onChange={(e) =>
                    setDependant({ ...dependant, doe: e.target.value })
                  }
                  KeyboardButtonProps={{
                    'aria-label': 'change date',
                  }}
            />
            {/* <input
              required
              type="text"
              className="form__input inputValText"
              name="text"
              placeholder=""
              pattern="^\D*$"


            /> */}
            <div className="form__requirements">DOE is required</div>
          </div>

          Child
          <br />
          <FormControlLabel
            control={
              <Grid component="label" container alignItems="center" spacing={1}>
                <Grid item></Grid>
                <Grid item>
                  <Switch
                    checked={dependant.paidJoiningFee}
                    onChange={(e) =>
                      setDependant({ ...dependant, child: e.target.checked })
                    }
                    //color="#08533C"
                  />
                </Grid>
                <Grid item>Child</Grid>
              </Grid>
            }
          />

          <Autocomplete
            style={{ width: 250, marginBottom: "15px", marginTop: "15px" }}
            open={open}
            onOpen={() => {
              setOpen(true);
            }}
            onClose={() => {
              setOpen(false);
            }}
            getOptionSelected={(option, value) => option.name === value.name}
            getOptionLabel={(option) => option.name}
            options={options}
            loading={loading}
            value={dependant.relationship}
            onChange={(event, newValue) => {
              setDependant({ ...dependant, relationship: newValue });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Relationship Type"
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
        </form>
       
       <div className="btn-group">
          {location.state.edit ? (
            <button
              //id = {validateForm()}
              className="button"
              type="button"
              disabled={isSending}
              onClick={sendRequest}
            >
              {" "}
              Edit dependant
            </button>
          ) : (
            <button
              //id = {validateForm()}
              className="button"
              type="button"
              disabled={isSending}
              onClick={sendRequest}
            >
              Add
            </button>
          )}
          <button className="button" type="button" onClick={back}>
            {" "}
            Cancel
          </button>
        </div>
      </body>
    </div>
  );
}
