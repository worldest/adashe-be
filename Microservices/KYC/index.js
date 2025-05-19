const express = require('express');
const router = express.Router();
const StatusCodes = require('../../StatusCodes/index');




const fetch = require("node-fetch");

const connection = require("../../DB/dbConnect");
const generateID = require('../../Tokenization/GenerateID');
const HeaderToken = require('../../Tokenization/HeaderToken');
const { VerifyToken, VerifyTokenOnly } = require('../../Tokenization/Verify');
router.use(express.json());
const fs = require("fs");
const { Encrypt } = require('../../Tokenization/Encryption');
const base64 = "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"
const now = new Date();
const d = now.getDate();
const m = now.getMonth() + 1;
const y = now.getFullYear();
const h = now.getHours();
const min = now.getMinutes();
const s = now.getSeconds();
const today = `${y}-${m}-${d}-${h}-${min}-${s}`;

router.get("/get/:userid", async function (req, res, next) {
    const { userid } = req.params;

    let Bearer = req.header("Authorization");
    if (!Bearer) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Empty Authorization bearer token"
        })
        return null
    }
    const token = await HeaderToken(Bearer);
    const isValid = await VerifyToken(token, userid);
    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Invalid Authorization token"
        })
        return null;
    }
    const checkKYC = await connection.query(`SELECT * FROM kyc WHERE user_id=?`, [userid]);
    if (checkKYC.length > 0) {
        let kyc = checkKYC[0];
        let resp;
        if (kyc.level == 1) {
            resp = {
                kyc: {
                    level: 1,
                    tier: "Tier 1",
                    limit: "Restricted"
                },
                limit: {
                    dailyLimit: Number(50000),
                    accountLimit: Number(300000)
                }
            }
        } else if (kyc.level == 2) {
            resp = {
                kyc: {
                    level: 2,
                    tier: "Tier 2",
                    limit: "Restricted"
                },
                limit: {
                    dailyLimit: Number(500000),
                    accountLimit: Number(2000000)
                }
            }
        } else if (kyc.level == 0) {
            resp = {
                kyc: {
                    level: 0,
                    tier: "Newbie",
                    limit: "Restricted"
                },
                limit: {
                    dailyLimit: Number(0),
                    accountLimit: Number(0)
                }
            }
        } else {
            resp = {
                kyc: {
                    level: 3,
                    tier: "Tier 3",
                    limit: "Unrestricted"
                },
                limit: {
                    dailyLimit: Number(5000000),
                    accountLimit: Number(1000000000)
                }
            }
        }
        res.status(200).send({
            ...StatusCodes.Success,
            ...resp
        })
        return null
    } else {
        res.status(200).send({
            ...StatusCodes.Success,
            kyc: {
                level: 0,
                tier: "Tier 0",
                limit: "Restricted"
            },
            limit: {
                dailyLimit: Number(50000),
                accountLimit: Number(300000)
            }
        })
    }
})

router.post("/lookup/:userid", async function (req, res, next) {
    const { userid } = req.params;

    let Bearer = req.header("Authorization");
    if (!Bearer) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Empty Authorization bearer token"
        })
        return null
    }
    const token = await HeaderToken(Bearer);
    const isValid = await VerifyToken(token, userid);
    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Invalid Authorization token"
        })
        return null;
    }
    if (!req.body.bvn) {
        res.status(400).send({
            ...StatusCodes.NotProccessed,
            errorMessage: "BVN is required"
        })
        return null;
    }
    fetch("https://api.verified.africa/sfx-verify/v3/id-service/", {
        headers: {
            "ApiKey": "Us2EcXcPsTkU2SmWvb8J",
            "UserId": "1679829195714"
        },
        method: "POST",
        body: JSON.stringify({
            "verificationType": "BVN-FULL-DETAILS-IGREE",
            "searchParameter": req.body.bvn
        })
    })
        .then(responses => responses.json())
        .then(data => {
            res.send(data)
        })
})

