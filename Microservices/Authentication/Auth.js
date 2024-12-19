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
// connection.connect();
// connection.query("ALTER USER 'sql8634749' IDENTIFIED WITH mysql_native_password BY 'ewRgR277LS'", function(error, results, fields){
//     console.log(error)
// })


router.post("/login", async function (req, res, next) {

    if (!req.body.userid) {
        res.status(400).send({
            ...StatusCodes.MissingPayload,
            errorMessage: "Email/Phone is required"
        })
        return null
    }
    const { userid } = req.body;
    const country_code = req.body.country_code || "+234"

    const otp = await otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false
    });

    let country_code_ = country_code.includes("+") ? country_code : "+" + country_code
    if (userid.toString().length > 10 || userid.toString().length < 10) {
        res.status(400).send({
            ...StatusCodes.NotProccessed,
            errorMessage: "Invalid phone number. Your  phone number should be 10 digits long e.g 8012345678",
            message: "Invalid phone number. Your  phone number should be 10 digits long e.g 8012345678"
        })
        return null
    }

    connection.query(`SELECT * FROM users WHERE phone = ?`, [userid, userid], async function (error, results, fields) {
        // if (error) throw error;

        if (error !== null) {
            res.status(500).send({
                ...StatusCodes.ServerError,
                errorMessage: "Query error, please retry later"
            });
            return null
        }
        if (results.length <= 0) {
            res.status(404).send({
                ...StatusCodes.NotFound,
                errorMessage: "No user found with ID",
                message: "No user found with ID",
            });
            return null
        } else {
            let user = results[0]
            let { user_id, password } = user;

            let passwordDecrypt = await Decrypt(password);
            console.log(passwordDecrypt)
            if (passwordDecrypt === req.body.password) {
                res.status(200).send({
                    ...StatusCodes.Success,
                    message: "Login successful",
                    user: {
                        user_id,
                        token: user.token
                    }
                });
            } else {
                res.status(400).send({
                    ...StatusCodes.Success,
                    message: "Password is not correct.",
                });
            }

        }
    });


})

router.post("/register", async function (req, res, next) {


    const { email, phone, first_name, last_name, password } = req.body;
    console.log(password)
    if (password.length < 6) {
        res.status(400).send({
            ...StatusCodes.NotProccessed,
            errorMessage: "Password should be greater than or equal to 6 characters"
        })
        return null
    }

    if (!email || !phone || !first_name || !last_name || !password) {
        res.status(400).send({
            ...StatusCodes.MissingPayload,
            errorMessage: "All fields are required"
        })
        return null
    }

    if (phone.toString().length > 10 || phone.toString().length < 10) {
        res.status(400).send({
            ...StatusCodes.NotProccessed,
            errorMessage: "Invalid phone number. Your  phone number should be 10 digits long e.g 8012345678",
            message: "Invalid phone number. Your  phone number should be 10 digits long e.g 8012345678"
        })
        return null
    }

    connection.query(`SELECT * FROM users WHERE email = ? OR phone = ?`, [email, phone], async function (error, results, fields) {
        // if (error) throw error;

        if (error !== null) {
            res.status(500).send({
                ...StatusCodes.ServerError,
                errorMessage: "An error occurred. Please check your inputs and retry",
                message: "An error occurred. Please check your inputs and retry"
            });
            return null
        }
        if (results.length > 0) {
            res.status(404).send({
                ...StatusCodes.NotFound,
                errorMessage: "User with that phone or email exists",
                message: "User with that phone or email exists"
            });
            return null
        } else {
            const passwordEncrypt = await Encrypt(password)
            const user_id = await generateID();
            const Date_ = new Date();
            const token = await Encrypt(Date_.toString());
            await connection.query(`INSERT INTO users (first_name, last_name, email, phone, user_id, password, token) VALUES (?, ?, ?, ?, ?, ?, ?)`, [first_name, last_name, email, phone, user_id, passwordEncrypt, token]);
            res.status(200).send({
                ...StatusCodes.Success,
                message: "Registration successful. Proceed to login",

            });

        }
    });


})

