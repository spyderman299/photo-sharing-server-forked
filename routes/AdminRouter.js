const express = require("express");
const User = require("../db/userModel");
const { signToken, getUserFromRequest } = require("../lib/auth");

const router = express.Router();

// POST /admin/login
// Body: { login_name, password }
// Validates the account, then returns the info the app needs + a JWT token.
router.post("/login", async (request, response) => {
  const { login_name, password } = request.body;

  if (!login_name) {
    return response.status(400).send("login_name is required.");
  }

  try {
    const user = await User.findOne({ login_name });
    if (!user) {
      return response.status(400).send("No such user: invalid login name.");
    }

    // Password check (Problem 4). If the account has a password set, it must match.
    if (user.password && user.password !== password) {
      return response.status(400).send("Incorrect password.");
    }

    const token = signToken(user);
    // Returning only what the app needs (NOT the whole user / password).
    return response.status(200).json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      login_name: user.login_name,
      token,
    });
  } catch (error) {
    return response.status(400).send("Login failed.");
  }
});

// POST /admin/logout
// With token-based auth, logout is mostly client-side (the client drops the
// token). The server simply confirms there was a logged-in user, and returns
// 400 if there was not.
router.post("/logout", (request, response) => {
  const user = getUserFromRequest(request);
  if (!user) {
    return response.status(400).send("No user is currently logged in.");
  }
  return response.status(200).send({ message: "Logged out." });
});

module.exports = router;

