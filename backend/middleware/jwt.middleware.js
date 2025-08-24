const jwt = require("jsonwebtoken");
var response = require("../response");

module.exports.jwtauth = function (req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return response.unauthorized_error_message(
      { message: "Token Not Found" },
      res
    );
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return response.unauthorized_error_message(
        { message: "JWT Error: " + err.message },
        res
      );
    }

    req.user = decoded;
    next();
  });
};
