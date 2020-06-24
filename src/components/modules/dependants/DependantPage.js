import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useHistory } from "react-router-dom";
import Snackbar from "@material-ui/core/Snackbar";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import Switch from "@material-ui/core/Switch";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import { KeyboardDatePicker } from "@material-ui/pickers";
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

export default function DependantPage() {
  let history = useHistory();
  let location = useLocation();

  const classes = useStyles();
  const [openSnackbar, setOpenSnackbar] = useState({
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
    child: false,
    // claimed: false,
    // dob: null,
    // doe: null,
    // id: 1,
    // idnumber: "11111111111",
    // name: "Nabeel",
    // relationship: {name: "child", id: 1},
    // surname: "Roy"
  });

  const [member, setMember] = useState();
  const [loadMember, setLoadMember] = useState();
  const [editedDependant, seteditedDependant] = useState({});

  const [close, setClose] = useState(false);

  useEffect(() => {

    (async () => {
      let resp = await Api.getRequest("v1/relationships");

      if (resp.message === "SUCCESS") {

          setOptions(resp.data);

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

  useEffect(() => {
    // don't send again while we are sending
    if (loadMember) return;

    // update state
    setLoadMember(true);
    // send the actual request

    if (location.state.edit) {
      getMember();
    }

    // once the request is sent, update state again
    if (isMounted.current)
      // only update if we are still mounted
      setLoadMember(false);

    async function getMember() {
      var time = 3000;

      let resp = await Api.getRequest(
        "v1/dependants/member/" + location.state.x.id
      );

      if (resp.message === "SUCCESS") {
        setMember(resp.data);
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
    }
  }, [loadMember, location, history]);

  const sendRequest = useCallback(async () => {
    // don't send again while we are sending
    if (isSending) return;

    // update state
    setIsSending(true);
    // send the actual request

    console.log(dependant)
    async function updatedependant() {
      var time = 3000;

      if (location.state.edit) {
        let resp = await Api.putRequest(
          "v1/dependants/" + location.state.x.id,
          {...dependant, relationship : dependant.relationship.id}
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
      {console.log(dependant.relationship)}
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
        {member ? (
          <h1>
            This dependants member is: {member.name + " " + member.surname}
          </h1>
        ) : (
          <div />
        )}
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
              fullWidth
              //disableToolbar
              inputVariant="outlined"
              //variant="inline"
              autoOk
              margin="normal"
              id="date-picker-dialog"
              //label="Death Date"
              format="dd/MM/yyyy"
              value={dependant.dob}
              onChange={(e) =>
                setDependant({ ...dependant, dob: e })
              }
              KeyboardButtonProps={{
                "aria-label": "change date",
              }}
            />
            <div className="form__requirements">DOB is required</div>
          </div>
          <div>
            <label htmlFor="text" className="form__label ">
              DOE
            </label>
            <KeyboardDatePicker
              fullWidth
              //disableToolbar
              inputVariant="outlined"
              //variant="inline"
              autoOk
              margin="normal"
              id="date-picker-dialog"
              //label="Death Date"
              format="dd/MM/yyyy"
              value={dependant.doe}
              onChange={(e) =>
                setDependant({ ...dependant, doe: e })
              }
              KeyboardButtonProps={{
                "aria-label": "change date",
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
          <center>
            <FormControlLabel
              control={
                <Grid
                  component="label"
                  container
                  alignItems="center"
                  spacing={1}
                >
                  <Grid item></Grid>
                  <Grid item>
                    <Switch
                      checked={dependant.child}
                      onChange={(e) =>
                        setDependant({ ...dependant, child: e.target.checked })
                      }
                      color="primary"
                    />
                  </Grid>
                  <Grid item>Child</Grid>
                </Grid>
              }
            />
          </center>

          <label htmlFor="text" className="form__label ">
              Relationship
            </label>
          <FormControl variant="outlined" className={classes.formControl}>
            <Select
              native
              value={dependant.relationship}
              variant = "outlined"
              onChange={(e) =>{

                console.log(e.target)
                setDependant({ ...dependant, relationship: e.target.value })
              }
              }
              inputProps={{
                name: "Relationship",
                id: "filled-age-native-simple",
              }}
            >
              {options.map((x) => {
                console.log(x)
                return <option key={x.id} value={x.id}>{x.name}</option>;
              })}
            </Select>
          </FormControl>
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