router.post("/validate_phone", async function (req, res, next) {

    if (!req.body.phone) {
        res.status(400).send({
            ...StatusCodes.MissingPayload,
            errorMessage: "Phone is missing"
        })
        return null
    }
    const phone = req.body.phone;
    const country_code = req.body.country_code || "+234"

    const otp = await otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false
    });
    console.log("OTP", otp)
    let country_code_ = country_code.includes("+") ? country_code : "+" + country_code
    const phoneNumber = validator.phone(`${country_code_}${phone}`);

    connection.query(`SELECT * FROM users WHERE phone = ?`, [phone], async function (error, results, fields) {
        // if (error) throw error;

        if (error !== null) {
            res.status(500).send({
                ...StatusCodes.ServerError,
                errorMessage: "Query error, please retry later"
            });
            return null
        }
        if (results.length <= 0) {
            res.status(404).send({
                ...StatusCodes.NotFound,
                errorMessage: "Invalid phone number or phone number not found",
                message: "Invalid phone number or phone number not found",
            });
            return null
        } else {
            let user = results[0]
            let { user_id } = user;
            const getAuthCode = await connection.query(`SELECT * FROM auth_code WHERE user_id=? AND use_count = '3' ORDER BY id DESC LIMIT 1`, [user_id]);

            if (getAuthCode.length > 0) {
                res.status(401).send({
                    ...StatusCodes.OTPAccountSuspended
                })
                return null
            }

            const { isDiaspora, email } = user;
            const phone_number = user.phone;
            if (user.first_name === null || user.last_name === null) {
                res.status(400).send({
                    ...StatusCodes.NotProccessed,
                    message: "Please complete your registration. Kindly click on 'Create Account' to complete your profile",
                    otp
                });
                return null
            }
            await connection.query(`UPDATE auth_code SET status='1' WHERE user_id=? AND status='0'`, [user_id]);
            await connection.query(`INSERT INTO auth_code (user_id, auth_code) VALUES (?, ?)`, [user_id, otp]);
            const text = `KashRite: Use ${otp} to verify your phone. Do not share this with anyone.`;
            const smstext = `KashRite: Use ${otp} to verify your phone. Do not share this with anyone.`;
            let sentTo;
            if (phoneNumber.countryIso2 === "NG") {
                await sendSMSTermii(phone_number, smstext);
                sentTo = "phone or email (do not see email? check your spam)"
                let mailObject = {
                    email: email,
                    subject: "OTP - KashRite",
                    from: "KashRite",
                    message: text
                }
                const sendEmailTOUser = await sendEmail(mailObject)

            } else {
                sentTo = "phone or email (do not see email? check your spam)"
                let mailObject = {
                    email: email,
                    subject: "OTP - KashRite",
                    from: "KashRite",
                    message: text
                }
                const sendEmailTOUser = await sendEmail(mailObject)

            }
            let showOTP = req.body.phone === "08157948955" ? ` (${otp})` : "";
            res.status(200).send({
                ...StatusCodes.Success,
                message: "SMS OTP was sent to your " + sentTo + ". " + showOTP,
                otp
            });
        }
    });


})

