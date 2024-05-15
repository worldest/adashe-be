const { loadAirtime } = require("./Airtime");
const { loadData } = require("./Data");

const ClubKonnect = {
    Bills: {
        Airtime: loadAirtime,
        Data: loadData
    }
}

module.exports = {ClubKonnect}