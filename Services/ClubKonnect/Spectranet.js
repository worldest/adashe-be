const { default: fetch } = require("node-fetch");
const { ClubKonnect_Api_Key, ClubKonnect_User_ID } = require("../../Constants");

async function buySpectranetData(dataPlan_Code, Spectranet_Phonenumber) {
    let status;
    await fetch(`https://www.nellobytesystems.com/APISpectranetV1.asp?UserID=${ClubKonnect_User_ID}&APIKey=${ClubKonnect_Api_Key}&MobileNetwork=spectranet&DataPlan=${dataPlan_Code}&MobileNumber=${Spectranet_Phonenumber}&CallBackURL=http://www.Plazar.com`)
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

async function specQueryTransacton(order_id) {
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

async function getSpecDataPlans() {
    let status;
    await fetch(`https://www.nellobytesystems.com/APISpectranetPackagesV2.asp`)
        .then(responseJSON => responseJSON.json())
        .then(async data => {
            status = data;
        })
        .catch(error => {
            status = {
                spectranet_dataplans: {
                    MOBILE_NETWORK: {
                        spectranet:
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

module.exports = { buySpectranetData, specQueryTransacton, getSpecDataPlans };