router.post("/upgrade/:userid", async function (req, res, next) {
    const { userid } = req.params;
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
    const isValid = await VerifyToken(token, userid);
    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Invalid Authorization token"
        })
        return null;
    }
    const checkKYC = await connection.query(`SELECT * FROM kyc WHERE user_id=?`, [userid]);

    console.log("KYC", checkKYC)
    let bvn_encrypt = await Encrypt(req.body.bvn);
    const checkKYCExist = await connection.query(`SELECT * FROM kyc_details WHERE bvn= ? `, [bvn_encrypt]);
    if (checkKYCExist.length > 0) {
        res.status(200).send({
            ...StatusCodes.Success,
            message: "BVN is already linked to another account"
        })
        return null
    }
    let level;
    if (checkKYC.length > 0) {
        level = checkKYC[0].level;
    } else {
        level = 0;
    }
    if (level == 0) {
        if (!req.body.bvn) {
            res.status(400).send({
                ...StatusCodes.MissingPayload,
                errorMessage: "BVN is missing"
            })
            return null;
        }

        if (req.body.bvn.toString().length < 11) {
            res.status(400).send({
                ...StatusCodes.MissingPayload,
                errorMessage: "Invalid BVN"
            })
            return null;
        }
        const txRef = await generateID();
        let payload_ = {
            "email": queryUser[0].email,
            "tx_ref": txRef,
            "phonenumber": queryUser[0].phone,
            "is_permanent": true,
            "firstname": queryUser[0].first_name,
            "lastname": queryUser[0].last_name,
            "narration": "Wallet Top-Up",
            "bvn": req.body.bvn
        }

        let preferedName = `${queryUser[0].first_name} ${queryUser[0].last_name}`;
        let user_phone = queryUser[0].isDiaspora == 1 ? queryUser[0].phone : "0" + queryUser[0].account_id

        // const getRovaToken = await getToken(process.env.ROVAClientSecret, process.env.ROVAClientID);
        const { email, first_name, last_name, phone } = queryUser[0]
        // const createVAAccount = await createStaticVirtualAccount(email, first_name, last_name, "07067159948", req.body.bvn, getRovaToken);

        // if (createVAAccount.status !== "SUCCESS") {
        //     res.status(400).send({
        //         ...StatusCodes.NotProccessed,
        //         errorMessage: "Could not upgrade account. Please check your BVN"
        //     })
        //     return null
        // }

        // await connection.query("INSERT INTO virtual_accounts (user_id, account_name, account_number, bank_name) VALUES (?, ?, ?, ?)", [userid, createVAAccount.virtualAccountName, createVAAccount.virtualAccountNumber, "FCMB MFB"]);



        await connection.query(`UPDATE kyc SET level = '1' WHERE user_id = ?`, [userid]);
        await connection.query(`UPDATE wallets SET isOnDND = '0' WHERE user_id = ?`, [userid]);
        await connection.query(`INSERT INTO kyc_details (bvn, user_id) VALUES (?, ?)`, [bvn_encrypt, userid]);





        res.status(200).send({
            ...StatusCodes.Success,
            message: "Account upgraded successfully to Tier 1"
        })

    } else if (level == 1) {
        res.status(200).send({
            ...StatusCodes.Success,
            message: "Tier 1 Verication level already done"
        })
    } else if (level == 2) {
        res.status(200).send({
            ...StatusCodes.Success,
            message: "You account has been verified successfully"
        })
    } else {
        res.status(400).send({
            ...StatusCodes.ClientError,
            errorMessage: "Account can not be upgraded. Thanks!"
        })
    }
})

