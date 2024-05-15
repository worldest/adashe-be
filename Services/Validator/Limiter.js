const setRateLimit = require("express-rate-limit");
const StatusCodes = require("../../StatusCodes");

// Rate limit middleware
const rateLimitMiddleware = setRateLimit({
  windowMs: 10 * 1000,
  max: 1,
  message: {
    ...StatusCodes.NotProccessed,
    errorMessage: "You still have a pending transaction, try again later"
  },
  headers: true,
});

module.exports = rateLimitMiddleware;