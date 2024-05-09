import "./App.css";
import React, { useEffect, useState } from "react";
import { DataGridPro, LicenseInfo } from "@mui/x-data-grid-pro";
import * as alasql from "alasql";
LicenseInfo.setLicenseKey(
  "369a1eb75b405178b0ae6c2b51263cacTz03MTMzMCxFPTE3MjE3NDE5NDcwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI="
);

function App() {
  const sqlite3 = require("sqlite3").verbose(),
    fs = require("fs");
  const db = new sqlite3.Database("./sdtm.db");
  useEffect(() => {
    const x = [
      { a: 1, b: 10 },
      { a: 1, b: 20 },
      { a: 2, b: 30 },
      { a: 2, b: 40 },
      { a: 3, b: 50 },
      { a: 3, b: 60 },
    ];
    alasql
      .promise("SELECT a,sum(b) as total FROM ? group by a", [x])
      .then(function (data) {
        console.log("data", data);
        return data;
      });
    db.run("select * from sdtm", (err, row) => {
      console.log("row", row);
    });
  }, []);

  return (
    <div className="App">
      <DataGridPro
        rows={[
          { id: 1, col1: "Hello", col2: "World" },
          { id: 2, col1: "XGrid", col2: "is Awesome" },
          { id: 3, col1: "Material-UI", col2: "is Amazing" },
        ]}
        columns={[
          { field: "col1", headerName: "Column 1", width: 150 },
          { field: "col2", headerName: "Column 2", width: 150 },
        ]}
      />
    </div>
  );
}
export default App;
