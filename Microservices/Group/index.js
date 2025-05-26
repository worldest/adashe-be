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
    // console.log("TOKEN", token)
    let isValid = await VerifyToken(token)
    // console.log("PACKET", isValid)
    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Authentication error"
        });
        return null
    }
    const { userid, group_name, group_description = "N/A", payment_interval = "daily", start_date = "Not set", amount = 0.00 } = req.body;
    if (!userid || !group_name) {
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
    const insert = await connection.query("INSERT INTO groups (group_name, group_desc, amount, host, group_status, payment_interval, start_date, next_payment) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [group_name, group_description, amount, userid, '1', payment_interval, start_date, nextPayment]);
    // console.log(insert);
    await connection.query("INSERT INTO group_members (host, user_id, group_id, status) VALUES (?, ?, ?, ?)", [userid, userid, insert.insertId, '1']);
    res.status(200).send({
        ...StatusCodes.Success,
        message: "Group Created Successfully"
    })
})

router.post("/startGroup", async function (req, res, next) {
    if (!req.header("Authorization")) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Token not present"
        });
        return null
    }
    let Bearer = req.header("Authorization");
    const token = await HeaderToken(Bearer);
    // console.log("TOKEN", token)
    let isValid = await VerifyToken(token)
    // console.log("PACKET", isValid)
    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Authentication error"
        });
        return null
    }
    const { userid, group_id, start_date } = req.body;
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
    }
    const getGroup = await connection.query("SELECT * FROM groups WHERE id = ?", [group_id])
    if (getGroup.length <= 0) {
        res.status(400).send({
            ...StatusCodes.NotProccessed,
            errorMessage: "Group not found."
        })
        return null
    }
    const getGroup_ = await connection.query("SELECT * FROM group_members WHERE group_id = ? AND status = '0'", [group_id])
    if (getGroup_.length > 0) {
        res.status(400).send({
            ...StatusCodes.NotProccessed,
            errorMessage: "All members must accept invitation to start group."
        })
        return null
    }
    var date = new Date(start_date);

    // add a day
    const { payment_interval, group_round } = getGroup[0]
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
    await connection.query("UPDATE groups SET group_status='running', start_date = ?, next_payment = ? WHERE id=?", [start_date, nextPayment, group_id]);
    const getAUser = await connection.query("SELECT * FROM group_members WHERE group_id = ? AND payout_status = ? ORDER BY RAND() LIMIT 1", [group_id, group_round])
    await connection.query("UPDATE group_members SET current_round = '0' WHERE group_id = ?", [group_id])
    await connection.query("UPDATE group_members SET payout_status = '1', current_round = '1' WHERE id = ?", [getAUser[0].id])
    res.status(200).send({
        ...StatusCodes.Success,
        message: "Success"
    })
})

router.post("/deleteGroup", async function (req, res, next) {
    if (!req.header("Authorization")) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Token not present"
        });
        return null
    }
    let Bearer = req.header("Authorization");
    const token = await HeaderToken(Bearer);
    // console.log("TOKEN", token)
    let isValid = await VerifyToken(token)
    // console.log("PACKET", isValid)
    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Authentication error"
        });
        return null
    }
    const { userid, group_id, start_date } = req.body;
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
    }
    const getGroup = await connection.query("SELECT * FROM groups WHERE id = ? AND host = ?", [group_id, userid])
    if (getGroup.length <= 0) {
        res.status(400).send({
            ...StatusCodes.NotProccessed,
            errorMessage: "Group not found or you do not have permission to perform this operation."
        })
        return null
    }

    if (getGroup[0].group_status != 1 && getGroup[0].group_status !== "1") {
        res.status(400).send({
            ...StatusCodes.NotProccessed,
            errorMessage: "Only group that has not started can be deleted."
        })
        return null
    }

    await connection.query("DELETE FROM groups WHERE id = ?", [group_id])


    res.status(200).send({
        ...StatusCodes.Success,
        message: "Group deleted successfully"
    })
})

