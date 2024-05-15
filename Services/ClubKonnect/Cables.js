const { default: fetch } = require("node-fetch");
const { ClubKonnect_Api_Key, ClubKonnect_User_ID } = require("../../Constants");

async function VerifyCableNumber(smartcard_number, scheme_code, decoder_type) {
    let status;
    console.log(`https://www.nellobytesystems.com/APIVerifyCableTVV1.0.asp?UserID=${ClubKonnect_User_ID}&APIKey=${ClubKonnect_Api_Key}&cabletv=${scheme_code}&smartcardno=${smartcard_number}`)
    await fetch(`https://mobilefoot.ng/api/v1/validate_cable?decoder_type=${decoder_type}&iuc_card_number=${smartcard_number}`, {
        headers: {
            "Authorization": "Bearer 3b89333078629b80ba5f4bb671caaede"
        }
    })
        .then(responseJSON => responseJSON.json())
        .then(async data => {
            console.log(data)
            status = data;
        })
        .catch(error => {
            status = {
                status: false
            }
        })
    return status;
}
async function getPackages(scheme) {
    let res = [];
    await fetch(`https://www.nellobytesystems.com/APICableTVPackagesV2.asp`)
        .then(responseJSON => responseJSON.json())
        .then(async data => {
            // let filter = data.filter()

            res = data.TV_ID[scheme][0].PRODUCT;

            // res = data
        })
        .catch(error => {
            res = {
                status: false
            }
        })
    return res;
}

async function rechargeSmartCard(smartcard, phone, scheme_name, package) {
    console.log("SCHEME_NAME", scheme_name)
    let status;
    await fetch(`https://www.nellobytesystems.com/APICableTVV1.asp?UserID=${ClubKonnect_User_ID}&APIKey=${ClubKonnect_Api_Key}&CableTV=${scheme_name.toLowerCase()}&Package=${package}&SmartCardNo=${smartcard}&PhoneNo=${phone}&CallBackURL=http://www.Plazar.com`)
        .then(responseJSON => responseJSON.json())
        .then(async data => {
            console.log(data)
            status = data.status;
        })
        .catch(error => {
            status = {
                status: false
            }
        })
    return status;
}
module.exports = { getPackages, VerifyCableNumber, rechargeSmartCard }