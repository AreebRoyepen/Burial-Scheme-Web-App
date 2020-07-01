import React, { useState, useEffect } from "react";
import jwt from "jwt-decode";
import ReportEndpoints from "./ReportEndpoints";
import { MdFileDownload, MdEmail } from "react-icons/md";
import "../../../styles/validationForm.css";

export default function Reports() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    let decode = jwt(localStorage.token);
    
    setUser(decode.user)  
    
  }, [setUser]);

  const [params, setParams] = useState({
    param1: null,
    param2: null,
    endpoint: null,
    send: null,
    email: null,
  });


  const getOptions = (x, y) => {
    setParams({
      param2: x,
      endpoint: y,
      send: true,
      email: user.email,
    });
  };

  const toEndpoints = () => {
    return <ReportEndpoints props={params} />;
  };

  return (
    <div>
      {console.log(params)}

      {params.send ? toEndpoints() : <div />}

      <div id="demo makeRow">
        <table id="table" className="table table-hover table-mc-light-blue makeRow">
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "center",
                  backgroundColor: "#1A2819",
                  color: "white",
                  width: "33.33%",
                }}
              >
                Genarated Report
              </th>
              <th
                style={{
                  textAlign: "center",
                  backgroundColor: "#C1A162",
                  color: "white",
                  width: "33.33%",
                }}
              >
                Download Report
              </th>
              <th
                style={{
                  textAlign: "center",
                  backgroundColor: "rgb(114, 155, 37)",
                  color: "white",
                  width: "33.33%",
                }}
              >
                Email Report
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ textAlign: "center" }} data-title="Name">
                Claim Dump
              </td>
              <td data-title="Link" style={{ textAlign: "center" }}>
                <button
                  style={{ textAlign: "center" }}
                  className="reportsButton makeRow"
                  onClick={() => getOptions("download", "claims")}
                >
                  <MdFileDownload size={20} />
                </button>
              </td>
              <td data-title="Status" style={{ textAlign: "center" }}>
                <button
                  className=" reportsButton makeRow"
                  style={{
                    color: "rgb(114, 155, 37)",
                    borderColor: "rgb(114, 155, 37) !important",
                  }}
                  onClick={() => getOptions("email", "claims")}
                >
                  <MdEmail size={20} />
                </button>
              </td>
            </tr>
            <tr>
              <td data-title="Name" style={{ textAlign: "center" }}>
                Member Details
              </td>
              <td data-title="Link" style={{ textAlign: "center" }}>
                <button
                  className="reportsButton"
                  onClick={() => getOptions("download", "memberDetails")}
                >
                  <MdFileDownload size={20} />
                </button>
              </td>
              <td data-title="Status" style={{ textAlign: "center" }}>
                <button
                  className="reportsButton"
                  style={{
                    color: "rgb(114, 155, 37)",
                    borderColor: "rgb(114, 155, 37) !important",
                  }}
                  onClick={() => getOptions("email", "memberDetails")}
                >
                  <MdEmail size={20} />
                </button>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
}
