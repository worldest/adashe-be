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


router.get("/:id", async function (req, res, next) {
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
    const { id } = req.params;
    const getGroup = await connection.query("SELECT * FROM users WHERE user_id = ?", [id])
    if (getGroup.length <= 0) {
        res.status(404).send({
            ...StatusCodes.NotFound,
            payload: {},
            errorMessage: "User not found"
        })
        return null
    }
    res.status(200).send({
        ...StatusCodes.Success,
        payload: getGroup[0]
    })



})

router.get("/users/all/:userid", async function (req, res, next) {
    const { userid } = req.params;
    // if (userid !== "14bJgK4npfyzs1ij2gEemaSnV86Sj2bN" || userid !== "wWDk1ZbO54aqHV4WlEgC1t7bTcxwyD5x" || userid !== "3cnSvhdRfeo1XG5cWMhJHffnvO5f7Ug8") {
    //     res.status(200).send({
    //         ...StatusCodes.Success,
    //         message: "Admin only route",
    //         payload: []
    //     })
    //     return null
    // }
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

    const getGroup = await connection.query("SELECT * FROM users")
    if (getGroup.length <= 0) {
        res.status(404).send({
            ...StatusCodes.Success,
            payload: []
        })
        return null
    }
    res.status(200).send({
        ...StatusCodes.Success,
        payload: getGroup
    })



})

router.get("/transactions/:id", async function (req, res, next) {
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
    const { id } = req.params;
    const getGroup = await connection.query("SELECT * FROM groups JOIN group_txn ON group_txn.group_id = groups.id WHERE user_id = ?", [id])

    res.status(200).send({
        ...StatusCodes.Success,
        payload: getGroup
    })



})

router.get("/transactions/get/all", async function (req, res, next) {
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
    const getGroup = await connection.query("SELECT * FROM groups LEFT JOIN group_txn ON group_txn.group_id = groups.id")

    res.status(200).send({
        ...StatusCodes.Success,
        payload: getGroup
    })



})


router.get("/payouts/get/all", async function (req, res, next) {
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
    const getGroup = await connection.query("SELECT SUM(amount) as total_amount FROM group_payouts")

    res.status(200).send({
        ...StatusCodes.Success,
        payload: getGroup
    })



})


router.patch("/update/:userid", async function (req, res, next) {
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
    const { userid } = req.params
    const { first_name, last_name } = req.body;
    if (!first_name || !last_name) {
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
    await connection.query("UPDATE users SET first_name = ?, last_name = ? WHERE user_id = ?", [first_name, last_name, userid]);
    res.status(200).send({
        ...StatusCodes.Success,
        message: "Profile edited Successfully"
    })
})


module.exports = router