const { default: fetch } = require("node-fetch");
const { ClubKonnect_Api_Key, ClubKonnect_User_ID } = require("../../Constants");

async function buyWaecPin() {
    let status;
    await fetch(`https://www.nellobytesystems.com/APIWAECV1.asp?UserID=${ClubKonnect_User_ID}&APIKey=${ClubKonnect_Api_Key}&ExamType=${exam_code}&PhoneNo=${recipient_phoneno}&CallBackURL=http://www.Plazar.com`)
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

async function queryWaecTransaction(order_id) {
    let status;
    await fetch(`https://www.nellobytesystems.com/APIQueryV1.asp?UserID=${ClubKonnect_User_ID}&APIKey=${ClubKonnect_Api_Key}&OrderID=${order_id}`)
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

async function getWaecExamTypes() {
    let status;
    await fetch(`https://www.nellobytesystems.com/APIWAECPackagesV2.asp`)
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

module.exports = { buyWaecPin, queryWaecTransaction, getWaecExamTypes };