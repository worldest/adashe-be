async function HeaderToken(authorization) {
    let payloadToken = authorization.split('Bearer ')[1];
    return payloadToken;
}

module.exports = HeaderToken