router.post('/code/verify', async function (req, res, next) {

    if (!req.body.phone || !req.body.code) {
        res.status(400).send({
            ...StatusCodes.MissingPayload,
        })
        return null
    }
    const otp = req.body.code;

    let resp = {
        ...StatusCodes.AuthError,
        errorMessage: "Incorrect One-Time-Passcode"
    };
    let phone = parseInt(req.body.phone);

    connection.query(`SELECT * FROM users WHERE raw_input_phone = ? OR account_id = ? OR phone LIKE ? OR account_id LIKE ?`, [phone, phone, phone, phone], function (error, results, fields) {
        // if (error) throw error;
        // console.log('The solution is: ', results);
        if (error) {
            res.status(500).send({
                ...StatusCodes.ServerError,
                message: "Query error, please retry later"
            });
            return null
        }
        if (results.length <= 0) {
            res.status(404).send({
                ...StatusCodes.NotFound,
                message: "Invalid phone number or phone number not found"
            });
            return null
        }
        let user = results[0]
        let { user_id } = user;
        connection.query(`SELECT * FROM auth_code WHERE user_id=? AND status='0'`, [user_id], async function (error, results, fields) {
            console.log(user_id)
            if (results.length <= 0) {

                res.status(400).send({
                    ...StatusCodes.NotFound,
                    message: "Invalid OTP code or OTP has been used."
                });
                return null
            }
            let otpInstance = results[0];
            let { auth_code, use_count } = otpInstance;
            if (parseInt(use_count) >= 3) {
                res.status(401).send({
                    ...StatusCodes.OTPAccountSuspended
                })
                return null
            }
            if (auth_code === otp) {
                await connection.query(`UPDATE auth_code SET use_count = '0' WHERE user_id = ?`, [user_id]);
                const token = await generateToken();
                await connection.query(`UPDATE users SET token=? WHERE user_id = ?`, [token, user_id]);
                await connection.query(`UPDATE auth_code SET status='1' WHERE user_id=? AND status='0'`, [user_id]);
                user.token = token;
                const today = new Date();
                let mailObject = {
                    email: user.email,
                    from: "KashRite",
                    message: `Your account was logged on ${today}. <br /><b>If this is not you, please check that your email password has not been compromised. Or reply this email to temporily lock login access</b>`,
                    subject: "Login Alert"
                }
                sendEmail(mailObject);

                setTimeout(() => {
                    res.status(200).send({
                        ...StatusCodes.Success,
                        data: user
                    })
                }, 3000)

            } else {
                await connection.query(`UPDATE auth_code SET use_count = use_count + 1 WHERE user_id = ?`, [user_id]);
                res.status(400).send({
                    ...StatusCodes.NotFound,
                    message: "Invalid OTP code or OTP has been used."
                });
                return null
            }
        })
    })
})

router.post("/onboard/phone/:phone", async function (req, res, next) {
    let phone = req.params.phone;
    const { country_code = "+234", email = null } = req.body;
    const userid = await generateID();
    const token = await generateToken();
    console.log(req.body);
    const otp = await otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false
    });
    // console.log(await validator.Email(`${email}`));
    // const isEMail = await validator.Email(`${email}`);
    // if (isEMail.validators.regex.valid === false) {
    //     res.status(401).send({
    //         ...StatusCodes.AuthError,
    //         errorMessage: "Please enter a valid email",
    //         message: "Please enter a valid email"
    //     })
    //     return null
    // }
    let country_code_ = country_code.includes("+") ? country_code : "+" + country_code
    const phoneNumber = validator.phone(`${country_code_}${phone}`);

    if (phoneNumber.isValid === false) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Please enter a valid phone number",
            message: "Please enter a valid phone number"
        })
        return null
    }
    const phoneStandard = phoneNumber.phoneNumber;
    connection.query(`SELECT * FROM users WHERE phone= ? OR email= ?`, [phoneStandard, email], async function (error, results, fields) {
        if (error !== null) {
            console.log(error)
            res.status(500).send({
                ...StatusCodes.ServerError,
                errorMessage: "Ouch! our bad, please retry",
                message: "Ouch! our bad, please retry"
            })
            return null
        }
        if (results.length > 0) {
            let user = results[0];
            let db_user_id = user.user_id
            console.log("USER", user)
            if (user.first_name === null || user.last_name === null) {
                await connection.query(`UPDATE auth_code SET status='1' WHERE user_id= ? AND status='0'`, [db_user_id]);
                await connection.query(`INSERT INTO auth_code (user_id, auth_code) VALUES (?, ?)`, [db_user_id, otp]);
                const text = `Use ${otp} to verify your phone. Do not share this with anyone.`;
                if (phoneNumber.countryIso2 === "NG") {
                    await sendSMS(phoneStandard, text);
                }
                let mailObject = {
                    email: email,
                    subject: "Verify Account",
                    from: "KashRite",
                    message: text
                }
                await sendEmail(mailObject);
                res.status(200).send({
                    ...StatusCodes.Success,
                    success_message: "OTP sent to phone",
                    isContinue: true,
                    otp
                })
                return null
            } else {
                res.status(400).send({
                    ...StatusCodes.AuthError,
                    errorMessage: "User with that phone or email already exist",
                    message: "User with that phone or email already exist"
                })
                return null
            }
            return null
        }
        const isDiaspora = country_code === "234" || country_code === "+234" ? 0 : 1;
        await connection.query(`INSERT INTO users (email, phone, raw_input_phone, account_id, user_id, token, isDiaspora) VALUES (?, ?, ?, ?, ?, ?, ?)`, [email, phoneStandard, phone, parseInt(req.params.phone), userid, token, isDiaspora]);
        await connection.query(`INSERT INTO wallets (user_id) VALUES (?)`, [userid]);
        await connection.query(`INSERT INTO kyc (user_id) VALUES (?)`, [userid]);
        await connection.query(`UPDATE auth_code SET status='1' WHERE user_id=? AND status='0'`, [userid]);
        await connection.query(`INSERT INTO auth_code (user_id, auth_code) VALUES (?, ?)`, [userid, otp]);
        const text = `KashRite: Use ${otp} to verify your phone. Do not share this with anyone.`;
        if (phoneNumber.countryIso2 === "NG") {
            await sendSMSTermii(phoneStandard, text);
        }
        let mailObject = {
            email: email,
            subject: "Verify Account",
            from: "KashRite",
            message: text
        }
        await sendEmail(mailObject);
        console.log(otp);
        res.status(200).send({
            ...StatusCodes.Success,
            success_message: "OTP sent to phone",
            otp,
            isContinue: false
        })
    })
})

