const Cryptr = require('cryptr');
const cryptr = new Cryptr('plazar_tokenization101');
//myTotallySecretKey
//PlazarAdmin#101
exports.Encrypt = async function (data) {
    const encryptedString = await cryptr.encrypt(data);
    return encryptedString;
}

exports.Decrypt = async function (data) {
    const decryptedString = await cryptr.decrypt(data);
    return decryptedString;
}