router.post("/rearrange/:id", async function (req, res, next) {
    if (!req.header("Authorization")) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Token not present"
        });
        return null
    }
    let Bearer = req.header("Authorization");
    const token = await HeaderToken(Bearer);
    // console.log("TOKEN", token)
    let isValid = await VerifyToken(token)

    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Authentication error"
        });
        return null
    }
    const { group_id, data = [], userid } = req.body;
    if (!data || !group_id || data.length <= 0 || !userid) {
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
            errorMessage: "Group not found."
        })
        return null
    }
    // await connection.query("DELETE FROM group_members WHERE group_id = ?", [group_id]);
    const getFirst = await connection.query("SELECT * FROM group_members WHERE group_id=? ORDER BY id ASC", [group_id])
    const firstID = getFirst[0].id
    data.map(async (o, i) => {
        await connection.query("UPDATE group_members SET user_id = ?, status = ?, payout_status = ? WHERE id = ?", [o.user_id, o.status, o.payout_status, firstID + i]);
    })
    res.status(200).send({
        ...StatusCodes.Success,
        message: "Success"
    })
})

router.post("/sendMessage", async function (req, res, next) {
    if (!req.header("Authorization")) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Token not present"
        });
        return null
    }
    let Bearer = req.header("Authorization");
    const token = await HeaderToken(Bearer);
    // console.log("TOKEN", token)
    let isValid = await VerifyToken(token)
    // console.log("PACKET", isValid)
    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Authentication error"
        });
        return null
    }
    const { userid, group_id, message } = req.body;
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
    }
    const getGroup = await connection.query("SELECT * FROM groups WHERE id = ?", [group_id])
    if (getGroup.length <= 0) {
        res.status(400).send({
            ...StatusCodes.NotProccessed,
            errorMessage: "Group not found."
        })
        return null
    }

    await connection.query("INSERT INTO group_message (group_id, user_id, username, message) VALUES (?, ?, ?, ?)", [group_id, userid, getUser[0].first_name + " " + getUser[0].last_name, message]);

    res.status(200).send({
        ...StatusCodes.Success,
        message: "Success"
    })
})

router.post("/processPayout", async function (req, res, next) {
    if (!req.header("Authorization")) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Token not present"
        });
        return null
    }
    let Bearer = req.header("Authorization");
    const token = await HeaderToken(Bearer);
    // console.log("TOKEN", token)
    let isValid = await VerifyToken(token)
    // console.log("PACKET", isValid)
    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Authentication error"
        });
        return null
    }
    const { userid, group_id, amount, receipt, receiver_id } = req.body;
    if (!userid || !group_id || !amount || !receipt || !receiver_id) {
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
            errorMessage: "Group not found."
        })
        return null
    }
    const { group_round } = getGroup[0]
    await connection.query("INSERT INTO group_payouts (host, user_id, group_id, receipt, amount) VALUES (?, ?, ?, ?, ?)", [userid, receiver_id, group_id, receipt, amount])
    let getAUser = await connection.query("SELECT * FROM group_members WHERE group_id = ? AND payout_status = ? ORDER BY id ASC LIMIT 1", [group_id, '1']);

    if (getAUser.length > 0) {
        await connection.query("UPDATE group_members SET payout_status = ?", [0])
        const getNext = await connection.query("SELECT * FROM group_members WHERE id > ? AND group_id = ? ORDER BY id ASC LIMIT 1", [getAUser[0].id, group_id]);
        console.log("NEXT", getNext[0])
        if (getNext.length > 0) {
            const update = await connection.query("UPDATE group_members SET payout_status = ? WHERE id = ?", [1, getNext[0].id])
            console.log("UPDATING NEXT")
        } else {
            const getFirst = await connection.query("SELECT * FROM group_members WHERE group_id = ? ORDER BY id ASC LIMIT 1", [group_id]);
            const update = await connection.query("UPDATE group_members SET payout_status = ? WHERE id = ?", [1, getFirst[0].id])
            console.log("UPDATING FIRST", getFirst[0].id)
        }
    } else {
        await connection.query(`
            UPDATE group_members
SET payout_status = '1'
WHERE id = (
  SELECT id FROM (
    SELECT id
    FROM group_members
    WHERE group_id = ?
    ORDER BY id
    LIMIT 1 OFFSET 1
  ) AS subquery
);
        `, [group_id]);
    }

    res.status(200).send({
        ...StatusCodes.Success,
        message: "Success"
    })
})

