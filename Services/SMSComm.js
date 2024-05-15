const fetch = require("node-fetch");
const sendSMS = async (phone, text) => {
    let res;
    const payload = {
        to: phone,
        message: "Plazar: " + text,
        sender_name: 'Plazar',
        route: 'dnd'
    }

    await fetch("https://api.sendchamp.com/api/v1/sms/send", {
        method: "POST",
        headers: {
            "Accept": "application/json,text/plain,*/*",
            "Content-Type": "application/json",
            "Authorization": "Bearer sendchamp_live_$2a$10$grlCsw1wL2ejk31pibNmvOz/u1jrqAgFNZFBGAFGAs9yrd7F87GLy"
        },
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(data => {

            res = data
        }).catch(error => {
            res = {}
        })

    return res;
}

module.exports = sendSMS;