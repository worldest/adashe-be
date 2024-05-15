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
const sendSMSTermii = require('../../Services/SMSTermii');
// connection.connect();
// connection.query("ALTER USER 'sql8634749' IDENTIFIED WITH mysql_native_password BY 'ewRgR277LS'", function(error, results, fields){
//     console.log(error)
// })



router.post("/resend/:phone", async function (req, res, next) {
    const phone = req.params.phone;

    const token = await generateToken();
    const otp = await otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false
    });
    // if(phone.length != 10){
    //     res.status(400).send({
    //         ...StatusCodes.MissingPayload,
    //         errorMessage: "Invalid phone supplied"
    //     })
    //     return null
    // }
    // const phoneStandard = "+234" + phone;
    connection.query(`SELECT * FROM users WHERE account_id='${parseInt(phone)}'`, async function (error, results, fields) {
        if (results.length > 0) {
            const user = results[0];
            const userid = user.user_id;
            const { isDiaspora, email } = user;
            const phone_number = user.phone;
            connection.query(`UPDATE auth_code SET status='1' WHERE user_id=? AND status='0'`, [userid]);
            connection.query(`INSERT INTO auth_code (user_id, auth_code) VALUES (?, ?)`, [userid, otp]);
            const text = `Use ${otp} to confirm your phone.`;
            let sentTo;
            if (isDiaspora == 0) {
                await sendSMSTermii(phone_number, text);
                sentTo = phone_number

            } else {
                sentTo = email
                let mailObject = {
                    email: email,
                    subject: "OTP - KashRite",
                    from: "KashRite",
                    message: text
                }
                await sendEmail(mailObject)
            }

            res.status(200).send({
                ...StatusCodes.Success,
                success_message: "OTP resent to " + sentTo,
                otp
            })
        } else {
            res.status(401).send({
                ...StatusCodes.AuthError,
                errorMessage: "No onboarding or profile found"
            })
        }
    })
})

router.post("/send/:phone", async function (req, res, next) {
    const phone = req.params.phone;

    const token = await generateToken();
    const otp = await otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false
    });
    if (phone.length != 10) {
        res.status(400).send({
            ...StatusCodes.MissingPayload,
            errorMessage: "Invalid phone supplied"
        })
        return null
    }
    const phoneStandard = "+234" + phone;
    connection.query(`SELECT * FROM users WHERE phone='${phoneStandard}'`, async function (error, results, fields) {
        if (results.length > 0) {
            const user = results[0];
            const userid = user.user_id;
            connection.query(`UPDATE auth_code SET status='1' WHERE user_id=? AND status='0'`, [userid]);
            connection.query(`INSERT INTO auth_code (user_id, auth_code) VALUES (?, ?)`, [userid, otp]);
            const text = `Use ${otp} to confirm your phone.`;
            await sendSMSTermii(phoneStandard, text);
            console.log(otp);
            res.status(200).send({
                ...StatusCodes.Success,
                success_message: "OTP sent to phone",
                otp
            })
        } else {
            res.status(401).send({
                ...StatusCodes.AuthError,
                errorMessage: "No onboarding or profile found"
            })
        }
    })
})
module.exports = router