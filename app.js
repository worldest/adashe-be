//start
const express = require("express");
var StatusCodes = require("./StatusCodes/index");
const Log = require("./Services/Log")
const app = express();
const cron = require("node-cron");
const util = require("util");
const express_waf_middleware = require("express-waf-middleware");
const connection = require("./DB/dbConnect");
const Queue = require("bull")
const Redis = require('redis');
connection.query = util.promisify(connection.query).bind(connection);
const sendNotification = require("./Services/NotificationController");
const otpGenerator = require('otp-generator')
const { sendEmail } = require("./Services/Email");
const session = require('express-session')
const crypto = require('crypto');
const expiryDate = new Date(Date.now() + 60 * 60 * 500)
require('dotenv').config();


const device = JSON.parse(process.env.TRUSTED_DEVICES)
app.use(session({
  secret: crypto.randomBytes(48).toString('hex'),
  name: crypto.randomBytes(48).toString('hex'),
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: true,
    httpOnly: true,
    expires: expiryDate
  }
}))

//
let waf_options = {
  url: 1,
  userAgent: 1,
  cookies: 1,
  body: 1,
  log: 1
}
app.use(express_waf_middleware(waf_options));


const cors = require("cors");
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cors({
  origin: '*'
}));
app.set('trust proxy', 1)
app.disable('x-powered-by', false);



// app.disable('')

app.use(async (req, res, next) => {

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  // res.redirect(302, process.env.BASE_URL);
  const userAgent = req.get('User-Agent');
  console.log('User-Agent:', userAgent);

  // Remote IP address of the client
  const ipAddress = req.ip;
  console.log('IP Address:', ipAddress);

  const ref = `${userAgent} (${ipAddress})`
  console.log("USER", ref)
  var endpoint = req.hostname + req.url;

  await connection.query(`INSERT INTO logs (route_link, query, body, ref) VALUES ('${endpoint}', '${req.query ? JSON.stringify(req.query) : 'n/a'}', '${req.body ? JSON.stringify(req.body) : 'n/a'}', '${ref}')`)
  const containsWord = containsWordFromArray(userAgent, device);
  if (containsWord === true) {
    console.log("EXIST")
    next();
    app.options('*', (req, res) => {
      res.header("Access-Control-Allow-Methods", 'GET, PATCH, PUT, POST, DELETE, OPTIONS');
      res.send();
    })
  } else {
    console.log("NOTEXIST")
    res.status(400).send({
      ...StatusCodes.NotProccessed
    })
  }

})


const Authentication = require("./Microservices/Authentication/Auth")
app.use("/api/v1/auth", Authentication)

function containsWordFromArray(string, wordsArray) {
  // Convert the string to lowercase for case-insensitive comparison
  const lowercaseString = string.toLowerCase();

  // Iterate through the words array
  for (const word of wordsArray) {
    // Convert the word to lowercase for case-insensitive comparison
    const lowercaseWord = word.toLowerCase();

    // Check if the lowercase string contains the lowercase word
    if (lowercaseString.includes(lowercaseWord)) {
      return true; // Found a match, return true
    }
  }

  return false; // No match found
}


module.exports = app;