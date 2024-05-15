const fetch = require("node-fetch");
const sendSMSTermii = async (phone, text) => {
    console.log("hello")
    let res;
    const payload = {
        to: phone,
        sms: text,
        from: 'N-Alert',
        type: "plain",
        api_key: "TL04H9lLSyKf0ssxODq6EyJdlqnq0Yt9CuazbjvVF9aoJt2oaYuQfqD755HXpF",
        channel: "dnd"
    }

    await fetch("https://api.ng.termii.com/api/sms/send", {
        method: "POST",
        headers: {
            "Accept": "application/json,text/plain,*/*",
            "Content-Type": "application/json",
            apiKey: "5acc3250e2a1b9c65164ccc1a787aa99cc27674acb2ebb81b8054ff23e254c05",
        },
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(data => {
            console.log("DATE", data)
            res = data
        }).catch(error => {
            res = {}
        })

    return res;
}

module.exports = sendSMSTermii;