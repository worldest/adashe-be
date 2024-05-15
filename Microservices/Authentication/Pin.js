const express = require('express');
const router = express.Router();
const StatusCodes = require('../../StatusCodes/index');

const generateToken = require('../../Tokenization/Generate');



router.use(express.json());
let { sendEmail } = require("../../Services/Email");
const otpGenerator = require('otp-generator')
const requestIp = require('request-ip');
let ipLocation = require('ip-location');
const sendSMS = require('../../Services/SMSComm');

const connection = require("../../DB/dbConnect");
const generateID = require('../../Tokenization/GenerateID');
const HeaderToken = require('../../Tokenization/HeaderToken');
const { VerifyToken, VerifyOTP } = require('../../Tokenization/Verify');
const { Decrypt, Encrypt } = require('../../Tokenization/Encryption');

router.post("/set/:userid", async function (req, res, next) {
    const { userid } = req.params;
    if (!req.body.pin) {
        res.status(400).send({
            ...StatusCodes.MissingPayload,
            errorMessage: "Please enter Pin"
        })
        return null
    }
    const pin = req.body.pin;
    const queryUser = await connection.query(`SELECT * FROM users WHERE user_id=?`, [userid]);
    let Bearer = req.header("Authorization");
    if (!Bearer) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Empty Authorization bearer token"
        })
        return null
    }
    const token = await HeaderToken(Bearer);
    const isValid = await VerifyToken(token);
    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            message: "Invalid Authorization token"
        })
        return null;
    }
    let pinEncryption = await Encrypt(pin);
    const checkPin = await connection.query(`SELECT * FROM pin WHERE user_id=?`, [userid]);
    if (checkPin.length > 0) {
        connection.query(`UPDATE pin SET pin='${pinEncryption}' WHERE user_id=?`, [userid]);
        res.status(200).send({
            ...StatusCodes.Success,
            message: "Pin successfully set"
        })
        return null
    }

    await connection.query(`INSERT INTO pin (user_id, pin) VALUES (?, ?)`, [userid, pinEncryption])
    res.status(200).send({
        ...StatusCodes.Success,
        errorMessage: "Pin successfully set"
    })
})

router.post("/check/:userid", async function (req, res, next) {
    const { userid } = req.params;
    console.log(req.hostname)
    if (!req.body.pin) {
        res.status(400).send({
            ...StatusCodes.MissingPayload,
            errorMessage: "Please enter Pin"
        })
        return null
    }
    const pin = req.body.pin;

    let Bearer = req.header("Authorization");
    if (!Bearer) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Empty Authorization bearer token"
        })
        return null
    }
    const token = await HeaderToken(Bearer);
    const isValid = await VerifyToken(token);
    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Invalid Authorization token"
        })
        return null;
    }

    const checkPin = await connection.query(`SELECT * FROM pin WHERE user_id=?`, [userid]);
    const userPin = checkPin[0].pin;
    const decryptPin = await Decrypt(userPin);
    if (decryptPin.toString() === pin.toString()) {
        await connection.query(`UPDATE pin_check SET status='1' WHERE user_id=?`, userid)
        await connection.query(`INSERT INTO pin_check (user_id) VALUES (?)`, [userid])
        res.status(200).send({
            ...StatusCodes.Success,
            message: "Pin OK!"
        })
        return null
    } else {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Pin not OK!"
        })
    }

})

router.patch("/update/:userid", async function (req, res, next) {
    const { userid } = req.params;
    if (!req.body.pin) {
        res.status(400).send({
            ...StatusCodes.MissingPayload,
            errorMessage: "Please enter Pin"
        })
        return null
    }
    const pin = req.body.pin;
    const queryUser = await connection.query(`SELECT * FROM users WHERE user_id=?`, [userid]);
    let Bearer = req.header("Authorization");
    if (!Bearer) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Empty Authorization bearer token"
        })
        return null
    }
    const token = await HeaderToken(Bearer);
    const isValid = await VerifyToken(token);
    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            message: "Invalid Authorization token"
        })
        return null;
    }
    const isOTPValid = await VerifyOTP(userid, req.body.otp);
    if (!isOTPValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Invalid OTP"
        })
        return null;
    }
    let pinEncryption = await Encrypt(pin);
    const checkPin = await connection.query(`SELECT * FROM pin WHERE user_id=?`, [userid]);
    if (checkPin.length > 0) {
        connection.query(`UPDATE pin SET pin='${pinEncryption}' WHERE user_id=?`, [userid]);
        res.status(200).send({
            ...StatusCodes.Success,
            message: "Pin successfully set"
        })
        return null
    }

    await connection.query(`INSERT INTO pin (user_id, pin) VALUES (?, ?)`, [userid, pinEncryption])
    res.status(200).send({
        ...StatusCodes.Success,
        errorMessage: "Pin successfully set"
    })
})

module.exports = router;