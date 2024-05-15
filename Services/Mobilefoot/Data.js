const { default: fetch } = require("node-fetch");
const { ClubKonnect_Api_Key, ClubKonnect_User_ID } = require("../../Constants");

async function loadData(phone, bundle_size, network_code) {
    let status;
    let body = {
        "network_id": network_code,
        "phone": phone,
        "plan_id": bundle_size
    }
    await fetch(`https://mobilefoot.ng/api/v1/data`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer 3b89333078629b80ba5f4bb671caaede"
        },
        method: "POST",
        body: JSON.stringify(body)
    })
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

module.exports = { loadData }