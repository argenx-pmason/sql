import "./App.css";
import React, { useEffect, useState, useRef } from "react";
import { DataGridPro, LicenseInfo, GridToolbar } from "@mui/x-data-grid-pro";
import { usePapaParse } from "react-papaparse";
import * as alasql from "alasql";
import {
  TextField,
  AppBar,
  Tooltip,
  IconButton,
  Toolbar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Link,
} from "@mui/material";
import studies_info from "./studies_info.json";
import { Info } from "@mui/icons-material";
LicenseInfo.setLicenseKey(
  "6b1cacb920025860cc06bcaf75ee7a66Tz05NDY2MixFPTE3NTMyNTMxMDQwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI="
);

function App() {
  let realhost;
  // make columns definition from the first row of the data
  const title = "Query data using SQL",
    { location } = window,
    { search, host, href } = location,
    mode = href.startsWith("http://localhost") ? "local" : "remote",
    { readString } = usePapaParse();

  if (host.includes("sharepoint")) {
    realhost = "xarprod.ondemand.sas.com";
  } else if (host.includes("localhost")) {
    realhost = "xartest.ondemand.sas.com";
  } else {
    realhost = host;
  }

  const webDavPrefix = "https://" + realhost + "/lsaf/webdav/repo",
    urlParams = new URLSearchParams(search),
    [openInfo, setOpenInfo] = useState(false),
    [rows, setRows] = useState(null),
    [cols, setCols] = useState(null),
    [rows2, setRows2] = useState(null),
    [cols2, setCols2] = useState(null),
    [numberOfRows, setNumberOfRows] = useState(),
    [numberOfCols, setNumberOfCols] = useState(),
    path = urlParams.get("path"),
    _key = urlParams.get("key"),
    innerHeight = window.innerHeight,
    tableHeight = Math.round(innerHeight / 2) - 20,
    textRef = useRef(),
    // statement = "select indication, count(*) from ? group by indication",
    // [sql, setSql] = useState(null),
    getFile = async () => {
      const response = await fetch(webDavPrefix + path);
      let _rows = null,
        _rows0 = null;
      if (path.endsWith(".csv")) _rows0 = await response.text();
      else _rows = await response.json();
      if (path.endsWith(".csv")) {
        const _rows1 = readString(_rows0, { header: true });
        _rows = _rows1.data;
      }
      const _rows2 = _key ? _rows[_key] : _rows;
      console.log(
        "getFile - fetch: response=",
        response,
        "_rows=",
        _rows,
        "_key=",
        _key
      );
      const _cols = Object.keys(_rows2[0]).map((k, id) => {
        return {
          field: k,
          headerName: k,
          width: 150,
        };
      });
      console.log("_cols=", _cols);
      setRows(_rows2);
      setCols(_cols);
      setNumberOfRows(_rows2.length.toLocaleString());
      setNumberOfCols(_cols.length);
    },
    runSql = () => {
      if (!rows) return;
      const _sql = textRef.current.value;
      console.log(_sql);
      // setSql(_sql);
      localStorage.setItem("sql", _sql);
      alasql.promise(_sql, [rows]).then(function (result) {
        console.log("result", result);
        setRows2(result);
        setCols2(
          Object.keys(result[0]).map((k, id) => {
            return {
              field: k,
              headerName: k,
              width: 150,
            };
          })
        );
      });
    };

  useEffect(() => {
    const _sql = localStorage.getItem("sql");
    // setSql(_sql);
    textRef.current.value = _sql;
    if (mode === "local" || !path) {
      const _cols = Object.keys(studies_info[0]).map((k, id) => {
        return {
          field: k,
          headerName: k,
          width: 150,
        };
      });
      setRows(studies_info);
      setCols(_cols);
      setNumberOfRows(studies_info.length.toLocaleString());
      setNumberOfCols(_cols.length);
    } else {
      console.log("path", path);
      getFile();
    }
    // eslint-disable-next-line
  }, [path]);

  console.log("tableHeight", tableHeight);

  return (
    <div className="App">
      <AppBar position="fixed">
        <Toolbar variant="dense" sx={{ backgroundColor: "#f7f7f7" }}>
          <Box
            sx={{
              border: 1,
              borderRadius: 2,
              color: "black",
              fontWeight: "bold",
              boxShadow: 3,
              fontSize: 14,
              height: 23,
              padding: 0.3,
            }}
          >
            &nbsp;&nbsp;{title}&nbsp;&nbsp;
          </Box>
          <TextField
            label="Path"
            size="small"
            sx={{ mt: 1, mb: 1, flexGrow: 1, ml: 2 }}
            defaultValue={path}
            disabled
          />
          <TextField
            label=""
            size="small"
            sx={{ mt: 1, mb: 1, ml: 2, color: "green" }}
            value={numberOfRows + " rows"}
            disabled
          />
          <TextField
            label=""
            size="small"
            sx={{ mt: 1, mb: 1, ml: 2, color: "green" }}
            value={numberOfCols + " cols"}
            disabled
          />

          <Box sx={{ flexGrow: 1 }}></Box>
          <Tooltip title="Information about this screen">
            <IconButton
              color="info"
              // sx={{ mr: 2 }}
              onClick={() => {
                setOpenInfo(true);
              }}
            >
              <Info />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          height: 300,
          width: "90%",
          backgroundColor: "#e6ffe6",
          margin: "auto",
          mt: 9,
        }}
      >
        {rows && (
          <DataGridPro
            rows={rows}
            columns={cols}
            density="compact"
            getRowId={() => Math.floor(Math.random() * 100000000)}
            marginBotton={10}
            rowHeight={25}
            hideFooterPagination
            hideFooterRowCount
            hideFooterSelectedRowCount
            hideFooter
          />
        )}{" "}
      </Box>
      {/* select indication, count(*) from ? group by indication */}
      <TextField
        label="SQL"
        // value={statement}
        // onChange={(event) => {
        //   setStatement(event.target.value);
        // }}
        size="small"
        multiline
        rows={4}
        sx={{ mt: 1, width: "80%" }}
        inputRef={textRef}
        // defaultValue={sql}
      />
      <Button
        onClick={runSql}
        size={"small"}
        variant={"contained"}
        sx={{ ml: 3, mt: 2 }}
      >
        Run
      </Button>
      <Box
        sx={{
          height: 400,
          width: "90%",
          backgroundColor: "#ffffcc",
          margin: "auto",
          marginTop: "10px",
        }}
      >
        {rows2 && (
          <DataGridPro
            rows={rows2}
            columns={cols2}
            density="compact"
            getRowId={() => Math.floor(Math.random() * 100000000)}
            size={"small"}
            rowHeight={25}
            hideFooterPagination
            hideFooterRowCount
            hideFooterSelectedRowCount
            hideFooter
            slots={{ toolbar: GridToolbar }}
          />
        )}{" "}
      </Box>
      {/* Dialog with General info about this screen */}
      <Dialog
        fullWidth
        maxWidth="xl"
        onClose={() => setOpenInfo(false)}
        open={openInfo}
      >
        <DialogTitle>Info about this screen</DialogTitle>
        <DialogContent>
          <Box sx={{ color: "blue", fontSize: 11 }}>
            Enter a SQL statement in the text box and press the Run button to
            execute it against the data in the green table. You should specify
            the dataset name as <b>?</b>, since it will then use the data from
            the green table.
            <p />
            <h5>Sample SQL statements:</h5>
            <ul>
              <li>select * from ?</li>
              <li>select * from ? where age > 50</li>
              <li>select indication, count(*) from ? group by indication</li>
            </ul>
            <p />
            <Link
              href="http://alasql.surge.sh/keywords/#select"
              target="_blank"
              sx={{ ml: 1, color: "red", fontSize: "20px" }}
            >
              SQL Keywords
            </Link>
            <Link
              href="https://github.com/AlaSQL/alasql"
              target="_blank"
              sx={{ ml: 1, color: "blue", fontSize: "20px" }}
            >
              Github
            </Link>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default App;
