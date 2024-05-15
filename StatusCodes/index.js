var date = new Date();
const StatusCodes = {
    NotFound: {
        code: 404,
        status: false,
        message: "Query returns no result",
        queryTime: date.toString()
    },
    Success: {
        code: 200,
        status: true,
        message: "Success",
        queryTime: date.toString()
    },
    ServerError: {
        code: 505,
        status: false,
        message: "Internal Server Error",
        queryTime: date.toString()
    },
    QueryError: {
        code: 203,
        status: false,
        message: "DB Query Error.",
        queryTime: date.toString()
    },
    MissingPayload: {
        code: 400,
        status: false,
        message: "A required field is missing",
        queryTime: date.toString()
    },
    OTPAccountSuspended: {
        code: 402,
        status: false,
        message: "Your account has been suspended. for entering wrong OTP more than three times. Please contact admin via +234 913 540 3118."
    },
    AuthError: {
        code: 401,
        status: false,
        message: "Authentication Error",
        queryTime: date.toString()
    },
    NotVerified: {
        code: 401,
        status: false,
        message: "User phone not verified",
        queryTime: date.toString()
    },
    ClientError: {
        code: 406,
        status: false,
        message: "Client specified in header do not exist",
        queryTime: date.toString()
    },
    ClientMissing: {
        code: 405,
        status: false,
        message: "Please specify a client in the headers",
        queryTime: date.toString()
    },
    NodeMissing: {
        code: 400,
        status: false,
        message: "Node is missing",
        queryTime: date.toString()
    },
    MissingAPIKey: {
        code: 401,
        status: false,
        message: "api_key is missing in headers",
        queryTime: date.toString()
    },
    InvalidAPIKey: {
        code: 401,
        status: false,
        message: "invalid api_key in headers",
        queryTime: date.toString()
    },
    IncorrectAPIKey: {
        code: 401,
        status: false,
        message: "api_key is not valid",
        queryTime: date.toString()
    },
    NotProccessed: {
        code: 500,
        status: false,
        message: "Could not process request",
        queryTime: date.toString()
    },
    Processing: {
        code: 202,
        status: true,
        message: "Request is processing",
        queryTime: date.toString()
    },
    DataAlreadyInDB: {
        code: 409,
        status: true,
        message: "Data already exists in database",
        queryTime: date.toString()
    }
}
module.exports = StatusCodes;