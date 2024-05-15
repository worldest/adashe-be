const { default: fetch } = require('node-fetch');

async function SendMoney() {


}

async function CreateVirtualAccount(requestId, collection_Acct, productId, appKey) {

    let res;
    const payload = {
        "requestId": requestId,
        "collection_Acct": collection_Acct,
        "transaction_Notification_URL": "URL",
        "name_inquiry_URL": "URL",
        "account_Creation_URL": "URL",
        "productId": productId,
        "appKey": appKey
    }

    await fetch("https://devapi.fcmb.com/ClientVirtualAcct/VirtualAccounts/v1/clientRegistration", {
        headers: {
            "client_id": "250",
            "product_id": "FCMBch3r7deevwbk",
            "x-token": "ec78bf760d98d9a611b8c6902858ed35da430d3dd7e6b849c729e0148949be3ea7378f0965f0885cf824f81306ad77801b3cd143396fe00bca55f7e0ac03b915",
            "UTCTimestamp": "2023-11-02T08:03:46.513",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "Ocp-Apim-Subscription-Key": "b49f0d5981794ae09702de779c8507cf"
        },
        method: "POST",
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(data => {
            res = data;
        })
    return res

}

async function PaymentWebhook() {


}

async function ValidateBVN(bvn) {

    let res;

    await fetch(`https://devapi.fcmb.com/bvnValidation/api/CustomerInquiry/bvnvalidation?bvn=${bvn}`, {
        headers: {
            "client_id": "250",
            "product_id": "FCMBch3r7deevwbk",
            "x-token": "ec78bf760d98d9a611b8c6902858ed35da430d3dd7e6b849c729e0148949be3ea7378f0965f0885cf824f81306ad77801b3cd143396fe00bca55f7e0ac03b915",
            "UTCTimestamp": "2023-11-02T08:03:46.513",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "Ocp-Apim-Subscription-Key": "b49f0d5981794ae09702de779c8507cf"
        },
        method: "GET",
    })
        .then(response => response.json())
        .then(data => {
            res = data;
        })
    return res

}

async function VerifyBVN(bvn, firstName, lastName, middleName, phoneNumber, dob, productId, requestId) {

    let res;
    const payload = {
        "bvn": bvn,
        "firstName": firstName,
        "lastName": lastName,
        "middleName": middleName,
        "phoneNumber": phoneNumber,
        "dob": dob,
        "productId": productId,
        "requestId": requestId
    }

    await fetch("https://devapi.fcmb.com/custvalidation/api/BvnVerification/ClientBVNVerification", {
        headers: {
            "client_id": "250",
            "product_id": "FCMBch3r7deevwbk",
            "x-token": "ec78bf760d98d9a611b8c6902858ed35da430d3dd7e6b849c729e0148949be3ea7378f0965f0885cf824f81306ad77801b3cd143396fe00bca55f7e0ac03b915",
            "UTCTimestamp": "2023-11-02T08:03:46.513",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "Ocp-Apim-Subscription-Key": "b49f0d5981794ae09702de779c8507cf"
        },
        method: "POST",
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(data => {
            res = data;
        })
    return res

}

async function ValidateBankAccount() {


}

async function GetAllBanks() {

    let res;

    await fetch(`https://devapi.fcmb.com/interbnktransfer/api/ActiveBanks/GetAllActiveBanks`, {
        headers: {
            "client_id": "250",
            "product_id": "FCMBch3r7deevwbk",
            "x-token": "ec78bf760d98d9a611b8c6902858ed35da430d3dd7e6b849c729e0148949be3ea7378f0965f0885cf824f81306ad77801b3cd143396fe00bca55f7e0ac03b915",
            "UTCTimestamp": "2023-11-02T08:03:46.513",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "Ocp-Apim-Subscription-Key": "b49f0d5981794ae09702de779c8507cf"
        },
        method: "GET",
    })
        .then(response => response.json())
        .then(data => {
            res = data;
        })
    return res

}

module.exports = { SendMoney, CreateVirtualAccount, PaymentWebhook, ValidateBVN, VerifyBVN, ValidateBankAccount, GetAllBanks };