router.post("/onboard/set/profile", async function (req, res, next) {
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
    if (isValid) {
        if (!req.body.first_name || !req.body.last_name) {
            res.status(400).send({
                ...StatusCodes.MissingPayload
            })
            return null
        }
        const checkFirstName = await validator.isInputValid(req.body.first_name.replace(" ", ""));

        if (!checkFirstName) {
            res.status(400).send({
                ...StatusCodes.NotProccessed,
                errorMessage: "Invalid data input. Please check there is no special character in first name"
            });
            return null
        }

        // const checkLastName = await validator.isInputValid(req.body.last_name.replace(" ", ""));

        // if(!checkLastName){
        //     res.status(400).send({
        //         ...StatusCodes.NotProccessed,
        //         errorMessage: "Invalid data input. Please check there is no special character in last name"
        //     });
        //     return nullprofile
        // }

        let refer_by = "N/A";
        if (!req.body.referral) {

        } else {
            const allReferrals = await connection.query(`SELECT * FROM users WHERE refer_by = ?`, [req.body.referral]);
            if (allReferrals.length < 5) {
                refer_by = req.body.referral
            }
        }

        await connection.query(`UPDATE users SET first_name=?, last_name=?, gender=?, refer_by=? WHERE token=?`, [req.body.first_name, req.body.last_name, req.body.gender, refer_by, token]);
        await connection.query(`SELECT * FROM users WHERE token=?`, [token], function (error, results, fields) {
            res.status(200).send({
                ...StatusCodes.Success,
                data: results[0]
            })
        })
    } else {
        res.status(401).send({
            ...StatusCodes.AuthError
        });
        return null
    }
})

router.post("/resend_otp/:phone", async function (req, res, next) {
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
    connection.query(`SELECT * FROM users WHERE phone LIKE ? OR raw_input_phone LIKE ? OR account_id=?`, [phone, phone, phone], async function (error, results, fields) {
        if (results.length > 0) {
            const user = results[0];
            const userid = user.user_id;
            const { isDiaspora, email } = user;
            const phone_number = user.phone;
            await connection.query(`UPDATE auth_code SET status='1' WHERE user_id=? AND status='0'`, [userid]);
            await connection.query(`INSERT INTO auth_code (user_id, auth_code) VALUES (?, ?)`, [userid, otp]);
            const text = `KashRite: Use ${otp} to verify your phone. Do not share this with anyone.`;
            const smstext = `KashRite: Use ${otp} to verify your phone. Do not share this with anyone.`;
            let sentTo;
            if (isDiaspora == 0) {
                await sendSMSTermii(phone_number, smstext);
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
module.exports = router