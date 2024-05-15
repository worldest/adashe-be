const { default: fetch } = require("node-fetch");
const { ClubKonnect_Api_Key, ClubKonnect_User_ID } = require("../../Constants");

async function loadAirtime(phone, amount, network_code) {
    let status;
    await fetch(`https://www.nellobytesystems.com/APIAirtimeV1.asp?UserID=${ClubKonnect_User_ID}&APIKey=${ClubKonnect_Api_Key}&MobileNetwork=${network_code}&Amount=${amount}&MobileNumber=${phone}&CallBackURL=http://www.Plazar.com`)
        .then(responseJSON => responseJSON.json())
        .then(async data => {
            status = data.status;
            console.log("DATA", data)
        })
    return status;
}

module.exports = { loadAirtime }