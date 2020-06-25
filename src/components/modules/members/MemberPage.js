import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useHistory } from "react-router-dom";
import Snackbar from "@material-ui/core/Snackbar";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import Switch from "@material-ui/core/Switch";
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

export default function MembersPage() {
  let history = useHistory();
  let location = useLocation();

  const classes = useStyles();
  const [openSnackbar, setOpenSnackbar] = useState({
    
    message: "",
    open: false,
    time: 0,
    closeType: null,
  });

  const [isSending, setIsSending] = useState(false);
  const isMounted = useRef(true);

  const [member, setMember] = useState({
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
    paidJoiningFee: false,
    // postalCode: null,
    // surname: "",
    // workNumber: ""
  });
  const [dependants, setDependanta] = useState();
  const [loadDependants, setLoadDependants] = useState()

  const [editedMember, setEditedMember] = useState({});

  useEffect(() => {
    if (location.state.edit) {
      console.log(location.state.x);
      setMember(location.state.x);
    }
  }, [location]);

  const successClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    if (location.state.last) {
      history.push(location.state.last, location.state.data);
    } else {
      history.push("/Members");
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
    if (loadDependants) return;

    // update state
    setLoadDependants(true);
    // send the actual request

    if (location.state.edit) {
      getDependants();
    }

    // once the request is sent, update state again
    if (isMounted.current)
      // only update if we are still mounted
      setLoadDependants(false);

    async function getDependants() {
      var time = 3000;

      let resp = await Api.getRequest(
        "v1/members/dependants/" + location.state.x.id
      );

      if (resp.message === "SUCCESS") {
        setDependanta(resp.data);
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


  }, [loadDependants, location,history]);

  const sendRequest = useCallback(async () => {
    // don't send again while we are sending
    if (isSending) return;

    // update state
    setIsSending(true);
    // send the actual request

    async function updateMember() {
      var time = 3000;

      if (location.state.edit) {
        let resp = await Api.putRequest(
          "v1/members/" + location.state.x.id,
          member
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
        let resp = await Api.postRequest("v1/members", member);
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

    updateMember();

    // once the request is sent, update state again
    if (isMounted.current)
      // only update if we are still mounted
      setIsSending(false);
  }, [isSending, member, location, history]); // update the callback if the state changes

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
      history.push("/Members");
    }
  };

  return (
    <div>
      {console.log(member)}

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
      {dependants ? <h1>This members dependants are: (insert list of dependants wwith buttons)</h1> : <div />}
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
              value={member.name}
              onChange={(e) => setMember({ ...member, name: e.target.value })}
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
              value={member.surname}
              onChange={(e) =>
                setMember({ ...member, surname: e.target.value })
              }
            />
            <div className="form__requirements">Last name is required</div>
          </div>
          <div>
            <label htmlFor="text" className="form__label ">
              Address
            </label>
            <input
              required
              type="text"
              className="form__input inputValText"
              name="text"
              placeholder="Address"
              pattern="^\D*$"
              value={member.address}
              onChange={(e) =>
                setMember({ ...member, address: e.target.value })
              }
            />
            <div className="form__requirements">Address is required</div>
          </div>
          <div>
            <label htmlFor="text" className="form__label ">
              Area
            </label>
            <input
              required
              type="text"
              className="form__input inputValText"
              name="text"
              placeholder="Area"
              pattern="^\D*$"
              value={member.area}
              onChange={(e) => setMember({ ...member, area: e.target.value })}
            />
            <div className="form__requirements">Area is required</div>
          </div>
          <div>
            <label htmlFor="text" className="form__label ">
              Postal Code
            </label>
            <input
              required
              type="text"
              className="form__input inputValText"
              name="text"
              placeholder="Postal Code"
              pattern="^\D*$"
              value={member.postalCode}
              onChange={(e) =>
                setMember({ ...member, postalCode: e.target.value })
              }
            />
            <div className="form__requirements">Postal Code is required</div>
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
              value={member.idnumber}
              onChange={(e) =>
                setMember({ ...member, idnumber: e.target.value })
              }
            />
            <div className="form__requirements">ID Number is required</div>
          </div>
          <div>
            <label htmlFor="text" className="form__label">
              Cell Number
            </label>
            <input
              required
              type="tel"
              className="form__input inputValText"
              name="text"
              placeholder="Cell Number"
              pattern="[0-9a-zA-Z]{10,}"
              maxLength="10"
              value={member.cellNumber}
              onChange={(e) =>
                setMember({ ...member, cellNumber: e.target.value })
              }
            />
            <div className="form__requirements">
              Please enter in a valid Cell Number
            </div>
          </div>
          <div>
            <label htmlFor="text" className="form__label">
              Work Number
            </label>
            <input
              required
              type="tel"
              className="form__input inputValText"
              name="text"
              placeholder="Work Number"
              pattern="[0-9a-zA-Z]{10,}"
              maxLength="10"
              value={member.workNumber}
              onChange={(e) =>
                setMember({ ...member, workNumber: e.target.value })
              }
            />
            <div className="form__requirements">
              Please enter in a valid Work Number
            </div>
          </div>
          <div>
            <label htmlFor="text" className="form__label">
              Home Number
            </label>
            <input
              required
              type="tel"
              className="form__input inputValText"
              name="text"
              placeholder="Home Number"
              pattern="[0-9a-zA-Z]{10,}"
              maxLength="10"
              value={member.homeNumber}
              onChange={(e) =>
                setMember({ ...member, homeNumber: e.target.value })
              }
            />
            <div className="form__requirements">
              Please enter in a valid Home Number
            </div>
          </div>
          <div>
            <label htmlFor="email" className="form__label">
              Email
            </label>
            <input
              required
              type="email"
              className="form__input inputValEmail"
              name="email"
              placeholder="example@aol.com"
              value={member.email}
              onChange={(e) => setMember({ ...member, email: e.target.value })}
            />
            <div className="form__requirements">
              Please enter a valid email address
            </div>
          </div>
          <div>
            <label htmlFor="text" className="form__label ">
              DOB
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
              value={member.dob}
              onChange={(e) => setMember({ ...member, dob: e })}
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
              value={member.doe}
              onChange={(e) => setMember({ ...member, doe: e })}
              KeyboardButtonProps={{
                "aria-label": "change date",
              }}
            />
            <div className="form__requirements">DOE is required</div>
          </div>          

          <center>
          <label htmlFor="text" className="form__label ">
          Joining Fee
            </label>
          <br />
          <FormControlLabel
            control={
              <Grid component="label" container alignItems="center" spacing={1}>
                <Grid item></Grid>
                <Grid item>
                  <Switch
                    checked={member.paidJoiningFee}
                    onChange={(e) =>
                      setMember({ ...member, paidJoiningFee: e.target.checked })
                    }
                    color="primary"
                  />
                </Grid>
                <Grid item>Paid</Grid>
              </Grid>
            }
          />
          </center>
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
              Edit Member
            </button>
          ) : (
            <button
              //id = {validateForm()}
              className="button"
              type="button"
              disabled={isSending}
              onClick={sendRequest}
            >
              {" "}
              Add Member
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
