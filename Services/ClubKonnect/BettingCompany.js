const { default: fetch } = require("node-fetch");
const { ClubKonnect_Api_Key, ClubKonnect_User_ID } = require("../../Constants");
//{"PRODUCT_CODE":"sportybet"} ,
const bettingCompanies = [
    { "PRODUCT_CODE": "naijabet" },
    { "PRODUCT_CODE": "nairabet" },
    { "PRODUCT_CODE": "bet9ja-agent" },
    { "PRODUCT_CODE": "betland" },
    { "PRODUCT_CODE": "betlion" },
    { "PRODUCT_CODE": "supabet" },
    { "PRODUCT_CODE": "bet9ja" },
    { "PRODUCT_CODE": "bangbet" },
    { "PRODUCT_CODE": "betking" },
    { "PRODUCT_CODE": "1xbet" },
    { "PRODUCT_CODE": "betway" },
    { "PRODUCT_CODE": "merrybet" }
]

async function verifyBettingUserID(provider, userid) {
    let status;
    await fetch(`https://www.nellobytesystems.com/APIVerifyBettingV1.asp?UserID=${ClubKonnect_User_ID}&APIKey=${ClubKonnect_Api_Key}&BettingCompany=${provider}&CustomerID=${userid}`)
        .then(responseJSON => responseJSON.json())
        .then(async data => {
            status = data;
        })
        .catch(error => {
            status = {
                status: false
            }
        })
    return status;
}

async function fundBettingWallet(provider, accountid, amount, userid) {
    let status;
    await fetch(`https://www.nellobytesystems.com/APIBettingV1.asp?UserID=${ClubKonnect_User_ID}&APIKey=${ClubKonnect_Api_Key}&BettingCompany=${provider}&CustomerID=${accountid}&Amount=${amount}&RequestID=${userid}&CallBackURL=https://Plazar.com`)
        .then(responseJSON => responseJSON.json())
        .then(async data => {
            status = data;
        })
        .catch(error => {
            status = {
                status: false
            }
        })
    return status;
}
module.exports = { bettingCompanies, verifyBettingUserID, fundBettingWallet }