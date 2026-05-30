const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const EXPIRES_IN = "7d";

// Create a signed token for a logged-in user.
function signToken(user) {
  return jwt.sign(
    {
      _id: user._id.toString(),
      login_name: user.login_name,
      first_name: user.first_name,
    },
    SECRET,
    { expiresIn: EXPIRES_IN }
  );
}

// Pull "Bearer <token>" out of the Authorization header and verify it.
// Returns the decoded payload, or null if there is no valid token.
function getUserFromRequest(request) {
  const header = request.headers.authorization || "";
  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }
  try {
    return jwt.verify(parts[1], SECRET);
  } catch (error) {
    return null;
  }
}

// Express middleware: blocks the request with 401 if no user is logged in.
// On success it attaches the decoded user to request.user.
function requireLogin(request, response, next) {
  const user = getUserFromRequest(request);
  if (!user) {
    return response.status(401).send("Unauthorized: please log in first.");
  }
  request.user = user;
  return next();
}

module.exports = { signToken, getUserFromRequest, requireLogin };
