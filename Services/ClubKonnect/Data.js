const { default: fetch } = require("node-fetch");
const { ClubKonnect_Api_Key, ClubKonnect_User_ID } = require("../../Constants");

async function loadData(phone, bundle_size, network_code) {
    let status;
    await fetch(`https://www.nellobytesystems.com/APIDatabundleV1.asp?UserID=${ClubKonnect_User_ID}&APIKey=${ClubKonnect_Api_Key}&MobileNetwork=${network_code}&DataPlan=${bundle_size}&MobileNumber=${phone}&CallBackURL=http://www.Plazar.com`)
        .then(responseJSON => responseJSON.json())
        .then(async data => {
            status = data.status;
        })
        .catch(error => {
            status = {
                status: false
            }
        })
    return status;
}

async function getBundleSizes(scheme) {
    let res = [];
    await fetch(`https://www.nellobytesystems.com/APIDatabundlePlansV2.asp?UserID=CK100396333`)
        .then(responseJSON => responseJSON.json())
        .then(async data => {
            // let filter = data.filter()

            res = data.MOBILE_NETWORK[scheme][0].PRODUCT;
            // console.log("BUNDLES", res)
            // res = data
        })
        .catch(error => {
            res = {
                status: false
            }
        })
    return res;
}

module.exports = { loadData, getBundleSizes }