router.post("/upgrade/tier_three/:userid", async function (req, res, next) {
    const { userid } = req.params;
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
    const isValid = await VerifyToken(token, userid);
    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Invalid Authorization token"
        })
        return null;
    }
    if (!req.body.means_of_id_link) {
        res.status(400).send({
            ...StatusCodes.MissingPayload,
            errorMessage: "All fields are required"
        })
        return null
    }
    const { means_of_id_link, address, dob, expiry, id_number } = req.body;
    if (!means_of_id_link || !address || !dob || !expiry || !id_number) {
        res.status(400).send({
            ...StatusCodes.MissingPayload,
            errorMessage: "All fields are required"
        })
        return null
    }
    const checkKYC = await connection.query(`SELECT * FROM kyc WHERE user_id=?`, [userid]);
    let level;
    if (checkKYC.length > 0) {
        level = checkKYC[0].level;
    } else {
        level = 0;
    }
    if (level == 0) {
        const checkDetails = await connection.query(`SELECT * FROM kyc_details WHERE user_id=?`, [userid]);
        let status;
        if (checkDetails.length == 0) {
            await connection.query(`INSERT INTO kyc_details (bvn, user_id) VALUES (?, ?)`, ["N/A", userid]);
            status = 0;
        } else {
            status = checkDetails[0].status;
        }
        if (status == 1) {
            res.status(400).send({
                ...StatusCodes.ClientError,
                errorMessage: "Upgrade request is still under review, please await our update thanks."
            })
            return null
        }
        // await connection.query("UPDATE kyc SET level = '2' WHERE user_id = ?", [userid])
        await connection.query(`UPDATE kyc_details SET id_number = ?, address = ?, means_of_id_link=?, expiry = ?, dob = ?, status='1' WHERE user_id=?`, [id_number, address, means_of_id_link, expiry, dob, userid]);
        res.status(200).send({
            ...StatusCodes.Success,
            message: "Upgrade request sent for approval, please allow 24-48 workings hours."
        })

    } else if (level == 1) {
        const checkDetails = await connection.query(`SELECT * FROM kyc_details WHERE user_id=?`, [userid]);
        const { status } = checkDetails[0].status;
        if (status == 1) {
            res.status(400).send({
                ...StatusCodes.ClientError,
                errorMessage: "Upgrade request is still under review, please await our update thanks."
            })
            return null
        }
        await connection.query(`UPDATE kyc_details SET id_number = ?, address = ?, means_of_id_link=?, expiry = ?, dob = ?, status='1' WHERE user_id=?`, [id_number, address, means_of_id_link, expiry, dob, userid]);
        res.status(200).send({
            ...StatusCodes.Success,
            message: "Upgrade request sent for approval, please allow 24-48 workings hours."
        })
    } else if (level == 2) {
        res.status(400).send({
            ...StatusCodes.ClientError,
            errorMessage: "You are already a Tier 3 user. Please upgrade to Business account"
        })
    } else {
        res.status(400).send({
            ...StatusCodes.QueryError,
            errorMessage: "Please upgrade to Tier 2 before Tier 3"
        })
    }
})

router.post("/upgrade/tier_four/:userid", async function (req, res, next) {
    const { userid } = req.params;
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
    const isValid = await VerifyToken(token, userid);
    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Invalid Authorization token"
        })
        return null;
    }
    if (!req.body.means_of_id_link) {
        res.status(400).send({
            ...StatusCodes.MissingPayload,
            errorMessage: "All fields are required"
        })
        return null
    }
    const { means_of_id_link } = req.body;

    const checkKYC = await connection.query(`SELECT * FROM kyc WHERE user_id=?`, [userid]);
    let level;
    if (checkKYC.length > 0) {
        level = checkKYC[0].level;
    } else {
        level = 0;
    }
    if (level == 0) {
        res.status(400).send({
            ...StatusCodes.ClientError,
            errorMessage: "Please upgrade to Tier 2 before Tier 3"
        })

    } else if (level == 1) {

        res.status(400).send({
            ...StatusCodes.NotProccessed,
            message: "Please upgrade to 2 before upgrading to Tier 3"
        })
    } else if (level == 2) {
        const checkDetails = await connection.query(`SELECT * FROM kyc_details WHERE user_id=?`, [userid]);
        const { status } = checkDetails[0].status;
        if (status == 1) {
            res.status(400).send({
                ...StatusCodes.ClientError,
                errorMessage: "You still have a pending upgrade in review, please await our update thanks."
            })
            return null
        }
        await connection.query(`UPDATE kyc_details SET proof_of_address='${means_of_id_link}', status='3' WHERE user_id=?`, [userid]);
        res.status(200).send({
            ...StatusCodes.Success,
            message: "Your request to upgrade to Tier 3 has been submitted. You should get a response within 24-48 hours"
        })
    } else {
        res.status(400).send({
            ...StatusCodes.QueryError,
            errorMessage: "An error occurred. Please contact help center"
        })
    }
})

router.get("/means_of_id", async function (req, res, next) {
    const { userid } = req.params;

    let Bearer = req.header("Authorization");
    if (!Bearer) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Empty Authorization bearer token"
        })
        return null
    }
    const token = await HeaderToken(Bearer);
    const isValid = await VerifyTokenOnly(token);
    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Invalid Authorization token"
        })
        return null;
    }
    const Means_of_id = await connection.query(`SELECT * FROM means_of_id_type`);
    res.status(200).send({
        ...StatusCodes.Success,
        data: Means_of_id
    })
})



module.exports = router