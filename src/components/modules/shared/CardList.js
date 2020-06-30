import React, { useState, useEffect, useCallback, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import LazyLoad from "react-lazyload";
import Loading from "./LazyLoadingIcon";
import DeletePopOver from "./DeletePopOver";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "./Alert";
import { makeStyles } from "@material-ui/core/styles";
import Api from "../../../api/Api";
import "../../../styles/eventCard.css";
import "../../../styles/popUp.css";

const useStyles = makeStyles((theme) => ({
  typography: {
    padding: theme.spacing(2),
  },
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
}));

export default function CardList(props) {
  const classes = useStyles();
  const [initialItems] = useState(props.content);
  const [items, setItems] = useState(props.content);
  let type = props.type;
  let page = props.page;
  let history = useHistory();

  let location = useLocation();

  const [snackBar, openSnackbar] = useState({
    
    message: "",
    open: false,
    time: 0,
    closeType: null,
  });
  const [isSending, setIsSending] = useState(false);
  const isMounted = useRef(true);

  const closeSnack = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    openSnackbar({ ...snackBar, [snackBar.open]: false });
  };

  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(JSON.parse(localStorage.user));
  }, [setUser]);

  function filterList(event) {
    let items = initialItems;
    items = items.filter((item) => {
      return (
        JSON.stringify(item)
          .toLowerCase()
          .search(event.target.value.toLowerCase()) !== -1
      );
    });
    setItems(items);
  }

  const deleteClicked = useCallback(
    async (x) => {
      // don't send again while we are sending
      if (isSending) return;

      // update state
      setIsSending(true);
      // send the actual request

      async function fetchData() {
        var time = 5000;

        if (type === "Member") {
          let resp = await deleteRequest("v1/members/" + x.id);
          console.log(resp);
          if (resp.message === "SUCCESS") {
            setItems(items.filter((currentItem) => { if (currentItem != x) return (JSON.stringify(currentItem))}))
            openSnackbar({
              severity: "success",
              message: "Successfully Deleted",
              open: true,
              time: time,
              closeType: closeSnack,
            });
          } else if (resp.message === "unauthorized") {
            //localStorage.clear();
            history.push("/", {
              last: location.pathname,
              data: location.state,
            });
          } else if (resp.message === "error") {
            time = 6000;
            openSnackbar({
              severity: "error",
              message: "unknown error",
              open: true,
              time: time,
              closeType: closeSnack,
            });
          } else if (resp.message === "no connection") {
            time = 6000;
            openSnackbar({
              severity: "error",
              message: "Check your internet connection",
              open: true,
              time: time,
              closeType: closeSnack,
            });
          } else if (resp.message === "timeout") {
            time = 6000;
            openSnackbar({
              severity: "error",
              message: "Request timed out. Please Try Again",
              open: true,
              time: time,
              closeType: closeSnack,
            });
          }
        } else if (type === "Dependant") {
          let resp = await deleteRequest("v1/dependants/" + x.id);
          console.log(resp);
          if (resp.message === "SUCCESS") {
            setItems(items.filter((currentItem) => { if (currentItem != x) return (JSON.stringify(currentItem))}))
            openSnackbar({
              severity: "success",
              message: "Successfully Deleted",
              open: true,
              time: time,
              closeType: closeSnack,
            });
          } else if (resp.message === "unauthorized") {
            //localStorage.clear();
            history.push("/", { last: location.pathname });
          } else if (resp.message === "error") {
            time = 6000;
            openSnackbar({
              severity: "error",
              message: "unknown error",
              open: true,
              time: time,
              closeType: closeSnack,
            });
          } else if (resp.message === "no connection") {
            time = 6000;
            openSnackbar({
              severity: "error",
              message: "Check your internet connection",
              open: true,
              time: time,
              closeType: closeSnack,
            });
          } else if (resp.message === "timeout") {
            time = 6000;
            openSnackbar({
              severity: "error",
              message: "Request timed out. Please Try Again",
              open: true,
              time: time,
              closeType: closeSnack,
            });
          } else {
            time = 6000;
            openSnackbar({
              severity: "warning",
              message: resp.message,
              open: true,
              time: time,
              closeType: closeSnack,
            });
          }
        }
      }

      fetchData(x);

      // once the request is sent, update state again
      if (isMounted.current)
        // only update if we are still mounted
        setIsSending(false);
    },
    [isSending, location, history]
  ); // update the callback if the state changes

  return (
    <div>
      <div className={classes.root}>
        <Snackbar
          open={snackBar.open}
          autoHideDuration={snackBar.time}
          onClose={snackBar.closeType}
        >
          <Alert
            onClose={snackBar.closeType}
            severity={snackBar.severity}
          >
            {snackBar.message}
          </Alert>
        </Snackbar>
      </div>

      <input
        className="searchBoxStyle"
        type="search"
        placeholder="SEARCH"
        onChange={(e) => filterList(e)}
      />
      <div>
        { items.length >0 ?
         items.map((x) => (
          <LazyLoad key={x.id} placeholder={<Loading />}>
            <div key={x.id}>
              <div className="container">
                <div className="card">
                  <div className="card-body" id={JSON.stringify(x.paidJoiningFee)}>
                    <div className="card-header event-name">
                      <p>{ type === "Member" ? x.id+ " " + x.name + " " + x.surname : x.name + " " + x.surname}</p>
                    </div>
                    <span className="card-header">
                      cell number: {x.cellNumber}
                      <span className="card-header u-float-right">
                        {x.email}
                      </span>
                    </span>

                    <div className="card-sub-botton card-sub-show">
                      <input
                        onClick={() => {
                          console.log(x.id);
                          history.push(page, { x: x, edit: true });
                        }}
                        type="submit"
                        value="Edit"
                        name="button"
                        className="cardButtons  card-link u-float-right"
                        id={JSON.stringify(x.paidJoiningFee)}
                      />

                      {user ? (
                        user.role.id ? (
                          <DeletePopOver
                            message={(v) => deleteClicked(v)}
                            style={{ float: "right !important" }}
                            content={x}
                            type={type}
                            className=" card-link u-float-right"
                          />
                        ) : (
                          <div />
                        )
                      ) : (
                        <div />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </LazyLoad>
        ))
      :
      <div>
        Nothing to see here
      </div>}
      </div>
    </div>
  );
}
