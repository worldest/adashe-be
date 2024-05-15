const { default: fetch } = require("node-fetch");
const { ClubKonnect_Api_Key, ClubKonnect_User_ID } = require("../../Constants");

async function electricityBillPayment(electric_company_code, meter_type, meter_no, amount, recipient_phone) {
    let status;
    await fetch(`https://www.nellobytesystems.com/APIElectricityV1.asp?UserID=${ClubKonnect_User_ID}&APIKey=${ClubKonnect_Api_Key}&ElectricCompany=${electric_company_code}&MeterType=${meter_type}&MeterNo=${meter_no}&Amount=${amount}&PhoneNo=${recipient_phone}&CallBackURL=http://www.Plazar.com`)
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

async function queryTransaction(order_id) {
    let status;
    await fetch(`https://www.nellobytesystems.com/APIQueryV1.0.asp?UserID=${ClubKonnect_User_ID}&APIKey=${ClubKonnect_Api_Key}&OrderID=${order_id}`)
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

async function verifyMeterNumber(electric_company_code, meter_no) {
    let status;
    await fetch(`https://www.nellobytesystems.com/APIVerifyElectricityV1.asp?UserID=${ClubKonnect_User_ID}&APIKey=${ClubKonnect_Api_Key}&ElectricCompany=${electric_company_code}&MeterNo=${meter_no}`)
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

async function getCompanyCodes() {
    const code_list = [
        {
            "code": "01",
            "description": "Eko Electric - EKEDC"
        },
        {
            "code": "02",
            "description": "Ikeja Electric - IKEDC"
        },
        {
            "code": "03",
            "description": "Abuja Electric - AEDC"
        },
        {
            "code": "04",
            "description": "Kano Electric - KEDC"
        },
        {
            "code": "05",
            "description": "Porthacourt Electric - PHEDC"
        },
        {
            "code": "06",
            "description": "Jos Electric - JEDC"
        },
        {
            "code": "07",
            "description": "Ibadan Electric - IBEDC"
        },
        {
            "code": "08",
            "description": "Kaduna Elecdtric - KAEDC"
        },
        {
            "code": "09",
            "description": "Enugu Electric - EEDC"
        },
        {
            "code": "10",
            "description": "Benin Electric - BEDC"
        },
    ]

    return code_list;
}

async function getMeterCodes() {
    let code_list = [
        {
            "code": "01",
            "description": "Prepaid",
        },
        {
            "code": "02",
            "description": "Postpaid"
        }
    ]

    return code_list;
}

module.exports = { electricityBillPayment, queryTransaction, verifyMeterNumber, getCompanyCodes, getMeterCodes };