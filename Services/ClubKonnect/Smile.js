const { default: fetch } = require("node-fetch");
const { ClubKonnect_Api_Key, ClubKonnect_User_ID } = require("../../Constants");

async function buySmileDataBundle(dataPlan_Code, Smile_Phonenumber) {
    let status;
    await fetch(`https://www.nellobytesystems.com/APISmileV1.asp?UserID=${ClubKonnect_User_ID}&APIKey=${ClubKonnect_Api_Key}&MobileNetwork=smile-direct&DataPlan=${dataPlan_Code}&MobileNumber=${Smile_Phonenumber}&CallBackURL=http://www.Plazar.com`)
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

async function smileQueryTransaction(order_id) {
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

async function verifySmilePhoneNumber(Smile_Phonenumber) {
    let status;
    await fetch(`https://www.nellobytesystems.com/APIVerifySmileV1.asp??UserID=${ClubKonnect_User_ID}&APIKey=${ClubKonnect_Api_Key}&MobileNetwork=smile-direct&MobileNumber=${Smile_Phonenumber}`)
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

async function getSmileDataPlans() {
    let status;
    await fetch(`https://www.nellobytesystems.com/APISmilePackagesV2.asp`)
        .then(responseJSON => responseJSON.json())
        .then(async data => {
            status = data;
        })
        .catch(error => {
            status = {
                smile_dataplans: {
                    MOBILE_NETWORK: {
                        'smile-direct':
                            [
                                {
                                    PRODUCT: []
                                }

                            ]
                    }
                }
            }
        })
    return status;
}

module.exports = { buySmileDataBundle, smileQueryTransaction, verifySmilePhoneNumber, getSmileDataPlans };