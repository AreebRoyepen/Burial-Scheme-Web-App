import React, { useState, useEffect, useCallback, useRef } from "react";
import Snackbar from "@material-ui/core/Snackbar";
import MaterialTable from "material-table";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory, useLocation } from "react-router-dom";
import LoadingIcon from "../shared/LoadingIcon";
import Alert from "../shared/Alert";
import { ErrorPage } from "../shared/ErrorPage";
import { tableIcons } from "../shared/MaterialTableIcons";
import Api from "../../../api/Api";
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
      { title: "Child", field: "child", type : "boolean" },
      { title: "Claimed", field: "claimed", type:"boolean" },
      { title: "ID Number", field: "idnumber" },
      { title: "DOB", field: "dob"},       
      { title: "DOE", field: "doe"}               
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
      let x = await Api.getRequest("v1/dependants");
      console.log(x);
      if (x.message === "SUCCESS") {
        setData(x.data);
        setConnection(true);
      } else if (x.message === "unauthorized") {
        localStorage.clear();
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

          <MaterialTable
            title="Dependants"
            icons={tableIcons}
            columns={tableHeaders.columns}
            data={data}
            actions={[
              // {
              //   icon: tableIcons.Delete,
              //   tooltip: 'Delete Member',
              //   onClick: (event, rowData) => console.log(rowData)
              // },
              {
                icon: tableIcons.Edit,
                tooltip: "Edit Dependant",
                onClick: (event, rowData) =>
                  history.push("/DependantPage", { x: rowData, edit: true }),
              },
            ]}
            editable={{
              // onRowAdd: (newData) =>
              //   new Promise((resolve) => {
              //     setTimeout(() => {
              //       resolve();
              //       setState((prevState) => {
              //         const data = [...prevState.data];
              //         data.push(newData);
              //         return { ...prevState, data };
              //       });
              //     }, 600);
              //   }),
              // onRowUpdate: (newData, oldData) =>
              //   new Promise((resolve) => {
              //     setTimeout(() => {
              //       resolve();
              //       if (oldData) {
              //         setState((prevState) => {
              //           const data = [...prevState.data];
              //           data[data.indexOf(oldData)] = newData;
              //           return { ...prevState, data };
              //         });
              //       }
              //     }, 600);
              //   }),
              onRowDelete: (oldData) =>
                new Promise((resolve, reject) => {
                  let x = oldData;
                  // don't send again while we are sending
                  if (isSending) return;

                  // update state
                  setIsSending(true);
                  // send the actual request

                  fetchData(oldData);
                  async function fetchData(x) {
                    let resp = await Api.deleteRequest("v1/dependants/" + x.id);
                    var time = 5000;
                    console.log(resp);
                    if (resp.message === "SUCCESS") {

                      setOpenSnackbar({
                        severity: "success",
                        message: "Successfully Deleted",
                        open: true,
                        time: time,
                        closeType: close,
                      });
                      resolve();
                    } else {
                      console.log("else")
                      if (resp.message == "FAILURE") {
                        console.log("bob")
                        setOpenSnackbar({
                          severity: "error",
                          message: "Could Not Delete Dependant",
                          open: true,
                          time: time,
                          closeType: close,
                        });
                      } else if (resp.message === "unauthorized") {
                        localStorage.clear();
                        history.push("/", {
                          last: location.pathname,
                          data: location.state,
                        });
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
                      reject();
                    }
                    
                    //throw new Error(resp);
                  }

                  console.log(data);
                })
                  .then(() => {
                    // once the request is sent, update state again
                    if (isMounted.current)
                      // only update if we are still mounted
                      setIsSending(false);

                    // setTimeout(() =>{
                    const dataDelete = [...data];
                    const index = oldData.tableData.id;
                    dataDelete.splice(index, 1);
                    setData([...dataDelete]);
                    //
                    // }, 1000)
                  })
                  .catch((error) => {
                    console.log(error.data);
                  }),
            }}
            options={{
              headerStyle: {
                backgroundColor: "#1A2819",
                color: "#FFF",
              },
            }}
            detailPanel={[
              {
                tooltip: "Show Details",
                render: (rowData) => {
                  return (
                    <p
                      style={{
                        fontSize: 20,
                        textAlign: "center",
                        color: "white",
                        backgroundColor: "#43A047",
                      }}
                    >
                      address 
                      area 
                      postalCode 
                      claimed 
                      paidJoiningFee 
                      id 
                      doe 
                      dob
                      idnumber

                    </p>
                  );
                },
              },
            ]}
          />
        </div>
      ) : (
        <div>{error ? <ErrorPage /> : <LoadingIcon />}</div>
      )}
    </div>
  );
}
