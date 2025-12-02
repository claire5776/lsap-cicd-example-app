// app.js
const express = require("express");
const app = express();
const unusedVar = "test break lint notification";

app.get("/", (req, res) => {
  res
    .status(200)
    .send("<h1>Welcome to the CI/CD Workshop!</h1>");
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});


module.exports = app;
