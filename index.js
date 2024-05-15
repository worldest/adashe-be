
const express = require("express");
var StatusCodes = require("./StatusCodes/index");
const app = require("./app");
const http = require('http').createServer(app)
const helmet = require('helmet');



app.set('trust proxy', 1)




const cors = require("cors");
const { Encrypt } = require("./Tokenization/Encryption");

const port = process.env.PORT || 4006;
app.use(helmet());
app.disable('x-powered-by');
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cors({
  origin: '*'
}));





app.use("/", (req, res) => {
  res.send({
    ...StatusCodes.Success,
    statusMessage: "Plazar is open and ready to accept request",
    db_status: "Ok",
    API_status: "Ok",
    server_health: "running",
    warning: "Endpoint is not connected to any route."
  })
})



var server = http.listen(port, async function () {


  console.log(`Plazar is running fine on port ${port}`)
})