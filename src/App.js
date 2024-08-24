import MeeshoLabelSplit from "./MeeshoLabelSplit";
import AmazonLabelSplit from "./AmazonLabelSplit";
import React, { useState } from "react";
import {
  Tabs,
  Tab,
  Box,
  Typography,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import "./App.css";

const theme = createTheme({
  palette: {
    primary: {
      main: "#000", // Your desired color
    },
  },
});

function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <BasicTabs />
      </ThemeProvider>
    </div>
  );
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function BasicTabs() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="basic tabs example"
        variant="fullWidth"
      >
        <Tab label="Meesho" {...a11yProps(0)} />
        <Tab label="Amazon" {...a11yProps(1)} />
      </Tabs>
      <TabPanel value={value} index={0}>
        <MeeshoLabelSplit />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <AmazonLabelSplit />
      </TabPanel>
    </Box>
  );
}

export default App;
