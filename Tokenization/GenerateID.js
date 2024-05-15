let randtoken = require('rand-token');


async function generateID() {
    let token = await randtoken.generate(32);
    return token;
}
module.exports = generateID;