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


router.post("/create", async function (req, res, next) {
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
    const { userid, group_name, group_description = "N/A", payment_interval = "daily", start_date } = req.body;
    if (!userid || !group_name || !start_date) {
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
    var date = new Date(start_date);

    // add a day
    let day;
    if (payment_interval === "daily") {
        day = 1
    } else if (payment_interval === "weekly") {
        day = 7
    } else if (payment_interval === "monthly") {
        day = 30
    } else if (payment_interval === "biannual") {
        day = 180
    }
    date.setDate(date.getDate() + day);
    let d = date.getDate();
    let m = date.getMonth() + 1;
    let y = date.getFullYear();
    let nextPayment = `${y}-${m}-${d}`
    const insert = await connection.query("INSERT INTO groups (group_name, group_desc, host, status, payment_interval, start_date, next_payment) VALUES (?, ?, ?, ?, ?, ?, ?)", [group_name, group_description, userid, '1', payment_interval, start_date, nextPayment]);
    console.log(insert);
    await connection.query("INSERT INTO group_members (host, user_id, group_id, status) VALUES (?, ?, ?, ?)", [userid, userid, insert.insertId, '1']);
    res.status(200).send({
        ...StatusCodes.Success,
        message: "Group Created Successfully"
    })
})

router.get("/fetch/:id", async function (req, res, next) {
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
    const getGroup = await connection.query("SELECT * FROM groups WHERE id = ?", [id])
    if (getGroup.length <= 0) {
        res.status(404).send({
            ...StatusCodes.NotFound,
            payload: {},
            errorMessage: "Group not found"
        })
        return null
    }
    res.status(200).send({
        ...StatusCodes.Success,
        payload: getGroup[0]
    })



})

router.get("/get/:id", async function (req, res, next) {
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
    const getGroup = await connection.query("SELECT * FROM groups WHERE host = ?", [id])
    if (getGroup.length <= 0) {
        res.status(404).send({
            ...StatusCodes.NotFound,
            payload: {},
            errorMessage: "Group not found"
        })
        return null
    }
    res.status(200).send({
        ...StatusCodes.Success,
        payload: getGroup
    })



})

router.get("/member/:id", async function (req, res, next) {
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
    const getGroup = await connection.query("SELECT * FROM group_members JOIN groups ON groups.id = group_members.group_id WHERE user_id = ?", [id])

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
    const getGroup = await connection.query("SELECT * FROM group_txn WHERE group_id = ?", [id])

    res.status(200).send({
        ...StatusCodes.Success,
        payload: getGroup
    })



})

router.delete("/delete", async function (req, res, next) {
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
    const { userid, group_id } = req.body;
    if (!userid || !group_id) {
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
    } const getGroup = await connection.query("SELECT * FROM groups WHERE id = ? AND host = ?", [group_id, userid])
    if (getGroup.length <= 0) {
        res.status(400).send({
            ...StatusCodes.NotProccessed,
            errorMessage: "Group does not exist or you do not have permmission to perform this task"
        })
        return null
    }
    const getGroupMembers = await connection.query("SELECT * FROM group_members WHERE group_id = ?", [group_id])
    if (getGroupMembers.length >= 0) {
        res.status(400).send({
            ...StatusCodes.NotProccessed,
            errorMessage: "You cannot delete group with pending/active user(s)"
        })
        return null
    }
    const getGroupTransactions = await connection.query("SELECT * FROM group_txn WHERE group_id = ?", [group_id])
    if (getGroupTransactions.length >= 0) {
        res.status(400).send({
            ...StatusCodes.NotProccessed,
            errorMessage: "You cannot delete group with transaction history"
        })
        return null
    }
    await connection.query("DELETE FROM groups WHERE id = ?", [group_id]);
    res.status(200).send({
        ...StatusCodes.Success,
        message: "Group Created Successfully"
    })
})

router.patch("/edit", async function (req, res, next) {
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
    const { userid, group_name, group_description, group_id } = req.body;
    if (!userid || !group_name || !group_id) {
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
    const getGroup = await connection.query("SELECT * FROM groups WHERE id = ?", [group_id])
    if (getGroup.length <= 0) {
        res.status(400).send({
            ...StatusCodes.NotProccessed,
            errorMessage: "Group does not exist"
        })
        return null
    }
    await connection.query("UPDATE groups SET group_name = ?, group_desc = ? WHERE host = ? AND id = ?", [group_name, group_description, userid, group_id]);
    res.status(200).send({
        ...StatusCodes.Success,
        message: "Group Edited Successfully"
    })
})

router.post("/invite", async function (req, res, next) {
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
    const { userid, invited_userid, group_id } = req.body;
    if (!userid || !invited_userid || !group_id) {
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

    const getInvitedUser = await connection.query("SELECT * FROM users WHERE user_id = ?", [invited_userid])
    if (getInvitedUser.length <= 0) {
        res.status(400).send({
            ...StatusCodes.NotProccessed,
            errorMessage: "Invited user not found."
        })
        return null
    }

    const getGroup = await connection.query("SELECT * FROM groups WHERE id = ?", [group_id])
    if (getGroup.length <= 0) {
        res.status(400).send({
            ...StatusCodes.NotProccessed,
            errorMessage: "Group does not exist"
        })
        return null
    }
    await connection.query("INSERT INTO group_members (host, user_id, group_id) VALUES (?, ?, ?)", [userid, invited_userid, group_id]);
    res.status(200).send({
        ...StatusCodes.Success,
        message: `${getInvitedUser[0].first_name} has been invited successfully`
    })
})

router.delete("/user/delete", async function (req, res, next) {
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
    const { userid, invited_userid, group_id } = req.body;
    if (!userid || !invited_userid || !group_id) {
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

    const getInvitedUser = await connection.query("SELECT * FROM users WHERE user_id = ?", [invited_userid])
    if (getInvitedUser.length <= 0) {
        res.status(400).send({
            ...StatusCodes.NotProccessed,
            errorMessage: "Invited user not found."
        })
        return null
    }

    const getGroup = await connection.query("SELECT * FROM groups WHERE id = ? AND host = ?", [group_id, userid])
    if (getGroup.length <= 0) {
        res.status(400).send({
            ...StatusCodes.NotProccessed,
            errorMessage: "Group does not exist or you do not have permmission to perform this task"
        })
        return null
    }
    await connection.query("DELETE FROM group_members WHERE user_id = ? AND group_id = ?", [invited_userid, group_id]);
    res.status(200).send({
        ...StatusCodes.Success,
        message: `${getInvitedUser[0].first_name} has been removed successfully`
    })
})

module.exports = router