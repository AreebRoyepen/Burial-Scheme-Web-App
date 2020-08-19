import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useHistory } from "react-router-dom";
import Snackbar from "@material-ui/core/Snackbar";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import Switch from "@material-ui/core/Switch";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel"
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import { KeyboardDatePicker } from "@material-ui/pickers";
import Alert from "../shared/Alert";
import {getRequest, putRequest, postRequest} from "../../../api/Api";
import "../../../styles/validationForm.css";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
  },
}));

export default function DependantForm() {
  let history = useHistory();
  let location = useLocation();

  const classes = useStyles();
  const [openSnackbar, setOpenSnackbar] = useState({
    message: "",
    open: false,
    time: 0,
    closeType: null,
  });

  const [open] = useState(false);
  const [options, setOptions] = useState([]);
  const loading = open && options.length === 0;
  const [isSending, setIsSending] = useState(false);
  const isMounted = useRef(true);

  const [dependant, setDependant] = useState({
    child: false,
    // claimed: false,
     dob: null,
     doe: new Date(),
    // id: 1,
    // idnumber: "11111111111",
    // name: "Nabeel",
     //relationship: null,
    // surname: "Roy"
  });

  const [member, setMember] = useState(location.state.member);
  
  const [loadMember, setLoadMember] = useState();

  useEffect(() => {

    (async () => {
      let resp = await getRequest("v1/relationships");

      if (resp.message === "SUCCESS") {

          setOptions(resp.data);

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

  }, [loading]);


  useEffect(() => {
    if (location.state.edit === true) {
      //console.log(location.state.dependant);
      setDependant({...location.state.dependant, relationship : location.state.dependant.relationship.id});
    }
  }, [location]);


  const successClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    if (location.state.last) {
      history.push(location.state.last, { edit : true, x : member});
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

      let resp = await getRequest(
        "v1/dependants/member/" + location.state.dependant.id
      );

      if (resp.message === "SUCCESS") {
        setMember(resp.data);
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

    //console.log(dependant)
    async function updatedependant() {
      var time = 3000;

      if (location.state.edit) {
        //console.log({...dependant, relationship : dependant.relationship, member : dependant.member.id})
        let resp = await putRequest(
          "v1/dependants/" + location.state.dependant.id,
          {...dependant, relationship : dependant.relationship, member : dependant.member.id}
        );
        //console.log(resp);
        if (resp.message === "SUCCESS") {
          setOpenSnackbar({
            severity: "success",
            message: "Successfully edited",
            open: true,
            time: time,
            closeType: successClose,
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
      } else {
        //console.log(
          {...dependant, 
            relationship : dependant.relationship, 
            member : member.id}
        )
        let resp = await postRequest("v1/dependants", {...dependant, 
          relationship : dependant.relationship, 
          member : member.id});
        //console.log(resp);
        if (resp.message === "SUCCESS") {
          setOpenSnackbar({
            severity: "success",
            message: "Successfully added",
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
        } else {
          time = 6000;
          setOpenSnackbar({
            severity: "warning",
            message: resp.error,
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

  const validateForm=() =>
  {
    let x = dependant;
    //var emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    ////console.log(x)
    if((/^\D*$/.test(x.name)) && (/^\D*$/.test(x.surname)) && !(/(null|undefined)/).test(x.relationship)
    && !(/(null|undefined)/).test(x.idnumber)
     && !(/(null|undefined|^$|^\d+$)/).test(x.name) && !(/(null|undefined|^$|^\d+$)/).test(x.surname))
     return "trueValid";
   return "falseValid";
  }

  const back = () => {
    if (location.state.last) {
      history.push(location.state.last, { edit : true, x : member});
    } else {
      history.push("/dependants");
    }
  };

  return (
    <div className="App">
      {//console.log(dependant)}
      {//console.log(member)}
      {//console.log(location)}
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
        
        <form className="form ">
        <h1 className="h1Dashboard">{location.state.edit ?
              "Edit Dependant"
              :
              "Add Dependant"
                } 
        </h1>
        <h3>
        {member ? (
           " Member is: " + member.name + " " + member.surname
        ) : (
          <div />
        )}
              <br />
            </h3>
          <div>
            <TextField
            variant = "outlined"
              required
              fullWidth
              label = "First Name"
              type="text"
              className="inputValText"
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

            <TextField
              variant = "outlined"
              label = "Last Name"
              fullWidth
              required
              type="text"
              className="inputValText"
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

            <TextField
            variant = "outlined"
            label = "ID Number"
            fullWidth
              required
              type="text"
              className="inputValText"
              name="text"
              placeholder="ID Number"
              pattern="[0-9a-zA-Z]{13,}"
              value={dependant.idnumber}
              onChange={(e) =>
                setDependant({ ...dependant, idnumber: e.target.value })
              }
            />
            <div className="form__requirements">ID Number is required</div>
          </div>
          <div>

            <KeyboardDatePicker
              fullWidth
              //disableToolbar
              label = " DOB"
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
              
            </label>
            <KeyboardDatePicker
              fullWidth
              //disableToolbar
              label = "DOE"
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

<br/>

          <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel shrink >
          Relationship
        </InputLabel>
            <Select
              native
              value= {dependant.relationship}
              label = "Relationship"
              onChange={(e) =>{

                //console.log(e.target.value)
                setDependant({ ...dependant, relationship: e.target.value })
              }
              }
              inputProps={{
                name: "Relationship",
                id: "filled-age-native-simple",
              }}
            >
              <option aria-label="None" value="" />
              {options.map((x) => {
                return <option key={x.id} value={x.id}>{x.name}</option>;
              })}
            </Select>
          </FormControl>
        </form>

        <div className="btn-group">
          
            <button
              id = {validateForm()}
              className="button"
              type="button"
              disabled={isSending}
              onClick={sendRequest}
            >
              {location.state.edit ?
              "Save Change"
              :
              "Add"
                } 
            </button>
        
          <button className="button" type="button" onClick={back}>
        
            Cancel
          </button>
        </div>
      </body>
    </div>
  );
}
