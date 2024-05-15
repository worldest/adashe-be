const FormData = require("form-data");
const fetch = require("node-fetch");

function Log(host, signer, endpoint, data) {
    const formData = new FormData();
    formData.append("signer", signer);
    formData.append("host", host);
    formData.append("endpoint", endpoint);
    formData.append("data", data);
    fetch("https://Plazar.com/server/Log/log.php", {
        method: "POST",
        body: formData
    })
        .then(res => res.text())
        .then(data => {
            console.log(data)
        })
}

module.exports = Log;