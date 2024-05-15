
const { phone } = require('phone');


const EmailValidator = async (args) => {
    const emailRegexp = new RegExp(
        /^[a-zA-Z0-9][\-_\.\+\!\#\$\%\&\'\*\/\=\?\^\`\{\|]{0,1}([a-zA-Z0-9][\-_\.\+\!\#\$\%\&\'\*\/\=\?\^\`\{\|]{0,1})*[a-zA-Z0-9]@[a-zA-Z0-9][-\.]{0,1}([a-zA-Z][-\.]{0,1})*[a-zA-Z0-9]\.[a-zA-Z0-9]{1,}([\.\-]{0,1}[a-zA-Z]){0,}[a-zA-Z0-9]{0,}$/i
    )
    let res = {
        validators: {
            regex: {
                valid: emailRegexp.test(args)
            }
        }
    }
    return res
}

const phoneValidator = (args) => {
    const isPhone = phone(args);
    return isPhone;
}

const userInputValid = (args) => {
    const onlyLettersPattern = /^[A-Za-z0-9-]+$/;
    if (!args.match(onlyLettersPattern)) {
        return false
    } else {
        return true
    }
}

const validator = {
    Email: EmailValidator,
    phone: phoneValidator,
    isInputValid: userInputValid
}

module.exports = validator;