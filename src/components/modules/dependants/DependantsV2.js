import React, { useState, useEffect, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import Snackbar from "@material-ui/core/Snackbar";
import DependantsTable from "./DependantsTable"
import { makeStyles } from "@material-ui/core/styles";
import LoadingIcon from "../shared/LoadingIcon";
import Alert from "../shared/Alert";
import Tooltip from '@material-ui/core/Tooltip';
import { ErrorPage } from "../shared/ErrorPage";
import {getRequest} from "../../../api/Api";
import "../../../styles/eventCard.css";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
}));

export default function DependantsV2() {
  const [tableHeaders] = useState({
    columns: [
      { title: "Name", field: "name" },
      { title: "Surname", field: "surname" },
      {
        title: "Member",
        render: (rowData) => (
          <Tooltip title="Click to Edit Member" aria-label="add">
            <div
              style={{ color: "#1A2819", textDecoration: "underline" }}
              onClick={() =>
                history.push("/MemberPage", { last : "/Dependants", x: rowData.member, edit: true })
              }
            >
              {rowData.member.name + " " + rowData.member.surname}
            </div>
          </Tooltip>
        ),
      },
      { title: "Relationship", field: "relationship.name" },
      { title: "Child", field: "child", type: "boolean" },
      { title: "Claimed", field: "claimed", type: "boolean" },
      { title: "ID Number", field: "idnumber" },
      { title: "DOB", field: "dob" },
      { title: "DOE", field: "doe" },
    ],
  });

  const [data, setData] = useState([]);
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

  useEffect(() => {

          // don't send again while we are sending
          if (isSending) return;

          // update state
          setIsSending(true);
          // send the actual request

    async function fetchData() {
      let x = await getRequest("v1/dependants");
      console.log(x);
      if (x.message === "SUCCESS") {
        setData(x.data);
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

          // once the request is sent, update state again
          if (isMounted.current)
          // only update if we are still mounted
          setIsSending(false);
  }, [history]);

  return (
    <div>
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

      {connection ? (
        <div>
          <button
            // onClick={() => {
            //   history.push("/Page", { id: null, edit: false });
            // }}
            disabled
            style={{opacity:0}}
            className="funButton headerButtons"
          >
          </button>

          <DependantsTable last = "/Dependants" showDropDown data = {data} tableHeaders = {tableHeaders}/>

        </div>
      ) : (
        <div>{error ? <ErrorPage /> : <LoadingIcon />}</div>
      )}
    </div>
  );
}