router.post("/acceptPayout", async function (req, res, next) {
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
    const { userid, payout_id } = req.body;
    if (!userid || !payout_id) {
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

    await connection.query("UPDATE group_payouts SET status = '1' WHERE id = ?", [payout_id])


    res.status(200).send({
        ...StatusCodes.Success,
        message: "Success"
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
    // console.log("TOKEN", token)
    let isValid = await VerifyToken(token)
    // console.log("PACKET", isValid)
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
    const getTxnTotal = await connection.query(`SELECT SUM(amount) AS total_amount
FROM group_txn
WHERE MONTH(created_at) = MONTH(CURRENT_DATE())
  AND YEAR(created_at) = YEAR(CURRENT_DATE())
 AND group_id = ? AND status = '1'`, [id])
    console.log("COUNT", getTxnTotal)
    const getMembers = await connection.query(`
  SELECT 
    group_members.*, 
    users.user_id, 
    users.first_name, 
    users.last_name 
  FROM group_members 
  JOIN users 
    ON group_members.user_id = users.user_id 
  WHERE group_members.group_id = ? 
  ORDER BY 
    CASE 
      WHEN group_members.payout_status = 1 THEN 0 
      ELSE 1 
    END, 
    group_members.id ASC
`, [id]);

    res.status(200).send({
        ...StatusCodes.Success,
        payload: getGroup[0],
        members: getMembers,
        current_payout: getTxnTotal
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
    // console.log("TOKEN", token)
    let isValid = await VerifyToken(token)
    // console.log("PACKET", isValid)
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

router.get("/chats/:id", async function (req, res, next) {
    if (!req.header("Authorization")) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Token not present"
        });
        return null
    }
    let Bearer = req.header("Authorization");
    const token = await HeaderToken(Bearer);
    // console.log("TOKEN", token)
    let isValid = await VerifyToken(token)
    // console.log("PACKET", isValid)
    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Authentication error"
        });
        return null
    }
    const { id } = req.params;
    const getGroup = await connection.query("SELECT * FROM group_message WHERE group_id = ?", [id])
    if (getGroup.length <= 0) {
        res.status(200).send({
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

router.patch("/accept/:id/:userid", async function (req, res, next) {
    if (!req.header("Authorization")) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Token not present"
        });
        return null
    }
    let Bearer = req.header("Authorization");
    const token = await HeaderToken(Bearer);
    // console.log("TOKEN", token)
    let isValid = await VerifyToken(token)
    // console.log("PACKET", isValid)
    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Authentication error"
        });
        return null
    }
    const { id, userid } = req.params;
    const getGroup = await connection.query("UPDATE group_members SET status = '1' WHERE group_id = ? AND user_id = ?", [id, userid])

    res.status(200).send({
        ...StatusCodes.Success,
        payload: getGroup
    })



})

router.patch("/decline/:id/:userid", async function (req, res, next) {
    if (!req.header("Authorization")) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Token not present"
        });
        return null
    }
    let Bearer = req.header("Authorization");
    const token = await HeaderToken(Bearer);
    // console.log("TOKEN", token)
    let isValid = await VerifyToken(token)
    // console.log("PACKET", isValid)
    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Authentication error"
        });
        return null
    }
    const { id, userid } = req.params;
    const getGroup = await connection.query("DELETE FROM group_members WHERE group_id = ? AND user_id = ?", [id, userid])

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
    // console.log("TOKEN", token)
    let isValid = await VerifyToken(token)
    // console.log("PACKET", isValid)
    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Authentication error"
        });
        return null
    }
    const { id } = req.params;
    const getGroup = await connection.query("SELECT * FROM group_members JOIN groups ON groups.id = group_members.group_id WHERE user_id = ? AND group_members.status = '1'", [id])

    res.status(200).send({
        ...StatusCodes.Success,
        payload: getGroup
    })



})

router.get("/member/pending/:id", async function (req, res, next) {
    if (!req.header("Authorization")) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Token not present"
        });
        return null
    }
    let Bearer = req.header("Authorization");
    const token = await HeaderToken(Bearer);
    // console.log("TOKEN", token)
    let isValid = await VerifyToken(token)
    // console.log("PACKET", isValid)
    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Authentication error"
        });
        return null
    }
    const { id } = req.params;
    const getGroup = await connection.query("SELECT group_members.*, groups.*, users.user_id, users.first_name, users.last_name FROM group_members JOIN groups ON groups.id = group_members.group_id JOIN users ON users.user_id = group_members.host WHERE group_members.user_id = ? AND group_members.status = '0'", [id])

    res.status(200).send({
        ...StatusCodes.Success,
        payload: getGroup
    })



})

