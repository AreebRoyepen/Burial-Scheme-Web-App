import React, { useState, useEffect, useRef } from "react";
import Snackbar from "@material-ui/core/Snackbar";
import MaterialTable from "material-table";
import Tooltip from "@material-ui/core/Tooltip"
import { makeStyles } from "@material-ui/core/styles";
import { useHistory, useLocation } from "react-router-dom";
import LoadingIcon from "../shared/LoadingIcon";
import Alert from "../shared/Alert";
import { ErrorPage } from "../shared/ErrorPage";
import { tableIcons } from "../shared/MaterialTableIcons";
import {getRequest, deleteRequest} from "../../../api/Api";
import "../../../styles/eventCard.css";
import "../../../styles/detailPanel.css"
const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
}));

export default function MembersV2() {
  const [tableHeaders] = useState({
    columns: [
      { title: "Member No.", field: "id" },
      { title: "Name", field: "name" },
      { title: "Surname", field: "surname" },
      { title: "Claimed", field: "claimed", type:"boolean" },
      { title: "Joining Fee", field: "paidJoiningFee", type : "boolean" },
      { title: "Email Address", field: "email" },
      { title: "Cell Number", field: "cellNumber" },               
      
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

  function formatDate(x) {

    if(x ===null)return x
    
    let date = new Date(x);

    var dd = date.getDate();
    var mm = date.getMonth() + 1;

    var yyyy = date.getFullYear();
    if (dd < 10) {
      dd = "0" + dd;
    }
    if (mm < 10) {
      mm = "0" + mm;
    }
    return dd + "/" + mm + "/" + yyyy;

  }

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
      let x = await getRequest("v1/members");
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
            onClick={() => {
              history.push("/MemberPage", { id: null});
            }}
            className="funButton headerButtons"
          >
            Add Member
          </button>
          <MaterialTable
            title="Members"
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
                tooltip: "Edit Member",
                onClick: (event, rowData) =>{
                  history.push("/MemberPage", { x: {...rowData, tableData: null}, edit: true })
                },
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
                  // don't send again while we are sending
                  if (isSending) return;

                  // update state
                  setIsSending(true);
                  // send the actual request

                  fetchData(oldData);
                  async function fetchData(x) {
                    let resp = await deleteRequest("v1/members/" + x.id);
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
                          message: "Could Not Delete Member",
                          open: true,
                          time: time,
                          closeType: close,
                        });
                      } else if (resp.message === "unauthorized") {
                        //localStorage.clear();
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
                      }else{
                        time = 6000;
                        setOpenSnackbar({
                          severity: "error",
                          message: resp.error,
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
              actionsColumnIndex: -1
            }}
            detailPanel={[
              {
                tooltip: "Show Details",
                render: (rowData) => {
                  return (
                    <div className = "centerDiv">
                      <section className = "sectionforDetailPanelLeftHeader">
                      <ul><strong>Date of Birth</strong></ul>
                       <ul><strong>Entry Date</strong></ul>
                       <ul><strong>ID Number</strong></ul>
                       <ul><strong>Work Number</strong></ul>
                       <ul><strong>Home Number</strong></ul>
                      </section>

                      <section className = "sectionforDetailPanelLeft">
                      <ul>{formatDate(rowData.dob)} </ul>
                       <ul>{formatDate(rowData.doe)}</ul>
                       <ul> {rowData.idnumber}</ul>
                       <ul>{rowData.workNumber}</ul>
                       <ul>{rowData.homeNumber}</ul>
                      </section>

                      <section className = "sectionforDetailPanelRight">
                        <ul><strong>Address</strong></ul>
                      <ul>{rowData.address}</ul> 
                      <ul>{rowData.area}</ul> 
                      <ul>{rowData.postalCode}</ul>  
                      </section>

                      <section className = "sectionforDetailPanelRight">
                      <ul><strong>  {rowData.dependants.length >0 ? "Dependants" : "No Dependants" }</strong></ul>                       
                      
                      {rowData.dependants.map(x=>{
                        return (
                          <Tooltip key={x.id} title="Click to Edit Dependant">
                        <div 
                        style={{ color: "#1A2819", textDecoration: "underline" }}>
                          <ul
                          onClick = {()=>{
                            history.push("/DependantPage", { last : location.pathname , dependant: x, edit: true })
                          }}
                          >{x.id + ". " + x.name + " " + x.surname}</ul>
                        </div>
                        </Tooltip>
                        )
                      })                      
                      }
                      </section>
                    </div>
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
