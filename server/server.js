require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");

app.use(express.json());

var Rollbar = require("rollbar");
var rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
});

// record a generic message and send it to Rollbar
rollbar.log("Hello world!");

const students = ["Jimmy", "Timothy", "Jimothy"];

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  rollbar.info("user access main page");
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/api/students", (req, res) => {
  rollbar.info("user got Students");
  res.status(200).send(students);
});

app.post("/api/students", (req, res) => {
  let { name } = req.body;

  const index = students.findIndex((student) => {
    return student === name;
  });

  try {
    if (index === -1 && name !== "") {
      students.push(name);
      rollbar.info(` user ${name} created successfully`);
      res.status(200).send(students);
    } else if (name === "") {
      rollbar.warning("student name is blank");
      res.status(400).send("You must enter a name.");
    } else {
      rollbar.critical(`user tried adding name that already exists`);
      res.status(400).send("That student already exists.");
    }
  } catch (err) {
    rollbar.error(err);
    console.log(err);
  }
});

app.delete("/api/students/:index", (req, res) => {
  const targetIndex = +req.params.index;
  rollbar.warning(`user ${students[targetIndex]}is deleted `);
  students.splice(targetIndex, 1);

  res.status(200).send(students);
});

const port = process.env.PORT || 5050;

app.listen(port, () => console.log(`Server listening on ${port}`));
