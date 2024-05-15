const { default: fetch } = require("node-fetch");
const { ClubKonnect_Api_Key, ClubKonnect_User_ID } = require("../../Constants");

async function buyJambPin(exam_code, recipient_phoneno) {
    let status;
    await fetch(`https://www.nellobytesystems.com/APIJAMBV1.asp?UserID=${ClubKonnect_User_ID}&APIKey=${ClubKonnect_Api_Key}&ExamType=${exam_code}&PhoneNo=${recipient_phoneno}&CallBackURL=http://www.Plazar.com`)
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

async function queryJambTransaction(order_id) {
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

async function verifyProfileId(profile_id) {
    let status;
    await fetch(`https://www.nellobytesystems.com/APIVerifyJAMBV1.asp?UserID=${ClubKonnect_User_ID}&APIKey=${ClubKonnect_Api_Key}&ExamType=jamb&ProfileID=${profile_id}`)
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

async function getJambExamTypes() {
    let status;
    await fetch(`https://www.nellobytesystems.com/APIJAMBPackagesV2.asp`)
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

module.exports = { buyJambPin, queryJambTransaction, verifyProfileId, getJambExamTypes };