router.get("/member/all/:id", async function (req, res, next) {
    if (!req.header("Authorization")) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Token not present"
        });
        return;
    }

    let Bearer = req.header("Authorization");
    const token = await HeaderToken(Bearer);
    let isValid = await VerifyToken(token);

    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Authentication error"
        });
        return;
    }

    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;  // Default to page 1 if not provided
    const pageSize = parseInt(req.query.pageSize) || 15;  // Default page size to 10 if not provided
    const offset = (page - 1) * pageSize;  // Calculate the offset
    const query = req.query.query

    try {
        // Get total count of all groups (without pagination)
        const [totalCountResult] = await connection.query("SELECT COUNT(*) as totalCount FROM groups WHERE group_status != 'running'");

        const totalCount = totalCountResult.totalCount;

        // Fetch paginated results
        const getGroup = await connection.query(
            `SELECT * FROM groups WHERE group_status != 'running' AND group_name LIKE '%${query}%' LIMIT ? OFFSET ?`,
            [pageSize, offset]
        );

        res.status(200).send({
            ...StatusCodes.Success,
            payload: getGroup,
            pagination: {
                currentPage: page,
                pageSize: pageSize,
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / pageSize)
            }
        });

    } catch (error) {
        console.log(error)
        res.status(500).send({
            ...StatusCodes.ServerError,
            errorMessage: "An error occurred while fetching group data",
            error: error.message
        });
    }
});

router.post("/member/request/:userid/:id", async function (req, res, next) {
    if (!req.header("Authorization")) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Token not present"
        });
        return;
    }

    let Bearer = req.header("Authorization");
    const token = await HeaderToken(Bearer);
    let isValid = await VerifyToken(token);

    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Authentication error"
        });
        return;
    }

    const { id, userid } = req.params;

    try {
        // Get total count of all groups (without pagination)
        const groupExist = await connection.query("SELECT * FROM groups WHERE id = ?", [id]);
        const getUser = await connection.query("SELECT * FROM users WHERE user_id = ?", [userid])
        if (groupExist.length <= 0) {
            res.status(400).send({
                ...StatusCodes.NotProccessed,
                errorMessage: "Group do not exist"
            })
            return null;
        }
        if (getUser.length <= 0) {
            res.status(400).send({
                ...StatusCodes.NotProccessed,
                errorMessage: "User do not exist"
            })
            return null;
        }
        const { host } = groupExist[0];
        const { phone } = getUser[0]
        await connection.query(`INSERT INTO group_request_notifications (user_id, group_id, user_phone, receiver_id) VALUES (?, ?, ?, ?)`, [userid, id, phone, host]);
        console.log(phone)

        res.status(200).send({
            ...StatusCodes.Success,
            message: "Request sent successfully"
        });

    } catch (error) {
        console.log(error)
        res.status(500).send({
            ...StatusCodes.ServerError,
            errorMessage: "An error occurred while fetching group data"
        });
    }
});
router.delete("/member/request/:userid/:id", async function (req, res, next) {
    if (!req.header("Authorization")) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Token not present"
        });
        return;
    }

    let Bearer = req.header("Authorization");
    const token = await HeaderToken(Bearer);
    let isValid = await VerifyToken(token);

    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Authentication error"
        });
        return;
    }

    const { id, userid } = req.params;

    try {
        // Get total count of all groups (without pagination)

        await connection.query(`DELETE FROM group_request_notifications WHERE id = ?`, [id]);

        res.status(200).send({
            ...StatusCodes.Success,
            message: "Request Declined successfully"
        });

    } catch (error) {
        console.log(error)
        res.status(500).send({
            ...StatusCodes.ServerError,
            errorMessage: "An error occurred while fetching group data"
        });
    }
});

