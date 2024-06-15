const express = require('express');
const router = express.Router();
const StatusCodes = require('../../StatusCodes/index');
const generateToken = require('../../Tokenization/Generate');



router.use(express.json());
let { sendEmail, sendEmailBrevo } = require("../../Services/Email");
const otpGenerator = require('otp-generator')
const requestIp = require('request-ip');
let ipLocation = require('ip-location');
const sendSMS = require('../../Services/SMSComm');

const connection = require("../../DB/dbConnect");
const generateID = require('../../Tokenization/GenerateID');
const HeaderToken = require('../../Tokenization/HeaderToken');
const { VerifyToken } = require('../../Tokenization/Verify');
const validator = require('../../Services/Validator');
const sendSMSTermii = require('../../Services/SMSTermii');
const { Encrypt, Decrypt } = require("../../Tokenization/Encryption")


router.post("/submit_request", async function (req, res, next) {
    if (!req.header("Authorization")) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Token not present"
        });
        return null
    }
    let Bearer = req.header("Authorization");
    const token = await HeaderToken(Bearer);
    console.log("TOKEN", token)
    let isValid = await VerifyToken(token)
    console.log("PACKET", isValid)
    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Authentication error"
        });
        return null
    }
    const { group_id, amount, userid, comment, receipt } = req.body;
    if (!group_id || !amount || !userid || !comment) {
        res.status(400).send({
            ...StatusCodes.NotProccessed,
            errorMessage: "Missing field in payload"
        })
        return null
    }
    const getUser = await connection.query("SELECT * FROM users WHERE user_id = ?", [userid])
    if (getUser.length <= 0) {
        res.status(404).send({
            ...StatusCodes.NotFound,
            payload: {},
            errorMessage: "User not found"
        })
        return null
    }
    const getGroup = await connection.query("SELECT * FROM groups WHERE id = ?", [group_id])
    if (getGroup.length <= 0) {
        res.status(404).send({
            ...StatusCodes.NotFound,
            payload: {},
            errorMessage: "Group not found"
        })
        return null
    }
    await connection.query("INSERT INTO group_txn (group_id, user_id, amount, receipt, comment) VALUES (?, ?, ?, ?, ?)", [group_id, userid, amount, receipt, comment])
    res.status(200).send({
        ...StatusCodes.Success,
        message: "Request submitted successfully for approval"
    })



})

router.patch("/decide", async function (req, res, next) {
    if (!req.header("Authorization")) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Token not present"
        });
        return null
    }
    let Bearer = req.header("Authorization");
    const token = await HeaderToken(Bearer);
    console.log("TOKEN", token)
    let isValid = await VerifyToken(token)
    console.log("PACKET", isValid)
    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Authentication error"
        });
        return null
    }
    const { userid, txnid, decision } = req.body;
    if (!userid || !txnid || !decision) {
        res.status(400).send({
            ...StatusCodes.NotProccessed,
            errorMessage: "Missing field in payload"
        })
        return null
    }
    const getUser = await connection.query("SELECT * FROM users WHERE user_id = ?", [userid])
    if (getUser.length <= 0) {
        res.status(400).send({
            ...StatusCodes.NotProccessed,
            errorMessage: "User not found."
        })
        return null
    }
    const getTxn = await connection.query("SELECT * FROM group_txn WHERE id = ?", [txnid])
    if (getUser.length <= 0) {
        res.status(400).send({
            ...StatusCodes.NotProccessed,
            errorMessage: "Transsaction not found."
        })
        return null
    }
    const txn = getTxn[0];
    const group_id = txn.group_id;
    const status = txn.status;
    const amount = parseFloat(txn.amount)
    const getGroup = await connection.query("SELECT * FROM groups WHERE host = ? AND id = ?", [userid, group_id])
    if (getGroup.length <= 0) {
        res.status(400).send({
            ...StatusCodes.NotProccessed,
            errorMessage: "Permission not granted to approve transaction"
        })
        return null
    }
    if (parseInt(status) > 0) {
        res.status(400).send({
            ...StatusCodes.NotProccessed,
            errorMessage: "Decision already made."
        })
        return null
    }
    if (parseInt(decision) == 1) {
        await connection.query("UPDATE group_txn SET status = ? WHERE id = ?", [decision, txnid]);
        await connection.query("UPDATE groups SET group_value = group_value + ? WHERE id = ?", [amount, group_id]);
    } else {
        await connection.query("UPDATE group_txn SET status = ? WHERE id = ?", [decision, txnid]);
    }
    res.status(200).send({
        ...StatusCodes.Success,
        message: "Transaction updated successfully"
    })
})


module.exports = router