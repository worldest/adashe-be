const util = require("util")
let store = require('store')
const sleep = ms => new Promise(r => setTimeout(r, ms));
let token_ = 0;
const connection = require("../DB/dbConnect");
connection.query = util.promisify(connection.query).bind(connection);

exports.VerifyToken = async function (token) {
    const results = await connection.query(`SELECT * FROM users WHERE token=?`, [token]);

    if (results.length > 0) {
        return true
    } else {
        return false
    }
}

exports.VerifyOTP = async function (userid, otp) {
    const results = await connection.query(`SELECT * FROM auth_code WHERE user_id=? AND auth_code=? AND status='0'`, [userid, otp]);
    console.log(results.length)
    if (results.length > 0) {
        await connection.query(`UPDATE auth_code SET status='1' WHERE user_id=? AND auth_code=?`, [userid, otp]);
        return true
    } else {
        return false
    }
} 