router.get("/member/request/:userid", async function (req, res, next) {
    if (!req.header("Authorization")) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Token not present"
        });
        return;
    }

    let Bearer = req.header("Authorization");
    const token = await HeaderToken(Bearer);
    let isValid = await VerifyToken(token);

    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Authentication error"
        });
        return;
    }

    const { userid } = req.params;

    try {
        // Get total count of all groups (without pagination)

        const getUser = await connection.query("SELECT * FROM users WHERE user_id = ?", [userid])

        if (getUser.length <= 0) {
            res.status(400).send({
                ...StatusCodes.NotProccessed,
                errorMessage: "User do not exist"
            })
            return null;
        }
        const getRequests = await connection.query(`SELECT users.user_id, users.first_name, users.last_name, groups.*, group_request_notifications.* FROM group_request_notifications JOIN users ON users.user_id = group_request_notifications.user_id JOIN groups ON group_request_notifications.group_id = groups.id WHERE group_request_notifications.receiver_id = ? AND group_request_notifications.status = '0'`, [userid]);
        res.status(200).send({
            ...StatusCodes.Success,
            payload: getRequests
        });

    } catch (error) {
        console.log(error)
        res.status(500).send({
            ...StatusCodes.ServerError,
            errorMessage: "An error occurred while fetching group data",
            payload: []
        });
    }
});

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
    // console.log("TOKEN", token)
    let isValid = await VerifyToken(token)
    // console.log("PACKET", isValid)
    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Authentication error"
        });
        return null
    }
    const { id } = req.params;
    const getGroup = await connection.query("SELECT group_txn.*, users.user_id, users.first_name, users.last_name FROM group_txn JOIN users ON users.user_id = group_txn.user_id WHERE group_id = ? AND MONTH(group_txn.created_at) = MONTH(CURRENT_DATE()) ORDER BY group_txn.status ASC", [id])

    res.status(200).send({
        ...StatusCodes.Success,
        payload: getGroup
    })



})

router.get("/payouts/:id", async function (req, res, next) {
    if (!req.header("Authorization")) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Token not present"
        });
        return null
    }
    let Bearer = req.header("Authorization");
    const token = await HeaderToken(Bearer);
    // console.log("TOKEN", token)
    let isValid = await VerifyToken(token)
    // console.log("PACKET", isValid)
    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Authentication error"
        });
        return null
    }
    const { id } = req.params;
    const getGroup = await connection.query("SELECT group_payouts.*, users.user_id, users.first_name, users.last_name FROM group_payouts JOIN users ON group_payouts.user_id = users.user_id  WHERE group_payouts.group_id = ?", [id])
    const getTotal = await connection.query(
        "SELECT IFNULL(SUM(amount), 0) as total FROM group_payouts WHERE group_id = ?",
        [id]
    );


    res.status(200).send({
        ...StatusCodes.Success,
        payload: getGroup,
        total: getTotal
    })



})

router.get("/payouts/user/:id", async function (req, res, next) {
    if (!req.header("Authorization")) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Token not present"
        });
        return null
    }
    let Bearer = req.header("Authorization");
    const token = await HeaderToken(Bearer);
    // console.log("TOKEN", token)
    let isValid = await VerifyToken(token)
    // console.log("PACKET", isValid)
    if (!isValid) {
        res.status(401).send({
            ...StatusCodes.AuthError,
            errorMessage: "Authentication error"
        });
        return null
    }
    const { id } = req.params;
    const getGroup = await connection.query("SELECT group_payouts.*, users.user_id, users.first_name, users.last_name FROM group_payouts JOIN users ON group_payouts.user_id = users.user_id  WHERE group_payouts.group_id = ?", [id])
    const getTotal = await connection.query(
        "SELECT IFNULL(SUM(amount), 0) as total FROM group_payouts WHERE user_id = ? AND status > 0",
        [id]
    );


    res.status(200).send({
        ...StatusCodes.Success,
        payload: getGroup,
        total: getTotal
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
    // console.log("TOKEN", token)
    let isValid = await VerifyToken(token)
    // console.log("PACKET", isValid)
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
        message: "Success"
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
    // console.log("TOKEN", token)
    let isValid = await VerifyToken(token)
    // console.log("PACKET", isValid)
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
    // console.log("TOKEN", token)
    let isValid = await VerifyToken(token)
    // console.log("PACKET", isValid)
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

    let parsedPhone;
    if (invited_userid.toString().length > 10) {
        parsedPhone = invited_userid.toString().slice(1)
    } else {
        parsedPhone = invited_userid.toString()
    }
    const getInvitedUser = await connection.query("SELECT * FROM users WHERE phone = ?", [parsedPhone])
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
    const invitedId = getInvitedUser[0].user_id;
    await connection.query("INSERT INTO group_members (host, user_id, group_id) VALUES (?, ?, ?)", [userid, invitedId, group_id]);
    await connection.query("DELETE FROM group_request_notifications WHERE user_phone = ? AND group_id = ?", [invited_userid, group_id])
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
    // console.log("TOKEN", token)
    let isValid = await VerifyToken(token)
    // console.log("PACKET", isValid)
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