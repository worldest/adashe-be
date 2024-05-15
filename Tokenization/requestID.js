let randtoken = require('rand-token');


async function requestID() {
    let token = await randtoken.generate(14);
    return "X-" + token;
}
module.exports = requestID;