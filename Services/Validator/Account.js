const connection = require("../../DB/dbConnect");
const util = require("util");
let today = new Date();
let d = ("0" + today.getDate()).slice(-2)
let m = ("0" + (today.getMonth() + 1)).slice(-2)
let y = today.getFullYear();
let date = `${y}-${m}-${d}`
connection.query = util.promisify(connection.query).bind(connection);


async function getAccountLimit(user_id, amount) {
    const kyc = await connection.query(`SELECT * FROM kyc WHERE user_id=?`, [user_id]);
    const tier = parseInt(kyc[0].level);
    let daily, limit;
    if (tier == 0) {
        daily = 0;
        limit = 0;
    } else if (tier == 1) {
        daily = 50000;
        limit = 300000;
    } else if (tier == 2) {
        daily = 500000;
        limit = 2000000;
    } else if (tier == 3) {
        daily = 5000000;
        limit = 1000000000;
    }
    let response = {
        isPassAccountLimit: false,
        isPassDailyLimit: false,
        currentDailyVolume: 0,
        currentAccountVolume: 0
    }
    const wallet = await connection.query(`SELECT * FROM wallets WHERE user_id=?`, [user_id]);
    let { balance } = wallet[0];
    if (parseFloat(balance) + parseFloat(amount) > limit) {
        response.isPassAccountLimit = true;
        response.currentAccountVolume = parseFloat(balance) + parseFloat(amount)
    }
    const tnxs = await connection.query(`SELECT SUM(amount) as total FROM transactions WHERE user_id=? AND txn_date=? AND transaction_type='debit'`, [user_id, date]);
    const total_ = tnxs[0].total;
    const total = total_ === null ? 0 : total_;
    console.log(total_)
    console.log(total)
    console.log(parseFloat(total) + parseFloat(amount))
    console.log(tier)
    if (parseFloat(total) + parseFloat(amount) > daily) {
        response.isPassDailyLimit = true;
        response.currentDailyVolume = parseFloat(total) + parseFloat(amount)
    }
    return response
}

module.exports = getAccountLimit;