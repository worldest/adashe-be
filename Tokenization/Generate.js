let randtoken = require('rand-token');


async function generateToken() {
    let token = await randtoken.generate(32);
    return "X-" + token;
}
module.exports = generateToken;